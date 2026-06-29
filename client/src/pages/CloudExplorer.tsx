import React, { useState } from 'react';
import {
  Folder, File, Search, RefreshCw,
  FileText, FileSpreadsheet, Image as ImageIcon, Video, Music, Archive,
  ChevronRight, Home, AlertCircle, Loader2, ArrowRight, MoveRight, WifiOff,
  CheckSquare, Square, Clock, SendHorizontal, Minus, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTransfer } from "@/contexts/TransferContext";
import { Link } from "wouter";
import { performClientTransfer, CLIENT_TRANSFER_MAX_BYTES, transferFolderClientSide } from "@/lib/clientTransfer";
import type { ProviderTokens, ClientTransferOptions } from "@/lib/clientTransfer";
import { usePageTitle } from "@/hooks/usePageTitle";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FilePreviewModal from "@/components/FilePreviewModal";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import OneDriveLogo from "@/components/OneDriveLogo";
import BoxLogo from "@/components/BoxLogo";
import S3Logo from "@/components/S3Logo";

type Provider = 'google' | 'dropbox' | 'onedrive' | 'box' | 's3';

interface CloudItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string | number;
  isFolder: boolean;
}

interface BreadcrumbEntry {
  name: string;
  id: string;
}

interface PanelState {
  provider: Provider;
  googleFolderId: string;
  dropboxPath: string;
  onedriveFolderId: string;
  boxFolderId: string;
  s3Bucket: string;
  s3Prefix: string;
  breadcrumbs: BreadcrumbEntry[];
  search: string;
}

const GOOGLE_FOLDER_MIME = 'application/vnd.google-apps.folder';
const DROPBOX_FOLDER_MIME = 'application/vnd.dropbox.folder';

interface RecentFolder { id: string; name: string; path: string }

function getRecentFolders(provider: Provider): RecentFolder[] {
  try {
    return JSON.parse(localStorage.getItem(`tera_recent_${provider}`) || '[]');
  } catch { return []; }
}

function saveRecentFolder(provider: Provider, folder: RecentFolder) {
  const existing = getRecentFolders(provider).filter(f => f.id !== folder.id);
  const updated = [folder, ...existing].slice(0, 5);
  localStorage.setItem(`tera_recent_${provider}`, JSON.stringify(updated));
}

function formatSize(size?: string | number): string {
  if (size === undefined || size === null) return '';
  const bytes = typeof size === 'string' ? parseInt(size) : size;
  if (isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text/plain')) return FileText;
  if (mimeType.includes('presentation')) return FileText;
  if (mimeType.includes('image')) return ImageIcon;
  if (mimeType.includes('video')) return Video;
  if (mimeType.includes('audio')) return Music;
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed') || mimeType.includes('tar') || mimeType.includes('rar')) return Archive;
  return File;
}

function getFileColor(mimeType: string): string {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'bg-emerald-50 text-emerald-500';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'bg-blue-50 text-blue-500';
  if (mimeType.includes('presentation')) return 'bg-orange-50 text-orange-500';
  if (mimeType.includes('image')) return 'bg-purple-50 text-purple-500';
  if (mimeType.includes('video')) return 'bg-pink-50 text-pink-500';
  if (mimeType.includes('audio')) return 'bg-yellow-50 text-yellow-500';
  if (mimeType.includes('pdf')) return 'bg-red-50 text-red-500';
  return 'bg-gray-50 text-gray-400';
}

function getProviderName(provider: Provider): string {
  const names: Record<Provider, string> = {
    google: 'Google Drive',
    dropbox: 'Dropbox',
    onedrive: 'OneDrive',
    box: 'Box',
    s3: 'Amazon S3',
  };
  return names[provider];
}

function ProviderIcon({ provider, className }: { provider: Provider; className?: string }) {
  if (provider === 'google') return <GoogleDriveLogo className={className} />;
  if (provider === 'dropbox') return <DropboxLogo className={className} />;
  if (provider === 'onedrive') return <OneDriveLogo className={className} />;
  if (provider === 'box') return <BoxLogo className={className} />;
  return <S3Logo className={className} />;
}

async function fetchGoogleFiles(folderId: string): Promise<CloudItem[]> {
  const res = await apiRequest('POST', '/api/drive/list-files', { fileId: folderId });
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType || '',
    size: f.size,
    isFolder: f.mimeType === GOOGLE_FOLDER_MIME,
  }));
}

async function fetchDropboxFiles(path: string): Promise<CloudItem[]> {
  const encodedPath = encodeURIComponent(path);
  const res = await apiRequest('GET', `/api/dropbox/files?path=${encodedPath}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((f: any) => ({
    id: f.id || f.path_lower || f.name,
    name: f.name,
    mimeType: f.mimeType || '',
    size: f.size,
    isFolder: f.mimeType === DROPBOX_FOLDER_MIME,
  }));
}

async function fetchOnedriveFiles(folderId: string): Promise<CloudItem[]> {
  const params = folderId ? `?folderId=${encodeURIComponent(folderId)}` : '';
  const res = await apiRequest('GET', `/api/onedrive/files${params}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType || '',
    size: f.size,
    isFolder: !!f.isFolder,
  }));
}

async function fetchBoxFiles(folderId: string): Promise<CloudItem[]> {
  const params = folderId ? `?folderId=${encodeURIComponent(folderId)}` : '';
  const res = await apiRequest('GET', `/api/box/files${params}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType || '',
    size: f.size,
    isFolder: !!f.isFolder,
  }));
}

async function fetchS3Buckets(): Promise<CloudItem[]> {
  const res = await apiRequest('GET', '/api/s3/buckets');
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((b: any) => ({
    id: b.name,
    name: b.name,
    mimeType: 'application/vnd.s3.bucket',
    isFolder: true,
  }));
}

async function fetchS3Files(bucket: string, prefix: string): Promise<CloudItem[]> {
  const res = await apiRequest('GET', `/api/s3/files?bucket=${encodeURIComponent(bucket)}&prefix=${encodeURIComponent(prefix)}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType || '',
    size: f.size,
    isFolder: !!f.isFolder,
  }));
}

interface CloudPanelProps {
  panelId: number;
  panelState: PanelState;
  setPanelState: (s: PanelState) => void;
  onDragStart: (item: CloudItem, provider: Provider, path: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragTarget: boolean;
  isDragSource: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onRequestMultiTransfer: (items: CloudItem[], provider: Provider, path: string) => void;
  onPreview: (item: CloudItem) => void;
}

const ALL_PROVIDERS: Provider[] = ['google', 'dropbox', 'onedrive', 'box', 's3'];

function CloudPanel({
  panelState,
  setPanelState,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragTarget,
  isDragSource,
  onDragEnter,
  onDragLeave,
  onRequestMultiTransfer,
  onPreview,
}: CloudPanelProps) {
  const { t } = useTranslation();

  const isS3BucketSelector = panelState.provider === 's3' && panelState.s3Bucket === '';

  const currentPath = (() => {
    switch (panelState.provider) {
      case 'google': return panelState.googleFolderId;
      case 'dropbox': return panelState.dropboxPath;
      case 'onedrive': return panelState.onedriveFolderId;
      case 'box': return panelState.boxFolderId;
      case 's3': return panelState.s3Prefix;
    }
  })();

  const queryKey = (() => {
    switch (panelState.provider) {
      case 'google': return ['drive-files', panelState.googleFolderId];
      case 'dropbox': return ['dropbox-files', panelState.dropboxPath];
      case 'onedrive': return ['onedrive-files', panelState.onedriveFolderId];
      case 'box': return ['box-files', panelState.boxFolderId];
      case 's3': return panelState.s3Bucket
        ? ['s3-files', panelState.s3Bucket, panelState.s3Prefix]
        : ['s3-buckets'];
    }
  })();

  const queryFn = () => {
    switch (panelState.provider) {
      case 'google': return fetchGoogleFiles(panelState.googleFolderId);
      case 'dropbox': return fetchDropboxFiles(panelState.dropboxPath);
      case 'onedrive': return fetchOnedriveFiles(panelState.onedriveFolderId);
      case 'box': return fetchBoxFiles(panelState.boxFolderId);
      case 's3': return panelState.s3Bucket
        ? fetchS3Files(panelState.s3Bucket, panelState.s3Prefix)
        : fetchS3Buckets();
    }
  };

  const { data: items = [], isLoading, error, refetch } = useQuery<CloudItem[]>({
    queryKey,
    queryFn,
    retry: 1,
    staleTime: 30 * 1000,
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>(
    () => getRecentFolders(panelState.provider)
  );

  const filtered = panelState.search
    ? items.filter(i => i.name.toLowerCase().includes(panelState.search.toLowerCase()))
    : items;

  const sorted = [
    ...filtered.filter(i => i.isFolder),
    ...filtered.filter(i => !i.isFolder),
  ];

  const folderCount = sorted.filter(i => i.isFolder).length;
  const fileCount = sorted.filter(i => !i.isFolder).length;
  const isAtRoot = panelState.breadcrumbs.length === 0;

  function toggleSelect(item: CloudItem, e: React.MouseEvent) {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  function clearSelection() { setSelected(new Set()); }

  function enterFolder(item: CloudItem) {
    if (!item.isFolder) return;
    if (panelState.provider === 'google') {
      const folder: RecentFolder = { id: item.id, name: item.name, path: item.id };
      saveRecentFolder('google', folder);
      setRecentFolders(getRecentFolders('google'));
      setPanelState({
        ...panelState,
        googleFolderId: item.id,
        breadcrumbs: [...panelState.breadcrumbs, { name: item.name, id: item.id }],
      });
    } else if (panelState.provider === 'dropbox') {
      const newPath = panelState.dropboxPath === '' || panelState.dropboxPath === '/'
        ? `/${item.name}`
        : `${panelState.dropboxPath}/${item.name}`;
      const folder: RecentFolder = { id: newPath, name: item.name, path: newPath };
      saveRecentFolder('dropbox', folder);
      setRecentFolders(getRecentFolders('dropbox'));
      setPanelState({
        ...panelState,
        dropboxPath: newPath,
        breadcrumbs: [...panelState.breadcrumbs, { name: item.name, id: newPath }],
      });
    } else if (panelState.provider === 'onedrive') {
      saveRecentFolder('onedrive', { id: item.id, name: item.name, path: item.id });
      setRecentFolders(getRecentFolders('onedrive'));
      setPanelState({
        ...panelState,
        onedriveFolderId: item.id,
        breadcrumbs: [...panelState.breadcrumbs, { name: item.name, id: item.id }],
      });
    } else if (panelState.provider === 'box') {
      saveRecentFolder('box', { id: item.id, name: item.name, path: item.id });
      setRecentFolders(getRecentFolders('box'));
      setPanelState({
        ...panelState,
        boxFolderId: item.id,
        breadcrumbs: [...panelState.breadcrumbs, { name: item.name, id: item.id }],
      });
    } else if (panelState.provider === 's3') {
      if (panelState.s3Bucket === '') {
        // Clicking a bucket — enter it (breadcrumb id = '' means bucket root)
        setPanelState({
          ...panelState,
          s3Bucket: item.name,
          s3Prefix: '',
          breadcrumbs: [{ name: item.name, id: '' }],
        });
      } else {
        // Clicking a virtual folder (prefix) — item.id is the full prefix e.g. 'photos/'
        setPanelState({
          ...panelState,
          s3Prefix: item.id,
          breadcrumbs: [...panelState.breadcrumbs, { name: item.name, id: item.id }],
        });
      }
    }
    clearSelection();
  }

  function navigateToRoot() {
    setPanelState({
      ...panelState,
      googleFolderId: 'root',
      dropboxPath: '',
      onedriveFolderId: '',
      boxFolderId: '',
      s3Bucket: '',
      s3Prefix: '',
      breadcrumbs: [],
    });
    clearSelection();
  }

  function navigateToCrumb(index: number) {
    const crumb = panelState.breadcrumbs[index];
    const newBreadcrumbs = panelState.breadcrumbs.slice(0, index + 1);
    if (panelState.provider === 'google') {
      setPanelState({ ...panelState, googleFolderId: crumb.id, breadcrumbs: newBreadcrumbs });
    } else if (panelState.provider === 'dropbox') {
      setPanelState({ ...panelState, dropboxPath: crumb.id, breadcrumbs: newBreadcrumbs });
    } else if (panelState.provider === 'onedrive') {
      setPanelState({ ...panelState, onedriveFolderId: crumb.id, breadcrumbs: newBreadcrumbs });
    } else if (panelState.provider === 'box') {
      setPanelState({ ...panelState, boxFolderId: crumb.id, breadcrumbs: newBreadcrumbs });
    } else if (panelState.provider === 's3') {
      // index 0 is the bucket (s3Prefix = ''), subsequent are prefixes
      setPanelState({
        ...panelState,
        s3Prefix: index === 0 ? '' : crumb.id,
        breadcrumbs: newBreadcrumbs,
      });
    }
    clearSelection();
  }

  function navigateToRecent(folder: RecentFolder) {
    if (panelState.provider === 'google') {
      setPanelState({ ...panelState, googleFolderId: folder.id, breadcrumbs: [{ name: folder.name, id: folder.id }] });
    } else if (panelState.provider === 'dropbox') {
      setPanelState({ ...panelState, dropboxPath: folder.path, breadcrumbs: [{ name: folder.name, id: folder.path }] });
    } else if (panelState.provider === 'onedrive') {
      setPanelState({ ...panelState, onedriveFolderId: folder.id, breadcrumbs: [{ name: folder.name, id: folder.id }] });
    } else if (panelState.provider === 'box') {
      setPanelState({ ...panelState, boxFolderId: folder.id, breadcrumbs: [{ name: folder.name, id: folder.id }] });
    }
    clearSelection();
  }

  function switchProvider(p: Provider) {
    setPanelState({
      provider: p,
      googleFolderId: 'root',
      dropboxPath: '',
      onedriveFolderId: '',
      boxFolderId: '',
      s3Bucket: '',
      s3Prefix: '',
      breadcrumbs: [],
      search: '',
    });
    setRecentFolders(getRecentFolders(p));
    clearSelection();
  }

  const providerColor: Record<Provider, string> = {
    google: 'from-blue-500/10 to-blue-600/5',
    dropbox: 'from-blue-400/10 to-blue-500/5',
    onedrive: 'from-sky-500/10 to-sky-600/5',
    box: 'from-blue-600/10 to-blue-700/5',
    s3: 'from-orange-400/10 to-orange-500/5',
  };

  const selectedItems = sorted.filter(i => selected.has(i.id));

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-sm border flex flex-col transition-all duration-200 ${
        isDragTarget
          ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50/30 shadow-blue-100 shadow-lg'
          : isDragSource
          ? 'border-gray-200 opacity-80'
          : 'border-gray-200 hover:shadow-md'
      }`}
      style={{ maxHeight: 'calc(100vh - 180px)' }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drop overlay */}
      {isDragTarget && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 border-2 border-dashed border-blue-400 flex items-center justify-center">
          <div className="bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <MoveRight className="w-4 h-4" />
            {t('pages.cloudExplorer.dropToTransfer', 'Soltar para transferir')}
          </div>
        </div>
      )}

      {/* Panel header */}
      <div className={`p-4 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r ${providerColor[panelState.provider]}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Provider selector — all 5 */}
            <div className="flex items-center gap-0.5 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
              {ALL_PROVIDERS.map(p => (
                <button
                  key={p}
                  onClick={() => switchProvider(p)}
                  title={getProviderName(p)}
                  className={`p-1.5 rounded-lg transition-all ${
                    panelState.provider === p
                      ? 'bg-blue-50 shadow-sm'
                      : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                  }`}
                >
                  <ProviderIcon provider={p} className="w-4 h-4" />
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700">{getProviderName(panelState.provider)}</p>
              {!isLoading && sorted.length > 0 && (
                <p className="text-[10px] text-gray-400 font-medium">
                  {isS3BucketSelector
                    ? `${sorted.length} bucket${sorted.length !== 1 ? 's' : ''}`
                    : <>
                        {folderCount > 0 && `${folderCount} carpeta${folderCount !== 1 ? 's' : ''}`}
                        {folderCount > 0 && fileCount > 0 && ' · '}
                        {fileCount > 0 && `${fileCount} archivo${fileCount !== 1 ? 's' : ''}`}
                      </>
                  }
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={t('pages.cloudExplorer.search', 'Buscar...')}
                value={panelState.search}
                onChange={(e) => setPanelState({ ...panelState, search: e.target.value })}
                className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all w-28"
              />
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-1.5 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Recent folders — only for non-S3 providers at root */}
        {panelState.provider !== 's3' && isAtRoot && recentFolders.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
            {recentFolders.map(f => (
              <button
                key={f.id}
                onClick={() => navigateToRecent(f)}
                className="text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg px-2 py-1 hover:border-blue-300 hover:text-blue-600 transition-colors truncate max-w-[90px]"
                title={f.name}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 bg-white/60 rounded-lg px-2 py-1.5 border border-white/80 min-w-0">
          <button
            onClick={navigateToRoot}
            className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
          >
            <Home className="w-3 h-3" />
          </button>
          {panelState.breadcrumbs.length === 0 && (
            <span className="text-[11px] text-gray-400 font-medium ml-1">
              {isS3BucketSelector ? 'Buckets' : t('pages.cloudExplorer.root', 'Raíz')}
            </span>
          )}
          {panelState.breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
              <button
                onClick={() => navigateToCrumb(i)}
                className={`text-[11px] font-medium transition-colors truncate max-w-[100px] ${
                  i === panelState.breadcrumbs.length - 1
                    ? 'text-gray-700'
                    : 'text-gray-400 hover:text-blue-600'
                }`}
                title={crumb.name}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-scroll p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
        {/* Error */}
        {error && !isLoading && (() => {
          const msg = error instanceof Error ? error.message : '';
          const isDisconnected = msg.includes('not connected') || msg.includes('connect_required') || msg.includes('401:');
          if (isDisconnected) {
            return (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {t('pages.cloudExplorer.notConnected', '{{provider}} no conectado', { provider: getProviderName(panelState.provider) })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                    {t('pages.cloudExplorer.connectAccount', 'Conectá tu cuenta para explorar y transferir archivos')}
                  </p>
                </div>
                <Link href="/integrations">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl">
                    {t('pages.cloudExplorer.goToIntegrations', 'Ir a Integraciones →')}
                  </button>
                </Link>
              </div>
            );
          }
          return (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <AlertCircle className="w-8 h-8 text-red-300" />
              <p className="text-sm text-gray-500 max-w-[220px]">
                {msg || t('pages.cloudExplorer.loadError', 'Error al cargar los archivos')}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition-colors"
              >
                {t('pages.cloudExplorer.retry', 'Reintentar')}
              </button>
            </div>
          );
        })()}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-xl flex flex-col items-center gap-2 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="w-full space-y-1.5">
                  <div className="h-2 bg-gray-100 rounded-full w-3/4 mx-auto" />
                  <div className="h-1.5 bg-gray-100 rounded-full w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Folder className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">
              {panelState.search ? t('pages.cloudExplorer.noResults', 'Sin resultados') : t('pages.cloudExplorer.emptyFolder', 'Carpeta vacía')}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {sorted.map((item) => {
              const Icon = item.isFolder ? Folder : getFileIcon(item.mimeType);
              const colorClass = item.isFolder ? 'bg-blue-50 text-blue-500' : getFileColor(item.mimeType);
              const isSelected = selected.has(item.id);
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    // prevent scroll container from intercepting the drag gesture
                    e.stopPropagation();
                    onDragStart(item, panelState.provider, currentPath);
                  }}
                  onDragEnd={onDragEnd}
                  onClick={(e) => item.isFolder ? enterFolder(item) : toggleSelect(item, e)}
                  className={`relative p-3 border rounded-xl transition-all group flex flex-col items-center text-center gap-2 select-none touch-none ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 shadow-sm'
                      : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm hover:-translate-y-px'
                  } cursor-pointer`}
                >
                  {/* Checkbox — large hit area, z-10, stopPropagation for folders to avoid navigation */}
                  <div
                    className={`absolute top-0 left-0 z-10 w-8 h-8 flex items-center justify-center cursor-pointer transition-opacity ${isSelected || selected.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleSelect(item, e); }}
                  >
                    {isSelected
                      ? <CheckSquare className="w-4 h-4 text-blue-500" />
                      : <Square className="w-4 h-4 text-gray-300" />}
                  </div>
                  {/* Preview button — only for files when nothing selected */}
                  {!item.isFolder && selected.size === 0 && (
                    <div
                      className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); onPreview(item); }}
                    >
                      <div className="p-1 rounded-md hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} transition-transform group-hover:scale-105`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <p className="text-[11px] font-semibold text-slate-700 truncate leading-tight" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {item.isFolder
                        ? (isS3BucketSelector ? 'Bucket' : t('pages.cloudExplorer.folder', 'Carpeta'))
                        : (formatSize(item.size) || '—')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Multi-select action bar */}
        {selectedItems.length > 0 && (
          <div className="sticky bottom-2 mt-3 flex items-center justify-between bg-blue-600 text-white rounded-xl px-4 py-2.5 shadow-lg shadow-blue-200">
            <span className="text-xs font-bold">{t('pages.cloudExplorer.filesSelected', '{{count}} archivos seleccionados', { count: selectedItems.length })}</span>
            <div className="flex items-center gap-2">
              <button onClick={clearSelection} className="text-[11px] text-blue-200 hover:text-white font-semibold transition-colors">
                {t('pages.cloudExplorer.cancel', 'Cancelar')}
              </button>
              <button
                onClick={() => onRequestMultiTransfer(selectedItems, panelState.provider, currentPath)}
                className="flex items-center gap-1.5 text-xs font-bold bg-white text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                {t('pages.cloudExplorer.transfer', 'Transferir')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function destQueryKey(provider: string, panel: PanelState) {
  switch (provider) {
    case 'google':   return ['drive-files', panel.googleFolderId];
    case 'dropbox':  return ['dropbox-files', panel.dropboxPath];
    case 'onedrive': return ['onedrive-files', panel.onedriveFolderId];
    case 'box':      return ['box-files', panel.boxFolderId];
    case 's3':       return panel.s3Bucket
      ? ['s3-files', panel.s3Bucket, panel.s3Prefix]
      : ['s3-buckets'];
    default:         return [];
  }
}

export default function CloudExplorer() {
  const { t } = useTranslation();
  usePageTitle(t('pageTitles.explorer', 'TERA — File Explorer'));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [panel1, setPanel1] = useState<PanelState>({
    provider: 'google',
    googleFolderId: 'root',
    dropboxPath: '',
    onedriveFolderId: '',
    boxFolderId: '',
    s3Bucket: '',
    s3Prefix: '',
    breadcrumbs: [],
    search: '',
  });

  const [panel2, setPanel2] = useState<PanelState>({
    provider: 'dropbox',
    googleFolderId: 'root',
    dropboxPath: '',
    onedriveFolderId: '',
    boxFolderId: '',
    s3Bucket: '',
    s3Prefix: '',
    breadcrumbs: [],
    search: '',
  });

  const { addJob } = useTransfer();

  const [draggedItem, setDraggedItem] = useState<{ item: CloudItem; provider: Provider; sourcePath: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<1 | 2 | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [folderProgress, setFolderProgress] = useState<{ completed: number; total: number } | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<{
    items: CloudItem[];
    from: Provider;
    to: Provider;
    sourcePath: string;
    toPanel: 1 | 2;
  } | null>(null);
  const [previewItem, setPreviewItem] = useState<{ item: CloudItem; provider: Provider; s3Bucket?: string } | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<{ fileName: string; destProvider: string } | null>(null);

  function handleDragStart(item: CloudItem, provider: Provider, sourcePath: string) {
    setDraggedItem({ item, provider, sourcePath });
  }

  function handleDragEnd() {
    setDraggedItem(null);
    setDropTarget(null);
  }

  function handleDrop(targetPanel: 1 | 2) {
    if (!draggedItem) return;
    const targetProvider = targetPanel === 1 ? panel1.provider : panel2.provider;
    if (draggedItem.provider === targetProvider) {
      toast({ title: t('pages.cloudExplorer.sameProvider', 'Mismo proveedor'), description: t('pages.cloudExplorer.sameProviderDesc', 'Arrastrá al panel del otro proveedor para transferir.') });
    } else {
      setPendingTransfer({
        items: [draggedItem.item],
        from: draggedItem.provider,
        to: targetProvider,
        sourcePath: draggedItem.sourcePath,
        toPanel: targetPanel,
      });
      setShowSyncModal(true);
    }
    setDraggedItem(null);
    setDropTarget(null);
  }

  function handleMultiTransfer(items: CloudItem[], provider: Provider, path: string) {
    const otherProvider = provider === panel1.provider
      ? panel2.provider
      : panel1.provider;
    const toPanel: 1 | 2 = provider === panel1.provider ? 2 : 1;
    setPendingTransfer({ items, from: provider, to: otherProvider, sourcePath: path, toPanel });
    setShowSyncModal(true);
  }

  async function confirmTransfer(duplicateAction: 'skip' | 'replace' | 'copy_with_suffix') {
    if (!pendingTransfer) return;

    const destPanel = pendingTransfer.toPanel === 1 ? panel1 : panel2;
    const sourcePanel = pendingTransfer.toPanel === 1 ? panel2 : panel1;

    // S3 target requires a bucket to be selected
    if (pendingTransfer.to === 's3' && !destPanel.s3Bucket) {
      toast({
        title: t('pages.cloudExplorer.s3NoBucket', 'Seleccioná un bucket S3 primero'),
        description: t('pages.cloudExplorer.s3NoBucketDesc', 'Navegá dentro de un bucket en el panel de destino antes de transferir.'),
        variant: 'destructive',
      });
      setShowSyncModal(false);
      setPendingTransfer(null);
      return;
    }

    setIsTransferring(true);
    setDownloadProgress(0);
    setUploadProgress(0);
    setFolderProgress(null);
    let usedServerSide = false;

    try {
      const targetPath = (() => {
        switch (pendingTransfer.to) {
          case 'google': return destPanel.googleFolderId;
          case 'dropbox': return destPanel.dropboxPath || '/';
          case 'onedrive': return destPanel.onedriveFolderId;
          case 'box': return destPanel.boxFolderId;
          case 's3': return destPanel.s3Prefix;
        }
      })();

      for (const item of pendingTransfer.items) {
        const itemSize = item.size !== undefined && item.size !== null ? Number(item.size) : null;

        // Determine whether to use client-side path:
        // - Folders: always client-side (new)
        // - Files: client-side unless Box > 500 MB, or Dropbox is involved.
        //   Dropbox's content.dropboxapi.com does not return Access-Control-Allow-Origin,
        //   so browser uploads/downloads are permanently blocked by CORS.
        const isBoxLargeFile = !item.isFolder && pendingTransfer.to === 'box' && itemSize !== null && itemSize > CLIENT_TRANSFER_MAX_BYTES;
        const hasDropbox = pendingTransfer.from === 'dropbox' || pendingTransfer.to === 'dropbox';
        const useClientSide = !isBoxLargeFile && !hasDropbox;

        if (useClientSide) {
          // ── Client-side transfer (browser downloads + uploads directly) ──
          const tokensRes = await apiRequest(
            'GET',
            `/api/client-transfer/tokens?sourceProvider=${pendingTransfer.from}&destProvider=${pendingTransfer.to}`,
          );
          const tokensData = await tokensRes.json();

          const sourceTokens: ProviderTokens = {};
          const destTokens: ProviderTokens = {};

          // Build source tokens
          if (pendingTransfer.from === 's3') {
            if (!item.isFolder) {
              const presignRes = await apiRequest('POST', '/api/client-transfer/s3-presign', {
                operation: 'download',
                bucket: sourcePanel.s3Bucket,
                key: item.id,
              });
              const { url } = await presignRes.json();
              sourceTokens.presignedDownloadUrl = url;
            }
            // For folders, S3 tokens are not presigned per-item; the folder transfer function handles listing
          } else {
            sourceTokens.accessToken = tokensData[pendingTransfer.from]?.accessToken;
          }

          // Build dest tokens
          if (pendingTransfer.to === 's3') {
            if (!item.isFolder) {
              const destKey = destPanel.s3Prefix
                ? `${destPanel.s3Prefix.replace(/\/$/, '')}/${item.name}`
                : item.name;
              const presignRes = await apiRequest('POST', '/api/client-transfer/s3-presign', {
                operation: 'upload',
                bucket: destPanel.s3Bucket,
                key: destKey,
                contentType: typeof item.mimeType === 'string' ? item.mimeType : undefined,
              });
              const { url } = await presignRes.json();
              destTokens.presignedUploadUrl = url;
            }
            // For folders, dest tokens not presigned per-item
          } else {
            destTokens.accessToken = tokensData[pendingTransfer.to]?.accessToken;
          }

          if (item.isFolder) {
            // ── Client-side folder transfer ──
            const sourceFolderId = ['google', 'onedrive', 'box'].includes(pendingTransfer.from) ? item.id : undefined;
            const sourceFolderPath = (() => {
              if (pendingTransfer.from === 'dropbox') return item.id; // Dropbox item.id is the full path
              if (pendingTransfer.from === 's3') return item.id;       // S3 item.id is the prefix
              return undefined;
            })();

            const destParentId = ['google', 'onedrive', 'box'].includes(pendingTransfer.to)
              ? (targetPath || undefined)
              : undefined;
            const destParentPath = (() => {
              if (pendingTransfer.to === 'dropbox') return destPanel.dropboxPath || '';
              if (pendingTransfer.to === 's3') return destPanel.s3Prefix || '';
              return undefined;
            })();

            setFolderProgress({ completed: 0, total: 0 });

            await transferFolderClientSide(
              pendingTransfer.from,
              pendingTransfer.to,
              sourceTokens,
              destTokens,
              sourceFolderId,
              sourceFolderPath,
              destParentId,
              destParentPath,
              item.name,
              sourcePanel.s3Bucket || undefined,
              destPanel.s3Bucket || undefined,
              (completed, total) => {
                setFolderProgress({ completed, total });
              },
            );

            addJob({
              id: `client-folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              fileName: item.name,
              status: 'completed',
              progress: 100,
              sourceProvider: pendingTransfer.from,
              targetProvider: pendingTransfer.to,
              createdAt: new Date().toISOString(),
            });
          } else {
            // ── Client-side file transfer (streaming) ──
            const sourceFilePath = (() => {
              if (pendingTransfer.from === 'dropbox') {
                const folder = pendingTransfer.sourcePath;
                return folder === '' || folder === '/'
                  ? `/${item.name}`
                  : `${folder}/${item.name}`;
              }
              return undefined;
            })();

            const opts: ClientTransferOptions = {
              sourceProvider: pendingTransfer.from,
              destProvider: pendingTransfer.to,
              fileName: item.name,
              fileSize: itemSize ?? undefined,
              mimeType: typeof item.mimeType === 'string' ? item.mimeType : undefined,
              sourceFileId: ['google', 'onedrive', 'box', 's3'].includes(pendingTransfer.from) ? item.id : undefined,
              sourceFilePath,
              sourceBucket: pendingTransfer.from === 's3' ? sourcePanel.s3Bucket : undefined,
              destFolderId: ['google', 'onedrive', 'box'].includes(pendingTransfer.to) ? targetPath : undefined,
              destPath: pendingTransfer.to === 'dropbox' ? (destPanel.dropboxPath || '') : undefined,
              destBucket: pendingTransfer.to === 's3' ? destPanel.s3Bucket : undefined,
              destPrefix: pendingTransfer.to === 's3' ? destPanel.s3Prefix : undefined,
            };

            await performClientTransfer(sourceTokens, destTokens, opts, {
              onDownloadProgress: setDownloadProgress,
              onUploadProgress: setUploadProgress,
            });

            // Record in history (non-critical)
            apiRequest('POST', '/api/client-transfer/record', {
              fileName: item.name,
              fileSize: itemSize,
              sourceProvider: pendingTransfer.from,
              destProvider: pendingTransfer.to,
            }).catch(() => {});

            addJob({
              id: `client-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              fileName: item.name,
              status: 'completed',
              progress: 100,
              sourceProvider: pendingTransfer.from,
              targetProvider: pendingTransfer.to,
              createdAt: new Date().toISOString(),
            });
          }
        } else {
          // ── Server-side transfer (Dropbox / Box large files) ──
          usedServerSide = true;
          toast({
            title: t('pages.cloudExplorer.largeFile', 'Archivo grande'),
            description: t('pages.cloudExplorer.largeFileDesc', 'Archivo grande, usando servidor...'),
          });

          const payload: Record<string, any> = {
            sourceProvider: pendingTransfer.from,
            targetProvider: pendingTransfer.to,
            fileName: item.name,
            duplicateAction,
            targetPath,
            isFolder: item.isFolder,
          };
          if (item.size) payload.fileSize = Number(item.size);

          switch (pendingTransfer.from) {
            case 'google':
            case 'onedrive':
            case 'box':
              payload.sourceFileId = item.id;
              break;
            case 'dropbox': {
              const folder = pendingTransfer.sourcePath;
              payload.sourceFilePath = folder === '' || folder === '/'
                ? `/${item.name}`
                : `${folder}/${item.name}`;
              break;
            }
            case 's3':
              payload.sourceFileId = item.id; // full S3 key
              payload.sourceBucket = sourcePanel.s3Bucket;
              break;
          }

          if (pendingTransfer.to === 's3') {
            payload.targetBucket = destPanel.s3Bucket;
          }

          const res = await apiRequest('POST', '/api/transfer-files', payload);
          const job = await res.json();
          addJob({
            id: job.jobId,
            fileName: job.fileName || item.name,
            status: 'queued',
            progress: 0,
            sourceProvider: pendingTransfer.from,
            targetProvider: pendingTransfer.to,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Refresh destination panel so transferred files appear immediately
      queryClient.invalidateQueries({ queryKey: destQueryKey(pendingTransfer.to, destPanel) });

      const count = pendingTransfer.items.length;
      const firstName = pendingTransfer.items[0].name;
      const destName = getProviderName(pendingTransfer.to);
      if (usedServerSide) {
        toast({
          title: t('copy.transferInitiated', 'Transferencia en cola'),
          description: count === 1
            ? t('pages.cloudExplorer.fileQueued', '"{{name}}" está siendo procesado en el servidor.', { name: firstName })
            : t('pages.cloudExplorer.filesQueued', '{{count}} archivos en cola hacia {{provider}}.', { count, provider: destName }),
        });
      } else {
        const successMsg = count === 1 ? firstName : `${count} archivos`;
        setTransferSuccess({ fileName: successMsg, destProvider: destName });
        setTimeout(() => {
          setTransferSuccess(null);
          setIsTransferring(false);
          setShowSyncModal(false);
          setPendingTransfer(null);
        }, 2500);
        return;
      }
    } catch (error: any) {
      toast({ title: t('pages.cloudExplorer.transferError', 'Error al iniciar transferencia'), description: error.message || t('pages.cloudExplorer.transferErrorDesc', 'No se pudo iniciar la transferencia.'), variant: 'destructive' });
    } finally {
      setIsTransferring(false);
      setShowSyncModal(false);
      setPendingTransfer(null);
      setFolderProgress(null);
    }
  }

  const dragSourcePanel = draggedItem
    ? (draggedItem.provider === panel1.provider ? 1 : 2)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pl-0 sm:pl-20">
      <Header />
      <Sidebar />

      {/* Floating minimized transfer indicator */}
      <AnimatePresence>
        {isTransferring && !showSyncModal && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={() => setShowSyncModal(true)}
            className="fixed bottom-6 right-6 z-[300] bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-2xl transition-shadow"
          >
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                {pendingTransfer?.items[0]?.name ?? t('pages.cloudExplorer.transferring', 'Transfiriendo...')}
              </p>
              {folderProgress ? (
                <p className="text-[10px] text-slate-400">{folderProgress.completed}/{folderProgress.total} {t('pages.cloudExplorer.filesTransferred', 'archivos transferidos')}</p>
              ) : (
                <p className="text-[10px] text-slate-400">↓ {downloadProgress}% · ↑ {uploadProgress}%</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer confirmation modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                if (isTransferring) { setShowSyncModal(false); }
                else { setShowSyncModal(false); setPendingTransfer(null); }
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100"
            >
              {isTransferring && !transferSuccess && (
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Minimizar"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}

              {/* Success screen */}
              {transferSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 px-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-5"
                  >
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <p className="text-lg font-black text-slate-800 mb-1">
                    {t('copy.transferComplete', '¡Transferencia completada!')}
                  </p>
                  <p className="text-sm text-slate-400 font-medium">
                    <span className="font-semibold text-slate-600">{transferSuccess.fileName}</span>
                    {' → '}{transferSuccess.destProvider}
                  </p>
                </motion.div>
              )}

              <div className="p-7" style={{ display: transferSuccess ? 'none' : undefined }}>
                {/* File info */}
                {pendingTransfer && (() => {
                  const first = pendingTransfer.items[0];
                  const count = pendingTransfer.items.length;
                  return (
                    <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                        {count > 1
                          ? <File className="w-5 h-5 text-blue-500" />
                          : first.isFolder ? <Folder className="w-5 h-5 text-blue-500" /> : <File className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {count > 1 ? t('pages.cloudExplorer.filesSelected', '{{count}} archivos seleccionados', { count }) : first.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ProviderIcon provider={pendingTransfer.from} className="w-3.5 h-3.5" />
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <ProviderIcon provider={pendingTransfer.to} className="w-3.5 h-3.5" />
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                            {count > 1 ? t('pages.cloudExplorer.countFiles', '{{count}} archivos', { count }) : first.isFolder ? t('pages.cloudExplorer.folder', 'Carpeta') : t('myFiles.fileTypes.file', 'Archivo')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {t('pages.cloudExplorer.syncMode', '¿Cómo transferir?')}
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  {t('pages.cloudExplorer.syncDesc', 'Elegí qué hacer si ya existe un archivo con el mismo nombre.')}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => confirmTransfer('skip')}
                    disabled={isTransferring}
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50/40 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                      {t('pages.cloudExplorer.skip', 'Saltear existentes')}
                    </p>
                    <p className="text-[11px] text-slate-400 group-hover:text-blue-400 mt-0.5">
                      {t('pages.cloudExplorer.skipDesc', 'Copia solo archivos nuevos, no sobreescribe')}
                    </p>
                  </button>
                  <button
                    onClick={() => confirmTransfer('copy_with_suffix')}
                    disabled={isTransferring}
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50/40 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                      {t('pages.cloudExplorer.copyWithSuffix', 'Copiar con nuevo nombre')}
                    </p>
                    <p className="text-[11px] text-slate-400 group-hover:text-blue-400 mt-0.5">
                      {t('pages.cloudExplorer.copyWithSuffixDesc', 'Si ya existe, crea una copia con sufijo (_1, _2…)')}
                    </p>
                  </button>
                  <button
                    onClick={() => confirmTransfer('replace')}
                    disabled={isTransferring}
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-100 hover:border-red-300 hover:bg-red-50/40 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="text-sm font-bold text-slate-700 group-hover:text-red-600">
                      {t('pages.cloudExplorer.replace', 'Reemplazar')}
                    </p>
                    <p className="text-[11px] text-slate-400 group-hover:text-red-400 mt-0.5">
                      {t('pages.cloudExplorer.replaceDesc', 'Sobreescribe el archivo existente con el mismo nombre')}
                    </p>
                  </button>
                </div>

                {isTransferring && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>{t('pages.cloudExplorer.transferring', 'Transfiriendo...')}</span>
                    </div>
                    {folderProgress ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{folderProgress.completed} {t('pages.cloudExplorer.of', 'de')} {folderProgress.total} {t('pages.cloudExplorer.filesTransferred', 'archivos transferidos')}</span>
                          <span>{folderProgress.total > 0 ? Math.round((folderProgress.completed / folderProgress.total) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${folderProgress.total > 0 ? Math.round((folderProgress.completed / folderProgress.total) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    ) : (downloadProgress > 0 || uploadProgress > 0) && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{t('pages.cloudExplorer.downloading', 'Descargando')}</span><span>{downloadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 transition-all" style={{ width: `${downloadProgress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{t('pages.cloudExplorer.uploading', 'Subiendo')}</span><span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!transferSuccess && (
                  <button
                    onClick={() => { setShowSyncModal(false); setPendingTransfer(null); setIsTransferring(false); }}
                    className="w-full mt-3 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {isTransferring ? t('common.actions.cancelTransfer', 'Cancelar transferencia') : t('common.actions.cancel', 'Cancelar')}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-5">
          {/* Page header */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">
              {t('pages.cloudExplorer.title', 'Cloud Explorer')}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('pages.cloudExplorer.subtitle', 'Arrastrá archivos entre paneles para transferirlos entre nubes.')}
            </p>
          </div>

          {/* Drag hint bar */}
          <AnimatePresence>
            {draggedItem && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-shrink-0 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-600"
              >
                <MoveRight className="w-3.5 h-3.5" />
                {t('pages.cloudExplorer.dragHint', 'Soltá "{{name}}" en el otro panel para transferir', { name: draggedItem.item.name })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CloudPanel
              panelId={1}
              panelState={panel1}
              setPanelState={setPanel1}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e) => { e.preventDefault(); handleDrop(1); }}
              isDragTarget={dropTarget === 1}
              isDragSource={dragSourcePanel === 1}
              onDragEnter={(e) => { e.preventDefault(); if (draggedItem) setDropTarget(1); }}
              onDragLeave={() => setDropTarget(null)}
              onRequestMultiTransfer={handleMultiTransfer}
              onPreview={(item) => setPreviewItem({ item, provider: panel1.provider, s3Bucket: panel1.s3Bucket })}
            />
            <CloudPanel
              panelId={2}
              panelState={panel2}
              setPanelState={setPanel2}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e) => { e.preventDefault(); handleDrop(2); }}
              isDragTarget={dropTarget === 2}
              isDragSource={dragSourcePanel === 2}
              onDragEnter={(e) => { e.preventDefault(); if (draggedItem) setDropTarget(2); }}
              onDragLeave={() => setDropTarget(null)}
              onRequestMultiTransfer={handleMultiTransfer}
              onPreview={(item) => setPreviewItem({ item, provider: panel2.provider, s3Bucket: panel2.s3Bucket })}
            />
          </div>
        </div>
      </main>

      {/* File preview modal */}
      {previewItem && (
        <FilePreviewModal
          item={previewItem.item}
          provider={previewItem.provider}
          s3Bucket={previewItem.s3Bucket}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}
