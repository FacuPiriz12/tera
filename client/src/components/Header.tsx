import { Search, Bell, ClipboardList, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
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
import CloneDriveLogo from "./CloneDriveLogo";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

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
              <input
                type="text"
                placeholder={t('common.actions.searchPlaceholder', 'Buscar archivos o carpetas...')}
                className="w-full pl-11 pr-4 h-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <LanguageSelector />

          {/* Bell */}
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all duration-300"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 border border-white" />
            </span>
          </button>

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
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {user?.firstName} {user?.lastName}
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
  );
}
