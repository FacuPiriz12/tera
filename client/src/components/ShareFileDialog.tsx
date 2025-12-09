import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Loader2, Share2, FileText, Folder, Mail } from "lucide-react";
import { SiGoogledrive, SiDropbox } from "react-icons/si";

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
}

const shareFormSchema = z.object({
  recipientEmail: z.string().email("Ingresa un email válido"),
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

export default function ShareFileDialog({ open, onOpenChange, file }: ShareFileDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      recipientEmail: "",
      message: "",
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (data: ShareFormValues) => {
      if (!file) throw new Error("No file selected");
      
      return apiRequest("POST", "/api/shares", {
        recipientEmail: data.recipientEmail,
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
        description: `Se ha enviado una invitación a ${form.getValues("recipientEmail")}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shares/outbox"] });
      form.reset();
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
      form.reset();
    }
    onOpenChange(newOpen);
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
                    <Mail className="w-4 h-4" />
                    Email del destinatario
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="usuario@ejemplo.com"
                      {...field}
                      data-testid="input-recipient-email"
                    />
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

            <div className="flex gap-2 justify-end pt-2">
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
                disabled={isSubmitting}
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
