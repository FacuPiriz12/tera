import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, RefreshCw, ArrowRightLeft, Folder, File, Settings, 
  ChevronLeft, Home, ChevronRight, Link2, Send, ExternalLink, 
  Clipboard, CheckCircle2, XCircle, Loader2, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

interface CloudAccount {
  id: string;
  provider: 'google' | 'dropbox';
  name: string;
  connected: boolean;
}

interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  path?: string;
  isFolder: boolean;
}

interface TransferJob {
  id: string;
  fileName: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  sourceProvider: string;
  targetProvider: string;
  errorMessage?: string;
  copiedFileUrl?: string;
  createdAt: string;
}

type DestinationProvider = 'google' | 'dropbox' | 'onedrive' | 'box';

export default function CloudExplorer() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['copy', 'common', 'errors']);
  const [, setLocation] = useLocation();
  
  // Quick Link State
  const [quickLink, setQuickLink] = useState('');
  const [detectedSource, setDetectedSource] = useState<'google' | 'dropbox' | null>(null);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);
  
  // Explorer State
  const [selectedAccount, setSelectedAccount] = useState<CloudAccount | null>(null);
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<Array<{name: string, path: string}>>([]);
  const [jobs, setJobs] = useState<TransferJob[]>([]);

  // SSE for real-time job updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // SSE uses session-based auth via cookies (set when user authenticates with Supabase)
    // EventSource can't send custom headers, but cookies are sent automatically
    const eventSource = new EventSource('/api/transfer-jobs/events', { withCredentials: true });
    
    eventSource.addEventListener('progress', (event) => {
      const jobData = JSON.parse(event.data);
      setJobs(prev => prev.map(job => 
        job.id === jobData.jobId 
          ? { ...job, status: 'in_progress', progress: jobData.progressPct }
          : job
      ));
    });

    eventSource.addEventListener('completed', (event) => {
      const jobData = JSON.parse(event.data);
      setJobs(prev => prev.map(job => 
        job.id === jobData.jobId 
          ? { ...job, status: 'completed', progress: 100, copiedFileUrl: jobData.copiedFileUrl }
          : job
      ));
      
      toast({
        title: "Transferencia completada",
        description: `${jobData.fileName} transferido exitosamente`,
      });
    });

    eventSource.addEventListener('failed', (event) => {
      const jobData = JSON.parse(event.data);
      setJobs(prev => prev.map(job => 
        job.id === jobData.jobId 
          ? { ...job, status: 'failed', errorMessage: jobData.errorMessage }
          : job
      ));
      
      toast({
        title: "Error en transferencia",
        description: jobData.errorMessage || `Error al transferir`,
        variant: "destructive"
      });
    });

    eventSource.addEventListener('cancelled', (event) => {
      const jobData = JSON.parse(event.data);
      setJobs(prev => prev.map(job => 
        job.id === jobData.jobId 
          ? { ...job, status: 'cancelled' }
          : job
      ));
    });

    return () => eventSource.close();
  }, [isAuthenticated, toast]);

  // Detect source from link
  useEffect(() => {
    if (!quickLink.trim()) {
      setDetectedSource(null);
      setIsValidLink(null);
      return;
    }
    
    const lowerUrl = quickLink.toLowerCase();
    
    if (lowerUrl.includes('drive.google.com') || 
        lowerUrl.includes('docs.google.com') || 
        lowerUrl.includes('sheets.google.com') || 
        lowerUrl.includes('slides.google.com')) {
      setDetectedSource('google');
      setIsValidLink(true);
    } else if (lowerUrl.includes('dropbox.com') || 
               lowerUrl.includes('dropboxusercontent.com')) {
      setDetectedSource('dropbox');
      setIsValidLink(true);
    } else if (quickLink.length > 10) {
      setDetectedSource(null);
      setIsValidLink(false);
    } else {
      setDetectedSource(null);
      setIsValidLink(null);
    }
  }, [quickLink]);

  // Get connection status
  const { data: googleStatus } = useQuery({
    queryKey: ['/api/auth/google/status'],
    enabled: isAuthenticated
  });

  const { data: dropboxStatus } = useQuery({
    queryKey: ['/api/auth/dropbox/status'],
    enabled: isAuthenticated
  });

  const accounts: CloudAccount[] = [
    { id: 'google-drive', provider: 'google', name: 'Google Drive', connected: googleStatus?.connected || false },
    { id: 'dropbox', provider: 'dropbox', name: 'Dropbox', connected: dropboxStatus?.connected || false }
  ].filter(account => account.connected);

  // Set first connected account as default
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts.length]);

  // Reset path when changing account
  useEffect(() => {
    setCurrentPath('');
    setPathHistory([]);
    setSelectedFile(null);
  }, [selectedAccount?.id]);

  // Get files for selected account
  const { data: files = [], isLoading: filesLoading, refetch: refetchFiles } = useQuery({
    queryKey: ['/api/cloud-files', selectedAccount?.id, currentPath],
    queryFn: async () => {
      if (!selectedAccount) return [];
      
      if (selectedAccount.provider === 'google') {
        const response = await apiRequest('POST', '/api/drive/list-files', { fileId: currentPath || 'root' });
        const data = await response.json();
        return data.map((file: any) => ({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size ? parseInt(file.size) : undefined,
          path: file.parents?.[0] ? `${currentPath}/${file.name}` : `/${file.name}`,
          isFolder: file.mimeType === 'application/vnd.google-apps.folder'
        }));
      } else if (selectedAccount.provider === 'dropbox') {
        const response = await apiRequest('GET', `/api/dropbox/files?path=${encodeURIComponent(currentPath)}`);
        const data = await response.json();
        return data.map((file: any) => ({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          path: currentPath ? `${currentPath}/${file.name}` : `/${file.name}`,
          isFolder: file.mimeType === 'application/vnd.dropbox.folder'
        }));
      }
      return [];
    },
    enabled: !!selectedAccount && isAuthenticated
  });

  const filteredFiles = files.filter((file: CloudFile) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract file ID from Google Drive URL
  const extractGoogleFileId = (url: string): string | null => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /\/folders\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
      /\/document\/d\/([a-zA-Z0-9_-]+)/,
      /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
      /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Extract path from Dropbox URL
  const extractDropboxPath = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/(?:home|s|sh|scl)\/(.+)/);
      if (pathMatch) {
        return '/' + decodeURIComponent(pathMatch[1].split('?')[0]);
      }
      return null;
    } catch {
      return null;
    }
  };

  // Quick transfer mutation
  const quickTransferMutation = useMutation({
    mutationFn: async ({ sourceUrl, destProvider, sourceProvider }: { 
      sourceUrl: string; 
      destProvider: DestinationProvider;
      sourceProvider: 'google' | 'dropbox';
    }) => {
      let sourceFileId: string | undefined;
      let sourceFilePath: string | undefined;
      let fileName = 'Archivo';
      
      if (sourceProvider === 'google') {
        sourceFileId = extractGoogleFileId(sourceUrl) || undefined;
        if (!sourceFileId) throw new Error('No se pudo extraer el ID del archivo de Google Drive. Verifica que el link sea válido.');
        fileName = `Archivo de Google Drive`;
      } else if (sourceProvider === 'dropbox') {
        sourceFilePath = extractDropboxPath(sourceUrl) || undefined;
        if (!sourceFilePath) throw new Error('No se pudo extraer la ruta del archivo de Dropbox. Verifica que el link sea válido.');
        fileName = sourceFilePath.split('/').pop() || 'Archivo de Dropbox';
      }
      
      const response = await apiRequest('POST', '/api/transfer-files', {
        sourceProvider,
        targetProvider: destProvider,
        sourceFileId,
        sourceFilePath,
        targetPath: '',
        fileName
      });
      const data = await response.json();
      
      return { ...data, sourceProvider, destProvider, fileName };
    },
    onSuccess: (data) => {
      toast({
        title: "Transferencia iniciada",
        description: "Tu archivo está siendo transferido. Verás el progreso abajo.",
      });
      setQuickLink('');
      
      if (data.jobId) {
        setJobs(prev => [...prev, {
          id: data.jobId,
          fileName: data.fileName || 'Archivo',
          status: 'queued',
          progress: 0,
          sourceProvider: data.sourceProvider,
          targetProvider: data.destProvider,
          createdAt: new Date().toISOString()
        }]);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar la transferencia",
        variant: "destructive"
      });
    }
  });

  // File transfer mutation
  const fileTransferMutation = useMutation({
    mutationFn: async ({ file, destProvider }: { file: CloudFile; destProvider: DestinationProvider }) => {
      const response = await apiRequest('POST', '/api/transfer-files', {
        sourceProvider: selectedAccount?.provider,
        sourceFileId: selectedAccount?.provider === 'google' ? file.id : undefined,
        sourceFilePath: selectedAccount?.provider === 'dropbox' ? file.path : undefined,
        targetProvider: destProvider,
        targetPath: '',
        fileName: file.name
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Transferencia iniciada",
        description: `${variables.file.name} en cola para transferencia.`,
      });
      
      if (data.jobId) {
        setJobs(prev => [...prev, {
          id: data.jobId,
          fileName: variables.file.name,
          status: 'queued',
          progress: 0,
          sourceProvider: selectedAccount?.provider || '',
          targetProvider: variables.destProvider,
          createdAt: new Date().toISOString()
        }]);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar la transferencia",
        variant: "destructive"
      });
    }
  });

  const handleQuickTransfer = (destProvider: DestinationProvider) => {
    if (!quickLink || !isValidLink || !detectedSource) return;
    
    // Only allow supported cross-cloud transfers (Google <-> Dropbox)
    if (destProvider !== 'google' && destProvider !== 'dropbox') {
      toast({
        title: "No disponible",
        description: `Transferencias a ${destProvider === 'onedrive' ? 'OneDrive' : 'Box'} próximamente.`,
      });
      return;
    }
    
    // Validate source and dest are different
    if (detectedSource === destProvider) {
      toast({
        title: "Error",
        description: "El origen y destino deben ser diferentes.",
        variant: "destructive"
      });
      return;
    }
    
    const userMembership = user?.membershipPlan || 'free';
    const membershipExpiry = user?.membershipExpiry ? new Date(user.membershipExpiry) : null;
    const isExpired = membershipExpiry && membershipExpiry < new Date();
    const isAdmin = user?.role === 'admin';
    
    if (!isAdmin && (userMembership === 'free' || isExpired)) {
      toast({
        title: "Función Premium",
        description: "Las transferencias entre nubes requieren una suscripción PRO.",
        variant: "destructive"
      });
      return;
    }
    
    quickTransferMutation.mutate({ sourceUrl: quickLink, destProvider, sourceProvider: detectedSource });
  };

  const handleFileTransfer = (destProvider: DestinationProvider) => {
    if (!selectedFile || !selectedAccount) return;
    
    // Only allow supported cross-cloud transfers (Google <-> Dropbox)
    if (destProvider !== 'google' && destProvider !== 'dropbox') {
      toast({
        title: "No disponible",
        description: `Transferencias a ${destProvider === 'onedrive' ? 'OneDrive' : 'Box'} próximamente.`,
      });
      return;
    }
    
    if (selectedFile.isFolder) {
      toast({
        title: "No soportado",
        description: "Las transferencias de carpetas no están soportadas aún.",
        variant: "destructive"
      });
      return;
    }
    
    const userMembership = user?.membershipPlan || 'free';
    const membershipExpiry = user?.membershipExpiry ? new Date(user.membershipExpiry) : null;
    const isExpired = membershipExpiry && membershipExpiry < new Date();
    const isAdmin = user?.role === 'admin';
    
    if (!isAdmin && (userMembership === 'free' || isExpired)) {
      toast({
        title: "Función Premium",
        description: "Las transferencias entre nubes requieren una suscripción PRO.",
        variant: "destructive"
      });
      return;
    }
    
    fileTransferMutation.mutate({ file: selectedFile, destProvider });
  };

  const navigateToFolder = (folder: CloudFile) => {
    if (!folder.isFolder) return;
    
    const currentLocation = { name: folder.name, path: currentPath };
    
    if (selectedAccount?.provider === 'google') {
      setCurrentPath(folder.id);
    } else {
      const newPath = currentPath ? `${currentPath}/${folder.name}` : `/${folder.name}`;
      setCurrentPath(newPath);
    }
    
    setPathHistory(prev => [...prev, currentLocation]);
    setSelectedFile(null);
  };

  const navigateBack = () => {
    if (pathHistory.length === 0) return;
    const previousLocation = pathHistory[pathHistory.length - 1];
    setCurrentPath(previousLocation.path);
    setPathHistory(prev => prev.slice(0, -1));
    setSelectedFile(null);
  };

  const navigateToRoot = () => {
    setCurrentPath('');
    setPathHistory([]);
    setSelectedFile(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  const renderProviderLogo = (provider: string, size: string = "w-5 h-5") => {
    switch (provider) {
      case 'google':
        return <GoogleDriveLogo className={size} />;
      case 'dropbox':
        return <DropboxLogo className={size} />;
      default:
        return <Settings className={size} />;
    }
  };

  // Available destinations (excluding source)
  const getAvailableDestinations = (sourceProvider: string | null) => {
    const destinations = [
      { id: 'google', name: 'Google Drive', available: googleStatus?.connected },
      { id: 'dropbox', name: 'Dropbox', available: dropboxStatus?.connected },
      { id: 'onedrive', name: 'OneDrive', available: false, comingSoon: true },
      { id: 'box', name: 'Box', available: false, comingSoon: true },
    ];
    
    return destinations.filter(d => d.id !== sourceProvider);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-96">
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">
                Debes iniciar sesión para acceder al explorador multinube.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-cloud-explorer">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowRightLeft className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Explorador Multi-nube</h1>
            </div>
            <p className="text-gray-600">
              Transfiere archivos entre tus servicios de nube de forma rápida y sencilla.
            </p>
          </div>

          {/* Quick Transfer Section - Prominently displayed */}
          <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="w-5 h-5 text-primary" />
                Transferencia Rápida
              </CardTitle>
              <p className="text-sm text-gray-600">Pega un link y elige a dónde enviarlo</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* Link Input */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Clipboard className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Pega el link de Google Drive, Dropbox, etc..."
                      value={quickLink}
                      onChange={(e) => setQuickLink(e.target.value)}
                      className="pl-10 h-12 text-base"
                      data-testid="input-quick-link"
                    />
                    {/* Link validation indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidLink === true && (
                        <div className="flex items-center gap-2">
                          {renderProviderLogo(detectedSource || '', "w-5 h-5")}
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                      {isValidLink === false && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Destination buttons - show when link is valid */}
                {isValidLink && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-gray-700">Enviar a:</p>
                    <div className="flex flex-wrap gap-3">
                      {getAvailableDestinations(detectedSource).map((dest) => (
                        <Button
                          key={dest.id}
                          variant={dest.available ? "default" : "outline"}
                          disabled={!dest.available || quickTransferMutation.isPending}
                          onClick={() => handleQuickTransfer(dest.id as DestinationProvider)}
                          className={`flex items-center gap-2 h-12 px-6 ${
                            dest.available 
                              ? 'bg-primary hover:bg-primary/90' 
                              : 'opacity-50'
                          }`}
                          data-testid={`button-send-to-${dest.id}`}
                        >
                          {renderProviderLogo(dest.id, "w-5 h-5")}
                          <span>{dest.name}</span>
                          {dest.comingSoon && (
                            <Badge variant="secondary" className="ml-2 text-xs">Próximamente</Badge>
                          )}
                          {quickTransferMutation.isPending && (
                            <Loader2 className="w-4 h-4 animate-spin ml-2" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {isValidLink === false && (
                  <p className="text-sm text-red-500">
                    Link no reconocido. Ingresa un link válido de Google Drive o Dropbox.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different methods */}
          <Tabs defaultValue="explorer" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="explorer" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Explorar Archivos
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                Transferencias
                {jobs.filter(j => j.status === 'in_progress' || j.status === 'queued').length > 0 && (
                  <Badge className="ml-1">{jobs.filter(j => j.status === 'in_progress' || j.status === 'queued').length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Explorer Tab */}
            <TabsContent value="explorer" className="space-y-4">
              {accounts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay conexiones activas
                      </h3>
                      <p className="text-gray-600">
                        Conecta tus servicios de almacenamiento en la sección de Integraciones para comenzar.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  {/* File Browser with integrated provider selector */}
                  <div className="col-span-9">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          {/* Provider logos as tabs */}
                          <div className="flex items-center gap-1">
                            {accounts.map(account => (
                              <button
                                key={account.id}
                                className={`p-2 rounded-lg transition-all ${
                                  selectedAccount?.id === account.id 
                                    ? 'bg-primary/10 ring-2 ring-primary' 
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedAccount(account)}
                                data-testid={`account-${account.id}`}
                                title={account.name}
                              >
                                {renderProviderLogo(account.provider, "w-6 h-6")}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <Input
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-7 h-8 w-40 text-sm"
                                data-testid="input-search"
                              />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => refetchFiles()} data-testid="button-refresh">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={navigateToRoot}>
                            <Home className="w-3 h-3" />
                          </Button>
                          {pathHistory.length > 0 && (
                            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={navigateBack}>
                              <ChevronLeft className="w-3 h-3" />
                            </Button>
                          )}
                          <span>Raíz</span>
                          {pathHistory.map((location, index) => (
                            <div key={index} className="flex items-center">
                              <ChevronRight className="w-3 h-3 mx-1" />
                              <span className={index === pathHistory.length - 1 ? 'font-medium' : ''}>
                                {location.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="min-h-[350px] max-h-[400px] overflow-auto">
                          {filesLoading && (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                          )}
                          
                          {!filesLoading && filteredFiles.length === 0 && (
                            <div className="text-center py-12 text-gray-500 text-sm">
                              {searchQuery ? 'No se encontraron archivos' : 'Carpeta vacía'}
                            </div>
                          )}

                          <div className="space-y-4">
                            {/* Folders Section */}
                            {filteredFiles.filter((f: CloudFile) => f.isFolder).length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredFiles
                                  .filter((file: CloudFile) => file.isFolder)
                                  .map((file: CloudFile) => (
                                    <div
                                      key={file.id}
                                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                        selectedFile?.id === file.id 
                                          ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30' 
                                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                      }`}
                                      onClick={() => setSelectedFile(file)}
                                      onDoubleClick={() => navigateToFolder(file)}
                                      data-testid={`file-${file.id}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Folder className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                        <span className="text-sm font-medium truncate" title={file.name}>
                                          {file.name}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                            
                            {/* Files Section */}
                            {filteredFiles.filter((f: CloudFile) => !f.isFolder).length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filteredFiles
                                  .filter((file: CloudFile) => !file.isFolder)
                                  .map((file: CloudFile) => (
                                    <div
                                      key={file.id}
                                      className={`rounded-lg cursor-pointer transition-all border overflow-hidden ${
                                        selectedFile?.id === file.id 
                                          ? 'border-primary/50 ring-2 ring-primary/30' 
                                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                      }`}
                                      onClick={() => setSelectedFile(file)}
                                      data-testid={`file-${file.id}`}
                                    >
                                      {/* File Preview Area */}
                                      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                                        {file.mimeType?.startsWith('image/') ? (
                                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                            <File className="w-8 h-8 text-blue-400" />
                                          </div>
                                        ) : file.mimeType?.includes('pdf') ? (
                                          <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                                            <File className="w-8 h-8 text-red-400" />
                                          </div>
                                        ) : file.mimeType?.includes('spreadsheet') || file.mimeType?.includes('excel') ? (
                                          <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                                            <File className="w-8 h-8 text-green-500" />
                                          </div>
                                        ) : file.mimeType?.includes('document') || file.mimeType?.includes('word') ? (
                                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                            <File className="w-8 h-8 text-blue-500" />
                                          </div>
                                        ) : file.mimeType?.includes('presentation') || file.mimeType?.includes('powerpoint') ? (
                                          <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
                                            <File className="w-8 h-8 text-yellow-500" />
                                          </div>
                                        ) : (
                                          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
                                            <File className="w-8 h-8 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      {/* File Info */}
                                      <div className="p-2 bg-white">
                                        <div className="text-sm font-medium truncate" title={file.name}>
                                          {file.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {formatFileSize(file.size)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Panel */}
                  <div className="col-span-3">
                    <Card className={selectedFile ? 'border-primary/30' : ''}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Acciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!selectedFile ? (
                          <div className="text-center py-8 text-gray-500 text-sm">
                            <File className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            Selecciona un archivo para ver las opciones
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Selected file info */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                {selectedFile.isFolder ? (
                                  <Folder className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <File className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="font-medium text-sm truncate">{selectedFile.name}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {selectedFile.isFolder ? 'Carpeta' : formatFileSize(selectedFile.size)}
                              </div>
                            </div>

                            {/* Quick actions */}
                            {selectedFile.isFolder ? (
                              <Button 
                                className="w-full" 
                                onClick={() => navigateToFolder(selectedFile)}
                                data-testid="button-open-folder"
                              >
                                <Folder className="w-4 h-4 mr-2" />
                                Abrir Carpeta
                              </Button>
                            ) : (
                              <>
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-gray-700">Enviar a:</p>
                                  {getAvailableDestinations(selectedAccount?.provider || null).map((dest) => (
                                    <Button
                                      key={dest.id}
                                      variant={dest.available ? "default" : "outline"}
                                      disabled={!dest.available || fileTransferMutation.isPending}
                                      onClick={() => handleFileTransfer(dest.id as DestinationProvider)}
                                      className="w-full justify-start"
                                      data-testid={`button-transfer-to-${dest.id}`}
                                    >
                                      {renderProviderLogo(dest.id, "w-4 h-4 mr-2")}
                                      {dest.name}
                                      {dest.comingSoon && (
                                        <Badge variant="secondary" className="ml-auto text-xs">Próx.</Badge>
                                      )}
                                      {fileTransferMutation.isPending && (
                                        <Loader2 className="w-3 h-3 animate-spin ml-auto" />
                                      )}
                                    </Button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Transfers Tab */}
            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transferencias</CardTitle>
                </CardHeader>
                <CardContent>
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay transferencias recientes</p>
                      <p className="text-sm mt-2">Las transferencias que inicies aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.map(job => (
                        <div key={job.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {renderProviderLogo(job.sourceProvider)}
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              {renderProviderLogo(job.targetProvider)}
                              <span className="font-medium">{job.fileName}</span>
                            </div>
                            <Badge 
                              variant={
                                job.status === 'completed' ? 'default' :
                                job.status === 'failed' || job.status === 'cancelled' ? 'destructive' :
                                job.status === 'in_progress' ? 'secondary' : 'outline'
                              }
                            >
                              {job.status === 'in_progress' ? 'En progreso' :
                               job.status === 'completed' ? 'Completado' :
                               job.status === 'failed' ? 'Error' :
                               job.status === 'cancelled' ? 'Cancelado' :
                               'En cola'}
                            </Badge>
                          </div>
                          
                          {(job.status === 'in_progress' || job.status === 'queued') && (
                            <div className="space-y-1">
                              <Progress value={job.progress} className="h-2" />
                              <div className="text-xs text-gray-500">{job.progress}%</div>
                            </div>
                          )}
                          
                          {job.status === 'failed' && job.errorMessage && (
                            <div className="text-sm text-red-600 mt-2">{job.errorMessage}</div>
                          )}
                          
                          {job.status === 'completed' && job.copiedFileUrl && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => window.open(job.copiedFileUrl, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {job.itemType === 'folder' ? 'Ver carpeta' : 'Ver archivo'}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
