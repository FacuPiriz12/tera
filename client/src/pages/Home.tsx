import { Link } from "@/components/ui/Link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import QuickCopyDialog from "@/components/QuickCopyDialog";
import CopyProgressModal from "@/components/CopyProgressModal";
import GoogleDriveConnection from "@/components/GoogleDriveConnection";
import ConnectionWarningBanner from "@/components/ConnectionWarningBanner";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryFn, getAuthHeaders } from "@/lib/queryClient";
import { 
  Files, 
  CloudDownload, 
  Activity,
  FileText,
  Folder,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import type { CopyOperation, DriveFile } from "@shared/schema";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [quickCopyOpen, setQuickCopyOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [activeOperationId, setActiveOperationId] = useState<string>();
  const [runTutorial, setRunTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user?.id}`);
    if (isAuthenticated && !hasSeenTutorial) {
      setRunTutorial(true);
    }
  }, [isAuthenticated, user?.id]);

  const handleTutorialCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRunTutorial(false);
      localStorage.setItem(`tutorial_seen_${user?.id}`, "true");
    }
  };

  const steps: Step[] = [
    {
      target: "[data-testid='page-home']",
      content: "¡Bienvenido a TERA! Esta guía te ayudará a conocer las funciones principales.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "[data-testid='link-nav-home']",
      content: "Este es tu Panel de Control, donde verás el resumen de tus archivos y operaciones.",
    },
    {
      target: "[data-testid='link-nav-cloud-explorer']",
      content: "En el Explorador Multi-nube puedes gestionar tus archivos de Google Drive y Dropbox en un solo lugar.",
    },
    {
      target: "[data-testid='link-nav-integrations']",
      content: "Configura tus cuentas de almacenamiento aquí para empezar a transferir archivos.",
    },
    {
      target: ".grid-cols-1",
      content: "Aquí tienes estadísticas en tiempo real sobre tus archivos y transferencias.",
    }
  ];

  // Fetch data for dashboard only if authenticated
  const { data: operations = [] } = useQuery({
    queryKey: ["/api/copy-operations"],
    refetchInterval: isAuthenticated ? 5000 : false, // Only refetch if authenticated
    enabled: isAuthenticated, // Only run query if authenticated
  });

  const { data: filesData = { files: [], total: 0, totalPages: 0 } } = useQuery({
    queryKey: ["/api/drive-files", 1, 10],
    queryFn: async ({ queryKey }) => {
      const [, page, limit] = queryKey;
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/drive-files?page=${page}&limit=${limit}`, {
        headers: authHeaders,
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) return { files: [], total: 0, totalPages: 0 };
        throw new Error('Failed to fetch files');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Check connection status for Google Drive and Dropbox
  const { data: googleStatus } = useQuery({
    queryKey: ["/api/auth/google/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const { data: dropboxStatus } = useQuery({
    queryKey: ["/api/auth/dropbox/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const files = filesData.files || [];

  // Check if any account is connected
  const hasGoogleConnected = googleStatus?.connected && googleStatus?.hasValidToken;
  const hasDropboxConnected = dropboxStatus?.connected && dropboxStatus?.hasValidToken;
  const hasAnyAccountConnected = hasGoogleConnected || hasDropboxConnected;

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalFiles = filesData.total || 0;
  const totalOperations = operations.length;
  const completedOperations = operations.filter((op: CopyOperation) => op.status === 'completed').length;
  const activeOperations = operations.filter((op: CopyOperation) => op.status === 'in_progress' || op.status === 'pending').length;
  
  // Recent files (last 5)
  const recentFiles = files
    .sort((a: DriveFile, b: DriveFile) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-home">
      <Joyride
        steps={steps}
        run={runTutorial}
        continuous
        showProgress
        showSkipButton
        callback={handleTutorialCallback}
        locale={{
          back: "Atrás",
          close: "Cerrar",
          last: "Finalizar",
          next: "Siguiente",
          skip: "Saltar tutorial",
        }}
        styles={{
          options: {
            primaryColor: "#0061D5",
            zIndex: 1000,
          },
        }}
      />
      <Header />
      
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1" data-testid="main-content">
          <ConnectionWarningBanner />
          
          <div className="p-8">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[1.5rem] font-semibold text-foreground">{t('common.navigation.home')}</h1>
          </div>

          {!hasAnyAccountConnected && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center text-amber-800">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>
                  {t('common.dashboard.noAccountConnected')}{' '}
                  <Link href="/integrations" className="font-bold underline text-blue-600 hover:text-blue-800 transition-colors">
                    {t('common.dashboard.integrations')}
                  </Link>{' '}
                  {t('common.dashboard.toStartWorking')}
                </span>
              </div>
            </div>
          )}

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-[0.9rem] font-semibold text-muted-foreground">
                  {t('common.dashboard.totalFiles')}
                </CardTitle>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Files className="w-6 h-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-[1.8rem] font-bold text-foreground mb-1" data-testid="stat-total-files">
                  {totalFiles.toLocaleString()}
                </div>
                <p className="text-[0.9rem] text-muted-foreground">
                  {t('common.dashboard.filesManaged')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-[0.9rem] font-semibold text-muted-foreground">
                  {t('common.dashboard.activeOperations')}
                </CardTitle>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-[1.8rem] font-bold text-foreground mb-1" data-testid="stat-active-operations">
                  {activeOperations}
                </div>
                <p className="text-[0.9rem] text-muted-foreground">
                  {t('common.dashboard.inProgress')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-[0.9rem] font-semibold text-muted-foreground">
                  {t('common.dashboard.totalOperations')}
                </CardTitle>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-[1.8rem] font-bold text-foreground mb-1" data-testid="stat-total-operations">
                  {totalOperations}
                </div>
                <p className="text-[0.9rem] text-muted-foreground">
                  {t('common.dashboard.operationsPerformed')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-[0.9rem] font-semibold text-muted-foreground">
                  {t('common.dashboard.completedOperations')}
                </CardTitle>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-[1.8rem] font-bold text-foreground mb-1" data-testid="stat-completed-operations">
                  {completedOperations}
                </div>
                <p className="text-[0.9rem] text-muted-foreground">
                  {t('common.dashboard.successfully')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Files */}
          <Card className="bg-white rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <CardHeader className="bg-muted/50 border-b border-border p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[1.1rem] font-semibold">{t('common.dashboard.recentFiles')}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <Folder className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {recentFiles.length > 0 ? (
                  recentFiles.map((file: DriveFile, index) => (
                    <div 
                      key={file.id} 
                      className={`flex items-center p-6 transition-colors hover:bg-gray-50 ${
                        index < recentFiles.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                      data-testid={`file-item-${file.id}`}
                    >
                      <div className="w-6 h-6 mr-4 text-center text-muted-foreground">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground mb-1 truncate">
                          {file.name}
                        </div>
                        <div className="text-[0.8rem] text-muted-foreground">
                          Agregado el {new Date(file.createdAt!).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-3 opacity-0 hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                          <CloudDownload className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                          <Clock className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay archivos recientes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </main>
      </div>

      <QuickCopyDialog
        open={quickCopyOpen}
        onOpenChange={setQuickCopyOpen}
      />

      {activeOperationId && (
        <CopyProgressModal
          operationId={activeOperationId}
          open={progressModalOpen}
          onOpenChange={setProgressModalOpen}
        />
      )}

      <Footer />
    </div>
  );
}
