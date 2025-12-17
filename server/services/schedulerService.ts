import { storage } from '../storage';
import { getQueueWorker } from '../queueWorker';
import { getSyncService } from './syncService';
import type { ScheduledTask, InsertCopyOperation } from '@shared/schema';

interface SchedulerConfig {
  pollInterval: number;
  schedulerId: string;
}

export class SchedulerService {
  private config: SchedulerConfig;
  private isRunning = false;
  private pollTimeout: NodeJS.Timeout | null = null;

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = {
      pollInterval: config.pollInterval || 60000,
      schedulerId: config.schedulerId || `scheduler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Scheduler service is already running');
      return;
    }

    this.isRunning = true;
    console.log(`📅 Scheduler service started with ID: ${this.config.schedulerId}`);
    console.log(`⏰ Poll interval: ${this.config.pollInterval / 1000} seconds`);

    this.scheduleLoop();
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping scheduler service...');
    this.isRunning = false;
    
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }
    
    console.log('✅ Scheduler service stopped');
  }

  private async scheduleLoop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.processScheduledTasks();
    } catch (error) {
      console.error('❌ Error in scheduler loop:', error);
    }

    this.pollTimeout = setTimeout(() => this.scheduleLoop(), this.config.pollInterval);
  }

  private async processScheduledTasks(): Promise<void> {
    try {
      const tasksDue = await storage.getTasksDueForExecution();
      
      if (tasksDue.length === 0) {
        return;
      }

      console.log(`📋 Found ${tasksDue.length} scheduled tasks due for execution`);

      for (const task of tasksDue) {
        await this.executeScheduledTask(task);
      }
    } catch (error) {
      console.error('❌ Error processing scheduled tasks:', error);
    }
  }

  private async executeScheduledTask(task: ScheduledTask): Promise<void> {
    console.log(`🚀 Executing scheduled task: ${task.name} (${task.id})`);

    const startTime = new Date();

    try {
      const taskRun = await storage.createScheduledTaskRun({
        scheduledTaskId: task.id,
        status: 'running',
        startedAt: startTime,
        filesProcessed: 0,
        filesFailed: 0,
        bytesTransferred: 0,
      });

      const nextRunAt = this.calculateNextRun(task);

      await storage.updateScheduledTask(task.id, {
        lastRunAt: startTime,
        lastRunStatus: 'running',
        nextRunAt,
        totalRuns: (task.totalRuns || 0) + 1,
      });

      // Check if this is a cumulative sync task
      if (task.syncMode === 'cumulative_sync') {
        await this.executeCumulativeSyncTask(task, taskRun.id, startTime);
        return;
      }

      // Standard copy/transfer operation
      const isTransfer = task.sourceProvider !== task.destProvider;
      const operationType = task.operationType || (isTransfer ? 'transfer' : 'copy');
      
      const copyOperation: InsertCopyOperation = {
        userId: task.userId,
        sourceUrl: task.sourceUrl,
        sourceProvider: task.sourceProvider,
        destinationFolderId: task.destinationFolderId,
        destProvider: task.destProvider,
        status: 'pending',
        fileName: task.sourceName || (isTransfer ? 'Scheduled Transfer' : 'Scheduled Copy'),
      };

      const operation = await storage.createCopyOperation(copyOperation);

      await storage.updateTaskRun(taskRun.id, {
        copyOperationId: operation.id,
      });

      const opLabel = isTransfer ? '🔄 transfer' : '📋 copy';
      console.log(`✅ Created ${opLabel} operation ${operation.id} for scheduled task ${task.id}`);
      console.log(`📅 Next run scheduled for: ${nextRunAt?.toISOString()}`);

      this.monitorTaskCompletion(task.id, taskRun.id, operation.id, startTime);

    } catch (error: any) {
      console.error(`❌ Failed to execute scheduled task ${task.id}:`, error);

      const nextRunAt = this.calculateNextRun(task);

      await storage.updateScheduledTask(task.id, {
        lastRunAt: startTime,
        lastRunStatus: 'failed',
        lastRunError: error.message || 'Unknown error',
        nextRunAt,
        totalRuns: (task.totalRuns || 0) + 1,
        failedRuns: (task.failedRuns || 0) + 1,
      });
    }
  }

  private async executeCumulativeSyncTask(
    task: ScheduledTask,
    taskRunId: string,
    startTime: Date
  ): Promise<void> {
    console.log(`🔄 Executing cumulative sync for task: ${task.name}`);

    try {
      const syncService = getSyncService(task.userId);
      const result = await syncService.executeCumulativeSync(task);

      const completedAt = new Date();
      const duration = Math.floor((completedAt.getTime() - startTime.getTime()) / 1000);

      await storage.updateTaskRun(taskRunId, {
        status: result.success ? 'completed' : 'failed',
        completedAt,
        duration,
        filesProcessed: result.filesCopied,
        filesFailed: result.filesFailed,
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
      });

      if (result.success) {
        await storage.updateScheduledTask(task.id, {
          lastRunStatus: 'success',
          lastRunError: null,
          successfulRuns: (task.successfulRuns || 0) + 1,
        });
        console.log(`✅ Cumulative sync completed: ${result.filesCopied} files copied, ${result.filesSkipped} skipped`);
      } else {
        await storage.updateScheduledTask(task.id, {
          lastRunStatus: 'failed',
          lastRunError: result.errors.join('; '),
          failedRuns: (task.failedRuns || 0) + 1,
        });
        console.log(`⚠️ Cumulative sync completed with errors: ${result.errors.length} errors`);
      }
    } catch (error: any) {
      console.error(`❌ Cumulative sync failed for task ${task.id}:`, error);
      
      await storage.updateTaskRun(taskRunId, {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error.message || 'Unknown error',
      });

      await storage.updateScheduledTask(task.id, {
        lastRunStatus: 'failed',
        lastRunError: error.message || 'Unknown error',
        failedRuns: (task.failedRuns || 0) + 1,
      });
    }
  }

  private async monitorTaskCompletion(
    taskId: string,
    taskRunId: string,
    operationId: string,
    startTime: Date
  ): Promise<void> {
    const checkInterval = 5000;
    const maxWaitTime = 30 * 60 * 1000;
    let elapsedTime = 0;

    const checkStatus = async () => {
      try {
        const operation = await storage.getCopyOperation(operationId);
        
        if (!operation) {
          console.error(`Operation ${operationId} not found`);
          return;
        }

        if (operation.status === 'completed') {
          const completedAt = new Date();
          const task = await storage.getScheduledTask(taskId);
          const duration = Math.floor((completedAt.getTime() - startTime.getTime()) / 1000);

          await storage.updateTaskRun(taskRunId, {
            status: 'completed',
            completedAt,
            duration,
            filesProcessed: operation.completedFiles || 1,
            bytesTransferred: 0,
          });

          await storage.updateScheduledTask(taskId, {
            lastRunStatus: 'success',
            lastRunError: null,
            successfulRuns: ((task?.successfulRuns || 0) + 1),
          });

          console.log(`✅ Scheduled task ${taskId} completed successfully in ${duration}s`);
          return;
        }

        if (operation.status === 'failed') {
          const completedAt = new Date();
          const task = await storage.getScheduledTask(taskId);
          const duration = Math.floor((completedAt.getTime() - startTime.getTime()) / 1000);

          await storage.updateTaskRun(taskRunId, {
            status: 'failed',
            completedAt,
            duration,
            errorMessage: operation.errorMessage || 'Copy operation failed',
          });

          await storage.updateScheduledTask(taskId, {
            lastRunStatus: 'failed',
            lastRunError: operation.errorMessage || 'Copy operation failed',
            failedRuns: ((task?.failedRuns || 0) + 1),
          });

          console.log(`❌ Scheduled task ${taskId} failed: ${operation.errorMessage}`);
          return;
        }

        elapsedTime += checkInterval;
        if (elapsedTime < maxWaitTime) {
          setTimeout(checkStatus, checkInterval);
        } else {
          await storage.updateTaskRun(taskRunId, {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: 'Monitoring timed out',
          });
          console.warn(`⚠️ Scheduled task ${taskId} monitoring timed out after ${maxWaitTime / 1000}s`);
        }
      } catch (error) {
        console.error(`Error monitoring task ${taskId}:`, error);
      }
    };

    setTimeout(checkStatus, checkInterval);
  }

  calculateNextRun(task: ScheduledTask): Date {
    const now = new Date();
    const timezone = task.timezone || 'America/Argentina/Buenos_Aires';
    
    let nextRun = new Date();
    nextRun.setHours(task.hour || 8, task.minute || 0, 0, 0);

    switch (task.frequency) {
      case 'hourly':
        nextRun = new Date(now.getTime() + 60 * 60 * 1000);
        nextRun.setMinutes(task.minute || 0, 0, 0);
        break;

      case 'daily':
        nextRun.setHours(task.hour || 8, task.minute || 0, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        const targetDay = task.dayOfWeek ?? 1;
        nextRun.setHours(task.hour || 8, task.minute || 0, 0, 0);
        
        let daysUntilTarget = targetDay - now.getDay();
        if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextRun <= now)) {
          daysUntilTarget += 7;
        }
        nextRun.setDate(now.getDate() + daysUntilTarget);
        break;

      case 'monthly':
        const targetDayOfMonth = task.dayOfMonth || 1;
        nextRun = new Date(now.getFullYear(), now.getMonth(), targetDayOfMonth);
        nextRun.setHours(task.hour || 8, task.minute || 0, 0, 0);
        
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;

      case 'custom':
        const selectedDays = task.selectedDays || [];
        if (selectedDays.length === 0) {
          nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          nextRun.setHours(task.hour || 8, task.minute || 0, 0, 0);
        } else {
          nextRun.setHours(task.hour || 8, task.minute || 0, 0, 0);
          const currentDay = now.getDay();
          let daysToAdd = 0;
          let found = false;
          
          for (let i = 0; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (selectedDays.includes(checkDay)) {
              const potentialNextRun = new Date(now);
              potentialNextRun.setDate(now.getDate() + i);
              potentialNextRun.setHours(task.hour || 8, task.minute || 0, 0, 0);
              
              if (potentialNextRun > now) {
                daysToAdd = i;
                found = true;
                break;
              }
            }
          }
          
          if (!found) {
            for (let i = 1; i <= 7; i++) {
              const checkDay = (currentDay + i) % 7;
              if (selectedDays.includes(checkDay)) {
                daysToAdd = i;
                break;
              }
            }
          }
          
          nextRun.setDate(now.getDate() + daysToAdd);
        }
        break;

      default:
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        nextRun.setHours(task.hour || 8, task.minute || 0, 0, 0);
        break;
    }

    return nextRun;
  }

  getNextRunDescription(task: ScheduledTask): string {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hour = (task.hour || 8).toString().padStart(2, '0');
    const minute = (task.minute || 0).toString().padStart(2, '0');
    const time = `${hour}:${minute}`;

    switch (task.frequency) {
      case 'hourly':
        return `Cada hora, al minuto ${task.minute || 0}`;
      case 'daily':
        return `Todos los días a las ${time}`;
      case 'weekly':
        const dayName = dayNames[task.dayOfWeek ?? 1];
        return `Cada ${dayName} a las ${time}`;
      case 'monthly':
        return `El día ${task.dayOfMonth || 1} de cada mes a las ${time}`;
      case 'custom':
        const selectedDays = task.selectedDays || [];
        if (selectedDays.length === 0) {
          return `Programado a las ${time}`;
        }
        const daysList = selectedDays.map(d => dayNames[d].slice(0, 3)).join(', ');
        return `${daysList} a las ${time}`;
      default:
        return `Programado a las ${time}`;
    }
  }
}

let schedulerInstance: SchedulerService | null = null;

export function getSchedulerService(): SchedulerService {
  if (!schedulerInstance) {
    schedulerInstance = new SchedulerService({
      pollInterval: 60000,
    });
  }
  return schedulerInstance;
}

export async function startSchedulerService(): Promise<void> {
  const scheduler = getSchedulerService();
  await scheduler.start();
}

export async function stopSchedulerService(): Promise<void> {
  if (schedulerInstance) {
    await schedulerInstance.stop();
  }
}
