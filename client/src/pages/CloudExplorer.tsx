import React, { useState, useEffect } from 'react';
import { 
  Cloud, Folder, File, Search, RefreshCw, ChevronRight,
  FileText, FileSpreadsheet, Image as ImageIcon, Video, Music, Archive,
  MoreVertical, Grid, List,
  Filter, ArrowRightLeft, Globe, Clock, Star, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

// Placeholder logos until real assets are available
const googleLogo = "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg";
const dropboxLogo = "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg";
const onedriveLogo = "https://upload.wikimedia.org/wikipedia/commons/3/3c/Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg";
const boxLogo = "https://upload.wikimedia.org/wikipedia/commons/5/57/Box%2C_Inc._logo.svg";

export default function CloudExplorer() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'explorer' | 'transfers'>('explorer');
  const [syncMode, setSyncMode] = useState<'acumulativa' | 'mirror'>('acumulativa');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const cloudProviders = [
    { id: 'google', name: 'Google Drive', logo: googleLogo, color: '#4285F4' },
    { id: 'dropbox', name: 'Dropbox', logo: dropboxLogo, color: '#0061FF' },
    { id: 'onedrive', name: 'OneDrive', logo: onedriveLogo, color: '#0078D4' },
    { id: 'box', name: 'Box', logo: boxLogo, color: '#0061D5' }
  ];

  const folders = [
    { id: 1, name: '20 cellos en SVG', items: 45, cloud: 'google' },
    { id: 2, name: 'Copy of Fotos Lenceria', items: 128, cloud: 'google' },
    { id: 3, name: 'WP Rocket', items: 23, cloud: 'google' },
    { id: 4, name: 'Typebot Download', items: 12, cloud: 'dropbox' },
    { id: 5, name: '20 selos em SVG', items: 45, cloud: 'google' },
    { id: 6, name: 'Colab Notebooks', items: 67, cloud: 'google' }
  ];

  const files = [
    { id: 13, name: 'IA DE LIGAÇÃO.zip', size: '2.3 MB', type: 'archive', color: 'gray', cloud: 'google' },
    { id: 14, name: 'Planilla Finanzas Perso...', size: '19 KB', type: 'spreadsheet', color: 'green', cloud: 'google' },
    { id: 15, name: 'Documento sin título', size: '5 KB', type: 'document', color: 'blue', cloud: 'dropbox' },
    { id: 16, name: 'Planilla Chacra.xlsx', size: '16 KB', type: 'spreadsheet', color: 'green', cloud: 'google' }
  ];

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'spreadsheet': return FileSpreadsheet;
      case 'document': return FileText;
      case 'archive': return Archive;
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  const getFileColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-50 text-gray-400',
      green: 'bg-emerald-50 text-emerald-500',
      blue: 'bg-blue-50 text-blue-500',
      orange: 'bg-orange-50 text-orange-500',
      purple: 'bg-purple-50 text-purple-500',
      pink: 'bg-pink-50 text-pink-500'
    };
    return colors[color] || colors.gray;
  };

  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDropTarget(targetId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem) {
      setPendingTransfer(draggedItem);
      setShowSyncModal(true);
    }
    setDropTarget(null);
  };

  const confirmTransfer = (mode: 'acumulativa' | 'mirror') => {
    setSyncMode(mode);
    setShowSyncModal(false);
    toast({
      title: t('copy.transferInitiated', "Transferencia iniciada"),
      description: t('copy.transferDesc', "Tu archivo está siendo transferido. Verás el progreso abajo."),
    });
    setPendingTransfer(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 80px)' }}>
      <Header />
      <Sidebar />
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSyncModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
            >
              <div className="p-8">
                {pendingTransfer && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      {('items' in pendingTransfer) ? <Folder className="w-6 h-6 text-blue-500" /> : <File className="w-6 h-6 text-blue-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{pendingTransfer.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{pendingTransfer.size || `${pendingTransfer.items} elementos`}</p>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('pages.cloudExplorer.syncMode', 'Modo de sincronización')}</h3>
                <p className="text-sm text-slate-500 mb-8">{t('pages.cloudExplorer.syncDesc', 'Selecciona cómo quieres que TERA gestione este envío.')}</p>

                <div className="space-y-3">
                  <button
                    onClick={() => confirmTransfer('acumulativa')}
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all group flex flex-col items-center gap-1"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-blue-600">{t('pages.cloudExplorer.cumulative', 'Acumulativa')}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-400">{t('pages.cloudExplorer.cumulativeDesc', 'Añade archivos nuevos sin borrar existentes')}</span>
                  </button>
                  <button
                    onClick={() => confirmTransfer('mirror')}
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all group flex flex-col items-center gap-1"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-blue-600">{t('pages.cloudExplorer.mirror', 'Mirror Sync')}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-400">{t('pages.cloudExplorer.mirrorDesc', 'Sincronización exacta de ambas carpetas')}</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowSyncModal(false)}
                  className="w-full mt-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {t('common.actions.cancel', 'Cancelar envío')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('pages.cloudExplorer.title', 'Cloud Explorer')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('pages.cloudExplorer.subtitle', 'Gestiona tus archivos multi-nube con la potencia de TERA.')}</p>
              </div>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200 w-fit">
                <button
                  onClick={() => setActiveTab('explorer')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'explorer'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  {t('common.actions.explore', 'Explorar')}
                </button>
                <button
                  onClick={() => setActiveTab('transfers')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'transfers'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('common.navigation.operations', 'Transferencias')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((panelIdx) => {
              const isDestination = panelIdx === 2;
              return (
                <div
                  key={panelIdx}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-[700px] transition-all duration-300 ${
                    isDestination && dropTarget === 'panel-2' ? 'ring-2 ring-blue-500 bg-blue-50/10' : ''
                  }`}
                >
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <img src={googleLogo} alt="Google Drive" className="w-5 h-5 object-contain" />
                        <img src={dropboxLogo} alt="Dropbox" className="w-5 h-5 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('common.actions.searchPlaceholder')}
                          className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all w-48"
                        />
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div 
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => isDestination && handleDragEnter(e, 'panel-2')}
                    onDragLeave={() => isDestination && setDropTarget(null)}
                    onDrop={(e) => isDestination && handleDrop(e, 'panel-2')}
                    className="p-6 flex-1 relative bg-white rounded-b-2xl overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {isDestination ? t('pages.cloudExplorer.remoteDest', 'Destino Remoto') : t('dashboard.title', 'Mi Unidad')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(!isDestination || (isDestination && dropTarget === 'panel-2' && draggedItem)) && (isDestination ? [draggedItem].filter(Boolean) : [...folders, ...files]).map((item, i) => {
                        const isFolder = 'items' in item;
                        const Icon = isFolder ? Folder : getFileIcon(item.type);
                        return (
                          <motion.div
                            key={item.id || i}
                            draggable={!isDestination}
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                            className={`p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col items-center text-center gap-3 ${isDestination ? 'opacity-50' : ''}`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isFolder ? 'bg-blue-50 text-blue-500' : getFileColor(item.color)} group-hover:scale-110 transition-transform`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                              <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">{item.size || `${item.items} elementos`}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
