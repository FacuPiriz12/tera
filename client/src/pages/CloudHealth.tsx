import { useQuery } from "@tanstack/react-query";
import {
  HeartPulse,
  Trash2,
  FileWarning,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Check,
  Plus,
  Loader2,
  XCircle,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface CloudHealthData {
  healthScore: number;
  successRate: number;
  total: number;
  completed: number;
  failed: number;
  cancelled: number;
  active: number;
  totalFilesProcessed: number;
  byProvider: Record<string, number>;
  trend: { recentOps: number; prevOps: number };
}

function formatScore(score: number): { color: string; label: string } {
  if (score >= 90) return { color: "text-green-600", label: "Excelente" };
  if (score >= 70) return { color: "text-blue-600", label: "Bueno" };
  if (score >= 50) return { color: "text-amber-600", label: "Regular" };
  return { color: "text-red-600", label: "Necesita atención" };
}

export default function CloudHealth() {
  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });
  const { data: health, isLoading } = useQuery<CloudHealthData>({
    queryKey: ["/api/cloud-health"],
    enabled: !!(user?.googleId || user?.dropboxId),
  });

  const hasConnections = user?.googleId || user?.dropboxId;

  if (!hasConnections) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col pl-0 sm:pl-20" data-testid="cloud-health-page">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto text-center py-20">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartPulse className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">No hay nubes conectadas</h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Para analizar la salud de tu almacenamiento, primero conectá al menos una cuenta de Google Drive o Dropbox.
              </p>
              <Link href="/integrations">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Conectar nubes ahora
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isLoading || !health) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col pl-0 sm:pl-20" data-testid="cloud-health-page">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </main>
        </div>
      </div>
    );
  }

  const { color: scoreColor, label: scoreLabel } = formatScore(health.healthScore);
  const trendUp = health.trend.recentOps >= health.trend.prevOps;
  const hasFailures = health.failed > 0;
  const hasActivity = health.total > 0;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col" data-testid="cloud-health-page">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <HeartPulse className="text-red-500 w-7 h-7" />
                  Salud de tu Nube
                </h1>
                <p className="text-muted-foreground mt-1">
                  Análisis de tus transferencias y operaciones en TERA
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border shadow-sm">
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Puntaje de Salud</p>
                  <p className={`text-2xl font-bold ${scoreColor}`}>{health.healthScore}/100</p>
                  <p className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</p>
                </div>
                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                  health.healthScore >= 70 ? 'border-green-500' : health.healthScore >= 50 ? 'border-amber-500' : 'border-red-500'
                }`}>
                  <span className={`text-xs font-bold ${scoreColor}`}>{health.healthScore}%</span>
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-l-4 border-l-green-500 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Completadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{health.completed}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {health.total > 0 ? `${health.successRate}% tasa de éxito` : 'Sin operaciones aún'}
                  </p>
                  {health.total > 0 && (
                    <Progress value={health.successRate} className="h-1.5 mt-4" />
                  )}
                </CardContent>
              </Card>

              <Card className={`border-l-4 ${hasFailures ? 'border-l-red-500' : 'border-l-gray-300'} shadow-sm overflow-hidden`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <XCircle className={`w-4 h-4 ${hasFailures ? 'text-red-500' : 'text-gray-400'}`} />
                    Fallidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{health.failed}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {health.cancelled > 0 ? `+ ${health.cancelled} canceladas` : 'de ' + health.total + ' totales'}
                  </p>
                  {hasFailures && (
                    <Link href="/">
                      <Button variant="link" className="px-0 h-auto text-xs mt-3 text-red-600 hover:text-red-700">
                        Ver detalles <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Archivos Movidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{health.totalFilesProcessed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trendUp
                      ? `+${health.trend.recentOps} ops últimos 7 días`
                      : `${health.trend.recentOps} ops últimos 7 días`}
                  </p>
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trendUp ? 'Más activo que la semana anterior' : 'Menos activo que la semana anterior'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Insights */}
              <div className="space-y-6">
                <h3 className="font-bold text-lg">Insights</h3>

                {!hasActivity && (
                  <Card className="overflow-hidden">
                    <div className="flex">
                      <div className="w-2 bg-blue-500" />
                      <div className="p-5 flex-1">
                        <h4 className="font-semibold text-foreground">Empezá a transferir</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Todavía no tenés operaciones registradas. Creá tu primera transferencia entre nubes.
                        </p>
                        <div className="mt-4">
                          <Link href="/">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              Nueva transferencia
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {hasFailures && (
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="w-2 bg-red-500" />
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">Operaciones fallidas</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {health.failed} operación{health.failed !== 1 ? 'es' : ''} no pudo{health.failed !== 1 ? 'ieron' : ''} completarse. Revisalas y reintentá.
                            </p>
                          </div>
                          <Badge className="text-red-700 border-red-200 bg-red-50">
                            {health.failed} error{health.failed !== 1 ? 'es' : ''}
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <Link href="/">
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
                              Ver y reintentar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {hasActivity && !hasFailures && (
                  <Card className="overflow-hidden">
                    <div className="flex">
                      <div className="w-2 bg-green-500" />
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">Todo en orden</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Todas tus operaciones se completaron con éxito. Buen trabajo.
                            </p>
                          </div>
                          <Badge className="text-green-700 border-green-200 bg-green-50">
                            100% éxito
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {health.active > 0 && (
                  <Card className="overflow-hidden">
                    <div className="flex">
                      <div className="w-2 bg-blue-500" />
                      <div className="p-5 flex-1">
                        <h4 className="font-semibold text-foreground">Operaciones activas</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tenés {health.active} operación{health.active !== 1 ? 'es' : ''} en progreso ahora mismo.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="overflow-hidden border-dashed">
                  <div className="flex">
                    <div className="w-2 bg-amber-400" />
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">Detección de duplicados</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Análisis de archivos duplicados entre Google Drive y Dropbox.
                          </p>
                        </div>
                        <Badge className="text-amber-700 border-amber-200 bg-amber-50">
                          Próximamente
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Info panel */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm h-fit">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500 w-5 h-5" />
                  ¿Por qué es importante?
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Reduce Costos</p>
                      <p className="text-xs text-muted-foreground">Evitá pagar planes superiores eliminando archivos duplicados.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Mejor Organización</p>
                      <p className="text-xs text-muted-foreground">Encontrá tus archivos más rápido sin versiones antiguas.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Seguridad</p>
                      <p className="text-xs text-muted-foreground">Eliminá copias innecesarias de documentos sensibles.</p>
                    </div>
                  </div>
                </div>

                {/* Provider breakdown */}
                {Object.keys(health.byProvider).length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Operaciones por proveedor</p>
                    {Object.entries(health.byProvider).map(([provider, count]) => (
                      <div key={provider} className="flex items-center justify-between mb-2">
                        <span className="text-sm capitalize text-gray-700">
                          {provider === 'google' ? 'Google Drive' : provider === 'dropbox' ? 'Dropbox' : provider}
                        </span>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed text-center">
                  <p className="text-xs text-muted-foreground">Próximamente: Auto-limpieza programada</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${className}`}>
      {children}
    </span>
  );
}
