import { useAuth } from "@/hooks/useAuth";
import CloneDriveLogo from "./CloneDriveLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Search, LogOut, Settings, User, Bell, Copy, FolderSync, CheckCircle, AlertCircle, ClipboardList } from "lucide-react";
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
import { useLocation } from "wouter";
import type { CopyOperation } from "@shared/schema";

export default function Header() {
  const { user, signOut, isSigningOut, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Fetch recent operations for notifications
  const { data: operations = [] } = useQuery<CopyOperation[]>({
    queryKey: ["/api/copy-operations"],
    refetchInterval: isAuthenticated ? 10000 : false,
    enabled: isAuthenticated,
  });

  // Get recent notifications (last 5 operations)
  const recentNotifications = operations
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  // Count unread (in_progress or pending)
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
    setLocation('/operations');
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

  return (
    <header className="sticky top-0 z-[9999] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] border-b border-border" data-testid="header-main">
      <div className="px-8 h-[65px] flex justify-between items-center">
        {/* Logo */}
        <button 
          onClick={goToDashboard}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          data-testid="button-logo-dashboard"
        >
          <CloneDriveLogo className="h-10" />
        </button>
        
        {/* Search Bar */}
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
        
        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* Language Switcher */}
              <LanguageSwitcher variant="icon" />
              
              {/* Notifications */}
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
                  className="w-[280px] p-1 bg-card border border-border shadow-xl rounded-lg"
                >
                  {recentNotifications.length > 0 ? (
                    <>
                      {recentNotifications.map((op) => (
                        <DropdownMenuItem 
                          key={op.id}
                          onClick={goToOperations}
                          className="px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-foreground/80 hover:text-foreground hover:bg-accent/50 flex items-start gap-3"
                          data-testid={`notification-${op.id}`}
                        >
                          <div className="mt-0.5">{getStatusIcon(op.status)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-xs">
                              {op.sourceName || t('pages.operations.copyOperation')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getStatusText(op.status)} - {op.copiedFiles}/{op.totalFiles} {t('pages.myFiles.files')}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem 
                        onClick={goToOperations}
                        className="px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-primary hover:text-primary hover:bg-accent/50 text-center justify-center font-medium"
                        data-testid="notification-view-all"
                      >
                        {t('pages.operations.title')}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      {t('sidebar.noRecentActivity')}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Tasks */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={goToOperations}
                className="h-9 w-9 rounded-full hover:bg-accent/50"
                data-testid="button-tasks"
                aria-label={t('pages.operations.title')}
                title={t('pages.operations.title')}
              >
                <ClipboardList className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
              </Button>
              
              {/* User Profile */}
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
  );
}
