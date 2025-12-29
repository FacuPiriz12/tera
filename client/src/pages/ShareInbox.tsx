import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Inbox,
  Send,
  Check,
  X,
  FileText,
  FolderOpen,
  Clock,
  Mail,
  MailOpen,
  Loader2,
  User,
  Cloud,
  Plus,
  Image,
  FileSpreadsheet,
  File,
  MoreVertical,
  Eye,
  Upload,
  HardDrive,
  ChevronRight,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SiGoogledrive, SiDropbox } from "react-icons/si";
import ShareFileDialog from "@/components/ShareFileDialog";
import FolderBrowserModal from "@/components/FolderBrowserModal";
import type { DriveFile } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface ShareRequest {
  id: string;
  senderId: string;
  recipientId: string;
  recipientEmail: string;
  provider: string;
  fileId: string;
  filePath: string | null;
  fileName: string;
  fileType: "file" | "folder";
  fileSize: number | null;
  mimeType: string | null;
  message: string | null;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "expired";
  createdAt: string;
  respondedAt: string | null;
  expiresAt: string | null;
  senderName?: string;
  senderEmail?: string;
  senderAvatar?: string | null;
  recipientName?: string;
  recipientAvatar?: string | null;
}

interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  path?: string;
  isFolder: boolean;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getProviderIcon(provider: string) {
  switch (provider) {
    case "google":
      return <SiGoogledrive className="h-4 w-4 text-green-600" />;
    case "dropbox":
      return <SiDropbox className="h-4 w-4 text-blue-500" />;
    default:
      return <Cloud className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusBadge(status: ShareRequest["status"]) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pendiente</Badge>;
    case "accepted":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Aceptado</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rechazado</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Cancelado</Badge>;
    case "expired":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Expirado</Badge>;
    default:
      return null;
  }
}

function ShareItemSkeleton() {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: "inbox" | "outbox" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
        {type === "inbox" ? (
          <MailOpen className="h-12 w-12 text-gray-400" />
        ) : (
          <Send className="h-12 w-12 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {type === "inbox" ? "No hay archivos recibidos" : "No has compartido archivos"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {type === "inbox"
          ? "Cuando otros usuarios te compartan archivos, aparecerán aquí."
          : "Los archivos que compartas con otros usuarios aparecerán aquí."}
      </p>
    </div>
  );
}

interface InboxItemProps {
  share: ShareRequest;
  onRespond: (id: string, action: "accept" | "reject") => void;
  onSendTo: (share: ShareRequest, provider: "google" | "dropbox") => void;
  onViewDetails: (share: ShareRequest) => void;
  isResponding: boolean;
}

function InboxItem({ share, onRespond, onSendTo, onViewDetails, isResponding }: InboxItemProps) {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow" data-testid={`share-inbox-item-${share.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={share.senderAvatar || undefined} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {share.senderName || share.senderEmail}
              </span>
              {getStatusBadge(share.status)}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              {share.fileType === "folder" ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="truncate font-medium">{share.fileName}</span>
              {share.fileSize && (
                <span className="text-gray-400">({formatFileSize(share.fileSize)})</span>
              )}
              {getProviderIcon(share.provider)}
            </div>
            
            {share.message && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                "{share.message}"
              </p>
            )}
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(share.createdAt), { addSuffix: true, locale: es })}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`menu-share-${share.id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {share.status === "pending" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onRespond(share.id, "accept")}
                    disabled={isResponding}
                    className="text-green-600"
                    data-testid={`menu-accept-${share.id}`}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aceptar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRespond(share.id, "reject")}
                    disabled={isResponding}
                    className="text-red-600"
                    data-testid={`menu-reject-${share.id}`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem onClick={() => onViewDetails(share)} data-testid={`menu-details-${share.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              
              {share.status === "accepted" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onSendTo(share, share.provider as "google" | "dropbox")} 
                    data-testid={`menu-sendto-${share.id}`}
                  >
                    <HardDrive className="h-4 w-4 mr-2" />
                    Copiar a Mi Unidad
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      const url = `/api/shares/${share.id}/download`;
                      window.open(url, '_blank');
                    }}
                    data-testid={`menu-download-${share.id}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Descargar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function OutboxItem({ share, onCancel, isCancelling }: {
  share: ShareRequest;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow" data-testid={`share-outbox-item-${share.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={share.recipientAvatar || undefined} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Para:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {share.recipientName || share.recipientEmail}
              </span>
              {getStatusBadge(share.status)}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              {share.fileType === "folder" ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="truncate font-medium">{share.fileName}</span>
              {share.fileSize && (
                <span className="text-gray-400">({formatFileSize(share.fileSize)})</span>
              )}
              {getProviderIcon(share.provider)}
            </div>
            
            {share.message && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                "{share.message}"
              </p>
            )}
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(share.createdAt), { addSuffix: true, locale: es })}
            </div>
          </div>
          
          {share.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="text-gray-600 hover:text-red-600 hover:border-red-300"
              onClick={() => onCancel(share.id)}
              disabled={isCancelling}
              data-testid={`cancel-share-${share.id}`}
            >
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getFileIcon(file: DriveFile | CloudFile) {
  const mimeType = 'mimeType' in file ? file.mimeType : "";
  if (mimeType?.includes("folder")) {
    return <FolderOpen className="w-5 h-5 text-yellow-600" />;
  }
  if (mimeType?.includes("image")) {
    return <Image className="w-5 h-5 text-purple-600" />;
  }
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) {
    return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  }
  if (mimeType?.includes("document") || mimeType?.includes("word")) {
    return <FileText className="w-5 h-5 text-blue-600" />;
  }
  return <File className="w-5 h-5 text-gray-600" />;
}

interface FilePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: (file: any, provider: "google" | "dropbox") => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

function FilePickerDialog({ open, onOpenChange, onSelectFile, onBack, showBackButton }: FilePickerDialogProps) {
  const [selectedSource, setSelectedSource] = useState<"myfiles" | "google" | "dropbox">("myfiles");
  const [currentPath, setCurrentPath] = useState<string>("");
  const [pathHistory, setPathHistory] = useState<Array<{name: string, path: string}>>([]);
  
  const { data: googleStatus } = useQuery({
    queryKey: ['/api/auth/google/status'],
    enabled: open
  });

  const { data: dropboxStatus } = useQuery({
    queryKey: ['/api/auth/dropbox/status'],
    enabled: open
  });

  const { data: myFilesResponse, isLoading: myFilesLoading } = useQuery<{ files: DriveFile[]; total: number; totalPages: number }>({
    queryKey: ["/api/drive-files", { limit: 100 }],
    queryFn: async () => {
      const response = await fetch("/api/drive-files?limit=100");
      if (!response.ok) return { files: [], total: 0, totalPages: 0 };
      return response.json();
    },
    enabled: open && selectedSource === "myfiles",
  });

  const { data: googleFiles = [], isLoading: googleLoading } = useQuery<CloudFile[]>({
    queryKey: ['/api/google-drive-files', currentPath],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/drive/list-files', { fileId: currentPath || 'root' });
      const data = await response.json();
      return data.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? parseInt(file.size) : undefined,
        path: file.id,
        isFolder: file.mimeType === 'application/vnd.google-apps.folder'
      }));
    },
    enabled: open && selectedSource === "google" && googleStatus?.connected,
  });

  const { data: dropboxFiles = [], isLoading: dropboxLoading } = useQuery<CloudFile[]>({
    queryKey: ['/api/dropbox-files', currentPath],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/dropbox/files?path=${encodeURIComponent(currentPath)}`);
      const data = await response.json();
      return data.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        path: currentPath ? `${currentPath}/${file.name}` : `/${file.name}`,
        isFolder: file.mimeType === 'application/vnd.dropbox.folder'
      }));
    },
    enabled: open && selectedSource === "dropbox" && dropboxStatus?.connected,
  });

  const myFiles = myFilesResponse?.files || [];
  const googleFilesFromMyFiles = myFiles.filter(f => f.provider === "google");
  const dropboxFilesFromMyFiles = myFiles.filter(f => f.provider === "dropbox");
  
  const isLoading = selectedSource === "myfiles" ? myFilesLoading : 
                    selectedSource === "google" ? googleLoading : dropboxLoading;

  const handleFolderClick = (file: CloudFile) => {
    if (file.isFolder) {
      setPathHistory(prev => [...prev, { name: file.name, path: currentPath }]);
      setCurrentPath(file.path || file.id);
    }
  };

  const handleGoBack = () => {
    if (pathHistory.length > 0) {
      const prev = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      setCurrentPath(prev.path);
    }
  };

  const handleGoHome = () => {
    setPathHistory([]);
    setCurrentPath("");
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source as "myfiles" | "google" | "dropbox");
    setCurrentPath("");
    setPathHistory([]);
  };

  const handleSelectFile = (file: CloudFile | DriveFile) => {
    if ('isFolder' in file && file.isFolder) {
      handleFolderClick(file);
      return;
    }
    
    const provider = selectedSource === "myfiles" 
      ? ('provider' in file ? file.provider as "google" | "dropbox" : "google")
      : selectedSource as "google" | "dropbox";
    
    onSelectFile(file, provider);
  };

  const getCurrentFiles = () => {
    if (selectedSource === "myfiles") {
      return [...googleFilesFromMyFiles, ...dropboxFilesFromMyFiles];
    }
    if (selectedSource === "google") {
      return googleFiles;
    }
    return dropboxFiles;
  };

  const currentFiles = getCurrentFiles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col" data-testid="dialog-file-picker">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Seleccionar archivo para compartir
          </DialogTitle>
          <DialogDescription>
            Elige un archivo o carpeta de tu almacenamiento
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedSource} onValueChange={handleSourceChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="myfiles" className="flex items-center gap-1 text-xs" data-testid="tab-myfiles">
              <HardDrive className="h-3 w-3" />
              Mis Archivos
            </TabsTrigger>
            <TabsTrigger 
              value="google" 
              className="flex items-center gap-1 text-xs" 
              data-testid="tab-google-drive"
              disabled={!googleStatus?.connected}
            >
              <SiGoogledrive className="h-3 w-3" />
              Google Drive
            </TabsTrigger>
            <TabsTrigger 
              value="dropbox" 
              className="flex items-center gap-1 text-xs" 
              data-testid="tab-dropbox"
              disabled={!dropboxStatus?.connected}
            >
              <SiDropbox className="h-3 w-3" />
              Dropbox
            </TabsTrigger>
          </TabsList>

          {(pathHistory.length > 0 || currentPath) && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Button variant="ghost" size="sm" onClick={handleGoHome} data-testid="button-go-home">
                <Home className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack} 
                disabled={pathHistory.length === 0}
                data-testid="button-go-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground truncate">
                {pathHistory.map(p => p.name).join(" / ") || "Raíz"}
              </span>
            </div>
          )}

          <ScrollArea className="h-[300px] rounded-md border p-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : currentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Cloud className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {selectedSource === "myfiles" 
                    ? "No hay archivos guardados" 
                    : selectedSource === "google" 
                      ? (googleStatus?.connected ? "No hay archivos en esta carpeta" : "Conecta tu Google Drive primero")
                      : (dropboxStatus?.connected ? "No hay archivos en esta carpeta" : "Conecta tu Dropbox primero")}
                </p>
                {selectedSource === "myfiles" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Ve a "Mis Archivos" para copiar archivos primero
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {currentFiles.map((file) => {
                  const fileId = 'id' in file ? file.id : file.id;
                  const fileName = 'fileName' in file ? file.fileName : file.name;
                  const fileSize = 'fileSize' in file ? file.fileSize : file.size;
                  const isFolder = 'isFolder' in file ? file.isFolder : ('mimeType' in file && file.mimeType?.includes('folder'));
                  const provider = 'provider' in file ? file.provider : selectedSource;
                  
                  return (
                    <button
                      key={fileId}
                      type="button"
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                      onClick={() => handleSelectFile(file)}
                      data-testid={`file-picker-item-${fileId}`}
                    >
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {fileSize ? formatFileSize(fileSize) : ""}
                        </p>
                      </div>
                      {isFolder ? (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      ) : provider === "google" ? (
                        <SiGoogledrive className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <SiDropbox className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ShareDetailsDialogProps {
  share: ShareRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ShareDetailsDialog({ share, open, onOpenChange }: ShareDetailsDialogProps) {
  if (!share) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-share-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Detalles del archivo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
              {share.fileType === "folder" ? (
                <FolderOpen className="w-6 h-6 text-yellow-600" />
              ) : (
                <FileText className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{share.fileName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getProviderIcon(share.provider)}
                <span>{share.provider === "google" ? "Google Drive" : "Dropbox"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{share.fileType === "folder" ? "Carpeta" : "Archivo"}</span>
            </div>
            {share.fileSize && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tamaño:</span>
                <span className="font-medium">{formatFileSize(share.fileSize)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">De:</span>
              <span className="font-medium">{share.senderName || share.senderEmail}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(share.createdAt), { addSuffix: true, locale: es })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estado:</span>
              {getStatusBadge(share.status)}
            </div>
            {share.message && (
              <div className="pt-2 border-t">
                <span className="text-sm text-muted-foreground block mb-1">Mensaje:</span>
                <p className="text-sm italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  "{share.message}"
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ShareInbox() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<ShareRequest | null>(null);
  const [folderBrowserOpen, setFolderBrowserOpen] = useState(false);
  const [sendToProvider, setSendToProvider] = useState<"google" | "dropbox">("google");
  const [shareToSend, setShareToSend] = useState<ShareRequest | null>(null);
  const [fileToShare, setFileToShare] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
    size?: number | null;
    mimeType?: string | null;
    provider: "google" | "dropbox";
    path?: string | null;
  } | null>(null);

  const { data: inbox = [], isLoading: inboxLoading } = useQuery<ShareRequest[]>({
    queryKey: ["/api/shares/inbox"],
    enabled: isAuthenticated,
  });

  const { data: outbox = [], isLoading: outboxLoading } = useQuery<ShareRequest[]>({
    queryKey: ["/api/shares/outbox"],
    enabled: isAuthenticated,
  });

  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInbox = useMemo(() => {
    return inbox.filter(s => 
      (s.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (s.senderName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
       (s.senderEmail || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || s.status === statusFilter)
    );
  }, [inbox, searchQuery, statusFilter]);

  const filteredOutbox = useMemo(() => {
    return outbox.filter(s => 
      (s.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (s.recipientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
       (s.recipientEmail || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || s.status === statusFilter)
    );
  }, [outbox, searchQuery, statusFilter]);

  const respondMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "accept" | "reject" }) => {
      return apiRequest("PATCH", `/api/shares/${id}/respond`, { action });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shares/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drive-files"] });
      toast({
        title: action === "accept" ? "Archivo aceptado" : "Archivo rechazado",
        description: action === "accept"
          ? "El archivo ha sido añadido a Mis Archivos."
          : "Has rechazado el archivo compartido.",
      });
      setRespondingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo procesar la respuesta. Intenta de nuevo.",
        variant: "destructive",
      });
      setRespondingId(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/shares/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shares/outbox"] });
      toast({
        title: "Compartido cancelado",
        description: "El archivo ya no será compartido con el destinatario.",
      });
      setCancellingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cancelar el compartido. Intenta de nuevo.",
        variant: "destructive",
      });
      setCancellingId(null);
    },
  });

  const sendToMutation = useMutation({
    mutationFn: async ({ shareId, provider, destinationFolderId, destinationPath }: { 
      shareId: string; 
      provider: "google" | "dropbox"; 
      destinationFolderId?: string;
      destinationPath?: string;
    }) => {
      return apiRequest("POST", `/api/shares/${shareId}/send-to`, { 
        provider, 
        destinationFolderId,
        destinationPath 
      });
    },
    onSuccess: (_, { provider }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shares/inbox"] });
      toast({
        title: "Archivo enviado",
        description: `El archivo se está copiando a ${provider === "google" ? "Google Drive" : "Dropbox"}.`,
      });
      setFolderBrowserOpen(false);
      setShareToSend(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el archivo. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleRespond = (id: string, action: "accept" | "reject") => {
    setRespondingId(id);
    respondMutation.mutate({ id, action });
  };

  const handleCancel = (id: string) => {
    setCancellingId(id);
    cancelMutation.mutate(id);
  };

  const handleSendTo = (share: ShareRequest, provider: "google" | "dropbox") => {
    setShareToSend(share);
    setSendToProvider(provider);
    setFolderBrowserOpen(true);
  };

  const handleViewDetails = (share: ShareRequest) => {
    setSelectedShare(share);
    setDetailsDialogOpen(true);
  };

  const handleFolderSelect = (folder: { id?: string; path?: string; name: string; provider: "google" | "dropbox" }) => {
    if (shareToSend) {
      sendToMutation.mutate({
        shareId: shareToSend.id,
        provider: folder.provider,
        destinationFolderId: folder.id,
        destinationPath: folder.path,
      });
    }
  };

  const handleSelectFile = (file: any, provider: "google" | "dropbox") => {
    const fileName = file.fileName || file.name;
    const fileSize = file.fileSize || file.size;
    const mimeType = file.mimeType;
    const isFolder = mimeType?.includes('folder') || file.isFolder;
    
    setFileToShare({
      id: file.copiedFileId || file.id?.toString() || "",
      name: fileName,
      type: isFolder ? "folder" : "file",
      size: fileSize,
      mimeType: mimeType,
      provider: provider,
      path: file.path || null,
    });
    setFilePickerOpen(false);
    setShareDialogOpen(true);
  };

  const pendingInboxCount = inbox.filter(s => s.status === "pending").length;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Archivos Compartidos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los archivos que otros usuarios te han compartido
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingInboxCount > 0 && (
            <Badge className="bg-blue-500 text-white">
              {pendingInboxCount} pendiente{pendingInboxCount > 1 ? "s" : ""}
            </Badge>
          )}
          <Button 
            onClick={() => setFilePickerOpen(true)}
            data-testid="button-new-share"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo compartido
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o remitente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-shares"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="accepted">Aceptados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="inbox" className="flex items-center gap-2" data-testid="tab-inbox">
            <Inbox className="h-4 w-4" />
            Bandeja de Entrada
            {pendingInboxCount > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingInboxCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outbox" className="flex items-center gap-2" data-testid="tab-outbox">
            <Send className="h-4 w-4" />
            Enviados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          {inboxLoading ? (
            <>
              <ShareItemSkeleton />
              <ShareItemSkeleton />
              <ShareItemSkeleton />
            </>
          ) : filteredInbox.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed">
              <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Inbox className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all" ? "No se encontraron resultados" : "Tu bandeja está vacía"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {searchQuery || statusFilter !== "all" 
                  ? "Prueba con otros términos de búsqueda o filtros." 
                  : "Cuando otros usuarios te compartan archivos, aparecerán aquí con opciones para aceptarlos o ver detalles."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInbox.map((share) => (
                <InboxItem
                  key={share.id}
                  share={share}
                  onRespond={handleRespond}
                  onSendTo={handleSendTo}
                  onViewDetails={handleViewDetails}
                  isResponding={respondingId === share.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outbox">
          {outboxLoading ? (
            <>
              <ShareItemSkeleton />
              <ShareItemSkeleton />
              <ShareItemSkeleton />
            </>
          ) : filteredOutbox.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed">
              <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Send className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all" ? "No se encontraron resultados" : "No has enviado nada aún"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {searchQuery || statusFilter !== "all" 
                  ? "Prueba con otros términos de búsqueda o filtros." 
                  : "Comienza a compartir archivos con otros usuarios haciendo clic en 'Nuevo compartido'."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOutbox.map((share) => (
                <OutboxItem
                  key={share.id}
                  share={share}
                  onCancel={handleCancel}
                  isCancelling={cancellingId === share.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FilePickerDialog
        open={filePickerOpen}
        onOpenChange={setFilePickerOpen}
        onSelectFile={handleSelectFile}
      />

      <ShareFileDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        file={fileToShare}
        onBack={() => {
          setShareDialogOpen(false);
          setFilePickerOpen(true);
        }}
      />

      <ShareDetailsDialog
        share={selectedShare}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <FolderBrowserModal
        open={folderBrowserOpen}
        onOpenChange={setFolderBrowserOpen}
        provider={sendToProvider}
        onSelect={handleFolderSelect}
      />
    </div>
  );
}
