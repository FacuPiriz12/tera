import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { useSearch } from "wouter";
import { 
  Download, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  Folder, 
  Archive,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Trash2,
  Info,
  Calendar,
  HardDrive,
  Link2,
  Eye,
  Share2,
  Filter
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import { useToast } from "@/hooks/use-toast";
import type { CloudFile } from "@shared/schema";
import { getAuthHeaders } from "@/lib/queryClient";
import ShareFileDialog from "@/components/ShareFileDialog";

type PlatformFilter = 'all' | 'google' | 'dropbox';

export default function MyFiles() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const searchString = useSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<CloudFile | null>(null);
  const itemsPerPage = 10;
  
  const urlFilters = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return {
      types: params.get('types')?.split(',').filter(Boolean) || [],
      date: params.get('date') || 'any',
      size: params.get('size') || 'any',
      owner: params.get('owner') || '',
      folder: params.get('folder') || '',
      tags: params.get('tags') || '',
    };
  }, [searchString]);

  const hasActiveFilters = urlFilters.types.length > 0 || 
    urlFilters.date !== 'any' || 
    urlFilters.size !== 'any' || 
    urlFilters.owner !== '' || 
    urlFilters.folder !== '' || 
    urlFilters.tags !== '';
  
  const { data: filesData = { files: [], total: 0, totalPages: 0 }, isLoading } = useQuery({
    queryKey: ["/api/drive-files", currentPage, itemsPerPage],
    queryFn: async ({ queryKey }) => {
      const [, page, limit] = queryKey;
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/drive-files?page=${page}&limit=${limit}`, {
        headers: authHeaders,
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) return { files: [], total: 0, totalPages: 0 };
        throw new Error('Failed to fetch files');
      }
      return response.json();
    },
    keepPreviousData: true,
  });

  const rawFiles = filesData.files || [];
  const total = filesData.total || 0;
  const totalPages = filesData.totalPages || 0;

  const matchesTypeFilter = (file: CloudFile, types: string[]): boolean => {
    if (types.length === 0) return true;
    const mimeType = file.mimeType?.toLowerCase() || '';
    
    return types.some(type => {
      switch (type) {
        case 'folders': return mimeType.includes('folder');
        case 'files': return !mimeType.includes('folder');
        case 'pdf': return mimeType.includes('pdf');
        case 'document': return mimeType.includes('word') || mimeType.includes('document');
        case 'spreadsheet': return mimeType.includes('spreadsheet') || mimeType.includes('excel');
        case 'presentation': return mimeType.includes('presentation') || mimeType.includes('powerpoint');
        case 'image': return mimeType.includes('image');
        case 'audio': return mimeType.includes('audio');
        case 'video': return mimeType.includes('video');
        default: return false;
      }
    });
  };

  const matchesSizeFilter = (file: CloudFile, sizeRange: string): boolean => {
    if (sizeRange === 'any') return true;
    const size = file.fileSize || 0;
    const MB = 1024 * 1024;
    const GB = 1024 * MB;
    
    switch (sizeRange) {
      case '0-1mb': return size <= 1 * MB;
      case '1-5mb': return size > 1 * MB && size <= 5 * MB;
      case '5-25mb': return size > 5 * MB && size <= 25 * MB;
      case '25-100mb': return size > 25 * MB && size <= 100 * MB;
      case '100mb-1gb': return size > 100 * MB && size <= 1 * GB;
      case '1gb+': return size > 1 * GB;
      default: return true;
    }
  };

  const matchesDateFilter = (file: CloudFile, dateRange: string): boolean => {
    if (dateRange === 'any') return true;
    const fileDate = new Date(file.modifiedAt || file.copiedAt);
    const now = new Date();
    
    switch (dateRange) {
      case 'last_day':
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return fileDate >= oneDayAgo;
      case 'last_week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return fileDate >= oneWeekAgo;
      case 'last_month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return fileDate >= oneMonthAgo;
      case 'last_year':
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return fileDate >= oneYearAgo;
      default: return true;
    }
  };

  const files = useMemo(() => {
    if (!hasActiveFilters) return rawFiles;
    
    return rawFiles.filter(file => {
      if (!matchesTypeFilter(file, urlFilters.types)) return false;
      if (!matchesSizeFilter(file, urlFilters.size)) return false;
      if (!matchesDateFilter(file, urlFilters.date)) return false;
      if (urlFilters.owner && !file.fileName?.toLowerCase().includes(urlFilters.owner.toLowerCase())) return false;
      if (urlFilters.folder && !file.fileName?.toLowerCase().includes(urlFilters.folder.toLowerCase())) return false;
      return true;
    });
  }, [rawFiles, urlFilters, hasActiveFilters]);

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="w-6 h-6 text-gray-600" />;

    if (mimeType.includes('folder')) {
      return <Folder className="w-6 h-6 text-yellow-600" />;
    }
    if (mimeType.includes('image/')) {
      return <FileImage className="w-6 h-6 text-green-600" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    }
    if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return <Archive className="w-6 h-6 text-purple-600" />;
    }
    return <FileText className="w-6 h-6 text-gray-600" />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileType = (mimeType?: string): string => {
    if (!mimeType) return 'Archivo';
    if (mimeType.includes('folder')) return 'Carpeta';
    if (mimeType.includes('image/')) return 'Imagen';
    if (mimeType.includes('video/')) return 'Video';
    if (mimeType.includes('audio/')) return 'Audio';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Hoja de cálculo';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Documento';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'Archivo comprimido';
    return 'Archivo';
  };

  const getFileUrl = (file: CloudFile): string => {
    if (file.provider === 'dropbox') {
      return file.sourceUrl || `https://www.dropbox.com/home/${file.copiedFileId}`;
    }
    return `https://drive.google.com/file/d/${file.copiedFileId}/view`;
  };

  const getDownloadUrl = (file: CloudFile): string => {
    if (file.provider === 'dropbox') {
      return file.sourceUrl?.replace('?dl=0', '?dl=1') || `https://www.dropbox.com/home/${file.copiedFileId}?dl=1`;
    }
    return `https://drive.google.com/uc?export=download&id=${file.copiedFileId}`;
  };

  const getProviderName = (file: CloudFile): string => {
    return file.provider === 'dropbox' ? 'Dropbox' : 'Google Drive';
  };

  const handleDownload = (file: CloudFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const downloadUrl = getDownloadUrl(file);
    window.open(downloadUrl, '_blank');
  };

  const handleOpenInCloud = (file: CloudFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cloudUrl = getFileUrl(file);
    window.open(cloudUrl, '_blank');
  };

  const handleCopyLink = (file: CloudFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cloudUrl = getFileUrl(file);
    navigator.clipboard.writeText(cloudUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace se ha copiado al portapapeles",
    });
  };

  const handleViewDetails = (file: CloudFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedFile(file);
    setDetailsOpen(true);
  };

  const handleCardClick = (file: CloudFile) => {
    setSelectedFile(file);
    setDetailsOpen(true);
  };

  const handleShare = (file: CloudFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFileToShare(file);
    setShareDialogOpen(true);
  };

  const filteredFiles = files.filter((file: CloudFile) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || file.provider === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-all duration-300 pl-20" data-testid="page-my-files">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[1.5rem] font-semibold text-foreground mb-2">
              {t('myFiles.title', { defaultValue: 'Mis Archivos' })}
            </h1>
            <p className="text-muted-foreground">
              Archivos y Carpetas
            </p>
          </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('myFiles.searchPlaceholder', { defaultValue: 'Buscar en mis archivos...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-files"
              />
            </div>
            
            {/* Platform Filter */}
            <div className="flex border border-border rounded-lg">
              <Button
                variant={platformFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPlatformFilter('all')}
                className="rounded-r-none px-3"
                data-testid="button-filter-all"
              >
                Todos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlatformFilter('google')}
                className={`rounded-none border-l px-3 ${platformFilter === 'google' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}`}
                data-testid="button-filter-google"
              >
                <GoogleDriveLogo className="w-4 h-4 mr-1" />
                Drive
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlatformFilter('dropbox')}
                className={`rounded-l-none border-l px-3 ${platformFilter === 'dropbox' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}`}
                data-testid="button-filter-dropbox"
              >
                <DropboxLogo className="w-4 h-4 mr-1" />
                Dropbox
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
                data-testid="button-view-grid"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none border-l"
                data-testid="button-view-list"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Files Grid/List */}
        {filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? t('myFiles.noFilesFound', { defaultValue: 'No se encontraron archivos' }) : t('myFiles.noFilesCopied', { defaultValue: 'No hay archivos copiados' })}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchTerm 
                  ? t('myFiles.tryDifferentSearch', { defaultValue: 'Intenta con otros términos de búsqueda.' })
                  : platformFilter === 'dropbox'
                    ? 'Los archivos y carpetas de Dropbox aparecerán aquí.'
                    : platformFilter === 'google'
                      ? 'Los archivos y carpetas de Google Drive aparecerán aquí.'
                      : t('myFiles.filesWillAppearHere', { defaultValue: 'Tus archivos aparecerán aquí una vez copiados.' })
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : 
            "space-y-2"
          }>
            {filteredFiles.map((file: CloudFile) => (
              <Card 
                key={file.id} 
                className="hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => handleCardClick(file)}
                data-testid={`card-file-${file.id}`}
              >
                <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center space-x-4'}>
                  <div className={viewMode === 'grid' ? 'space-y-3' : 'flex items-center space-x-3 flex-1'}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                        {getFileIcon(file.mimeType || undefined)}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4">
                          {file.provider === 'dropbox' ? (
                            <DropboxLogo className="w-4 h-4" />
                          ) : (
                            <GoogleDriveLogo className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'min-w-0 flex-1'}>
                        <h3 className="font-medium text-sm truncate max-w-[180px]" title={file.fileName}>
                          {file.fileName}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.fileSize || undefined)}</span>
                          <span>•</span>
                          <span>{formatDate(file.createdAt!)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {viewMode === 'grid' && (
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Copiado
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDownload(file, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            data-testid={`button-download-${file.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                data-testid={`button-more-${file.id}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={(e) => handleViewDetails(file, e as any)} data-testid={`menu-details-${file.id}`}>
                                <Info className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleOpenInCloud(file, e as any)} data-testid={`menu-open-cloud-${file.id}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir en {getProviderName(file)}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDownload(file, e as any)} data-testid={`menu-download-${file.id}`}>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => handleCopyLink(file, e as any)} data-testid={`menu-copy-link-${file.id}`}>
                                <Link2 className="w-4 h-4 mr-2" />
                                Copiar enlace
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleShare(file, e as any)} data-testid={`menu-share-${file.id}`}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 flex-shrink-0">
                        {file.provider === 'dropbox' ? (
                          <DropboxLogo className="w-4 h-4" />
                        ) : (
                          <GoogleDriveLogo className="w-4 h-4" />
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Copiado
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDownload(file, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => handleViewDetails(file, e as any)}>
                            <Info className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleOpenInCloud(file, e as any)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir en {getProviderName(file)}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDownload(file, e as any)}>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => handleCopyLink(file, e as any)}>
                            <Link2 className="w-4 h-4 mr-2" />
                            Copiar enlace
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleShare(file, e as any)} data-testid={`menu-share-list-${file.id}`}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 border rounded-lg bg-white">
              <div className="flex items-center text-sm text-muted-foreground">
                <span data-testid={`text-showing-${Math.min((currentPage - 1) * itemsPerPage + 1, total)}-to-${Math.min(currentPage * itemsPerPage, total)}-of-${total}`}>
                  {t('myFiles.showing')} {Math.min((currentPage - 1) * itemsPerPage + 1, total)} {t('myFiles.to')} {Math.min(currentPage * itemsPerPage, total)} {t('myFiles.of')} {total} {t('myFiles.files')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center space-x-1"
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('myFiles.previous')}</span>
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center space-x-1"
                  data-testid="button-next-page"
                >
                  <span>{t('myFiles.next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* File Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedFile && getFileIcon(selectedFile.mimeType || undefined)}
              <span className="truncate">{selectedFile?.fileName}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-4">
              {/* File Name Full */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Nombre completo</p>
                <p className="text-sm font-medium break-all">{selectedFile.fileName}</p>
              </div>

              {/* File Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tamaño</p>
                    <p className="text-sm font-medium">{formatFileSize(selectedFile.fileSize || undefined)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="text-sm font-medium">{getFileType(selectedFile.mimeType || undefined)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 col-span-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de copia</p>
                    <p className="text-sm font-medium">{formatFullDate(selectedFile.createdAt!)}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Copiado exitosamente
                </Badge>
              </div>

              {/* Provider indicator */}
              <div className="flex items-center gap-2">
                {selectedFile.provider === 'dropbox' ? (
                  <DropboxLogo className="w-5 h-5" />
                ) : (
                  <GoogleDriveLogo className="w-5 h-5" />
                )}
                <span className="text-sm text-muted-foreground">
                  Almacenado en {getProviderName(selectedFile)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => handleOpenInCloud(selectedFile)} 
                  className="flex-1"
                  data-testid="button-dialog-open-cloud"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir en {getProviderName(selectedFile)}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDownload(selectedFile)}
                  data-testid="button-dialog-download"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleCopyLink(selectedFile)}
                  data-testid="button-dialog-copy-link"
                >
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
          id: fileToShare.copiedFileId || fileToShare.id?.toString() || "",
          name: fileToShare.fileName,
          type: fileToShare.mimeType?.includes("folder") ? "folder" : "file",
          size: fileToShare.fileSize,
          mimeType: fileToShare.mimeType,
          provider: (fileToShare.provider as "google" | "dropbox") || "google",
          path: null,
        } : null}
      />
    </div>
  );
}
