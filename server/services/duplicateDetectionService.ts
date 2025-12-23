import * as crypto from 'crypto';
import { Readable } from 'stream';
import { storage } from '../storage';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateFile?: {
    fileId: string;
    fileName: string;
    provider: string;
    createdAt: Date;
  };
  matchType: 'hash' | 'metadata' | 'none';
}

export interface DuplicateUploadResult {
  success: boolean;
  isDuplicate: boolean;
  duplicateInfo?: DuplicateCheckResult;
  uploadedFileId?: string;
}

export interface DuplicateResolution {
  action: 'skip' | 'replace' | 'copy_with_suffix';
  newFileName?: string;
}

export class DuplicateDetectionService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Calculate SHA-256 hash of file content
   */
  async calculateFileHash(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      
      stream.on('data', (chunk) => {
        hash.update(chunk);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      stream.on('error', reject);
    });
  }

  /**
   * Check for duplicates using combined approach: metadata first, then hash
   */
  async checkDuplicate(
    fileName: string,
    fileSize: number,
    contentHash?: string,
    provider?: string
  ): Promise<DuplicateCheckResult> {
    // Step 1: Check metadata (fast)
    const metadataMatches = await storage.findFilesByMetadata(
      this.userId,
      fileName,
      fileSize,
      provider
    );

    if (metadataMatches.length > 0) {
      // If we have content hash, verify it matches
      if (contentHash) {
        const hashMatch = metadataMatches.find(f => f.contentHash === contentHash);
        if (hashMatch) {
          return {
            isDuplicate: true,
            duplicateFile: {
              fileId: hashMatch.fileId,
              fileName: hashMatch.fileName,
              provider: hashMatch.provider,
              createdAt: hashMatch.createdAt
            },
            matchType: 'hash'
          };
        }
      }
      
      // Without hash or no hash match, still consider it a duplicate based on metadata
      const match = metadataMatches[0];
      return {
        isDuplicate: true,
        duplicateFile: {
          fileId: match.fileId,
          fileName: match.fileName,
          provider: match.provider,
          createdAt: match.createdAt
        },
        matchType: 'metadata'
      };
    }

    // Step 2: Check by hash if we have it
    if (contentHash) {
      const hashMatch = await storage.findFileByHash(this.userId, contentHash);
      if (hashMatch) {
        return {
          isDuplicate: true,
          duplicateFile: {
            fileId: hashMatch.fileId,
            fileName: hashMatch.fileName,
            provider: hashMatch.provider,
            createdAt: hashMatch.createdAt
          },
          matchType: 'hash'
        };
      }
    }

    // No duplicate found
    return {
      isDuplicate: false,
      matchType: 'none'
    };
  }

  /**
   * Register a file after successful copy/transfer
   */
  async registerFile(
    fileName: string,
    fileSize: number,
    contentHash: string,
    provider: string,
    fileId: string,
    filePath?: string
  ): Promise<void> {
    await storage.createFileHash({
      userId: this.userId,
      fileName,
      fileSize: fileSize,
      contentHash,
      provider,
      fileId,
      filePath: filePath || undefined
    });
  }

  /**
   * Apply resolution strategy for duplicates
   */
  applyResolution(
    originalFileName: string,
    resolution: DuplicateResolution
  ): { action: string; newFileName: string } {
    if (resolution.action === 'skip') {
      return { action: 'skip', newFileName: originalFileName };
    }

    if (resolution.action === 'replace') {
      return { action: 'replace', newFileName: originalFileName };
    }

    // copy_with_suffix
    const { name, ext } = this.parseFileName(originalFileName);
    const newFileName = `${name}_copy${ext}`;
    
    return { action: 'copy', newFileName };
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
}
