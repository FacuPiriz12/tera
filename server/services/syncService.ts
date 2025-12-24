import { storage } from '../storage';
import { GoogleDriveService } from './googleDriveService';
import { DropboxService } from './dropboxService';
import { DuplicateDetectionService } from './duplicateDetectionService';
import type { ScheduledTask, SyncFileRegistry, InsertSyncFileRegistry } from '@shared/schema';

interface SyncResult {
  success: boolean;
  filesScanned: number;
  filesNew: number;
  filesModified: number;
  filesCopied: number;
  filesSkipped: number;
  filesFailed: number;
  errors: string[];
  duration: number;
}

interface FileInfo {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  modifiedTime?: Date;
  path?: string;
  contentHash?: string;
}

export class SyncService {
  private userId: string;
  private googleService: GoogleDriveService | null = null;
  private dropboxService: DropboxService | null = null;
  private duplicateDetection: DuplicateDetectionService;

  constructor(userId: string) {
    this.userId = userId;
    this.duplicateDetection = new DuplicateDetectionService(userId);
  }

  private async getGoogleService(): Promise<GoogleDriveService> {
    if (!this.googleService) {
      this.googleService = new GoogleDriveService(this.userId);
    }
    return this.googleService;
  }

  private async getDropboxService(): Promise<DropboxService> {
    if (!this.dropboxService) {
      this.dropboxService = new DropboxService(this.userId);
    }
    return this.dropboxService;
  }

  async executeCumulativeSync(task: ScheduledTask): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      filesScanned: 0,
      filesNew: 0,
      filesModified: 0,
      filesCopied: 0,
      filesSkipped: 0,
      filesFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      console.log(`🔄 Starting cumulative sync for task: ${task.name} (${task.id})`);

      const sourceFiles = await this.listSourceFiles(task);
      result.filesScanned = sourceFiles.length;
      console.log(`📂 Found ${sourceFiles.length} files in source`);

      const existingSyncRecords = await storage.getSyncFilesByTask(task.id);
      const syncedFilesMap = new Map<string, SyncFileRegistry>();
      existingSyncRecords.forEach(record => {
        syncedFilesMap.set(record.sourceFileId, record);
      });

      for (const file of sourceFiles) {
        try {
          const existingRecord = syncedFilesMap.get(file.id);
          
          if (!existingRecord) {
            console.log(`📄 New file detected: ${file.name}`);
            result.filesNew++;
            
            // Get duplicate action from task (default to 'skip')
            const duplicateAction = (task.duplicateAction as 'skip' | 'replace' | 'copy_with_suffix') || 'skip';
            
            const copyResult = await this.copyFile(task, file, duplicateAction);
            
            // Handle duplicate detection - skip or report
            if (copyResult.isDuplicate) {
              console.log(`⚠️ Duplicate detected for ${file.name}, applying action: ${duplicateAction}`);
              if (duplicateAction === 'skip') {
                result.filesSkipped++;
                continue;
              }
              // For replace and copy_with_suffix, retry the copy with the action
              const retryResult = await this.copyFile(task, file, duplicateAction);
              if (retryResult.success) {
                await storage.createSyncFileRecord({
                  scheduledTaskId: task.id,
                  sourceFileId: file.id,
                  sourceProvider: task.sourceProvider,
                  sourceFilePath: file.path || null,
                  fileName: file.name,
                  mimeType: file.mimeType || null,
                  fileSize: file.size || null,
                  sourceModifiedAt: file.modifiedTime || null,
                  sourceContentHash: file.contentHash || null,
                  destFileId: retryResult.destFileId || null,
                  destProvider: task.destProvider,
                  destFilePath: retryResult.destFilePath || null,
                  syncStatus: 'synced',
                });
                result.filesCopied++;
              } else {
                result.filesFailed++;
                result.errors.push(`Failed to copy ${file.name}: ${retryResult.error}`);
              }
              continue;
            }
            
            if (copyResult.success) {
              await storage.createSyncFileRecord({
                scheduledTaskId: task.id,
                sourceFileId: file.id,
                sourceProvider: task.sourceProvider,
                sourceFilePath: file.path || null,
                fileName: file.name,
                mimeType: file.mimeType || null,
                fileSize: file.size || null,
                sourceModifiedAt: file.modifiedTime || null,
                sourceContentHash: file.contentHash || null,
                destFileId: copyResult.destFileId || null,
                destProvider: task.destProvider,
                destFilePath: copyResult.destFilePath || null,
                syncStatus: 'synced',
              });
              result.filesCopied++;
            } else {
              result.filesFailed++;
              result.errors.push(`Failed to copy ${file.name}: ${copyResult.error}`);
            }
          } else {
            const isModified = this.isFileModified(file, existingRecord);
            
            if (isModified) {
              console.log(`📝 Modified file detected: ${file.name}`);
              result.filesModified++;
              
              const copyResult = await this.copyFile(task, file);
              if (copyResult.success) {
                await storage.updateSyncFileRecord(existingRecord.id, {
                  sourceModifiedAt: file.modifiedTime || null,
                  sourceContentHash: file.contentHash || null,
                  destFileId: copyResult.destFileId || null,
                  destFilePath: copyResult.destFilePath || null,
                  lastSyncedAt: new Date(),
                  syncStatus: 'synced',
                });
                result.filesCopied++;
              } else {
                result.filesFailed++;
                result.errors.push(`Failed to update ${file.name}: ${copyResult.error}`);
              }
            } else {
              result.filesSkipped++;
            }
          }
        } catch (fileError: any) {
          result.filesFailed++;
          result.errors.push(`Error processing ${file.name}: ${fileError.message}`);
          console.error(`❌ Error processing file ${file.name}:`, fileError);
        }
      }

      result.success = result.filesFailed === 0;
      result.duration = Math.floor((Date.now() - startTime) / 1000);

      console.log(`✅ Sync completed: ${result.filesCopied} copied, ${result.filesSkipped} skipped, ${result.filesFailed} failed`);
      
      return result;
    } catch (error: any) {
      result.errors.push(`Sync failed: ${error.message}`);
      result.duration = Math.floor((Date.now() - startTime) / 1000);
      console.error(`❌ Cumulative sync failed:`, error);
      return result;
    }
  }

  private async listSourceFiles(task: ScheduledTask): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    
    if (task.sourceProvider === 'google') {
      const googleService = await this.getGoogleService();
      const folderId = task.sourceFolderId || this.extractFolderIdFromUrl(task.sourceUrl);
      
      if (!folderId) {
        throw new Error('Could not determine source folder ID');
      }

      const driveFiles = await googleService.listFolderContentsRecursive(folderId);
      
      for (const file of driveFiles) {
        if (file.mimeType !== 'application/vnd.google-apps.folder') {
          // Apply selective sync filters
          if (!this.shouldIncludeFile(file.id, task)) {
            continue;
          }
          
          files.push({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size ? parseInt(file.size) : undefined,
            modifiedTime: file.modifiedTime ? new Date(file.modifiedTime) : undefined,
            contentHash: file.md5Checksum,
          });
        }
      }
    } else if (task.sourceProvider === 'dropbox') {
      const dropboxService = await this.getDropboxService();
      const folderPath = task.sourceFolderId || this.extractDropboxPath(task.sourceUrl) || '';
      
      const dropboxFiles = await dropboxService.listFolderContentsRecursive(folderPath);
      
      for (const file of dropboxFiles) {
        if (file['.tag'] === 'file') {
          // Apply selective sync filters
          if (!this.shouldIncludeFile(file.id, task)) {
            continue;
          }
          
          files.push({
            id: file.id,
            name: file.name,
            path: file.path_display,
            size: file.size,
            modifiedTime: file.client_modified ? new Date(file.client_modified) : undefined,
            contentHash: file.content_hash,
          });
        }
      }
    }

    return files;
  }

  private shouldIncludeFile(fileId: string, task: ScheduledTask): boolean {
    // If excluded folders specified, check if file is in any excluded folder
    if (task.excludedFolderIds && task.excludedFolderIds.length > 0) {
      if (task.excludedFolderIds.includes(fileId)) {
        return false;
      }
    }
    
    // If selected folders specified, only include files from those folders
    if (task.selectedFolderIds && task.selectedFolderIds.length > 0) {
      if (!task.selectedFolderIds.includes(fileId)) {
        return false;
      }
    }
    
    return true;
  }

  private isFileModified(file: FileInfo, record: SyncFileRegistry): boolean {
    if (file.contentHash && record.sourceContentHash) {
      return file.contentHash !== record.sourceContentHash;
    }

    if (file.modifiedTime && record.sourceModifiedAt) {
      return file.modifiedTime > record.sourceModifiedAt;
    }

    if (file.size !== undefined && record.fileSize !== null) {
      return file.size !== record.fileSize;
    }

    return false;
  }

  /**
   * Copy file with metadata retention and duplicate handling
   * Preserves original modification time when transferring between providers
   * Allows user to choose action on duplicate (skip, replace, or copy_with_suffix)
   */
  private async copyFile(
    task: ScheduledTask, 
    file: FileInfo,
    duplicateAction?: 'skip' | 'replace' | 'copy_with_suffix'
  ): Promise<{ 
    success: boolean; 
    destFileId?: string; 
    destFilePath?: string; 
    error?: string;
    isDuplicate?: boolean;
    duplicateInfo?: any;
  }> {
    try {
      const isTransfer = task.sourceProvider !== task.destProvider;

      if (!isTransfer) {
        if (task.sourceProvider === 'google') {
          const googleService = await this.getGoogleService();
          const copiedFile = await googleService.copyFile(file.id, task.destinationFolderId);
          return { success: true, destFileId: copiedFile.id };
        } else {
          const dropboxService = await this.getDropboxService();
          const destPath = `${task.destinationFolderId === 'root' ? '' : task.destinationFolderId}/${file.name}`;
          const copiedFile = await dropboxService.copyFile(file.path!, destPath);
          return { success: true, destFilePath: copiedFile.path_display };
        }
      } else {
        // Cross-platform transfer with metadata retention and duplicate detection
        if (task.sourceProvider === 'google' && task.destProvider === 'dropbox') {
          const googleService = await this.getGoogleService();
          const dropboxService = await this.getDropboxService();
          
          const fileContent = await googleService.downloadFile(file.id);
          const destPath = `${task.destinationFolderId === 'root' ? '' : task.destinationFolderId}`;
          
          // Preserve original modification time
          const metadata = file.modifiedTime ? { clientModified: file.modifiedTime } : undefined;
          if (metadata) {
            console.log(`📅 Retaining metadata for ${file.name}: modifiedTime=${file.modifiedTime?.toISOString()}`);
          }
          
          // Determine upload options based on duplicate action
          const uploadOptions: any = {};
          let uploadFileName = file.name;
          
          if (duplicateAction === 'skip') {
            return { success: false, error: 'File skipped by user' };
          }
          if (duplicateAction === 'replace') {
            uploadOptions.forceOverwrite = true;
          }
          if (duplicateAction === 'copy_with_suffix') {
            const { name, ext } = this.parseFileName(file.name);
            uploadFileName = `${name}_copy${ext}`;
          }
          
          try {
            const uploadedFile = await dropboxService.uploadFile(uploadFileName, fileContent, destPath, metadata, uploadOptions);
            return { success: true, destFilePath: destPath + '/' + uploadFileName };
          } catch (uploadError: any) {
            // Handle duplicate detection error
            if (uploadError.isDuplicate) {
              return { 
                success: false, 
                isDuplicate: true, 
                duplicateInfo: uploadError.duplicateInfo,
                error: 'Duplicate file detected'
              };
            }
            throw uploadError;
          }
        } else if (task.sourceProvider === 'dropbox' && task.destProvider === 'google') {
          const googleService = await this.getGoogleService();
          const dropboxService = await this.getDropboxService();
          
          const fileContent = await dropboxService.downloadFile(file.path!);
          
          // Preserve original modification time
          const metadata = file.modifiedTime ? { modifiedTime: file.modifiedTime } : undefined;
          if (metadata) {
            console.log(`📅 Retaining metadata for ${file.name}: modifiedTime=${file.modifiedTime?.toISOString()}`);
          }
          
          // Determine upload options based on duplicate action
          const uploadOptions: any = {};
          let uploadFileName = file.name;
          
          if (duplicateAction === 'skip') {
            return { success: false, error: 'File skipped by user' };
          }
          if (duplicateAction === 'replace') {
            uploadOptions.forceOverwrite = true;
          }
          if (duplicateAction === 'copy_with_suffix') {
            const { name, ext } = this.parseFileName(file.name);
            uploadFileName = `${name}_copy${ext}`;
          }
          
          try {
            const uploadedFile = await googleService.uploadFile(
              uploadFileName,
              fileContent,
              task.destinationFolderId,
              file.mimeType || 'application/octet-stream',
              metadata,
              uploadOptions
            );
            return { success: true, destFileId: uploadedFile.id };
          } catch (uploadError: any) {
            // Handle duplicate detection error
            if (uploadError.isDuplicate) {
              return { 
                success: false, 
                isDuplicate: true, 
                duplicateInfo: uploadError.duplicateInfo,
                error: 'Duplicate file detected'
              };
            }
            throw uploadError;
          }
        }
      }

      return { success: false, error: 'Unsupported transfer combination' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private parseFileName(fileName: string): { name: string; ext: string } {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1) {
      return { name: fileName, ext: '' };
    }
    return {
      name: fileName.substring(0, lastDot),
      ext: fileName.substring(lastDot)
    };
  }

  private extractFolderIdFromUrl(url: string): string | null {
    const patterns = [
      /\/folders\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  private extractDropboxPath(url: string): string | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('dropbox')) {
        const pathMatch = url.match(/\/home(.+?)(?:\?|$)/);
        if (pathMatch) return pathMatch[1];
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Detect if file has conflicting changes (modified on BOTH sides)
   */
  private async detectConflict(sourceFile: FileInfo, destFile: FileInfo, task: ScheduledTask): Promise<boolean> {
    // Conflict = both files modified AND have different timestamps
    const sourceModified = sourceFile.modifiedTime;
    const destModified = destFile.modifiedTime;
    
    if (!sourceModified || !destModified) return false;
    
    const sourceTime = sourceModified.getTime();
    const destTime = destModified.getTime();
    const timeDiff = Math.abs(sourceTime - destTime);
    
    // If timestamps differ by more than 1 minute, consider it a conflict
    return timeDiff > 60000;
  }

  /**
   * Execute Mirror Sync - Bidirectional synchronization
   * Syncs files in BOTH directions: source → dest AND dest → source
   * Handles conflicts when files are modified on both sides
   */
  async executeMirrorSync(task: ScheduledTask): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      filesScanned: 0,
      filesNew: 0,
      filesModified: 0,
      filesCopied: 0,
      filesSkipped: 0,
      filesFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      console.log(`🔀 Starting mirror sync for task: ${task.name} (${task.id})`);

      // Get files from source
      const sourceFiles = await this.listSourceFiles(task);
      console.log(`📂 Source: ${sourceFiles.length} files`);

      // Get files from destination
      const destFiles = await this.listDestinationFiles(task);
      console.log(`📂 Destination: ${destFiles.length} files`);

      result.filesScanned = sourceFiles.length + destFiles.length;

      // Create maps for quick lookup
      const sourceMap = new Map(sourceFiles.map(f => [f.name, f]));
      const destMap = new Map(destFiles.map(f => [f.name, f]));

      // Phase 1: Source → Destination (copy new/modified from source)
      for (const sourceFile of sourceFiles) {
        try {
          const destFile = destMap.get(sourceFile.name);
          
          if (!destFile) {
            // New file in source
            console.log(`✨ New file in source: ${sourceFile.name}`);
            result.filesNew++;
            
            const copyResult = await this.copyFile(task, sourceFile, task.duplicateAction as 'skip' | 'replace' | 'copy_with_suffix');
            if (copyResult.success) {
              result.filesCopied++;
            } else {
              result.filesFailed++;
              result.errors.push(`Failed to copy ${sourceFile.name}: ${copyResult.error}`);
            }
          } else if (this.isFileModified(sourceFile, { ...destFile, sourceContentHash: destFile.contentHash } as any)) {
            // Check for conflict (modified on both sides)
            const hasConflict = await this.detectConflict(sourceFile, destFile, task);
            
            if (hasConflict) {
              // Save conflict for user to resolve
              console.log(`⚠️ Conflict detected: ${sourceFile.name}`);
              await storage.createFileConflict({
                scheduledTaskId: task.id,
                fileName: sourceFile.name,
                fileId: sourceFile.id,
                sourceVersion: {
                  fileId: sourceFile.id,
                  modifiedAt: sourceFile.modifiedTime,
                  size: sourceFile.size
                },
                destVersion: {
                  fileId: destFile.id,
                  modifiedAt: destFile.modifiedTime,
                  size: destFile.size
                },
                resolution: undefined,
              } as any);
              result.filesSkipped++;
            } else {
              // Modified only in source - safe to update
              console.log(`📝 Modified in source: ${sourceFile.name}`);
              result.filesModified++;
              
              const copyResult = await this.copyFile(task, sourceFile, 'replace');
              if (copyResult.success) {
                result.filesCopied++;
              } else {
                result.filesFailed++;
                result.errors.push(`Failed to update ${sourceFile.name}: ${copyResult.error}`);
              }
            }
          } else {
            result.filesSkipped++;
          }
        } catch (fileError: any) {
          result.filesFailed++;
          result.errors.push(`Error processing ${sourceFile.name}: ${fileError.message}`);
          console.error(`❌ Error processing source file:`, fileError);
        }
      }

      // Phase 2: Destination → Source (copy new/modified from dest that don't exist in source)
      for (const destFile of destFiles) {
        try {
          const sourceFile = sourceMap.get(destFile.name);
          
          if (!sourceFile) {
            // New file ONLY in destination
            console.log(`✨ New file in destination: ${destFile.name}`);
            result.filesNew++;
            
            // Reverse the copy direction
            const reversedTask = { ...task, sourceProvider: task.destProvider, destProvider: task.sourceProvider };
            const copyResult = await this.copyFile(reversedTask, destFile, task.duplicateAction as 'skip' | 'replace' | 'copy_with_suffix');
            if (copyResult.success) {
              result.filesCopied++;
            } else {
              result.filesFailed++;
              result.errors.push(`Failed to sync ${destFile.name} back: ${copyResult.error}`);
            }
          }
        } catch (fileError: any) {
          result.filesFailed++;
          result.errors.push(`Error processing destination file ${destFile.name}: ${fileError.message}`);
          console.error(`❌ Error processing dest file:`, fileError);
        }
      }

      result.success = result.filesFailed === 0;
      result.duration = Math.floor((Date.now() - startTime) / 1000);

      console.log(`✅ Mirror sync completed: ${result.filesCopied} synced, ${result.filesSkipped} skipped, ${result.filesFailed} failed`);
      
      return result;
    } catch (error: any) {
      result.errors.push(`Mirror sync failed: ${error.message}`);
      result.duration = Math.floor((Date.now() - startTime) / 1000);
      console.error(`❌ Mirror sync failed:`, error);
      return result;
    }
  }

  private async listDestinationFiles(task: ScheduledTask): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    
    if (task.destProvider === 'google') {
      const googleService = await this.getGoogleService();
      const folderId = task.destinationFolderId || this.extractFolderIdFromUrl(task.sourceUrl);
      
      if (folderId && folderId !== 'root') {
        const driveFiles = await googleService.listFolderContentsRecursive(folderId);
        for (const file of driveFiles) {
          if (file.mimeType !== 'application/vnd.google-apps.folder') {
            files.push({
              id: file.id,
              name: file.name,
              mimeType: file.mimeType,
              size: file.size ? parseInt(file.size) : undefined,
              modifiedTime: file.modifiedTime ? new Date(file.modifiedTime) : undefined,
              contentHash: file.md5Checksum,
            });
          }
        }
      }
    } else if (task.destProvider === 'dropbox') {
      const dropboxService = await this.getDropboxService();
      const folderPath = task.destinationFolderId === 'root' ? '' : task.destinationFolderId;
      
      const dropboxFiles = await dropboxService.listFolderContentsRecursive(folderPath);
      for (const file of dropboxFiles) {
        if (file['.tag'] === 'file') {
          files.push({
            id: file.id,
            name: file.name,
            path: file.path_display,
            size: file.size,
            modifiedTime: file.client_modified ? new Date(file.client_modified) : undefined,
            contentHash: file.content_hash,
          });
        }
      }
    }

    return files;
  }
}

let syncServiceInstances = new Map<string, SyncService>();

export function getSyncService(userId: string): SyncService {
  if (!syncServiceInstances.has(userId)) {
    syncServiceInstances.set(userId, new SyncService(userId));
  }
  return syncServiceInstances.get(userId)!;
}
