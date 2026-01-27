import { Settings, CheckCircle, AlertCircle, ArrowRight, Cloud, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import GoogleDriveConnection from "@/components/GoogleDriveConnection";
import DropboxConnection from "@/components/DropboxConnection";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Integrations() {
  const { t } = useTranslation(['pages', 'common']);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 80px)' }}>
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header Section with Home-style gradient text */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-100/50 rounded-xl backdrop-blur-sm">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {t('pages.integrations.title', 'Integraciones')}
              </h1>
            </div>
            <p className="text-base text-gray-600 max-w-2xl font-medium leading-relaxed">
              {t('pages.integrations.subtitle', 'Conecta tus servicios de almacenamiento para sincronizar, respaldar y gestionar tus archivos desde un solo lugar.')}
            </p>
          </motion.div>

          {/* Integration Cards */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 max-w-5xl"
          >
            {/* Google Drive Integration */}
            <motion.div variants={item} className="h-full">
              <Card className="group h-full flex flex-col border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative bg-white">
                {/* Blue Relief / Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-xl" />
                
                <CardHeader className="pb-3 pl-5 pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                      <GoogleDriveLogo className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900 mb-0.5">Google Drive</CardTitle>
                    <p className="text-[11px] font-medium text-blue-600">{t('pages.integrations.personalStorage', 'Almacenamiento Personal')}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 pl-5 flex-1 flex flex-col pb-5 pr-5">
                  <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                    {t('pages.integrations.googleDriveDesc', 'Conecta tu cuenta de Google Drive para acceder y sincronizar archivos desde nuestra plataforma.')}
                  </p>
                  
                  <div className="bg-gray-50/80 rounded-lg p-2.5 mb-4 flex-1">
                    <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('pages.integrations.features', 'Características')}</h4>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-[11px] text-gray-700 group/item">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5 group-hover/item:text-blue-600 transition-colors" />
                        <span>{t('pages.integrations.autoSync', 'Sincronización automática')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-[11px] text-gray-700 group/item">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5 group-hover/item:text-blue-600 transition-colors" />
                        <span>{t('pages.integrations.sharedFolders', 'Acceso a carpetas compartidas')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-[11px] text-gray-700 group/item">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5 group-hover/item:text-blue-600 transition-colors" />
                        <span>{t('pages.integrations.permissions', 'Gestión de permisos')}</span>
                      </li>
                    </ul>
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t('pages.integrations.maxSupport', 'Soporte máximo')}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-700">
                        <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="font-semibold">5TB {t('pages.integrations.perFile', 'por archivo')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <GoogleDriveConnection variant="card" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dropbox Integration */}
            <motion.div variants={item} className="h-full">
              <Card className="group h-full flex flex-col border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative bg-white">
                 {/* Blue Relief / Accent */}
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-l-xl" />

                <CardHeader className="pb-3 pl-5 pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                      <DropboxLogo className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900 mb-0.5">Dropbox</CardTitle>
                    <p className="text-[11px] font-medium text-indigo-600">{t('pages.integrations.collabAndFiles', 'Colaboración y Archivos')}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 pl-5 flex-1 flex flex-col pb-5 pr-5">
                  <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                    {t('pages.integrations.dropboxDesc', 'Integra tu cuenta de Dropbox para gestionar archivos y colaborar en documentos de forma eficiente.')}
                  </p>
                  
                  <div className="bg-gray-50/80 rounded-lg p-2.5 mb-4 flex-1">
                    <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('pages.integrations.features', 'Características')}</h4>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-[11px] text-gray-700 group/item">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5 group-hover/item:text-indigo-600 transition-colors" />
                        <span>{t('pages.integrations.realTimeCollab', 'Colaboración en tiempo real')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-[11px] text-gray-700 group/item">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5 group-hover/item:text-indigo-600 transition-colors" />
                        <span>{t('pages.integrations.versionHistory', 'Historial de versiones')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-[11px] text-gray-700 group/item">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5 group-hover/item:text-indigo-600 transition-colors" />
                        <span>{t('pages.integrations.secureLinks', 'Compartir enlaces seguros')}</span>
                      </li>
                    </ul>
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t('pages.integrations.maxSupport', 'Soporte máximo')}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-700">
                        <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <span className="font-semibold">350GB {t('pages.integrations.perFile', 'por archivo')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <DropboxConnection variant="card" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Coming Soon Card */}
            <motion.div variants={item} className="h-full">
              <Card className="h-full flex flex-col border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,transparent)]" />
                
                <CardHeader className="pb-3 pt-5 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
                      <Cloud className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-base text-gray-500 mb-0.5">{t('pages.integrations.comingSoonTitle', 'Próximas Integraciones')}</CardTitle>
                    <p className="text-[11px] text-gray-400">{t('pages.integrations.comingSoonSubtitle', 'Expandiendo tu ecosistema')}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1 flex flex-col relative z-10 pb-5 pr-5 pl-5">
                  <div className="space-y-2 mt-1">
                    {[
                      { name: "Microsoft OneDrive", icon: Cloud },
                      { name: "Box", icon: Cloud },
                      { name: "Amazon S3", icon: Cloud },
                    ].map((integration, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 opacity-60">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <integration.icon className="w-3 h-3 text-gray-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{integration.name}</span>
                        <span className="ml-auto text-[9px] font-bold text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded-full">{t('common.status.soon', 'PRONTO')}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-6 text-center">
                     <p className="text-[10px] text-gray-400 mb-2">{t('pages.integrations.requestDesc', '¿Necesitas una integración específica?')}</p>
                     <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center w-full gap-1 group">
                       {t('pages.integrations.requestBtn', 'Solicitar integración')}
                       <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
