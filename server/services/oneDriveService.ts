import { storage } from '../storage';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

const CLIENT_ID = process.env.ONEDRIVE_CLIENT_ID!;
const CLIENT_SECRET = process.env.ONEDRIVE_CLIENT_SECRET!;
const SCOPES = 'Files.ReadWrite offline_access User.Read';

export interface OneDriveFile {
  id: string;
  name: string;
  size?: number;
  mimeType?: string;
  isFolder: boolean;
  lastModified?: string;
  downloadUrl?: string;
  webUrl?: string;
}

export class OneDriveService {
  private userId: string;
  private accessToken: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ── Auth helpers ────────────────────────────────────────────────────────────

  static getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: SCOPES,
      state,
      response_mode: 'query',
    });
    return `${AUTH_URL}?${params}`;
  }

  static async exchangeCode(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OneDrive token exchange failed: ${err}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  private async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OneDrive token refresh failed: ${err}`);
    }

    const data = await res.json();
    return { accessToken: data.access_token, expiresIn: data.expires_in };
  }

  private async ensureValidToken(): Promise<void> {
    const user = await storage.getUser(this.userId);
    if (!user?.onedriveAccessToken && !user?.onedriveRefreshToken) {
      throw new Error('OneDrive not connected. Please connect your OneDrive account first.');
    }

    const bufferMs = 60 * 1000;
    const isExpired = user.onedriveTokenExpiry &&
      new Date(user.onedriveTokenExpiry.getTime() - bufferMs) <= new Date();

    if ((!user.onedriveAccessToken || isExpired) && user.onedriveRefreshToken) {
      const { accessToken, expiresIn } = await this.refreshAccessToken(user.onedriveRefreshToken);
      const expiry = new Date(Date.now() + expiresIn * 1000);
      await storage.updateUser(this.userId, {
        onedriveAccessToken: accessToken,
        onedriveTokenExpiry: expiry,
      });
      this.accessToken = accessToken;
    } else {
      this.accessToken = user.onedriveAccessToken!;
    }
  }

  private async graphGet(path: string): Promise<any> {
    await this.ensureValidToken();
    const res = await fetch(`${GRAPH_BASE}${path}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) {
      const body = await res.text();
      let message = `Graph API error (${res.status})`;
      try {
        const parsed = JSON.parse(body);
        message = parsed?.error?.message || message;
      } catch {
        message = body || message;
      }
      const err = new Error(message) as any;
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  // ── File operations ─────────────────────────────────────────────────────────

  async listFolder(folderId?: string): Promise<OneDriveFile[]> {
    const path = folderId
      ? `/me/drive/items/${folderId}/children`
      : '/me/drive/root/children';

    let data: any;
    try {
      // @microsoft.graph.downloadUrl is not valid in $select for children listing — fetch it per-file when needed
      data = await this.graphGet(`${path}?$select=id,name,size,file,folder,lastModifiedDateTime&$top=200`);
    } catch (err: any) {
      // re-throw auth errors; for anything else (404, permissions, etc.) return empty list
      if (err.message?.includes('not connected')) throw err;
      console.warn('OneDrive listFolder error (returning empty):', err.message);
      data = { value: [] };
    }

    return (data.value || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      mimeType: item.file?.mimeType,
      isFolder: !!item.folder,
      lastModified: item.lastModifiedDateTime,
    }));
  }

  async getDownloadUrl(fileId: string): Promise<string> {
    await this.ensureValidToken();
    const res = await fetch(`${GRAPH_BASE}/me/drive/items/${fileId}?$select=@microsoft.graph.downloadUrl`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) throw new Error(`Failed to get download URL: ${res.status}`);
    const data = await res.json();
    const url = data['@microsoft.graph.downloadUrl'];
    if (!url) throw new Error('No download URL returned for file');
    return url;
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const url = await this.getDownloadUrl(fileId);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download file: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async uploadFile(folderId: string | null, fileName: string, content: Buffer, mimeType?: string): Promise<OneDriveFile> {
    await this.ensureValidToken();

    const parentPath = folderId ? `/me/drive/items/${folderId}` : '/me/drive/root';

    if (content.length <= 4 * 1024 * 1024) {
      // Small file — simple PUT
      const res = await fetch(`${GRAPH_BASE}${parentPath}:/${encodeURIComponent(fileName)}:/content`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': mimeType || 'application/octet-stream',
        },
        body: content,
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OneDrive upload failed: ${err}`);
      }
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        size: data.size,
        mimeType: data.file?.mimeType,
        isFolder: false,
        lastModified: data.lastModifiedDateTime,
        webUrl: data.webUrl,
      };
    }

    // Large file — upload session
    const sessionRes = await fetch(`${GRAPH_BASE}${parentPath}:/${encodeURIComponent(fileName)}:/createUploadSession`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ item: { '@microsoft.graph.conflictBehavior': 'rename' } }),
    });
    if (!sessionRes.ok) throw new Error(`Failed to create upload session: ${sessionRes.status}`);
    const { uploadUrl } = await sessionRes.json();

    const chunkSize = 5 * 1024 * 1024; // 5 MB chunks
    let offset = 0;
    let result: any;

    while (offset < content.length) {
      const chunk = content.slice(offset, offset + chunkSize);
      const end = Math.min(offset + chunkSize - 1, content.length - 1);
      const chunkRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': chunk.length.toString(),
          'Content-Range': `bytes ${offset}-${end}/${content.length}`,
        },
        body: chunk,
      });
      if (!chunkRes.ok && chunkRes.status !== 202) {
        throw new Error(`Chunk upload failed at offset ${offset}: ${chunkRes.status}`);
      }
      result = await chunkRes.json();
      offset += chunkSize;
    }

    return {
      id: result.id,
      name: result.name,
      size: result.size,
      isFolder: false,
      lastModified: result.lastModifiedDateTime,
      webUrl: result.webUrl,
    };
  }

  async getFileMetadata(fileId: string): Promise<OneDriveFile> {
    const data = await this.graphGet(`/me/drive/items/${fileId}?$select=id,name,size,file,folder,lastModifiedDateTime`);
    return {
      id: data.id,
      name: data.name,
      size: data.size,
      mimeType: data.file?.mimeType,
      isFolder: !!data.folder,
      lastModified: data.lastModifiedDateTime,
    };
  }

  async createFolder(parentId: string | null, name: string): Promise<OneDriveFile> {
    await this.ensureValidToken();
    const parentPath = parentId ? `/me/drive/items/${parentId}` : '/me/drive/root';
    const res = await fetch(`${GRAPH_BASE}${parentPath}/children`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, folder: {}, '@microsoft.graph.conflictBehavior': 'rename' }),
    });
    if (!res.ok) throw new Error(`OneDrive createFolder failed: ${await res.text()}`);
    const data = await res.json();
    return { id: data.id, name: data.name, isFolder: true, webUrl: data.webUrl };
  }

  async getUserInfo(): Promise<{ displayName: string; email: string }> {
    const data = await this.graphGet('/me?$select=displayName,mail,userPrincipalName');
    return {
      displayName: data.displayName,
      email: data.mail || data.userPrincipalName,
    };
  }
}
