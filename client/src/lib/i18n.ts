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
          recentFiles: "Archivos Recientes"
        },
        actions: {
          searchPlaceholder: "Buscar archivos o carpetas..."
        }
      },
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
      },
      dashboard: {
        noAccountConnected: "Nenhuma conta conectada",
        integrations: "Integrações",
        toStartWorking: "para começar a trabalhar",
        totalFiles: "Total de Arquivos",
        filesManaged: "Arquivos Gerenciados",
        activeOperations: "Operações Ativas",
        inProgress: "Em Progresso",
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
          confirmPasswordPlaceholder: "Repita sua senha",
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
          showcase: {
            title: "Gestiona sin esfuerzo tu equipo y operaciones",
            description: "Inicia sesión para acceder a tu panel CRM y gestionar tus archivos de manera eficiente."
          },
          validation: {
            invalidEmail: "Correo electrónico inválido",
            passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
            nameRequired: "El nombre es obligatorio",
            acceptTermsRequired: "Debes aceptar los términos",
            passwordsDoNotMatch: "Las contraseñas no coinciden"
          }
        },
        privacy: {
          title: "Política de Privacidad",
          back: "Volver",
          lastUpdated: "Última actualización",
          section1: {
            title: "1. Introducción",
            content: "En TERA, nos tomamos muy en serio tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal."
          },
          section2: {
            title: "2. Información que Recopilamos",
            subsection1: {
              title: "Información de la Cuenta",
              item1: "Nombre y dirección de correo electrónico",
              item2: "Preferencias de configuración",
              item3: "Información de facturación"
            },
            subsection2: {
              title: "Información de Uso",
              item1: "Dirección IP y tipo de dispositivo",
              item2: "Logs de actividad del sistema",
              item3: "Estadísticas de transferencia",
              item4: "Metadatos de archivos (sin acceder al contenido)"
            },
            subsection3: {
              title: "Integraciones de Terceros",
              intro: "Al conectar servicios como Google Drive o Dropbox, recopilamos:",
              item1: "Tokens de acceso (encriptados)",
              item2: "Lista de archivos y carpetas",
              item3: "ID de usuario del servicio externo"
            }
          },
          section3: {
            title: "3. Cómo Utilizamos tu Información",
            intro: "Utilizamos los datos recopilados para:",
            item1: "Proporcionar y mantener el servicio",
            item2: "Procesar tus transferencias de archivos",
            item3: "Mejorar la seguridad de la plataforma",
            item4: "Enviar notificaciones importantes",
            item5: "Personalizar tu experiencia",
            item6: "Cumplir con obligaciones legales"
          },
          section4: {
            title: "4. Almacenamiento y Seguridad",
            subsection1: {
              title: "Seguridad de los Datos",
              intro: "Utilizamos protocolos de seguridad de nivel industrial:",
              item1: "Encriptación AES-256 para datos en reposo",
              item2: "Protocolos TLS para datos en tránsito"
            },
            subsection2: {
              title: "Retención de Datos",
              intro: "Mantenemos tu información solo el tiempo necesario:",
              item1: "Datos de cuenta: Mientras la cuenta esté activa",
              item2: "Logs: Hasta 12 meses para propósitos de auditoría",
              item3: "Caché de archivos: Temporal hasta completar la operación"
            },
            subsection3: {
              title: "Localización de Servidores",
              content: "Nuestros servicios se alojan principalmente en infraestructuras seguras en la nube con redundancia global.",
              intro: "Garantizamos:",
              item1: "Alta disponibilidad",
              item2: "Copias de seguridad diarias",
              item3: "Aislamiento de datos por usuario",
              item4: "Cumplimiento de normativas regionales"
            }
          },
          section5: {
            title: "5. Tus Derechos",
            subsection1: {
              title: "Control sobre tus datos",
              item1: "Derecho de acceso",
              item2: "Derecho de rectificación",
              item3: "Derecho de eliminación (olvido)"
            },
            subsection2: {
              title: "Otras facultades",
              item1: "Portabilidad de datos",
              item2: "Restricción del procesamiento",
              item3: "Oposición al marketing directo",
              item4: "Retirada de consentimiento",
              item5: "Presentación de reclamaciones"
            },
            subsection3: {
              title: "Cómo ejercer tus derechos",
              content: "Puedes gestionar la mayoría de estas opciones desde tu panel de configuración o contactando con nuestro soporte."
            }
          },
          section6: {
            title: "6. Compartir Información",
            intro: "Nunca vendemos tus datos personales. Solo compartimos información con:",
            subsection1: {
              title: "Terceros autorizados",
              item1: "Procesadores de pago (Stripe)",
              item2: "Servicios de infraestructura (AWS/Google Cloud)",
              item3: "Herramientas de análisis anónimo",
              item4: "Autoridades legales si es requerido"
            },
            subsection2: {
              title: "Políticas de terceros",
              content: "Los servicios integrados (Drive, Dropbox, etc.) se rigen por sus propias políticas de privacidad."
            }
          },
          section7: {
            title: "7. Cookies y Tecnologías Similares",
            intro: "Utilizamos cookies para:",
            item1: "Mantener tu sesión activa",
            item2: "Recordar tus preferencias",
            item3: "Analizar el rendimiento",
            item4: "Prevenir fraudes",
            item5: "Seguridad de la navegación",
            item6: "Mejorar la interfaz"
          },
          section8: {
            title: "8. Privacidad de Menores",
            intro: "Nuestro servicio no está dirigido a menores de 13 años. Si detectamos datos de menores sin consentimiento parental:",
            item1: "Procederemos a su eliminación inmediata",
            item2: "Notificaremos a los tutores si es posible",
            item3: "Bloquearemos el acceso a la cuenta"
          },
          section9: {
            title: "9. Cambios en la Política",
            content: "Podemos actualizar esta política periódicamente. Te notificaremos cualquier cambio sustancial vía email."
          },
          section10: {
            title: "10. Contacto",
            content: "Si tienes dudas sobre tu privacidad, escríbenos a support@tera.cloud"
          },
          section11: {
            title: "11. Jurisdicción",
            content: "Esta política se rige por las leyes internacionales de protección de datos."
          },
          section12: {
            title: "12. Soporte",
            content: "Nuestro equipo de privacidad está disponible para resolver tus inquietudes.",
            email: "privacy@tera.cloud"
          },
          section13: {
            title: "13. Resumen de Seguridad",
            intro: "En resumen, TERA garantiza:",
            item1: "Transparencia total",
            item2: "Seguridad técnica avanzada",
            item3: "Control total del usuario",
            item4: "Cumplimiento normativo"
          }
        },
        terms: {
          title: "Términos de Servicio",
          back: "Volver",
          lastUpdated: "Última actualización",
          section1: {
            title: "1. Aceptación de los Términos",
            content: "Al acceder a TERA, aceptas cumplir con estos términos de servicio. Si no estás de acuerdo, por favor no utilices la plataforma."
          },
          section2: {
            title: "2. Descripción del Servicio",
            content: "TERA es una plataforma de gestión y transferencia de archivos entre servicios de almacenamiento en la nube."
          },
          section3: {
            title: "3. Responsabilidades del Usuario",
            intro: "Como usuario de TERA, te comprometes a:",
            item1: "Proporcionar información veraz",
            item2: "Mantener la seguridad de tu cuenta",
            item3: "No usar el servicio para fines ilegales",
            item4: "Respetar los derechos de autor de los archivos"
          },
          section4: {
            title: "4. Propiedad Intelectual",
            intro: "Nuestra política sobre propiedad intelectual incluye:",
            item1: "TERA es dueño de la plataforma y su código",
            item2: "Tú mantienes la propiedad total de tus archivos",
            item3: "No reclamamos derechos sobre tu contenido",
            item4: "Respetamos las marcas registradas de terceros",
            item5: "Protección de logotipos y diseño",
            item6: "Licencias de software de código abierto"
          },
          section5: {
            title: "5. Limitación de Responsabilidad",
            intro: "TERA no se hace responsable por:",
            item1: "Pérdida de datos por fallos de terceros",
            item2: "Interrupciones del servicio fuera de nuestro control",
            item3: "Uso indebido de la cuenta por parte del usuario"
          },
          section6: {
            title: "6. Suspensión y Terminación",
            intro: "Podemos suspender tu cuenta si:",
            item1: "Infriges estos términos",
            item2: "Realizas actividades sospechosas",
            item3: "Lo requiere una autoridad legal",
            item4: "Hay falta de pago en planes premium"
          },
          section7: {
            title: "7. Tarifas y Pagos",
            content: "Los planes premium se facturan mensual o anualmente. No hay reembolsos parciales a menos que la ley lo exija."
          },
          section8: {
            title: "8. Modificaciones del Servicio",
            content: "Nos reservamos el derecho de modificar o discontinuar cualquier parte del servicio con previo aviso."
          },
          section9: {
            title: "9. Uso de la API",
            intro: "El uso de nuestras integraciones implica:",
            item1: "Cumplimiento de las cuotas de los proveedores",
            item2: "No realizar ingeniería inversa",
            item3: "Uso responsable de los recursos",
            item4: "Respeto a los tokens de autenticación",
            item5: "Seguridad en las llamadas a la API"
          },
          section10: {
            title: "10. Privacidad",
            content: "El uso del servicio también se rige por nuestra Política de Privacidad."
          },
          section11: {
            title: "11. Fuerza Mayor",
            content: "No seremos responsables por fallos debidos a causas fuera de nuestro control razonable."
          },
          section12: {
            title: "12. Divisibilidad",
            content: "Si alguna disposición de estos términos es declarada inválida, las demás seguirán vigentes."
          }
        }
      }
    }
  },
  en: {
    translation: {
      welcomeMessages: [
        "You’re back! Nice to see you 😄",
        "Hey! Welcome back",
        "Look who’s here!",
        "Back again? Let’s go 🚀",
        "Good to have you back!",
        "Hey there! Ready to continue?",
        "Welcome back! We missed you",
        "And… you’re in!",
        "Nice, you’re back 🙌",
        "Hey! Let’s pick up where you left off",
        "Back at it! 💪",
        "Glad to see you again"
      ],
      emailVerificationTitle: "Verify your email",
      emailVerificationDescription: "Click the button below to confirm your email address.",
      emailVerificationInfo: "You're one step away from completing your registration. Confirm your email to activate your account.",
      emailVerificationConfirmButton: "Confirm my email",
      emailVerificationSecurityNote: "This additional step protects your account against unauthorized automatic verifications.",
      emailVerificationWrongEmail: "Not you?",
      emailVerificationSignupDifferent: "Sign up with a different email",
      emailConfirmationVerifying: "Verifying your email",
      emailConfirmationVerifyingDescription: "We are validating your verification link.",
      emailConfirmationConfirmed: "Email verified!",
      emailConfirmationConfirmedDescription: "Your email address has been successfully verified.",
      emailConfirmationFailed: "Verification Error",
      emailConfirmationFailedDescription: "We couldn't validate your verification link.",
      emailConfirmationSuccess: "Your email has been successfully verified.",
      emailConfirmationError: "An error occurred while confirming your email.",
      emailConfirmationLinkExpired: "The link has expired. Please request a new one.",
      emailConfirmationInvalidLink: "Invalid or already used link.",
      emailConfirmationAlreadyVerified: "This email is already verified.",
      emailConfirmationRedirecting: "Redirecting you to the main dashboard...",
      emailConfirmationContinueToApp: "Go to App",
      emailConfirmationSignupAgain: "Sign up again",
      emailConfirmationTryLogin: "Log In",
      emailConfirmationTroubleshooting: "If the link doesn't work, make sure to click it directly from the email.",
      forgotPasswordTitle: "Recover Password",
      forgotPasswordDescription: "Enter your email address and we'll send you instructions.",
      forgotPasswordEmailLabel: "Email address",
      forgotPasswordEmailPlaceholder: "you@email.com",
      forgotPasswordSubmitButton: "Send link",
      forgotPasswordBackToLogin: "Back to login",
      common: {
        app: {
          title: "TERA",
          description: "Google Drive File Management"
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
          security: "Security",
          tasks: "Scheduled Tasks",
          health: "Cloud Health",
          cloudExplorer: "Multi-cloud Explorer",
          shared: "Shared"
        },
        sidebar: {
          storage: "Storage",
          storageUsed: "Used: {{used}} of {{total}}"
        },
        language: {
          select: "Select language",
          spanish: "Español",
          english: "English",
          portuguese: "Português",
          switchLanguage: "Switch language"
        },
        auth: {
          login: "Log In",
          logout: "Log Out",
          loggingOut: "Logging out...",
          resetPassword: {
            title: "Choose a new password",
            description: "Almost ready. Enter your new password and you'll be set.",
            passwordLabel: "New password",
            confirmPasswordLabel: "Confirm new password",
            submitButton: "Reset password",
            successTitle: "Password updated",
            successDesc: "Your password has been successfully reset.",
            successLongDesc: "Your password has been updated. You can now log in with your new key.",
            backToLogin: "Back to login",
            req: {
              lowercase: "one lowercase",
              special: "one special character",
              uppercase: "one uppercase",
              minimum: "minimum 8 characters",
              number: "one number"
            }
          }
        },
        signupSuccess: {
          title: "Signup Successful!",
          subtitle: "Your account has been created successfully.",
          checkEmailTitle: "Check your inbox",
          checkEmailDescription: "We've sent a confirmation link to your email address.",
          nextStepsTitle: "Next steps:",
          step1: "Open the confirmation email.",
          step2: "Click the link to verify your account.",
          step3: "Log in and start using TERA.",
          continueToLogin: "Continue to Login",
          backToHome: "Back to Home",
          noEmail: "Didn't receive the email?",
          tryAgain: "Try again"
        },
        emailConfirmation: {
          verifying: "Verifying...",
          verifyingDescription: "We are validating your verification link.",
          confirmed: "Email Confirmed!",
          confirmedDescription: "Your email address has been successfully verified.",
          failed: "Verification Error",
          failedDescription: "We couldn't validate your verification link.",
          success: "Your email has been correctly verified.",
          error: "An error occurred while confirming your email.",
          linkExpired: "The link has expired. Please request a new one.",
          invalidLink: "Invalid link or already used.",
          alreadyVerified: "This email is already verified.",
          redirecting: "Redirecting to the main panel...",
          continueToApp: "Go to Application",
          signupAgain: "Sign up again",
          tryLogin: "Log In",
          troubleshooting: "If the link doesn't work, make sure to click it directly from the email."
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
        },
        status: {
          loading: "Loading..."
        },
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
          recentFiles: "Recent Files"
        },
        actions: {
          searchPlaceholder: "Search files or folders..."
        }
      },
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
      },
      dashboard: {
        noAccountConnected: "Nenhuma conta conectada",
        integrations: "Integrações",
        toStartWorking: "para começar a trabalhar",
        totalFiles: "Total de Arquivos",
        filesManaged: "Arquivos Gerenciados",
        activeOperations: "Operações Ativas",
        inProgress: "Em Progresso",
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
          confirmPasswordPlaceholder: "Repita sua senha",
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
        }
      },
      landing: {
        hero: {
          title: "Move and protect your files with",
          subtitle: "Real Intelligence",
          description: "TERA is the bridge between your clouds. Transfer files between platforms, schedule automatic backups, and connect your favorite tools in seconds.",
          ctaButton: "Start for free today",
          demoButton: "Watch demo",
          integrationsLabel: "Best Integrations",
          syncBadge: "Auto-Sync",
          transferLabel: "Transfer",
          backupLabel: "Backup",
          completed: "Completed",
          scanning: "Scanning",
          freedLabel: "Freed",
          duplicatesLabel: "Duplicates",
          securityBadge: "Active Security",
          encryptionLabel: "256-bit Encryption"
        },
        features: {
          title: "Products"
        },
        stats: {
          filesMoved: "Files Moved",
          activeUsers: "Active Users",
          guaranteedUptime: "Guaranteed Uptime",
          bankingSecurity: "Banking Security"
        },
        benefits: {
          badge: "Products",
          title: "All your content, connected",
          description: "We simplify the complex. We automate the tedious. We protect what matters.",
          learnMore: "Learn more",
          feature1: {
            title: "Multi-cloud Transfers",
            description: "Move gigabytes between Dropbox, Drive, and OneDrive with a single click. No downloads to your machine."
          },
          feature2: {
            title: "Smart Backups",
            description: "Schedule automatic backups between clouds so your most important files always have a mirror."
          },
          feature3: {
            title: "+50 Native Integrations",
            description: "Connect Slack, Teams, Notion, and all your work tools to centralize your digital ecosystem."
          }
        },
        ai: {
          title: "You define the rules,",
          subtitle: "TERA executes them for you.",
          description: "Set up powerful workflows in seconds. TERA monitors your files 24/7 and performs repetitive tasks so you don't have to.",
          panelTitle: "Automation Panel",
          panelStatus: "Smart System Active",
          aiMessage: "\"I've detected 150 new files in your Dropbox. Would you like me to start the automatic migration to your Projects 2024 folder in Google Drive?\"",
          userResponse: "\"Yes, please. And delete duplicates older than 6 months.\"",
          progressLabel: "Migration in progress",
          suggestions: {
            suggestion1: "Move my files from Dropbox to Google Drive",
            suggestion2: "Back up my photos to OneDrive",
            suggestion3: "What clouds do I have currently integrated?",
            suggestion4: "Transfer the 'Projects' folder to my Box account",
            suggestion5: "Synchronize my Notion folder with my Drive"
          }
        },
        security: {
          badge: "No Compromise Security",
          title: "Sleeping soundly is part of the plan",
          description: "We don't skimp on security. TERA uses the same protocols as global financial institutions to ensure your data never falls into the wrong hands.",
          whitepaperButton: "Read our Security Whitepaper",
          aesTitle: "AES-256",
          aesDesc: "Military-grade encryption for every bit of information.",
          zeroKnowledgeTitle: "Zero Knowledge",
          zeroKnowledgeDesc: "Your keys are yours alone. Not even we can see your files.",
          auditTitle: "Real Audit",
          auditDesc: "Detailed logs of every move for your total control.",
          syncTitle: "Synchronization",
          syncDesc: "Your clouds always in harmony, protected by our smart firewall."
        },
        cta: {
          title: "The future of your files begins today.",
          description: "Join more than 85,000 professionals who have already optimized their digital ecosystem with TERA. No cards, no complications.",
          createAccount: "Create my free account",
          talkToSales: "Talk to sales"
        },
        footer: {
          description: "Elevating file management to a new dimension of intelligence and security.",
          platform: "Platform",
          legal: "Legal",
          privacy: "Privacy",
          terms: "Terms",
          cookies: "Cookies",
          compliance: "Compliance",
          rights: "© {{year}} TERA Cloud Technologies Inc.",
          status: "Systems Operational",
          back: "Back"
        },
        auth: {
          login: {
            title: "Welcome back!",
            subtitle: "Enter your details",
            welcomeMessages: ["Welcome back!", "Hello again!", "Good to see you"],
            emailLabel: "Email address",
            emailPlaceholder: "you@email.com",
            passwordLabel: "Password",
            passwordPlaceholder: "Your password",
            signInButton: "Log In",
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
            emailPlaceholder: "you@email.com",
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
          showcase: {
            title: "Effortlessly manage your team and operations",
            description: "Log in to access your CRM dashboard and manage your files efficiently."
          },
          validation: {
            invalidEmail: "Invalid email address",
            passwordTooShort: "Password must be at least 6 characters",
            nameRequired: "Name is required",
            acceptTermsRequired: "You must accept the terms",
            passwordsDoNotMatch: "Passwords do not match"
          }
        },
        privacy: {
          title: "Privacy Policy",
          back: "Back",
          lastUpdated: "Last updated",
          section1: {
            title: "1. Introduction",
            content: "At TERA, we take your privacy very seriously. This policy explains how we collect, use, and protect your personal information."
          },
          section2: {
            title: "2. Information We Collect",
            subsection1: {
              title: "Account Information",
              item1: "Name and email address",
              item2: "Configuration preferences",
              item3: "Billing information"
            },
            subsection2: {
              title: "Usage Information",
              item1: "IP address and device type",
              item2: "System activity logs",
              item3: "Transfer statistics",
              item4: "File metadata (without accessing content)"
            },
            subsection3: {
              title: "Third-party Integrations",
              intro: "By connecting services like Google Drive or Dropbox, we collect:",
              item1: "Access tokens (encrypted)",
              item2: "List of files and folders",
              item3: "External service user ID"
            }
          },
          section3: {
            title: "3. How We Use Your Information",
            intro: "We use the collected data to:",
            item1: "Provide and maintain the service",
            item2: "Process your file transfers",
            item3: "Improve platform security",
            item4: "Send important notifications",
            item5: "Personalize your experience",
            item6: "Comply with legal obligations"
          },
          section4: {
            title: "4. Storage and Security",
            subsection1: {
              title: "Data Security",
              intro: "We use industry-standard security protocols:",
              item1: "AES-256 encryption for data at rest",
              item2: "TLS protocols for data in transit"
            },
            subsection2: {
              title: "Data Retention",
              intro: "We keep your information only as long as necessary:",
              item1: "Account data: While account is active",
              item2: "Logs: Up to 12 months for audit purposes",
              item3: "File cache: Temporary until operation complete"
            },
            subsection3: {
              title: "Server Location",
              content: "Our services are primarily hosted on secure cloud infrastructures with global redundancy.",
              intro: "We guarantee:",
              item1: "High availability",
              item2: "Daily backups",
              item3: "User data isolation",
              item4: "Regional compliance"
            }
          },
          section5: {
            title: "5. Your Rights",
            subsection1: {
              title: "Control over your data",
              item1: "Right of access",
              item2: "Right of rectification",
              item3: "Right of erasure (forgetting)"
            },
            subsection2: {
              title: "Other powers",
              item1: "Data portability",
              item2: "Restriction of processing",
              item3: "Objection to direct marketing",
              item4: "Withdrawal of consent",
              item5: "Filing complaints"
            },
            subsection3: {
              title: "How to exercise your rights",
              content: "You can manage most of these options from your settings panel or by contacting our support."
            }
          },
          section6: {
            title: "6. Sharing Information",
            intro: "We never sell your personal data. We only share information with:",
            subsection1: {
              title: "Authorized third parties",
              item1: "Payment processors (Stripe)",
              item2: "Infrastructure services (AWS/Google Cloud)",
              item3: "Anonymous analysis tools",
              item4: "Legal authorities if required"
            },
            subsection2: {
              title: "Third-party policies",
              content: "Integrated services (Drive, Dropbox, etc.) are governed by their own privacy policies."
            }
          },
          section7: {
            title: "7. Cookies and Similar Technologies",
            intro: "We use cookies to:",
            item1: "Keep your session active",
            item2: "Remember your preferences",
            item3: "Analyze performance",
            item4: "Prevent fraud",
            item5: "Navigation security",
            item6: "Improve interface"
          },
          section8: {
            title: "8. Minor Privacy",
            intro: "Our service is not directed at minors under 13. If we detect data of minors without parental consent:",
            item1: "We will proceed to immediate removal",
            item2: "We will notify guardians if possible",
            item3: "We will block account access"
          },
          section9: {
            title: "9. Policy Changes",
            content: "We may update this policy periodically. We will notify you of any substantial changes via email."
          },
          section10: {
            title: "10. Contact",
            content: "If you have questions about your privacy, write to us at support@tera.cloud"
          },
          section11: {
            title: "11. Jurisdiction",
            content: "This policy is governed by international data protection laws."
          },
          section12: {
            title: "12. Support",
            content: "Our privacy team is available to resolve your concerns.",
            email: "privacy@tera.cloud"
          },
          section13: {
            title: "13. Security Summary",
            intro: "In summary, TERA guarantees:",
            item1: "Total transparency",
            item2: "Advanced technical security",
            item3: "Total user control",
            item4: "Regulatory compliance"
          }
        },
        terms: {
          title: "Terms of Service",
          back: "Back",
          lastUpdated: "Last updated",
          section1: {
            title: "1. Acceptance of Terms",
            content: "By accessing TERA, you agree to comply with these terms of service. If you do not agree, please do not use the platform."
          },
          section2: {
            title: "2. Service Description",
            content: "TERA is a platform for managing and transferring files between cloud storage services."
          },
          section3: {
            title: "3. User Responsibilities",
            intro: "As a TERA user, you agree to:",
            item1: "Provide truthful information",
            item2: "Maintain account security",
            item3: "Not use the service for illegal purposes",
            item4: "Respect file copyrights"
          },
          section4: {
            title: "4. Intellectual Property",
            intro: "Our intellectual property policy includes:",
            item1: "TERA owns the platform and its code",
            item2: "You maintain total ownership of your files",
            item3: "We do not claim rights over your content",
            item4: "We respect third-party trademarks",
            item5: "Logo and design protection",
            item6: "Open source software licenses"
          },
          section5: {
            title: "5. Limitation of Liability",
            intro: "TERA is not responsible for:",
            item1: "Data loss due to third-party failures",
            item2: "Service interruptions beyond our reasonable control",
            item3: "Misuse of account by the user"
          },
          section6: {
            title: "6. Suspension and Termination",
            intro: "We may suspend your account if:",
            item1: "You violate these terms",
            item2: "Suspicious activities are performed",
            item3: "Required by a legal authority",
            item4: "There is non-payment for premium plans"
          },
          section7: {
            title: "7. Fees and Payments",
            content: "Premium plans are billed monthly or annually. There are no partial refunds unless required by law."
          },
          section8: {
            title: "8. Service Modifications",
            content: "We reserve the right to modify or discontinue any part of the service with prior notice."
          },
          section9: {
            title: "9. API Usage",
            intro: "The use of our integrations implies:",
            item1: "Compliance with provider quotas",
            item2: "No reverse engineering",
            item3: "Responsible use of resources",
            item4: "Respect for authentication tokens",
            item5: "Security in API calls"
          },
          section10: {
            title: "10. Privacy",
            content: "Service usage is also governed by our Privacy Policy."
          },
          section11: {
            title: "11. Force Majeure",
            content: "We will not be responsible for failures due to causes beyond our reasonable control."
          },
          section12: {
            title: "12. Severability",
            content: "If any provision of these terms is declared invalid, the rest will remain in force."
          }
        }
      }
    }
  },
      pt: {
        translation: {
          welcomeMessages: [
            "Você voltou! Que bom te ver 😄",
            "Opa! Bem-vindo de volta",
            "Olha quem chegou!",
            "De volta! Bora continuar 🚀",
            "Que bom te ter por aqui de novo",
            "E aí! Pronto pra seguir?",
            "Sentimos sua falta 😉",
            "Chegou! Vamos nessa",
            "Bom te ver outra vez!",
            "Voltou com tudo 💪",
            "Opa! Tudo pronto",
            "Bora lá?"
          ],
          auth: {
            login: {
              title: "Bem-vindo de volta",
              subtitle: "Entre com seus dados",
              emailLabel: "Endereço de e-mail",
              emailPlaceholder: "seu@email.com",
              passwordLabel: "Senha",
              signInButton: "Entrar",
              forgotPassword: "Esqueceu sua senha?",
              noAccount: "Não tem uma conta?",
              signUpNow: "Cadastre-se agora",
              rememberMe: "Lembrar de mim",
              orContinueWith: "Ou continue com",
              description: "Insira seu e-mail e senha para acessar sua conta."
            },
            signup: {
              title: "Crie sua conta",
              subtitle: "Cadastre-se para começar a gerenciar seus arquivos.",
              nameLabel: "Nome completo",
              namePlaceholder: "Seu nome",
              confirmPasswordLabel: "Confirmar senha",
              createAccountButton: "Criar Conta",
              hasAccount: "Já tem uma conta?",
              signIn: "Fazer Login",
              acceptTerms: {
                part1: "Eu aceito os",
                termsLink: "Termos",
                and: "e a",
                privacyLink: "Privacidade"
              }
            },
            showcase: {
              title: "Gerencie sem esforço sua equipe e operações",
              description: "Faça login para acessar seu painel CRM e gerenciar seus arquivos de forma eficiente."
            },
            validation: {
              invalidEmail: "E-mail inválido",
              passwordTooShort: "A senha deve ter pelo menos 6 caracteres",
              nameRequired: "O nome é obrigatório",
              acceptTermsRequired: "Você deve aceitar os termos",
              passwordsDoNotMatch: "As senhas não coincidem"
            }
          },
          emailVerificationTitle: "Verifique seu e-mail",
      emailVerificationDescription: "Clique no botão abaixo para confirmar seu endereço de e-mail.",
      emailVerificationInfo: "Você está a um passo de concluir seu cadastro. Confirme seu e-mail para ativar sua conta.",
      emailVerificationConfirmButton: "Confirmar meu e-mail",
      emailVerificationSecurityNote: "Esta etapa adicional protege sua conta contra verificações automáticas não autorizadas.",
      emailVerificationWrongEmail: "Não é você?",
      emailVerificationSignupDifferent: "Cadastrar com outro e-mail",
      emailConfirmationVerifying: "Verificando seu e-mail",
      emailConfirmationVerifyingDescription: "Estamos validando seu link de verificação.",
      emailConfirmationConfirmed: "E-mail verificado!",
      emailConfirmationConfirmedDescription: "Seu endereço de e-mail foi verificado com sucesso.",
      emailConfirmationFailed: "Erro de Verificação",
      emailConfirmationFailedDescription: "Não pudemos validar seu link de verificação.",
      emailConfirmationSuccess: "Seu e-mail foi verificado com sucesso.",
      emailConfirmationError: "Ocorreu um erro ao confirmar seu e-mail.",
      emailConfirmationLinkExpired: "O link expirou. Por favor, solicite um novo.",
      emailConfirmationInvalidLink: "Link inválido ou já utilizado.",
      emailConfirmationAlreadyVerified: "Este e-mail já está verificado.",
      emailConfirmationRedirecting: "Redirecionando para o painel principal...",
      emailConfirmationContinueToApp: "Ir para a Aplicação",
      emailConfirmationSignupAgain: "Cadastrar novamente",
      emailConfirmationTryLogin: "Iniciar Sessão",
      emailConfirmationTroubleshooting: "Se o link não funcionar, certifique-se de clicar diretamente do e-mail.",
      forgotPasswordTitle: "Recuperar senha",
      forgotPasswordDescription: "Digite seu endereço de e-mail e enviaremos as instruções.",
      forgotPasswordEmailLabel: "Endereço de e-mail",
      forgotPasswordEmailPlaceholder: "voce@email.com",
      forgotPasswordSubmitButton: "Enviar link",
      forgotPasswordBackToLogin: "Voltar para o login",
      common: {
        app: {
          title: "TERA",
          description: "Gestão de arquivos do Google Drive"
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
          switchLanguage: "Mudar idioma"
        },
        auth: {
          login: "Iniciar Sessão",
          logout: "Sair",
          loggingOut: "Saindo...",
          resetPassword: {
            title: "Escolha uma nova senha",
            description: "Quase pronto. Digite sua nova senha e você estará preparado.",
            passwordLabel: "Nova senha",
            confirmPasswordLabel: "Confirmar nova senha",
            submitButton: "Redefinir senha",
            successTitle: "Senha atualizada",
            successDesc: "Sua senha foi redefinida com sucesso.",
            successLongDesc: "Sua senha foi atualizada. Agora você pode iniciar sessão com sua nova chave.",
            backToLogin: "Voltar para o login",
            req: {
              lowercase: "uma minúscula",
              special: "um caractere especial",
              uppercase: "uma maiúscula",
              minimum: "mínimo 8 caracteres",
              number: "um número"
            }
          }
        },
        signupSuccess: {
          title: "Cadastro com Sucesso!",
          subtitle: "Sua conta foi criada corretamente.",
          checkEmailTitle: "Verifique sua caixa de entrada",
          checkEmailDescription: "Enviamos un link de confirmação para seu e-mail.",
          nextStepsTitle: "Próximos passos:",
          step1: "Abra o e-mail de confirmação.",
          step2: "Clique no link para verificar sua conta.",
          step3: "Inicie sessão e comece a usar o TERA.",
          continueToLogin: "Continuar para o Login",
          backToHome: "Voltar para o Início",
          noEmail: "Não recebeu o e-mail?",
          tryAgain: "Tentar novamente"
        },
        emailConfirmation: {
          verifying: "Verificando...",
          verifyingDescription: "Estamos validando seu link de verificação.",
          confirmed: "E-mail Confirmado!",
          confirmedDescription: "Seu endereço de e-mail foi verificado com sucesso.",
          failed: "Erro de Verificação",
          failedDescription: "Não pudemos validar seu link de verificação.",
          success: "Seu e-mail foi verificado com sucesso.",
          error: "Ocorreu um erro ao confirmar seu e-mail.",
          linkExpired: "O link expirou. Por favor, solicite um novo.",
          invalidLink: "Link inválido ou já utilizado.",
          alreadyVerified: "Este e-mail já está verificado.",
          redirecting: "Redirecionando para o painel principal...",
          continueToApp: "Ir para a Aplicação",
          signupAgain: "Cadastrar novamente",
          tryLogin: "Iniciar Sessão",
          troubleshooting: "Se o link não funcionar, certifique-se de clicar diretamente do e-mail."
        },
        buttons: {
          cancel: "Cancelar",
          confirm: "Confirmar",
          save: "Salvar",
          close: "Fechar",
          retry: "Repetir",
          back: "Voltar",
          next: "Próximo",
          change: "Mudar",
          select: "Selecionar"
        },
        status: {
          loading: "Carregando..."
        },
        dashboard: {
          noAccountConnected: "Nenhuma conta conectada",
          integrations: "Integrações",
          toStartWorking: "para começar a trabalhar",
          totalFiles: "Arquivos Totais",
          filesManaged: "Arquivos Gerenciados",
          activeOperations: "Operações Ativas",
          inProgress: "Em Progresso",
          totalOperations: "Operações Totais",
          operationsPerformed: "Operações Realizadas",
          completedOperations: "Operações Concluídas",
          successfully: "Com Sucesso",
          recentFiles: "Arquivos Recentes"
        },
        actions: {
          searchPlaceholder: "Buscar arquivos ou pastas..."
        },
        new: "Novo"
      },
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
      },
      dashboard: {
        noAccountConnected: "Nenhuma conta conectada",
        integrations: "Integrações",
        toStartWorking: "para começar a trabalhar",
        totalFiles: "Total de Arquivos",
        filesManaged: "Arquivos Gerenciados",
        activeOperations: "Operações Ativas",
        inProgress: "Em Progresso",
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
          confirmPasswordPlaceholder: "Repita sua senha",
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
        }
      },
      landing: {
        hero: {
          title: "Mova e proteja seus arquivos com",
          subtitle: "Inteligência Real",
          description: "TERA é a ponte entre suas nuvens. Transfira arquivos entre plataformas, agende backups automáticos e conecte suas ferramentas favoritas em segundos.",
          ctaButton: "Comece grátis hoje",
          demoButton: "Ver demonstração",
          integrationsLabel: "Melhores Integrações",
          syncBadge: "Auto-Sincronização",
          transferLabel: "Transferência",
          backupLabel: "Backup",
          completed: "Concluído",
          scanning: "Escaneando",
          freedLabel: "Liberado",
          duplicatesLabel: "Duplicados",
          securityBadge: "Segurança Ativa",
          encryptionLabel: "Criptografia de 256 bits"
        },
        features: {
          title: "Produtos"
        },
        stats: {
          filesMoved: "Arquivos Movidos",
          activeUsers: "Usuários Ativos",
          guaranteedUptime: "Uptime Garantido",
          bankingSecurity: "Segurança Bancária"
        },
        benefits: {
          badge: "Produtos",
          title: "Todo seu conteúdo, conectado",
          description: "Simplificamos o complexo. Automatizamos o tedioso. Protegemos o que importa.",
          learnMore: "Saber mais",
          feature1: {
            title: "Transferências Multi-nuvem",
            description: "Mova gigabytes entre Dropbox, Drive e OneDrive com um único clique. Sem baixar nada para seu computador."
          },
          feature2: {
            title: "Backups Inteligentes",
            description: "Agende backups automáticos entre nuvens para que seus arquivos mais importantes sempre tenham um espelho."
          },
          feature3: {
            title: "+50 Integrações Nativas",
            description: "Conecte Slack, Teams, Notion e todas as suas ferramentas de trabalho para centralizar seu ecossistema digital."
          }
        },
        ai: {
          title: "Você define as regras,",
          subtitle: "o TERA as executa para você.",
          description: "Configure fluxos de trabalho potentes em segundos. O TERA monitora seus arquivos 24 horas por dia, 7 días por semana e realiza as tarefas repetitivas para que você não precise fazer.",
          panelTitle: "Painel de Automação",
          panelStatus: "Sistema Inteligente Ativo",
          aiMessage: "\"Detectei 150 novos arquivos no seu Dropbox. Você gostaria que eu iniciasse a migração automática para sua pasta de Projetos 2024 no Google Drive?\"",
          userResponse: "\"Sim, por favor. E remova os duplicados com mais de 6 meses.\"",
          progressLabel: "Migração em curso",
          suggestions: {
            suggestion1: "Mova meus arquivos do Dropbox para o Google Drive",
            suggestion2: "Crie um backup das minhas fotos no OneDrive",
            suggestion3: "Quais nuvens tenho integradas atualmente?",
            suggestion4: "Transfira a pasta 'Projetos' para minha conta do Box",
            suggestion5: "Sincronize minha pasta do Notion com meu Drive"
          }
        },
        security: {
          badge: "Segurança sem Compromissos",
          title: "Dormir tranquilo faz parte do plano",
          description: "Não economizamos em segurança. O TERA usa os mesmos protocolos que as instituições financeiras globais para garantir que seus dados nunca caiam em mãos erradas.",
          whitepaperButton: "Leia nosso Whitepaper de Segurança",
          aesTitle: "AES-256",
          aesDesc: "Criptografia de nível militar para cada bit de informação.",
          zeroKnowledgeTitle: "Zero Knowledge",
          zeroKnowledgeDesc: "Suas chaves são apenas suas. Nem mesmo nós podemos ver seus arquivos.",
          auditTitle: "Auditoria Real",
          auditDesc: "Registros detalhados de cada movimento para seu controle total.",
          syncTitle: "Sincronização",
          syncDesc: "Suas nuvens sempre em harmonia, protegidas por nosso firewall inteligente."
        },
        cta: {
          title: "O futuro dos seus arquivos começa hoje.",
          description: "Junte-se a mais de 85.000 profissionais que já otimizaram seu ecossistema digital com o TERA. Sem cartões, sem complicações.",
          createAccount: "Criar minha conta grátis",
          talkToSales: "Falar com vendas"
        },
        footer: {
          description: "Elevando a gestão de arquivos a uma nova dimensão de inteligência e segurança.",
          platform: "Plataforma",
          legal: "Legal",
          privacy: "Privacidade",
          terms: "Termos",
          cookies: "Cookies",
          compliance: "Conformidade",
          rights: "© {{year}} TERA Cloud Technologies Inc.",
          status: "Sistemas Operacionais",
          back: "Volver"
        },
        auth: {
          login: {
            title: "Bem-vindo de volta!",
            welcomeMessages: ["Bem-vindo de volta!", "Olá novamente!", "Que bom ver você"],
            emailLabel: "Endereço de e-mail",
            emailPlaceholder: "voce@email.com",
            passwordLabel: "Senha",
            passwordPlaceholder: "Sua senha",
            signInButton: "Entrar",
            noAccount: "Não tem conta? Cadastre-se",
            forgotPassword: "Esqueceu sua senha?"
          },
          signup: {
            title: "Crie sua conta",
            nameLabel: "Nome completo",
            namePlaceholder: "Seu nome",
            emailLabel: "Endereço de e-mail",
            emailPlaceholder: "voce@email.com",
            passwordLabel: "Senha",
            passwordPlaceholder: "Crie uma senha",
            confirmPasswordLabel: "Confirmar senha",
            confirmPasswordPlaceholder: "Repita sua senha",
            createAccountButton: "Criar Conta",
            hasAccount: "Já tem conta?",
            signIn: "Entrar",
            acceptTerms: {
              part1: "Aceito os",
              termsLink: "Termos de Serviço",
              and: "e a",
              privacyLink: "Política de Privacidade"
            }
          },
          validation: {
            invalidEmail: "Endereço de e-mail inválido",
            passwordTooShort: "A senha deve ter pelo menos 6 caracteres",
            nameRequired: "O nome é obrigatório",
            acceptTermsRequired: "Você deve aceitar los termos",
            passwordsDoNotMatch: "As senhas não coincidem"
          }
        },
        privacy: {
          title: "Política de Privacidade",
          back: "Voltar",
          lastUpdated: "Última atualização",
          section1: {
            title: "1. Introdução",
            content: "No TERA, levamos sua privacidade muito a sério. Esta política explica como coletamos, usamos e protegemos suas informações pessoais."
          },
          section2: {
            title: "2. Informações que Coletamos",
            subsection1: {
              title: "Informações da Conta",
              item1: "Nome e endereço de e-mail",
              item2: "Preferências de configuração",
              item3: "Informações de faturamento"
            },
            subsection2: {
              title: "Informações de Uso",
              item1: "Endereço IP e tipo de dispositivo",
              item2: "Logs de atividade do sistema",
              item3: "Estatísticas de transferência",
              item4: "Metadados de arquivos (sem acessar o conteúdo)"
            },
            subsection3: {
              title: "Integrações de Terceiros",
              intro: "Ao conectar serviços como Google Drive ou Dropbox, coletamos:",
              item1: "Tokens de acesso (criptografados)",
              item2: "Lista de arquivos e pastas",
              item3: "ID de usuário do serviço externo"
            }
          },
          section3: {
            title: "3. Como Utilizamos sua Informação",
            intro: "Utilizamos os dados coletados para:",
            item1: "Fornecer e manter o serviço",
            item2: "Processar suas transferências de arquivos",
            item3: "Melhorar a segurança da plataforma",
            item4: "Enviar notificações importantes",
            item5: "Personalizar sua experiência",
            item6: "Cumprir obrigações legais"
          },
          section4: {
            title: "4. Armazenamento e Segurança",
            subsection1: {
              title: "Segurança dos Dados",
              intro: "Utilizamos protocolos de segurança de nível industrial:",
              item1: "Criptografia AES-256 para dados em repouso",
              item2: "Protocolos TLS para dados em trânsito"
            },
            subsection2: {
              title: "Retenção de Dados",
              intro: "Mantemos sua informação apenas pelo tempo necessário:",
              item1: "Dados da conta: Enquanto a conta estiver ativa",
              item2: "Logs: Até 12 meses para fins de auditoria",
              item3: "Cache de arquivos: Temporário até concluir a operação"
            },
            subsection3: {
              title: "Localização de Servidores",
              content: "Nossos serviços estão hospedados principalmente em infraestruturas seguras na nuvem com redundância global.",
              intro: "Garantimos:",
              item1: "Alta disponibilidade",
              item2: "Backups diários",
              item3: "Isolamento de dados por usuário",
              item4: "Conformidade normativa regional"
            }
          },
          section5: {
            title: "5. Seus Direitos",
            subsection1: {
              title: "Controle sobre seus dados",
              item1: "Direito de acesso",
              item2: "Direito de retificação",
              item3: "Direito de exclusão (esquecimento)"
            },
            subsection2: {
              title: "Outras faculdades",
              item1: "Portabilidade de dados",
              item2: "Restrição de processamento",
              item3: "Oposição ao marketing direto",
              item4: "Retirada de consentimento",
              item5: "Apresentação de reclamações"
            },
            subsection3: {
              title: "Como exercer seus direitos",
              content: "Você pode gerenciar a maioria dessas opções no seu painel de configurações ou entrando em contato com nosso suporte."
            }
          },
          section6: {
            title: "6. Compartilhamento de Informações",
            intro: "Nunca vendemos seus dados pessoais. Apenas compartilhamos informações com:",
            subsection1: {
              title: "Terceiros autorizados",
              item1: "Processadores de pagamento (Stripe)",
              item2: "Serviços de infraestrutura (AWS/Google Cloud)",
              item3: "Ferramentas de análise anônima",
              item4: "Autoridades legais se exigido"
            },
            subsection2: {
              title: "Políticas de terceiros",
              content: "Os serviços integrados (Drive, Dropbox, etc.) são regidos por suas próprias políticas de privacidade."
            }
          },
          section7: {
            title: "7. Cookies e Tecnologias Semelhantes",
            intro: "Utilizamos cookies para:",
            item1: "Manter sua sessão ativa",
            item2: "Lembrar suas preferências",
            item3: "Analisar o desempenho",
            item4: "Prevenir fraudes",
            item5: "Segurança da navegação",
            item6: "Melhorar a interface"
          },
          section8: {
            title: "8. Privacidade de Menores",
            intro: "Nosso serviço não é direcionado a menores de 13 anos. Se detectarmos dados de menores sem consentimento parental:",
            item1: "Procederemos à exclusão imediata",
            item2: "Notificaremos os tutores se possível",
            item3: "Bloquearemos o acesso à conta"
          },
          section9: {
            title: "9. Alterações na Política",
            content: "Podemos atualizar esta política periodicamente. Notificaremos você sobre qualquer alteração substancial via e-mail."
          },
          section10: {
            title: "10. Contato",
            content: "Se você tiver dúvidas sobre sua privacidade, escreva para support@tera.cloud"
          },
          section11: {
            title: "11. Jurisdição",
            content: "Esta política é regida pelas leis internacionais de proteção de dados."
          },
          section12: {
            title: "12. Suporte",
            content: "Nossa equipe de privacidade está disponível para tirar suas dúvidas.",
            email: "privacy@tera.cloud"
          },
          section13: {
            title: "13. Resumo de Segurança",
            intro: "Em resumo, o TERA garante:",
            item1: "Transparência total",
            item2: "Segurança técnica avançada",
            item3: "Controle total do usuário",
            item4: "Conformidade normativa"
          }
        },
        terms: {
          title: "Termos de Serviço",
          back: "Voltar",
          lastUpdated: "Última atualização",
          section1: {
            title: "1. Aceitação dos Termos",
            content: "Ao acessar o TERA, você concorda em cumprir estes termos de serviço. Se você não concordar, por favor não use a plataforma."
          },
          section2: {
            title: "2. Descrição do Serviço",
            content: "O TERA é uma plataforma de gestão e transferência de arquivos entre serviços de armazenamento na nuvem."
          },
          section3: {
            title: "3. Responsabilidades do Usuário",
            intro: "Como usuário do TERA, você concorda em:",
            item1: "Fornecer informações verdadeiras",
            item2: "Manter a segurança de sua conta",
            item3: "Não usar o serviço para fins ilegais",
            item4: "Respeitar os direitos autorais dos arquivos"
          },
          section4: {
            title: "4. Propriedade Intelectual",
            intro: "Nossa política sobre propriedade intelectual inclui:",
            item1: "O TERA é proprietário da plataforma e de seu código",
            item2: "Você mantém a propriedade total de seus arquivos",
            item3: "Não reivindicamos direitos sobre seu conteúdo",
            item4: "Respeitamos as marcas registradas de terceiros",
            item5: "Proteção de logotipos e design",
            item6: "Licenças de software de código aberto"
          },
          section5: {
            title: "5. Limitação de Responsabilidade",
            intro: "O TERA não é responsável por:",
            item1: "Perda de dados por falhas de terceiros",
            item2: "Interrupções de serviço fora de nosso controle razoável",
            item3: "Uso indevido da conta pelo usuário"
          },
          section6: {
            title: "6. Suspensão e Rescisão",
            intro: "Podemos suspender sua conta se:",
            item1: "Você violar estes termos",
            item2: "Atividades suspeitas forem realizadas",
            item3: "Exigido por uma autoridade legal",
            item4: "Houver falta de pagamento em planos premium"
          },
          section7: {
            title: "7. Taxas e Pagamentos",
            content: "Os planos premium são faturados mensal ou anualmente. Não há reembolsos parciais, a menos que exigido por lei."
          },
          section8: {
            title: "8. Modificações do Serviço",
            content: "Reservamo-nos o direito de modificar ou descontinuar qualquer parte do serviço com aviso prévio."
          },
          section9: {
            title: "9. Uso da API",
            intro: "O uso de nossas integrações implica:",
            item1: "Conformidade com as cotas dos provedores",
            item2: "Não realizar engenharia reversa",
            item3: "Uso responsável dos recursos",
            item4: "Respeito aos tokens de autenticação",
            item5: "Segurança nas chamadas à API"
          },
          section10: {
            title: "10. Privacidade",
            content: "O uso do serviço também é regido por nossa Política de Privacidade."
          },
          section11: {
            title: "11. Força Maior",
            content: "Não seremos responsáveis por falhas devido a causas além do nosso controle razoável."
          },
          section12: {
            title: "12. Divisibilidade",
            content: "Se qualquer disposição destes termos for declarada inválida, as demais permanecerão em vigor."
          }
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
    detection: {
      order: ['locationLanguageDetector', 'querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Register the custom detector
if (i18n.services.languageDetector) {
  i18n.services.languageDetector.addDetector(customDetector);
}

export default i18n;
