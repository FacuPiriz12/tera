import { usePageTitle } from '@/hooks/usePageTitle';
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import {
  Download, FileText, FileImage, FileSpreadsheet, Folder, Archive,
  Search, Grid3x3, List, MoreVertical, ChevronLeft, ChevronRight,
  ExternalLink, Copy, Info, Calendar, HardDrive, Link2, Share2,
  FileVideo, FileAudio, File, Layers
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import OneDriveLogo from "@/components/OneDriveLogo";
import BoxLogo from "@/components/BoxLogo";
import S3Logo from "@/components/S3Logo";
import { useToast } from "@/hooks/use-toast";
import type { CloudFile } from "@shared/schema";
import { getAuthHeaders } from "@/lib/queryClient";
import ShareFileDialog from "@/components/ShareFileDialog";

type ProviderFilter = 'all' | 'google' | 'dropbox' | 'onedrive' | 'box' | 's3';

// ── Provider metadata ────────────────────────────────────────────────────────

const PROVIDER_META: Record<string, { label: string; Logo: React.ComponentType<{ className?: string }> }> = {
  google:   { label: 'Google Drive', Logo: GoogleDriveLogo },
  dropbox:  { label: 'Dropbox',      Logo: DropboxLogo },
  onedrive: { label: 'OneDrive',     Logo: OneDriveLogo },
  box:      { label: 'Box',          Logo: BoxLogo },
  s3:       { label: 'Amazon S3',    Logo: S3Logo },
};

// ── File type helpers ────────────────────────────────────────────────────────

function getFileCategory(mimeType?: string | null) {
  if (!mimeType) return 'other';
  if (mimeType.includes('folder'))     return 'folder';
  if (mimeType.includes('image/'))     return 'image';
  if (mimeType.includes('video/'))     return 'video';
  if (mimeType.includes('audio/'))     return 'audio';
  if (mimeType.includes('pdf'))        return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('word') || mimeType.includes('document'))     return 'document';
  if (mimeType.includes('zip') || mimeType.includes('archive'))       return 'archive';
  return 'other';
}

const CATEGORY_STYLE: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  folder:      { icon: <Folder className="w-5 h-5" />,          bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-600' },
  image:       { icon: <FileImage className="w-5 h-5" />,       bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600' },
  video:       { icon: <FileVideo className="w-5 h-5" />,       bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600' },
  audio:       { icon: <FileAudio className="w-5 h-5" />,       bg: 'bg-pink-100 dark:bg-pink-900/30',    text: 'text-pink-600' },
  pdf:         { icon: <FileText className="w-5 h-5" />,        bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-600' },
  spreadsheet: { icon: <FileSpreadsheet className="w-5 h-5" />, bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-600' },
  document:    { icon: <FileText className="w-5 h-5" />,        bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-600' },
  archive:     { icon: <Archive className="w-5 h-5" />,         bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600' },
  other:       { icon: <File className="w-5 h-5" />,            bg: 'bg-slate-100 dark:bg-slate-800',      text: 'text-slate-500' },
};

function FileIcon({ mimeType, size = 'md' }: { mimeType?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const cat = getFileCategory(mimeType);
  const { icon, bg, text } = CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.other;
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  return (
    <div className={`${dim} ${bg} ${text} rounded-xl flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
  );
}

function ProviderBadge({ provider }: { provider?: string | null }) {
  if (!provider) return null;
  const meta = PROVIDER_META[provider];
  if (!meta) return <span className="text-xs text-muted-foreground capitalize">{provider}</span>;
  const { Logo, label } = meta;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Logo className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFullDate(dateString?: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function totalStorageLabel(files: CloudFile[]): string {
  const total = files.reduce((s, f) => s + (f.fileSize || 0), 0);
  return formatFileSize(total);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MyFiles() {
  const { t } = useTranslation();
  usePageTitle(t('pageTitles.myFiles', 'TERA — My Files'));
  const { toast } = useToast();
  const searchString = useSearch();

  const [searchTerm, setSearchTerm]         = useState('');
  const [viewMode, setViewMode]             = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage]       = useState(1);
  const [selectedFile, setSelectedFile]     = useState<CloudFile | null>(null);
  const [detailsOpen, setDetailsOpen]       = useState(false);
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [fileToShare, setFileToShare]       = useState<CloudFile | null>(null);
  const itemsPerPage = 12;

  const urlFilters = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return {
      types: params.get('types')?.split(',').filter(Boolean) || [],
      date:  params.get('date')  || 'any',
      size:  params.get('size')  || 'any',
    };
  }, [searchString]);

  const { data: filesData = { files: [], total: 0, totalPages: 0 }, isLoading } = useQuery({
    queryKey: ["/api/drive-files", currentPage, itemsPerPage],
    queryFn: async ({ queryKey }) => {
      const [, page, limit] = queryKey;
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/drive-files?page=${page}&limit=${limit}`, { headers: authHeaders, credentials: 'include' });
      if (!res.ok) { if (res.status === 401) return { files: [], total: 0, totalPages: 0 }; throw new Error('Failed'); }
      return res.json();
    },
    keepPreviousData: true,
  } as any);

  const rawFiles: CloudFile[] = filesData.files || [];
  const total      = filesData.total || 0;
  const totalPages = filesData.totalPages || 0;

  // Providers that actually have files
  const activeProviders = useMemo(() => [...new Set(rawFiles.map(f => f.provider).filter(Boolean))], [rawFiles]);

  const filteredFiles = useMemo(() => {
    return rawFiles.filter(file => {
      if (searchTerm && !file.fileName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (providerFilter !== 'all' && file.provider !== providerFilter) return false;
      if (urlFilters.types.length > 0) {
        const cat = getFileCategory(file.mimeType);
        if (!urlFilters.types.includes(cat)) return false;
      }
      return true;
    });
  }, [rawFiles, searchTerm, providerFilter, urlFilters]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const getFileUrl = (file: CloudFile) => {
    if (file.provider === 'dropbox') return file.sourceUrl || `https://www.dropbox.com/home/${file.copiedFileId}`;
    if (file.provider === 'onedrive') return `https://onedrive.live.com/?id=${file.copiedFileId}`;
    if (file.provider === 'box') return `https://app.box.com/file/${file.copiedFileId}`;
    return `https://drive.google.com/file/d/${file.copiedFileId}/view`;
  };

  const getProviderLabel = (file: CloudFile) => PROVIDER_META[file.provider || '']?.label || file.provider || 'Cloud';

  const handleOpenInCloud = (file: CloudFile, e?: React.MouseEvent) => { e?.stopPropagation(); window.open(getFileUrl(file), '_blank'); };
  const handleDownload    = (file: CloudFile, e?: React.MouseEvent) => { e?.stopPropagation(); window.open(getFileUrl(file), '_blank'); };
  const handleCopyLink    = (file: CloudFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(getFileUrl(file));
    toast({ title: t('myFiles.linkCopied', 'Link copied') });
  };
  const handleViewDetails = (file: CloudFile, e?: React.MouseEvent) => { e?.stopPropagation(); setSelectedFile(file); setDetailsOpen(true); };
  const handleShare       = (file: CloudFile, e?: React.MouseEvent) => { e?.stopPropagation(); setFileToShare(file); setShareDialogOpen(true); };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col pl-0 sm:pl-20">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-background flex flex-col pl-0 sm:pl-20" data-testid="page-my-files">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl">

          {/* ── Hero ── */}
          <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-white/70" />
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{t('myFiles.title', 'My Files')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('myFiles.heroTitle', 'All your files, one place')}</h1>
                <p className="text-white/60 text-sm mt-1">{t('myFiles.heroSubtitle', 'Files transferred or copied across your connected clouds')}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: t('myFiles.statFiles', 'Total files'), value: total },
                  { label: t('myFiles.statProviders', 'Providers'), value: activeProviders.length },
                  { label: t('myFiles.statStorage', 'Storage tracked'), value: totalStorageLabel(rawFiles) },
                ].map(s => (
                  <div key={s.label} className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 min-w-[90px]">
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('myFiles.searchPlaceholder', 'Search files…')}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 bg-white dark:bg-card border-border"
                data-testid="input-search-files"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Provider filter chips */}
              <div className="flex items-center gap-1 bg-white dark:bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => setProviderFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${providerFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  data-testid="button-filter-all"
                >
                  {t('myFiles.all', 'All')}
                </button>
                {activeProviders.map(p => {
                  const meta = PROVIDER_META[p || ''];
                  if (!meta) return null;
                  const { Logo, label } = meta;
                  const active = providerFilter === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setProviderFilter(p as ProviderFilter)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors ${active ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'text-muted-foreground hover:text-foreground'}`}
                      data-testid={`button-filter-${p}`}
                    >
                      <Logo className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* View toggle */}
              <div className="flex items-center bg-white dark:bg-card border border-border rounded-lg p-1 gap-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'}`} data-testid="button-view-grid">
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'}`} data-testid="button-view-list">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Results count ── */}
          {filteredFiles.length > 0 && (
            <p className="text-sm text-muted-foreground -mt-2">
              {filteredFiles.length} {t('myFiles.filesFound', 'file(s)')}
              {providerFilter !== 'all' && ` · ${PROVIDER_META[providerFilter]?.label || providerFilter}`}
              {searchTerm && ` · "${searchTerm}"`}
            </p>
          )}

          {/* ── Empty state ── */}
          {filteredFiles.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl border border-border flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {searchTerm ? t('myFiles.noFilesFound', 'No files found') : t('myFiles.noFilesCopied', 'No files yet')}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                {searchTerm
                  ? t('myFiles.tryDifferentSearch', 'Try different search terms')
                  : t('myFiles.filesWillAppearHere', 'Files transferred between clouds will appear here')}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* ── Grid view ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file: CloudFile) => (
                <div
                  key={file.id}
                  className="bg-white dark:bg-card rounded-xl border border-border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => handleViewDetails(file)}
                  data-testid={`card-file-${file.id}`}
                >
                  <div className="p-4 space-y-3">
                    {/* Top: icon + menu */}
                    <div className="flex items-start justify-between">
                      <FileIcon mimeType={file.mimeType} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted" data-testid={`button-more-${file.id}`}>
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={e => handleViewDetails(file, e as any)}><Info className="w-4 h-4 mr-2" />{t('myFiles.viewDetails', 'Details')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => handleOpenInCloud(file, e as any)}><ExternalLink className="w-4 h-4 mr-2" />{t('myFiles.openIn', 'Open in {{provider}}', { provider: getProviderLabel(file) })}</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => handleDownload(file, e as any)}><Download className="w-4 h-4 mr-2" />{t('myFiles.download', 'Download')}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={e => handleCopyLink(file, e as any)}><Link2 className="w-4 h-4 mr-2" />{t('myFiles.copyLink', 'Copy link')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => handleShare(file, e as any)}><Share2 className="w-4 h-4 mr-2" />{t('myFiles.share', 'Share')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* File name */}
                    <div>
                      <p className="font-medium text-sm truncate leading-tight" title={file.fileName}>{file.fileName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground">{formatDate(file.createdAt)}</span>
                      </div>
                    </div>

                    {/* Provider footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <ProviderBadge provider={file.provider} />
                      <Badge variant="secondary" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-0">
                        {t('myFiles.copied', 'Transferred')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── List view ── */
            <div className="bg-white dark:bg-card rounded-xl border border-border overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span className="w-10" />
                <span>{t('common.table.name', 'Name')}</span>
                <span className="w-24 text-right">{t('myFiles.size', 'Size')}</span>
                <span className="w-28 text-right">{t('myFiles.copyDate', 'Date')}</span>
                <span className="w-8" />
              </div>

              {filteredFiles.map((file: CloudFile, i) => (
                <div
                  key={file.id}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center group hover:bg-muted/40 cursor-pointer transition-colors ${i < filteredFiles.length - 1 ? 'border-b border-border' : ''}`}
                  onClick={() => handleViewDetails(file)}
                  data-testid={`row-file-${file.id}`}
                >
                  <FileIcon mimeType={file.mimeType} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" title={file.fileName}>{file.fileName}</p>
                    <ProviderBadge provider={file.provider} />
                  </div>
                  <span className="text-xs text-muted-foreground w-24 text-right">{formatFileSize(file.fileSize)}</span>
                  <span className="text-xs text-muted-foreground w-28 text-right">{formatDate(file.createdAt)}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted w-8" data-testid={`button-more-list-${file.id}`}>
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={e => handleViewDetails(file, e as any)}><Info className="w-4 h-4 mr-2" />{t('myFiles.viewDetails', 'Details')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => handleOpenInCloud(file, e as any)}><ExternalLink className="w-4 h-4 mr-2" />{t('myFiles.openIn', 'Open in {{provider}}', { provider: getProviderLabel(file) })}</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => handleDownload(file, e as any)}><Download className="w-4 h-4 mr-2" />{t('myFiles.download', 'Download')}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={e => handleCopyLink(file, e as any)}><Link2 className="w-4 h-4 mr-2" />{t('myFiles.copyLink', 'Copy link')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => handleShare(file, e as any)}><Share2 className="w-4 h-4 mr-2" />{t('myFiles.share', 'Share')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {Math.min((currentPage - 1) * itemsPerPage + 1, total)}–{Math.min(currentPage * itemsPerPage, total)} {t('myFiles.of', 'of')} {total}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1} className="h-8 w-8 p-0" data-testid="button-prev-page">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(n => (
                  <Button key={n} variant={n === currentPage ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(n)} className="h-8 w-8 p-0" data-testid={`button-page-${n}`}>{n}</Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="h-8 w-8 p-0" data-testid="button-next-page">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── File Details Dialog ── */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedFile && <FileIcon mimeType={selectedFile.mimeType} size="sm" />}
              <span className="truncate text-base">{selectedFile?.fileName}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <HardDrive className="w-4 h-4" />, label: t('myFiles.size', 'Size'), value: formatFileSize(selectedFile.fileSize) },
                  { icon: <FileText className="w-4 h-4" />,  label: t('myFiles.type', 'Type'), value: getFileCategory(selectedFile.mimeType) },
                  { icon: <Calendar className="w-4 h-4" />,  label: t('myFiles.copyDate', 'Date'), value: formatFullDate(selectedFile.createdAt), col2: true },
                ].map(row => (
                  <div key={row.label} className={`flex items-start gap-2 bg-muted/50 rounded-lg p-3 ${row.col2 ? 'col-span-2' : ''}`}>
                    <span className="text-muted-foreground mt-0.5">{row.icon}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium capitalize">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <ProviderBadge provider={selectedFile.provider} />
                <Badge variant="secondary" className="ml-auto text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 border-0">
                  {t('myFiles.copiedSuccessfully', 'Transferred')}
                </Badge>
              </div>

              <div className="flex gap-2 pt-1">
                <Button onClick={() => handleOpenInCloud(selectedFile)} className="flex-1" data-testid="button-dialog-open-cloud">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('myFiles.openIn', 'Open in {{provider}}', { provider: getProviderLabel(selectedFile) })}
                </Button>
                <Button variant="outline" onClick={() => handleDownload(selectedFile)} data-testid="button-dialog-download">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => handleCopyLink(selectedFile)} data-testid="button-dialog-copy-link">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ShareFileDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        file={fileToShare ? {
          id: fileToShare.copiedFileId || fileToShare.id?.toString() || '',
          name: fileToShare.fileName,
          type: fileToShare.mimeType?.includes('folder') ? 'folder' : 'file',
          size: fileToShare.fileSize,
          mimeType: fileToShare.mimeType,
          provider: (fileToShare.provider as 'google' | 'dropbox') || 'google',
          path: null,
        } : null}
      />
    </div>
  );
}
