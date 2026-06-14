import { useState } from 'react';
import { Home, FileText, Settings, Globe, Folder, BarChart3, Zap } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const menuItems = [
    { id: 'home',           path: "/dashboard",      icon: Home,      label: t('common.navigation.home') },
    { id: 'cloud-explorer', path: "/cloud-explorer", icon: Globe,     label: t('common.navigation.cloudExplorer') },
    { id: 'my-files',       path: "/my-files",       icon: Folder,    label: t('common.navigation.myFiles') },
    { id: 'operations',     path: "/operations",     icon: FileText,  label: t('common.navigation.operations') },
  ];

  const toolItems = [
    { id: 'quick-copy',   path: "/copy-from-url", icon: Zap,       label: t('common.navigation.copyFromUrl') },
    { id: 'integrations', path: "/integrations",  icon: Settings,  label: t('common.navigation.integrations') },
    { id: 'analytics',    path: "/analytics",     icon: BarChart3, label: t('common.navigation.analytics') },
  ];

  function NavItem({ id, path, icon: Icon, label }: { id: string; path: string; icon: any; label: string }) {
    const isActive = location === path;
    return (
      <Link href={path}>
        <div className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${
          isActive ? 'bg-[#0061D5]/10 text-[#0061D5] shadow-sm' : 'hover:bg-slate-50 text-slate-600'
        }`}>
          <div className={`flex items-center justify-center ${!isExpanded ? 'w-full' : ''}`}>
            <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
              isActive ? 'text-[#0061D5]' : 'group-hover:text-slate-900'
            }`} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          {isExpanded && (
            <span className={`ml-3 font-semibold text-sm whitespace-nowrap animate-in slide-in-from-left-2 duration-300 ${
              isActive ? 'text-[#0061D5]' : 'text-slate-700 group-hover:text-slate-900'
            }`}>
              {label}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`bg-white border-r border-slate-200 flex flex-col fixed left-0 top-[75px] h-[calc(100vh-75px)] transition-all duration-300 ease-in-out z-[90] ${
        isExpanded ? 'w-64 shadow-xl' : 'w-20'
      }`}
      data-testid="sidebar-main"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 scrollbar-hide">
        <div className="mb-2">
          {isExpanded && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 animate-in fade-in duration-300">
              {t('common.navigation.mainMenu', 'Principal')}
            </p>
          )}
          <div className="space-y-0.5">
            {menuItems.map(item => <NavItem key={item.id} {...item} />)}
          </div>
        </div>

        <div className="h-px bg-slate-100 my-3 mx-3" />

        <div>
          {isExpanded && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 animate-in fade-in duration-300">
              {t('common.navigation.tools', 'Herramientas')}
            </p>
          )}
          <div className="space-y-0.5">
            {toolItems.map(item => <NavItem key={item.id} {...item} />)}
          </div>
        </div>
      </div>
    </aside>
  );
}
