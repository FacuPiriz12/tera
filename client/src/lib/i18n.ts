import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      common: {
        app: {
          title: "TERA",
          description: "Gestión de archivos de Google Drive"
        },
        navigation: {
          home: "Inicio",
          files: "Archivos", 
          operations: "Operaciones",
          myFiles: "Mis Archivos",
          sharedDrives: "Drives Compartidos",
          analytics: "Analíticas",
          settings: "Configuración",
          profile: "Perfil",
          copyFromUrl: "Copiar desde URL",
          integrations: "Integraciones",
          pricing: "Precios",
          security: "Seguridad"
        },
        language: {
          select: "Seleccionar idioma",
          spanish: "Español",
          english: "English",
          portuguese: "Português",
          switchLanguage: "Cambiar idioma"
        },
        auth: {
          login: "Iniciar Sesión",
          logout: "Cerrar Sesión",
          loggingOut: "Cerrando sesión..."
        },
        buttons: {
          cancel: "Cancelar",
          confirm: "Confirmar",
          save: "Guardar",
          close: "Cerrar",
          retry: "Reintentar",
          back: "Volver",
          next: "Siguiente",
          change: "Cambiar",
          select: "Seleccionar"
        }
      },
      landing: {
        hero: {
          title: "Mueve y protege tus archivos con",
          subtitle: "Inteligencia Real",
          description: "TERA es el puente entre tus nubes. Transfiere archivos entre plataformas, programa copias de seguridad automáticas y conecta tus herramientas favoritas en segundos.",
          ctaButton: "Empieza gratis hoy"
        },
        features: {
          title: "Productos"
        }
      }
    }
  },
  en: {
    translation: {
      common: {
        app: {
          title: "TERA",
          description: "Google Drive file management"
        },
        navigation: {
          home: "Home",
          files: "Files", 
          operations: "Operations",
          myFiles: "My Files",
          sharedDrives: "Shared Drives",
          analytics: "Analytics",
          settings: "Settings",
          profile: "Profile",
          copyFromUrl: "Copy from URL",
          integrations: "Integrations",
          pricing: "Pricing",
          security: "Security"
        },
        language: {
          select: "Select language",
          spanish: "Español",
          english: "English",
          portuguese: "Portuguese",
          switchLanguage: "Switch language"
        },
        auth: {
          login: "Log In",
          logout: "Log Out",
          loggingOut: "Logging out..."
        },
        buttons: {
          cancel: "Cancel",
          confirm: "Confirm",
          save: "Save",
          close: "Close",
          retry: "Retry",
          back: "Back",
          next: "Next",
          change: "Change",
          select: "Select"
        }
      },
      landing: {
        hero: {
          title: "Move and protect your files with",
          subtitle: "Real Intelligence",
          description: "TERA is the bridge between your clouds. Transfer files between platforms, schedule automatic backups, and connect your favorite tools in seconds.",
          ctaButton: "Start for free today"
        },
        features: {
          title: "Products"
        }
      }
    }
  },
  pt: {
    translation: {
      common: {
        app: {
          title: "TERA",
          description: "Gerenciamento de arquivos do Google Drive"
        },
        navigation: {
          home: "Início",
          files: "Arquivos", 
          operations: "Operações",
          myFiles: "Meus Arquivos",
          sharedDrives: "Drives Compartilhados",
          analytics: "Análises",
          settings: "Configurações",
          profile: "Perfil",
          copyFromUrl: "Copiar de URL",
          integrations: "Integrações",
          pricing: "Preços",
          security: "Segurança"
        },
        language: {
          select: "Selecionar idioma",
          spanish: "Español",
          english: "English",
          portuguese: "Português",
          switchLanguage: "Alterar idioma"
        },
        auth: {
          login: "Entrar",
          logout: "Sair",
          loggingOut: "Saindo..."
        },
        buttons: {
          cancel: "Cancelar",
          confirm: "Confirmar",
          save: "Salvar",
          close: "Fechar",
          retry: "Repetir",
          back: "Voltar",
          next: "Próximo",
          change: "Alterar",
          select: "Selecionar"
        }
      },
      landing: {
        hero: {
          title: "Mova e proteja seus arquivos com",
          subtitle: "Inteligencia Real",
          description: "TERA é a ponte entre suas nuvens. Transfira arquivos entre plataformas, agende backups automáticos e conecte suas ferramentas favoritas em segundos.",
          ctaButton: "Comece grátis hoje"
        },
        features: {
          title: "Productos"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['es', 'en', 'pt'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;