import { Settings, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import GoogleDriveConnection from "@/components/GoogleDriveConnection";
import DropboxConnection from "@/components/DropboxConnection";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import { useTranslation } from "react-i18next";

export default function Integrations() {
  const { t } = useTranslation(['pages', 'common']);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-extrabold text-foreground">Integraciones</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Conecta tus servicios de almacenamiento en la nube para sincronizar y gestionar tus archivos.
            </p>
          </div>

          {/* Integration Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {/* Google Drive Integration */}
            <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GoogleDriveLogo className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Google Drive</CardTitle>
                    <p className="text-sm text-gray-500">Almacenamiento en la nube de Google</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-gray-600 text-sm min-h-[3rem] mb-4">
                  Conecta tu cuenta de Google Drive para acceder y sincronizar archivos desde nuestra plataforma.
                </p>
                
                <div className="space-y-2 flex-1">
                  <h4 className="font-medium text-gray-900">Características:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Sincronización automática
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Acceso a carpetas compartidas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Gestión de permisos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <strong>Soporte máximo:</strong> 5TB por archivo
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t mt-4">
                  <GoogleDriveConnection variant="card" />
                </div>
              </CardContent>
            </Card>

            {/* Dropbox Integration */}
            <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DropboxLogo className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Dropbox</CardTitle>
                    <p className="text-sm text-gray-500">Plataforma de almacenamiento colaborativo</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-gray-600 text-sm min-h-[3rem] mb-4">
                  Integra tu cuenta de Dropbox para gestionar archivos y colaborar en documentos de forma eficiente.
                </p>
                
                <div className="space-y-2 flex-1">
                  <h4 className="font-medium text-gray-900">Características:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Colaboración en tiempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Historial de versiones
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Compartir enlaces seguros
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <strong>Soporte máximo:</strong> 350GB por archivo
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t mt-4">
                  <DropboxConnection variant="card" />
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon - More Integrations */}
            <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50 flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-500">Más integraciones</CardTitle>
                    <p className="text-sm text-gray-400">Próximamente disponibles</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-gray-500 text-sm min-h-[3rem] mb-4">
                  Estamos trabajando en nuevas integraciones para expandir tus opciones de almacenamiento.
                </p>
                
                <div className="space-y-2 flex-1">
                  <h4 className="font-medium text-gray-500">Próximamente:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      OneDrive
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      iCloud
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      Amazon S3
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      Box
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    </div>
  );
}