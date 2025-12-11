import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
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
} from "lucide-react";
import { SiGoogledrive, SiDropbox } from "react-icons/si";
import ShareFileDialog from "@/components/ShareFileDialog";
import type { DriveFile } from "@shared/schema";

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

function InboxItem({ share, onRespond, isResponding }: {
  share: ShareRequest;
  onRespond: (id: string, action: "accept" | "reject") => void;
  isResponding: boolean;
}) {
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
          
          {share.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                onClick={() => onRespond(share.id, "accept")}
                disabled={isResponding}
                data-testid={`accept-share-${share.id}`}
              >
                {isResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                onClick={() => onRespond(share.id, "reject")}
                disabled={isResponding}
                data-testid={`reject-share-${share.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
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

function getFileIcon(file: DriveFile) {
  const mimeType = file.mimeType || "";
  if (mimeType.includes("folder")) {
    return <FolderOpen className="w-5 h-5 text-yellow-600" />;
  }
  if (mimeType.includes("image")) {
    return <Image className="w-5 h-5 text-purple-600" />;
  }
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  }
  if (mimeType.includes("document") || mimeType.includes("word")) {
    return <FileText className="w-5 h-5 text-blue-600" />;
  }
  return <File className="w-5 h-5 text-gray-600" />;
}

interface FilePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: (file: DriveFile, provider: "google" | "dropbox") => void;
}

function FilePickerDialog({ open, onOpenChange, onSelectFile }: FilePickerDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<"google" | "dropbox">("google");
  
  const { data: response, isLoading } = useQuery<{ files: DriveFile[]; total: number; totalPages: number }>({
    queryKey: ["/api/drive-files"],
    enabled: open,
  });

  const files = response?.files || [];
  const googleFiles = files.filter(f => f.provider === "google");
  const dropboxFiles = files.filter(f => f.provider === "dropbox");
  
  const currentFiles = selectedProvider === "google" ? googleFiles : dropboxFiles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="dialog-file-picker">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Seleccionar archivo para compartir
          </DialogTitle>
          <DialogDescription>
            Elige un archivo o carpeta de tu almacenamiento
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as "google" | "dropbox")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="google" className="flex items-center gap-2" data-testid="tab-google-files">
              <SiGoogledrive className="h-4 w-4" />
              Google Drive
              {googleFiles.length > 0 && (
                <Badge variant="secondary" className="ml-1">{googleFiles.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="dropbox" className="flex items-center gap-2" data-testid="tab-dropbox-files">
              <SiDropbox className="h-4 w-4" />
              Dropbox
              {dropboxFiles.length > 0 && (
                <Badge variant="secondary" className="ml-1">{dropboxFiles.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

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
                  No hay archivos en {selectedProvider === "google" ? "Google Drive" : "Dropbox"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ve a "Mis Archivos" para copiar archivos primero
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {currentFiles.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                    onClick={() => onSelectFile(file, selectedProvider)}
                    data-testid={`file-picker-item-${file.id}`}
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.fileSize ? formatFileSize(file.fileSize) : ""}
                      </p>
                    </div>
                    {selectedProvider === "google" ? (
                      <SiGoogledrive className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <SiDropbox className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function ShareInbox() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inbox");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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
  });

  const { data: outbox = [], isLoading: outboxLoading } = useQuery<ShareRequest[]>({
    queryKey: ["/api/shares/outbox"],
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "accept" | "reject" }) => {
      return apiRequest("PATCH", `/api/shares/${id}/respond`, { action });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shares/inbox"] });
      toast({
        title: action === "accept" ? "Archivo aceptado" : "Archivo rechazado",
        description: action === "accept"
          ? "El archivo ha sido añadido a tu almacenamiento."
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

  const handleRespond = (id: string, action: "accept" | "reject") => {
    setRespondingId(id);
    respondMutation.mutate({ id, action });
  };

  const handleCancel = (id: string) => {
    setCancellingId(id);
    cancelMutation.mutate(id);
  };

  const handleSelectFile = (file: DriveFile, provider: "google" | "dropbox") => {
    setFileToShare({
      id: file.copiedFileId || file.id?.toString() || "",
      name: file.fileName,
      type: file.mimeType?.includes("folder") ? "folder" : "file",
      size: file.fileSize,
      mimeType: file.mimeType,
      provider: provider,
      path: null,
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
          ) : inbox.length === 0 ? (
            <EmptyState type="inbox" />
          ) : (
            <div>
              {inbox.map((share) => (
                <InboxItem
                  key={share.id}
                  share={share}
                  onRespond={handleRespond}
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
          ) : outbox.length === 0 ? (
            <EmptyState type="outbox" />
          ) : (
            <div>
              {outbox.map((share) => (
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
      />
    </div>
  );
}
