import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Eye, Plus, Trash2, Pause, Play, Clock, ArrowRight, Zap, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface WatchFolder {
  id: string;
  name: string;
  sourceProvider: string;
  sourceFolderId: string;
  sourceFolderName: string | null;
  destProvider: string;
  destFolderId: string;
  destFolderName: string | null;
  intervalMinutes: number;
  isActive: boolean;
  lastCheckedAt: string | null;
  filesDetected: number;
  filesTransferred: number;
  createdAt: string;
}

const PROVIDER_META: Record<string, { label: string; short: string; bg: string; text: string }> = {
  google:   { label: "Google Drive", short: "GD",  bg: "#4285F4", text: "#fff" },
  dropbox:  { label: "Dropbox",      short: "DB",  bg: "#0061FF", text: "#fff" },
  onedrive: { label: "OneDrive",     short: "OD",  bg: "#0078D4", text: "#fff" },
  box:      { label: "Box",          short: "BX",  bg: "#0061D5", text: "#fff" },
  s3:       { label: "Amazon S3",    short: "S3",  bg: "#FF9900", text: "#fff" },
};

function ProviderChip({ provider, folderName }: { provider: string; folderName?: string | null }) {
  const meta = PROVIDER_META[provider] ?? { label: provider, short: provider.slice(0,2).toUpperCase(), bg: "#6B7280", text: "#fff" };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: meta.bg, color: meta.text }}>
        {meta.short}
      </span>
      <span className="text-sm text-muted-foreground truncate max-w-[120px]">{folderName || meta.label}</span>
    </span>
  );
}

function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  return `${minutes / 60}h`;
}

function formatLastCheck(ts: string | null): string {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "< 1 min";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const WATCH_FOLDER_LIMITS: Record<string, number> = { free: 0, pro: 2, business: Infinity };

export default function WatchFolders() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();

  const userPlan = (user?.membershipPlan as string) || 'free';
  const isAdmin  = user?.role === 'admin';
  const limit    = isAdmin ? Infinity : (WATCH_FOLDER_LIMITS[userPlan] ?? 0);
  const canUse   = limit > 0;

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    sourceProvider: 'google',
    sourceFolderId: '',
    sourceFolderName: '',
    destProvider: 'dropbox',
    destFolderId: '',
    destFolderName: '',
    intervalMinutes: 15,
  });

  const { data: folders = [], isLoading } = useQuery<WatchFolder[]>({
    queryKey: ['/api/watch-folders'],
    queryFn: () => apiRequest('/api/watch-folders'),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest('/api/watch-folders', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['/api/watch-folders'] }); setShowCreate(false); resetForm(); },
    onError: (e: any) => toast({ title: t('watchFolders.errorCreate', 'Error creating watch folder'), description: e.message, variant: 'destructive' }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/watch-folders/${id}/toggle`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/watch-folders'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/watch-folders/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['/api/watch-folders'] }); setDeleteId(null); },
  });

  function resetForm() {
    setForm({ name: '', sourceProvider: 'google', sourceFolderId: '', sourceFolderName: '', destProvider: 'dropbox', destFolderId: '', destFolderName: '', intervalMinutes: 15 });
  }

  const activeCount     = folders.filter(f => f.isActive).length;
  const totalDetected   = folders.reduce((s, f) => s + (f.filesDetected || 0), 0);
  const totalTransferred = folders.reduce((s, f) => s + (f.filesTransferred || 0), 0);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col pl-0 sm:pl-20">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-white/80" />
                <span className="text-white/70 text-sm font-medium uppercase tracking-wider">{t('watchFolders.title', 'Watch Folders')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{t('watchFolders.hero', 'Auto-detect & transfer new files')}</h1>
              <p className="text-white/70 text-sm">{t('watchFolders.heroSubtitle', 'Monitor a folder and automatically transfer new files when they appear')}</p>
            </div>
            {canUse && (
              <Button
                onClick={() => setShowCreate(true)}
                disabled={!isAdmin && folders.length >= limit}
                className="shrink-0 bg-white/20 hover:bg-white/30 text-white border-white/30 border backdrop-blur-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('watchFolders.add', 'Add Watch Folder')}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: t('watchFolders.statActive', 'Active'), value: activeCount },
              { label: t('watchFolders.statDetected', 'Files detected'), value: totalDetected },
              { label: t('watchFolders.statTransferred', 'Transferred'), value: totalTransferred },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan gate for free users */}
      {!canUse && !isAdmin && (
        <div className="border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 rounded-xl p-5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-violet-900 dark:text-violet-100">{t('watchFolders.planTitle', 'Watch Folders require Pro or Business')}</p>
            <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">{t('watchFolders.planDesc', 'Upgrade to automatically monitor folders and transfer new files.')}</p>
          </div>
        </div>
      )}

      {/* Quota warning */}
      {canUse && !isAdmin && folders.length >= limit && (
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">{t('watchFolders.limitReached', `You've reached the limit of {{limit}} watch folder(s) on your plan.`, { limit })}</p>
        </div>
      )}

      {/* Folder cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : folders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t('watchFolders.empty', 'No watch folders yet')}</p>
          <p className="text-sm mt-1">{canUse ? t('watchFolders.emptyDesc', 'Add one to start monitoring a folder automatically') : t('watchFolders.emptyDescFree', 'Upgrade to Pro to unlock watch folders')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {folders.map(folder => (
            <div
              key={folder.id}
              className={`rounded-xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-opacity ${folder.isActive ? '' : 'opacity-60'}`}
              style={{ borderLeftWidth: 4, borderLeftColor: folder.isActive ? '#8b5cf6' : '#94a3b8' }}
            >
              {/* Status dot */}
              <div className="flex-shrink-0 hidden sm:block">
                <span className={`w-2.5 h-2.5 rounded-full inline-block ${folder.isActive ? 'bg-violet-500 animate-pulse' : 'bg-muted-foreground'}`} />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{folder.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <ProviderChip provider={folder.sourceProvider} folderName={folder.sourceFolderName} />
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <ProviderChip provider={folder.destProvider} folderName={folder.destFolderName} />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-center shrink-0">
                <div>
                  <div className="text-sm font-semibold">{folder.filesTransferred || 0}</div>
                  <div className="text-[10px] text-muted-foreground">{t('watchFolders.transferred', 'transferred')}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1"><Clock className="w-3 h-3" />{formatInterval(folder.intervalMinutes)}</div>
                  <div className="text-[10px] text-muted-foreground">{formatLastCheck(folder.lastCheckedAt)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleMutation.mutate(folder.id)}
                  className="h-8 w-8 p-0"
                  title={folder.isActive ? t('watchFolders.pause', 'Pause') : t('watchFolders.resume', 'Resume')}
                >
                  {folder.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteId(folder.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={v => { setShowCreate(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-violet-500" />
              {t('watchFolders.createTitle', 'New Watch Folder')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>{t('watchFolders.fieldName', 'Name')}</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('watchFolders.namePlaceholder', 'e.g. Invoices Inbox')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t('watchFolders.fieldSourceProvider', 'Source provider')}</Label>
                <Select value={form.sourceProvider} onValueChange={v => setForm(f => ({ ...f, sourceProvider: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROVIDER_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('watchFolders.fieldSourceFolder', 'Source folder ID')}</Label>
                <Input value={form.sourceFolderId} onChange={e => setForm(f => ({ ...f, sourceFolderId: e.target.value }))} placeholder="folder_id" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t('watchFolders.fieldSourceFolderName', 'Source folder name (optional)')}</Label>
              <Input value={form.sourceFolderName} onChange={e => setForm(f => ({ ...f, sourceFolderName: e.target.value }))} placeholder={t('watchFolders.folderNamePlaceholder', 'Display name')} />
            </div>

            <div className="border-t pt-3 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <ArrowRight className="w-3 h-3" />
                {t('watchFolders.destination', 'Destination')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{t('watchFolders.fieldDestProvider', 'Dest. provider')}</Label>
                  <Select value={form.destProvider} onValueChange={v => setForm(f => ({ ...f, destProvider: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROVIDER_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{t('watchFolders.fieldDestFolder', 'Dest. folder ID')}</Label>
                  <Input value={form.destFolderId} onChange={e => setForm(f => ({ ...f, destFolderId: e.target.value }))} placeholder="folder_id" />
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <Label>{t('watchFolders.fieldDestFolderName', 'Dest. folder name (optional)')}</Label>
                <Input value={form.destFolderName} onChange={e => setForm(f => ({ ...f, destFolderName: e.target.value }))} placeholder={t('watchFolders.folderNamePlaceholder', 'Display name')} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t('watchFolders.fieldInterval', 'Check every')}</Label>
              <Select value={String(form.intervalMinutes)} onValueChange={v => setForm(f => ({ ...f, intervalMinutes: Number(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.name || !form.sourceFolderId || !form.destFolderId || createMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              {createMutation.isPending ? t('watchFolders.creating', 'Creating…') : t('watchFolders.create', 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('watchFolders.deleteTitle', 'Delete watch folder?')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('watchFolders.deleteDesc', 'This will stop monitoring. Already-transferred files are not affected.')}</p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>{t('common.cancel', 'Cancel')}</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t('common.deleting', 'Deleting…') : t('common.delete', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
        </main>
      </div>
    </div>
  );
}
