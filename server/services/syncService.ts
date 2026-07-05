import { storage } from '../storage';
import { GoogleDriveService } from './googleDriveService';
import { DropboxService } from './dropboxService';
import { OneDriveService } from './oneDriveService';
import { BoxService } from './boxService';
import { S3Service } from './s3Service';
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
  private oneDriveService: OneDriveService | null = null;
  private boxService: BoxService | null = null;
  private s3Service: S3Service | null = null;
  private duplicateDetection: DuplicateDetectionService;

  constructor(userId: string) {
    this.userId = userId;
    this.duplicateDetection = new DuplicateDetectionService(userId);
  }

  private async getGoogleService(): Promise<GoogleDriveService> {
    if (!this.googleService) this.googleService = new GoogleDriveService(this.userId);
    return this.googleService;
  }

  private async getDropboxService(): Promise<DropboxService> {
    if (!this.dropboxService) this.dropboxService = new DropboxService(this.userId);
    return this.dropboxService;
  }

  private async getOneDriveService(): Promise<OneDriveService> {
    if (!this.oneDriveService) this.oneDriveService = new OneDriveService(this.userId);
    return this.oneDriveService;
  }

  private async getBoxService(): Promise<BoxService> {
    if (!this.boxService) this.boxService = new BoxService(this.userId);
    return this.boxService;
  }

  private async getS3Service(): Promise<S3Service> {
    if (!this.s3Service) this.s3Service = new S3Service(this.userId);
    return this.s3Service;
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
                // Create version record
                const destFileId1 = retryResult.destFileId || file.id;
                const existingV1 = await storage.getFileVersions(task.userId, destFileId1);
                await storage.createFileVersion({
                  userId: task.userId,
                  fileName: file.name,
                  fileId: destFileId1,
                  provider: task.destProvider,
                  filePath: retryResult.destFilePath || file.path || null,
                  versionNumber: existingV1.length > 0 ? Math.max(...existingV1.map(v => v.versionNumber)) + 1 : 1,
                  size: file.size || null,
                  mimeType: file.mimeType || null,
                  changeType: 'synced',
                  changeDetails: `Sincronizado desde ${task.sourceProvider} (${duplicateAction})`,
                  scheduledTaskId: task.id,
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
              // Create version record
              const destFileId2 = copyResult.destFileId || file.id;
              const existingV2 = await storage.getFileVersions(task.userId, destFileId2);
              await storage.createFileVersion({
                userId: task.userId,
                fileName: file.name,
                fileId: destFileId2,
                provider: task.destProvider,
                filePath: copyResult.destFilePath || file.path || null,
                versionNumber: existingV2.length > 0 ? Math.max(...existingV2.map(v => v.versionNumber)) + 1 : 1,
                size: file.size || null,
                mimeType: file.mimeType || null,
                changeType: 'synced',
                changeDetails: `Sincronizado desde ${task.sourceProvider}`,
                scheduledTaskId: task.id,
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
                // Create version record for modified file
                const existingVersions = await storage.getFileVersions(task.userId, copyResult.destFileId || file.id);
                const nextVersion = (existingVersions.length > 0 ? Math.max(...existingVersions.map(v => v.versionNumber || 0)) : 0) + 1;
                await storage.createFileVersion({
                  userId: task.userId,
                  fileName: file.name,
                  fileId: copyResult.destFileId || file.id,
                  provider: task.destProvider,
                  filePath: copyResult.destFilePath || file.path || null,
                  versionNumber: nextVersion,
                  size: file.size || null,
                  mimeType: file.mimeType || null,
                  changeType: 'modified',
                  changeDetails: `Actualizado desde ${task.sourceProvider} - Cambios detectados`,
                  scheduledTaskId: task.id,
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
    switch (task.sourceProvider) {
      case 'google': {
        const svc = await this.getGoogleService();
        const folderId = task.sourceFolderId || this.extractFolderIdFromUrl(task.sourceUrl);
        if (!folderId) throw new Error('Could not determine Google Drive source folder ID');
        const all = await this.listGoogleFilesRecursive(svc, folderId);
        return all.filter(f => this.shouldIncludeFile(f.id, task));
      }
      case 'dropbox': {
        const svc = await this.getDropboxService();
        const folderPath = task.sourceFolderId || this.extractDropboxPath(task.sourceUrl) || '';
        const all = await this.listDropboxFilesRecursive(svc, folderPath);
        return all.filter(f => this.shouldIncludeFile(f.id, task));
      }
      case 'onedrive': {
        const svc = await this.getOneDriveService();
        const folderId = task.sourceFolderId || task.sourceUrl?.replace('onedrive://', '') || undefined;
        return this.listOneDriveFilesRecursive(svc, folderId);
      }
      case 'box': {
        const svc = await this.getBoxService();
        const folderId = task.sourceFolderId || task.sourceUrl?.replace('box://', '') || undefined;
        return this.listBoxFilesRecursive(svc, folderId);
      }
      case 's3': {
        const svc = await this.getS3Service();
        const s3 = this.parseS3Url(task.sourceUrl);
        if (!s3) throw new Error('Could not parse S3 source URL');
        return this.listS3FilesRecursive(svc, s3.bucket, s3.key);
      }
      default:
        throw new Error(`Unsupported source provider: ${task.sourceProvider}`);
    }
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

  private async copyFile(
    task: ScheduledTask,
    file: FileInfo,
    duplicateAction?: 'skip' | 'replace' | 'copy_with_suffix'
  ): Promise<{ success: boolean; destFileId?: string; destFilePath?: string; error?: string; isDuplicate?: boolean; duplicateInfo?: any }> {
    try {
      // Fast path: native same-provider copy for Google Drive
      if (task.sourceProvider === 'google' && task.destProvider === 'google') {
        const svc = await this.getGoogleService();
        const copied = await svc.copyFile(file.id, task.destinationFolderId);
        return { success: true, destFileId: (copied as any).id };
      }
      // Fast path: native same-provider copy for Dropbox
      if (task.sourceProvider === 'dropbox' && task.destProvider === 'dropbox') {
        const svc = await this.getDropboxService();
        const destPath = `${task.destinationFolderId === 'root' ? '' : task.destinationFolderId}/${file.name}`;
        const copied = await svc.copyFile(file.path!, destPath);
        return { success: true, destFilePath: (copied as any).path_display };
      }
      // Generic path: download + upload (handles all cross-provider and onedrive/box/s3)
      let fileName = file.name;
      if (duplicateAction === 'copy_with_suffix') {
        const { name, ext } = this.parseFileName(file.name);
        fileName = `${name}_copy${ext}`;
      }
      const { content, fileName: exportedName } = await this.downloadFromSource(task, file);
      if (exportedName !== file.name) fileName = exportedName;
      return await this.uploadToDestination(task, fileName, content, file.mimeType, file.modifiedTime);
    } catch (error: any) {
      if (error?.isDuplicate) {
        return { success: false, isDuplicate: true, duplicateInfo: error.duplicateInfo, error: 'Duplicate file detected' };
      }
      return { success: false, error: error.message };
    }
  }

  private async downloadFromSource(task: ScheduledTask, file: FileInfo): Promise<{ content: Buffer; fileName: string }> {
    switch (task.sourceProvider) {
      case 'google': {
        const svc = await this.getGoogleService();
        const dl = await svc.downloadFile(file.id);
        let fn = file.name;
        if ((dl as any).exportExtension && !fn.includes('.')) fn += (dl as any).exportExtension;
        return { content: Buffer.from(dl.content), fileName: fn };
      }
      case 'dropbox': {
        const svc = await this.getDropboxService();
        const raw = await svc.downloadFile(file.path!);
        return { content: raw instanceof Buffer ? raw : Buffer.from(raw as ArrayBuffer), fileName: file.name };
      }
      case 'onedrive': {
        const svc = await this.getOneDriveService();
        return { content: await svc.downloadFile(file.id), fileName: file.name };
      }
      case 'box': {
        const svc = await this.getBoxService();
        return { content: await svc.downloadFile(file.id), fileName: file.name };
      }
      case 's3': {
        const svc = await this.getS3Service();
        const slashIdx = file.id.indexOf('/');
        const bucket = slashIdx >= 0 ? file.id.slice(0, slashIdx) : file.id;
        const key = slashIdx >= 0 ? file.id.slice(slashIdx + 1) : '';
        return { content: await svc.downloadFile(bucket, key), fileName: file.name };
      }
      default:
        throw new Error(`Unsupported source provider: ${task.sourceProvider}`);
    }
  }

  private async uploadToDestination(
    task: ScheduledTask,
    fileName: string,
    content: Buffer,
    mimeType?: string,
    modifiedTime?: Date
  ): Promise<{ success: boolean; destFileId?: string; destFilePath?: string; error?: string }> {
    try {
      switch (task.destProvider) {
        case 'google': {
          const svc = await this.getGoogleService();
          const meta = modifiedTime ? { modifiedTime } : undefined;
          const up = await svc.uploadFile(fileName, content, task.destinationFolderId, mimeType || 'application/octet-stream', meta);
          return { success: true, destFileId: up.id };
        }
        case 'dropbox': {
          const svc = await this.getDropboxService();
          const destPath = task.destinationFolderId === 'root' ? '' : (task.destinationFolderId || '');
          const meta = modifiedTime ? { clientModified: modifiedTime } : undefined;
          await svc.uploadFile(fileName, content, destPath, meta);
          return { success: true, destFilePath: `${destPath}/${fileName}` };
        }
        case 'onedrive': {
          const svc = await this.getOneDriveService();
          const up = await svc.uploadFile(task.destinationFolderId || null, fileName, content, mimeType);
          return { success: true, destFileId: up.id };
        }
        case 'box': {
          const svc = await this.getBoxService();
          const up = await svc.uploadFile(task.destinationFolderId || null, fileName, content, mimeType);
          return { success: true, destFileId: up.id };
        }
        case 's3': {
          const svc = await this.getS3Service();
          const destId = task.destinationFolderId || '';
          const slashIdx = destId.indexOf('/');
          const bucket = slashIdx >= 0 ? destId.slice(0, slashIdx) : destId;
          const prefix = slashIdx >= 0 ? destId.slice(slashIdx + 1) : '';
          const key = prefix ? `${prefix}/${fileName}` : fileName;
          await svc.uploadFile(bucket, key, content, mimeType);
          return { success: true, destFilePath: key };
        }
        default:
          throw new Error(`Unsupported destination provider: ${task.destProvider}`);
      }
    } catch (error: any) {
      if (error?.isDuplicate) throw error;
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

  private parseS3Url(url: string): { bucket: string; key: string } | null {
    if (!url.startsWith('s3://')) return null;
    const rest = url.slice('s3://'.length);
    const slashIdx = rest.indexOf('/');
    if (slashIdx < 0) return { bucket: rest, key: '' };
    return { bucket: rest.slice(0, slashIdx), key: rest.slice(slashIdx + 1) };
  }

  private async listGoogleFilesRecursive(svc: GoogleDriveService, folderId: string): Promise<FileInfo[]> {
    const items = await svc.listFiles(folderId);
    const result: FileInfo[] = [];
    for (const item of items) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        result.push(...await this.listGoogleFilesRecursive(svc, item.id));
      } else {
        result.push({ id: item.id, name: item.name, mimeType: item.mimeType, size: item.size ? parseInt(item.size) : undefined, modifiedTime: item.modifiedTime ? new Date(item.modifiedTime) : undefined, contentHash: (item as any).md5Checksum });
      }
    }
    return result;
  }

  private async listDropboxFilesRecursive(svc: DropboxService, path: string): Promise<FileInfo[]> {
    const items = await svc.listFiles(path === '/' ? '' : path) as any[];
    const result: FileInfo[] = [];
    for (const item of items) {
      if (item['.tag'] === 'folder') {
        const subPath = item.path_display || item.path_lower || `${path}/${item.name}`;
        result.push(...await this.listDropboxFilesRecursive(svc, subPath));
      } else if (item['.tag'] === 'file') {
        result.push({ id: item.id, name: item.name, path: item.path_display, size: item.size, modifiedTime: item.client_modified ? new Date(item.client_modified) : undefined, contentHash: item.content_hash });
      }
    }
    return result;
  }

  private async listOneDriveFilesRecursive(svc: OneDriveService, folderId?: string): Promise<FileInfo[]> {
    const items = await svc.listFolder(folderId);
    const result: FileInfo[] = [];
    for (const item of items) {
      if (item.isFolder) {
        result.push(...await this.listOneDriveFilesRecursive(svc, item.id));
      } else {
        result.push({ id: item.id, name: item.name, mimeType: item.mimeType, size: item.size, modifiedTime: item.lastModified ? new Date(item.lastModified) : undefined });
      }
    }
    return result;
  }

  private async listBoxFilesRecursive(svc: BoxService, folderId?: string): Promise<FileInfo[]> {
    const items = await svc.listFolder(folderId);
    const result: FileInfo[] = [];
    for (const item of items) {
      if (item.isFolder) {
        result.push(...await this.listBoxFilesRecursive(svc, item.id));
      } else {
        result.push({ id: item.id, name: item.name, size: item.size, modifiedTime: item.lastModified ? new Date(item.lastModified) : undefined });
      }
    }
    return result;
  }

  private async listS3FilesRecursive(svc: S3Service, bucket: string, prefix: string = ''): Promise<FileInfo[]> {
    const items = await svc.listFolder(bucket, prefix);
    const result: FileInfo[] = [];
    for (const item of items) {
      if (item.isFolder) {
        result.push(...await this.listS3FilesRecursive(svc, bucket, item.id));
      } else {
        // Store id as 'bucket/key' so downloadFromSource can parse it back
        result.push({ id: `${bucket}/${item.id}`, name: item.name, size: item.size, modifiedTime: item.lastModified ? new Date(item.lastModified) : undefined });
      }
    }
    return result;
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
    switch (task.destProvider) {
      case 'google': {
        const svc = await this.getGoogleService();
        const folderId = task.destinationFolderId;
        if (!folderId || folderId === 'root') return [];
        return this.listGoogleFilesRecursive(svc, folderId);
      }
      case 'dropbox': {
        const svc = await this.getDropboxService();
        const folderPath = task.destinationFolderId === 'root' ? '' : (task.destinationFolderId || '');
        return this.listDropboxFilesRecursive(svc, folderPath);
      }
      case 'onedrive': {
        const svc = await this.getOneDriveService();
        return this.listOneDriveFilesRecursive(svc, task.destinationFolderId || undefined);
      }
      case 'box': {
        const svc = await this.getBoxService();
        return this.listBoxFilesRecursive(svc, task.destinationFolderId || undefined);
      }
      case 's3': {
        const svc = await this.getS3Service();
        const destId = task.destinationFolderId || '';
        const slashIdx = destId.indexOf('/');
        const bucket = slashIdx >= 0 ? destId.slice(0, slashIdx) : destId;
        const prefix = slashIdx >= 0 ? destId.slice(slashIdx + 1) : '';
        if (!bucket) return [];
        return this.listS3FilesRecursive(svc, bucket, prefix);
      }
      default:
        return [];
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
