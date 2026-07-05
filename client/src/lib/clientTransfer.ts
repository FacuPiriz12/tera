// clientTransfer.ts — browser-side download from source + upload to destination
// Data never passes through the Render server; only tokens are fetched from it.

export type Provider = 'google' | 'dropbox' | 'onedrive' | 'box' | 's3';

export interface ProviderTokens {
  accessToken?: string;
  presignedDownloadUrl?: string;
  presignedUploadUrl?: string;
}

export interface ClientTransferOptions {
  sourceProvider: Provider;
  destProvider: Provider;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  // Source
  sourceFileId?: string;     // Google, OneDrive, Box
  sourceFilePath?: string;   // Dropbox (full path like /folder/file.txt)
  sourceBucket?: string;     // S3
  // Destination
  destFolderId?: string;     // Google, OneDrive, Box
  destPath?: string;         // Dropbox path (e.g. '' for root, '/Photos' for subfolder)
  destBucket?: string;       // S3
  destPrefix?: string;       // S3 key prefix
}

export interface ClientTransferCallbacks {
  onDownloadProgress: (pct: number) => void;
  onUploadProgress: (pct: number) => void;
}

/** Size threshold: Box destination falls back to server-side above this */
export const CLIENT_TRANSFER_MAX_BYTES = 500 * 1024 * 1024;

const CHUNK = 10 * 1024 * 1024; // 10 MB chunks
// OneDrive requires chunks to be multiples of 320 KiB (327680 bytes)
const ONEDRIVE_CHUNK = Math.floor(CHUNK / 327680) * 327680;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchBlob(
  url: string,
  init: RequestInit,
  onProgress?: (pct: number) => void,
  knownSize?: number,
): Promise<ArrayBuffer> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Download failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const contentLength = knownSize || parseInt(res.headers.get('Content-Length') ?? '0', 10);

  if (!res.body || !contentLength) {
    const buf = await res.arrayBuffer();
    onProgress?.(100);
    return buf;
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.(Math.min(99, Math.round((received / contentLength) * 100)));
  }

  const out = new Uint8Array(received);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  onProgress?.(100);
  return out.buffer;
}

/** Download a single Range chunk from a URL */
async function fetchChunk(url: string, init: RequestInit, start: number, end: number): Promise<ArrayBuffer> {
  const existingHeaders = (init.headers ?? {}) as Record<string, string>;
  const headers: Record<string, string> = {
    ...existingHeaders,
    Range: `bytes=${start}-${end}`,
  };
  const res = await fetch(url, { ...init, headers });
  // 206 = Partial Content (normal), 200 = server returned full body anyway
  if (res.status !== 206 && res.status !== 200) {
    const text = await res.text().catch(() => '');
    throw new Error(`Range download failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.arrayBuffer();
}

// ─── Upload session helpers ──────────────────────────────────────────────────

interface GoogleSession { uploadUrl: string }
interface DropboxSession { sessionId: string; offset: number }
interface OneDriveSession { uploadUrl: string }

async function openGoogleUploadSession(
  accessToken: string,
  fileName: string,
  totalSize: number,
  contentType: string,
  destFolderId?: string,
): Promise<GoogleSession> {
  const parent = destFolderId && destFolderId !== 'root' ? destFolderId : undefined;
  const metadata: Record<string, any> = { name: fileName };
  if (parent) metadata.parents = [parent];

  const sessionRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': contentType,
        'X-Upload-Content-Length': String(totalSize),
      },
      body: JSON.stringify(metadata),
    },
  );
  if (!sessionRes.ok) throw new Error(`Google Drive: could not start upload session (${sessionRes.status})`);
  const uploadUrl = sessionRes.headers.get('Location');
  if (!uploadUrl) throw new Error('Google Drive: no upload URL in session response');
  return { uploadUrl };
}

async function uploadGoogleChunk(
  session: GoogleSession,
  chunk: ArrayBuffer,
  offset: number,
  totalSize: number,
  contentType: string,
): Promise<void> {
  const end = offset + chunk.byteLength - 1;
  const res = await fetch(session.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Content-Range': `bytes ${offset}-${end}/${totalSize}`,
    },
    body: chunk,
  });
  // 308 = Resume Incomplete (chunk accepted, continue); 200/201 = done
  if (res.status !== 308 && res.status !== 200 && res.status !== 201) {
    throw new Error(`Google Drive: chunk upload failed (${res.status})`);
  }
}

async function openDropboxUploadSession(
  accessToken: string,
  firstChunk: ArrayBuffer,
): Promise<DropboxSession> {
  const startRes = await fetch('https://content.dropboxapi.com/2/files/upload_session/start', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ close: false }),
    },
    body: firstChunk,
  });
  if (!startRes.ok) throw new Error(`Dropbox: session start failed (${startRes.status})`);
  const { session_id } = await startRes.json();
  return { sessionId: session_id, offset: firstChunk.byteLength };
}

async function appendDropboxChunk(
  accessToken: string,
  session: DropboxSession,
  chunk: ArrayBuffer,
): Promise<void> {
  const res = await fetch('https://content.dropboxapi.com/2/files/upload_session/append_v2', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        cursor: { session_id: session.sessionId, offset: session.offset },
        close: false,
      }),
    },
    body: chunk,
  });
  if (!res.ok) throw new Error(`Dropbox: append failed (${res.status})`);
  session.offset += chunk.byteLength;
}

async function finishDropboxUploadSession(
  accessToken: string,
  session: DropboxSession,
  lastChunk: ArrayBuffer,
  destPath: string,
): Promise<void> {
  const finishRes = await fetch('https://content.dropboxapi.com/2/files/upload_session/finish', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        cursor: { session_id: session.sessionId, offset: session.offset },
        commit: { path: destPath, mode: 'add', autorename: true },
      }),
    },
    body: lastChunk,
  });
  if (!finishRes.ok) throw new Error(`Dropbox: session finish failed (${finishRes.status})`);
}

async function openOneDriveUploadSession(
  accessToken: string,
  fileName: string,
  destFolderId?: string,
): Promise<OneDriveSession> {
  const parentPath = destFolderId ? `/me/drive/items/${destFolderId}` : '/me/drive/root';
  const sessionRes = await fetch(
    `https://graph.microsoft.com/v1.0${parentPath}:/${encodeURIComponent(fileName)}:/createUploadSession`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ item: { '@microsoft.graph.conflictBehavior': 'rename' } }),
    },
  );
  if (!sessionRes.ok) throw new Error(`OneDrive: session creation failed (${sessionRes.status})`);
  const { uploadUrl } = await sessionRes.json();
  return { uploadUrl };
}

async function uploadOneDriveChunk(
  session: OneDriveSession,
  chunk: ArrayBuffer,
  offset: number,
  totalSize: number,
): Promise<void> {
  const end = offset + chunk.byteLength - 1;
  const res = await fetch(session.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Length': String(chunk.byteLength),
      'Content-Range': `bytes ${offset}-${end}/${totalSize}`,
    },
    body: chunk,
  });
  if (res.status !== 200 && res.status !== 201 && res.status !== 202) {
    throw new Error(`OneDrive: chunk upload failed (${res.status})`);
  }
}

async function uploadDropboxSimple(accessToken: string, data: ArrayBuffer, destPath: string): Promise<void> {
  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path: destPath, mode: 'add', autorename: true }),
    },
    body: data,
  });
  if (!res.ok) throw new Error(`Dropbox upload failed (${res.status})`);
}

// ─── Chunk download per provider ─────────────────────────────────────────────

async function downloadChunk(
  provider: Provider,
  tokens: ProviderTokens,
  opts: ClientTransferOptions,
  start: number,
  end: number,
  onedriveCdnUrl?: string,
): Promise<ArrayBuffer> {
  switch (provider) {
    case 'google': {
      return fetchChunk(
        `https://www.googleapis.com/drive/v3/files/${opts.sourceFileId}?alt=media`,
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
        start,
        end,
      );
    }
    case 'dropbox': {
      // Dropbox download uses POST; Range goes as a header
      const res = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path: opts.sourceFilePath }),
          Range: `bytes=${start}-${end}`,
        },
      });
      if (res.status !== 206 && res.status !== 200) {
        const text = await res.text().catch(() => '');
        throw new Error(`Dropbox chunk download failed (${res.status}): ${text.slice(0, 200)}`);
      }
      return res.arrayBuffer();
    }
    case 'onedrive': {
      if (!onedriveCdnUrl) throw new Error('OneDrive: CDN URL not initialized');
      return fetchChunk(onedriveCdnUrl, {}, start, end);
    }
    case 'box': {
      return fetchChunk(
        `https://api.box.com/2.0/files/${opts.sourceFileId}/content`,
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
          redirect: 'follow' as RequestRedirect,
        },
        start,
        end,
      );
    }
    case 's3': {
      if (!tokens.presignedDownloadUrl) throw new Error('S3: no presigned download URL');
      return fetchChunk(tokens.presignedDownloadUrl, {}, start, end);
    }
    default:
      throw new Error(`Unsupported source provider for chunk download: ${provider}`);
  }
}

/** Download entire file in one shot (fallback for Workspace docs, Box source, unknown size). */
async function downloadEntireFile(
  provider: Provider,
  tokens: ProviderTokens,
  opts: ClientTransferOptions,
  onedriveCdnUrl: string | undefined,
  onProgress: (pct: number) => void,
  knownSize: number,
): Promise<ArrayBuffer> {
  switch (provider) {
    case 'google': {
      return fetchBlob(
        `https://www.googleapis.com/drive/v3/files/${opts.sourceFileId}?alt=media`,
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
        onProgress,
        knownSize || undefined,
      );
    }
    case 'dropbox': {
      return fetchBlob(
        'https://content.dropboxapi.com/2/files/download',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Dropbox-API-Arg': JSON.stringify({ path: opts.sourceFilePath }),
          },
        },
        onProgress,
        knownSize || undefined,
      );
    }
    case 'onedrive': {
      if (!onedriveCdnUrl) throw new Error('OneDrive: CDN URL not initialized');
      return fetchBlob(onedriveCdnUrl, {}, onProgress, knownSize || undefined);
    }
    case 'box': {
      return fetchBlob(
        `https://api.box.com/2.0/files/${opts.sourceFileId}/content`,
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
          redirect: 'follow' as RequestRedirect,
        },
        onProgress,
        knownSize || undefined,
      );
    }
    case 's3': {
      if (!tokens.presignedDownloadUrl) throw new Error('S3: no presigned download URL');
      return fetchBlob(tokens.presignedDownloadUrl, {}, onProgress, knownSize || undefined);
    }
    default:
      throw new Error(`Unsupported source provider: ${provider}`);
  }
}

// ─── Upload full buffer (used by Box, and as fallback) ───────────────────────

async function uploadFile(
  provider: Provider,
  tokens: ProviderTokens,
  data: ArrayBuffer,
  opts: ClientTransferOptions,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { fileName, destFolderId, destPath, mimeType } = opts;
  const contentType = mimeType || 'application/octet-stream';
  const size = data.byteLength;

  switch (provider) {
    case 'google': {
      const session = await openGoogleUploadSession(
        tokens.accessToken!,
        fileName,
        size,
        contentType,
        destFolderId,
      );
      let offset = 0;
      while (offset < size) {
        const end = Math.min(offset + CHUNK, size);
        await uploadGoogleChunk(session, data.slice(offset, end), offset, size, contentType);
        offset = end;
        onProgress(Math.round((offset / size) * 100));
      }
      break;
    }

    case 'dropbox': {
      const dropboxDest = (() => {
        const base = (destPath ?? '').replace(/\/$/, '');
        return base ? `${base}/${fileName}` : `/${fileName}`;
      })();

      if (size <= 150 * 1024 * 1024) {
        await uploadDropboxSimple(tokens.accessToken!, data, dropboxDest);
        onProgress(100);
      } else {
        const firstChunk = data.slice(0, CHUNK);
        const session = await openDropboxUploadSession(tokens.accessToken!, firstChunk);
        onProgress(Math.round((session.offset / size) * 100));

        while (session.offset + CHUNK < size) {
          const chunk = data.slice(session.offset, session.offset + CHUNK);
          await appendDropboxChunk(tokens.accessToken!, session, chunk);
          onProgress(Math.round((session.offset / size) * 100));
        }

        const lastChunk = data.slice(session.offset);
        await finishDropboxUploadSession(tokens.accessToken!, session, lastChunk, dropboxDest);
        onProgress(100);
      }
      break;
    }

    case 'onedrive': {
      const parentPath = destFolderId ? `/me/drive/items/${destFolderId}` : '/me/drive/root';
      if (size <= 4 * 1024 * 1024) {
        const res = await fetch(
          `https://graph.microsoft.com/v1.0${parentPath}:/${encodeURIComponent(fileName)}:/content`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
              'Content-Type': contentType,
            },
            body: data,
          },
        );
        if (!res.ok) throw new Error(`OneDrive upload failed (${res.status})`);
        onProgress(100);
      } else {
        const session = await openOneDriveUploadSession(tokens.accessToken!, fileName, destFolderId);
        let offset = 0;
        while (offset < size) {
          const end = Math.min(offset + ONEDRIVE_CHUNK, size);
          await uploadOneDriveChunk(session, data.slice(offset, end), offset, size);
          offset = end;
          onProgress(Math.round((offset / size) * 100));
        }
      }
      break;
    }

    case 'box': {
      const parentId = destFolderId || '0';

      if (size <= 20 * 1024 * 1024) {
        const fd = new FormData();
        fd.append('attributes', JSON.stringify({ name: fileName, parent: { id: parentId } }));
        fd.append('file', new Blob([data], { type: contentType }), fileName);
        const res = await fetch('https://upload.box.com/api/2.0/files/content', {
          method: 'POST',
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
          body: fd,
        });
        if (!res.ok) throw new Error(`Box upload failed (${res.status})`);
        onProgress(100);
      } else {
        const sessionRes = await fetch('https://upload.box.com/api/2.0/files/upload_sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ folder_id: parentId, file_name: fileName, file_size: size }),
        });
        if (!sessionRes.ok) throw new Error(`Box: upload session failed (${sessionRes.status})`);
        const session = await sessionRes.json();
        const sessionId: string = session.id;
        const partSize: number = session.part_size;

        const parts: any[] = [];
        let offset = 0;

        while (offset < size) {
          const end = Math.min(offset + partSize, size);
          const chunk = data.slice(offset, end);
          const hashBuf = await crypto.subtle.digest('SHA-1', chunk);
          const sha1b64 = btoa(String.fromCharCode(...new Uint8Array(hashBuf)));

          const partRes = await fetch(
            `https://upload.box.com/api/2.0/files/upload_sessions/${sessionId}`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                'Content-Type': 'application/octet-stream',
                'Content-Range': `bytes ${offset}-${end - 1}/${size}`,
                Digest: `sha=${sha1b64}`,
              },
              body: chunk,
            },
          );
          if (!partRes.ok) throw new Error(`Box: chunk upload failed (${partRes.status})`);
          parts.push((await partRes.json()).part);
          offset = end;
          onProgress(Math.round((offset / size) * 100));
        }

        const fullHashBuf = await crypto.subtle.digest('SHA-1', data);
        const fullSha1 = btoa(String.fromCharCode(...new Uint8Array(fullHashBuf)));

        const commitRes = await fetch(
          `https://upload.box.com/api/2.0/files/upload_sessions/${sessionId}/commit`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
              'Content-Type': 'application/json',
              Digest: `sha=${fullSha1}`,
            },
            body: JSON.stringify({ parts }),
          },
        );
        if (!commitRes.ok) throw new Error(`Box: commit failed (${commitRes.status})`);
        onProgress(100);
      }
      break;
    }

    case 's3': {
      if (!tokens.presignedUploadUrl) throw new Error('S3: no presigned upload URL');
      const res = await fetch(tokens.presignedUploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: data,
      });
      if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
      onProgress(100);
      break;
    }

    default:
      throw new Error(`Unsupported dest provider: ${provider}`);
  }
}

// ─── Streaming transfer pipeline ─────────────────────────────────────────────

async function streamingTransfer(
  opts: ClientTransferOptions,
  sourceTokens: ProviderTokens,
  destTokens: ProviderTokens,
  onDownloadProgress: (pct: number) => void,
  onUploadProgress: (pct: number) => void,
): Promise<void> {
  const { sourceProvider, destProvider, fileName, fileSize, mimeType } = opts;
  const totalSize = fileSize ?? 0;
  const contentType = mimeType || 'application/octet-stream';

  // ── Prepare source metadata ─────────────────────────────────────────────────

  let googleIsWorkspace = false;
  let googleExportMime: string | undefined;
  let googleExportUrl: string | undefined;
  let onedriveCdnUrl: string | undefined;

  if (sourceProvider === 'google') {
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${opts.sourceFileId}?fields=mimeType`,
      { headers: { Authorization: `Bearer ${sourceTokens.accessToken}` } },
    );
    const meta = await metaRes.json();
    const gMime: string = meta.mimeType ?? '';
    if (gMime.startsWith('application/vnd.google-apps.')) {
      googleIsWorkspace = true;
      const exportMap: Record<string, string> = {
        'application/vnd.google-apps.document':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.google-apps.spreadsheet':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.google-apps.presentation':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      };
      googleExportMime = exportMap[gMime] ?? 'application/pdf';
      googleExportUrl = `https://www.googleapis.com/drive/v3/files/${opts.sourceFileId}/export?mimeType=${encodeURIComponent(googleExportMime)}`;
    }
  }

  if (sourceProvider === 'onedrive') {
    const metaRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${opts.sourceFileId}?$select=@microsoft.graph.downloadUrl,file`,
      { headers: { Authorization: `Bearer ${sourceTokens.accessToken}` } },
    );
    if (!metaRes.ok) throw new Error(`OneDrive metadata failed: ${metaRes.status}`);
    const meta = await metaRes.json();
    onedriveCdnUrl = meta['@microsoft.graph.downloadUrl'];
    if (!onedriveCdnUrl) throw new Error('OneDrive: no download URL returned');
  }

  // ── Google Workspace docs: export cannot use Range requests ────────────────
  if (sourceProvider === 'google' && googleIsWorkspace) {
    const data = await fetchBlob(
      googleExportUrl!,
      { headers: { Authorization: `Bearer ${sourceTokens.accessToken}` } },
      onDownloadProgress,
      totalSize || undefined,
    );
    onDownloadProgress(100);
    await uploadFile(
      destProvider,
      destTokens,
      data,
      { ...opts, mimeType: googleExportMime ?? contentType },
      onUploadProgress,
    );
    return;
  }

  // ── Box destination: full download then existing Box upload ─────────────────
  if (destProvider === 'box') {
    const data = await downloadEntireFile(sourceProvider, sourceTokens, opts, onedriveCdnUrl, onDownloadProgress, totalSize);
    await uploadFile(destProvider, destTokens, data, opts, onUploadProgress);
    return;
  }

  // ── S3 destination: stream download, accumulate, single PUT ────────────────
  if (destProvider === 's3') {
    if (!destTokens.presignedUploadUrl) throw new Error('S3: no presigned upload URL');

    if (totalSize > 0) {
      const collectedChunks: ArrayBuffer[] = [];
      let downloaded = 0;
      let offset = 0;
      while (offset < totalSize) {
        const end = Math.min(offset + CHUNK, totalSize) - 1;
        const chunk = await downloadChunk(sourceProvider, sourceTokens, opts, offset, end, onedriveCdnUrl);
        collectedChunks.push(chunk);
        downloaded += chunk.byteLength;
        onDownloadProgress(Math.min(99, Math.round((downloaded / totalSize) * 100)));
        offset += chunk.byteLength;
      }
      onDownloadProgress(100);

      const totalBytes = collectedChunks.reduce((s, c) => s + c.byteLength, 0);
      const combined = new Uint8Array(totalBytes);
      let off = 0;
      for (const c of collectedChunks) { combined.set(new Uint8Array(c), off); off += c.byteLength; }

      const res = await fetch(destTokens.presignedUploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: combined.buffer,
      });
      if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
    } else {
      // Unknown size — download all at once
      const data = await downloadEntireFile(sourceProvider, sourceTokens, opts, onedriveCdnUrl, onDownloadProgress, 0);
      onDownloadProgress(100);
      const res = await fetch(destTokens.presignedUploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: data,
      });
      if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
    }
    onUploadProgress(100);
    return;
  }

  // ── No size info: fallback to full download ─────────────────────────────────
  if (totalSize === 0) {
    const data = await downloadEntireFile(sourceProvider, sourceTokens, opts, onedriveCdnUrl, onDownloadProgress, 0);
    await uploadFile(destProvider, destTokens, data, opts, onUploadProgress);
    return;
  }

  // ── True streaming pipeline: Google / Dropbox / OneDrive destination ────────

  const dropboxDest = (() => {
    if (destProvider !== 'dropbox') return '';
    const base = (opts.destPath ?? '').replace(/\/$/, '');
    return base ? `${base}/${fileName}` : `/${fileName}`;
  })();

  const dropboxUseSession = destProvider === 'dropbox' && totalSize > 150 * 1024 * 1024;

  // Dropbox small files: buffer all chunks then simple upload
  if (destProvider === 'dropbox' && !dropboxUseSession) {
    const collectedChunks: ArrayBuffer[] = [];
    let downloaded = 0;
    let offset = 0;
    while (offset < totalSize) {
      const end = Math.min(offset + CHUNK, totalSize) - 1;
      const chunk = await downloadChunk(sourceProvider, sourceTokens, opts, offset, end, onedriveCdnUrl);
      collectedChunks.push(chunk);
      downloaded += chunk.byteLength;
      onDownloadProgress(Math.min(99, Math.round((downloaded / totalSize) * 100)));
      offset += chunk.byteLength;
    }
    onDownloadProgress(100);
    const totalBytes = collectedChunks.reduce((s, c) => s + c.byteLength, 0);
    const combined = new Uint8Array(totalBytes);
    let off = 0;
    for (const c of collectedChunks) { combined.set(new Uint8Array(c), off); off += c.byteLength; }
    await uploadDropboxSimple(destTokens.accessToken!, combined.buffer, dropboxDest);
    onUploadProgress(100);
    return;
  }

  // Open upload session for Google or OneDrive
  let googleSession: GoogleSession | undefined;
  let oneDriveSession: OneDriveSession | undefined;
  let dropboxSession: DropboxSession | undefined;

  if (destProvider === 'google') {
    googleSession = await openGoogleUploadSession(
      destTokens.accessToken!,
      fileName,
      totalSize,
      contentType,
      opts.destFolderId,
    );
  } else if (destProvider === 'onedrive') {
    oneDriveSession = await openOneDriveUploadSession(
      destTokens.accessToken!,
      fileName,
      opts.destFolderId,
    );
  }

  let offset = 0;
  let isFirstDropboxChunk = true;

  while (offset < totalSize) {
    // Download one source chunk (always CHUNK = 10 MB, except last)
    const srcEnd = Math.min(offset + CHUNK, totalSize) - 1;
    const chunk = await downloadChunk(sourceProvider, sourceTokens, opts, offset, srcEnd, onedriveCdnUrl);
    onDownloadProgress(Math.min(99, Math.round(((offset + chunk.byteLength) / totalSize) * 100)));

    const isLastChunk = offset + chunk.byteLength >= totalSize;

    if (destProvider === 'google') {
      await uploadGoogleChunk(googleSession!, chunk, offset, totalSize, contentType);
      onUploadProgress(Math.min(99, Math.round(((offset + chunk.byteLength) / totalSize) * 100)));

    } else if (destProvider === 'dropbox') {
      // Large file session path
      if (isFirstDropboxChunk) {
        dropboxSession = await openDropboxUploadSession(destTokens.accessToken!, chunk);
        onUploadProgress(Math.min(99, Math.round((dropboxSession.offset / totalSize) * 100)));
        isFirstDropboxChunk = false;
      } else if (isLastChunk) {
        await finishDropboxUploadSession(destTokens.accessToken!, dropboxSession!, chunk, dropboxDest);
        onUploadProgress(100);
      } else {
        await appendDropboxChunk(destTokens.accessToken!, dropboxSession!, chunk);
        onUploadProgress(Math.min(99, Math.round((dropboxSession!.offset / totalSize) * 100)));
      }

    } else if (destProvider === 'onedrive') {
      // Slice each downloaded chunk into OneDrive-aligned sub-chunks
      let chunkOffset = 0;
      while (chunkOffset < chunk.byteLength) {
        const sliceEnd = Math.min(chunkOffset + ONEDRIVE_CHUNK, chunk.byteLength);
        const slice = chunk.slice(chunkOffset, sliceEnd);
        await uploadOneDriveChunk(oneDriveSession!, slice, offset + chunkOffset, totalSize);
        chunkOffset = sliceEnd;
      }
      onUploadProgress(Math.min(99, Math.round(((offset + chunk.byteLength) / totalSize) * 100)));
    }

    offset += chunk.byteLength;
  }

  // For Dropbox large files, if the file had exactly one chunk it went through
  // the "isFirstDropboxChunk" branch only; we need to finalize it.
  if (destProvider === 'dropbox' && dropboxUseSession && dropboxSession && isFirstDropboxChunk === false) {
    // Already finalized in last-chunk branch above. Nothing to do.
  }

  onDownloadProgress(100);
  onUploadProgress(100);
}

// ─── Folder transfer support ─────────────────────────────────────────────────

export interface FolderItem {
  id: string;
  name: string;
  isFolder: boolean;
  size?: number;
  mimeType?: string;
}

/**
 * List contents of a remote folder using server-side listing endpoints (metadata only).
 * Uses plain fetch with credentials so the session cookie is sent.
 */
export async function listFolderContents(
  provider: Provider,
  folderId?: string,
  folderPath?: string,
  bucket?: string,
  prefix?: string,
): Promise<FolderItem[]> {
  let url: string;
  switch (provider) {
    case 'google':
      url = `/api/google/files?folderId=${encodeURIComponent(folderId || 'root')}`;
      break;
    case 'dropbox':
      url = `/api/dropbox/files?path=${encodeURIComponent(folderPath || '')}`;
      break;
    case 'onedrive':
      url = `/api/onedrive/files?folderId=${encodeURIComponent(folderId || 'root')}`;
      break;
    case 'box':
      url = `/api/box/files?folderId=${encodeURIComponent(folderId || '0')}`;
      break;
    case 's3':
      url = `/api/s3/files?bucket=${encodeURIComponent(bucket || '')}&prefix=${encodeURIComponent(prefix || '')}`;
      break;
    default:
      throw new Error(`Unsupported provider for listing: ${provider}`);
  }

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Folder listing failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Create a remote folder at the destination via direct provider API calls.
 * Returns the new folder's ID (or path string for Dropbox/S3).
 */
export async function createRemoteFolder(
  provider: Provider,
  tokens: ProviderTokens,
  name: string,
  parentId?: string,
  parentPath?: string,
  bucket?: string,
  prefix?: string,
): Promise<string> {
  switch (provider) {
    case 'google': {
      const body: Record<string, any> = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
      };
      if (parentId && parentId !== 'root') body.parents = [parentId];
      const res = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Google: folder creation failed (${res.status})`);
      const data = await res.json();
      return data.id;
    }

    case 'dropbox': {
      const folderPath = (() => {
        const base = (parentPath ?? '').replace(/\/$/, '');
        return base ? `${base}/${name}` : `/${name}`;
      })();
      const res = await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: folderPath, autorename: true }),
      });
      if (!res.ok) throw new Error(`Dropbox: folder creation failed (${res.status})`);
      const data = await res.json();
      return data.metadata?.path_lower ?? folderPath;
    }

    case 'onedrive': {
      const parentRef = parentId ? `/me/drive/items/${parentId}` : '/me/drive/root';
      const res = await fetch(`https://graph.microsoft.com/v1.0${parentRef}/children`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename',
        }),
      });
      if (!res.ok) throw new Error(`OneDrive: folder creation failed (${res.status})`);
      const data = await res.json();
      return data.id;
    }

    case 'box': {
      const res = await fetch('https://api.box.com/2.0/folders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, parent: { id: parentId || '0' } }),
      });
      if (res.status === 409) {
        // Folder already exists — extract existing folder ID from conflict info
        const data = await res.json();
        const existingId = data?.context_info?.conflicts?.[0]?.id;
        if (existingId) return existingId;
        throw new Error('Box: folder already exists but could not get existing ID');
      }
      if (!res.ok) throw new Error(`Box: folder creation failed (${res.status})`);
      const data = await res.json();
      return data.id;
    }

    case 's3': {
      // S3 has no real folders — return the new prefix string
      const base = (prefix ?? '').replace(/\/$/, '');
      return base ? `${base}/${name}/` : `${name}/`;
    }

    default:
      throw new Error(`Unsupported provider for folder creation: ${provider}`);
  }
}

/** Count total leaf files in a folder tree recursively (for progress tracking). */
async function countFilesRecursive(
  provider: Provider,
  folderId?: string,
  folderPath?: string,
  bucket?: string,
  prefix?: string,
): Promise<number> {
  const items = await listFolderContents(provider, folderId, folderPath, bucket, prefix);
  let count = 0;
  for (const item of items) {
    if (item.isFolder) {
      const childId = (provider === 'dropbox' || provider === 's3') ? undefined : item.id;
      const childPath = provider === 'dropbox' ? item.id : undefined;
      const childPrefix = provider === 's3' ? item.id : undefined;
      count += await countFilesRecursive(provider, childId, childPath ?? childPrefix, bucket, childPrefix);
    } else {
      count++;
    }
  }
  return count;
}

/**
 * Transfer an entire folder client-side (browser ↔ cloud, no server for file data).
 * Lists source via server metadata endpoints; creates folders and transfers files directly.
 */
interface TokenRefresher {
  fn: () => Promise<{ sourceTokens: ProviderTokens; destTokens: ProviderTokens }>;
  fetchedAt: number;
}

export async function transferFolderClientSide(
  sourceProvider: Provider,
  destProvider: Provider,
  sourceTokens: ProviderTokens,
  destTokens: ProviderTokens,
  /** Google/OneDrive/Box/S3: folder item ID; S3: use sourceFolderPath instead */
  sourceFolderId: string | undefined,
  /** Dropbox: full path string; S3: key prefix string */
  sourceFolderPath: string | undefined,
  /** Google/OneDrive/Box: parent folder ID at destination */
  destParentId: string | undefined,
  /** Dropbox: parent path at destination; S3: parent prefix at destination */
  destParentPath: string | undefined,
  folderName: string,
  sourceBucket: string | undefined,
  destBucket: string | undefined,
  onProgress: (completed: number, total: number) => void,
  /** Internal: shared mutable counter across recursive calls */
  _counter?: { completed: number; total: number },
  /** Optional token refresher — re-fetches tokens if >45 min have passed */
  _refresher?: TokenRefresher,
): Promise<void> {
  const isRoot = !_counter;

  if (isRoot) {
    // Count all leaf files first so we can report accurate progress
    const sourcePrefix = sourceProvider === 's3' ? (sourceFolderPath || sourceFolderId) : undefined;
    const total = await countFilesRecursive(
      sourceProvider,
      sourceFolderId,
      sourceFolderPath,
      sourceBucket,
      sourcePrefix,
    );
    _counter = { completed: 0, total };
    onProgress(0, total);
  }

  // List source folder contents
  const sourcePrefix = sourceProvider === 's3' ? (sourceFolderPath || sourceFolderId) : undefined;
  const items = await listFolderContents(
    sourceProvider,
    sourceFolderId,
    sourceFolderPath,
    sourceBucket,
    sourcePrefix,
  );

  // Create the destination folder
  const newDestId = await createRemoteFolder(
    destProvider,
    destTokens,
    folderName,
    destParentId,
    destParentPath,
    destBucket,
    destParentPath,
  );

  // Determine new dest path/prefix for recursive calls
  const newDestPath: string | undefined = (() => {
    if (destProvider === 'dropbox') return typeof newDestId === 'string' ? newDestId : destParentPath;
    if (destProvider === 's3') return newDestId; // already a prefix string
    return undefined;
  })();

  // Transfer each item in the folder
  for (const item of items) {
    if (item.isFolder) {
      const childId = (sourceProvider === 'dropbox' || sourceProvider === 's3') ? undefined : item.id;
      const childPath = sourceProvider === 'dropbox' ? item.id : undefined;
      const childPrefix = sourceProvider === 's3' ? item.id : undefined;

      await transferFolderClientSide(
        sourceProvider,
        destProvider,
        sourceTokens,
        destTokens,
        childId,
        childPath ?? childPrefix,
        destProvider === 's3' || destProvider === 'dropbox' ? undefined : newDestId,
        newDestPath,
        item.name,
        sourceBucket,
        destBucket,
        onProgress,
        _counter,
        _refresher,
      );
    } else {
      // Refresh tokens if >45 min since last fetch (prevents expiry on large folders)
      if (_refresher && Date.now() - _refresher.fetchedAt > 45 * 60 * 1000) {
        const refreshed = await _refresher.fn();
        sourceTokens.accessToken = refreshed.sourceTokens.accessToken;
        destTokens.accessToken = refreshed.destTokens.accessToken;
        _refresher.fetchedAt = Date.now();
      }

      // Build per-file transfer options
      const sourceFilePath = (() => {
        if (sourceProvider === 'dropbox') return item.id; // Dropbox item.id is the full path
        return undefined;
      })();

      const fileOpts: ClientTransferOptions = {
        sourceProvider,
        destProvider,
        fileName: item.name,
        fileSize: item.size,
        mimeType: item.mimeType,
        sourceFileId: ['google', 'onedrive', 'box', 's3'].includes(sourceProvider) ? item.id : undefined,
        sourceFilePath,
        sourceBucket,
        destFolderId: ['google', 'onedrive', 'box'].includes(destProvider) ? newDestId : undefined,
        destPath: destProvider === 'dropbox' ? (newDestPath || '') : undefined,
        destBucket,
        destPrefix: destProvider === 's3' ? newDestPath : undefined,
      };

      await streamingTransfer(
        fileOpts,
        sourceTokens,
        destTokens,
        () => {},
        () => {},
      );

      _counter!.completed++;
      onProgress(_counter!.completed, _counter!.total);
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function performClientTransfer(
  sourceTokens: ProviderTokens,
  destTokens: ProviderTokens,
  opts: ClientTransferOptions,
  callbacks: ClientTransferCallbacks,
): Promise<void> {
  await streamingTransfer(
    opts,
    sourceTokens,
    destTokens,
    callbacks.onDownloadProgress,
    callbacks.onUploadProgress,
  );
}
