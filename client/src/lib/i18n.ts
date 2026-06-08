import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const spanishSpeakingCountries = [
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GQ', 
  'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'ES', 'UY', 'VE'
];

const customDetector = {
  name: 'locationLanguageDetector',
  lookup() {
    const saved = localStorage.getItem('i18nextLng');
    if (saved) return saved;

    const browserLang = navigator.language.split('-')[0].toLowerCase();
    const browserRegion = navigator.language.split('-')[1]?.toUpperCase();

    if (browserRegion === 'BR' || browserRegion === 'PT') {
      return 'pt';
    }

    if (spanishSpeakingCountries.includes(browserRegion || '')) {
      return 'es';
    }

    if (['es', 'en', 'pt'].includes(browserLang)) {
      return browserLang;
    }

    return 'en';
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('i18nextLng', lng);
  }
};

const esTranslations = {
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
    new: "Nuevo",
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
      shared: "Compartidos",
      adminPanel: "Panel Admin",
      userManagement: "Gestión de Usuarios",
      operationLogs: "Logs de Operaciones",
      mainMenu: "Menú Principal",
      groups: "Grupos",
      tools: "Herramientas"
    },
    sidebar: {
      storage: "Almacenamiento",
      storageUsed: "Utilizado: {{used}} de {{total}}"
    },
    status: {
      loading: "Cargando...",
      soon: "Próximamente"
    },
    actions: {
      searchPlaceholder: "Buscar archivos o carpetas...",
      cancel: "Cancelar",
      viewAll: "Ver todo",
      viewDetails: "Ver detalles"
    },
    forgotPassword: {
      successTitle: "Correo enviado",
      successDesc: "Revisá tu bandeja de entrada para restablecer tu contraseña",
      backToLogin: "Volver al inicio de sesión"
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
    }
  },
  sidebar: {
    storage: "Almacenamiento"
  },
  myFiles: {
    title: "Mis Archivos",
    searchPlaceholder: "Buscar archivos...",
    noFilesFound: "No se encontraron archivos",
    noFilesCopied: "Aún no copiaste ningún archivo",
    tryDifferentSearch: "Intentá con otra búsqueda",
    filesWillAppearHere: "Tus archivos transferidos aparecerán acá",
    showing: "Mostrando",
    to: "a",
    of: "de",
    files: "archivos",
    previous: "Anterior",
    next: "Siguiente"
  },
  operations: {
    title: "Operaciones",
    description: "Historial de todas tus transferencias",
    copyOperation: "Transferencia",
    date: "Fecha",
    duration: "Duración",
    state: "Estado",
    error: "Error",
    started: "Iniciada",
    startedMessage: "Tu operación fue iniciada correctamente",
    noOperations: "Sin operaciones",
    operationsWillAppear: "Tus transferencias aparecerán acá"
  },
  analytics: {
    title: "Analíticas",
    description: "Estadísticas de tus transferencias",
    totalOperations: "Operaciones Totales",
    filesCopied: "Archivos Transferidos",
    totalFilesProcessed: "Archivos Procesados",
    completed: "Completadas",
    failed: "Fallidas",
    inProgress: "En Progreso",
    inProgressStatus: "En curso",
    successRate: "Tasa de Éxito",
    averageTime: "Tiempo Promedio",
    perCompletedOperation: "por operación completada",
    operationStatus: "Estado de Operaciones",
    activityLast7Days: "Actividad (últimos 7 días)",
    noDataTitle: "Sin datos aún",
    noDataMessage: "Realizá transferencias para ver tus estadísticas"
  },
  pages: {
    cloudExplorer: {
      title: "Explorador Multi-nube",
      subtitle: "Arrastrá archivos entre tus nubes",
      syncMode: "Modo de transferencia",
      cumulative: "Acumular",
      cumulativeDesc: "Agrega archivos sin eliminar los existentes",
      mirror: "Reemplazar",
      mirrorDesc: "Reemplaza archivos con el mismo nombre",
      syncDesc: "Seleccioná el modo antes de transferir"
    },
    integrations: {
      title: "Integraciones",
      subtitle: "Conectá tus servicios de almacenamiento",
      personalStorage: "Almacenamiento personal",
      googleDriveDesc: "Almacenamiento en la nube de Google con colaboración en tiempo real",
      dropboxDesc: "Almacenamiento en la nube con sincronización y uso compartido sencillo",
      features: "Funcionalidades",
      autoSync: "Sincronización automática",
      sharedFolders: "Carpetas compartidas",
      permissions: "Control de permisos",
      maxSupport: "Archivos hasta 5TB",
      perFile: "por archivo",
      collabAndFiles: "Colaboración y archivos",
      realTimeCollab: "Colaboración en tiempo real",
      versionHistory: "Historial de versiones",
      secureLinks: "Links de compartición seguros",
      comingSoonTitle: "Próximamente",
      comingSoonSubtitle: "Estamos trabajando en nuevas integraciones",
      requestBtn: "Solicitar integración",
      requestDesc: "¿No ves tu servicio? Podés solicitarlo"
    }
  },
  quickCopy: {
    title: "Transferencia Rápida",
    urlLabel: "URL del archivo",
    urlPlaceholder: "Pegá la URL de Google Drive o Dropbox",
    googleUrlLabel: "URL de Google Drive",
    googleUrlPlaceholder: "https://drive.google.com/...",
    dropboxUrlLabel: "URL de Dropbox",
    dropboxUrlPlaceholder: "https://www.dropbox.com/...",
    destinationLabel: "Carpeta destino",
    includeSubfolders: "Incluir subcarpetas",
    preview: "Vista previa",
    starting: "Iniciando..."
  },
  notFound: {
    title: "Página no encontrada",
    description: "La página que buscás no existe o fue movida"
  },
  copy: {
    transferInitiated: "Transferencia iniciada"
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
      noAccount: "¿No tienes cuenta?",
      signUpNow: "Regístrate Ahora",
      forgotPassword: "¿Olvidaste tu contraseña?",
      description: "Ingresa tu email y contraseña para acceder a tu cuenta.",
      orContinueWith: "O Inicia Con",
      rememberMe: "Recordarme"
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
      rights: "Copyright © 2026 TERA. Todos los derechos reservados.",
      status: "Sistemas Operativos",
      back: "Volver"
    },
    auth: {
      login: {
        noAccount: "¿No tienes cuenta?",
        signUpNow: "Regístrate Ahora"
      },
      signup: {
        hasAccount: "¿Ya tienes cuenta?",
        signIn: "Inicia sesión"
      }
    }
  }
};

const enTranslations = {
  welcomeMessages: ["Welcome back!", "Hello again!", "Nice to see you"],
  common: {
    new: "New",
    navigation: {
      pricing: "Pricing",
      security: "Security"
    },
    auth: { login: "Login" }
  },
  auth: {
    signup: { title: "Sign Up", subtitle: "Start managing your files" },
    login: { emailLabel: "Email", emailPlaceholder: "your@email.com", passwordLabel: "Password", description: "Login to your account" }
  },
  landing: {
    hero: {
      title: "Move and protect your files with",
      subtitle: "Real Intelligence",
      description: "TERA is the bridge between your clouds.",
      ctaButton: "Get started for free",
      demoButton: "View demo",
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
    benefits: {
      badge: "Products",
      title: "All your content, connected",
      description: "We simplify the complex.",
      learnMore: "Learn more",
      feature1: { title: "Multi-cloud Transfers", description: "Move gigabytes easily." },
      feature2: { title: "Smart Backups", description: "Schedule automatic backups." },
      feature3: { title: "50+ Native Integrations", description: "Connect all your tools." }
    },
    stats: {
      filesMoved: "Files Moved",
      activeUsers: "Active Users",
      guaranteedUptime: "Guaranteed Uptime",
      bankingSecurity: "Banking Security"
    },
    ai: {
      title: "You define the rules,",
      subtitle: "TERA executes them for you.",
      description: "Setup powerful workflows.",
      suggestions: {
        suggestion1: "Move files from Dropbox to Drive",
        suggestion2: "Backup photos to OneDrive",
        suggestion3: "What clouds are integrated?",
        suggestion4: "Transfer Proyectos folder",
        suggestion5: "Sync Notion with Drive"
      }
    },
    security: {
      aesDesc: "Military-grade encryption.",
      zeroKnowledgeDesc: "Zero Knowledge security.",
      auditDesc: "Detailed audit logs.",
      syncDesc: "Harmony between clouds."
    },
    footer: {
      rights: "Copyright © 2026 TERA. Todos los derechos reservados.",
      status: "System Status"
    }
  }
};

const ptTranslations = {
  welcomeMessages: ["Bem-vindo de volta!", "Olá novamente!", "Bom te ver"],
  common: {
    new: "Novo",
    navigation: {
      pricing: "Preços",
      security: "Segurança"
    },
    auth: { login: "Entrar" }
  },
  auth: {
    signup: { title: "Cadastrar", subtitle: "Comece a gerenciar seus arquivos" },
    login: { emailLabel: "E-mail", emailPlaceholder: "seu@email.com", passwordLabel: "Senha", description: "Entre na sua conta" }
  },
  landing: {
    hero: {
      title: "Mova e proteja seus arquivos com",
      subtitle: "Inteligência Real",
      description: "TERA é a ponte entre suas nuvens.",
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
    benefits: {
      badge: "Produtos",
      title: "Todo seu conteúdo, conectado",
      description: "Simplificamos o complexo.",
      learnMore: "Saiba mais",
      feature1: { title: "Transferências Multi-nuvem", description: "Mova gigabytes facilmente." },
      feature2: { title: "Backups Inteligentes", description: "Agende backups automáticos." },
      feature3: { title: "Mais de 50 Integracões", description: "Conecte todas as suas ferramentas." }
    },
    stats: {
      filesMoved: "Arquivos Movidos",
      activeUsers: "Usuários Ativos",
      guaranteedUptime: "Uptime Garantido",
      bankingSecurity: "Segurança Bancária"
    },
    ai: {
      title: "Você define as regras,",
      subtitle: "TERA executa para você.",
      description: "Configure fluxos poderosos.",
      suggestions: {
        suggestion1: "Mover arquivos do Dropbox para o Drive",
        suggestion2: "Backup de fotos para o OneDrive",
        suggestion3: "Quais nuvens estão integradas?",
        suggestion4: "Transferir pasta Proyectos",
        suggestion5: "Sincronizar Notion com Drive"
      }
    },
    security: {
      aesDesc: "Criptografia militar.",
      zeroKnowledgeDesc: "Segurança Zero Knowledge.",
      auditDesc: "Logs detalhados.",
      syncDesc: "Harmonia entre nuvens."
    },
    footer: {
      rights: "Copyright © 2026 TERA. Todos los derechos reservados.",
      status: "Status do Sistema"
    }
  }
};

const resources = {
  es: { translation: esTranslations },
  en: { translation: enTranslations },
  pt: { translation: ptTranslations }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'querystring', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
