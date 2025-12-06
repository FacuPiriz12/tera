import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  Eye
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
import { useToast } from "@/hooks/use-toast";
import type { DriveFile } from "@shared/schema";
import { getAuthHeaders } from "@/lib/queryClient";

export default function MyFiles() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const itemsPerPage = 10;
  
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

  const files = filesData.files || [];
  const total = filesData.total || 0;
  const totalPages = filesData.totalPages || 0;

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

  const handleDownload = (file: DriveFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.copiedFileId}`;
    window.open(downloadUrl, '_blank');
  };

  const handleOpenInDrive = (file: DriveFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const driveUrl = `https://drive.google.com/file/d/${file.copiedFileId}/view`;
    window.open(driveUrl, '_blank');
  };

  const handleCopyLink = (file: DriveFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const driveUrl = `https://drive.google.com/file/d/${file.copiedFileId}/view`;
    navigator.clipboard.writeText(driveUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace se ha copiado al portapapeles",
    });
  };

  const handleViewDetails = (file: DriveFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedFile(file);
    setDetailsOpen(true);
  };

  const handleCardClick = (file: DriveFile) => {
    setSelectedFile(file);
    setDetailsOpen(true);
  };

  const filteredFiles = files.filter((file: DriveFile) =>
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-my-files">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[1.5rem] font-semibold text-foreground mb-2">{t('myFiles.title')}</h1>
            <p className="text-muted-foreground">
              Archivos y Carpetas
            </p>
          </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('myFiles.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-files"
            />
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
                {searchTerm ? t('myFiles.noFilesFound') : t('myFiles.noFilesCopied')}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchTerm 
                  ? t('myFiles.tryDifferentSearch')
                  : t('myFiles.filesWillAppearHere')
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : 
            "space-y-2"
          }>
            {filteredFiles.map((file: DriveFile) => (
              <Card 
                key={file.id} 
                className="hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => handleCardClick(file)}
                data-testid={`card-file-${file.id}`}
              >
                <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center space-x-4'}>
                  <div className={viewMode === 'grid' ? 'space-y-3' : 'flex items-center space-x-3 flex-1'}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getFileIcon(file.mimeType || undefined)}
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
                              <DropdownMenuItem onClick={(e) => handleOpenInDrive(file, e as any)} data-testid={`menu-open-drive-${file.id}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir en Google Drive
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex items-center space-x-2">
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
                          <DropdownMenuItem onClick={(e) => handleOpenInDrive(file, e as any)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir en Google Drive
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

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => handleOpenInDrive(selectedFile)} 
                  className="flex-1"
                  data-testid="button-dialog-open-drive"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir en Drive
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
    </div>
  );
}
