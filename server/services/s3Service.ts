import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { storage } from '../storage';

export interface S3File {
  id: string;       // key
  name: string;
  size?: number;
  isFolder: boolean;
  lastModified?: string;
  mimeType?: string;
}

export interface S3Bucket {
  name: string;
  createdAt?: string;
}

export class S3Service {
  private userId: string;
  private client: S3Client | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getClient(): Promise<S3Client> {
    if (this.client) return this.client;

    const user = await storage.getUser(this.userId);
    if (!user?.s3AccessKeyId || !user?.s3SecretAccessKey) {
      throw new Error('S3 not connected. Please add your AWS credentials first.');
    }

    this.client = new S3Client({
      region: user.s3Region || 'us-east-1',
      credentials: {
        accessKeyId: user.s3AccessKeyId,
        secretAccessKey: user.s3SecretAccessKey,
      },
    });

    return this.client;
  }

  static async validateCredentials(accessKeyId: string, secretAccessKey: string, region: string): Promise<boolean> {
    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    try {
      await client.send(new ListBucketsCommand({}));
      return true;
    } catch {
      return false;
    }
  }

  async listBuckets(): Promise<S3Bucket[]> {
    const client = await this.getClient();
    const res = await client.send(new ListBucketsCommand({}));
    return (res.Buckets || []).map(b => ({
      name: b.Name!,
      createdAt: b.CreationDate?.toISOString(),
    }));
  }

  async listFolder(bucket: string, prefix?: string): Promise<S3File[]> {
    const client = await this.getClient();
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';

    const res = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: normalizedPrefix,
      Delimiter: '/',
      MaxKeys: 200,
    }));

    const folders: S3File[] = (res.CommonPrefixes || []).map(cp => {
      const fullKey = cp.Prefix!;
      const name = fullKey.slice(normalizedPrefix.length).replace(/\/$/, '');
      return { id: fullKey, name, isFolder: true };
    });

    const files: S3File[] = (res.Contents || [])
      .filter(obj => obj.Key !== normalizedPrefix)
      .map(obj => {
        const name = obj.Key!.slice(normalizedPrefix.length);
        return {
          id: obj.Key!,
          name,
          size: obj.Size,
          isFolder: false,
          lastModified: obj.LastModified?.toISOString(),
        };
      });

    return [...folders, ...files];
  }

  async downloadFile(bucket: string, key: string): Promise<Buffer> {
    const client = await this.getClient();
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const chunks: Uint8Array[] = [];
    for await (const chunk of res.Body as any) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async uploadFile(bucket: string, key: string, content: Buffer, mimeType?: string): Promise<S3File> {
    const client = await this.getClient();
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content,
      ContentType: mimeType || 'application/octet-stream',
    }));

    const name = key.split('/').pop() || key;
    return { id: key, name, size: content.length, isFolder: false };
  }

  async getFileMetadata(bucket: string, key: string): Promise<S3File> {
    const client = await this.getClient();
    const res = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    const name = key.split('/').pop() || key;
    return {
      id: key,
      name,
      size: res.ContentLength,
      mimeType: res.ContentType,
      isFolder: false,
      lastModified: res.LastModified?.toISOString(),
    };
  }

  async getPresignedDownloadUrl(bucket: string, key: string): Promise<string> {
    const client = await this.getClient();
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
  }

  async getPresignedUploadUrl(bucket: string, key: string, contentType?: string): Promise<string> {
    const client = await this.getClient();
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    return getSignedUrl(client, command, { expiresIn: 3600 });
  }
}
