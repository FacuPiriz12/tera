import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Edit,
  ChevronDown,
  History,
  AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { apiRequest } from "@/lib/queryClient";
import type { ScheduledTask } from "@shared/schema";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const FREQUENCIES = [
  { value: "hourly", label: "Cada hora" },
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "custom", label: "Días específicos" },
];

const OPERATION_TYPES = [
  { value: "copy", label: "Copiar", description: "Copia archivos dentro del mismo proveedor" },
  { value: "transfer", label: "Transferir", description: "Transfiere archivos entre proveedores (Drive ↔ Dropbox)" },
];

const SYNC_MODES = [
  { 
    value: "copy", 
    label: "Copia simple", 
    description: "Copia todos los archivos cada vez que se ejecuta" 
  },
  { 
    value: "cumulative_sync", 
    label: "Sincronización acumulativa", 
    description: "Solo copia archivos nuevos o modificados desde la última sincronización" 
  },
  { 
    value: "mirror_sync", 
    label: "Espejo bidireccional (Mirror Sync)", 
    description: "Sincronización automática en ambas direcciones. Los cambios en cualquier lado se reflejan al otro" 
  },
];

interface TaskFormData {
  name: string;
  description: string;
  sourceUrl: string;
  sourceProvider: string;
  sourceName: string;
  sourceFolderId: string;
  destProvider: string;
  destinationFolderId: string;
  destinationFolderName: string;
  operationType: string;
  syncMode: string;
  frequency: string;
  hour: number;
  minute: number;
  dayOfWeek: number;
  dayOfMonth: number;
  selectedDays: number[];
  skipDuplicates: boolean;
  notifyOnComplete: boolean;
  notifyOnFailure: boolean;
  selectedFolderIds?: string[];
  excludedFolderIds?: string[];
}

const defaultFormData: TaskFormData = {
  name: "",
  description: "",
  sourceUrl: "",
  sourceProvider: "google",
  sourceName: "",
  sourceFolderId: "",
  destProvider: "google",
  destinationFolderId: "root",
  destinationFolderName: "Mi unidad",
  operationType: "copy",
  syncMode: "copy",
  frequency: "daily",
  hour: 8,
  minute: 0,
  dayOfWeek: 1,
  dayOfMonth: 1,
  selectedDays: [],
  skipDuplicates: true,
  notifyOnComplete: true,
  notifyOnFailure: true,
  selectedFolderIds: [],
  excludedFolderIds: [],
};

export default function Tasks() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSelectiveSyncDialogOpen, setIsSelectiveSyncDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(defaultFormData);

  const { data: tasks = [], isLoading } = useQuery<ScheduledTask[]>({
    queryKey: ["/api/scheduled-tasks"],
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiRequest('/api/scheduled-tasks', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      setIsCreateDialogOpen(false);
      setFormData(defaultFormData);
      toast({ title: "Tarea creada", description: "La tarea programada se ha creado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear la tarea.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) => 
      apiRequest(`/api/scheduled-tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      toast({ title: "Tarea actualizada", description: "Los cambios se han guardado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar la tarea.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/scheduled-tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      toast({ title: "Tarea eliminada", description: "La tarea ha sido eliminada." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar la tarea.", variant: "destructive" });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/scheduled-tasks/${id}/pause`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      toast({ title: "Tarea pausada", description: "La tarea ha sido pausada." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo pausar la tarea.", variant: "destructive" });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/scheduled-tasks/${id}/resume`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      toast({ title: "Tarea reanudada", description: "La tarea se ejecutará según lo programado." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo reanudar la tarea.", variant: "destructive" });
    },
  });

  const runNowMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/scheduled-tasks/${id}/run-now`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copy-operations"] });
      toast({ title: "Ejecutando", description: "La tarea se está ejecutando ahora." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo ejecutar la tarea.", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800" data-testid="badge-status-active">Activa</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800" data-testid="badge-status-paused">Pausada</Badge>;
      case 'deleted':
        return <Badge className="bg-red-100 text-red-800" data-testid="badge-status-deleted">Eliminada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getLastRunBadge = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'success':
        return <Badge className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Exitosa</Badge>;
      case 'failed':
        return <Badge className="bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" />Fallida</Badge>;
      case 'running':
      case 'pending':
        return <Badge className="bg-blue-50 text-blue-700"><Loader2 className="w-3 h-3 mr-1 animate-spin" />En progreso</Badge>;
      default:
        return null;
    }
  };

  const formatSchedule = (task: ScheduledTask) => {
    const hour = (task.hour || 8).toString().padStart(2, '0');
    const minute = (task.minute || 0).toString().padStart(2, '0');
    const time = `${hour}:${minute}`;

    switch (task.frequency) {
      case 'hourly':
        return `Cada hora, al minuto ${task.minute || 0}`;
      case 'daily':
        return `Todos los días a las ${time}`;
      case 'weekly':
        const dayName = DAYS_OF_WEEK.find(d => d.value === task.dayOfWeek)?.label || 'Lunes';
        return `Cada ${dayName} a las ${time}`;
      case 'monthly':
        return `El día ${task.dayOfMonth || 1} de cada mes a las ${time}`;
      case 'custom':
        const selectedDays = (task as any).selectedDays || [];
        if (selectedDays.length === 0) {
          return `Programado a las ${time}`;
        }
        const daysList = selectedDays.map((d: number) => DAYS_OF_WEEK.find(day => day.value === d)?.label.slice(0, 3)).join(', ');
        return `${daysList} a las ${time}`;
      default:
        return `Programado a las ${time}`;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateSubmit = () => {
    if (!formData.name || !formData.sourceUrl) {
      toast({ title: "Error", description: "Nombre y URL de origen son obligatorios.", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditSubmit = () => {
    if (selectedTask) {
      updateMutation.mutate({ id: selectedTask.id, data: formData });
    }
  };

  const openEditDialog = (task: ScheduledTask) => {
    setSelectedTask(task);
    setFormData({
      name: task.name,
      description: task.description || "",
      sourceUrl: task.sourceUrl,
      sourceProvider: task.sourceProvider,
      sourceName: task.sourceName || "",
      sourceFolderId: (task as any).sourceFolderId || "",
      destProvider: task.destProvider,
      destinationFolderId: task.destinationFolderId,
      destinationFolderName: task.destinationFolderName || "",
      operationType: (task as any).operationType || "copy",
      syncMode: (task as any).syncMode || "copy",
      frequency: task.frequency,
      hour: task.hour || 8,
      minute: task.minute || 0,
      dayOfWeek: task.dayOfWeek || 1,
      dayOfMonth: task.dayOfMonth || 1,
      selectedDays: (task as any).selectedDays || [],
      skipDuplicates: task.skipDuplicates ?? true,
      notifyOnComplete: task.notifyOnComplete ?? true,
      notifyOnFailure: task.notifyOnFailure ?? true,
      selectedFolderIds: (task as any).selectedFolderIds || [],
      excludedFolderIds: (task as any).excludedFolderIds || [],
    });
    setIsEditDialogOpen(true);
  };

  const toggleDay = (day: number) => {
    const currentDays = formData.selectedDays || [];
    if (currentDays.includes(day)) {
      setFormData({ ...formData, selectedDays: currentDays.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, selectedDays: [...currentDays, day].sort() });
    }
  };

  const TaskFormContent = ({ onSubmit, submitLabel, isPending }: { onSubmit: () => void; submitLabel: string; isPending: boolean }) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="task-name">Nombre de la tarea *</Label>
        <Input
          id="task-name"
          placeholder="Ej: Backup diario de documentos"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          data-testid="input-task-name"
          className="bg-gray-50 dark:bg-gray-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">Descripción</Label>
        <Textarea
          id="task-description"
          placeholder="Descripción opcional de la tarea"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          data-testid="input-task-description"
          className="bg-gray-50 dark:bg-gray-800 min-h-[60px]"
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Tipo de operación</h4>
        <div className="grid grid-cols-2 gap-3">
          {OPERATION_TYPES.map(op => (
            <button
              key={op.value}
              type="button"
              onClick={() => setFormData({ ...formData, operationType: op.value })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                formData.operationType === op.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              data-testid={`button-operation-${op.value}`}
            >
              <div className="font-medium text-sm">{op.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{op.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Modo de sincronización
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {SYNC_MODES.map(mode => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setFormData({ ...formData, syncMode: mode.value })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                formData.syncMode === mode.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              data-testid={`button-sync-${mode.value}`}
            >
              <div className="font-medium text-sm">{mode.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{mode.description}</div>
            </button>
          ))}
        </div>
        {formData.syncMode === 'cumulative_sync' && (
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            ✓ Solo copia archivos nuevos o modificados<br/>
            ✓ Ahorra ancho de banda<br/>
            ⚠️ Los archivos que borres en origen seguirán en destino
          </div>
        )}
        {formData.syncMode === 'mirror_sync' && (
          <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
            ↔️ Sincronización bidireccional automática<br/>
            ✓ Cambios en Drive se reflejan en Dropbox y viceversa<br/>
            ⚠️ Puede detectar y resolver conflictos<br/>
            ⏰ Se ejecuta en el horario programado
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Origen</Label>
          <Select
            value={formData.sourceProvider}
            onValueChange={(value) => setFormData({ ...formData, sourceProvider: value })}
          >
            <SelectTrigger data-testid="select-source-provider" className="bg-gray-50 dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Drive</SelectItem>
              <SelectItem value="dropbox">Dropbox</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Destino</Label>
          <Select
            value={formData.destProvider}
            onValueChange={(value) => setFormData({ ...formData, destProvider: value })}
          >
            <SelectTrigger data-testid="select-dest-provider" className="bg-gray-50 dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Drive</SelectItem>
              <SelectItem value="dropbox">Dropbox</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source-url">URL de origen *</Label>
        <Input
          id="source-url"
          placeholder="https://drive.google.com/... o https://dropbox.com/..."
          value={formData.sourceUrl}
          onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
          data-testid="input-source-url"
          className="bg-gray-50 dark:bg-gray-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source-name">Nombre del archivo/carpeta</Label>
        <Input
          id="source-name"
          placeholder="Nombre para identificar el origen"
          value={formData.sourceName}
          onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
          data-testid="input-source-name"
          className="bg-gray-50 dark:bg-gray-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dest-folder-id">ID carpeta destino</Label>
          <Input
            id="dest-folder-id"
            placeholder="root"
            value={formData.destinationFolderId}
            onChange={(e) => setFormData({ ...formData, destinationFolderId: e.target.value })}
            data-testid="input-dest-folder-id"
            className="bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dest-folder-name">Nombre carpeta</Label>
          <Input
            id="dest-folder-name"
            placeholder="Mi unidad"
            value={formData.destinationFolderName}
            onChange={(e) => setFormData({ ...formData, destinationFolderName: e.target.value })}
            data-testid="input-dest-folder-name"
            className="bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Calendar className="w-4 h-4" />
          Programación
        </h4>
        
        <div className="space-y-2">
          <Label>Frecuencia</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value, selectedDays: [] })}
          >
            <SelectTrigger data-testid="select-frequency" className="bg-white dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.frequency === 'custom' && (
          <div className="space-y-2">
            <Label>Selecciona los días</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    (formData.selectedDays || []).includes(day.value)
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                  data-testid={`button-day-${day.value}`}
                >
                  {day.label.slice(0, 3)}
                </button>
              ))}
            </div>
            {(formData.selectedDays || []).length === 0 && (
              <p className="text-xs text-amber-600">Selecciona al menos un día</p>
            )}
          </div>
        )}

        {formData.frequency === 'weekly' && (
          <div className="space-y-2">
            <Label>Día de la semana</Label>
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}
            >
              <SelectTrigger data-testid="select-day-of-week" className="bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map(d => (
                  <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.frequency === 'monthly' && (
          <div className="space-y-2">
            <Label htmlFor="day-of-month">Día del mes</Label>
            <Input
              id="day-of-month"
              type="number"
              min={1}
              max={31}
              value={formData.dayOfMonth}
              onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })}
              data-testid="input-day-of-month"
              className="bg-white dark:bg-gray-800"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hour">Hora</Label>
            <Input
              id="hour"
              type="number"
              min={0}
              max={23}
              value={formData.hour}
              onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) || 0 })}
              data-testid="input-hour"
              className="bg-white dark:bg-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minute">Minuto</Label>
            <Input
              id="minute"
              type="number"
              min={0}
              max={59}
              value={formData.minute}
              onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
              data-testid="input-minute"
              className="bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
          💡 Tip: Con Sincronización Selectiva, solo sincronizarás las carpetas que elijas, ahorrando tiempo y espacio.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Sincronización Selectiva</Label>
            <p className="text-xs text-muted-foreground">Elige qué carpetas sincronizar</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSelectiveSyncDialogOpen(true)}
            data-testid="button-configure-selective-sync"
          >
            Configurar
          </Button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Omitir duplicados</Label>
            <p className="text-xs text-muted-foreground">No copiar archivos que ya existen</p>
          </div>
          <Switch
            checked={formData.skipDuplicates}
            onCheckedChange={(checked) => setFormData({ ...formData, skipDuplicates: checked })}
            data-testid="switch-skip-duplicates"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Notificar al completar</Label>
            <p className="text-xs text-muted-foreground">Enviar notificación cuando termine</p>
          </div>
          <Switch
            checked={formData.notifyOnComplete}
            onCheckedChange={(checked) => setFormData({ ...formData, notifyOnComplete: checked })}
            data-testid="switch-notify-complete"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Notificar errores</Label>
            <p className="text-xs text-muted-foreground">Enviar notificación si hay errores</p>
          </div>
          <Switch
            checked={formData.notifyOnFailure}
            onCheckedChange={(checked) => setFormData({ ...formData, notifyOnFailure: checked })}
            data-testid="switch-notify-failure"
          />
        </div>
      </div>

      <DialogFooter className="pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900 -mx-1 px-1">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isPending || (formData.frequency === 'custom' && (formData.selectedDays || []).length === 0)}
          className="w-full"
          data-testid="button-submit-task"
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col" data-testid="tasks-page">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col" data-testid="tasks-page">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tareas Programadas</h1>
                <p className="text-muted-foreground mt-1">
                  Programa copias automáticas de archivos entre servicios en la nube
                </p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-new-task">
                    <Plus className="w-4 h-4" />
                    Nueva tarea
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Crear tarea programada</DialogTitle>
                    <DialogDescription>
                      Configura una copia automática de archivos entre servicios
                    </DialogDescription>
                  </DialogHeader>
                  <TaskFormContent 
                    onSubmit={handleCreateSubmit} 
                    submitLabel="Crear tarea"
                    isPending={createMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {tasks.length === 0 ? (
              <Card className="shadow-sm border-border">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                      <Calendar className="w-12 h-12 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      No hay tareas programadas
                    </h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Crea una tarea para copiar archivos automáticamente entre Google Drive y Dropbox según tu horario preferido.
                    </p>
                    <Button 
                      className="gap-2" 
                      onClick={() => setIsCreateDialogOpen(true)}
                      data-testid="button-create-first-task"
                    >
                      <Plus className="w-4 h-4" />
                      Crear primera tarea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow" data-testid={`card-task-${task.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {task.name}
                            {getStatusBadge(task.status)}
                          </CardTitle>
                          {task.description && (
                            <CardDescription>{task.description}</CardDescription>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-task-actions-${task.id}`}>
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => runNowMutation.mutate(task.id)}
                              disabled={runNowMutation.isPending}
                              data-testid={`action-run-now-${task.id}`}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Ejecutar ahora
                            </DropdownMenuItem>
                            {task.status === 'active' ? (
                              <DropdownMenuItem 
                                onClick={() => pauseMutation.mutate(task.id)}
                                disabled={pauseMutation.isPending}
                                data-testid={`action-pause-${task.id}`}
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Pausar
                              </DropdownMenuItem>
                            ) : task.status === 'paused' && (
                              <DropdownMenuItem 
                                onClick={() => resumeMutation.mutate(task.id)}
                                disabled={resumeMutation.isPending}
                                data-testid={`action-resume-${task.id}`}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Reanudar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => openEditDialog(task)}
                              data-testid={`action-edit-${task.id}`}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteMutation.mutate(task.id)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600"
                              data-testid={`action-delete-${task.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <RefreshCw className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground">Programación</p>
                            <p className="font-medium">{formatSchedule(task)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground">Próxima ejecución</p>
                            <p className="font-medium">{formatDate(task.nextRunAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <History className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground">Última ejecución</p>
                            <p className="font-medium">{formatDate(task.lastRunAt)}</p>
                            {getLastRunBadge(task.lastRunStatus)}
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground">Estadísticas</p>
                            <p className="font-medium">
                              {task.successfulRuns || 0} exitosas / {task.failedRuns || 0} fallidas
                            </p>
                          </div>
                        </div>
                      </div>

                      {task.lastRunError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-700">Último error</p>
                            <p className="text-sm text-red-600">{task.lastRunError}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {task.sourceProvider === 'google' ? 'Google Drive' : 'Dropbox'} → {task.destProvider === 'google' ? 'Google Drive' : 'Dropbox'}
                        </span>
                        {task.sourceName && <span>• {task.sourceName}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
            <DialogDescription>
              Modifica la configuración de la tarea programada
            </DialogDescription>
          </DialogHeader>
          <TaskFormContent 
            onSubmit={handleEditSubmit} 
            submitLabel="Guardar cambios"
            isPending={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <SelectiveSyncDialog
        isOpen={isSelectiveSyncDialogOpen}
        onOpenChange={setIsSelectiveSyncDialogOpen}
        taskId={selectedTask?.id}
        onSave={(selectedFolders, excludedFolders) => {
          setFormData({
            ...formData,
            selectedFolderIds: selectedFolders,
            excludedFolderIds: excludedFolders,
          });
        }}
      />
    </div>
  );
}

interface SelectiveSyncFolder {
  id: string;
  name: string;
  type: string;
  size?: number;
  selected?: boolean;
  excluded?: boolean;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function SelectiveSyncDialog({
  isOpen,
  onOpenChange,
  taskId,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  onSave: (selected: string[], excluded: string[]) => void;
}) {
  const [folders, setFolders] = useState<SelectiveSyncFolder[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [excludedFolders, setExcludedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'size'>('name');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && taskId) {
      loadFolders();
    }
  }, [isOpen, taskId]);

  const loadFolders = async () => {
    if (!taskId) {
      toast({ title: "Error", description: "No se especificó ID de tarea", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/scheduled-tasks/${taskId}/folders/list?provider=source`);
      if (response && response.folders) {
        setFolders(response.folders);
        const selected = new Set(response.folders.filter((f: any) => f.selected).map((f: any) => f.id));
        const excluded = new Set(response.folders.filter((f: any) => f.excluded).map((f: any) => f.id));
        setSelectedFolders(selected);
        setExcludedFolders(excluded);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
      toast({ title: "Error", description: "No se pudieron cargar las carpetas", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === 'size') {
      return (b.size || 0) - (a.size || 0);
    }
    return a.name.localeCompare(b.name);
  });

  const toggleFolderSelection = (folderId: string) => {
    const newSelected = new Set(selectedFolders);
    const newExcluded = new Set(excludedFolders);
    
    if (newSelected.has(folderId)) {
      newSelected.delete(folderId);
    } else {
      newSelected.add(folderId);
      newExcluded.delete(folderId);
    }
    setSelectedFolders(newSelected);
    setExcludedFolders(newExcluded);
  };

  const toggleFolderExclusion = (folderId: string) => {
    const newSelected = new Set(selectedFolders);
    const newExcluded = new Set(excludedFolders);
    
    if (newExcluded.has(folderId)) {
      newExcluded.delete(folderId);
    } else {
      newExcluded.add(folderId);
      newSelected.delete(folderId);
    }
    setExcludedFolders(newExcluded);
    setSelectedFolders(newSelected);
  };

  const handleSave = async () => {
    if (!taskId) {
      toast({ title: "Error", description: "No se especificó ID de tarea", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest(`/api/scheduled-tasks/${taskId}/folders/select`, {
        method: 'POST',
        body: JSON.stringify({
          selectedFolderIds: Array.from(selectedFolders),
          excludedFolderIds: Array.from(excludedFolders),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      onSave(Array.from(selectedFolders), Array.from(excludedFolders));
      onOpenChange(false);
      toast({ title: "Guardado", description: "La configuración de sincronización selectiva se ha actualizado." });
    } catch (error) {
      console.error("Error saving folder selection:", error);
      toast({ title: "Error", description: "No se pudieron guardar los cambios", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sincronización Selectiva</DialogTitle>
          <DialogDescription>
            Selecciona qué carpetas deseas sincronizar o excluir
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando carpetas...</p>
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay carpetas disponibles para sincronización selectiva</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadFolders}
              className="mt-4"
              data-testid="button-retry-load-folders"
            >
              Intentar de nuevo
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto">
            <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              ✓ Incluir = sincronizar solo esas carpetas | ✗ Excluir = omitir esas carpetas
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSortBy('name')}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  sortBy === 'name'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                data-testid="button-sort-by-name"
              >
                Nombre
              </button>
              <button
                type="button"
                onClick={() => setSortBy('size')}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  sortBy === 'size'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                data-testid="button-sort-by-size"
              >
                Tamaño
              </button>
              <span className="text-xs text-muted-foreground flex items-center ml-auto">
                {selectedFolders.size + excludedFolders.size} de {folders.length}
              </span>
            </div>

            <div className="space-y-2">
              {sortedFolders.map((folder) => {
                const isSelected = selectedFolders.has(folder.id);
                const isExcluded = excludedFolders.has(folder.id);
                
                return (
                  <div
                    key={folder.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : isExcluded
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    data-testid={`folder-item-${folder.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFolderSelection(folder.id)}
                        className="w-4 h-4 rounded"
                        data-testid={`checkbox-select-${folder.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(folder.size)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => toggleFolderExclusion(folder.id)}
                      className={`px-2 py-1 text-xs rounded transition-colors flex-shrink-0 ${
                        isExcluded
                          ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'border border-gray-300 text-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title={isExcluded ? 'Incluir esta carpeta' : 'Excluir esta carpeta'}
                      data-testid={`button-exclude-folder-${folder.id}`}
                    >
                      {isExcluded ? '✗' : '○'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-selective-sync"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !taskId}
            data-testid="button-save-selective-sync"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
