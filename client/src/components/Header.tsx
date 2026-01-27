import { Search, Bell, CheckSquare, User, LogOut, Settings, Languages, ChevronDown, ListTodo } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import CloneDriveLogo from "./CloneDriveLogo";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-[110] bg-white border-b border-gray-100 h-[75px]">
      <div className="px-8 h-full flex justify-between items-center max-w-full mx-auto">
        <div className="flex items-center w-full">
          <div className="flex items-center justify-center w-[120px] ml-[-5px] flex-shrink-0 cursor-pointer" onClick={() => setLocation('/')}>
            <CloneDriveLogo className="h-12 w-auto object-contain" />
          </div>
          <div className="h-10 w-px bg-gray-100 mx-8 hidden md:block flex-shrink-0" />
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                type="text"
                placeholder={t('common.actions.searchPlaceholder')}
                className="pl-11 w-full border-gray-100 bg-gray-50/50 rounded-xl text-[0.95rem] focus:bg-white transition-all h-11"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector />

          <div className="h-4 w-[1px] bg-gray-100 mx-1" />

          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-gray-50">
            <Bell className="h-[20px] w-[20px] text-gray-500" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-blue-500 border-2 border-white rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-50" onClick={() => setLocation('/tasks')}>
            <ListTodo className="h-[20px] w-[20px] text-gray-500" />
          </Button>

          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-50" onClick={() => setLocation('/operations')}>
            <CheckSquare className="h-[20px] w-[20px] text-gray-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="pl-1 pr-2 py-1 h-11 rounded-xl hover:bg-gray-50 gap-2">
                <Avatar className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[11px] text-gray-500 mt-1 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('common.user.profile')}
              </div>
              <DropdownMenuItem onClick={() => setLocation('/profile')}>
                <User className="mr-2 h-4 w-4" /> {t('common.user.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/settings')}>
                <Settings className="mr-2 h-4 w-4" /> {t('common.user.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> {t('common.auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
