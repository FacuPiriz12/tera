import { storage } from '../storage';
import { getQueueWorker } from '../queueWorker';
import { GoogleDriveService } from './googleDriveService';
import { DropboxService } from './dropboxService';
import { OneDriveService } from './oneDriveService';
import { BoxService } from './boxService';
import type { WatchFolder } from '@shared/schema';

interface SourceFile {
  id: string;
  name: string;
  size?: number | null;
}

export class WatchFolderService {
  private isRunning = false;
  private pollTimeout: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL = 60_000; // check every 60s which folders are due

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('👁️ Watch Folder service started');
    this.scheduleLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }
    console.log('🛑 Watch Folder service stopped');
  }

  private scheduleLoop(): void {
    if (!this.isRunning) return;
    this.pollTimeout = setTimeout(async () => {
      try {
        await this.processDueFolders();
      } catch (err) {
        console.error('❌ Error in watch folder loop:', err);
      }
      this.scheduleLoop();
    }, this.POLL_INTERVAL);
  }

  private async processDueFolders(): Promise<void> {
    const all = await storage.getActiveWatchFolders();
    const now = Date.now();
    const due = all.filter(wf => {
      const last = wf.lastCheckedAt ? new Date(wf.lastCheckedAt).getTime() : 0;
      return now - last >= wf.intervalMinutes * 60_000;
    });

    if (due.length === 0) return;
    console.log(`👁️ ${due.length} watch folder(s) due for check`);

    for (const wf of due) {
      await this.checkFolder(wf);
    }
  }

  private async checkFolder(wf: WatchFolder): Promise<void> {
    console.log(`👁️ Checking watch folder "${wf.name}" (${wf.sourceProvider} → ${wf.destProvider})`);

    try {
      const sourceFiles = await this.listSourceFiles(wf);
      const knownIds = await storage.getWatchFolderKnownFileIds(wf.id);

      const newFiles = sourceFiles.filter(f => !knownIds.has(f.id));

      await storage.updateWatchFolder(wf.id, {
        lastCheckedAt: new Date(),
        filesDetected: (wf.filesDetected || 0) + newFiles.length,
      });

      if (newFiles.length === 0) {
        console.log(`👁️ No new files in "${wf.name}"`);
        return;
      }

      console.log(`👁️ ${newFiles.length} new file(s) in "${wf.name}" — enqueueing`);

      const worker = getQueueWorker();

      for (const file of newFiles) {
        const isTransfer = wf.sourceProvider !== wf.destProvider;
        await storage.createCopyOperation({
          userId: wf.userId,
          sourceUrl: buildSourceUrl(wf.sourceProvider, file.id),
          sourceProvider: wf.sourceProvider,
          sourceFileId: file.id,
          destinationFolderId: wf.destFolderId,
          destProvider: wf.destProvider,
          status: 'pending',
          itemType: 'file',
          fileName: file.name,
          operationType: isTransfer ? 'transfer' : 'copy',
        });
      }

      worker.notifyNewJob();

      await storage.addWatchFolderFiles(wf.id, newFiles.map(f => ({ sourceFileId: f.id, fileName: f.name, fileSize: f.size })));
      await storage.updateWatchFolder(wf.id, {
        filesTransferred: (wf.filesTransferred || 0) + newFiles.length,
      });

    } catch (err: any) {
      console.error(`❌ Watch folder "${wf.name}" check failed:`, err.message);
    }
  }

  private async listSourceFiles(wf: WatchFolder): Promise<SourceFile[]> {
    const { sourceProvider, sourceFolderId, userId } = wf;

    try {
      if (sourceProvider === 'google') {
        const svc = new GoogleDriveService(userId);
        const items = await svc.listFiles(sourceFolderId);
        return items
          .filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder')
          .map((f: any) => ({ id: f.id, name: f.name, size: f.size ? parseInt(f.size) : null }));
      }

      if (sourceProvider === 'dropbox') {
        const svc = new DropboxService(userId);
        const items = await svc.listFiles(sourceFolderId === 'root' ? '' : sourceFolderId) as any[];
        return items
          .filter((f: any) => f['.tag'] === 'file')
          .map((f: any) => ({ id: f.id, name: f.name, size: f.size ?? null }));
      }

      if (sourceProvider === 'onedrive') {
        const svc = new OneDriveService(userId);
        const items = await svc.listFolder(sourceFolderId === 'root' ? undefined : sourceFolderId);
        return items
          .filter((f: any) => !f.isFolder)
          .map((f: any) => ({ id: f.id, name: f.name, size: f.size ?? null }));
      }

      if (sourceProvider === 'box') {
        const svc = new BoxService(userId);
        const items = await svc.listFolder(sourceFolderId === 'root' ? '0' : sourceFolderId);
        return items
          .filter((f: any) => !f.isFolder)
          .map((f: any) => ({ id: f.id, name: f.name, size: f.size ?? null }));
      }

      return [];
    } catch (err: any) {
      console.error(`❌ Failed to list files for watch folder ${wf.id} (${sourceProvider}):`, err.message);
      return [];
    }
  }
}

function buildSourceUrl(provider: string, fileId: string): string {
  if (provider === 'google') return `https://drive.google.com/file/d/${fileId}`;
  if (provider === 'dropbox') return `dropbox://file:${fileId}`;
  if (provider === 'onedrive') return `onedrive://${fileId}`;
  if (provider === 'box') return `box://${fileId}`;
  return fileId;
}

let instance: WatchFolderService | null = null;

export async function startWatchFolderService(): Promise<void> {
  instance = new WatchFolderService();
  await instance.start();
}

export function getWatchFolderService(): WatchFolderService | null {
  return instance;
}
