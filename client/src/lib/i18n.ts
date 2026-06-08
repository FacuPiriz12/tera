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
      soon: "Próximamente",
      completed: "Completado",
      inProgress: "En progreso",
      pending: "Pendiente"
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
    notifications: {
      copyOperation: "Operación de copia",
      files: "archivos"
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
  status: {
    loading: "Cargando..."
  },
  language: {
    switchLanguage: "Cambiar idioma",
    select: "Seleccionar idioma",
    spanish: "Español",
    english: "English",
    portuguese: "Português"
  },
  errors: {
    validation: {
      invalidUrl: "URL inválida",
      urlRequired: "La URL es requerida"
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
    connectInstruction: "Conecta una cuenta para empezar a gestionar tus archivos.",
    categories: {
      documents: "Documentos",
      images: "Imágenes",
      media: "Multimedia",
      others: "Otros"
    }
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
    },
    privacy: {
      title: "Política de Privacidad",
      lastUpdated: "Última actualización",
      section1: {
        title: "Introducción",
        content: "En TERA nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas nuestra plataforma de gestión y transferencia de archivos en la nube."
      },
      section2: {
        title: "Información que Recopilamos",
        subsection1: {
          title: "Información de cuenta",
          item1: "Nombre completo y dirección de correo electrónico",
          item2: "Contraseña (almacenada con hash seguro, nunca en texto plano)",
          item3: "Foto de perfil (opcional, si la proporcionas)"
        },
        subsection2: {
          title: "Datos de uso",
          item1: "Historial de operaciones de transferencia y copia",
          item2: "Preferencias de configuración y ajustes de la aplicación",
          item3: "Logs de actividad para diagnóstico y mejora del servicio",
          item4: "Información del dispositivo y navegador (tipo, versión, sistema operativo)"
        },
        subsection3: {
          title: "Tokens de acceso OAuth",
          intro: "Cuando conectas servicios de terceros (Google Drive, Dropbox, OneDrive), almacenamos de forma segura:",
          item1: "Tokens de acceso temporales para operar en tu nombre",
          item2: "Tokens de actualización para mantener la conexión activa",
          item3: "Solo los permisos mínimos necesarios para las funciones solicitadas"
        }
      },
      section3: {
        title: "Cómo Usamos tu Información",
        intro: "Utilizamos la información recopilada exclusivamente para:",
        item1: "Proveer y mejorar los servicios de transferencia y gestión de archivos",
        item2: "Autenticar tu identidad y mantener la seguridad de tu cuenta",
        item3: "Ejecutar operaciones en tu nombre en servicios conectados",
        item4: "Enviar notificaciones sobre el estado de tus operaciones",
        item5: "Cumplir con obligaciones legales y prevenir fraudes",
        item6: "Mejorar la experiencia de usuario a través de análisis agregados y anonimizados"
      },
      section4: {
        title: "Almacenamiento y Seguridad",
        subsection1: {
          title: "Infraestructura",
          intro: "Tus datos se almacenan en servidores seguros con:",
          item1: "Cifrado AES-256 en reposo para datos sensibles",
          item2: "TLS 1.3 para todas las comunicaciones en tránsito"
        },
        subsection2: {
          title: "Tokens OAuth",
          intro: "Los tokens de acceso a servicios de terceros son:",
          item1: "Almacenados cifrados en nuestra base de datos",
          item2: "Nunca expuestos en logs o interfaces de usuario",
          item3: "Revocables en cualquier momento desde tu panel de integraciones"
        },
        subsection3: {
          title: "Retención de datos",
          content: "Conservamos tus datos mientras tu cuenta esté activa.",
          intro: "Al eliminar tu cuenta:",
          item1: "Tus datos personales se eliminan en un plazo de 30 días",
          item2: "Los tokens OAuth se revocan inmediatamente",
          item3: "Los logs de operaciones se anonomizan y conservan por 90 días por razones legales",
          item4: "Los archivos en servicios de terceros no se ven afectados"
        }
      },
      section5: {
        title: "Compartición de Datos",
        subsection1: {
          title: "Lo que nunca hacemos",
          item1: "Vender o alquilar tu información personal a terceros",
          item2: "Usar tus datos para publicidad dirigida",
          item3: "Acceder a tus archivos más allá de lo necesario para ejecutar tus operaciones"
        },
        subsection2: {
          title: "Proveedores de servicios",
          item1: "Supabase: autenticación y base de datos (con cifrado)",
          item2: "Render: infraestructura de servidor",
          item3: "Google (OAuth): integración con Google Drive",
          item4: "Dropbox (OAuth): integración con Dropbox",
          item5: "Todos sujetos a acuerdos de procesamiento de datos compatibles con GDPR"
        },
        subsection3: {
          title: "Requerimientos legales",
          content: "Podemos divulgar información si la ley lo requiere, en respuesta a procesos legales válidos, o para proteger los derechos y seguridad de TERA y sus usuarios."
        }
      },
      section6: {
        title: "Tus Derechos",
        intro: "Dependiendo de tu ubicación, puedes tener los siguientes derechos sobre tus datos:",
        subsection1: {
          title: "Derechos GDPR (usuarios europeos)",
          item1: "Acceso: solicitar una copia de tus datos personales",
          item2: "Rectificación: corregir datos inexactos o incompletos",
          item3: "Supresión: solicitar la eliminación de tus datos ('derecho al olvido')",
          item4: "Portabilidad: recibir tus datos en formato estructurado y legible por máquina"
        },
        subsection2: {
          title: "Cómo ejercer tus derechos",
          content: "Para ejercer cualquiera de estos derechos, contacta a nuestro equipo en privacy@tera.app. Responderemos en un plazo máximo de 30 días."
        }
      },
      section7: {
        title: "Cookies y Tecnologías de Seguimiento",
        intro: "Utilizamos las siguientes tecnologías de seguimiento:",
        item1: "Cookies de sesión: necesarias para mantener tu sesión activa",
        item2: "localStorage: para preferencias de idioma y configuración UI",
        item3: "Cookies de autenticación: para recordar tu sesión de forma segura",
        item4: "No utilizamos cookies de publicidad ni de seguimiento de terceros",
        item5: "No compartimos datos de comportamiento con redes publicitarias",
        item6: "Puedes gestionar las cookies desde la configuración de tu navegador",
        contact: "Para más información sobre nuestro uso de cookies, contáctanos en privacy@tera.app"
      },
      section8: {
        title: "Menores de Edad",
        intro: "TERA no está dirigido a menores de 16 años. No recopilamos intencionalmente información de menores.",
        item1: "Si eres menor de 16 años, no uses nuestros servicios",
        item2: "Si eres padre/tutor y crees que tu hijo nos proporcionó datos, contáctanos",
        item3: "Eliminaremos inmediatamente cualquier dato identificado como perteneciente a un menor",
        note: "En jurisdicciones donde se requiere, la edad mínima puede ser diferente según la ley local aplicable."
      },
      section9: {
        title: "Transferencias Internacionales de Datos",
        content: "TERA opera desde Argentina y puede procesar datos en servidores ubicados en Estados Unidos (AWS us-east-1). Al usar nuestros servicios, consientes esta transferencia. Implementamos salvaguardas apropiadas, incluyendo cláusulas contractuales estándar aprobadas por la Comisión Europea."
      },
      section10: {
        title: "Cambios en esta Política",
        content: "Podemos actualizar esta Política de Privacidad periódicamente. Cuando hagamos cambios significativos, te notificaremos por correo electrónico y/o mediante un aviso destacado en la aplicación al menos 30 días antes de que entren en vigor."
      },
      section11: {
        title: "Base Legal para el Procesamiento (GDPR)",
        content: "Para usuarios en el Espacio Económico Europeo, procesamos tus datos bajo las siguientes bases legales: (a) Ejecución de contrato: para proveer los servicios que solicitaste; (b) Intereses legítimos: para mejorar nuestros servicios y garantizar la seguridad; (c) Cumplimiento legal: cuando la ley nos lo requiere; (d) Consentimiento: para comunicaciones de marketing (siempre opt-in)."
      },
      section12: {
        title: "Contacto",
        content: "Si tienes preguntas, comentarios o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de tus datos personales, puedes contactarnos en:",
        email: "privacy@tera.app"
      },
      section13: {
        title: "Ley Aplicable",
        intro: "Esta Política de Privacidad se rige por las leyes de Argentina, sin perjuicio de los derechos adicionales que puedan corresponder a usuarios de la Unión Europea bajo el GDPR. En caso de conflicto:",
        item1: "Para usuarios en Argentina: Ley 25.326 de Protección de Datos Personales",
        item2: "Para usuarios en la Unión Europea: Reglamento (UE) 2016/679 (GDPR)",
        item3: "Para usuarios en California: California Consumer Privacy Act (CCPA)",
        item4: "Los tribunales competentes serán los de la Ciudad Autónoma de Buenos Aires, Argentina"
      }
    },
    terms: {
      title: "Términos y Condiciones de Uso",
      lastUpdated: "Última actualización",
      section1: {
        title: "Aceptación de los Términos",
        content: "Al acceder o utilizar TERA, aceptas estar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio. Estos términos aplican a todos los usuarios, visitantes y cualquier persona que acceda o use el servicio."
      },
      section2: {
        title: "Descripción del Servicio",
        content: "TERA es una plataforma de gestión y transferencia de archivos entre servicios de almacenamiento en la nube. Permitimos a los usuarios conectar servicios como Google Drive, Dropbox, OneDrive y otros para transferir, organizar y gestionar sus archivos desde una única interfaz."
      },
      section3: {
        title: "Registro y Cuenta de Usuario",
        intro: "Para utilizar TERA debes:",
        item1: "Ser mayor de 16 años (o contar con autorización parental)",
        item2: "Proporcionar información veraz y actualizada al registrarte",
        item3: "Mantener la confidencialidad de tus credenciales de acceso",
        item4: "Notificarnos inmediatamente ante cualquier uso no autorizado de tu cuenta"
      },
      section4: {
        title: "Uso Aceptable",
        intro: "Al usar TERA, te comprometes a NO:",
        item1: "Violar leyes aplicables o derechos de terceros",
        item2: "Transferir contenido ilegal, malicioso o que infrinja derechos de autor",
        item3: "Intentar acceder a sistemas o datos no autorizados",
        item4: "Usar el servicio para spam, phishing u otras actividades fraudulentas",
        item5: "Sobrecargar intencionalmente nuestra infraestructura",
        item6: "Realizar ingeniería inversa o intentar obtener el código fuente de TERA"
      },
      section5: {
        title: "Planes y Pagos",
        intro: "TERA ofrece planes gratuitos y de pago:",
        item1: "Plan Gratuito: acceso limitado a funciones básicas según los límites vigentes",
        item2: "Plan PRO: acceso completo a todas las funciones, incluyendo transferencias cross-cloud ilimitadas",
        item3: "Los precios están sujetos a cambios con un aviso previo de 30 días",
        note: "Los pagos son procesados de forma segura. No almacenamos datos de tarjetas de crédito."
      },
      section6: {
        title: "Propiedad Intelectual",
        intro: "Respecto a la propiedad intelectual:",
        item1: "TERA y su contenido son propiedad de sus desarrolladores y están protegidos por leyes de propiedad intelectual",
        item2: "Tus archivos y datos siguen siendo de tu propiedad en todo momento",
        item3: "Al usar TERA, nos otorgas una licencia limitada para operar con tus archivos únicamente según tus instrucciones",
        item4: "No reclamamos ningún derecho de propiedad sobre tu contenido",
        note: "Nunca accedemos, leemos ni analizamos el contenido de tus archivos más allá de lo técnicamente necesario para ejecutar las operaciones que solicitas."
      },
      section7: {
        title: "Limitación de Responsabilidad",
        content: "TERA se proporciona 'tal cual' y 'según disponibilidad'. En la máxima medida permitida por la ley, no nos responsabilizamos por pérdidas de datos, interrupciones del servicio, daños indirectos o consecuentes derivados del uso de nuestra plataforma. Nuestra responsabilidad máxima estará limitada al monto pagado por el servicio en los últimos 12 meses."
      },
      section8: {
        title: "Disponibilidad del Servicio",
        content: "Nos esforzamos por mantener TERA disponible el mayor tiempo posible. Sin embargo, no garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimientos programados notificando con anticipación. En caso de interrupciones no planificadas, trabajaremos para restablecer el servicio lo antes posible."
      },
      section9: {
        title: "Terminación",
        intro: "Tu cuenta puede ser suspendida o terminada si:",
        item1: "Violas estos Términos y Condiciones",
        item2: "Tu suscripción de pago vence sin renovación",
        item3: "Se detecta actividad fraudulenta o maliciosa",
        item4: "Lo solicitas voluntariamente",
        item5: "TERA cesa operaciones (con aviso previo de 30 días)",
        note: "Al terminar tu cuenta, perderás acceso al servicio. Tus archivos en servicios de terceros no se verán afectados."
      },
      section10: {
        title: "Cambios en los Términos",
        content: "Podemos modificar estos términos en cualquier momento. Los cambios significativos serán notificados por email y/o en la aplicación con al menos 30 días de anticipación. El uso continuado del servicio después de los cambios constituye aceptación de los nuevos términos."
      },
      section11: {
        title: "Resolución de Disputas",
        content: "Ante cualquier disputa relacionada con estos términos o el uso de TERA, las partes acuerdan intentar resolver el conflicto de forma amigable en primera instancia. Si no se llega a un acuerdo, la disputa se someterá a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, Argentina."
      },
      section12: {
        title: "Indemnización",
        content: "Aceptas indemnizar y mantener indemne a TERA, sus desarrolladores, empleados y colaboradores de cualquier reclamación, daño, pérdida o gasto (incluidos honorarios legales razonables) que surjan de tu uso del servicio o violación de estos términos."
      },
      section13: {
        title: "Ley Aplicable",
        content: "Estos Términos se rigen por las leyes de la República Argentina, sin perjuicio de los derechos adicionales que puedan corresponder a usuarios bajo legislaciones específicas de su país de residencia."
      },
      section14: {
        title: "Contacto",
        content: "Para consultas sobre estos Términos y Condiciones, contáctanos en:",
        email: "legal@tera.app"
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
