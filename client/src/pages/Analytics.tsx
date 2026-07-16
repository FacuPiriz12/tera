import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import {
  TrendingUp,
  Files,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Target,
  ArrowRight,
  Lock,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import type { CopyOperation } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google Drive',
  dropbox: 'Dropbox',
  onedrive: 'OneDrive',
  box: 'Box',
  s3: 'Amazon S3',
};

export default function Analytics() {
  const { t } = useTranslation();
  usePageTitle(t('pageTitles.analytics', 'TERA — Analytics'));
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const plan = user?.membershipPlan || 'free';
  const isAdmin = user?.role === 'admin';
  const isFree = plan === 'free' && !isAdmin;
  const isBusiness = plan === 'business' || isAdmin;

  const { data: operationsData, isLoading } = useQuery({
    queryKey: ["/api/copy-operations"],
    enabled: !isFree,
  });
  const operations: CopyOperation[] = (operationsData as any)?.operations ?? (Array.isArray(operationsData) ? operationsData : []);

  // Cálculo de estadísticas
  const totalOperations = operations.length;
  const completedOperations = operations.filter((op: CopyOperation) => op.status === 'completed').length;
  const failedOperations = operations.filter((op: CopyOperation) => op.status === 'failed').length;
  const inProgressOperations = operations.filter((op: CopyOperation) => op.status === 'in_progress').length;
  
  const totalFiles = operations.reduce((sum: number, op: CopyOperation) => sum + (op.completedFiles || 0), 0);
  const successRate = totalOperations > 0 ? (completedOperations / totalOperations) * 100 : 0;
  
  // Cálculo de tiempo promedio (solo operaciones completadas)
  const completedOps = operations.filter((op: CopyOperation) => op.status === 'completed');
  const averageTime = completedOps.length > 0 
    ? completedOps.reduce((sum: number, op: CopyOperation) => {
        const duration = new Date(op.updatedAt!).getTime() - new Date(op.createdAt!).getTime();
        return sum + duration;
      }, 0) / completedOps.length / 1000 // en segundos
    : 0;

  // Operaciones por día (últimos 7 días)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOperations = operations.filter((op: CopyOperation) => {
      const opDate = new Date(op.createdAt!);
      return opDate.toDateString() === date.toDateString();
    }).length;
    
    last7Days.push({
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      operations: dayOperations
    });
  }

  const maxDayOperations = Math.max(...last7Days.map(day => day.operations), 1);

  // Business: provider breakdown
  const providerCounts: Record<string, { asSource: number; asDest: number }> = {};
  if (isBusiness) {
    for (const op of operations) {
      const src = op.sourceProvider || 'unknown';
      const dst = op.destProvider || 'unknown';
      if (!providerCounts[src]) providerCounts[src] = { asSource: 0, asDest: 0 };
      if (!providerCounts[dst]) providerCounts[dst] = { asSource: 0, asDest: 0 };
      providerCounts[src].asSource++;
      providerCounts[dst].asDest++;
    }
  }
  const providerEntries = Object.entries(providerCounts).sort(
    (a, b) => (b[1].asSource + b[1].asDest) - (a[1].asSource + a[1].asDest)
  );
  const maxProviderCount = Math.max(...providerEntries.map(([, v]) => v.asSource + v.asDest), 1);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Free: locked screen
  if (isFree) {
    return (
      <div className="min-h-screen bg-gray-50 pl-0 sm:pl-20" data-testid="page-analytics">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="mb-6">
              <h1 className="text-[1.5rem] font-semibold text-foreground mb-2">{t('analytics.title')}</h1>
              <p className="text-muted-foreground">{t('analytics.description')}</p>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 gap-5">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-center max-w-sm">
                  <Badge className="mb-3 bg-amber-100 text-amber-700 border-0">Plan Pro requerido</Badge>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics disponible desde Pro</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Mirá estadísticas de tus transferencias, tasa de éxito, actividad por día y más. El plan Business incluye además desglose por proveedor.
                  </p>
                </div>
                <Link href="/pricing">
                  <Button className="gap-2 mt-2">
                    Ver planes <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pl-0 sm:pl-20">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (totalOperations === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pl-0 sm:pl-20" data-testid="page-analytics">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="mb-6">
              <h1 className="text-[1.5rem] font-semibold text-foreground mb-2">{t('analytics.title')}</h1>
              <p className="text-muted-foreground">{t('analytics.description')}</p>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-center max-w-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('analytics.noDataTitle')}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t('analytics.noDataMessage')}</p>
                </div>
                <div className="flex gap-3 mt-2">
                  <Button onClick={() => setLocation('/integrations')} variant="outline">
                    {t('analytics.connectAccounts', 'Conectar cuentas')}
                  </Button>
                  <Button onClick={() => setLocation('/cloud-explorer')} className="gap-2">
                    {t('analytics.exploreFiles', 'Explorar archivos')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-0 sm:pl-20" data-testid="page-analytics">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[1.5rem] font-semibold text-foreground mb-2">{t('analytics.title')}</h1>
            <p className="text-muted-foreground">
              {t('analytics.description')}
            </p>
          </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.totalOperations')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOperations}</div>
              <p className="text-xs text-muted-foreground">
                {inProgressOperations > 0 && `${inProgressOperations} ${t('analytics.inProgress')}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.filesCopied')}</CardTitle>
              <Files className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                {t('analytics.totalFilesProcessed')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.successRate')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
              <Progress value={successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.averageTime')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(averageTime)}</div>
              <p className="text-xs text-muted-foreground">
                {t('analytics.perCompletedOperation')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>{t('analytics.operationStatus')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{t('analytics.completed')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{completedOperations}</span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${totalOperations > 0 ? (completedOperations / totalOperations) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{t('analytics.failed')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{failedOperations}</span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full" 
                        style={{ width: `${totalOperations > 0 ? (failedOperations / totalOperations) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{t('analytics.inProgressStatus')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{inProgressOperations}</span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${totalOperations > 0 ? (inProgressOperations / totalOperations) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{t('analytics.activityLast7Days')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {last7Days.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{day.date}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full transition-all duration-300" 
                          style={{ width: `${(day.operations / maxDayOperations) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-6 text-right">{day.operations}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business: Provider Breakdown */}
        {isBusiness && providerEntries.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Desglose por proveedor</h2>
              <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">Business</Badge>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {providerEntries.map(([provider, counts]) => {
                    const total = counts.asSource + counts.asDest;
                    return (
                      <div key={provider}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{PROVIDER_LABELS[provider] || provider}</span>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>{counts.asSource} como origen</span>
                            <span>{counts.asDest} como destino</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full transition-all"
                            style={{ width: `${(total / maxProviderCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pro: upgrade teaser for Business analytics */}
        {!isBusiness && (
          <div className="mt-6 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-purple-800">
              <PieChart className="w-4 h-4 flex-shrink-0" />
              <span>Desglose por proveedor disponible en el plan Business.</span>
            </div>
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="gap-1.5 border-purple-300 text-purple-800 hover:bg-purple-100 flex-shrink-0 ml-4">
                Ver planes <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}