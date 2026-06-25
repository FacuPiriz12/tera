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

/** Size threshold: >= 500MB falls back to server-side */
export const CLIENT_TRANSFER_MAX_BYTES = 500 * 1024 * 1024;

const CHUNK = 10 * 1024 * 1024; // 10 MB upload chunks

// ─── Progress-tracked fetch ──────────────────────────────────────────────────

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

// ─── Download from source provider ──────────────────────────────────────────

async function downloadFile(
  provider: Provider,
  tokens: ProviderTokens,
  opts: ClientTransferOptions,
  onProgress: (pct: number) => void,
): Promise<{ data: ArrayBuffer; mimeType?: string }> {
  const { sourceFileId, sourceFilePath, fileSize, mimeType } = opts;

  switch (provider) {
    case 'google': {
      // Check if it's a Google Workspace document (needs export)
      const metaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${sourceFileId}?fields=mimeType`,
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
      );
      const meta = await metaRes.json();
      const gMime: string = meta.mimeType ?? '';

      let url: string;
      let exportMime: string | undefined;
      if (gMime.startsWith('application/vnd.google-apps.')) {
        const exportMap: Record<string, string> = {
          'application/vnd.google-apps.document':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.google-apps.spreadsheet':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.google-apps.presentation':
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };
        exportMime = exportMap[gMime] ?? 'application/pdf';
        url = `https://www.googleapis.com/drive/v3/files/${sourceFileId}/export?mimeType=${encodeURIComponent(exportMime)}`;
      } else {
        url = `https://www.googleapis.com/drive/v3/files/${sourceFileId}?alt=media`;
      }

      const data = await fetchBlob(
        url,
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
        onProgress,
        fileSize,
      );
      return { data, mimeType: exportMime ?? gMime ?? mimeType };
    }

    case 'dropbox': {
      const data = await fetchBlob(
        'https://content.dropboxapi.com/2/files/download',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Dropbox-API-Arg': JSON.stringify({ path: sourceFilePath }),
          },
        },
        onProgress,
        fileSize,
      );
      return { data };
    }

    case 'onedrive': {
      // Get the temporary direct download URL (no auth needed for the CDN URL)
      const metaRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${sourceFileId}?$select=@microsoft.graph.downloadUrl,file`,
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
      );
      if (!metaRes.ok) throw new Error(`OneDrive metadata failed: ${metaRes.status}`);
      const meta = await metaRes.json();
      const dlUrl: string = meta['@microsoft.graph.downloadUrl'];
      if (!dlUrl) throw new Error('OneDrive: no download URL returned');

      const data = await fetchBlob(dlUrl, {}, onProgress, fileSize);
      return { data, mimeType: meta.file?.mimeType ?? mimeType };
    }

    case 'box': {
      const data = await fetchBlob(
        `https://api.box.com/2.0/files/${sourceFileId}/content`,
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
          redirect: 'follow' as RequestRedirect,
        },
        onProgress,
        fileSize,
      );
      return { data };
    }

    case 's3': {
      if (!tokens.presignedDownloadUrl) throw new Error('S3: no presigned download URL');
      const data = await fetchBlob(tokens.presignedDownloadUrl, {}, onProgress, fileSize);
      return { data };
    }

    default:
      throw new Error(`Unsupported source provider: ${provider}`);
  }
}

// ─── Upload to destination provider ─────────────────────────────────────────

async function uploadFile(
  provider: Provider,
  tokens: ProviderTokens,
  data: ArrayBuffer,
  opts: ClientTransferOptions,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { fileName, destFolderId, destPath, destBucket, destPrefix, mimeType } = opts;
  const contentType = mimeType || 'application/octet-stream';
  const size = data.byteLength;

  switch (provider) {
    case 'google': {
      const parent = destFolderId && destFolderId !== 'root' ? destFolderId : undefined;
      const metadata: Record<string, any> = { name: fileName };
      if (parent) metadata.parents = [parent];

      // Always use resumable upload (handles any file size, shows progress)
      const sessionRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': contentType,
            'X-Upload-Content-Length': String(size),
          },
          body: JSON.stringify(metadata),
        },
      );
      if (!sessionRes.ok) throw new Error(`Google Drive: could not start upload session (${sessionRes.status})`);
      const uploadUrl = sessionRes.headers.get('Location');
      if (!uploadUrl) throw new Error('Google Drive: no upload URL in session response');

      let offset = 0;
      while (offset < size) {
        const end = Math.min(offset + CHUNK, size);
        const chunk = data.slice(offset, end);
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': contentType,
            'Content-Range': `bytes ${offset}-${end - 1}/${size}`,
          },
          body: chunk,
        });
        // 308 = Resume Incomplete (chunk accepted, continue); 200/201 = done
        if (res.status !== 308 && res.status !== 200 && res.status !== 201) {
          throw new Error(`Google Drive: chunk upload failed (${res.status})`);
        }
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
        // Simple upload
        const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({ path: dropboxDest, mode: 'add', autorename: true }),
          },
          body: data,
        });
        if (!res.ok) throw new Error(`Dropbox upload failed (${res.status})`);
        onProgress(100);
      } else {
        // Upload session for files > 150 MB
        const firstChunk = data.slice(0, CHUNK);
        const startRes = await fetch('https://content.dropboxapi.com/2/files/upload_session/start', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({ close: false }),
          },
          body: firstChunk,
        });
        if (!startRes.ok) throw new Error(`Dropbox: session start failed (${startRes.status})`);
        const { session_id } = await startRes.json();
        let offset = firstChunk.byteLength;
        onProgress(Math.round((offset / size) * 100));

        while (offset + CHUNK < size) {
          const chunk = data.slice(offset, offset + CHUNK);
          const res = await fetch('https://content.dropboxapi.com/2/files/upload_session/append_v2', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
              'Content-Type': 'application/octet-stream',
              'Dropbox-API-Arg': JSON.stringify({ cursor: { session_id, offset }, close: false }),
            },
            body: chunk,
          });
          if (!res.ok) throw new Error(`Dropbox: append failed (${res.status})`);
          offset += chunk.byteLength;
          onProgress(Math.round((offset / size) * 100));
        }

        // Finish
        const lastChunk = data.slice(offset);
        const finishRes = await fetch('https://content.dropboxapi.com/2/files/upload_session/finish', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({
              cursor: { session_id, offset },
              commit: { path: dropboxDest, mode: 'add', autorename: true },
            }),
          },
          body: lastChunk,
        });
        if (!finishRes.ok) throw new Error(`Dropbox: session finish failed (${finishRes.status})`);
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
        // Upload session (required for > 4 MB)
        const sessionRes = await fetch(
          `https://graph.microsoft.com/v1.0${parentPath}:/${encodeURIComponent(fileName)}:/createUploadSession`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item: { '@microsoft.graph.conflictBehavior': 'rename' } }),
          },
        );
        if (!sessionRes.ok) throw new Error(`OneDrive: session creation failed (${sessionRes.status})`);
        const { uploadUrl } = await sessionRes.json();

        // OneDrive requires chunks to be multiples of 320 KiB (327680 bytes)
        const onedriveChunk = Math.floor(CHUNK / 327680) * 327680; // nearest <= CHUNK multiple of 320 KiB
        let offset = 0;
        while (offset < size) {
          const end = Math.min(offset + onedriveChunk, size);
          const chunk = data.slice(offset, end);
          const res = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Length': String(chunk.byteLength),
              'Content-Range': `bytes ${offset}-${end - 1}/${size}`,
            },
            body: chunk,
          });
          if (res.status !== 200 && res.status !== 201 && res.status !== 202) {
            throw new Error(`OneDrive: chunk upload failed (${res.status})`);
          }
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
        // Chunked upload session
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
          // Box requires SHA1 digest of the chunk
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

        // Compute SHA1 of entire file for commit
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

// ─── Public API ──────────────────────────────────────────────────────────────

export async function performClientTransfer(
  sourceTokens: ProviderTokens,
  destTokens: ProviderTokens,
  opts: ClientTransferOptions,
  callbacks: ClientTransferCallbacks,
): Promise<void> {
  const { data, mimeType } = await downloadFile(
    opts.sourceProvider,
    sourceTokens,
    opts,
    callbacks.onDownloadProgress,
  );
  await uploadFile(
    opts.destProvider,
    destTokens,
    data,
    { ...opts, mimeType: mimeType ?? opts.mimeType },
    callbacks.onUploadProgress,
  );
}
