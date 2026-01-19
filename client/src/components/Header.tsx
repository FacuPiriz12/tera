import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import CloneDriveLogo from "./CloneDriveLogo";
import LanguageSelector from "./LanguageSelector";
import SearchFilters from "@/components/SearchFilters";
import { Search, LogOut, Settings, User, Bell, Copy, FolderSync, CheckCircle, AlertCircle, ClipboardList, FileText, ExternalLink, CheckSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import type { CopyOperation } from "@shared/schema";

const AVATAR_COLORS = [
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-green-500", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-red-500", text: "text-white" },
  { bg: "bg-cyan-500", text: "text-white" },
  { bg: "bg-amber-500", text: "text-white" },
];

function getAvatarColorFromId(userId: string | number | undefined): { bg: string; text: string } {
  if (!userId) return AVATAR_COLORS[0];
  const str = String(userId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function Header() {
  const { user, signOut, isSigningOut, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const { data: operations = [] } = useQuery<CopyOperation[]>({
    queryKey: ["/api/copy-operations"],
    refetchInterval: isAuthenticated ? 10000 : false,
    enabled: isAuthenticated,
  });

  const recentNotifications = operations
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  const activeCount = operations.filter(op => op.status === 'in_progress' || op.status === 'pending').length;

  const avatarColor = useMemo(() => getAvatarColorFromId(user?.id), [user?.id]);

  const handleLogout = () => {
    signOut();
  };

  const goToDashboard = () => {
    setLocation('/');
  };

  const goToSettings = () => {
    setLocation('/settings');
  };

  const goToProfile = () => {
    setLocation('/profile');
  };

  const goToOperations = () => {
    setLocation('/operations');
  };

  const goToTasks = () => {
    setLocation('/tasks');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <FolderSync className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Copy className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('status.completed');
      case 'in_progress':
        return t('status.inProgress');
      case 'failed':
        return t('status.error');
      default:
        return t('status.pending');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="sticky top-0 z-[9999] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] border-b border-border" data-testid="header-main">
      <div className="px-8 h-[65px] flex justify-between items-center">
        <button 
          onClick={goToDashboard}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          data-testid="button-logo-dashboard"
        >
          <CloneDriveLogo className="h-10" />
        </button>
        
        <div className="flex-1 max-w-[40%] mx-8 hidden md:block">
          <div className="relative flex items-center bg-muted rounded-lg px-4 py-[0.6rem]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('actions.searchPlaceholder')}
              className="ml-2 w-full border-none bg-transparent text-[0.95rem] focus:outline-none focus:ring-0 shadow-none"
              data-testid="input-search"
            />
            <div className="relative">
              <SearchFilters 
                onFiltersChange={(filters) => console.log('Filters changed:', filters)}
                onSearch={(filters) => console.log('Search with filters:', filters)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <LanguageSelector />
          {user && (
            <>
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-accent/50 relative"
                    data-testid="button-notifications"
                  >
                    <Bell className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
                    {activeCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={12}
                  className="w-[340px] p-0 bg-card border border-border shadow-xl rounded-lg overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notificaciones</h3>
                  </div>
                  
                  <div className="max-h-[320px] overflow-y-auto">
                    {recentNotifications.length > 0 ? (
                      <div className="divide-y divide-border">
                        {recentNotifications.map((op) => (
                          <div 
                            key={op.id}
                            className="px-4 py-3 hover:bg-accent/30 transition-colors cursor-pointer"
                            onClick={goToOperations}
                            data-testid={`notification-${op.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{getStatusIcon(op.status)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {op.sourceName || t('pages.operations.copyOperation')}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {getStatusText(op.status)} - {op.copiedFiles}/{op.totalFiles} {t('pages.myFiles.files')}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatDate(op.createdAt!)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-6">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Bell className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground text-sm mb-1">No hay notificaciones</p>
                        <p className="text-xs text-muted-foreground text-center">
                          Las notificaciones de tus transferencias aparecerán aquí.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator className="m-0" />
                  <div className="p-2">
                    <button 
                      onClick={goToOperations}
                      className="w-full text-center text-sm text-primary hover:text-primary/80 py-2 font-medium transition-colors"
                      data-testid="link-all-operations"
                    >
                      Ver todas las operaciones
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Tasks Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-accent/50"
                    data-testid="button-tasks"
                  >
                    <CheckSquare className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={12}
                  className="w-[340px] p-0 bg-card border border-border shadow-xl rounded-lg overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground">Tareas</h3>
                  </div>
                  
                  <div className="max-h-[320px] overflow-y-auto">
                    <div className="flex flex-col items-center justify-center py-10 px-6">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <div className="relative">
                          <FileText className="w-6 h-6 text-blue-400 absolute -left-2 -top-1 rotate-[-15deg]" />
                          <ClipboardList className="w-7 h-7 text-blue-500 relative z-10" />
                          <CheckCircle className="w-4 h-4 text-green-500 absolute -right-1 -bottom-0.5" />
                        </div>
                      </div>
                      <p className="font-medium text-foreground text-sm mb-1">Ya estás al día</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Las tareas que te asignen aparecerán aquí. Vuelve más tarde para empezar a trabajar.
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator className="m-0" />
                  <div className="p-2">
                    <button 
                      onClick={goToTasks}
                      className="w-full text-center text-sm text-primary hover:text-primary/80 py-2 font-medium transition-colors"
                      data-testid="link-all-tasks"
                    >
                      Ver todas las tareas
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:opacity-80" data-testid="button-user-menu">
                    <Avatar className={`w-9 h-9 ${avatarColor.bg} ${avatarColor.text}`}>
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback className={`${avatarColor.bg} ${avatarColor.text} font-semibold text-sm`}>
                        {user.firstName?.[0]}{user.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={12}
                  className="min-w-[160px] p-1 bg-card border border-border shadow-xl rounded-lg"
                >
                  <DropdownMenuItem 
                    onClick={goToProfile} 
                    className="px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-foreground/80 hover:text-foreground hover:bg-accent/50"
                    data-testid="menu-profile"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('user.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={goToSettings} 
                    className="px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-foreground/80 hover:text-foreground hover:bg-accent/50"
                    data-testid="menu-settings"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('user.settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-foreground/80 hover:text-foreground hover:bg-accent/50"
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('auth.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
