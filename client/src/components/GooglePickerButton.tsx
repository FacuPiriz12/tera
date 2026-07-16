// Google Picker mode: requires VITE_GOOGLE_PICKER_API_KEY (API key with Google Picker API enabled in GCP)
// and VITE_GOOGLE_DRIVE_MODE=picker in .env. Set VITE_GOOGLE_DRIVE_MODE=full to restore the tree browser.
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen, Loader2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface PickerResult {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
}

interface GooglePickerButtonProps {
  onSelect: (item: PickerResult) => void;
  /** 'folder' = only folders selectable (for destination). 'any' = files + folders (for source). */
  selectType?: 'folder' | 'any';
  label?: string;
  variant?: 'outline' | 'default';
  size?: 'sm' | 'default';
  className?: string;
}

const PICKER_API_KEY = import.meta.env.VITE_GOOGLE_PICKER_API_KEY as string | undefined;

let gapiLoaded = false;

async function loadGapiPicker(): Promise<void> {
  if (gapiLoaded) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('gapi-script');
    if (existing) {
      // Script is already in DOM — wait for gapi to be ready
      const poll = setInterval(() => {
        if (window.gapi?.load) { clearInterval(poll); resolve(); }
      }, 50);
      setTimeout(() => { clearInterval(poll); reject(new Error('gapi timeout')); }, 5000);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gapi-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.head.appendChild(script);
  });
  await new Promise<void>(resolve => window.gapi.load('picker', resolve));
  gapiLoaded = true;
}

export default function GooglePickerButton({
  onSelect,
  selectType = 'any',
  label,
  variant = 'outline',
  size = 'sm',
  className = '',
}: GooglePickerButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiRequest(
        'GET',
        '/api/client-transfer/tokens?sourceProvider=google&destProvider=google',
      );
      const data = await res.json();
      const token: string | undefined = data?.google?.accessToken;
      if (!token) throw new Error('No se pudo obtener el token de Google.');

      await loadGapiPicker();

      const view = selectType === 'folder'
        ? new window.google.picker.DocsView()
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true)
            .setMimeTypes('application/vnd.google-apps.folder')
        : new window.google.picker.DocsView()
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true);

      const builder = new window.google.picker.PickerBuilder()
        .setOAuthToken(token)
        .addView(view);
      if (PICKER_API_KEY) builder.setDeveloperKey(PICKER_API_KEY);
      builder
        .setCallback((result: any) => {
          if (result.action === window.google.picker.Action.PICKED) {
            const doc = result.docs[0];
            onSelect({
              id: doc.id,
              name: doc.name,
              mimeType: doc.mimeType,
              isFolder: doc.mimeType === 'application/vnd.google-apps.folder',
            });
          }
        })
        .build()
        .setVisible(true);
    } catch (err: any) {
      setError(err.message || 'Error al abrir Google Picker.');
    } finally {
      setLoading(false);
    }
  }, [onSelect, selectType]);

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={openPicker}
        disabled={loading}
        className={`gap-2 ${className}`}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <FolderOpen className="w-4 h-4" />
        }
        {label ?? (selectType === 'folder'
          ? 'Seleccionar destino en Drive'
          : 'Seleccionar desde Google Drive'
        )}
      </Button>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
