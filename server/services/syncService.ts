import { storage } from '../storage';
import { GoogleDriveService } from './googleDriveService';
import { DropboxService } from './dropboxService';
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

  constructor(userId: string) {
    this.userId = userId;
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
            
            const copyResult = await this.copyFile(task, file);
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

  private async copyFile(task: ScheduledTask, file: FileInfo): Promise<{ success: boolean; destFileId?: string; destFilePath?: string; error?: string }> {
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
        if (task.sourceProvider === 'google' && task.destProvider === 'dropbox') {
          const googleService = await this.getGoogleService();
          const dropboxService = await this.getDropboxService();
          
          const fileContent = await googleService.downloadFile(file.id);
          const destPath = `${task.destinationFolderId === 'root' ? '' : task.destinationFolderId}/${file.name}`;
          const uploadedFile = await dropboxService.uploadFile(destPath, fileContent);
          
          return { success: true, destFilePath: uploadedFile.path_display };
        } else if (task.sourceProvider === 'dropbox' && task.destProvider === 'google') {
          const googleService = await this.getGoogleService();
          const dropboxService = await this.getDropboxService();
          
          const fileContent = await dropboxService.downloadFile(file.path!);
          const uploadedFile = await googleService.uploadFile(
            file.name,
            fileContent,
            file.mimeType || 'application/octet-stream',
            task.destinationFolderId
          );
          
          return { success: true, destFileId: uploadedFile.id };
        }
      }

      return { success: false, error: 'Unsupported transfer combination' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
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
}

let syncServiceInstances = new Map<string, SyncService>();

export function getSyncService(userId: string): SyncService {
  if (!syncServiceInstances.has(userId)) {
    syncServiceInstances.set(userId, new SyncService(userId));
  }
  return syncServiceInstances.get(userId)!;
}
