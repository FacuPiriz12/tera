import { useState, useEffect } from 'react';
import { 
  Home, 
  Share2, 
  FileText, 
  Clock, 
  Zap, 
  Settings,
  Globe,
  Folder, 
  Users, 
  BarChart3,
  ChevronRight
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isExpanded ? '288px' : '80px'
    );
  }, [isExpanded]);
  
  const navItems = [
    { id: 'home', path: "/dashboard", icon: Home, label: t('common.navigation.home'), section: 'menu' },
    { id: 'shared-drives', path: "/shared-drives", icon: Share2, label: t('common.navigation.sharedDrives'), section: 'menu' },
    { id: 'operations', path: "/operations", icon: FileText, label: t('common.navigation.operations'), section: 'menu' },
    { id: 'tasks', path: "/tasks", icon: t('common.navigation.tasks'), section: 'menu' },
    { id: 'health', path: "/health", icon: Zap, label: t('common.navigation.health'), section: 'menu' },
    { id: 'integrations', path: "/integrations", icon: Settings, label: t('common.navigation.integrations'), section: 'other' },
    { id: 'cloud-explorer', path: "/cloud-explorer", icon: Globe, label: t('common.navigation.cloudExplorer'), section: 'other' },
    { id: 'my-files', path: "/my-files", icon: Folder, label: t('common.navigation.myFiles'), section: 'other' },
    { id: 'shared', path: "/shared", icon: Users, label: t('common.navigation.shared'), section: 'other' },
    { id: 'analytics', path: "/analytics", icon: BarChart3, label: t('common.navigation.analytics'), section: 'other' },
  ];

  const groups = [
    { id: 'tera-studio', name: 'TERA Studio', color: 'bg-green-500' },
    { id: 'analytics', name: 'Analytics Team', color: 'bg-blue-500' },
    { id: 'design', name: 'Design Hub', color: 'bg-purple-500' }
  ];

  const menuSection = navItems.filter(item => item.section === 'menu');
  const otherSection = navItems.filter(item => item.section === 'other');

  return (
    <aside 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`bg-white border-r border-slate-200 flex flex-col fixed left-0 top-[75px] h-[calc(100vh-75px)] transition-all duration-300 ease-in-out z-[120] ${
        isExpanded ? 'w-72 shadow-xl' : 'w-20'
      }`}
      style={{ backgroundColor: '#ffffff' }}
      data-testid="sidebar-main"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 scrollbar-hide">
        {/* Menu Section */}
        <div className="mb-6">
          {isExpanded && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-4 animate-in fade-in duration-500">
              {t('common.navigation.mainMenu', 'Menú Principal')}
            </p>
          )}
          <div className="space-y-1">
            {menuSection.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon || Clock;
              return (
                <Link key={item.id} href={item.path}>
                  <div
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-[#0061D5]/10 text-[#0061D5] shadow-sm'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center ${!isExpanded ? 'w-full' : ''}`}>
                        <Icon className={`w-5 h-5 flex-shrink-0 ${
                          isActive ? 'text-[#0061D5]' : 'group-hover:text-slate-900'
                        } transition-colors`} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      {isExpanded && (
                        <span className={`font-semibold text-sm whitespace-nowrap animate-in slide-in-from-left-2 duration-300 ${
                          isActive ? 'text-[#0061D5]' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-4 mx-3"></div>

        {/* Other Section */}
        <div className="mb-6">
          {isExpanded && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-4 animate-in fade-in duration-500">
              {t('common.navigation.tools', 'Herramientas')}
            </p>
          )}
          <div className="space-y-1">
            {otherSection.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.id} href={item.path}>
                  <div
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-[#0061D5]/10 text-[#0061D5] shadow-sm'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center ${!isExpanded ? 'w-full' : ''}`}>
                        <Icon className={`w-5 h-5 flex-shrink-0 ${
                          isActive ? 'text-[#0061D5]' : 'group-hover:text-slate-900'
                        } transition-colors`} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      {isExpanded && (
                        <span className={`font-semibold text-sm whitespace-nowrap animate-in slide-in-from-left-2 duration-300 ${
                          isActive ? 'text-[#0061D5]' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-4 mx-3"></div>

        {/* Groups Section */}
        {isExpanded ? (
          <div className="animate-in fade-in duration-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">
              {t('common.navigation.groups', 'Grupos')}
            </p>
            <div className="space-y-1">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${group.color}`}></div>
                    <span className="font-semibold text-sm text-slate-700 group-hover:text-slate-900">
                      {group.name}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 mt-4">
            {groups.map((group) => (
              <div key={group.id} className={`w-2 h-2 rounded-full ${group.color} transition-all duration-300 hover:scale-150 cursor-pointer shadow-sm`}></div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
