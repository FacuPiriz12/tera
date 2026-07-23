import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Folder, FolderOpen, ChevronRight, Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';

export interface FolderSelection {
  id: string;
  name: string;
}

interface FolderPickerProps {
  provider: string;
  value: FolderSelection | null;
  onChange: (folder: FolderSelection) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface FolderItem {
  id: string;
  name: string;
}

const PROVIDER_ROOTS: Record<string, FolderItem> = {
  google:   { id: 'root', name: 'Mi Drive' },
  dropbox:  { id: '/', name: 'Dropbox' },
  onedrive: { id: '', name: 'OneDrive' },
  box:      { id: '0', name: 'Box' },
  s3:       { id: '', name: 'Amazon S3' },
};

const PROVIDER_LABELS: Record<string, string> = {
  google:   'Google Drive',
  dropbox:  'Dropbox',
  onedrive: 'OneDrive',
  box:      'Box',
  s3:       'Amazon S3',
};

async function fetchFolders(
  provider: string,
  folderId: string,
  s3Bucket: string
): Promise<FolderItem[]> {
  let url: string;

  if (provider === 'google') {
    url = `/api/drive/folders?parentId=${encodeURIComponent(folderId || 'root')}`;
  } else if (provider === 'dropbox') {
    url = `/api/dropbox/folders?path=${encodeURIComponent(folderId || '/')}`;
  } else if (provider === 'onedrive') {
    url = folderId
      ? `/api/onedrive/files?folderId=${encodeURIComponent(folderId)}`
      : '/api/onedrive/files';
  } else if (provider === 'box') {
    url = `/api/box/files?folderId=${encodeURIComponent(folderId || '0')}`;
  } else if (provider === 's3') {
    url = s3Bucket
      ? `/api/s3/files?bucket=${encodeURIComponent(s3Bucket)}&prefix=${encodeURIComponent(folderId)}`
      : '/api/s3/buckets';
  } else {
    return [];
  }

  const res = await apiRequest('GET', url);
  const data = await res.json();

  if (provider === 'google')   return (data.folders || []).map((f: any) => ({ id: f.id, name: f.name }));
  if (provider === 'dropbox')  return (data.folders || []).map((f: any) => ({ id: f.id, name: f.name }));
  if (provider === 'onedrive') return (data || []).filter((f: any) => f.isFolder).map((f: any) => ({ id: f.id, name: f.name }));
  if (provider === 'box')      return (data || []).filter((f: any) => f.isFolder).map((f: any) => ({ id: f.id, name: f.name }));
  if (provider === 's3') {
    if (!s3Bucket) return (data || []).map((b: any) => ({ id: b.name, name: b.name }));
    return (data || []).filter((f: any) => f.isFolder).map((f: any) => ({ id: f.id, name: f.name }));
  }
  return [];
}

export default function FolderPicker({
  provider,
  value,
  onChange,
  disabled,
  placeholder,
}: FolderPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<FolderItem[]>([]);
  const [s3Bucket, setS3Bucket] = useState('');

  const root = PROVIDER_ROOTS[provider] ?? { id: 'root', name: 'Root' };
  const currentFolder = breadcrumb[breadcrumb.length - 1] ?? root;
  const currentId = currentFolder.id;

  const { data: folders = [], isLoading, isError } = useQuery<FolderItem[]>({
    queryKey: ['folder-picker', provider, currentId, s3Bucket],
    queryFn: () => fetchFolders(provider, currentId, s3Bucket),
    enabled: open,
    staleTime: 60000,
    retry: false,
  });

  function handleOpen() {
    if (disabled) return;
    setBreadcrumb([root]);
    setS3Bucket('');
    setOpen(true);
  }

  function handleNavigate(folder: FolderItem) {
    if (provider === 's3' && !s3Bucket) {
      setS3Bucket(folder.id);
      setBreadcrumb(prev => [...prev, { id: '', name: folder.name }]);
    } else {
      setBreadcrumb(prev => [...prev, folder]);
    }
  }

  function handleBreadcrumbClick(index: number) {
    setBreadcrumb(prev => prev.slice(0, index + 1));
    if (provider === 's3' && index === 0) setS3Bucket('');
  }

  function handleConfirm() {
    let selection: FolderSelection;
    if (provider === 's3') {
      if (!s3Bucket) return;
      selection = {
        id: currentId ? `${s3Bucket}/${currentId}` : s3Bucket,
        name: currentFolder.name !== 'Amazon S3' ? currentFolder.name : s3Bucket,
      };
    } else {
      selection = { id: currentFolder.id, name: currentFolder.name };
    }
    onChange(selection);
    setOpen(false);
  }

  const canConfirm = provider !== 's3' || !!s3Bucket;
  const buttonLabel = value ? value.name : (placeholder ?? t('folderMisc.selectFolder', 'Seleccionar carpeta...'));

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        disabled={disabled}
        className="w-full justify-start text-left font-normal bg-gray-50 dark:bg-gray-800 h-10"
      >
        <Folder className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
        <span className="truncate text-sm">{buttonLabel}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-500" />
              {PROVIDER_LABELS[provider] ?? provider}
            </DialogTitle>
          </DialogHeader>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 flex-wrap min-h-[24px] text-sm">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(i)}
                  className={`hover:underline transition-colors rounded px-1 py-0.5 ${
                    i === breadcrumb.length - 1
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {i === 0 && <Home className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
                  {item.name}
                </button>
              </span>
            ))}
          </div>

          {/* Current folder indicator */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-2 flex items-center gap-2 text-sm">
            <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="font-medium text-blue-900 dark:text-blue-100 truncate">{currentFolder.name}</span>
            <span className="text-blue-400 text-xs ml-auto whitespace-nowrap">{t('folderMisc.currentFolder', 'carpeta actual')}</span>
          </div>

          {/* Folder list */}
          <div className="border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="py-6 text-center text-sm text-red-500 px-4">
                {t('folderMisc.loadError')}
              </div>
            ) : folders.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {provider === 's3' && !s3Bucket ? t('folderMisc.noBuckets', 'No hay buckets disponibles') : t('folderMisc.noSubfolders')}
              </div>
            ) : (
              folders.map(folder => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => handleNavigate(folder)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-left transition-colors border-b last:border-b-0 group"
                >
                  <Folder className="w-4 h-4 text-blue-400 flex-shrink-0 group-hover:text-blue-600" />
                  <span className="text-sm flex-1 truncate">{folder.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              {t('common.actions.cancel', 'Cancelar')}
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
              {t('folderMisc.useFolder', 'Usar')} &ldquo;{currentFolder.name}&rdquo;
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
