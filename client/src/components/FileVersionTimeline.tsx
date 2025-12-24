import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Clock, RotateCcw, ChevronLeft, ChevronRight, FileText, 
  Download, AlertCircle, Loader2, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FileVersion } from "@shared/schema";

interface FileVersionTimelineProps {
  fileId: string;
  fileName: string;
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

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "hace unos segundos";
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays} días`;
  
  return new Date(date).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}

const changeTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  created: { label: "Creado", icon: "✨", color: "bg-green-100 text-green-800" },
  modified: { label: "Modificado", icon: "✏️", color: "bg-blue-100 text-blue-800" },
  synced: { label: "Sincronizado", icon: "🔄", color: "bg-purple-100 text-purple-800" },
  copied: { label: "Copiado", icon: "📋", color: "bg-orange-100 text-orange-800" },
  transferred: { label: "Transferido", icon: "➡️", color: "bg-indigo-100 text-indigo-800" },
};

export default function FileVersionTimeline({
  fileId,
  fileName,
}: FileVersionTimelineProps) {
  const { toast } = useToast();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["/api/files", fileId, "versions"],
    queryFn: async () => {
      const response = await apiRequest(`/api/files/${fileId}/versions`);
      return response as FileVersion[];
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return apiRequest(`/api/files/${fileId}/restore/${versionId}`, {
        method: "POST",
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "✓ Versión restaurada",
        description: `Se restauró la versión ${data.versionNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files", fileId, "versions"] });
      setSelectedVersionId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo restaurar la versión",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Clock className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay versiones disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedVersions = [...versions].sort(
    (a, b) => b.versionNumber - a.versionNumber
  );
  const latestVersion = sortedVersions[0];
  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || latestVersion;

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <CardTitle>Historial de Versiones</CardTitle>
            <Badge variant="secondary">{versions.length} versiones</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline List */}
        <div className="lg:col-span-1 space-y-2 max-h-96 overflow-y-auto">
          {sortedVersions.map((version, idx) => {
            const changeInfo = changeTypeLabels[version.changeType] || changeTypeLabels.modified;
            const isLatest = idx === 0;
            const isSelected = selectedVersionId === version.id || (idx === 0 && !selectedVersionId);

            return (
              <div
                key={version.id}
                onClick={() => setSelectedVersionId(version.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-50 border-2 border-blue-300"
                    : "bg-gray-50 border border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <span className="text-lg">{changeInfo.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">v{version.versionNumber}</span>
                      {isLatest && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Actual
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(version.createdAt))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(Number(version.size) || 0)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Version Details & Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVersion && (
            <>
              {/* Current Version Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Versión {selectedVersion.versionNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo de cambio</p>
                      <div className="mt-1">
                        <Badge className={changeTypeLabels[selectedVersion.changeType]?.color || ""}>
                          {changeTypeLabels[selectedVersion.changeType]?.label || selectedVersion.changeType}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tamaño</p>
                      <p className="font-semibold">
                        {formatBytes(Number(selectedVersion.size) || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha</p>
                      <p className="font-semibold text-sm">
                        {new Date(selectedVersion.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Proveedor</p>
                      <p className="font-semibold capitalize">
                        {selectedVersion.provider === "google" ? "Google Drive" : "Dropbox"}
                      </p>
                    </div>
                  </div>

                  {selectedVersion.changeDetails && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Detalles del cambio</p>
                        <p className="text-sm bg-gray-50 p-2 rounded border border-gray-200">
                          {selectedVersion.changeDetails}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Restore Button */}
                  {selectedVersion.id !== (sortedVersions[0]?.id || null) && (
                    <>
                      <Separator />
                      <Button
                        onClick={() => {
                          if (
                            confirm(
                              `¿Restaurar a la versión ${selectedVersion.versionNumber}? Los cambios más recientes se perderán.`
                            )
                          ) {
                            restoreMutation.mutate(selectedVersion.id);
                          }
                        }}
                        disabled={restoreMutation.isPending}
                        className="w-full gap-2"
                        variant="default"
                      >
                        {restoreMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        Restaurar esta versión
                      </Button>
                    </>
                  )}

                  {selectedVersion.id === (sortedVersions[0]?.id || null) && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">Esta es la versión actual</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Comparison Preview */}
              {versions.length > 1 && selectedVersion.id !== (sortedVersions[0]?.id || null) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Vista previa de cambios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span>Versión {selectedVersion.versionNumber}</span>
                        <span className="font-semibold">
                          {formatBytes(Number(selectedVersion.size) || 0)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 mx-auto text-muted-foreground" />
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span>Versión {latestVersion.versionNumber} (actual)</span>
                        <span className="font-semibold">
                          {formatBytes(Number(latestVersion.size) || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
