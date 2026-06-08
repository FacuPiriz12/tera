import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const spanishSpeakingCountries = [
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GQ',
  'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'ES', 'UY', 'VE'
];

function detectLanguage(): string {
  const saved = localStorage.getItem('i18nextLng');
  if (saved && ['es', 'en', 'pt'].includes(saved)) return saved;

  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const browserRegion = navigator.language.split('-')[1]?.toUpperCase();

  if (browserRegion === 'BR' || browserRegion === 'PT') return 'pt';
  if (spanishSpeakingCountries.includes(browserRegion || '')) return 'es';
  if (['es', 'en', 'pt'].includes(browserLang)) return browserLang;
  return 'en';
}

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
  welcomeMessages: ["Welcome back!", "Hello again!", "Nice to see you", "Good to have you back!", "Ready to continue?", "Let's go! 🚀"],
  sidebar: { storage: "Storage" },
  myFiles: {
    title: "My Files", searchPlaceholder: "Search files...", noFilesFound: "No files found",
    noFilesCopied: "No files transferred yet", tryDifferentSearch: "Try a different search",
    filesWillAppearHere: "Your transferred files will appear here",
    showing: "Showing", to: "to", of: "of", files: "files", previous: "Previous", next: "Next"
  },
  operations: {
    title: "Operations", description: "History of all your transfers", copyOperation: "Transfer",
    date: "Date", duration: "Duration", state: "Status", error: "Error",
    started: "Started", startedMessage: "Your operation was started successfully",
    noOperations: "No operations", operationsWillAppear: "Your transfers will appear here"
  },
  analytics: {
    title: "Analytics", description: "Transfer statistics", totalOperations: "Total Operations",
    filesCopied: "Files Transferred", totalFilesProcessed: "Files Processed",
    completed: "Completed", failed: "Failed", inProgress: "In Progress", inProgressStatus: "Running",
    successRate: "Success Rate", averageTime: "Average Time", perCompletedOperation: "per completed operation",
    operationStatus: "Operation Status", activityLast7Days: "Activity (last 7 days)",
    noDataTitle: "No data yet", noDataMessage: "Make transfers to see your statistics"
  },
  pages: {
    cloudExplorer: {
      title: "Multi-cloud Explorer", subtitle: "Drag files between your clouds",
      syncMode: "Transfer mode", cumulative: "Accumulate", cumulativeDesc: "Add files without removing existing ones",
      mirror: "Replace", mirrorDesc: "Replace files with the same name", syncDesc: "Select a mode before transferring"
    },
    integrations: {
      title: "Integrations", subtitle: "Connect your storage services",
      personalStorage: "Personal storage", googleDriveDesc: "Google cloud storage with real-time collaboration",
      dropboxDesc: "Cloud storage with easy sync and sharing", features: "Features",
      autoSync: "Auto sync", sharedFolders: "Shared folders", permissions: "Permission control",
      maxSupport: "Files up to 5TB", perFile: "per file", collabAndFiles: "Collaboration & files",
      realTimeCollab: "Real-time collaboration", versionHistory: "Version history",
      secureLinks: "Secure sharing links", comingSoonTitle: "Coming Soon",
      comingSoonSubtitle: "We are working on new integrations",
      requestBtn: "Request integration", requestDesc: "Don't see your service? You can request it"
    }
  },
  quickCopy: {
    title: "Quick Transfer", urlLabel: "File URL", urlPlaceholder: "Paste Google Drive or Dropbox URL",
    googleUrlLabel: "Google Drive URL", googleUrlPlaceholder: "https://drive.google.com/...",
    dropboxUrlLabel: "Dropbox URL", dropboxUrlPlaceholder: "https://www.dropbox.com/...",
    destinationLabel: "Destination folder", includeSubfolders: "Include subfolders",
    preview: "Preview", starting: "Starting..."
  },
  notFound: { title: "Page not found", description: "The page you are looking for does not exist or was moved" },
  copy: { transferInitiated: "Transfer started" },
  status: { loading: "Loading..." },
  language: { switchLanguage: "Switch language", select: "Select language", spanish: "Español", english: "English", portuguese: "Português" },
  errors: { validation: { invalidUrl: "Invalid URL", urlRequired: "URL is required" } },
  dashboard: {
    noAccountConnected: "No accounts connected", integrations: "Integrations",
    toStartWorking: "to get started", totalFiles: "Total Files", filesManaged: "Files Managed",
    activeOperations: "Active Operations", inProgress: "In Progress", totalOperations: "Total Operations",
    operationsPerformed: "Operations Performed", completedOperations: "Completed Operations",
    successfully: "Successfully", recentFiles: "Recent Files", noRecentFiles: "No recent files",
    addedOn: "Added on", connectInstruction: "Connect an account to start managing your files.",
    categories: { documents: "Documents", images: "Images", media: "Media", others: "Others" }
  },
  common: {
    new: "New",
    app: { title: "TERA", description: "Cloud file management" },
    navigation: {
      home: "Home", files: "Files", operations: "Operations", myFiles: "My Files",
      sharedDrives: "Shared Drives", analytics: "Analytics", settings: "Settings", profile: "Profile",
      copyFromUrl: "Copy from URL", integrations: "Integrations", pricing: "Pricing", security: "Security",
      tasks: "Scheduled Tasks", health: "Cloud Health", cloudExplorer: "Multi-cloud Explorer",
      shared: "Shared", adminPanel: "Admin Panel", userManagement: "User Management",
      operationLogs: "Operation Logs", mainMenu: "Main Menu", groups: "Groups", tools: "Tools"
    },
    sidebar: { storage: "Storage", storageUsed: "Used: {{used}} of {{total}}" },
    status: { loading: "Loading...", soon: "Coming Soon", completed: "Completed", inProgress: "In Progress", pending: "Pending" },
    actions: { searchPlaceholder: "Search files or folders...", cancel: "Cancel", viewAll: "View all", viewDetails: "View details" },
    forgotPassword: { successTitle: "Email sent", successDesc: "Check your inbox to reset your password", backToLogin: "Back to login" },
    notifications: { copyOperation: "Copy operation", files: "files" },
    buttons: { cancel: "Cancel", confirm: "Confirm", save: "Save", close: "Close", retry: "Retry", back: "Back", next: "Next", change: "Change", select: "Select" },
    auth: {
      login: "Login", logout: "Log out",
      resetPassword: {
        title: "Choose a new password", description: "Almost done. Enter your new password.",
        passwordLabel: "New password", confirmPasswordLabel: "Confirm new password",
        submitButton: "Reset password", successTitle: "Password updated",
        successDesc: "Your password has been reset.", successLongDesc: "Your password has been updated. You can now log in with your new password.",
        backToLogin: "Back to login",
        req: { lowercase: "one lowercase", special: "one special character", uppercase: "one uppercase", minimum: "minimum 8 characters", number: "one number" }
      }
    },
    user: { profile: "Profile", settings: "Settings" },
    language: { select: "Select language", spanish: "Español", english: "English", portuguese: "Português", switchLanguage: "Switch language" },
    dashboard: { noAccountConnected: "No accounts connected", integrations: "Integrations", toStartWorking: "to get started", totalFiles: "Total Files", filesManaged: "Files Managed", activeOperations: "Active Operations", inProgress: "In Progress", totalOperations: "Total Operations", operationsPerformed: "Operations Performed", completedOperations: "Completed Operations", successfully: "Successfully", recentFiles: "Recent Files", noRecentFiles: "No recent files", addedOn: "Added on", connectInstruction: "Connect an account to start managing your files." },
    signupSuccess: {
      title: "Registration Successful!", subtitle: "Your account has been created.",
      checkEmailTitle: "Check your inbox", checkEmailDescription: "We sent a confirmation link to your email.",
      nextStepsTitle: "Next steps:", step1: "Open the confirmation email.", step2: "Click the link to verify your account.", step3: "Log in and start using TERA.",
      continueToLogin: "Continue to Login", backToHome: "Back to Home", noEmail: "Didn't receive the email?", tryAgain: "Try again"
    },
    emailConfirmation: { title: "Account Verified!", description: "Thank you for verifying your email. Your account is now active.", backToLogin: "Go to Login", tryLogin: "Try Login", troubleshooting: "If the link doesn't work, make sure to click directly from the email." }
  },
  auth: {
    login: {
      title: "Welcome back!", subtitle: "Sign in with your credentials",
      welcomeMessages: ["Welcome back!", "Hello again!", "Good to see you"],
      emailLabel: "Email", emailPlaceholder: "your@email.com", passwordLabel: "Password",
      passwordPlaceholder: "Your password", signInButton: "Sign In",
      noAccount: "Don't have an account?", signUpNow: "Sign Up Now",
      forgotPassword: "Forgot your password?", description: "Enter your email and password to access your account.",
      orContinueWith: "Or continue with", rememberMe: "Remember me"
    },
    signup: {
      title: "Create your account", subtitle: "Sign up to start managing your files.",
      nameLabel: "Full name", namePlaceholder: "Your name", emailLabel: "Email",
      emailPlaceholder: "your@email.com", passwordLabel: "Password",
      passwordPlaceholder: "Create a password", confirmPasswordLabel: "Confirm password",
      confirmPasswordPlaceholder: "Repeat your password", createAccountButton: "Create Account",
      hasAccount: "Already have an account?", signIn: "Sign in",
      acceptTerms: { part1: "I accept the", termsLink: "Terms of Service", and: "and the", privacyLink: "Privacy Policy" },
      validation: { passwordsDoNotMatch: "Passwords do not match" }
    },
    logout: "Log out",
    showcase: { title: "Effortlessly manage your team and operations", description: "Sign in to access your dashboard and manage your files efficiently." },
    validation: { invalidEmail: "Invalid email address" }
  },
  forgotPasswordTitle: "Recover password",
  forgotPasswordDescription: "Enter your email and we'll send you instructions.",
  forgotPasswordEmailLabel: "Email",
  forgotPasswordEmailPlaceholder: "your@email.com",
  forgotPasswordSubmitButton: "Send link",
  forgotPasswordBackToLogin: "Back to login",
  landing: {
    hero: {
      title: "Move and protect your files with", subtitle: "Real Intelligence",
      description: "TERA is the bridge between your clouds. Transfer files between platforms, schedule automatic backups, and connect your favorite tools in seconds.",
      ctaButton: "Get started for free", demoButton: "View demo",
      integrationsLabel: "Best Integrations", syncBadge: "Auto-Sync",
      transferLabel: "Transfer", backupLabel: "Backup", completed: "Completed",
      scanning: "Scanning", freedLabel: "Freed", duplicatesLabel: "Duplicates",
      securityBadge: "Active Security", encryptionLabel: "256-bit Encryption"
    },
    features: { title: "Products" },
    stats: { filesMoved: "Files Moved", activeUsers: "Active Users", guaranteedUptime: "Guaranteed Uptime", bankingSecurity: "Banking Security" },
    benefits: {
      badge: "Products", title: "All your content, connected",
      description: "We simplify the complex. We automate the tedious. We protect what matters.",
      learnMore: "Learn more",
      feature1: { title: "Multi-cloud Transfers", description: "Move gigabytes between Dropbox, Drive and OneDrive with one click. No downloads needed." },
      feature2: { title: "Smart Backups", description: "Schedule automatic backups between clouds so your important files always have a mirror." },
      feature3: { title: "50+ Native Integrations", description: "Connect Slack, Teams, Notion and all your work tools to centralize your digital ecosystem." }
    },
    ai: {
      title: "You define the rules,", subtitle: "TERA executes them for you.",
      description: "Set up powerful workflows in seconds. TERA monitors your files 24/7 and handles repetitive tasks so you don't have to.",
      panelTitle: "Automation Panel", panelStatus: "Smart System Active",
      aiMessage: "\"I've detected 150 new files in your Dropbox. Shall I start the automatic migration to your Projects 2024 folder in Google Drive?\"",
      userResponse: "\"Yes please. And remove duplicates older than 6 months.\"",
      progressLabel: "Migration in progress",
      suggestions: {
        suggestion1: "Move my files from Dropbox to Google Drive",
        suggestion2: "Create a backup of my photos in OneDrive",
        suggestion3: "What clouds do I have integrated?",
        suggestion4: "Transfer the Projects folder to my Box account",
        suggestion5: "Sync my Notion folder with my Drive"
      }
    },
    security: {
      badge: "Uncompromising Security", title: "Sleeping soundly is part of the plan",
      description: "We don't cut corners on security. TERA uses the same protocols as global financial institutions.",
      whitepaperButton: "Read our Security Whitepaper",
      aesTitle: "AES-256", aesDesc: "Military-grade encryption for every bit of information.",
      zeroKnowledgeTitle: "Zero Knowledge", zeroKnowledgeDesc: "Your keys are yours alone. Not even we can see your files.",
      auditTitle: "Real Audit", auditDesc: "Detailed logs of every movement for your total control.",
      syncTitle: "Sync", syncDesc: "Your clouds always in harmony, protected by our smart firewall."
    },
    cta: {
      title: "The future of your files starts today.",
      description: "Join over 85,000 professionals who have already optimized their digital ecosystem with TERA.",
      createAccount: "Create my free account", talkToSales: "Talk to sales"
    },
    footer: {
      description: "Elevating file management to a new dimension of intelligence and security.",
      platform: "Platform", legal: "Legal", privacy: "Privacy", terms: "Terms",
      cookies: "Cookies", compliance: "Compliance",
      rights: "Copyright © 2026 TERA. All rights reserved.",
      status: "System Status", back: "Back"
    },
    auth: { login: { noAccount: "Don't have an account?", signUpNow: "Sign Up Now" }, signup: { hasAccount: "Already have an account?", signIn: "Sign in" } },
    privacy: {
      title: "Privacy Policy", lastUpdated: "Last updated",
      section1: { title: "Introduction", content: "At TERA we take our users' privacy very seriously. This Privacy Policy describes how we collect, use, store, and protect your personal information when you use our cloud file management and transfer platform." },
      section2: {
        title: "Information We Collect",
        subsection1: { title: "Account information", item1: "Full name and email address", item2: "Password (stored with secure hash, never in plain text)", item3: "Profile photo (optional)" },
        subsection2: { title: "Usage data", item1: "Transfer and copy operation history", item2: "Configuration preferences and app settings", item3: "Activity logs for diagnosis and service improvement", item4: "Device and browser information" },
        subsection3: { title: "OAuth access tokens", intro: "When you connect third-party services (Google Drive, Dropbox, OneDrive), we securely store:", item1: "Temporary access tokens to operate on your behalf", item2: "Refresh tokens to keep the connection active", item3: "Only the minimum permissions necessary for the requested functions" }
      },
      section3: { title: "How We Use Your Information", intro: "We use the collected information exclusively to:", item1: "Provide and improve file transfer and management services", item2: "Authenticate your identity and maintain account security", item3: "Execute operations on your behalf on connected services", item4: "Send notifications about your operation status", item5: "Comply with legal obligations and prevent fraud", item6: "Improve user experience through aggregated and anonymized analytics" },
      section4: {
        title: "Storage and Security",
        subsection1: { title: "Infrastructure", intro: "Your data is stored on secure servers with:", item1: "AES-256 encryption at rest for sensitive data", item2: "TLS 1.3 for all communications in transit" },
        subsection2: { title: "OAuth Tokens", intro: "Third-party service access tokens are:", item1: "Stored encrypted in our database", item2: "Never exposed in logs or user interfaces", item3: "Revocable at any time from your integrations panel" },
        subsection3: { title: "Data Retention", content: "We retain your data while your account is active.", intro: "When you delete your account:", item1: "Your personal data is deleted within 30 days", item2: "OAuth tokens are immediately revoked", item3: "Operation logs are anonymized and kept for 90 days for legal reasons", item4: "Files in third-party services are not affected" }
      },
      section5: {
        title: "Data Sharing",
        subsection1: { title: "What we never do", item1: "Sell or rent your personal information to third parties", item2: "Use your data for targeted advertising", item3: "Access your files beyond what is necessary to execute your operations" },
        subsection2: { title: "Service providers", item1: "Supabase: authentication and database (encrypted)", item2: "Render: server infrastructure", item3: "Google (OAuth): Google Drive integration", item4: "Dropbox (OAuth): Dropbox integration", item5: "All subject to GDPR-compatible data processing agreements" },
        subsection3: { title: "Legal requirements", content: "We may disclose information if required by law, in response to valid legal processes, or to protect the rights and safety of TERA and its users." }
      },
      section6: {
        title: "Your Rights", intro: "Depending on your location, you may have the following rights over your data:",
        subsection1: { title: "GDPR Rights (European users)", item1: "Access: request a copy of your personal data", item2: "Rectification: correct inaccurate or incomplete data", item3: "Erasure: request deletion of your data ('right to be forgotten')", item4: "Portability: receive your data in a structured, machine-readable format" },
        subsection2: { title: "How to exercise your rights", content: "To exercise any of these rights, contact our team at privacy@tera.app. We will respond within a maximum of 30 days." }
      },
      section7: { title: "Cookies and Tracking Technologies", intro: "We use the following tracking technologies:", item1: "Session cookies: necessary to maintain your active session", item2: "localStorage: for language preferences and UI settings", item3: "Authentication cookies: to remember your session securely", item4: "We do not use advertising or third-party tracking cookies", item5: "We do not share behavioral data with advertising networks", item6: "You can manage cookies from your browser settings", contact: "For more information about our use of cookies, contact us at privacy@tera.app" },
      section8: { title: "Minors", intro: "TERA is not directed at minors under 16 years of age.", item1: "If you are under 16, do not use our services", item2: "If you are a parent/guardian and believe your child provided us data, contact us", item3: "We will immediately delete any data identified as belonging to a minor", note: "In jurisdictions where required, the minimum age may differ according to applicable local law." },
      section9: { title: "International Data Transfers", content: "TERA operates from Argentina and may process data on servers located in the United States (AWS us-east-1). By using our services, you consent to this transfer. We implement appropriate safeguards, including standard contractual clauses approved by the European Commission." },
      section10: { title: "Changes to this Policy", content: "We may update this Privacy Policy periodically. When we make significant changes, we will notify you by email and/or through a prominent notice in the application at least 30 days before they take effect." },
      section11: { title: "Legal Basis for Processing (GDPR)", content: "For users in the European Economic Area, we process your data under the following legal bases: (a) Contract performance: to provide the services you requested; (b) Legitimate interests: to improve our services and ensure security; (c) Legal compliance: when required by law; (d) Consent: for marketing communications (always opt-in)." },
      section12: { title: "Contact", content: "If you have questions, comments, or requests related to this Privacy Policy or the processing of your personal data, you can contact us at:", email: "privacy@tera.app" },
      section13: { title: "Applicable Law", intro: "This Privacy Policy is governed by the laws of Argentina, without prejudice to the additional rights that may correspond to users of the European Union under the GDPR.", item1: "For users in Argentina: Law 25,326 on Personal Data Protection", item2: "For users in the European Union: Regulation (EU) 2016/679 (GDPR)", item3: "For users in California: California Consumer Privacy Act (CCPA)", item4: "Competent courts will be those of the Autonomous City of Buenos Aires, Argentina" }
    },
    terms: {
      title: "Terms and Conditions of Use", lastUpdated: "Last updated",
      section1: { title: "Acceptance of Terms", content: "By accessing or using TERA, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service." },
      section2: { title: "Description of Service", content: "TERA is a platform for managing and transferring files between cloud storage services. We allow users to connect services like Google Drive, Dropbox, OneDrive and others to transfer, organize and manage their files from a single interface." },
      section3: { title: "Registration and User Account", intro: "To use TERA you must:", item1: "Be at least 16 years old (or have parental authorization)", item2: "Provide truthful and up-to-date information when registering", item3: "Maintain the confidentiality of your access credentials", item4: "Notify us immediately of any unauthorized use of your account" },
      section4: { title: "Acceptable Use", intro: "When using TERA, you agree NOT to:", item1: "Violate applicable laws or third-party rights", item2: "Transfer illegal, malicious, or copyright-infringing content", item3: "Attempt to access unauthorized systems or data", item4: "Use the service for spam, phishing, or other fraudulent activities", item5: "Intentionally overload our infrastructure", item6: "Reverse engineer or attempt to obtain TERA's source code" },
      section5: { title: "Plans and Payments", intro: "TERA offers free and paid plans:", item1: "Free Plan: limited access to basic features", item2: "PRO Plan: full access to all features, including unlimited cross-cloud transfers", item3: "Prices are subject to change with 30 days prior notice", note: "Payments are processed securely. We do not store credit card data." },
      section6: { title: "Intellectual Property", intro: "Regarding intellectual property:", item1: "TERA and its content are the property of its developers and protected by intellectual property laws", item2: "Your files and data remain your property at all times", item3: "By using TERA, you grant us a limited license to operate with your files only according to your instructions", item4: "We claim no ownership rights over your content", note: "We never access, read, or analyze the content of your files beyond what is technically necessary to execute the operations you request." },
      section7: { title: "Limitation of Liability", content: "TERA is provided 'as is' and 'as available'. To the maximum extent permitted by law, we are not liable for data loss, service interruptions, or indirect or consequential damages arising from the use of our platform." },
      section8: { title: "Service Availability", content: "We strive to keep TERA available as much as possible. However, we do not guarantee uninterrupted availability. We may perform scheduled maintenance with advance notice." },
      section9: { title: "Termination", intro: "Your account may be suspended or terminated if:", item1: "You violate these Terms and Conditions", item2: "Your paid subscription expires without renewal", item3: "Fraudulent or malicious activity is detected", item4: "You voluntarily request it", item5: "TERA ceases operations (with 30 days prior notice)", note: "Upon terminating your account, you will lose access to the service. Your files in third-party services will not be affected." },
      section10: { title: "Changes to Terms", content: "We may modify these terms at any time. Significant changes will be notified by email and/or in the application with at least 30 days notice." },
      section11: { title: "Dispute Resolution", content: "In any dispute related to these terms or the use of TERA, the parties agree to first attempt amicable resolution. If no agreement is reached, the dispute will be submitted to the courts of the Autonomous City of Buenos Aires, Argentina." },
      section12: { title: "Indemnification", content: "You agree to indemnify and hold harmless TERA, its developers, employees and collaborators from any claim, damage, loss or expense arising from your use of the service or violation of these terms." },
      section13: { title: "Applicable Law", content: "These Terms are governed by the laws of the Argentine Republic." },
      section14: { title: "Contact", content: "For inquiries about these Terms and Conditions, contact us at:", email: "legal@tera.app" }
    }
  }
};

const ptTranslations = {
  welcomeMessages: ["Bem-vindo de volta!", "Olá novamente!", "Bom te ver de novo!", "Que bom ter você aqui!", "Vamos lá! 🚀"],
  sidebar: { storage: "Armazenamento" },
  myFiles: {
    title: "Meus Arquivos", searchPlaceholder: "Buscar arquivos...", noFilesFound: "Nenhum arquivo encontrado",
    noFilesCopied: "Nenhum arquivo transferido ainda", tryDifferentSearch: "Tente outra busca",
    filesWillAppearHere: "Seus arquivos transferidos aparecerão aqui",
    showing: "Mostrando", to: "a", of: "de", files: "arquivos", previous: "Anterior", next: "Próximo"
  },
  operations: {
    title: "Operações", description: "Histórico de todas as suas transferências", copyOperation: "Transferência",
    date: "Data", duration: "Duração", state: "Status", error: "Erro",
    started: "Iniciada", startedMessage: "Sua operação foi iniciada com sucesso",
    noOperations: "Sem operações", operationsWillAppear: "Suas transferências aparecerão aqui"
  },
  analytics: {
    title: "Análises", description: "Estatísticas de transferências", totalOperations: "Total de Operações",
    filesCopied: "Arquivos Transferidos", totalFilesProcessed: "Arquivos Processados",
    completed: "Concluído", failed: "Falhou", inProgress: "Em andamento", inProgressStatus: "Em execução",
    successRate: "Taxa de Sucesso", averageTime: "Tempo Médio", perCompletedOperation: "por operação concluída",
    operationStatus: "Status das Operações", activityLast7Days: "Atividade (últimos 7 dias)",
    noDataTitle: "Sem dados ainda", noDataMessage: "Faça transferências para ver suas estatísticas"
  },
  pages: {
    cloudExplorer: {
      title: "Explorador Multi-nuvem", subtitle: "Arraste arquivos entre suas nuvens",
      syncMode: "Modo de transferência", cumulative: "Acumular", cumulativeDesc: "Adicionar arquivos sem remover os existentes",
      mirror: "Substituir", mirrorDesc: "Substituir arquivos com o mesmo nome", syncDesc: "Selecione um modo antes de transferir"
    },
    integrations: {
      title: "Integrações", subtitle: "Conecte seus serviços de armazenamento",
      personalStorage: "Armazenamento pessoal", googleDriveDesc: "Armazenamento em nuvem do Google com colaboração em tempo real",
      dropboxDesc: "Armazenamento em nuvem com sincronização e compartilhamento fáceis", features: "Funcionalidades",
      autoSync: "Sincronização automática", sharedFolders: "Pastas compartilhadas", permissions: "Controle de permissões",
      maxSupport: "Arquivos de até 5TB", perFile: "por arquivo", collabAndFiles: "Colaboração e arquivos",
      realTimeCollab: "Colaboração em tempo real", versionHistory: "Histórico de versões",
      secureLinks: "Links de compartilhamento seguros", comingSoonTitle: "Em Breve",
      comingSoonSubtitle: "Estamos trabalhando em novas integrações",
      requestBtn: "Solicitar integração", requestDesc: "Não encontrou seu serviço? Você pode solicitá-lo"
    }
  },
  quickCopy: {
    title: "Transferência Rápida", urlLabel: "URL do arquivo", urlPlaceholder: "Cole a URL do Google Drive ou Dropbox",
    googleUrlLabel: "URL do Google Drive", googleUrlPlaceholder: "https://drive.google.com/...",
    dropboxUrlLabel: "URL do Dropbox", dropboxUrlPlaceholder: "https://www.dropbox.com/...",
    destinationLabel: "Pasta de destino", includeSubfolders: "Incluir subpastas",
    preview: "Prévia", starting: "Iniciando..."
  },
  notFound: { title: "Página não encontrada", description: "A página que você está procurando não existe ou foi movida" },
  copy: { transferInitiated: "Transferência iniciada" },
  status: { loading: "Carregando..." },
  language: { switchLanguage: "Trocar idioma", select: "Selecionar idioma", spanish: "Español", english: "English", portuguese: "Português" },
  errors: { validation: { invalidUrl: "URL inválida", urlRequired: "URL é obrigatória" } },
  dashboard: {
    noAccountConnected: "Nenhuma conta conectada", integrations: "Integrações",
    toStartWorking: "para começar", totalFiles: "Total de Arquivos", filesManaged: "Arquivos Gerenciados",
    activeOperations: "Operações Ativas", inProgress: "Em andamento", totalOperations: "Total de Operações",
    operationsPerformed: "Operações Realizadas", completedOperations: "Operações Concluídas",
    successfully: "Com sucesso", recentFiles: "Arquivos Recentes", noRecentFiles: "Sem arquivos recentes",
    addedOn: "Adicionado em", connectInstruction: "Conecte uma conta para começar a gerenciar seus arquivos.",
    categories: { documents: "Documentos", images: "Imagens", media: "Mídia", others: "Outros" }
  },
  common: {
    new: "Novo",
    app: { title: "TERA", description: "Gerenciamento de arquivos na nuvem" },
    navigation: {
      home: "Início", files: "Arquivos", operations: "Operações", myFiles: "Meus Arquivos",
      sharedDrives: "Drives Compartilhados", analytics: "Análises", settings: "Configurações", profile: "Perfil",
      copyFromUrl: "Copiar de URL", integrations: "Integrações", pricing: "Preços", security: "Segurança",
      tasks: "Tarefas Programadas", health: "Saúde da Nuvem", cloudExplorer: "Explorador Multi-nuvem",
      shared: "Compartilhado", adminPanel: "Painel Admin", userManagement: "Gerenciamento de Usuários",
      operationLogs: "Logs de Operações", mainMenu: "Menu Principal", groups: "Grupos", tools: "Ferramentas"
    },
    sidebar: { storage: "Armazenamento", storageUsed: "Usado: {{used}} de {{total}}" },
    status: { loading: "Carregando...", soon: "Em Breve", completed: "Concluído", inProgress: "Em andamento", pending: "Pendente" },
    actions: { searchPlaceholder: "Buscar arquivos ou pastas...", cancel: "Cancelar", viewAll: "Ver todos", viewDetails: "Ver detalhes" },
    forgotPassword: { successTitle: "E-mail enviado", successDesc: "Verifique sua caixa de entrada para redefinir sua senha", backToLogin: "Voltar ao login" },
    notifications: { copyOperation: "Operação de cópia", files: "arquivos" },
    buttons: { cancel: "Cancelar", confirm: "Confirmar", save: "Salvar", close: "Fechar", retry: "Tentar novamente", back: "Voltar", next: "Próximo", change: "Alterar", select: "Selecionar" },
    auth: {
      login: "Entrar", logout: "Sair",
      resetPassword: {
        title: "Escolha uma nova senha", description: "Quase lá. Digite sua nova senha.",
        passwordLabel: "Nova senha", confirmPasswordLabel: "Confirmar nova senha",
        submitButton: "Redefinir senha", successTitle: "Senha atualizada",
        successDesc: "Sua senha foi redefinida.", successLongDesc: "Sua senha foi atualizada. Agora você pode entrar com sua nova senha.",
        backToLogin: "Voltar ao login",
        req: { lowercase: "uma minúscula", special: "um caractere especial", uppercase: "uma maiúscula", minimum: "mínimo 8 caracteres", number: "um número" }
      }
    },
    user: { profile: "Perfil", settings: "Configurações" },
    language: { select: "Selecionar idioma", spanish: "Español", english: "English", portuguese: "Português", switchLanguage: "Trocar idioma" },
    dashboard: { noAccountConnected: "Nenhuma conta conectada", integrations: "Integrações", toStartWorking: "para começar", totalFiles: "Total de Arquivos", filesManaged: "Arquivos Gerenciados", activeOperations: "Operações Ativas", inProgress: "Em andamento", totalOperations: "Total de Operações", operationsPerformed: "Operações Realizadas", completedOperations: "Operações Concluídas", successfully: "Com sucesso", recentFiles: "Arquivos Recentes", noRecentFiles: "Sem arquivos recentes", addedOn: "Adicionado em", connectInstruction: "Conecte uma conta para começar a gerenciar seus arquivos." },
    signupSuccess: {
      title: "Cadastro Realizado!", subtitle: "Sua conta foi criada.",
      checkEmailTitle: "Verifique sua caixa de entrada", checkEmailDescription: "Enviamos um link de confirmação para o seu e-mail.",
      nextStepsTitle: "Próximos passos:", step1: "Abra o e-mail de confirmação.", step2: "Clique no link para verificar sua conta.", step3: "Faça login e comece a usar o TERA.",
      continueToLogin: "Continuar para Login", backToHome: "Voltar ao Início", noEmail: "Não recebeu o e-mail?", tryAgain: "Tentar novamente"
    },
    emailConfirmation: { title: "Conta Verificada!", description: "Obrigado por verificar seu e-mail. Sua conta está ativa.", backToLogin: "Ir para Login", tryLogin: "Tentar Login", troubleshooting: "Se o link não funcionar, certifique-se de clicar diretamente do e-mail." }
  },
  auth: {
    login: {
      title: "Bem-vindo de volta!", subtitle: "Entre com suas credenciais",
      welcomeMessages: ["Bem-vindo de volta!", "Olá novamente!", "Bom te ver"],
      emailLabel: "E-mail", emailPlaceholder: "seu@email.com", passwordLabel: "Senha",
      passwordPlaceholder: "Sua senha", signInButton: "Entrar",
      noAccount: "Não tem uma conta?", signUpNow: "Cadastre-se",
      forgotPassword: "Esqueceu sua senha?", description: "Digite seu e-mail e senha para acessar sua conta.",
      orContinueWith: "Ou continue com", rememberMe: "Lembrar de mim"
    },
    signup: {
      title: "Crie sua conta", subtitle: "Cadastre-se para começar a gerenciar seus arquivos.",
      nameLabel: "Nome completo", namePlaceholder: "Seu nome", emailLabel: "E-mail",
      emailPlaceholder: "seu@email.com", passwordLabel: "Senha",
      passwordPlaceholder: "Crie uma senha", confirmPasswordLabel: "Confirmar senha",
      confirmPasswordPlaceholder: "Repita sua senha", createAccountButton: "Criar Conta",
      hasAccount: "Já tem uma conta?", signIn: "Entrar",
      acceptTerms: { part1: "Aceito os", termsLink: "Termos de Serviço", and: "e a", privacyLink: "Política de Privacidade" },
      validation: { passwordsDoNotMatch: "As senhas não coincidem" }
    },
    logout: "Sair",
    showcase: { title: "Gerencie sua equipe e operações facilmente", description: "Entre para acessar seu painel e gerenciar seus arquivos de forma eficiente." },
    validation: { invalidEmail: "Endereço de e-mail inválido" }
  },
  forgotPasswordTitle: "Recuperar senha",
  forgotPasswordDescription: "Digite seu e-mail e enviaremos as instruções.",
  forgotPasswordEmailLabel: "E-mail",
  forgotPasswordEmailPlaceholder: "seu@email.com",
  forgotPasswordSubmitButton: "Enviar link",
  forgotPasswordBackToLogin: "Voltar ao login",
  landing: {
    hero: {
      title: "Mova e proteja seus arquivos com", subtitle: "Inteligência Real",
      description: "TERA é a ponte entre suas nuvens. Transfira arquivos entre plataformas, agende backups automáticos e conecte suas ferramentas favoritas em segundos.",
      ctaButton: "Comece grátis hoje", demoButton: "Ver demonstração",
      integrationsLabel: "Melhores Integrações", syncBadge: "Auto-Sincronização",
      transferLabel: "Transferência", backupLabel: "Backup", completed: "Concluído",
      scanning: "Escaneando", freedLabel: "Liberado", duplicatesLabel: "Duplicados",
      securityBadge: "Segurança Ativa", encryptionLabel: "Criptografia de 256 bits"
    },
    features: { title: "Produtos" },
    stats: { filesMoved: "Arquivos Movidos", activeUsers: "Usuários Ativos", guaranteedUptime: "Uptime Garantido", bankingSecurity: "Segurança Bancária" },
    benefits: {
      badge: "Produtos", title: "Todo seu conteúdo, conectado",
      description: "Simplificamos o complexo. Automatizamos o tedioso. Protegemos o que importa.",
      learnMore: "Saiba mais",
      feature1: { title: "Transferências Multi-nuvem", description: "Mova gigabytes entre Dropbox, Drive e OneDrive com um clique. Sem downloads necessários." },
      feature2: { title: "Backups Inteligentes", description: "Agende backups automáticos entre nuvens para que seus arquivos importantes sempre tenham uma cópia." },
      feature3: { title: "Mais de 50 Integrações", description: "Conecte Slack, Teams, Notion e todas as suas ferramentas de trabalho para centralizar seu ecossistema digital." }
    },
    ai: {
      title: "Você define as regras,", subtitle: "TERA executa para você.",
      description: "Configure fluxos poderosos em segundos. TERA monitora seus arquivos 24h/7 e cuida das tarefas repetitivas para que você não precise.",
      panelTitle: "Painel de Automação", panelStatus: "Sistema Inteligente Ativo",
      aiMessage: "\"Detectei 150 novos arquivos no seu Dropbox. Devo iniciar a migração automática para sua pasta Projetos 2024 no Google Drive?\"",
      userResponse: "\"Sim, por favor. E remova duplicados com mais de 6 meses.\"",
      progressLabel: "Migração em andamento",
      suggestions: {
        suggestion1: "Mover meus arquivos do Dropbox para o Google Drive",
        suggestion2: "Criar backup das minhas fotos no OneDrive",
        suggestion3: "Quais nuvens tenho integradas?",
        suggestion4: "Transferir a pasta Projetos para minha conta Box",
        suggestion5: "Sincronizar minha pasta Notion com meu Drive"
      }
    },
    security: {
      badge: "Segurança Inegociável", title: "Dormir tranquilo faz parte do plano",
      description: "Não cortamos cantos na segurança. TERA usa os mesmos protocolos de instituições financeiras globais.",
      whitepaperButton: "Leia nosso Whitepaper de Segurança",
      aesTitle: "AES-256", aesDesc: "Criptografia militar para cada bit de informação.",
      zeroKnowledgeTitle: "Zero Knowledge", zeroKnowledgeDesc: "Suas chaves são só suas. Nem nós podemos ver seus arquivos.",
      auditTitle: "Auditoria Real", auditDesc: "Logs detalhados de cada movimentação para seu controle total.",
      syncTitle: "Sincronização", syncDesc: "Suas nuvens sempre em harmonia, protegidas pelo nosso firewall inteligente."
    },
    cta: {
      title: "O futuro dos seus arquivos começa hoje.",
      description: "Junte-se a mais de 85.000 profissionais que já otimizaram seu ecossistema digital com TERA.",
      createAccount: "Criar minha conta gratuita", talkToSales: "Falar com vendas"
    },
    footer: {
      description: "Elevando o gerenciamento de arquivos a uma nova dimensão de inteligência e segurança.",
      platform: "Plataforma", legal: "Legal", privacy: "Privacidade", terms: "Termos",
      cookies: "Cookies", compliance: "Conformidade",
      rights: "Copyright © 2026 TERA. Todos os direitos reservados.",
      status: "Status do Sistema", back: "Voltar"
    },
    auth: { login: { noAccount: "Não tem uma conta?", signUpNow: "Cadastre-se" }, signup: { hasAccount: "Já tem uma conta?", signIn: "Entrar" } },
    privacy: {
      title: "Política de Privacidade", lastUpdated: "Última atualização",
      section1: { title: "Introdução", content: "Na TERA levamos muito a sério a privacidade de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você usa nossa plataforma de gerenciamento e transferência de arquivos na nuvem." },
      section2: {
        title: "Informações que Coletamos",
        subsection1: { title: "Informações da conta", item1: "Nome completo e endereço de e-mail", item2: "Senha (armazenada com hash seguro, nunca em texto simples)", item3: "Foto de perfil (opcional)" },
        subsection2: { title: "Dados de uso", item1: "Histórico de operações de transferência e cópia", item2: "Preferências de configuração e ajustes do aplicativo", item3: "Logs de atividade para diagnóstico e melhoria do serviço", item4: "Informações do dispositivo e navegador" },
        subsection3: { title: "Tokens de acesso OAuth", intro: "Quando você conecta serviços de terceiros (Google Drive, Dropbox, OneDrive), armazenamos com segurança:", item1: "Tokens de acesso temporários para operar em seu nome", item2: "Tokens de atualização para manter a conexão ativa", item3: "Apenas as permissões mínimas necessárias para as funções solicitadas" }
      },
      section3: { title: "Como Usamos Suas Informações", intro: "Usamos as informações coletadas exclusivamente para:", item1: "Fornecer e melhorar os serviços de transferência e gerenciamento de arquivos", item2: "Autenticar sua identidade e manter a segurança da conta", item3: "Executar operações em seu nome nos serviços conectados", item4: "Enviar notificações sobre o status de suas operações", item5: "Cumprir obrigações legais e prevenir fraudes", item6: "Melhorar a experiência do usuário por meio de análises agregadas e anonimizadas" },
      section4: {
        title: "Armazenamento e Segurança",
        subsection1: { title: "Infraestrutura", intro: "Seus dados são armazenados em servidores seguros com:", item1: "Criptografia AES-256 em repouso para dados sensíveis", item2: "TLS 1.3 para todas as comunicações em trânsito" },
        subsection2: { title: "Tokens OAuth", intro: "Os tokens de acesso a serviços de terceiros são:", item1: "Armazenados criptografados em nosso banco de dados", item2: "Nunca expostos em logs ou interfaces de usuário", item3: "Revogáveis a qualquer momento pelo painel de integrações" },
        subsection3: { title: "Retenção de Dados", content: "Mantemos seus dados enquanto sua conta estiver ativa.", intro: "Ao excluir sua conta:", item1: "Seus dados pessoais são excluídos em até 30 dias", item2: "Os tokens OAuth são imediatamente revogados", item3: "Os logs de operações são anonimizados e mantidos por 90 dias por razões legais", item4: "Os arquivos em serviços de terceiros não são afetados" }
      },
      section5: {
        title: "Compartilhamento de Dados",
        subsection1: { title: "O que nunca fazemos", item1: "Vender ou alugar suas informações pessoais a terceiros", item2: "Usar seus dados para publicidade segmentada", item3: "Acessar seus arquivos além do necessário para executar suas operações" },
        subsection2: { title: "Provedores de serviço", item1: "Supabase: autenticação e banco de dados (criptografado)", item2: "Render: infraestrutura de servidor", item3: "Google (OAuth): integração com Google Drive", item4: "Dropbox (OAuth): integração com Dropbox", item5: "Todos sujeitos a acordos de processamento de dados compatíveis com o LGPD" },
        subsection3: { title: "Requisitos legais", content: "Podemos divulgar informações se exigido por lei, em resposta a processos legais válidos, ou para proteger os direitos e a segurança da TERA e seus usuários." }
      },
      section6: {
        title: "Seus Direitos", intro: "Dependendo de sua localização, você pode ter os seguintes direitos sobre seus dados:",
        subsection1: { title: "Direitos LGPD (usuários brasileiros)", item1: "Acesso: solicitar uma cópia de seus dados pessoais", item2: "Retificação: corrigir dados inexatos ou incompletos", item3: "Exclusão: solicitar a exclusão de seus dados", item4: "Portabilidade: receber seus dados em formato estruturado e legível por máquina" },
        subsection2: { title: "Como exercer seus direitos", content: "Para exercer qualquer um desses direitos, entre em contato com nossa equipe em privacy@tera.app. Responderemos em no máximo 30 dias." }
      },
      section7: { title: "Cookies e Tecnologias de Rastreamento", intro: "Usamos as seguintes tecnologias de rastreamento:", item1: "Cookies de sessão: necessários para manter sua sessão ativa", item2: "localStorage: para preferências de idioma e configurações de interface", item3: "Cookies de autenticação: para lembrar sua sessão com segurança", item4: "Não usamos cookies de publicidade ou rastreamento de terceiros", item5: "Não compartilhamos dados comportamentais com redes de publicidade", item6: "Você pode gerenciar os cookies nas configurações do seu navegador", contact: "Para mais informações sobre o uso de cookies, entre em contato em privacy@tera.app" },
      section8: { title: "Menores de Idade", intro: "A TERA não é direcionada a menores de 16 anos.", item1: "Se você tem menos de 16 anos, não use nossos serviços", item2: "Se você é pai/responsável e acredita que seu filho nos forneceu dados, entre em contato", item3: "Excluiremos imediatamente qualquer dado identificado como pertencente a um menor", note: "Em jurisdições onde exigido, a idade mínima pode diferir de acordo com a lei local aplicável." },
      section9: { title: "Transferências Internacionais de Dados", content: "A TERA opera a partir da Argentina e pode processar dados em servidores localizados nos Estados Unidos (AWS us-east-1). Ao usar nossos serviços, você consente com essa transferência. Implementamos salvaguardas adequadas, incluindo cláusulas contratuais padrão." },
      section10: { title: "Alterações nesta Política", content: "Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos alterações significativas, notificaremos você por e-mail e/ou por meio de um aviso proeminente no aplicativo com pelo menos 30 dias de antecedência." },
      section11: { title: "Base Legal para Processamento (LGPD)", content: "Para usuários no Brasil, processamos seus dados com base nas seguintes bases legais: (a) Execução de contrato: para fornecer os serviços solicitados; (b) Legítimo interesse: para melhorar nossos serviços e garantir a segurança; (c) Conformidade legal: quando exigido por lei; (d) Consentimento: para comunicações de marketing (sempre opt-in)." },
      section12: { title: "Contato", content: "Se você tiver perguntas, comentários ou solicitações relacionados a esta Política de Privacidade ou ao processamento de seus dados pessoais, você pode nos contatar em:", email: "privacy@tera.app" },
      section13: { title: "Lei Aplicável", intro: "Esta Política de Privacidade é regida pelas leis da Argentina, sem prejuízo dos direitos adicionais que possam corresponder aos usuários do Brasil sob a LGPD.", item1: "Para usuários no Brasil: Lei 13.709/2018 (LGPD)", item2: "Para usuários na União Europeia: Regulamento (UE) 2016/679 (GDPR)", item3: "Para usuários na Argentina: Lei 25.326 de Proteção de Dados Pessoais", item4: "Os tribunais competentes serão os da Cidade Autônoma de Buenos Aires, Argentina" }
    },
    terms: {
      title: "Termos e Condições de Uso", lastUpdated: "Última atualização",
      section1: { title: "Aceitação dos Termos", content: "Ao acessar ou usar o TERA, você concorda em estar vinculado a estes Termos e Condições. Se você discordar de qualquer parte destes termos, não poderá acessar o serviço." },
      section2: { title: "Descrição do Serviço", content: "TERA é uma plataforma para gerenciamento e transferência de arquivos entre serviços de armazenamento em nuvem. Permitimos que os usuários conectem serviços como Google Drive, Dropbox, OneDrive e outros para transferir, organizar e gerenciar seus arquivos a partir de uma única interface." },
      section3: { title: "Cadastro e Conta de Usuário", intro: "Para usar o TERA você deve:", item1: "Ter pelo menos 16 anos (ou ter autorização dos pais)", item2: "Fornecer informações verdadeiras e atualizadas no cadastro", item3: "Manter a confidencialidade de suas credenciais de acesso", item4: "Nos notificar imediatamente sobre qualquer uso não autorizado de sua conta" },
      section4: { title: "Uso Aceitável", intro: "Ao usar o TERA, você concorda em NÃO:", item1: "Violar leis aplicáveis ou direitos de terceiros", item2: "Transferir conteúdo ilegal, malicioso ou que infrinja direitos autorais", item3: "Tentar acessar sistemas ou dados não autorizados", item4: "Usar o serviço para spam, phishing ou outras atividades fraudulentas", item5: "Sobrecarregar intencionalmente nossa infraestrutura", item6: "Fazer engenharia reversa ou tentar obter o código-fonte do TERA" },
      section5: { title: "Planos e Pagamentos", intro: "O TERA oferece planos gratuitos e pagos:", item1: "Plano Gratuito: acesso limitado a funcionalidades básicas", item2: "Plano PRO: acesso completo a todas as funcionalidades, incluindo transferências multi-nuvem ilimitadas", item3: "Os preços estão sujeitos a alterações com 30 dias de aviso prévio", note: "Os pagamentos são processados com segurança. Não armazenamos dados de cartão de crédito." },
      section6: { title: "Propriedade Intelectual", intro: "Sobre propriedade intelectual:", item1: "O TERA e seu conteúdo são propriedade de seus desenvolvedores e protegidos por leis de propriedade intelectual", item2: "Seus arquivos e dados permanecem de sua propriedade em todos os momentos", item3: "Ao usar o TERA, você nos concede uma licença limitada para operar com seus arquivos somente de acordo com suas instruções", item4: "Não reivindicamos nenhum direito de propriedade sobre seu conteúdo", note: "Nunca acessamos, lemos ou analisamos o conteúdo de seus arquivos além do que é tecnicamente necessário para executar as operações que você solicita." },
      section7: { title: "Limitação de Responsabilidade", content: "O TERA é fornecido 'como está' e 'conforme disponível'. Na medida máxima permitida por lei, não somos responsáveis por perda de dados, interrupções de serviço ou danos indiretos ou consequentes decorrentes do uso de nossa plataforma." },
      section8: { title: "Disponibilidade do Serviço", content: "Nos esforçamos para manter o TERA disponível o máximo possível. No entanto, não garantimos disponibilidade ininterrupta. Podemos realizar manutenção programada com aviso prévio." },
      section9: { title: "Rescisão", intro: "Sua conta pode ser suspensa ou encerrada se:", item1: "Você violar estes Termos e Condições", item2: "Sua assinatura paga expirar sem renovação", item3: "Atividade fraudulenta ou maliciosa for detectada", item4: "Você solicitar voluntariamente", item5: "O TERA encerrar as operações (com 30 dias de aviso prévio)", note: "Ao encerrar sua conta, você perderá o acesso ao serviço. Seus arquivos em serviços de terceiros não serão afetados." },
      section10: { title: "Alterações nos Termos", content: "Podemos modificar estes termos a qualquer momento. Alterações significativas serão notificadas por e-mail e/ou no aplicativo com pelo menos 30 dias de antecedência." },
      section11: { title: "Resolução de Disputas", content: "Em qualquer disputa relacionada a estes termos ou ao uso do TERA, as partes concordam em primeiro tentar uma resolução amigável. Se não houver acordo, a disputa será submetida aos tribunais da Cidade Autônoma de Buenos Aires, Argentina." },
      section12: { title: "Indenização", content: "Você concorda em indenizar e isentar o TERA, seus desenvolvedores, funcionários e colaboradores de qualquer reclamação, dano, perda ou despesa decorrente de seu uso do serviço ou violação destes termos." },
      section13: { title: "Lei Aplicável", content: "Estes Termos são regidos pelas leis da República Argentina." },
      section14: { title: "Contato", content: "Para dúvidas sobre estes Termos e Condições, entre em contato em:", email: "legal@tera.app" }
    }
  }
};

const resources = {
  es: { translation: esTranslations },
  en: { translation: enTranslations },
  pt: { translation: ptTranslations }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
