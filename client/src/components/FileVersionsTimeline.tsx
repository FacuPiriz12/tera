import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type FileVersion } from "@shared/schema";
import { Loader2, Clock } from "lucide-react";

interface FileVersionsTimelineProps {
  fileId: string;
  fileName: string;
}

export function FileVersionsTimeline({ fileId, fileName }: FileVersionsTimelineProps) {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/files/${fileId}/versions`],
    queryFn: async () => {
      const response = await apiRequest(`/api/files/${fileId}/versions`);
      return response.versions as FileVersion[];
    },
  });

  const getChangeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      created: "Creado",
      modified: "Modificado",
      synced: "Sincronizado",
      copied: "Copiado",
      transferred: "Transferido",
    };
    return labels[type] || type;
  };

  const getChangeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      created: "bg-blue-100 text-blue-700",
      modified: "bg-yellow-100 text-yellow-700",
      synced: "bg-green-100 text-green-700",
      copied: "bg-purple-100 text-purple-700",
      transferred: "bg-orange-100 text-orange-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Cargando versiones...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay versiones disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold">{fileName}</h3>
        <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {data.length} versiones
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-6">
          {data.map((version, index) => (
            <div key={version.id} className="relative pl-8">
              <div className="absolute left-0 top-2 w-5 h-5 bg-white dark:bg-gray-900 border-2 border-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">v{version.versionNumber}</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getChangeTypeColor(version.changeType)}`}>
                        {getChangeTypeLabel(version.changeType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(version.createdAt).toLocaleString('es-ES')}
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                      Actual
                    </span>
                  )}
                </div>

                {version.size && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Tamaño: {(version.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}

                {version.changeDetails && (
                  <p className="text-xs text-muted-foreground mt-2">{version.changeDetails}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
