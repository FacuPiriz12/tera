import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingDown, 
  HardDrive, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import type { ScheduledTaskRun } from "@shared/schema";

interface SyncStatsCardProps {
  taskRun: ScheduledTaskRun;
  syncMode: string;
}

// Función auxiliar para formatear bytes a GB/MB
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

// Función auxiliar para formatear duración
function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${Math.round(secs)}s`;
}

export default function SyncStatsCard({
  taskRun,
  syncMode
}: SyncStatsCardProps) {
  // Datos del run
  const filesProcessed = taskRun.filesProcessed || 0;
  const filesFailed = taskRun.filesFailed || 0;
  const bytesTransferred = taskRun.bytesTransferred || 0;
  const duration = taskRun.duration || 0;
  
  // New metrics for cumulative sync
  const filesNew = (taskRun as any).filesNew || 0;
  const filesModified = (taskRun as any).filesModified || 0;
  const filesSkipped = (taskRun as any).filesSkipped || 0;
  const savingsGB = bytesTransferred > 0 ? (bytesTransferred / (1024 * 1024 * 1024)).toFixed(2) : "0";

  const statusColor = taskRun.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const statusTextColor = taskRun.status === 'completed' ? 'text-green-700' : 'text-red-700';
  const statusBadgeColor = taskRun.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <Card className={`${statusColor} border-2 transition-all`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {syncMode === 'cumulative_sync' ? 'Sincronización Acumulativa' : 'Resultado de Sincronización'}
          </CardTitle>
          <Badge className={statusBadgeColor}>
            {taskRun.status === 'completed' ? 'Completado' : 'Error'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cumulative Sync Specific Stats */}
        {syncMode === 'cumulative_sync' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-muted-foreground font-medium">Nuevos / Modificados</p>
              <p className="text-xl font-bold text-blue-700">{filesNew} / {filesModified}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <p className="text-xs text-muted-foreground font-medium">Ahorro Estimado</p>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <p className="text-xl font-bold text-green-700">{savingsGB} GB</p>
              </div>
            </div>
          </div>
        )}

        {/* Fila 1: Archivos procesados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1 p-3 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground font-medium">Procesados</p>
            <p className="text-2xl font-bold text-blue-600">{filesProcessed}</p>
          </div>
          
          <div className="space-y-1 p-3 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground font-medium">Omitidos</p>
            <p className="text-2xl font-bold text-gray-500">{filesSkipped}</p>
          </div>

          <div className="space-y-1 p-3 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground font-medium">Duración</p>
            <p className="text-lg font-bold text-purple-600">{formatDuration(duration)}</p>
          </div>

          {bytesTransferred > 0 && (
            <div className="space-y-1 p-3 bg-white rounded-lg">
              <p className="text-xs text-muted-foreground font-medium">Transferidos</p>
              <p className="text-sm font-bold text-blue-600">{formatBytes(bytesTransferred)}</p>
            </div>
          )}
        </div>

        {/* Mensaje de éxito o error */}
        <div className={`flex items-start gap-3 p-3 rounded-lg ${taskRun.status === 'completed' ? 'bg-green-100/50' : 'bg-red-100/50'}`}>
          {taskRun.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="space-y-1 flex-1">
            <p className={`text-sm font-medium ${statusTextColor}`}>
              {taskRun.status === 'completed' 
                ? '✓ Sincronización exitosa' 
                : '⚠ Sincronización con errores'}
            </p>
            {taskRun.errorMessage && (
              <p className="text-xs text-muted-foreground">{taskRun.errorMessage}</p>
            )}
          </div>
        </div>

        {/* Footer con tiempo */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Clock className="w-3 h-3" />
          <span>
            {taskRun.completedAt 
              ? new Date(taskRun.completedAt).toLocaleString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'En progreso...'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
