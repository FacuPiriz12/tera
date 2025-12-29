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
  recipientEmails: z.array(z.object({
    email: z.string().email("Email inválido"),
    name: z.string().optional(),
  })).min(1, "Agrega al menos un destinatario"),
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

  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      recipientEmails: [],
      message: "",
    },
  });

  const recipientEmails = form.watch("recipientEmails");

  const { data: userSuggestions = [], isLoading: isSearching } = useQuery<UserResult[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  useEffect(() => {
    if (userSuggestions.length > 0 && searchQuery.length >= 2) {
      setShowSuggestions(true);
    } else if (userSuggestions.length === 0 || searchQuery.length < 2) {
      setShowSuggestions(false);
    }
  }, [userSuggestions, searchQuery]);

  const shareMutation = useMutation({
    mutationFn: async (data: ShareFormValues) => {
      if (!file) throw new Error("No file selected");
      
      const sharePromises = data.recipientEmails.map(recipient =>
        apiRequest("POST", "/api/shares", {
          recipientEmail: recipient.email,
          provider: file.provider,
          fileId: file.id,
          filePath: file.path || null,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size || null,
          mimeType: file.mimeType || null,
          message: data.message || null,
        })
      );
      
      return Promise.all(sharePromises);
    },
    onSuccess: (_, data) => {
      const count = data.recipientEmails.length;
      toast({
        title: "Archivo compartido",
        description: `Se ha enviado invitación a ${count} usuario${count !== 1 ? 's' : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shares/outbox"] });
      form.reset({ recipientEmails: [], message: "" });
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
    setIsSubmitting(true);
    shareMutation.mutate(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({ recipientEmails: [], message: "" });
      setSearchQuery("");
      setShowSuggestions(false);
    }
    onOpenChange(newOpen);
  };

  const handleAddUser = (user: UserResult) => {
    const currentEmails = form.getValues("recipientEmails") || [];
    if (!currentEmails.find(e => e.email === user.email)) {
      form.setValue("recipientEmails", [...currentEmails, { email: user.email, name: user.name }]);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSelectUser = (user: UserResult) => {
    handleAddUser(user);
  };


  const handleRemoveEmail = (email: string) => {
    const currentEmails = form.getValues("recipientEmails") || [];
    form.setValue("recipientEmails", currentEmails.filter(e => e.email !== email));
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

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientEmails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Email o nombre del destinatario
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {recipientEmails.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {recipientEmails.map((recipient) => (
                            <Badge 
                              key={recipient.email} 
                              variant="secondary" 
                              className="pl-2 pr-1 py-1 flex items-center gap-1"
                            >
                              <span className="max-w-[150px] truncate">
                                {recipient.name || recipient.email}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEmail(recipient.email)}
                                className="h-4 w-4 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="relative">
                        <Input
                          placeholder="Buscar por email o nombre..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchQuery.includes('@')) {
                              e.preventDefault();
                              handleAddUser({ id: 'custom', email: searchQuery, name: '', avatar: null });
                            }
                          }}
                          data-testid="input-recipient-email"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        
                        {showSuggestions && userSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {userSuggestions.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left transition-colors"
                                onClick={() => handleSelectUser(user)}
                                data-testid={`user-suggestion-${user.id}`}
                              >
                                <Avatar className="h-8 w-8 border">
                                  <AvatarImage src={user.avatar || undefined} />
                                  <AvatarFallback>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{user.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
                  disabled={isSubmitting || recipientEmails.length === 0}
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
