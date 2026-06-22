import React, { useState } from 'react';
import {
  Folder, File, Search, RefreshCw,
  FileText, FileSpreadsheet, Image as ImageIcon, Video, Music, Archive,
  ChevronRight, Home, AlertCircle, Loader2, ArrowRight, MoveRight, WifiOff,
  CheckSquare, Square, Clock, SendHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTransfer } from "@/contexts/TransferContext";
import { Link } from "wouter";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const googleLogo = "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg";
const dropboxLogo = "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg";

type Provider = 'google' | 'dropbox';

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
}

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
}: CloudPanelProps) {
  const { t } = useTranslation();
  const currentPath = panelState.provider === 'google'
    ? panelState.googleFolderId
    : panelState.dropboxPath;

  const queryKey = panelState.provider === 'google'
    ? ['drive-files', panelState.googleFolderId]
    : ['dropbox-files', panelState.dropboxPath];

  const { data: items = [], isLoading, error, refetch } = useQuery<CloudItem[]>({
    queryKey,
    queryFn: () => panelState.provider === 'google'
      ? fetchGoogleFiles(panelState.googleFolderId)
      : fetchDropboxFiles(panelState.dropboxPath),
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
    if (item.isFolder) return;
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
    } else {
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
    }
    clearSelection();
  }

  function navigateToRoot() {
    setPanelState({ ...panelState, googleFolderId: 'root', dropboxPath: '', breadcrumbs: [] });
    clearSelection();
  }

  function navigateToCrumb(index: number) {
    const crumb = panelState.breadcrumbs[index];
    setPanelState({
      ...panelState,
      googleFolderId: panelState.provider === 'google' ? crumb.id : panelState.googleFolderId,
      dropboxPath: panelState.provider === 'dropbox' ? crumb.id : panelState.dropboxPath,
      breadcrumbs: panelState.breadcrumbs.slice(0, index + 1),
    });
    clearSelection();
  }

  function navigateToRecent(folder: RecentFolder) {
    if (panelState.provider === 'google') {
      setPanelState({ ...panelState, googleFolderId: folder.id, breadcrumbs: [{ name: folder.name, id: folder.id }] });
    } else {
      setPanelState({ ...panelState, dropboxPath: folder.path, breadcrumbs: [{ name: folder.name, id: folder.path }] });
    }
    clearSelection();
  }

  function switchProvider(p: Provider) {
    setPanelState({ provider: p, googleFolderId: 'root', dropboxPath: '', breadcrumbs: [], search: '' });
    setRecentFolders(getRecentFolders(p));
    clearSelection();
  }

  const providerColor = panelState.provider === 'google'
    ? 'from-blue-500/10 to-blue-600/5'
    : 'from-blue-400/10 to-blue-500/5';

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
      <div className={`p-4 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r ${providerColor}`}>
        {/* Provider selector + location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => switchProvider('google')}
                title="Google Drive"
                className={`p-1.5 rounded-lg transition-all ${
                  panelState.provider === 'google'
                    ? 'bg-blue-50 shadow-sm'
                    : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img src={googleLogo} alt="Google Drive" className="w-4 h-4 object-contain" />
              </button>
              <button
                onClick={() => switchProvider('dropbox')}
                title="Dropbox"
                className={`p-1.5 rounded-lg transition-all ${
                  panelState.provider === 'dropbox'
                    ? 'bg-blue-50 shadow-sm'
                    : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img src={dropboxLogo} alt="Dropbox" className="w-4 h-4 object-contain" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700">
                {panelState.provider === 'google' ? 'Google Drive' : 'Dropbox'}
              </p>
              {!isLoading && sorted.length > 0 && (
                <p className="text-[10px] text-gray-400 font-medium">
                  {folderCount > 0 && `${folderCount} carpeta${folderCount !== 1 ? 's' : ''}`}
                  {folderCount > 0 && fileCount > 0 && ' · '}
                  {fileCount > 0 && `${fileCount} archivo${fileCount !== 1 ? 's' : ''}`}
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

        {/* Carpetas recientes — solo en raíz */}
        {isAtRoot && recentFolders.length > 0 && (
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
            <span className="text-[11px] text-gray-400 font-medium ml-1">{t('pages.cloudExplorer.root', 'Raíz')}</span>
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
                    {t('pages.cloudExplorer.notConnected', '{{provider}} no conectado', { provider: panelState.provider === 'google' ? 'Google Drive' : 'Dropbox' })}
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
                  draggable={!item.isFolder}
                  onDragStart={() => onDragStart(item, panelState.provider, currentPath)}
                  onDragEnd={onDragEnd}
                  onClick={(e) => item.isFolder ? enterFolder(item) : toggleSelect(item, e)}
                  className={`relative p-3 border rounded-xl transition-all group flex flex-col items-center text-center gap-2 select-none ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 shadow-sm'
                      : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm hover:-translate-y-px'
                  } ${item.isFolder ? 'cursor-pointer' : 'cursor-pointer'}`}
                >
                  {/* Checkbox for files */}
                  {!item.isFolder && (
                    <div className={`absolute top-1.5 left-1.5 transition-opacity ${isSelected || selected.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isSelected
                        ? <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                        : <Square className="w-3.5 h-3.5 text-gray-300" />}
                    </div>
                  )}
                  {/* Drag hint for files when nothing selected */}
                  {!item.isFolder && selected.size === 0 && (
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-3 h-3 text-gray-300" />
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
                      {item.isFolder ? t('pages.cloudExplorer.folder', 'Carpeta') : (formatSize(item.size) || '—')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Barra de selección múltiple */}
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

export default function CloudExplorer() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [panel1, setPanel1] = useState<PanelState>({
    provider: 'google',
    googleFolderId: 'root',
    dropboxPath: '',
    breadcrumbs: [],
    search: '',
  });

  const [panel2, setPanel2] = useState<PanelState>({
    provider: 'dropbox',
    googleFolderId: 'root',
    dropboxPath: '',
    breadcrumbs: [],
    search: '',
  });

  const { addJob } = useTransfer();

  const [draggedItem, setDraggedItem] = useState<{ item: CloudItem; provider: Provider; sourcePath: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<1 | 2 | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{
    items: CloudItem[];
    from: Provider;
    to: Provider;
    sourcePath: string;
    toPanel: 1 | 2;
  } | null>(null);

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
    setIsTransferring(true);

    try {
      const destPanel = pendingTransfer.toPanel === 1 ? panel1 : panel2;
      const targetPath = pendingTransfer.to === 'google'
        ? destPanel.googleFolderId
        : (destPanel.dropboxPath || '/');

      for (const item of pendingTransfer.items) {
        const payload: Record<string, any> = {
          sourceProvider: pendingTransfer.from,
          targetProvider: pendingTransfer.to,
          fileName: item.name,
          duplicateAction,
          targetPath,
          isFolder: item.isFolder,
        };
        if (item.size) payload.fileSize = Number(item.size);
        if (pendingTransfer.from === 'google') {
          payload.sourceFileId = item.id;
        } else {
          const folder = pendingTransfer.sourcePath;
          payload.sourceFilePath = folder === '' || folder === '/'
            ? `/${item.name}`
            : `${folder}/${item.name}`;
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

      const count = pendingTransfer.items.length;
      toast({
        title: t('copy.transferInitiated', 'Transferencia iniciada'),
        description: count === 1
          ? t('pages.cloudExplorer.fileQueued', '"{{name}}" está en cola.', { name: pendingTransfer.items[0].name })
          : t('pages.cloudExplorer.filesQueued', '{{count}} archivos en cola hacia {{provider}}.', { count, provider: pendingTransfer.to === 'google' ? 'Google Drive' : 'Dropbox' }),
      });
    } catch (error: any) {
      toast({ title: t('pages.cloudExplorer.transferError', 'Error al iniciar transferencia'), description: error.message || t('pages.cloudExplorer.transferErrorDesc', 'No se pudo iniciar la transferencia.'), variant: 'destructive' });
    } finally {
      setIsTransferring(false);
      setShowSyncModal(false);
      setPendingTransfer(null);
    }
  }

  // Determine which panel is the drag source
  const dragSourcePanel = draggedItem
    ? (draggedItem.provider === panel1.provider ? 1 : 2)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pl-0 sm:pl-20">
      <Header />
      <Sidebar />

      {/* Transfer confirmation modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isTransferring && setShowSyncModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100"
            >
              <div className="p-7">
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
                          <img src={pendingTransfer.from === 'google' ? googleLogo : dropboxLogo} alt="" className="w-3.5 h-3.5 object-contain" />
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <img src={pendingTransfer.to === 'google' ? googleLogo : dropboxLogo} alt="" className="w-3.5 h-3.5 object-contain" />
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
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-blue-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-medium">{t('pages.cloudExplorer.transferring', 'Iniciando transferencia...')}</span>
                  </div>
                )}

                <button
                  onClick={() => { if (!isTransferring) { setShowSyncModal(false); setPendingTransfer(null); } }}
                  disabled={isTransferring}
                  className="w-full mt-3 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  {t('common.actions.cancel', 'Cancelar')}
                </button>
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}
