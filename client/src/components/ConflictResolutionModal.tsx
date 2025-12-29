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

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("es-ES", {
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
        title: "✓ Conflicto resuelto",
        description: `Se resolvió el conflicto con estrategia: ${data.conflict?.resolution}`,
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/scheduled-tasks", taskId, "conflicts"],
      });

      // Remove resolved conflict and show next one
      const nextConflict = conflicts.find((c) => c.id !== selectedConflictId);
      if (nextConflict) {
        setSelectedConflictId(nextConflict.id);
      } else {
        onClose();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo resolver el conflicto",
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
            <DialogTitle>Resolver conflictos de sincronización</DialogTitle>
          </div>
          <DialogDescription>
            {conflicts.length} conflicto{conflicts.length !== 1 ? "s" : ""} pendiente{conflicts.length !== 1 ? "s" : ""} de resolver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conflict List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Conflictos:</p>
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
                      <Badge className="bg-green-100 text-green-800">Resuelto</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">Pendiente</Badge>
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
                      Fuente: <span className="font-medium">{selectedConflict.sourceProvider}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Destino: <span className="font-medium">{selectedConflict.destProvider}</span>
                    </p>
                  </div>
                </div>

                {/* Version comparison */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Source version */}
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      📁 {selectedConflict.sourceProvider}
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {sourceVersion?.modifiedAt
                            ? formatDate(sourceVersion.modifiedAt)
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
                      📁 {selectedConflict.destProvider}
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {destVersion?.modifiedAt
                            ? formatDate(destVersion.modifiedAt)
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
                    Estrategia de resolución:
                  </p>

                  <div className="space-y-2">
                    {/* Keep Source */}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() =>
                        resolveMutation.mutate("keep_source")
                      }
                      disabled={resolveMutation.isPending}
                      data-testid="button-keep-source"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">Mantener {selectedConflict.sourceProvider}</p>
                        <p className="text-xs text-muted-foreground">
                          Usa la versión de {selectedConflict.sourceProvider}
                        </p>
                      </div>
                    </Button>

                    {/* Keep Newer */}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() =>
                        resolveMutation.mutate("keep_newer")
                      }
                      disabled={resolveMutation.isPending}
                      data-testid="button-keep-newer"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">Mantener la más reciente</p>
                        <p className="text-xs text-muted-foreground">
                          Usa la versión más nueva (automático)
                        </p>
                      </div>
                    </Button>

                    {/* Keep Both (Versioning) */}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() =>
                        resolveMutation.mutate("keep_target")
                      }
                      disabled={resolveMutation.isPending}
                      data-testid="button-keep-both"
                    >
                      {resolveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      <div className="text-left">
                        <p className="font-medium">Mantener ambas versiones</p>
                        <p className="text-xs text-muted-foreground">
                          La otra se archiva como versión anterior
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
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
