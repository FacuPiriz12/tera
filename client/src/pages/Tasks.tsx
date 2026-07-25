import { usePageTitle } from '@/hooks/usePageTitle';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus, Calendar, Clock, Play, Pause, Trash2, RefreshCw,
  CheckCircle, XCircle, Loader2, Edit, History, AlertCircle,
  Lock, ArrowRight, MoreHorizontal, Zap, TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import FolderPicker, { FolderSelection } from "@/components/FolderPicker";
import SyncStatsCard from "@/components/SyncStatsCard";
import ConflictResolutionModal from "@/components/ConflictResolutionModal";
import { FileVersionsTimeline } from "@/components/FileVersionsTimeline";
import type { ScheduledTask, ScheduledTaskRun, FileConflict } from "@shared/schema";

// ─── Provider config ──────────────────────────────────────────────────────────

const PROVIDERS = [
  { value: "google",   label: "Google Drive" },
  { value: "dropbox",  label: "Dropbox" },
  { value: "onedrive", label: "OneDrive" },
  { value: "box",      label: "Box" },
  { value: "s3",       label: "Amazon S3" },
];

const PROVIDER_META: Record<string, { label: string; short: string; bg: string; text: string }> = {
  google:   { label: "Google Drive", short: "GDrive",  bg: "#4285F4", text: "#fff" },
  dropbox:  { label: "Dropbox",      short: "Dropbox", bg: "#0061FF", text: "#fff" },
  onedrive: { label: "OneDrive",     short: "OneDrive",bg: "#0078D4", text: "#fff" },
  box:      { label: "Box",          short: "Box",     bg: "#0061D5", text: "#fff" },
  s3:       { label: "Amazon S3",    short: "S3",      bg: "#FF9900", text: "#fff" },
};

function ProviderChip({ provider, folder }: { provider: string; folder?: string | null }) {
  const meta = PROVIDER_META[provider] ?? { label: provider, short: provider, bg: "#6B7280", text: "#fff" };
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0"
        style={{ backgroundColor: meta.bg, color: meta.text }}
      >
        {meta.short}
      </span>
      {folder && (
        <span className="text-xs text-slate-500 truncate max-w-[90px]" title={folder}>
          {folder}
        </span>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

function buildSourceUrl(provider: string, folderId: string): string {
  switch (provider) {
    case 'google':   return `https://drive.google.com/drive/folders/${folderId}`;
    case 'dropbox':  return `dropbox://folder:${folderId}`;
    case 'onedrive': return `onedrive://${folderId}`;
    case 'box':      return `box://${folderId}`;
    case 's3':       return `s3://${folderId}`;
    default:         return folderId;
  }
}

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
  destinationFolderName: "",
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

const TASK_LIMITS: Record<string, number> = { free: 0, pro: 5, business: Infinity };

// ─── Main component ───────────────────────────────────────────────────────────

export default function Tasks() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('pageTitles.tasks', 'TERA — Scheduled Tasks'));
  const { toast } = useToast();

  const DAYS_OF_WEEK = [
    { value: 0, label: t('pages.tasks.days.0') },
    { value: 1, label: t('pages.tasks.days.1') },
    { value: 2, label: t('pages.tasks.days.2') },
    { value: 3, label: t('pages.tasks.days.3') },
    { value: 4, label: t('pages.tasks.days.4') },
    { value: 5, label: t('pages.tasks.days.5') },
    { value: 6, label: t('pages.tasks.days.6') },
  ];

  const FREQUENCIES = [
    { value: "hourly",  label: t('pages.tasks.freq.hourly') },
    { value: "daily",   label: t('pages.tasks.freq.daily') },
    { value: "weekly",  label: t('pages.tasks.freq.weekly') },
    { value: "monthly", label: t('pages.tasks.freq.monthly') },
    { value: "custom",  label: t('pages.tasks.freq.custom') },
  ];

  const OPERATION_TYPES = [
    { value: "copy",     label: t('pages.tasks.ops.copy.label'),     description: t('pages.tasks.ops.copy.description') },
    { value: "transfer", label: t('pages.tasks.ops.transfer.label'), description: t('pages.tasks.ops.transfer.description') },
  ];

  const SYNC_MODES = [
    { value: "copy",            label: t('pages.tasks.syncModes.copy.label'),            description: t('pages.tasks.syncModes.copy.description') },
    { value: "cumulative_sync", label: t('pages.tasks.syncModes.cumulative_sync.label'), description: t('pages.tasks.syncModes.cumulative_sync.description') },
    { value: "mirror_sync",     label: t('pages.tasks.syncModes.mirror_sync.label'),     description: t('pages.tasks.syncModes.mirror_sync.description') },
  ];

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const userPlan  = (user?.membershipPlan as string) || 'free';
  const isAdmin   = user?.role === 'admin';
  const taskLimit = isAdmin ? Infinity : (TASK_LIMITS[userPlan] ?? 0);

  const [isCreateDialogOpen,        setIsCreateDialogOpen]        = useState(false);
  const [isEditDialogOpen,          setIsEditDialogOpen]          = useState(false);
  const [isSelectiveSyncDialogOpen, setIsSelectiveSyncDialogOpen] = useState(false);
  const [isConflictDialogOpen,      setIsConflictDialogOpen]      = useState(false);
  const [isVersionTimelineOpen,     setIsVersionTimelineOpen]     = useState(false);
  const [selectedTask,              setSelectedTask]              = useState<ScheduledTask | null>(null);
  const [selectedTaskForVersions,   setSelectedTaskForVersions]   = useState<{ id: string; name: string } | null>(null);
  const [selectedTaskForStats,      setSelectedTaskForStats]      = useState<string | null>(null);
  const [formData,                  setFormData]                  = useState<TaskFormData>(defaultFormData);

  const { data: tasks = [], isLoading } = useQuery<ScheduledTask[]>({
    queryKey: ["/api/scheduled-tasks"],
    refetchInterval: 30000,
  });

  const { data: lastRun, isLoading: isLoadingRun } = useQuery<ScheduledTaskRun | null>({
    queryKey: ["/api/scheduled-tasks", selectedTaskForStats, "runs"],
    queryFn: async () => {
      if (!selectedTaskForStats) return null;
      const res = await apiRequest(`/api/scheduled-tasks/${selectedTaskForStats}/runs?limit=1`);
      const runs = await res.json();
      return runs && runs.length > 0 ? runs[0] : null;
    },
    enabled: !!selectedTaskForStats,
  });

  const { data: conflicts = [] } = useQuery<FileConflict[]>({
    queryKey: ["/api/scheduled-tasks", selectedTaskForStats, "conflicts"],
    queryFn: async () => {
      if (!selectedTaskForStats) return [];
      const res = await apiRequest(`/api/scheduled-tasks/${selectedTaskForStats}/conflicts`);
      const data = await res.json();
      return data.conflicts || [];
    },
    enabled: !!selectedTaskForStats && isConflictDialogOpen,
    refetchInterval: 10000,
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
      toast({ title: t('pages.tasks.toast.created'), description: t('pages.tasks.toast.createdDesc') });
    },
    onError: (error: any) => {
      const is403 = error?.message?.startsWith('403:');
      if (is403) {
        toast({
          title: taskLimit === 0 ? t('pages.tasks.toast.proRequired') : t('pages.tasks.toast.limitReached'),
          description: taskLimit === 0
            ? t('pages.tasks.toast.proRequiredDesc')
            : t('pages.tasks.toast.limitReachedDesc', { limit: taskLimit }),
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: t('pages.tasks.toast.errorCreate'), variant: "destructive" });
      }
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
      toast({ title: t('pages.tasks.toast.updated'), description: t('pages.tasks.toast.updatedDesc') });
    },
    onError: () => {
      toast({ title: "Error", description: t('pages.tasks.toast.errorUpdate'), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/scheduled-tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      toast({ title: t('pages.tasks.toast.deleted'), description: t('pages.tasks.toast.deletedDesc') });
    },
    onError: () => {
      toast({ title: "Error", description: t('pages.tasks.toast.errorDelete'), variant: "destructive" });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/scheduled-tasks/${id}/pause`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      toast({ title: t('pages.tasks.toast.paused'), description: t('pages.tasks.toast.pausedDesc') });
    },
    onError: () => {
      toast({ title: "Error", description: t('pages.tasks.toast.errorPause'), variant: "destructive" });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/scheduled-tasks/${id}/resume`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      toast({ title: t('pages.tasks.toast.resumed'), description: t('pages.tasks.toast.resumedDesc') });
    },
    onError: () => {
      toast({ title: "Error", description: t('pages.tasks.toast.errorResume'), variant: "destructive" });
    },
  });

  const runNowMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/scheduled-tasks/${id}/run-now`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copy-operations"] });
      toast({ title: t('pages.tasks.toast.running'), description: t('pages.tasks.toast.runningDesc') });
    },
    onError: () => {
      toast({ title: "Error", description: t('pages.tasks.toast.errorRun'), variant: "destructive" });
    },
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const formatSchedule = (task: ScheduledTask) => {
    const hour   = (task.hour   || 8).toString().padStart(2, '0');
    const minute = (task.minute || 0).toString().padStart(2, '0');
    const time   = `${hour}:${minute}`;
    switch (task.frequency) {
      case 'hourly':  return t('pages.tasks.schedule.hourly',  { minute: task.minute || 0 });
      case 'daily':   return t('pages.tasks.schedule.daily',   { time });
      case 'weekly': {
        const dayName = DAYS_OF_WEEK.find(d => d.value === task.dayOfWeek)?.label || t('pages.tasks.days.1');
        return t('pages.tasks.schedule.weekly', { day: dayName, time });
      }
      case 'monthly': return t('pages.tasks.schedule.monthly', { dayOfMonth: task.dayOfMonth || 1, time });
      case 'custom': {
        const sel = (task as any).selectedDays || [];
        if (sel.length === 0) return t('pages.tasks.schedule.default', { time });
        const daysList = sel.map((d: number) => DAYS_OF_WEEK.find(day => day.value === d)?.label.slice(0, 3)).join(', ');
        return t('pages.tasks.schedule.custom', { days: daysList, time });
      }
      default: return t('pages.tasks.schedule.default', { time });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return t('pages.tasks.schedule.never');
    const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatCountdown = (date: Date | string | null) => {
    if (!date) return t('pages.tasks.schedule.never');
    const diff  = new Date(date).getTime() - Date.now();
    if (diff <= 0) return t('pages.tasks.statNow', 'Ahora');
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (days  > 0) return t('pages.tasks.countdownDays',  'en {{n}}d',  { n: days });
    if (hours > 0) return t('pages.tasks.countdownHours', 'en {{n}}h',  { n: hours });
    return              t('pages.tasks.countdownMins',  'en {{n}}m',  { n: mins });
  };

  const getLastRunBadge = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'success':
        return <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle className="w-3 h-3" />{t('pages.tasks.status.success')}</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 text-xs text-red-600"><XCircle className="w-3 h-3" />{t('pages.tasks.status.failed')}</span>;
      case 'running':
      case 'pending':
        return <span className="inline-flex items-center gap-1 text-xs text-blue-600"><Loader2 className="w-3 h-3 animate-spin" />{t('pages.tasks.status.running')}</span>;
      default: return null;
    }
  };

  const handleCreateSubmit = () => {
    if (!formData.name || !formData.sourceUrl) {
      toast({ title: "Error", description: t('pages.tasks.toast.validationError'), variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditSubmit = () => {
    if (selectedTask) updateMutation.mutate({ id: selectedTask.id, data: formData });
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
    const cur = formData.selectedDays || [];
    setFormData({
      ...formData,
      selectedDays: cur.includes(day) ? cur.filter(d => d !== day) : [...cur, day].sort(),
    });
  };

  // ─── Aggregate stats ──────────────────────────────────────────────────────

  const activeTasks    = tasks.filter(t => t.status === 'active').length;
  const totalRuns      = tasks.reduce((sum, t) => sum + (t.totalRuns      || 0), 0);
  const successfulRuns = tasks.reduce((sum, t) => sum + (t.successfulRuns || 0), 0);
  const successRate    = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;
  const nextTask       = [...tasks]
    .filter(t => t.status === 'active' && t.nextRunAt)
    .sort((a, b) => new Date(a.nextRunAt!).getTime() - new Date(b.nextRunAt!).getTime())[0];

  // ─── Shared form ──────────────────────────────────────────────────────────

  const TaskFormContent = ({ onSubmit, submitLabel, isPending }: { onSubmit: () => void; submitLabel: string; isPending: boolean }) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="task-name">{t('pages.tasks.form.taskName')}</Label>
        <Input
          id="task-name"
          placeholder={t('pages.tasks.form.taskNamePlaceholder')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          data-testid="input-task-name"
          className="bg-gray-50 dark:bg-gray-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">{t('pages.tasks.form.description')}</Label>
        <Textarea
          id="task-description"
          placeholder={t('pages.tasks.form.descriptionPlaceholder')}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          data-testid="input-task-description"
          className="bg-gray-50 dark:bg-gray-800 min-h-[60px]"
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">{t('pages.tasks.form.operationType')}</h4>
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
          {t('pages.tasks.form.syncMode')}
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
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-2 rounded whitespace-pre-line">
            {t('pages.tasks.form.cumulativeHint', "✓ Only copies new or modified files\n✓ Saves bandwidth\n⚠️ Files deleted in source will remain in destination")}
          </div>
        )}
        {formData.syncMode === 'mirror_sync' && (
          <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 p-2 rounded whitespace-pre-line">
            {t('pages.tasks.form.mirrorHint', "↔️ Automatic bidirectional sync\n✓ Changes in Drive are reflected in Dropbox and vice versa\n⚠️ Can detect and resolve conflicts\n⏰ Runs on the scheduled time")}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm flex items-center justify-between gap-2 text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('pages.tasks.form.selectiveSync')}
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setIsSelectiveSyncDialogOpen(true)}>
            {t('pages.tasks.form.configFolders')}
          </Button>
        </h4>
        <div className="text-xs text-muted-foreground bg-white/50 dark:bg-black/20 p-2 rounded">
          {formData.selectedFolderIds?.length
            ? <p>{t('pages.tasks.form.foldersSelected', { count: formData.selectedFolderIds.length })}</p>
            : <p>{t('pages.tasks.form.syncingAll')}</p>
          }
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('pages.tasks.form.source')}</Label>
          <Select
            value={formData.sourceProvider}
            onValueChange={(value) => setFormData({ ...formData, sourceProvider: value, sourceUrl: '', sourceFolderId: '', sourceName: '' })}
          >
            <SelectTrigger data-testid="select-source-provider" className="bg-gray-50 dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('pages.tasks.form.destination')}</Label>
          <Select
            value={formData.destProvider}
            onValueChange={(value) => setFormData({ ...formData, destProvider: value, destinationFolderId: '', destinationFolderName: '' })}
          >
            <SelectTrigger data-testid="select-dest-provider" className="bg-gray-50 dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('pages.tasks.form.sourceFolder')}</Label>
        <FolderPicker
          provider={formData.sourceProvider}
          value={formData.sourceFolderId ? { id: formData.sourceFolderId, name: formData.sourceName || formData.sourceFolderId } : null}
          onChange={(folder: FolderSelection) => setFormData({
            ...formData,
            sourceFolderId: folder.id,
            sourceName: folder.name,
            sourceUrl: buildSourceUrl(formData.sourceProvider, folder.id),
          })}
          placeholder={t('pages.tasks.form.sourcePlaceholder')}
          data-testid="picker-source-folder"
        />
      </div>

      <div className="space-y-2">
        <Label>{t('pages.tasks.form.destFolder')}</Label>
        <FolderPicker
          provider={formData.destProvider}
          value={formData.destinationFolderId ? { id: formData.destinationFolderId, name: formData.destinationFolderName || formData.destinationFolderId } : null}
          onChange={(folder: FolderSelection) => setFormData({
            ...formData,
            destinationFolderId: folder.id,
            destinationFolderName: folder.name,
          })}
          placeholder={t('pages.tasks.form.destPlaceholder')}
          data-testid="picker-dest-folder"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Calendar className="w-4 h-4" />
          {t('pages.tasks.form.schedule')}
        </h4>

        <div className="space-y-2">
          <Label>{t('pages.tasks.form.frequency')}</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value, selectedDays: [] })}
          >
            <SelectTrigger data-testid="select-frequency" className="bg-white dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {formData.frequency === 'custom' && (
          <div className="space-y-2">
            <Label>{t('pages.tasks.form.selectDays')}</Label>
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
              <p className="text-xs text-amber-600">{t('pages.tasks.form.atLeastOneDay')}</p>
            )}
          </div>
        )}

        {formData.frequency === 'weekly' && (
          <div className="space-y-2">
            <Label>{t('pages.tasks.form.dayOfWeek')}</Label>
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map(day => (
                  <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.frequency === 'monthly' && (
          <div className="space-y-2">
            <Label>{t('pages.tasks.form.dayOfMonth')}</Label>
            <Select
              value={formData.dayOfMonth.toString()}
              onValueChange={(value) => setFormData({ ...formData, dayOfMonth: parseInt(value) })}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <SelectItem key={day} value={day.toString()}>{t('pages.tasks.form.dayN', { n: day })}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hour">{t('pages.tasks.form.hour')}</Label>
            <Input
              id="hour" type="number" min={0} max={23}
              value={formData.hour}
              onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) || 0 })}
              data-testid="input-hour" className="bg-white dark:bg-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minute">{t('pages.tasks.form.minute')}</Label>
            <Input
              id="minute" type="number" min={0} max={59}
              value={formData.minute}
              onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
              data-testid="input-minute" className="bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
          {t('pages.tasks.form.selectiveSyncTip')}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>{t('pages.tasks.form.skipDuplicates')}</Label>
            <p className="text-xs text-muted-foreground">{t('pages.tasks.form.skipDuplicatesDesc')}</p>
          </div>
          <Switch
            checked={formData.skipDuplicates}
            onCheckedChange={(checked) => setFormData({ ...formData, skipDuplicates: checked })}
            data-testid="switch-skip-duplicates"
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>{t('pages.tasks.form.notifyComplete')}</Label>
            <p className="text-xs text-muted-foreground">{t('pages.tasks.form.notifyCompleteDesc')}</p>
          </div>
          <Switch
            checked={formData.notifyOnComplete}
            onCheckedChange={(checked) => setFormData({ ...formData, notifyOnComplete: checked })}
            data-testid="switch-notify-complete"
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>{t('pages.tasks.form.notifyErrors')}</Label>
            <p className="text-xs text-muted-foreground">{t('pages.tasks.form.notifyErrorsDesc')}</p>
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

  // ─── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col pl-0 sm:pl-20" data-testid="tasks-page">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <p className="text-slate-500 text-sm">{t('pages.tasks.loading', 'Cargando syncs...')}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col pl-0 sm:pl-20" data-testid="tasks-page">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Hero header ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute -bottom-10 -left-6 w-52 h-52 bg-white/5 rounded-full" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshCw className="w-4 h-4 text-blue-200" />
                    <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">
                      {t('pages.tasks.automation', 'Automatización')}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold">{t('pages.tasks.title')}</h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {t('pages.tasks.heroSubtitle', 'Transferencias automáticas entre tus nubes')}
                  </p>
                </div>

                {taskLimit === 0 ? (
                  <Link href="/pricing">
                    <Button className="bg-white text-blue-700 hover:bg-blue-50 gap-2 shrink-0" data-testid="button-upgrade-tasks">
                      <Lock className="w-4 h-4" />
                      {t('pages.tasks.requiresPro')}
                    </Button>
                  </Link>
                ) : tasks.length >= taskLimit && taskLimit !== Infinity ? (
                  <Link href="/pricing">
                    <Button className="bg-white text-blue-700 hover:bg-blue-50 gap-2 shrink-0" data-testid="button-upgrade-limit">
                      <Lock className="w-4 h-4" />
                      {t('pages.tasks.limitReached')}
                    </Button>
                  </Link>
                ) : (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-blue-700 hover:bg-blue-50 gap-2 shrink-0" data-testid="button-new-task">
                        <Plus className="w-4 h-4" />
                        {t('pages.tasks.newTask')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{t('pages.tasks.createTitle')}</DialogTitle>
                        <DialogDescription>{t('pages.tasks.createDesc')}</DialogDescription>
                      </DialogHeader>
                      <TaskFormContent
                        onSubmit={handleCreateSubmit}
                        submitLabel={t('pages.tasks.createTask')}
                        isPending={createMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Stats chips — only when there are tasks */}
              {tasks.length > 0 && (
                <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-blue-200 text-[11px] font-medium uppercase tracking-wide">
                      {t('pages.tasks.statActive', 'Activas')}
                    </p>
                    <p className="text-2xl font-bold mt-0.5">{activeTasks}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-blue-200 text-[11px] font-medium uppercase tracking-wide">
                      {t('pages.tasks.statRuns', 'Ejecuciones')}
                    </p>
                    <p className="text-2xl font-bold mt-0.5">{totalRuns}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-blue-200 text-[11px] font-medium uppercase tracking-wide">
                      {t('pages.tasks.statSuccess', 'Tasa de éxito')}
                    </p>
                    <p className="text-2xl font-bold mt-0.5">{totalRuns > 0 ? `${successRate}%` : '—'}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-blue-200 text-[11px] font-medium uppercase tracking-wide">
                      {t('pages.tasks.statNext', 'Próxima sync')}
                    </p>
                    <p className="text-lg font-bold mt-0.5 truncate">
                      {nextTask ? formatCountdown(nextTask.nextRunAt) : t('pages.tasks.noUpcoming', '—')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Plan warning for free users ── */}
            {taskLimit === 0 && (
              <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">
                      {t('pages.tasks.planBannerTitle', 'Función exclusiva Pro')}
                    </p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      {t('pages.tasks.planBannerDesc', 'Automatizá hasta 5 syncs con el plan Pro')}
                    </p>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1 shrink-0">
                    {t('pages.tasks.upgradeBtn', 'Ver planes')}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            )}

            {/* ── Task list or empty state ── */}
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-12 h-12 text-blue-500" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">{t('pages.tasks.emptyTitle')}</h2>
                <p className="text-slate-500 max-w-sm text-sm mb-8">{t('pages.tasks.emptyDesc')}</p>

                {taskLimit === 0 ? (
                  <Link href="/pricing">
                    <Button variant="outline" className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50" data-testid="button-upgrade-first-task">
                      <Lock className="w-4 h-4" />
                      {t('pages.tasks.upgradeToPro')}
                    </Button>
                  </Link>
                ) : (
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-task">
                    <Plus className="w-4 h-4" />
                    {t('pages.tasks.createFirstTask')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isExpanded       = selectedTaskForStats === task.id;
                  const statusColor      = task.status === 'active' ? 'border-l-green-500' : task.status === 'paused' ? 'border-l-amber-400' : 'border-l-slate-300';
                  const isRunningThisTask = runNowMutation.isPending && runNowMutation.variables === task.id;

                  return (
                    <Card
                      key={task.id}
                      className={`border-l-4 ${statusColor} hover:shadow-md transition-all duration-200 overflow-hidden`}
                      data-testid={`card-task-${task.id}`}
                    >
                      <CardContent className="p-0">
                        {/* ── Card header row ── */}
                        <div className="flex items-start gap-3 p-4 pb-3">
                          {/* Status dot */}
                          <div className="mt-1.5 shrink-0">
                            {task.status === 'active' ? (
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                              </span>
                            ) : task.status === 'paused' ? (
                              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                            ) : (
                              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
                            )}
                          </div>

                          {/* Title + description */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-base leading-tight">{task.name}</h3>
                              {task.status === 'active' && (
                                <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0 h-4" data-testid="badge-status-active">
                                  {t('pages.tasks.status.active')}
                                </Badge>
                              )}
                              {task.status === 'paused' && (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0 h-4" data-testid="badge-status-paused">
                                  {t('pages.tasks.status.paused')}
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-slate-500 text-xs mt-0.5 truncate">{task.description}</p>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Run Now */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => runNowMutation.mutate(task.id)}
                              disabled={runNowMutation.isPending}
                              title={t('pages.tasks.actions.runNow')}
                              data-testid={`action-run-now-${task.id}`}
                            >
                              {isRunningThisTask
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Zap className="w-4 h-4" />
                              }
                            </Button>

                            {/* Pause / Resume */}
                            {task.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                onClick={() => pauseMutation.mutate(task.id)}
                                disabled={pauseMutation.isPending}
                                title={t('pages.tasks.actions.pause')}
                                data-testid={`action-pause-${task.id}`}
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                            ) : task.status === 'paused' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-green-600 hover:bg-green-50"
                                onClick={() => resumeMutation.mutate(task.id)}
                                disabled={resumeMutation.isPending}
                                title={t('pages.tasks.actions.resume')}
                                data-testid={`action-resume-${task.id}`}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            ) : null}

                            {/* More dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                                  data-testid={`button-task-actions-${task.id}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => { setSelectedTaskForVersions({ id: task.id, name: task.name }); setIsVersionTimelineOpen(true); }}>
                                  <History className="w-4 h-4 mr-2" />
                                  {t('pages.tasks.actions.versionHistory')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedTaskForStats(task.id); setIsConflictDialogOpen(true); }}>
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  {t('pages.tasks.actions.manageConflicts')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  {t('pages.tasks.actions.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteMutation.mutate(task.id)}
                                  disabled={deleteMutation.isPending}
                                  className="text-red-600 focus:text-red-600"
                                  data-testid={`action-delete-${task.id}`}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('pages.tasks.actions.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* ── Provider flow ── */}
                        <div className="mx-4 mb-3 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
                          <ProviderChip provider={task.sourceProvider} folder={task.sourceName || undefined} />
                          <div className="flex-1 flex items-center justify-center gap-1">
                            <div className="h-px flex-1 bg-slate-200" />
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div className="h-px flex-1 bg-slate-200" />
                          </div>
                          <ProviderChip provider={task.destProvider} folder={task.destinationFolderName || undefined} />
                        </div>

                        {/* ── Info row ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100 border-t border-slate-100">
                          <div className="px-4 py-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">
                              {t('pages.tasks.card.schedule')}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <p className="text-xs font-medium text-slate-700 truncate">{formatSchedule(task)}</p>
                            </div>
                          </div>

                          <div className="px-4 py-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">
                              {t('pages.tasks.card.nextRun')}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <p className="text-xs font-semibold text-blue-600 truncate">
                                {task.nextRunAt ? formatCountdown(task.nextRunAt) : t('pages.tasks.schedule.never')}
                              </p>
                            </div>
                          </div>

                          <div className="px-4 py-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">
                              {t('pages.tasks.card.lastRun')}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-600 truncate">{formatDate(task.lastRunAt)}</p>
                                {getLastRunBadge(task.lastRunStatus)}
                              </div>
                            </div>
                          </div>

                          <div
                            className="px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setSelectedTaskForStats(isExpanded ? null : task.id)}
                            title={isExpanded ? t('pages.tasks.hideStats', 'Ocultar estadísticas') : t('pages.tasks.viewStats', 'Ver estadísticas')}
                          >
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">
                              {t('pages.tasks.card.stats')}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <p className="text-xs font-medium text-slate-700">
                                <span className="text-green-600">{task.successfulRuns || 0}✓</span>
                                {' / '}
                                <span className="text-red-500">{task.failedRuns || 0}✗</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ── Error banner ── */}
                        {task.lastRunError && (
                          <div className="mx-4 mb-3 mt-1 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-red-700">{t('pages.tasks.card.lastError')}</p>
                              <p className="text-xs text-red-600 mt-0.5">{task.lastRunError}</p>
                            </div>
                          </div>
                        )}

                        {/* ── Expanded stats ── */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                            {isLoadingRun ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                              </div>
                            ) : lastRun ? (
                              <SyncStatsCard taskRun={lastRun} syncMode={task.syncMode || 'copy'} />
                            ) : (
                              <p className="text-center text-sm text-slate-400 py-4">
                                {t('pages.tasks.noRunsYet', 'Sin ejecuciones registradas aún')}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Dialogs ── */}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('pages.tasks.createTitle')}</DialogTitle>
            <DialogDescription>{t('pages.tasks.createDesc')}</DialogDescription>
          </DialogHeader>
          <TaskFormContent
            onSubmit={handleCreateSubmit}
            submitLabel={t('pages.tasks.createTask')}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('pages.tasks.editTitle')}</DialogTitle>
            <DialogDescription>{t('pages.tasks.editDesc')}</DialogDescription>
          </DialogHeader>
          <TaskFormContent
            onSubmit={handleEditSubmit}
            submitLabel={t('pages.tasks.saveChanges')}
            isPending={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isVersionTimelineOpen} onOpenChange={setIsVersionTimelineOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('pages.tasks.versionHistoryTitle')}</DialogTitle>
            <DialogDescription>{t('pages.tasks.versionHistoryDesc')}</DialogDescription>
          </DialogHeader>
          {selectedTaskForVersions && (
            <FileVersionsTimeline fileId={selectedTaskForVersions.id} fileName={selectedTaskForVersions.name} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSelectiveSyncDialogOpen} onOpenChange={setIsSelectiveSyncDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('pages.tasks.selectiveSyncTitle')}</DialogTitle>
            <DialogDescription>{t('pages.tasks.selectiveSyncDesc')}</DialogDescription>
          </DialogHeader>
          <SelectiveSyncDialogContent
            taskId={selectedTask?.id}
            onSave={(selectedFolders, excludedFolders) => {
              setFormData({ ...formData, selectedFolderIds: selectedFolders, excludedFolderIds: excludedFolders });
              setIsSelectiveSyncDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {selectedTaskForStats && (
        <ConflictResolutionModal
          isOpen={isConflictDialogOpen}
          onClose={() => setIsConflictDialogOpen(false)}
          conflicts={conflicts}
          taskId={selectedTaskForStats}
        />
      )}
    </div>
  );
}

// ─── Selective Sync Dialog ────────────────────────────────────────────────────

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

function SelectiveSyncDialogContent({
  taskId,
  onSave,
}: {
  taskId?: string;
  onSave: (selected: string[], excluded: string[]) => void;
}) {
  const { t } = useTranslation();
  const [folders,         setFolders]         = useState<SelectiveSyncFolder[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [excludedFolders, setExcludedFolders] = useState<Set<string>>(new Set());
  const [isLoading,       setIsLoading]       = useState(false);
  const [isSaving,        setIsSaving]        = useState(false);
  const [sortBy,          setSortBy]          = useState<'name' | 'size'>('name');
  const [draggedFolder,   setDraggedFolder]   = useState<string | null>(null);
  const [dragOverZone,    setDragOverZone]    = useState<'include' | 'exclude' | null>(null);
  const { toast } = useToast();

  const loadFolders = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/scheduled-tasks/${taskId}/folders/list?provider=source`);
      const data = await response.json();
      if (data && data.folders) {
        setFolders(data.folders);
        const selected = new Set<string>(data.folders.filter((f: any) => f.selected).map((f: any) => f.id));
        const excluded = new Set<string>(data.folders.filter((f: any) => f.excluded).map((f: any) => f.id));
        setSelectedFolders(selected);
        setExcludedFolders(excluded);
      }
    } catch {
      toast({ title: "Error", description: t('pages.tasks.toast.errorLoadFolders'), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const sortedFolders = [...folders].sort((a, b) =>
    sortBy === 'size' ? (b.size || 0) - (a.size || 0) : a.name.localeCompare(b.name)
  );

  const toggleFolderSelection = (folderId: string) => {
    const ns = new Set(selectedFolders);
    const ne = new Set(excludedFolders);
    if (ns.has(folderId)) { ns.delete(folderId); } else { ns.add(folderId); ne.delete(folderId); }
    setSelectedFolders(ns);
    setExcludedFolders(ne);
  };

  const toggleFolderExclusion = (folderId: string) => {
    const ns = new Set(selectedFolders);
    const ne = new Set(excludedFolders);
    if (ne.has(folderId)) { ne.delete(folderId); } else { ne.add(folderId); ns.delete(folderId); }
    setExcludedFolders(ne);
    setSelectedFolders(ns);
  };

  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedFolder(folderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropZone = (zone: 'include' | 'exclude') => {
    if (!draggedFolder) return;
    const ns = new Set(selectedFolders);
    const ne = new Set(excludedFolders);
    ns.delete(draggedFolder); ne.delete(draggedFolder);
    if (zone === 'include') ns.add(draggedFolder); else ne.add(draggedFolder);
    setSelectedFolders(ns); setExcludedFolders(ne);
    setDraggedFolder(null); setDragOverZone(null);
  };

  const handleSave = async () => {
    if (!taskId) return;
    setIsSaving(true);
    try {
      await apiRequest(`/api/scheduled-tasks/${taskId}/folders/select`, {
        method: 'POST',
        body: JSON.stringify({ selectedFolderIds: Array.from(selectedFolders), excludedFolderIds: Array.from(excludedFolders) }),
        headers: { 'Content-Type': 'application/json' },
      });
      onSave(Array.from(selectedFolders), Array.from(excludedFolders));
      toast({ title: t('pages.tasks.toast.savedSelection'), description: t('pages.tasks.toast.savedSelectionDesc') });
    } catch {
      toast({ title: "Error", description: t('pages.tasks.toast.errorSaveSelection'), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3 max-h-[550px] overflow-y-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-muted-foreground">{t('pages.tasks.selectiveSync.loading')}</p>
        </div>
      ) : folders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('pages.tasks.selectiveSync.noFolders')}</p>
          <Button type="button" variant="outline" size="sm" onClick={loadFolders} className="mt-4">
            {t('pages.tasks.selectiveSync.retry')}
          </Button>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            {t('pages.tasks.selectiveSync.hint')}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSortBy('name')}
              className={`text-xs px-3 py-1 rounded transition-colors ${sortBy === 'name' ? 'bg-primary text-primary-foreground' : 'border border-gray-300 hover:bg-gray-100'}`}
            >
              {t('pages.tasks.selectiveSync.sortName')}
            </button>
            <button
              type="button"
              onClick={() => setSortBy('size')}
              className={`text-xs px-3 py-1 rounded transition-colors ${sortBy === 'size' ? 'bg-primary text-primary-foreground' : 'border border-gray-300 hover:bg-gray-100'}`}
            >
              {t('pages.tasks.selectiveSync.sortSize')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div onDragOver={handleDragOver} onDrop={() => handleDropZone('include')} className="p-3 rounded-lg border-2 border-dashed border-green-300 bg-green-50/50">
              <p className="text-xs font-semibold text-green-700 text-center">{t('pages.tasks.selectiveSync.includeZone', { count: selectedFolders.size })}</p>
            </div>
            <div onDragOver={handleDragOver} onDrop={() => handleDropZone('exclude')} className="p-3 rounded-lg border-2 border-dashed border-red-300 bg-red-50/50">
              <p className="text-xs font-semibold text-red-700 text-center">{t('pages.tasks.selectiveSync.excludeZone', { count: excludedFolders.size })}</p>
            </div>
          </div>
          <div className="space-y-2 border-t pt-3">
            {sortedFolders.map((folder) => (
              <div
                key={folder.id}
                draggable
                onDragStart={(e) => handleDragStart(e, folder.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move ${
                  selectedFolders.has(folder.id)
                    ? 'bg-green-50 border-green-300'
                    : excludedFolders.has(folder.id)
                    ? 'bg-red-50 border-red-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                <input type="checkbox" checked={selectedFolders.has(folder.id)} onChange={() => toggleFolderSelection(folder.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(folder.size)}</p>
                </div>
                <button type="button" onClick={() => toggleFolderExclusion(folder.id)} className="px-2 py-1 text-xs rounded border border-gray-300">
                  {excludedFolders.has(folder.id) ? '✓' : '✗'}
                </button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={handleSave} disabled={isSaving} className="w-full mt-4">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {t('pages.tasks.selectiveSync.saveBtn')}
          </Button>
        </>
      )}
    </div>
  );
}
