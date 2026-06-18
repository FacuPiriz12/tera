import { storage } from '../storage';

const BOX_API = 'https://api.box.com/2.0';
const BOX_UPLOAD = 'https://upload.box.com/api/2.0';
const AUTH_URL = 'https://account.box.com/api/oauth2/authorize';
const TOKEN_URL = 'https://api.box.com/oauth2/token';

const CLIENT_ID = process.env.BOX_CLIENT_ID!;
const CLIENT_SECRET = process.env.BOX_CLIENT_SECRET!;

export interface BoxFile {
  id: string;
  name: string;
  size?: number;
  mimeType?: string;
  isFolder: boolean;
  lastModified?: string;
  webUrl?: string;
}

export class BoxService {
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
      state,
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
      throw new Error(`Box token exchange failed: ${err}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  private async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Box token refresh failed: ${err}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  private async ensureValidToken(): Promise<void> {
    const user = await storage.getUser(this.userId);
    if (!user?.boxAccessToken && !user?.boxRefreshToken) {
      throw new Error('Box not connected. Please connect your Box account first.');
    }

    const bufferMs = 60 * 1000;
    const isExpired = user.boxTokenExpiry &&
      new Date(user.boxTokenExpiry.getTime() - bufferMs) <= new Date();

    if ((!user.boxAccessToken || isExpired) && user.boxRefreshToken) {
      const { accessToken, refreshToken, expiresIn } = await this.refreshAccessToken(user.boxRefreshToken);
      const expiry = new Date(Date.now() + expiresIn * 1000);
      await storage.updateUserBoxTokens(this.userId, {
        accessToken,
        refreshToken,
        expiry,
      });
      this.accessToken = accessToken;
    } else {
      this.accessToken = user.boxAccessToken!;
    }
  }

  private async apiGet(path: string): Promise<any> {
    await this.ensureValidToken();
    const res = await fetch(`${BOX_API}${path}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Box API error (${res.status}): ${err}`);
    }
    return res.json();
  }

  // ── File operations ─────────────────────────────────────────────────────────

  async listFolder(folderId?: string): Promise<BoxFile[]> {
    const id = folderId || '0'; // '0' = root in Box
    const data = await this.apiGet(`/folders/${id}/items?fields=id,name,size,type,modified_at,shared_link&limit=200`);

    return (data.entries || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      isFolder: item.type === 'folder',
      lastModified: item.modified_at,
      webUrl: item.shared_link?.url,
    }));
  }

  async getFileMetadata(fileId: string): Promise<BoxFile> {
    const data = await this.apiGet(`/files/${fileId}?fields=id,name,size,mime_type,modified_at`);
    return {
      id: data.id,
      name: data.name,
      size: data.size,
      mimeType: data.mime_type,
      isFolder: false,
      lastModified: data.modified_at,
    };
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    await this.ensureValidToken();
    // Box returns 302 redirect to actual download URL
    const res = await fetch(`${BOX_API}/files/${fileId}/content`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`Box download failed: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async uploadFile(folderId: string | null, fileName: string, content: Buffer, mimeType?: string): Promise<BoxFile> {
    await this.ensureValidToken();

    const parentId = folderId || '0';
    const CHUNK_THRESHOLD = 20 * 1024 * 1024; // 20 MB — Box recommends chunked above this

    if (content.length <= CHUNK_THRESHOLD) {
      // Small file — multipart upload
      const formData = new FormData();
      formData.append('attributes', JSON.stringify({ name: fileName, parent: { id: parentId } }));
      formData.append('file', new Blob([content], { type: mimeType || 'application/octet-stream' }), fileName);

      const res = await fetch(`${BOX_UPLOAD}/files/content`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Box upload failed: ${err}`);
      }

      const data = await res.json();
      const file = data.entries?.[0] || data;
      return {
        id: file.id,
        name: file.name,
        size: file.size,
        isFolder: false,
        lastModified: file.modified_at,
      };
    }

    // Large file — chunked upload session
    const sessionRes = await fetch(`${BOX_UPLOAD}/files/upload_sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folder_id: parentId,
        file_name: fileName,
        file_size: content.length,
      }),
    });
    if (!sessionRes.ok) throw new Error(`Failed to create Box upload session: ${sessionRes.status}`);
    const session = await sessionRes.json();
    const sessionId = session.id;
    const partSize = session.part_size;

    const parts: any[] = [];
    let offset = 0;

    while (offset < content.length) {
      const chunk = content.slice(offset, Math.min(offset + partSize, content.length));
      const end = Math.min(offset + partSize - 1, content.length - 1);

      const partRes = await fetch(`${BOX_UPLOAD}/files/upload_sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/octet-stream',
          'Content-Range': `bytes ${offset}-${end}/${content.length}`,
          Digest: `sha=placeholder`,
        },
        body: chunk,
      });
      if (!partRes.ok) throw new Error(`Box chunk upload failed at offset ${offset}: ${partRes.status}`);
      const partData = await partRes.json();
      parts.push(partData.part);
      offset += partSize;
    }

    // Commit the session
    const commitRes = await fetch(`${BOX_UPLOAD}/files/upload_sessions/${sessionId}/commit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parts }),
    });
    if (!commitRes.ok) throw new Error(`Box upload commit failed: ${commitRes.status}`);
    const result = await commitRes.json();
    const file = result.entries?.[0] || result;
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      isFolder: false,
      lastModified: file.modified_at,
    };
  }

  async getUserInfo(): Promise<{ displayName: string; email: string }> {
    const data = await this.apiGet('/users/me?fields=name,login');
    return {
      displayName: data.name,
      email: data.login,
    };
  }
}
