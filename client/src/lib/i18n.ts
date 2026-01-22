import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Spanish speaking countries ISO codes
const spanishSpeakingCountries = [
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GQ', 
  'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'ES', 'UY', 'VE'
];

const customDetector = {
  name: 'locationLanguageDetector',
  lookup() {
    // 1. Check localStorage first (user preference)
    const saved = localStorage.getItem('i18nextLng');
    if (saved) return saved;

    // 2. Try to detect by browser language/location
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    const browserRegion = navigator.language.split('-')[1]?.toUpperCase();

    // Portuguese rule: Brazil (BR) or Portugal (PT)
    if (browserRegion === 'BR' || browserRegion === 'PT') {
      return 'pt';
    }

    // Spanish rule: Any Spanish speaking country
    if (spanishSpeakingCountries.includes(browserRegion || '')) {
      return 'es';
    }

    // Default to browser language if it's one of ours
    if (['es', 'en', 'pt'].includes(browserLang)) {
      return browserLang;
    }

    return 'en';
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('i18nextLng', lng);
  }
};

const resources = {
  es: {
    translation: {
      welcomeMessages: [
        "¡Volviste! Qué bueno verte otra vez 🙌",
        "¡Ey! Te estábamos esperando",
        "¡Qué alegría verte de nuevo!",
        "¡Acá estás! Vamos a seguir",
        "¡Bien ahí! Qué gusto tenerte otra vez",
        "¡Hey! Todo listo para continuar",
        "¡De vuelta al ruedo! 💪",
        "¡Qué bueno que regresaste!",
        "¡Hola otra vez! ¿Listo para seguir?",
        "¡Llegaste justo!",
        "¡Vamos! Te extrañábamos",
        "¡Todo listo! Arranquemos 🚀"
      ],
      emailVerificationTitle: "Verifica tu correo",
      emailVerificationDescription: "Haz clic en el botón de abajo para confirmar tu dirección de correo electrónico.",
      emailVerificationInfo: "Estás a un paso de completar tu registro. Confirma tu correo para activar tu cuenta.",
      emailVerificationConfirmButton: "Confirmar mi correo",
      emailVerificationSecurityNote: "Este paso adicional protege tu cuenta contra verificaciones automáticas no autorizadas.",
      emailVerificationWrongEmail: "¿No eres tú?",
      emailVerificationSignupDifferent: "Registrarse con otro correo",
      emailConfirmationVerifying: "Verificando tu correo",
      emailConfirmationVerifyingDescription: "Estamos validando tu enlace de verificación.",
      emailConfirmationConfirmed: "¡Correo verificado!",
      emailConfirmationConfirmedDescription: "Tu dirección de correo ha sido verificada con éxito.",
      emailConfirmationFailed: "Error de Verificación",
      emailConfirmationFailedDescription: "No pudimos validar tu enlace de verificación.",
      emailConfirmationSuccess: "Tu correo ha sido verificado correctamente.",
      emailConfirmationError: "Ocurrió un error al confirmar tu correo.",
      emailConfirmationLinkExpired: "El enlace ha expirado. Por favor, solicita uno nuevo.",
      emailConfirmationInvalidLink: "Enlace inválido o ya utilizado.",
      emailConfirmationAlreadyVerified: "Este correo ya está verificado.",
      emailConfirmationRedirecting: "Redirigiéndote al panel principal...",
      emailConfirmationContinueToApp: "Ir a la Aplicación",
      emailConfirmationSignupAgain: "Registrarse de nuevo",
      emailConfirmationTryLogin: "Iniciar Sesión",
      emailConfirmationTroubleshooting: "Si el enlace no funciona, asegúrate de hacer clic directamente desde el email.",
      forgotPasswordTitle: "Recuperar contraseña",
      forgotPasswordDescription: "Introduce tu correo electrónico y te enviaremos las instrucciones.",
      forgotPasswordEmailLabel: "Correo electrónico",
      forgotPasswordEmailPlaceholder: "tu@email.com",
      forgotPasswordSubmitButton: "Enviar enlace",
      forgotPasswordBackToLogin: "Volver al inicio de sesión",
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
          security: "Seguridad",
          tasks: "Tareas Programadas",
          health: "Salud de la Nube",
          cloudExplorer: "Explorador Multi-nube",
          shared: "Compartidos"
        },
        sidebar: {
          storage: "Almacenamiento",
          storageUsed: "Utilizado: {{used}} de {{total}}"
        },
        dashboard: {
          noAccountConnected: "No hay cuentas conectadas",
          integrations: "Integraciones",
          toStartWorking: "para empezar a trabajar",
          totalFiles: "Archivos Totales",
          filesManaged: "Archivos Gestionados",
          activeOperations: "Operaciones Activas",
          inProgress: "En Progreso",
          totalOperations: "Operaciones Totales",
          operationsPerformed: "Operaciones Realizadas",
          completedOperations: "Operaciones Completadas",
          successfully: "Exitosamente",
          recentFiles: "Archivos Recientes",
          noRecentFiles: "No hay archivos recientes",
          addedOn: "Agregado el",
          connectInstruction: "Conecta una cuenta para empezar a gestionar tus archivos."
        },
        user: {
          profile: "Perfil",
          settings: "Configuración"
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
          loggingOut: "Cerrando sesión...",
          resetPassword: {
            title: "Elige una nueva contraseña",
            description: "Casi listo. Introduce tu nueva contraseña y estarás preparado.",
            passwordLabel: "Nueva contraseña",
            confirmPasswordLabel: "Confirmar nueva contraseña",
            submitButton: "Restablecer contraseña",
            successTitle: "Contraseña actualizada",
            successDesc: "Tu contraseña ha sido restablecida con éxito.",
            successLongDesc: "Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con tu nueva clave.",
            backToLogin: "Volver al inicio de sesión",
            req: {
              lowercase: "una minúscula",
              special: "un carácter especial",
              uppercase: "una mayúscula",
              minimum: "mínimo 8 caracteres",
              number: "un número"
            }
          }
        },
        signupSuccess: {
          title: "¡Registro Exitoso!",
          subtitle: "Tu cuenta ha sido creada correctamente.",
          checkEmailTitle: "Verifica tu bandeja de entrada",
          checkEmailDescription: "Hemos enviado un enlace de confirmación a tu correo electrónico.",
          nextStepsTitle: "Próximos pasos:",
          step1: "Abre el email de confirmación.",
          step2: "Haz clic en el enlace para verificar tu cuenta.",
          step3: "Inicia sesión y comienza a usar TERA.",
          continueToLogin: "Continuar al Inicio de Sesión",
          backToHome: "Volver al Inicio",
          noEmail: "¿No recibiste el correo?",
          tryAgain: "Intentar de nuevo"
        },
        emailConfirmation: {
          title: "¡Cuenta Verificada!",
          description: "Gracias por verificar tu correo electrónico. Tu cuenta ya está activa.",
          backToLogin: "Ir al Login",
          tryLogin: "Intentar Iniciar Sesión",
          troubleshooting: "Si el enlace no funciona, asegúrate de hacer clic directamente desde el correo."
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
        },
        status: {
          loading: "Cargando..."
        },
        actions: {
          searchPlaceholder: "Buscar archivos o carpetas..."
        }
      },
      dashboard: {
        noAccountConnected: "No hay cuentas conectadas",
        integrations: "Integraciones",
        toStartWorking: "para empezar a trabajar",
        totalFiles: "Archivos Totales",
        filesManaged: "Archivos Gestionados",
        activeOperations: "Operaciones Activas",
        inProgress: "En Progreso",
        totalOperations: "Operaciones Totales",
        operationsPerformed: "Operaciones Realizadas",
        completedOperations: "Operaciones Completadas",
        successfully: "Exitosamente",
        recentFiles: "Archivos Recientes",
        noRecentFiles: "No hay archivos recientes",
        addedOn: "Agregado el",
        connectInstruction: "Conecta una cuenta para empezar a gestionar tus archivos."
      },
      user: {
        profile: "Perfil",
        settings: "Configuración"
      },
      auth: {
        login: {
          title: "¡Bienvenido de nuevo!",
          subtitle: "Ingresa con tus datos",
          welcomeMessages: ["¡Bienvenido de nuevo!", "¡Hola de nuevo!", "Qué bueno verte"],
          emailLabel: "Correo electrónico",
          emailPlaceholder: "tu@email.com",
          passwordLabel: "Contraseña",
          passwordPlaceholder: "Tu contraseña",
          signInButton: "Iniciar Sesión",
          noAccount: "¿No tienes cuenta? Regístrate",
          forgotPassword: "¿Olvidaste tu contraseña?",
          description: "Ingresa tu email y contraseña para acceder a tu cuenta."
        },
        signup: {
          title: "Crea tu cuenta",
          subtitle: "Regístrate para empezar a gestionar tus archivos.",
          nameLabel: "Nombre completo",
          namePlaceholder: "Tu nombre",
          emailLabel: "Correo electrónico",
          emailPlaceholder: "tu@email.com",
          passwordLabel: "Contraseña",
          passwordPlaceholder: "Crea una contraseña",
          confirmPasswordLabel: "Confirmar contraseña",
          confirmPasswordPlaceholder: "Repite tu contraseña",
          createAccountButton: "Crear Cuenta",
          hasAccount: "¿Ya tienes cuenta?",
          signIn: "Inicia sesión",
          acceptTerms: {
            part1: "Acepto los",
            termsLink: "Términos de Servicio",
            and: "y la",
            privacyLink: "Política de Privacidad"
          }
        },
        logout: "Cerrar Sesión",
        showcase: {
          title: "Gestiona sin esfuerzo tu equipo y operaciones",
          description: "Inicia sesión para acceder a tu panel CRM y gestionar tus archivos de manera eficiente."
        },
        validation: {
          invalidEmail: "Correo electrónico inválido"
        }
      },
      landing: {
        hero: {
          title: "Mueve y protege tus archivos con",
          subtitle: "Inteligencia Real",
          description: "TERA es el puente entre tus nubes. Transfiere archivos entre plataformas, programa copias de seguridad automáticas y conecta tus herramientas favoritas en segundos.",
          ctaButton: "Empieza gratis hoy",
          demoButton: "Ver demostración",
          integrationsLabel: "Mejores Integraciones",
          syncBadge: "Auto-Sincronización",
          transferLabel: "Transferencia",
          backupLabel: "Backup",
          completed: "Completado",
          scanning: "Escaneando",
          freedLabel: "Liberado",
          duplicatesLabel: "Duplicados",
          securityBadge: "Seguridad Activa",
          encryptionLabel: "Cifrado de 256 bits"
        },
        features: {
          title: "Productos"
        },
        stats: {
          filesMoved: "Archivos Movidos",
          activeUsers: "Usuarios Activos",
          guaranteedUptime: "Uptime Garantizado",
          bankingSecurity: "Seguridad Bancaria"
        },
        benefits: {
          badge: "Productos",
          title: "Todo tu contenido, conectado",
          description: "Simplificamos lo complejo. Automatizamos lo tedioso. Protegemos lo que importa.",
          learnMore: "Saber más",
          feature1: {
            title: "Transferencias Multi-nube",
            description: "Mueve gigabytes entre Dropbox, Drive y OneDrive con un solo clic. Sin descargar nada a tu equipo."
          },
          feature2: {
            title: "Copias de Seguridad Inteligentes",
            description: "Programa respaldos automáticos entre nubes para que tus archivos más importantes siempre tengan un espejo."
          },
          feature3: {
            title: "+50 Integraciones Nativas",
            description: "Conecta Slack, Teams, Notion y todas tus herramientas de trabajo para centralizar tu ecosistema digital."
          }
        },
        ai: {
          title: "Tú define las reglas,",
          subtitle: "TERA las ejecuta por ti.",
          description: "Configura flujos de trabajo potentes en segundos. TERA monitorea tus archivos 24/7 and realiza las tareas repetitivas para que tú no tengas que hacerlo.",
          panelTitle: "Panel de Automatización",
          panelStatus: "Sistema Inteligente Activo",
          aiMessage: "\"He detectado 150 archivos nuevos en tu Dropbox. ¿Deseas que inicie la migración automática a tu carpeta de Proyectos 2024 en Google Drive?\"",
          userResponse: "\"Sí, por favor. Y elimina los duplicados de más de 6 meses.\"",
          progressLabel: "Migración en curso",
          suggestions: {
            suggestion1: "Mueve mis archivos de Dropbox a Google Drive",
            suggestion2: "Crea una copia de seguridad de mis fotos en OneDrive",
            suggestion3: "¿Qué nubes tengo integradas actualmente?",
            suggestion4: "Transfiere la carpeta 'Proyectos' a mi cuenta de Box",
            suggestion5: "Sincronize minha pasta do Notion com meu Drive"
          }
        },
        security: {
          badge: "Seguridad sin Compromisos",
          title: "Dormir tranquilo es parte del plan",
          description: "No escatimamos en seguridad. TERA utiliza los mismos protocolos que las instituciones financieras globales para garantizar que tus datos nunca caigan en manos equivocadas.",
          whitepaperButton: "Lee nuestro Whitepaper de Seguridad",
          aesTitle: "AES-256",
          aesDesc: "Encriptación de nivel militar para cada bit de información.",
          zeroKnowledgeTitle: "Zero Knowledge",
          zeroKnowledgeDesc: "Tus claves son solo tuyas. Ni siquiera nosotros podemos ver tus archivos.",
          auditTitle: "Auditoría Real",
          auditDesc: "Registros detallados de cada movimiento para tu control total.",
          syncTitle: "Sincronización",
          syncDesc: "Tus nubes siempre en armonía, protegidas por nuestro firewall inteligente."
        },
        cta: {
          title: "El futuro de tus archivos comienza hoy.",
          description: "Únete a más de 85,000 profesionales que ya han optimizado su ecosistema digital con TERA. Sin tarjetas, sin complicaciones.",
          createAccount: "Crear mi cuenta gratis",
          talkToSales: "Hablar con ventas"
        },
        footer: {
          description: "Elevando la gestión de archivos a una nueva dimensión de inteligencia y seguridad.",
          platform: "Plataforma",
          legal: "Legal",
          privacy: "Privacidad",
          terms: "Términos",
          cookies: "Cookies",
          compliance: "Cumplimiento",
          rights: "© {{year}} TERA Cloud Technologies Inc.",
          status: "Sistemas Operativos",
          back: "Volver"
        }
      }
    }
  },
  en: {
    translation: {
      welcomeMessages: ["Welcome back!", "Hello again!", "Nice to see you"],
      dashboard: {
        noAccountConnected: "No accounts connected",
        integrations: "Integrations",
        toStartWorking: "to start working",
        totalFiles: "Total Files",
        filesManaged: "Files Managed",
        activeOperations: "Active Operations",
        inProgress: "In Progress",
        totalOperations: "Total Operations",
        operationsPerformed: "Operations Performed",
        completedOperations: "Completed Operations",
        successfully: "Successfully",
        recentFiles: "Recent Files",
        noRecentFiles: "No recent files",
        addedOn: "Added on",
        connectInstruction: "Connect an account to start managing your files."
      },
      user: {
        profile: "Profile",
        settings: "Settings"
      },
      auth: {
        login: {
          title: "Welcome back!",
          subtitle: "Log in with your credentials",
          welcomeMessages: ["Welcome back!", "Hello again!", "Nice to see you"],
          emailLabel: "Email address",
          emailPlaceholder: "your@email.com",
          passwordLabel: "Password",
          passwordPlaceholder: "Your password",
          signInButton: "Sign In",
          noAccount: "Don't have an account? Sign up",
          forgotPassword: "Forgot your password?",
          description: "Enter your email and password to access your account."
        },
        signup: {
          title: "Create your account",
          subtitle: "Sign up to start managing your files.",
          nameLabel: "Full name",
          namePlaceholder: "Your name",
          emailLabel: "Email address",
          emailPlaceholder: "your@email.com",
          passwordLabel: "Password",
          passwordPlaceholder: "Create a password",
          confirmPasswordLabel: "Confirm password",
          confirmPasswordPlaceholder: "Repeat your password",
          createAccountButton: "Create Account",
          hasAccount: "Already have an account?",
          signIn: "Log in",
          acceptTerms: {
            part1: "I accept the",
            termsLink: "Terms of Service",
            and: "and the",
            privacyLink: "Privacy Policy"
          }
        },
        logout: "Log Out",
        showcase: {
          title: "Effortlessly manage your team and operations",
          description: "Log in to access your CRM dashboard and manage your files efficiently."
        }
      }
    }
  },
  pt: {
    translation: {
      welcomeMessages: ["Bem-vindo de volta!", "Olá novamente!", "Bom te ver"],
      dashboard: {
        noAccountConnected: "Nenhuma conta conectada",
        integrations: "Integrações",
        toStartWorking: "para começar a trabalhar",
        totalFiles: "Total de Arquivos",
        filesManaged: "Arquivos Gerenciados",
        activeOperations: "Operações Ativas",
        inProgress: "Em Progreso",
        totalOperations: "Total de Operações",
        operationsPerformed: "Operações Realizadas",
        completedOperations: "Operações Concluídas",
        successfully: "Com Sucesso",
        recentFiles: "Arquivos Recentes",
        noRecentFiles: "Nenhum arquivo recente",
        addedOn: "Adicionado em",
        connectInstruction: "Conecte uma conta para começar a gerenciar seus arquivos."
      },
      user: {
        profile: "Perfil",
        settings: "Configurações"
      },
      auth: {
        login: {
          title: "Bem-vindo de volta!",
          subtitle: "Faça login com suas credenciais",
          welcomeMessages: ["Bem-vindo de volta!", "Olá novamente!", "Bom te ver"],
          emailLabel: "Endereço de e-mail",
          emailPlaceholder: "seu@email.com",
          passwordLabel: "Senha",
          passwordPlaceholder: "Sua senha",
          signInButton: "Entrar",
          noAccount: "Não tem uma conta? Cadastre-se",
          forgotPassword: "Esqueceu sua senha?",
          description: "Insira seu e-mail e senha para acessar sua conta."
        },
        signup: {
          title: "Crie sua conta",
          subtitle: "Cadastre-se para começar a gerenciar seus arquivos.",
          nameLabel: "Nome completo",
          namePlaceholder: "Seu nome",
          emailLabel: "Endereço de e-mail",
          emailPlaceholder: "seu@email.com",
          passwordLabel: "Senha",
          passwordPlaceholder: "Crie uma senha",
          confirmPasswordLabel: "Confirmar senha",
          confirmPasswordPlaceholder: "Repite sua senha",
          createAccountButton: "Criar Conta",
          hasAccount: "Já tem uma conta?",
          signIn: "Faça login",
          acceptTerms: {
            part1: "Eu aceito os",
            termsLink: "Termos de Serviço",
            and: "e a",
            privacyLink: "Política de Privacidade"
          }
        },
        logout: "Sair",
        showcase: {
          title: "Gerencie sua equipe e operações sem esforço",
          description: "Faça login para acessar seu painel CRM e gerenciar seus arquivos com eficiência."
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(customDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['locationLanguageDetector', 'querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
