import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import CloneDriveLogo from "./CloneDriveLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Search, LogOut, Settings, User, Bell, Copy, FolderSync, CheckCircle, AlertCircle, ClipboardList, FileText, ExternalLink } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLocation } from "wouter";
import type { CopyOperation } from "@shared/schema";

export default function Header() {
  const { user, signOut, isSigningOut, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);

  const { data: operations = [] } = useQuery<CopyOperation[]>({
    queryKey: ["/api/copy-operations"],
    refetchInterval: isAuthenticated ? 10000 : false,
    enabled: isAuthenticated,
  });

  const recentNotifications = operations
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 10);

  const activeCount = operations.filter(op => op.status === 'in_progress' || op.status === 'pending').length;

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
    setNotificationsOpen(false);
    setTasksOpen(false);
    setLocation('/operations');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <FolderSync className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Copy className="h-5 w-5 text-muted-foreground" />;
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
    <>
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
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user && (
              <>
                <LanguageSwitcher variant="icon" />
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setNotificationsOpen(true)}
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
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setTasksOpen(true)}
                  className="h-9 w-9 rounded-full hover:bg-accent/50"
                  data-testid="button-tasks"
                >
                  <ClipboardList className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:opacity-80" data-testid="button-user-menu">
                      <Avatar className="w-9 h-9 bg-primary text-white">
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-primary text-white font-semibold text-sm">
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

      {/* Notifications Sheet */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent className="w-[380px] sm:max-w-[380px] p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-lg font-semibold">Notificaciones</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              <div className="divide-y">
                {recentNotifications.map((op) => (
                  <div 
                    key={op.id}
                    className="p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={goToOperations}
                    data-testid={`notification-${op.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getStatusIcon(op.status)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {op.sourceName || t('pages.operations.copyOperation')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getStatusText(op.status)} - {op.copiedFiles}/{op.totalFiles} {t('pages.myFiles.files')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(op.createdAt!)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-2">No hay notificaciones</p>
                <p className="text-sm text-muted-foreground text-center">
                  Las notificaciones de tus transferencias y copias aparecerán aquí.
                </p>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <Button 
              variant="link" 
              className="w-full text-primary hover:text-primary/80"
              onClick={goToOperations}
            >
              Ver todas las operaciones
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Tasks Sheet */}
      <Sheet open={tasksOpen} onOpenChange={setTasksOpen}>
        <SheetContent className="w-[380px] sm:max-w-[380px] p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-lg font-semibold">Tareas</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <div className="relative">
                  <FileText className="w-8 h-8 text-blue-400 absolute -left-3 -top-2 rotate-[-15deg]" />
                  <ClipboardList className="w-10 h-10 text-blue-500 relative z-10" />
                  <CheckCircle className="w-6 h-6 text-green-500 absolute -right-2 -bottom-1" />
                </div>
              </div>
              <p className="font-medium text-foreground mb-2">Ya estás al día</p>
              <p className="text-sm text-muted-foreground text-center">
                Las tareas que te asignen aparecerán aquí. Vuelve más tarde para empezar a trabajar.
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <Button 
              variant="link" 
              className="w-full text-primary hover:text-primary/80"
              onClick={goToOperations}
            >
              Ver todas las tareas
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
