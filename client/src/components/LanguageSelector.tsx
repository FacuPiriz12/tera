import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' }
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  
  const [currentLang, setCurrentLang] = useState(() => {
    const code = i18n.language.split('-')[0].toLowerCase();
    return languages.find(l => l.code === code) || languages[0];
  });

  useEffect(() => {
    const code = i18n.language.split('-')[0].toLowerCase();
    const lang = languages.find(l => l.code === code);
    if (lang) setCurrentLang(lang);
  }, [i18n.language]);

  const changeLanguage = (lang: typeof languages[0]) => {
    i18n.changeLanguage(lang.code);
    setCurrentLang(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 active:scale-95 bg-white shadow-sm border border-gray-100"
        title="Cambiar idioma"
      >
        <Globe className="w-5 h-5 flex-shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl overflow-hidden py-3 z-[60]"
          >
            <div className="px-4 py-2 mb-1 border-b border-gray-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seleccionar idioma</span>
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-all duration-200 text-left ${
                  currentLang.code === lang.code 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {currentLang.code === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
