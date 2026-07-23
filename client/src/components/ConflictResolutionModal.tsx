import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  HardDrive,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FileConflict } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: FileConflict[];
  taskId: string;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatDate(date: string | Date, locale: string): string {
  return new Date(date).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConflictResolutionModal({
  isOpen,
  onClose,
  conflicts,
  taskId,
}: ConflictResolutionModalProps) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(
    conflicts.length > 0 ? conflicts[0].id : null
  );

  const selectedConflict = conflicts.find((c) => c.id === selectedConflictId);

  const resolveMutation = useMutation({
    mutationFn: async (resolution: "keep_newer" | "keep_source" | "keep_target") => {
      return apiRequest(
        `/api/scheduled-tasks/${taskId}/conflicts/${selectedConflictId}/resolve`,
        {
          method: "POST",
          body: JSON.stringify({
            resolution,
            details: `Automatically resolved with ${resolution} strategy`,
          }),
        }
      );
    },
    onSuccess: (data: any) => {
      toast({
        title: t('conflict.toastResolved'),
        description: t('conflict.toastResolvedDesc', { strategy: data.conflict?.resolution }),
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/scheduled-tasks", taskId, "conflicts"],
      });

      const nextConflict = conflicts.find((c) => c.id !== selectedConflictId);
      if (nextConflict) {
        setSelectedConflictId(nextConflict.id);
      } else {
        onClose();
      }
    },
    onError: () => {
      toast({
        title: t('conflict.toastError'),
        description: t('conflict.toastErrorDesc'),
        variant: "destructive",
      });
    },
  });

  const sourceVersion = selectedConflict?.sourceVersion as any;
  const destVersion = selectedConflict?.destVersion as any;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <DialogTitle>{t('conflict.title')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('conflict.pendingDesc', { count: conflicts.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conflict List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('conflict.listLabel')}</p>
            <div className="grid gap-2 max-h-[120px] overflow-y-auto">
              {conflicts.map((conflict) => (
                <button
                  key={conflict.id}
                  onClick={() => setSelectedConflictId(conflict.id)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    selectedConflictId === conflict.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-border hover:border-blue-300"
                  }`}
                  data-testid={`button-conflict-${conflict.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium text-sm">{conflict.fileName}</span>
                    </div>
                    {conflict.resolvedAt ? (
                      <Badge className="bg-green-100 text-green-800">{t('conflict.resolved')}</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">{t('conflict.pending')}</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conflict Details */}
          {selectedConflict && (
            <Card className="bg-card">
              <CardContent className="pt-6 space-y-4">
                {/* File info */}
                <div>
                  <h3 className="font-semibold text-base mb-3">
                    {selectedConflict.fileName}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {t('conflict.source')} <span className="font-medium">{(selectedConflict as any).sourceProvider}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('conflict.dest')} <span className="font-medium">{(selectedConflict as any).destProvider}</span>
                    </p>
                  </div>
                </div>

                {/* Version comparison */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Source version */}
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      📁 {(selectedConflict as any).sourceProvider}
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {sourceVersion?.modifiedAt
                            ? formatDate(sourceVersion.modifiedAt, locale)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3 h-3" />
                        <span>
                          {sourceVersion?.size ? formatBytes(sourceVersion.size) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dest version */}
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      📁 {(selectedConflict as any).destProvider}
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {destVersion?.modifiedAt
                            ? formatDate(destVersion.modifiedAt, locale)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3 h-3" />
                        <span>
                          {destVersion?.size ? formatBytes(destVersion.size) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution strategy */}
                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">
                    {t('conflict.strategy')}
                  </p>

                  <div className="space-y-2">
                    {/* Keep Source */}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() => resolveMutation.mutate("keep_source")}
                      disabled={resolveMutation.isPending}
                      data-testid="button-keep-source"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">{t('conflict.keepSource', { provider: (selectedConflict as any).sourceProvider })}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('conflict.keepSourceDesc', { provider: (selectedConflict as any).sourceProvider })}
                        </p>
                      </div>
                    </Button>

                    {/* Keep Newer */}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() => resolveMutation.mutate("keep_newer")}
                      disabled={resolveMutation.isPending}
                      data-testid="button-keep-newer"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">{t('conflict.keepNewer')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('conflict.keepNewerDesc')}
                        </p>
                      </div>
                    </Button>

                    {/* Keep Both */}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() => resolveMutation.mutate("keep_target")}
                      disabled={resolveMutation.isPending}
                      data-testid="button-keep-both"
                    >
                      {resolveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      <div className="text-left">
                        <p className="font-medium">{t('conflict.keepBoth')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('conflict.keepBothDesc')}
                        </p>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-close-conflicts">
            {t('conflict.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
