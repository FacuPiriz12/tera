import { Search, Bell, ClipboardList, User, LogOut, Settings, ChevronDown, CheckCircle2, XCircle, Loader2, ArrowRightLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useRef, useEffect, useState } from "react";
import GlobalSearch from "./GlobalSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useTransfer, TransferJob } from "@/contexts/TransferContext";
import CloneDriveLogo from "./CloneDriveLogo";
import LanguageSelector from "./LanguageSelector";

function getUserInitials(user: any): string {
  if (user?.firstName || user?.lastName) {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  }
  if (user?.email) return user.email[0].toUpperCase();
  return 'U';
}

function NotificationItem({ job }: { job: TransferJob }) {
  const { t } = useTranslation();

  const icon =
    job.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> :
    job.status === 'failed'    ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" /> :
    <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />;

  const label =
    job.status === 'completed' ? t('common.notifications.statusCompleted') :
    job.status === 'failed'    ? t('common.notifications.statusFailed') :
    t('common.notifications.statusInProgress');

  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate" title={job.fileName}>{job.fileName}</p>
        <p className="text-xs text-gray-400">{label} · {job.sourceProvider} → {job.targetProvider}</p>
        {job.status === 'failed' && job.errorMessage && (
          <p className="text-xs text-red-400 mt-0.5 truncate" title={job.errorMessage}>{job.errorMessage}</p>
        )}
      </div>
    </div>
  );
}

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const { jobs, activeJobsCount } = useTransfer();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  const recentJobs = jobs.slice(0, 6);
  const hasUnread = jobs.some(j => j.status === 'completed' || j.status === 'failed' || j.status === 'in_progress');

  // Cmd+K / Ctrl+K opens global search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm h-[75px]">
      <div className="px-8 h-full flex items-center justify-between max-w-full mx-auto">

        {/* Logo */}
        <div className="flex items-center w-full">
          <div
            className="flex items-center justify-center w-[120px] ml-[-5px] flex-shrink-0 cursor-pointer"
            onClick={() => setLocation('/')}
          >
            <CloneDriveLogo className="h-12 w-auto object-contain" />
          </div>

          <div className="h-10 w-px bg-gray-100 mx-8 hidden md:block flex-shrink-0" />

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <button
                onClick={() => setGlobalSearchOpen(true)}
                className="w-full pl-11 pr-16 h-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 text-left hover:bg-white hover:border-blue-300 transition-all duration-200 cursor-text"
              >
                {t('common.actions.searchPlaceholder', 'Buscar archivos o carpetas...')}
              </button>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded pointer-events-none lg:flex items-center gap-0.5 hidden">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <LanguageSelector />

          {/* Bell — notification dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all duration-300"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 border border-white" />
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2 rounded-2xl shadow-lg border-gray-100 p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold text-gray-800">{t('common.notifications.transfers')}</span>
                  {activeJobsCount > 0 && (
                    <span className="text-xs font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{activeJobsCount}</span>
                  )}
                </div>
                <button
                  onClick={() => setLocation('/operations')}
                  className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition-colors"
                >
                  {t('common.notifications.seeAll')} →
                </button>
              </div>
              {recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Bell className="w-8 h-8 text-gray-200" />
                  <p className="text-sm text-gray-400">{t('common.notifications.empty')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {recentJobs.map(job => <NotificationItem key={job.id} job={job} />)}
                </div>
              )}
              {recentJobs.length > 0 && (
                <div className="border-t border-gray-100 px-3 py-2">
                  <button
                    onClick={() => setLocation('/operations')}
                    className="w-full text-center text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors py-1"
                  >
                    {t('common.notifications.seeHistory')}
                  </button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Operations */}
          <button
            onClick={() => setLocation('/operations')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all duration-300"
            title="Operaciones"
          >
            <ClipboardList className="w-5 h-5" />
          </button>

          <div className="h-5 w-px bg-gray-100 mx-1" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 outline-none">
                <Avatar className="w-8 h-8 rounded-lg">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold rounded-lg">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ((user as any)?.email?.split('@')[0] || 'Usuario')}
                  </p>
                  <p className="text-[11px] text-gray-400 capitalize leading-tight mt-0.5">
                    {(user as any)?.role || 'Usuario'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mt-2 rounded-2xl shadow-lg border-gray-100 p-1">
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {t('common.user.profile')}
              </div>
              <DropdownMenuItem onClick={() => setLocation('/profile')} className="rounded-xl cursor-pointer gap-2">
                <User className="h-4 w-4" /> {t('common.user.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/settings')} className="rounded-xl cursor-pointer gap-2">
                <Settings className="h-4 w-4" /> {t('common.user.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="rounded-xl cursor-pointer gap-2 text-red-500 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> {t('common.auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <GlobalSearch open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />
  );
}
