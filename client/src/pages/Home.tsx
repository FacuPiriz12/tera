import { usePageTitle } from '@/hooks/usePageTitle';
import {
  FileText,
  Globe,
  Settings,
  BarChart3,
  HardDrive,
  ArrowRight,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FileUploadDialog from "@/components/FileUploadDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { CopyOperation } from "@shared/schema";

export default function Home() {
  usePageTitle(t('pageTitles.dashboard', 'TERA — Dashboard'));
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: operations = [] } = useQuery<CopyOperation[]>({
    queryKey: ["/api/copy-operations"],
  });

  const { data: googleStatus }   = useQuery<{ connected: boolean }>({ queryKey: ["/api/auth/google/status"] });
  const { data: dropboxStatus }  = useQuery<{ connected: boolean }>({ queryKey: ["/api/auth/dropbox/status"] });
  const { data: onedriveStatus } = useQuery<{ connected: boolean }>({ queryKey: ["/api/auth/onedrive/status"] });
  const { data: boxStatus }      = useQuery<{ connected: boolean }>({ queryKey: ["/api/auth/box/status"] });
  const { data: s3Status }       = useQuery<{ connected: boolean }>({ queryKey: ["/api/auth/s3/status"] });

  const hasAnyConnected = googleStatus?.connected || dropboxStatus?.connected || onedriveStatus?.connected || boxStatus?.connected || s3Status?.connected;

  const completedOps = operations.filter(op => op.status === 'completed');
  const failedOps    = operations.filter(op => op.status === 'failed');
  const activeOps    = operations.filter(op => op.status === 'in_progress' || op.status === 'pending');
  const totalFiles   = completedOps.reduce((sum, op) => sum + (op.completedFiles || 0), 0);
  const successRate  = operations.length > 0 ? Math.round((completedOps.length / operations.length) * 100) : 0;

  const recentFiles = [...operations]
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5)
    .map(op => ({
      name: op.sourceName || t('common.notifications.copyOperation'),
      files: op.totalFiles || 0,
      date: new Date(op.createdAt!).toLocaleDateString(),
      status: op.status,
      color: op.status === 'completed' ? 'text-green-500' : op.status === 'failed' ? 'text-red-500' : 'text-blue-500',
      bg:    op.status === 'completed' ? 'bg-green-50'   : op.status === 'failed' ? 'bg-red-50'    : 'bg-blue-50',
    }));

  const statCards = [
    { label: t('dashboard.stats.completed', 'Completadas'),         value: completedOps.length, icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
    { label: t('dashboard.stats.inProgress', 'En progreso'),        value: activeOps.length,    icon: Loader2,     color: 'text-blue-500',   bg: 'bg-blue-50'   },
    { label: t('dashboard.stats.failed', 'Fallidas'),               value: failedOps.length,    icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50'    },
    { label: t('dashboard.stats.files', 'Archivos transferidos'),   value: totalFiles,          icon: FileText,    color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const quickActions = [
    { label: t('dashboard.actions.explorer', 'Explorador'),       desc: t('dashboard.actions.explorerDesc', 'Mover archivos entre nubes'),      icon: Globe,     bg: 'bg-blue-50',   color: 'text-blue-500',   path: '/cloud-explorer' },
    { label: t('dashboard.actions.operations', 'Operaciones'),    desc: t('dashboard.actions.operationsDesc', 'Historial de transferencias'),    icon: FileText,  bg: 'bg-indigo-50', color: 'text-indigo-500',  path: '/operations'     },
    { label: t('dashboard.actions.integrations', 'Integraciones'),desc: t('dashboard.actions.integrationsDesc', 'Conectar cuentas externas'),   icon: Settings,  bg: 'bg-green-50',  color: 'text-green-500',   path: '/integrations'   },
    { label: t('dashboard.actions.analytics', 'Analytics'),       desc: t('dashboard.actions.analyticsDesc', 'Ver estadísticas detalladas'),    icon: BarChart3, bg: 'bg-orange-50', color: 'text-orange-500',  path: '/analytics'      },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pl-0 sm:pl-20">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-20 sm:pb-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <div className="flex justify-between items-end">
              <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title', 'Mi Unidad')}</h1>
              <FileUploadDialog />
            </div>

            {/* Onboarding banner — solo si no hay cuentas conectadas */}
            {!hasAnyConnected && (
              <div className="relative overflow-hidden bg-gradient-to-r from-[#0061D5] to-blue-500 rounded-2xl p-6 text-white">
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">{t('dashboard.onboarding.badge', 'Primeros pasos')}</p>
                  <h2 className="text-xl font-bold mb-2">{t('dashboard.onboarding.title', '¡Bienvenido a TERA!')}</h2>
                  <p className="text-sm text-blue-100 mb-5 max-w-lg">
                    {t('dashboard.onboarding.desc', 'Conectá tus cuentas de Google Drive, Dropbox, OneDrive, Box y más, y empezá a mover archivos entre tus nubes en segundos.')}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setLocation('/integrations')} className="flex items-center gap-2 px-4 py-2 bg-white text-[#0061D5] rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors">
                      <HardDrive className="w-4 h-4" /> {t('dashboard.onboarding.connectBtn', 'Conectar cuentas')}
                    </button>
                    <button onClick={() => setLocation('/cloud-explorer')} className="flex items-center gap-2 px-4 py-2 bg-blue-600/40 text-white border border-white/20 rounded-xl text-sm font-bold hover:bg-blue-600/60 transition-colors">
                      <Globe className="w-4 h-4" /> {t('dashboard.onboarding.exploreBtn', 'Explorar archivos')} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setLocation('/copy-from-url')} className="flex items-center gap-2 px-4 py-2 bg-blue-600/40 text-white border border-white/20 rounded-xl text-sm font-bold hover:bg-blue-600/60 transition-colors">
                      <Zap className="w-4 h-4" /> {t('dashboard.onboarding.quickTransfer', 'Transferencia rápida')}
                    </button>
                  </div>
                </div>
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute -right-4 -bottom-10 w-28 h-28 bg-white/5 rounded-full" />
              </div>
            )}

            {/* Stats reales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => (
                <Card key={i} className="shadow-sm border-gray-100">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500 truncate">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Acceso rápido */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickAccess', 'Acceso Rápido')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((a, i) => (
                  <Card
                    key={i}
                    onClick={() => setLocation(a.path)}
                    className="shadow-sm border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
                  >
                    <CardContent className="p-5 flex items-center gap-3">
                      <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <a.icon className={`w-5 h-5 ${a.color}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{a.label}</h3>
                        <p className="text-xs text-gray-500 truncate">{a.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Transferencias recientes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentFiles', 'Transferencias Recientes')}</h2>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-medium" onClick={() => setLocation('/operations')}>
                  {t('common.actions.viewAll', 'Ver todos')}
                </Button>
              </div>

              {recentFiles.length === 0 ? (
                <Card className="shadow-sm border-gray-100">
                  <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                    <Clock className="w-10 h-10 text-gray-200" />
                    <p className="text-sm text-gray-400">{t('dashboard.empty.noTransfers', 'Todavía no hay transferencias')}</p>
                    <Button size="sm" onClick={() => setLocation('/cloud-explorer')}>{t('dashboard.empty.startTransfer', 'Empezar a transferir')}</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/30">
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.table.name', 'Nombre')}</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('common.table.size', 'Archivos')}</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('common.table.date', 'Fecha')}</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('dashboard.table.status', 'Estado')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentFiles.map((file, i) => (
                          <tr key={i} onClick={() => setLocation('/operations')} className="hover:bg-gray-50/80 transition-colors cursor-pointer">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${file.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <FileText className={`w-4 h-4 ${file.color}`} />
                                </div>
                                <p className="font-medium text-sm text-gray-900 truncate max-w-[160px]">{file.name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="text-sm text-gray-500">{file.files} {t('dashboard.table.files', 'archivos')}</span>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="text-sm text-gray-500">{file.date}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {file.status === 'completed'  && <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> {t('dashboard.status.completed', 'Completada')}</span>}
                              {file.status === 'failed'     && <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> {t('dashboard.status.failed', 'Fallida')}</span>}
                              {file.status === 'in_progress'&& <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full"><Loader2 className="w-3 h-3 animate-spin" /> {t('dashboard.status.inProgress', 'En curso')}</span>}
                              {file.status === 'pending'    && <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> {t('dashboard.status.pending', 'Pendiente')}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Tasa de éxito — solo si hay operaciones */}
            {operations.length > 0 && (
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">{t('dashboard.performance.title', 'Rendimiento general')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{t('dashboard.performance.successRate', 'Tasa de éxito')}</span>
                    <span className="text-sm font-bold text-gray-900">{successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${successRate}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>{completedOps.length} {t('dashboard.performance.completed', 'completadas')}</span>
                    <span>{operations.length} {t('dashboard.performance.total', 'totales')}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 text-blue-600 hover:text-blue-700 px-0" onClick={() => setLocation('/analytics')}>
                    {t('dashboard.performance.viewAnalytics', 'Ver analytics completo')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
