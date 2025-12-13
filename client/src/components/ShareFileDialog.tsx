import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Share2, FileText, Folder, User, Search, ArrowLeft } from "lucide-react";
import { SiGoogledrive, SiDropbox } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FileToShare {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number | null;
  mimeType?: string | null;
  provider: "google" | "dropbox";
  path?: string | null;
}

interface ShareFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileToShare | null;
  onBack?: () => void;
}

interface UserResult {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

const shareFormSchema = z.object({
  recipientEmail: z.string().min(1, "Ingresa un email o busca por nombre"),
  message: z.string().max(500, "El mensaje no puede exceder 500 caracteres").optional(),
});

type ShareFormValues = z.infer<typeof shareFormSchema>;

function formatFileSize(bytes: number | null | undefined): string {
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

export default function ShareFileDialog({ open, onOpenChange, file, onBack }: ShareFileDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      recipientEmail: "",
      message: "",
    },
  });

  const { data: userSuggestions = [], isLoading: isSearching } = useQuery<UserResult[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.length >= 2 && !selectedUser,
  });

  useEffect(() => {
    if (userSuggestions.length > 0 && !selectedUser && searchQuery.length >= 2) {
      setShowSuggestions(true);
    } else if (userSuggestions.length === 0 || selectedUser || searchQuery.length < 2) {
      setShowSuggestions(false);
    }
  }, [userSuggestions, selectedUser, searchQuery]);

  const shareMutation = useMutation({
    mutationFn: async (data: ShareFormValues) => {
      if (!file) throw new Error("No file selected");
      
      const emailToUse = selectedUser?.email || data.recipientEmail;
      
      return apiRequest("POST", "/api/shares", {
        recipientEmail: emailToUse,
        provider: file.provider,
        fileId: file.id,
        filePath: file.path || null,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size || null,
        mimeType: file.mimeType || null,
        message: data.message || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Archivo compartido",
        description: `Se ha enviado una invitación a ${selectedUser?.name || form.getValues("recipientEmail")}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shares/outbox"] });
      form.reset();
      setSelectedUser(null);
      setSearchQuery("");
      onOpenChange(false);
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      const message = error?.message || "No se pudo compartir el archivo. Intenta de nuevo.";
      toast({
        title: "Error al compartir",
        description: message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ShareFormValues) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailToUse = selectedUser?.email || data.recipientEmail;
    
    if (!emailRegex.test(emailToUse)) {
      toast({
        title: "Email inválido",
        description: "Por favor selecciona un usuario de las sugerencias o ingresa un email válido.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    shareMutation.mutate(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedUser(null);
      setSearchQuery("");
      setShowSuggestions(false);
    }
    onOpenChange(newOpen);
  };

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
    form.setValue("recipientEmail", user.email);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    form.setValue("recipientEmail", "");
    setSearchQuery("");
  };

  const handleInputChange = (value: string) => {
    if (selectedUser) {
      setSelectedUser(null);
    }
    setSearchQuery(value);
    form.setValue("recipientEmail", value);
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-share-file">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Compartir archivo
          </DialogTitle>
          <DialogDescription>
            Envía este archivo a otro usuario de la plataforma
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-muted rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
              {file.type === "folder" ? (
                <Folder className="w-5 h-5 text-yellow-600" />
              ) : (
                <FileText className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" title={file.name}>
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {file.provider === "google" ? (
                  <SiGoogledrive className="w-3 h-3 text-green-600" />
                ) : (
                  <SiDropbox className="w-3 h-3 text-blue-500" />
                )}
                <span>{file.provider === "google" ? "Google Drive" : "Dropbox"}</span>
                {file.size && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Email o nombre del destinatario
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      {selectedUser ? (
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedUser.avatar || undefined} />
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedUser.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearUser}
                            className="h-6 w-6 p-0"
                            data-testid="button-clear-recipient"
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Input
                            placeholder="Buscar por email o nombre..."
                            value={searchQuery || field.value}
                            onChange={(e) => handleInputChange(e.target.value)}
                            data-testid="input-recipient-email"
                          />
                          {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </>
                      )}
                      
                      {showSuggestions && userSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {userSuggestions.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left"
                              onClick={() => handleSelectUser(user)}
                              data-testid={`user-suggestion-${user.id}`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe un mensaje para el destinatario..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-share-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-between pt-2">
              <div>
                {onBack && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      form.reset();
                      setSelectedUser(null);
                      setSearchQuery("");
                      setShowSuggestions(false);
                      onBack();
                    }}
                    disabled={isSubmitting}
                    data-testid="button-back-share"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  data-testid="button-cancel-share"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (!selectedUser && !form.getValues("recipientEmail"))}
                  data-testid="button-confirm-share"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Compartiendo...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
