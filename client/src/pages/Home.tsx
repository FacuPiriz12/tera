import { useState, useEffect } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  MoreVertical, 
  Folder, 
  HardDrive,
  Upload,
  Plus
} from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { CopyOperation } from "@shared/schema";

export default function Home() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: operations = [] } = useQuery<CopyOperation[]>({
    queryKey: ["/api/copy-operations"],
  });

  const categories = [
    { title: t('dashboard.categories.documents', 'Documentos'), count: '1,245', size: '2.4 GB', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: t('dashboard.categories.images', 'Imágenes'), count: '8,450', size: '14.5 GB', icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: t('dashboard.categories.media', 'Multimedia'), count: '450', size: '8.2 GB', icon: Video, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: t('dashboard.categories.others', 'Otros'), count: '320', size: '1.8 GB', icon: Folder, color: 'text-gray-500', bg: 'bg-gray-50' },
  ];

  const recentFiles = operations
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5)
    .map(op => ({
      name: op.sourceName || t('common.notifications.copyOperation'),
      size: `${(op.totalFiles || 0)} files`,
      date: new Date(op.createdAt!).toLocaleDateString(),
      type: 'transfer',
      icon: FileText,
      color: op.status === 'completed' ? 'text-green-500' : 'text-blue-500',
      bg: op.status === 'completed' ? 'bg-green-50' : 'bg-blue-50'
    }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-all duration-300 pl-20">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title', 'Mi Unidad')}</h1>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2"
                onClick={() => setLocation('/cloud-explorer')}
              >
                <Upload className="w-4 h-4" />
                {t('common.actions.upload', 'Subir Archivo')}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">{t('sidebar.storage')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="relative pt-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">75% {t('dashboard.storage.used', 'Utilizado')}</span>
                        <span className="text-gray-500">75 GB / 100 GB</span>
                      </div>
                      <Progress value={75} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs font-medium text-gray-500">{t('dashboard.categories.documents')}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 ml-4">24.5 GB</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="text-xs font-medium text-gray-500">{t('dashboard.categories.images')}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 ml-4">32.8 GB</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100"
                      onClick={() => setLocation('/analytics')}
                    >
                      {t('common.actions.viewDetails', 'Ver detalles')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                  <Card key={i} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6 flex items-start justify-between">
                      <div>
                        <div className={`w-10 h-10 ${cat.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <cat.icon className={`w-5 h-5 ${cat.color}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{cat.title}</h3>
                        <p className="text-sm text-gray-500">{cat.count} {t('common.notifications.files')}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {cat.size}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.quickAccess', 'Acceso Rápido')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HardDrive className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('common.navigation.home')}</h3>
                      <p className="text-xs text-gray-500">{t('dashboard.quickAccess.homeDesc', 'Panel principal')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('common.navigation.operations')}</h3>
                      <p className="text-xs text-gray-500">{t('dashboard.quickAccess.opsDesc', 'Gestionar flujos')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('common.navigation.tasks')}</h3>
                      <p className="text-xs text-gray-500">{t('dashboard.quickAccess.tasksDesc', 'Pendientes hoy')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MoreVertical className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('common.navigation.analytics')}</h3>
                      <p className="text-xs text-gray-500">{t('dashboard.quickAccess.analyticsDesc', 'Estadísticas')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentFiles', 'Archivos Recientes')}</h2>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('common.actions.viewAll', 'Ver todos')}
                </Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/30">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.table.name', 'Nombre')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.table.size', 'Tamaño')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.table.date', 'Modificado')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('common.table.actions', 'Acciones')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentFiles.map((file, i) => (
                        <tr key={i} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${file.bg} rounded-lg flex items-center justify-center`}>
                                <file.icon className={`w-4 h-4 ${file.color}`} />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{file.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{file.type.toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500 font-medium">{file.size}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">{file.date}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
