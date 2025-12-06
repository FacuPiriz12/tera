import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuArrow,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
];

interface LanguageSwitcherProps {
  variant?: 'select' | 'button' | 'icon';
}

export default function LanguageSwitcher({ variant = 'select' }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  if (variant === 'button') {
    return (
      <div className="flex items-center gap-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={i18n.language === lang.code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center gap-1"
            data-testid={`button-language-${lang.code}`}
          >
            <span className="text-xs">{lang.code.toUpperCase()}</span>
          </Button>
        ))}
      </div>
    );
  }
  
  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-accent/50 focus-visible:ring-1 focus-visible:ring-ring"
            data-testid="button-language-icon"
            aria-label={t('language.switchLanguage')}
          >
            <Globe className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={12}
          className="min-w-[160px] p-1 bg-card border border-border shadow-xl rounded-lg"
        >
          <DropdownMenuArrow className="fill-card" />
          {languages.map((lang) => (
            <DropdownMenuItem 
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`
                px-3 py-2 text-sm cursor-pointer rounded-md transition-colors
                ${i18n.language === lang.code 
                  ? 'bg-accent text-accent-foreground font-medium' 
                  : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                }
              `}
              data-testid={`menu-language-${lang.code}`}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[120px] border-0 bg-transparent hover:bg-accent/50" data-testid="select-language">
          <SelectValue>
            <span className="text-sm">{currentLanguage.name}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-[140px]">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              data-testid={`option-language-${lang.code}`}
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}