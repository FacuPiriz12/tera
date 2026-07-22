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
    table: { name: "Nombre", size: "Archivos", date: "Fecha" },
    forgotPassword: {
      successTitle: "Correo enviado",
      successDesc: "Revisá tu bandeja de entrada para restablecer tu contraseña",
      backToLogin: "Volver al inicio de sesión"
    },
    notifications: {
      copyOperation: "Operación de copia",
      files: "archivos",
      transfers: "Transferencias",
      seeAll: "Ver todas",
      empty: "Sin notificaciones",
      seeHistory: "Ver historial completo",
      statusCompleted: "Completada",
      statusFailed: "Falló",
      statusInProgress: "En progreso"
    },
    bottomNav: {
      home: "Inicio",
      explorer: "Explorador",
      operations: "Operaciones",
      integrations: "Integrar",
      analytics: "Stats"
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
    title: "Mis Archivos", searchPlaceholder: "Buscar archivos...", noFilesFound: "No se encontraron archivos",
    noFilesCopied: "Aún no copiaste ningún archivo", tryDifferentSearch: "Intentá con otra búsqueda",
    filesWillAppearHere: "Tus archivos transferidos aparecerán acá",
    showing: "Mostrando", to: "a", of: "de", files: "archivos", previous: "Anterior", next: "Siguiente",
    subtitle: "Archivos y Carpetas", all: "Todos",
    filterDropbox: "Los archivos y carpetas de Dropbox aparecerán aquí.",
    filterGoogle: "Los archivos y carpetas de Google Drive aparecerán aquí.",
    copied: "Copiado", copiedSuccessfully: "Copiado exitosamente",
    linkCopied: "Enlace copiado", linkCopiedDesc: "El enlace se ha copiado al portapapeles",
    viewDetails: "Ver detalles", openIn: "Abrir en {{provider}}", download: "Descargar",
    copyLink: "Copiar enlace", share: "Compartir", storedIn: "Almacenado en {{provider}}",
    fullName: "Nombre completo", size: "Tamaño", type: "Tipo", copyDate: "Fecha de copia",
    fileTypes: { file: "Archivo", folder: "Carpeta", image: "Imagen", video: "Video", audio: "Audio", pdf: "PDF", spreadsheet: "Hoja de cálculo", document: "Documento", archive: "Archivo comprimido" }
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
    noDataTitle: "Sin datos aún", noDataMessage: "Realizá transferencias para ver tus estadísticas",
    connectAccounts: "Conectar cuentas", exploreFiles: "Explorar archivos"
  },
  pages: {
    cloudExplorer: {
      title: "Explorador Multi-nube", subtitle: "Arrastrá archivos entre tus nubes",
      syncMode: "Modo de transferencia", cumulative: "Acumular", cumulativeDesc: "Agrega archivos sin eliminar los existentes",
      mirror: "Reemplazar", mirrorDesc: "Reemplaza archivos con el mismo nombre", syncDesc: "Seleccioná el modo antes de transferir",
      dropToTransfer: "Soltar para transferir", search: "Buscar...", root: "Raíz",
      notConnected: "{{provider}} no conectado", connectAccount: "Conectá tu cuenta para explorar y transferir archivos",
      goToIntegrations: "Ir a Integraciones →", loadError: "Error al cargar los archivos", retry: "Reintentar",
      noResults: "Sin resultados", emptyFolder: "Carpeta vacía", folder: "Carpeta",
      cancel: "Cancelar", transfer: "Transferir",
      continueBtn: "Continuar", chooseDestination: "Elegí dónde enviar {{count}} archivo(s)", sendHere: "Enviar aquí", backBtn: "Atrás",
      sameProvider: "Mismo proveedor", sameProviderDesc: "Arrastrá al panel del otro proveedor para transferir.",
      fileQueued: "\"{{name}}\" está en cola.", filesQueued: "{{count}} archivos en cola hacia {{provider}}.",
      transferError: "Error al iniciar transferencia", transferErrorDesc: "No se pudo iniciar la transferencia.",
      filesSelected: "{{count}} archivos seleccionados", countFiles: "{{count}} archivos",
      skip: "Saltear existentes", skipDesc: "Copia solo archivos nuevos, no sobreescribe",
      copyWithSuffix: "Copiar con nuevo nombre", copyWithSuffixDesc: "Si ya existe, crea una copia con sufijo (_1, _2…)",
      replace: "Reemplazar", replaceDesc: "Sobreescribe el archivo existente con el mismo nombre",
      transferring: "Iniciando transferencia...", dragHint: "Soltá \"{{name}}\" en el otro panel para transferir",
      s3NoBucket: "Seleccioná un bucket S3 primero", s3NoBucketDesc: "Navegá dentro de un bucket en el panel de destino antes de transferir.",
      filesTransferred: "archivos transferidos", of: "de", downloading: "Descargando", uploading: "Subiendo"
    },
    integrations: {
      title: "Integraciones", subtitle: "Conectá tus servicios de almacenamiento",
      reconnectBannerTitle: "Reconectá Google Drive.", reconnectBannerDesc: "Actualizamos los permisos de Google Drive para mayor seguridad. Por favor desconectá y volvé a conectar tu cuenta para seguir usando el Cloud Explorer.",
      personalStorage: "Almacenamiento personal", googleDriveDesc: "Almacenamiento en la nube de Google con colaboración en tiempo real",
      dropboxDesc: "Almacenamiento en la nube con sincronización y uso compartido sencillo",
      features: "Funcionalidades", autoSync: "Sincronización automática", sharedFolders: "Carpetas compartidas",
      permissions: "Control de permisos", maxSupport: "Archivos hasta 5TB", perFile: "por archivo",
      collabAndFiles: "Colaboración y archivos", realTimeCollab: "Colaboración en tiempo real",
      versionHistory: "Historial de versiones", secureLinks: "Links de compartición seguros",
      comingSoonTitle: "Próximamente", comingSoonSubtitle: "Estamos trabajando en nuevas integraciones",
      requestBtn: "Solicitar integración", requestDesc: "¿No ves tu servicio? Podés solicitarlo",
      microsoftStorage: "Almacenamiento Microsoft", onedriveDesc: "Conecta tu cuenta de Microsoft OneDrive para acceder y sincronizar archivos desde la nube de Microsoft.",
      microsoftIntegration: "Integración con Microsoft 365", enterpriseStorage: "Almacenamiento Empresarial",
      boxDesc: "Conecta tu cuenta de Box para gestionar archivos empresariales con seguridad avanzada y colaboración en equipo.",
      enterpriseSecurity: "Seguridad empresarial avanzada", complianceTools: "Herramientas de cumplimiento",
      cloudInfrastructure: "Infraestructura Cloud", s3Desc: "Conecta tus buckets de Amazon S3 para acceder y transferir archivos desde la infraestructura cloud de AWS.",
      infiniteStorage: "Almacenamiento ilimitado", globalRegions: "Múltiples regiones globales",
      s3Compatible: "Compatible con Wasabi y Backblaze B2",
      connect: "Conectar", connected: "Conectado", disconnect: "Desconectar",
      reconnect: "Reconectar", disconnected: "Desconectado", tokenExpired: "Token expirado",
      verifying: "Verificando...", cancel: "Cancelar",
      connectSuccess: "¡Conectado exitosamente!", connectSuccessDesc: "Tu cuenta de {{provider}} ha sido conectada.",
      connectError: "Error de conexión", connectErrorDesc: "No se pudo conectar tu cuenta de {{provider}}. Intentá de nuevo.",
      disconnectSuccess: "Cuenta desconectada", disconnectSuccessDesc: "Tu cuenta de {{provider}} ha sido desconectada.",
      tooltipConnected: "{{provider}} conectado", tooltipExpired: "Token expirado — reconectar necesario",
      tooltipConnect: "Conectar {{provider}}", disconnectTitle: "¿Desconectar {{provider}}?",
      disconnectDesc: "Esto eliminará el acceso a tu cuenta de {{provider}}. No podrás copiar archivos hasta que vuelvas a conectar.",
      s3DialogDesc: "Ingresá tus credenciales de AWS IAM. Necesitás un usuario con permisos de S3.",
      s3Region: "Región", s3InvalidCredentials: "Credenciales inválidas."
    },
    tasks: {
      title: "Tareas Programadas",
      subtitle: "Programa copias automáticas de archivos entre servicios en la nube",
      taskCount: "{{count}}/{{limit}} tareas",
      requiresPro: "Requiere Pro",
      limitReached: "Límite alcanzado",
      newTask: "Nueva tarea",
      upgradeToPro: "Actualizar a Pro para crear tareas",
      createFirstTask: "Crear primera tarea",
      createTask: "Crear tarea",
      saveChanges: "Guardar cambios",
      emptyTitle: "No hay tareas programadas",
      emptyDesc: "Crea una tarea para copiar archivos automáticamente entre servicios en la nube según tu horario preferido.",
      createTitle: "Crear tarea programada",
      createDesc: "Configura una copia automática de archivos entre servicios",
      editTitle: "Editar tarea",
      editDesc: "Modifica la configuración de la tarea programada",
      versionHistoryTitle: "Historial de Versiones",
      versionHistoryDesc: "Explora las versiones anteriores y restaura cambios.",
      selectiveSyncTitle: "Sincronización Selectiva",
      selectiveSyncDesc: "Selecciona qué carpetas deseas sincronizar o excluir",
      form: {
        taskName: "Nombre de la tarea *",
        taskNamePlaceholder: "Ej: Backup diario de documentos",
        description: "Descripción",
        descriptionPlaceholder: "Descripción opcional de la tarea",
        operationType: "Tipo de operación",
        syncMode: "Modo de sincronización",
        selectiveSync: "Sincronización Selectiva",
        configFolders: "Configurar carpetas",
        foldersSelected: "✓ {{count}} carpetas seleccionadas",
        syncingAll: "Sincronizando todo el contenido (por defecto)",
        source: "Origen",
        destination: "Destino",
        sourceFolder: "Carpeta de origen *",
        destFolder: "Carpeta de destino",
        sourcePlaceholder: "Seleccionar carpeta de origen...",
        destPlaceholder: "Seleccionar carpeta de destino...",
        schedule: "Programación",
        frequency: "Frecuencia",
        selectDays: "Selecciona los días",
        atLeastOneDay: "Selecciona al menos un día",
        dayOfWeek: "Día de la semana",
        dayOfMonth: "Día del mes",
        dayN: "Día {{n}}",
        hour: "Hora (0-23)",
        minute: "Minuto",
        skipDuplicates: "Omitir duplicados",
        skipDuplicatesDesc: "No copiar archivos que ya existen",
        notifyComplete: "Notificar al completar",
        notifyCompleteDesc: "Enviar notificación cuando termine",
        notifyErrors: "Notificar errores",
        notifyErrorsDesc: "Enviar notificación si hay errores",
        selectiveSyncTip: "💡 Tip: Con Sincronización Selectiva, solo sincronizarás las carpetas que elijas, ahorrando tiempo y espacio.",
        cumulativeHint: "✓ Solo copia archivos nuevos o modificados\n✓ Ahorra ancho de banda\n⚠️ Los archivos que borres en origen seguirán en destino",
        mirrorHint: "↔️ Sincronización bidireccional automática\n✓ Cambios en Drive se reflejan en Dropbox y viceversa\n⚠️ Puede detectar y resolver conflictos\n⏰ Se ejecuta en el horario programado",
        myDrive: "Mi unidad",
      },
      status: {
        active: "Activa", paused: "Pausada", deleted: "Eliminada",
        success: "Exitosa", failed: "Fallida", running: "En progreso",
      },
      actions: {
        runNow: "Ejecutar ahora", pause: "Pausar", resume: "Reanudar",
        versionHistory: "Ver historial de versiones", manageConflicts: "Gestionar conflictos",
        edit: "Editar", delete: "Eliminar",
      },
      card: {
        schedule: "Programación", nextRun: "Próxima ejecución", lastRun: "Última ejecución",
        stats: "Estadísticas", statsValue: "{{success}} exitosas / {{failed}} fallidas", lastError: "Último error",
      },
      toast: {
        created: "Tarea creada", createdDesc: "La tarea programada se ha creado correctamente.",
        updated: "Tarea actualizada", updatedDesc: "Los cambios se han guardado correctamente.",
        deleted: "Tarea eliminada", deletedDesc: "La tarea ha sido eliminada.",
        paused: "Tarea pausada", pausedDesc: "La tarea ha sido pausada.",
        resumed: "Tarea reanudada", resumedDesc: "La tarea se ejecutará según lo programado.",
        running: "Ejecutando", runningDesc: "La tarea se está ejecutando ahora.",
        errorCreate: "No se pudo crear la tarea.", errorUpdate: "No se pudo actualizar la tarea.",
        errorDelete: "No se pudo eliminar la tarea.", errorPause: "No se pudo pausar la tarea.",
        errorResume: "No se pudo reanudar la tarea.", errorRun: "No se pudo ejecutar la tarea.",
        proRequired: "Función exclusiva Pro", proRequiredDesc: "Las tareas programadas requieren un plan Pro o Business.",
        limitReached: "Límite de tareas alcanzado",
        limitReachedDesc: "Tu plan Pro permite hasta {{limit}} tareas. Actualizá a Business para tener tareas ilimitadas.",
        validationError: "Nombre y URL de origen son obligatorios.",
        errorLoadFolders: "No se pudieron cargar las carpetas",
        savedSelection: "Guardado", savedSelectionDesc: "La configuración de sincronización selectiva se ha actualizado.",
        errorSaveSelection: "No se pudieron guardar los cambios",
      },
      schedule: {
        hourly: "Cada hora, al minuto {{minute}}", daily: "Todos los días a las {{time}}",
        weekly: "Cada {{day}} a las {{time}}", monthly: "El día {{dayOfMonth}} de cada mes a las {{time}}",
        custom: "{{days}} a las {{time}}", default: "Programado a las {{time}}", never: "Nunca",
      },
      days: { "0": "Domingo", "1": "Lunes", "2": "Martes", "3": "Miércoles", "4": "Jueves", "5": "Viernes", "6": "Sábado" },
      freq: { hourly: "Cada hora", daily: "Diario", weekly: "Semanal", monthly: "Mensual", custom: "Días específicos" },
      ops: {
        copy: { label: "Copiar", description: "Copia archivos dentro del mismo proveedor" },
        transfer: { label: "Transferir", description: "Transfiere archivos entre proveedores (Drive ↔ Dropbox)" },
      },
      syncModes: {
        copy: { label: "Copia simple", description: "Copia todos los archivos cada vez que se ejecuta" },
        cumulative_sync: { label: "Sincronización acumulativa", description: "Solo copia archivos nuevos o modificados desde la última sincronización" },
        mirror_sync: { label: "Espejo bidireccional (Mirror Sync)", description: "Sincronización automática en ambas direcciones. Los cambios en cualquier lado se reflejan al otro" },
      },
      selectiveSync: {
        loading: "Cargando carpetas...", noFolders: "No hay carpetas disponibles para sincronización selectiva",
        retry: "Intentar de nuevo", hint: "📌 Arrastra carpetas a las zonas de abajo, o usa los controles",
        sortName: "Nombre", sortSize: "Tamaño",
        includeZone: "✓ Sincronizar ({{count}})", excludeZone: "✗ Omitir ({{count}})",
        saveBtn: "Guardar selección",
      },
    },
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
    noAccountConnected: "No hay cuentas conectadas", integrations: "Integraciones",
    toStartWorking: "para empezar a trabajar", totalFiles: "Archivos Totales", filesManaged: "Archivos Gestionados",
    activeOperations: "Operaciones Activas", inProgress: "En Progreso", totalOperations: "Operaciones Totales",
    operationsPerformed: "Operaciones Realizadas", completedOperations: "Operaciones Completadas",
    successfully: "Exitosamente", recentFiles: "Archivos Recientes", noRecentFiles: "No hay archivos recientes",
    addedOn: "Agregado el", connectInstruction: "Conecta una cuenta para empezar a gestionar tus archivos.",
    categories: { documents: "Documentos", images: "Imágenes", media: "Multimedia", others: "Otros" },
    title: "Mi Unidad", quickAccess: "Acceso Rápido", recentTransfers: "Transferencias Recientes",
    onboarding: { badge: "Primeros pasos", title: "¡Bienvenido a TERA!", desc: "Conectá tus cuentas de Google Drive, Dropbox, OneDrive, Box y más, y empezá a mover archivos entre tus nubes en segundos.", connectBtn: "Conectar cuentas", exploreBtn: "Explorar archivos", quickTransfer: "Transferencia rápida" },
    stats: { completed: "Completadas", inProgress: "En progreso", failed: "Fallidas", files: "Archivos transferidos" },
    actions: { explorer: "Explorador", explorerDesc: "Mover archivos entre nubes", operations: "Operaciones", operationsDesc: "Historial de transferencias", integrations: "Integraciones", integrationsDesc: "Conectar cuentas externas", analytics: "Analytics", analyticsDesc: "Ver estadísticas detalladas" },
    empty: { noTransfers: "Todavía no hay transferencias", startTransfer: "Empezar a transferir" },
    table: { status: "Estado", files: "archivos" },
    status: { completed: "Completada", failed: "Fallida", inProgress: "En curso", pending: "Pendiente" },
    performance: { title: "Rendimiento general", successRate: "Tasa de éxito", completed: "completadas", total: "totales", viewAnalytics: "Ver analytics completo" }
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
    nav: {
      howItWorks: "Cómo funciona",
      features: "Funcionalidades",
      pricing: "Precios",
      security: "Seguridad",
      login: "Iniciar sesión",
      startFree: "Empieza gratis"
    },
    hero: {
      badge: "Conectá tus nubes en segundos",
      title: "Mueve tus archivos entre nubes",
      highlight: "sin fricción",
      description: "TERA conecta tus servicios en la nube para transferir, sincronizar y respaldar tus archivos de forma automática. Sin descargas. Sin complicaciones.",
      cta: "Empieza gratis hoy",
      howItWorks: "Cómo funciona",
      noCard: "Sin tarjeta de crédito",
      encryption: "Cifrado AES-256",
      instantTransfer: "Transferencia inmediata"
    },
    dragdrop: {
      badge: "Nueva funcionalidad",
      title: "Arrastrá y soltá.",
      highlight: "Así de simple.",
      description: "En el explorador de archivos de TERA podés ver tus nubes lado a lado y arrastrar archivos directamente de una a otra. Sin formularios, sin pasos extra — solo arrastrás y listo.",
      f1: "Dos paneles simultáneos: origen y destino",
      f2: "Arrastrá archivos individuales o seleccioná varios",
      f3: "La transferencia empieza al instante",
      f4: "Compatible con carpetas y múltiples formatos",
      cta: "Probarlo gratis"
    },
    integrations: {
      label: "Integraciones disponibles",
      comingSoon: "+ más próximamente"
    },
    howItWorks: {
      label: "Proceso",
      title: "Tres pasos. Listo.",
      step1Title: "Conectá tus cuentas",
      step1Desc: "Vinculá tu Google Drive y Dropbox en segundos con OAuth seguro. Sin contraseñas almacenadas.",
      step2Title: "Configurá la transferencia",
      step2Desc: "Pegá un link de Drive o Dropbox, elegí el destino y personalizá las opciones.",
      step3Title: "TERA lo hace por vos",
      step3Desc: "La transferencia corre en la nube. Recibís un email cuando termina y el historial queda guardado."
    },
    features: {
      label: "Funcionalidades",
      title: "Todo lo que necesitás, nada que no",
      description: "Diseñado para hacer una cosa muy bien: mover archivos entre nubes sin que tengas que pensar en ello.",
      f1Title: "Transferencias Multi-nube",
      f1Desc: "Copia archivos y carpetas enteras entre tus servicios en la nube con un solo clic. Sin descargar nada a tu equipo.",
      f2Title: "Sincronización Automática",
      f2Desc: "Programá tareas para que tus carpetas se mantengan sincronizadas entre tus nubes. Diario, semanal o cuando vos quieras.",
      f3Title: "Historial de Versiones",
      f3Desc: "Cada archivo transferido queda registrado con su versión. Restaurá cualquier estado anterior en segundos.",
      f4Title: "Share Inbox",
      f4Desc: "Recibí archivos compartidos de cualquier persona y mandalos directamente a tu nube favorita, sin intermediarios.",
      f5Title: "Notificaciones por Email",
      f5Desc: "Te avisamos cuando una transferencia termina, falla o necesita tu atención. Nunca te pierdas nada.",
      f6Title: "Tokens Cifrados AES-256",
      f6Desc: "Tus credenciales de Google Drive y Dropbox se almacenan con cifrado AES-256-GCM. Nadie más tiene acceso."
    },
    tasks: {
      badge: "Sincronización automática · PRO",
      title: "Configuralo una vez.",
      highlight: "Olvidate.",
      description: "Creá tareas programadas para que TERA sincronice tus carpetas automáticamente. Diario, semanal, o el horario que elijas. Los archivos nuevos o modificados se transfieren solos.",
      f1: "Sincronización incremental (solo lo que cambió)",
      f2: "Detección de archivos nuevos y modificados",
      f3: "Notificación por email al completar o si hay errores",
      f4: "Historial de cada ejecución con estadísticas",
      cta: "Crear mi primera tarea"
    },
    security: {
      label: "Seguridad",
      title: "Tus archivos son tuyos. Nosotros solo los movemos.",
      description: "TERA actúa como intermediario autorizado entre tus nubes. Nunca almacenamos el contenido de tus archivos — solo ejecutamos las operaciones que vos configurás.",
      card1Title: "AES-256-GCM",
      card1Desc: "Tus credenciales de acceso se cifran con el estándar de nivel militar antes de guardarse.",
      card2Title: "OAuth Seguro",
      card2Desc: "Nunca almacenamos tu usuario ni contraseña. Solo tokens OAuth con los permisos mínimos necesarios.",
      card3Title: "Registro de operaciones",
      card3Desc: "Cada transferencia queda registrada con fecha, origen, destino y resultado.",
      card4Title: "Permisos mínimos",
      card4Desc: "TERA solicita solo los permisos estrictamente necesarios para operar en tus cuentas.",
      p1: "Tokens OAuth cifrados con AES-256-GCM",
      p2: "Conexión HTTPS en toda la plataforma",
      p3: "Nunca guardamos el contenido de tus archivos",
      p4: "Podés revocar el acceso en cualquier momento"
    },
    pricing: {
      label: "Planes",
      title: "Simple y transparente",
      description: "Empieza gratis. Pagá solo cuando lo necesites.",
      forever: "para siempre",
      perMonth: "por mes",
      popular: "Más popular",
      bestValue: "Mayor valor",
      ctaFree: "Empezar gratis",
      ctaPro: "Comenzar Pro",
      ctaBiz: "Comenzar Business",
      viewMore: "¿Necesitás más detalles?",
      viewAllPlans: "Ver planes completos →",
      freeF1: "5 GB tráfico cross-cloud/mes",
      freeF2: "20 transferencias por mes",
      freeF3: "100 MB máximo por archivo",
      freeF4: "Google Drive + Dropbox",
      proF1: "200 GB tráfico cross-cloud/mes",
      proF2: "300 transferencias por mes",
      proF3: "5 GB máximo por archivo",
      proF4: "5 servicios conectados",
      proF5: "5 tareas programadas",
      proF6: "Analytics + notificaciones email",
      bizF1: "2 TB tráfico cross-cloud/mes",
      bizF2: "Transferencias ilimitadas",
      bizF3: "50 GB máximo por archivo",
      bizF4: "Servicios y tareas ilimitados",
    },
    cta: {
      title: "Tus archivos merecen un mejor flujo.",
      description: "Empezá gratis hoy. Sin tarjeta de crédito. Conectá tus cuentas y hacé tu primera transferencia en menos de 2 minutos.",
      button: "Crear cuenta gratis"
    },
    footer: {
      description: "La forma más simple de mover y sincronizar archivos entre tus servicios en la nube.",
      platform: "Plataforma",
      legal: "Legal",
      privacy: "Privacidad",
      terms: "Términos",
      rights: "© 2026 TERA. Todos los derechos reservados.",
      operational: "Sistemas operativos"
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
  },
  pricingPage: {
    nav: { products: "Productos", pricing: "Precios", security: "Seguridad", goToApp: "Ir a la app", signIn: "Iniciar sesión", startFree: "Comenzar gratis" },
    hero: { badge: "Planes y Precios", title: "Simple y transparente", subtitle: "Empieza gratis. Pagá solo cuando realmente lo necesites." },
    toggle: { monthly: "Mensual", annual: "Anual" },
    perMonth: "/mes",
    freeForever: "Gratis para siempre",
    billedAnnual: "Facturado {{sym}}{{total}}/año · ahorrás {{sym}}{{savings}}",
    loginRequired: { title: "Necesitás una cuenta", desc: "Creá tu cuenta gratis para continuar con la compra." },
    plans: {
      free: { tagline: "Para empezar sin costo", cta: "Empezar gratis", f1: "5 GB tráfico cross-cloud/mes", f2: "20 transferencias/mes", f3: "100 MB máximo por archivo", f4: "2 servicios conectados", f5: "Google Drive + Dropbox", f6: "7 días de historial", f7: "Tareas programadas", f8: "Analytics", f9: "Notificaciones por email" },
      pro: { tagline: "Para uso regular y profesional", cta: "Comenzar Pro", badge: "Más popular", f1: "200 GB tráfico cross-cloud/mes", f2: "300 transferencias/mes", f3: "5 GB máximo por archivo", f4: "5 servicios conectados", f5: "Todos los proveedores (OneDrive, Box, S3…)", f6: "90 días de historial", f7: "5 tareas programadas", f8: "Analytics básico", f9: "Notificaciones por email", f10: "Soporte prioritario 24h" },
      business: { tagline: "Para uso intensivo", cta: "Comenzar Business", badge: "Mayor valor", f1: "2 TB tráfico cross-cloud/mes", f2: "Transferencias ilimitadas", f3: "50 GB máximo por archivo", f4: "Servicios ilimitados", f5: "Todos los proveedores", f6: "Historial completo", f7: "Tareas programadas ilimitadas", f8: "Analytics avanzado + versioning", f9: "Notificaciones por email", f10: "Soporte prioritario 4h" }
    },
    traffic: { title: "¿Qué es el tráfico cross-cloud?", text: "Cuando transferís un archivo entre servicios distintos (ej: Google Drive → Dropbox), los datos pasan por nuestros servidores — eso consume tráfico. Si movés archivos dentro del mismo servicio (Drive→Drive), el tráfico es siempre ilimitado y gratis." },
    trust: { encrypted: "Datos cifrados", encryptedSub: "AES-256-GCM", cancel: "Cancela cuando quieras", cancelSub: "Sin permanencia", refund: "Garantía de devolución", refundSub: "14 días", noCard: "Sin tarjeta de crédito", noCardSub: "Para el plan Free" },
    comparison: { label: "Comparación completa", title: "Todo detallado", feature: "Característica", monthlyPrice: "Precio mensual", cat1: "Tráfico y Transferencias", cat2: "Integraciones", cat3: "Automatización", cat4: "Soporte", r1f1: "Tráfico cross-cloud/mes", r1f2: "Transferencias/mes", r1f3: "Máximo por archivo", r1f4: "Same-provider (Drive→Drive)", r2f1: "Servicios conectados", r3f1: "Tareas programadas", r3f2: "Historial de operaciones", r3f3: "Versioning de archivos", r3f4: "Analytics", r4f1: "Notificaciones email", r4f2: "Canal de soporte", r4f3: "Garantía de devolución", unlimited: "Ilimitadas", unlimitedM: "Ilimitados", basic: "Básico", advanced: "Avanzado", complete: "Completo", docs: "Documentación", email24h: "Email (24h)", priority4h: "Prioritario (4h)", tasks5: "5 tareas", days7: "7 días", days90: "90 días" },
    faq: { label: "Preguntas frecuentes", title: "¿Tenés dudas?", q1: "¿Qué es el tráfico cross-cloud?", a1: "Es la cantidad de datos que se transfieren entre servicios de nube distintos (por ejemplo, de Google Drive a Dropbox). Cuando movés archivos dentro del mismo proveedor (Drive→Drive), no consume tráfico y es siempre ilimitado.", q2: "¿Puedo cambiar de plan cuando quiera?", a2: "Sí. Al subir de plan el cambio es inmediato. Al bajarlo, se aplica al terminar el ciclo de facturación actual. Sin penalizaciones ni permanencia.", q3: "¿Qué pasa si supero el tráfico del mes?", a3: "Las transferencias cross-cloud se pausan hasta el próximo ciclo. Las transferencias same-provider (mismo servicio) nunca se ven afectadas. Podés subir de plan en cualquier momento para continuar.", q4: "¿Hay prueba gratuita para Pro o Business?", a4: "El plan Free es permanente y no requiere tarjeta de crédito. Para Pro y Business ofrecemos garantía de devolución de 14 días: si no quedás conforme, te devolvemos el dinero sin preguntas.", q5: "¿Cómo se factura el plan anual?", a5: "Se cobra en un solo pago al inicio del año. Pro anual: $65/año (ahorrás $30 vs mensual). Business anual: $159/año (ahorrás $81 vs mensual)." },
    cta: { title: "Conectá tus nubes hoy", subtitle: "Empieza gratis, sin tarjeta. Tu primera transferencia en menos de 2 minutos.", startFree: "Empezar gratis", compare: "Ver comparación" }
  },
  settingsPage: {
    title: "Configuraciones", subtitle: "Gestioná tu cuenta, plan y preferencias",
    personal: { title: "Información Personal", description: "Actualizá tu nombre y dirección de email", changePic: "Cambiar foto (próximamente)", firstName: "Nombre", lastName: "Apellido", email: "Email", emailVerifyNote: "Requiere verificación al cambiar", editBtn: "Editar información", saveBtn: "Guardar cambios", savingBtn: "Guardando...", cancelBtn: "Cancelar", verifyPending: "Verificación pendiente", verifyDesc: "Enviamos un código de 6 dígitos a", verifyExpiry: "Vence en 10 minutos · Revisá spam si no aparece", confirmBtn: "Confirmar" },
    plan: { title: "Plan y Facturación", description: "Tu plan actual y opciones de actualización", active: "Activo", freeLabel: "Gratis", proPrice: "$7.99 USD/mes", businessPrice: "$19.99 USD/mes", trafficLabel: "Tráfico/mes", transfersLabel: "Transferencias", maxFileLabel: "Archivo máx.", upgradeTitle: "Mejorar plan", proSub: "200 GB · 300 transferencias", perMonth: "/mes", businessSub: "2 TB · Ilimitadas", upgradeToBusinessBtn: "Mejorar a Business", upgradeToBusinessSub: "2 TB · archivos de 50 GB · soporte 4h", viewPlans: "Ver comparación completa de planes", cancelLink: "Cancelar suscripción", cancelTitle: "¿Cancelar suscripción?", cancelDesc: "Tu plan seguirá activo hasta el fin del período actual. Después pasarás al plan Free.", cancelConfirmBtn: "Confirmar cancelación", keepPlanBtn: "Mantener plan", welcomeTitle: "¡Gracias por tu compra!", welcomeDesc: "Ya tenés acceso a todos los beneficios de tu plan {{plan}}:", welcomeCta: "Empezar a usarlo" },
    preferences: { title: "Preferencias", description: "Idioma, notificaciones y apariencia", languageLabel: "Idioma de la interfaz", languageSub: "Cambia el idioma de toda la aplicación", notificationsLabel: "Notificaciones por email", notificationsSub: "Recibir avisos cuando termina una transferencia", darkModeLabel: "Modo oscuro", darkModeSub: "Activar el tema oscuro de la interfaz" },
    password: { title: "Contraseña y Seguridad", description: "Cambiá tu contraseña de acceso", currentLabel: "Contraseña actual", newLabel: "Nueva contraseña", confirmLabel: "Confirmar nueva contraseña", changeBtn: "Cambiar contraseña", changingBtn: "Cambiando...", successMsg: "Contraseña actualizada correctamente", minLength: "Mínimo 8 caracteres", mismatch: "Las contraseñas no coinciden", wrongCurrent: "La contraseña actual es incorrecta" },
    account: { title: "Información de Cuenta", userId: "ID de Usuario", memberSince: "Miembro desde", servicesTitle: "Servicios Conectados", connected: "Conectado", notConnected: "No conectado", manageLink: "Gestionar integraciones →" },
    danger: { title: "Zona Peligrosa", description: "Acciones irreversibles para tu cuenta", deleteLabel: "Eliminar cuenta", deleteSub: "Elimina permanentemente tu cuenta y todos los datos. No se puede deshacer.", deleteBtn: "Eliminar (próximamente)" }
  },
  profilePage: {
    loading: "Cargando perfil...", editProfile: "Editar perfil", connectNow: "conectar ahora", noServices: "Sin servicios conectados ·", memberSince: "Miembro desde",
    activity: { title: "Resumen de Actividad", description: "Estadísticas de tus operaciones en TERA", total: "Totales", completed: "Completadas", failed: "Fallidas", success: "Éxito", successLabel: "Tasa de éxito" },
    recent: { title: "Actividad Reciente", description: "Tus últimas operaciones de transferencia", copyOp: "Operación de copia", viewAll: "Ver todas las operaciones →", empty: "Sin actividad todavía", emptySub: "Empezá copiando archivos para ver tu historial aquí", completedStatus: "Completado", failedStatus: "Falló", inProgress: "En progreso" },
    plan: { title: "Tu Plan", freeLabel: "Gratis", proPrice: "$7.99 USD/mes", businessPrice: "$19.99 USD/mes", upgrade: "Mejorar plan", manage: "Gestionar suscripción" },
    account: { title: "Cuenta", status: "Estado", active: "Activa", userId: "ID de usuario" },
    services: { title: "Servicios", connected: "Conectado", notConnected: "No conectado", manage: "Gestionar integraciones →" },
    quickActions: { title: "Accesos rápidos", operations: "Operaciones", files: "Mis archivos", settings: "Configuraciones" }
  },
  pageTitles: {
    landing: 'TERA — Transferencia Multi-nube',
    login: 'TERA — Iniciar sesión',
    signup: 'TERA — Crear cuenta',
    dashboard: 'TERA — Dashboard',
    explorer: 'TERA — Explorador de archivos',
    integrations: 'TERA — Integraciones',
    operations: 'TERA — Historial de transferencias',
    pricing: 'TERA — Precios',
    quickCopy: 'TERA — Copiar desde URL',
    myFiles: 'TERA — Mis archivos',
    tasks: 'TERA — Tareas programadas',
    terms: 'TERA — Términos de servicio',
    privacy: 'TERA — Política de privacidad',
    forgotPassword: 'TERA — Recuperar contraseña',
  },
  globalTransferIndicator: {
    title: 'Transferencias',
    active: 'activa', actives: 'activas',
    completedBadge: 'completada', completedsBadge: 'completadas',
    noTransfers: 'No hay transferencias',
    viewAll: 'Ver todas', clearCompleted: 'Limpiar completadas',
    more: '+{{count}} más', cancel: 'Cancelar',
    cancelledToast: 'Transferencia cancelada', cancelFailedToast: 'No se pudo cancelar',
  },
  fileUpload: {
    button: 'Subir Archivo', dialogTitle: 'Subir archivo a la nube',
    dialogDesc: 'Selecciona un archivo y elige el destino para guardarlo de forma segura.',
    clickToSelect: 'Haz clic para seleccionar un archivo', maxSize: 'Máximo 100 MB',
    destination: 'Destino de subida',
    connectWarning: 'Asegúrate de haber conectado tu cuenta de {{provider}} primero.',
    uploading: 'Subiendo archivo...', startUpload: 'Comenzar Subida',
    successTitle: 'Archivo subido exitosamente',
    successDesc: 'Tu archivo "{{name}}" se ha subido a {{provider}}.',
    errorTitle: 'Error al subir archivo', errorDesc: 'Algo salió mal durante la carga.',
    tooLargeTitle: 'Archivo demasiado grande', tooLargeDesc: 'El archivo no debe exceder 100 MB.',
  },
  globalSearch: {
    placeholder: 'Buscar en todas tus nubes...', hint: 'Escribí al menos 2 caracteres para buscar',
    noResults: 'Sin resultados para', noIndex: 'Sin índice — búsqueda en tiempo real',
    indexed: 'Índice:', buildIndex: 'Construir índice', refreshIndex: 'Actualizar índice',
  },
};

const enTranslations = {
  welcomeMessages: ["Welcome back!", "Hello again!", "Nice to see you", "Good to have you back!", "Ready to continue?", "Let's go! 🚀"],
  sidebar: { storage: "Storage" },
  myFiles: {
    title: "My Files", searchPlaceholder: "Search files...", noFilesFound: "No files found",
    noFilesCopied: "No files transferred yet", tryDifferentSearch: "Try a different search",
    filesWillAppearHere: "Your transferred files will appear here",
    showing: "Showing", to: "to", of: "of", files: "files", previous: "Previous", next: "Next",
    subtitle: "Files and Folders", all: "All",
    filterDropbox: "Your Dropbox files and folders will appear here.",
    filterGoogle: "Your Google Drive files and folders will appear here.",
    copied: "Copied", copiedSuccessfully: "Copied successfully",
    linkCopied: "Link copied", linkCopiedDesc: "The link has been copied to clipboard",
    viewDetails: "View details", openIn: "Open in {{provider}}", download: "Download",
    copyLink: "Copy link", share: "Share", storedIn: "Stored in {{provider}}",
    fullName: "Full name", size: "Size", type: "Type", copyDate: "Copy date",
    fileTypes: { file: "File", folder: "Folder", image: "Image", video: "Video", audio: "Audio", pdf: "PDF", spreadsheet: "Spreadsheet", document: "Document", archive: "Archive" }
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
    noDataTitle: "No data yet", noDataMessage: "Make transfers to see your statistics",
    connectAccounts: "Connect accounts", exploreFiles: "Explore files"
  },
  pages: {
    cloudExplorer: {
      title: "Multi-cloud Explorer", subtitle: "Drag files between your clouds",
      syncMode: "Transfer mode", cumulative: "Accumulate", cumulativeDesc: "Add files without removing existing ones",
      mirror: "Replace", mirrorDesc: "Replace files with the same name", syncDesc: "Select a mode before transferring",
      dropToTransfer: "Drop to transfer", search: "Search...", root: "Root",
      notConnected: "{{provider}} not connected", connectAccount: "Connect your account to explore and transfer files",
      goToIntegrations: "Go to Integrations →", loadError: "Error loading files", retry: "Retry",
      noResults: "No results", emptyFolder: "Empty folder", folder: "Folder",
      cancel: "Cancel", transfer: "Transfer",
      continueBtn: "Continue", chooseDestination: "Choose where to send {{count}} file(s)", sendHere: "Send here", backBtn: "Back",
      sameProvider: "Same provider", sameProviderDesc: "Drag to the other provider panel to transfer.",
      fileQueued: "\"{{name}}\" is queued.", filesQueued: "{{count}} files queued to {{provider}}.",
      transferError: "Error starting transfer", transferErrorDesc: "Could not start the transfer.",
      filesSelected: "{{count}} files selected", countFiles: "{{count}} files",
      skip: "Skip existing", skipDesc: "Copies only new files, doesn't overwrite",
      copyWithSuffix: "Copy with new name", copyWithSuffixDesc: "If it exists, creates a copy with suffix (_1, _2…)",
      replace: "Replace", replaceDesc: "Overwrites the existing file with the same name",
      transferring: "Starting transfer...", dragHint: "Drop \"{{name}}\" on the other panel to transfer",
      s3NoBucket: "Select an S3 bucket first", s3NoBucketDesc: "Navigate inside a bucket in the destination panel before transferring.",
      filesTransferred: "files transferred", of: "of", downloading: "Downloading", uploading: "Uploading"
    },
    integrations: {
      title: "Integrations", subtitle: "Connect your storage services",
      reconnectBannerTitle: "Reconnect Google Drive.", reconnectBannerDesc: "We updated Google Drive permissions for better security. Please disconnect and reconnect your account to continue using the Cloud Explorer.",
      personalStorage: "Personal storage", googleDriveDesc: "Google cloud storage with real-time collaboration",
      dropboxDesc: "Cloud storage with easy sync and sharing", features: "Features",
      autoSync: "Auto sync", sharedFolders: "Shared folders", permissions: "Permission control",
      maxSupport: "Files up to 5TB", perFile: "per file", collabAndFiles: "Collaboration & files",
      realTimeCollab: "Real-time collaboration", versionHistory: "Version history",
      secureLinks: "Secure sharing links", comingSoonTitle: "Coming Soon",
      comingSoonSubtitle: "We are working on new integrations",
      requestBtn: "Request integration", requestDesc: "Don't see your service? You can request it",
      microsoftStorage: "Microsoft Storage", onedriveDesc: "Connect your Microsoft OneDrive account to access and sync files from Microsoft's cloud.",
      microsoftIntegration: "Microsoft 365 Integration", enterpriseStorage: "Enterprise Storage",
      boxDesc: "Connect your Box account to manage enterprise files with advanced security and team collaboration.",
      enterpriseSecurity: "Advanced enterprise security", complianceTools: "Compliance tools",
      cloudInfrastructure: "Cloud Infrastructure", s3Desc: "Connect your Amazon S3 buckets to access and transfer files from AWS cloud infrastructure.",
      infiniteStorage: "Unlimited storage", globalRegions: "Multiple global regions",
      s3Compatible: "Compatible with Wasabi and Backblaze B2",
      connect: "Connect", connected: "Connected", disconnect: "Disconnect",
      reconnect: "Reconnect", disconnected: "Disconnected", tokenExpired: "Token expired",
      verifying: "Verifying...", cancel: "Cancel",
      connectSuccess: "Successfully connected!", connectSuccessDesc: "Your {{provider}} account has been connected.",
      connectError: "Connection error", connectErrorDesc: "Could not connect your {{provider}} account. Try again.",
      disconnectSuccess: "Account disconnected", disconnectSuccessDesc: "Your {{provider}} account has been disconnected.",
      tooltipConnected: "{{provider}} connected", tooltipExpired: "Token expired — reconnect required",
      tooltipConnect: "Connect {{provider}}", disconnectTitle: "Disconnect {{provider}}?",
      disconnectDesc: "This will remove access to your {{provider}} account. You won't be able to copy files until you reconnect.",
      s3DialogDesc: "Enter your AWS IAM credentials. You need a user with S3 permissions.",
      s3Region: "Region", s3InvalidCredentials: "Invalid credentials."
    },
    tasks: {
      title: "Scheduled Tasks",
      subtitle: "Schedule automatic file copies between cloud services",
      taskCount: "{{count}}/{{limit}} tasks",
      requiresPro: "Requires Pro",
      limitReached: "Limit reached",
      newTask: "New task",
      upgradeToPro: "Upgrade to Pro to create tasks",
      createFirstTask: "Create first task",
      createTask: "Create task",
      saveChanges: "Save changes",
      emptyTitle: "No scheduled tasks",
      emptyDesc: "Create a task to automatically copy files between cloud services on your preferred schedule.",
      createTitle: "Create scheduled task",
      createDesc: "Set up an automatic file copy between services",
      editTitle: "Edit task",
      editDesc: "Modify the scheduled task configuration",
      versionHistoryTitle: "Version History",
      versionHistoryDesc: "Explore previous versions and restore changes.",
      selectiveSyncTitle: "Selective Sync",
      selectiveSyncDesc: "Select which folders to sync or exclude",
      form: {
        taskName: "Task name *",
        taskNamePlaceholder: "E.g.: Daily document backup",
        description: "Description",
        descriptionPlaceholder: "Optional task description",
        operationType: "Operation type",
        syncMode: "Sync mode",
        selectiveSync: "Selective Sync",
        configFolders: "Configure folders",
        foldersSelected: "✓ {{count}} folders selected",
        syncingAll: "Syncing all content (default)",
        source: "Source",
        destination: "Destination",
        sourceFolder: "Source folder *",
        destFolder: "Destination folder",
        sourcePlaceholder: "Select source folder...",
        destPlaceholder: "Select destination folder...",
        schedule: "Schedule",
        frequency: "Frequency",
        selectDays: "Select days",
        atLeastOneDay: "Select at least one day",
        dayOfWeek: "Day of week",
        dayOfMonth: "Day of month",
        dayN: "Day {{n}}",
        hour: "Hour (0-23)",
        minute: "Minute",
        skipDuplicates: "Skip duplicates",
        skipDuplicatesDesc: "Don't copy files that already exist",
        notifyComplete: "Notify on complete",
        notifyCompleteDesc: "Send notification when done",
        notifyErrors: "Notify on errors",
        notifyErrorsDesc: "Send notification if there are errors",
        selectiveSyncTip: "💡 Tip: With Selective Sync, only the folders you choose will be synced, saving time and space.",
        cumulativeHint: "✓ Only copies new or modified files\n✓ Saves bandwidth\n⚠️ Files deleted in source will remain in destination",
        mirrorHint: "↔️ Automatic bidirectional sync\n✓ Changes in Drive are reflected in Dropbox and vice versa\n⚠️ Can detect and resolve conflicts\n⏰ Runs on the scheduled time",
        myDrive: "My Drive",
      },
      status: {
        active: "Active", paused: "Paused", deleted: "Deleted",
        success: "Successful", failed: "Failed", running: "In progress",
      },
      actions: {
        runNow: "Run now", pause: "Pause", resume: "Resume",
        versionHistory: "View version history", manageConflicts: "Manage conflicts",
        edit: "Edit", delete: "Delete",
      },
      card: {
        schedule: "Schedule", nextRun: "Next run", lastRun: "Last run",
        stats: "Statistics", statsValue: "{{success}} successful / {{failed}} failed", lastError: "Last error",
      },
      toast: {
        created: "Task created", createdDesc: "The scheduled task has been created successfully.",
        updated: "Task updated", updatedDesc: "Changes have been saved successfully.",
        deleted: "Task deleted", deletedDesc: "The task has been deleted.",
        paused: "Task paused", pausedDesc: "The task has been paused.",
        resumed: "Task resumed", resumedDesc: "The task will run as scheduled.",
        running: "Running", runningDesc: "The task is running now.",
        errorCreate: "Could not create the task.", errorUpdate: "Could not update the task.",
        errorDelete: "Could not delete the task.", errorPause: "Could not pause the task.",
        errorResume: "Could not resume the task.", errorRun: "Could not run the task.",
        proRequired: "Pro feature", proRequiredDesc: "Scheduled tasks require a Pro or Business plan.",
        limitReached: "Task limit reached",
        limitReachedDesc: "Your Pro plan allows up to {{limit}} tasks. Upgrade to Business for unlimited tasks.",
        validationError: "Task name and source URL are required.",
        errorLoadFolders: "Could not load folders",
        savedSelection: "Saved", savedSelectionDesc: "Selective sync settings have been updated.",
        errorSaveSelection: "Could not save changes",
      },
      schedule: {
        hourly: "Every hour, at minute {{minute}}", daily: "Every day at {{time}}",
        weekly: "Every {{day}} at {{time}}", monthly: "On day {{dayOfMonth}} of each month at {{time}}",
        custom: "{{days}} at {{time}}", default: "Scheduled at {{time}}", never: "Never",
      },
      days: { "0": "Sunday", "1": "Monday", "2": "Tuesday", "3": "Wednesday", "4": "Thursday", "5": "Friday", "6": "Saturday" },
      freq: { hourly: "Every hour", daily: "Daily", weekly: "Weekly", monthly: "Monthly", custom: "Specific days" },
      ops: {
        copy: { label: "Copy", description: "Copies files within the same provider" },
        transfer: { label: "Transfer", description: "Transfers files between providers (Drive ↔ Dropbox)" },
      },
      syncModes: {
        copy: { label: "Simple copy", description: "Copies all files every time it runs" },
        cumulative_sync: { label: "Cumulative sync", description: "Only copies new or modified files since the last sync" },
        mirror_sync: { label: "Bidirectional mirror (Mirror Sync)", description: "Automatic sync in both directions. Changes on either side are reflected to the other" },
      },
      selectiveSync: {
        loading: "Loading folders...", noFolders: "No folders available for selective sync",
        retry: "Try again", hint: "📌 Drag folders to the zones below, or use the controls",
        sortName: "Name", sortSize: "Size",
        includeZone: "✓ Sync ({{count}})", excludeZone: "✗ Skip ({{count}})",
        saveBtn: "Save selection",
      },
    },
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
    categories: { documents: "Documents", images: "Images", media: "Media", others: "Others" },
    title: "My Drive", quickAccess: "Quick Access", recentTransfers: "Recent Transfers",
    onboarding: { badge: "Getting started", title: "Welcome to TERA!", desc: "Connect your Google Drive, Dropbox, OneDrive, Box and more, and start moving files between your clouds in seconds.", connectBtn: "Connect accounts", exploreBtn: "Explore files", quickTransfer: "Quick transfer" },
    stats: { completed: "Completed", inProgress: "In progress", failed: "Failed", files: "Files transferred" },
    actions: { explorer: "Explorer", explorerDesc: "Move files between clouds", operations: "Operations", operationsDesc: "Transfer history", integrations: "Integrations", integrationsDesc: "Connect external accounts", analytics: "Analytics", analyticsDesc: "View detailed statistics" },
    empty: { noTransfers: "No transfers yet", startTransfer: "Start transferring" },
    table: { status: "Status", files: "files" },
    status: { completed: "Completed", failed: "Failed", inProgress: "In progress", pending: "Pending" },
    performance: { title: "Overall performance", successRate: "Success rate", completed: "completed", total: "total", viewAnalytics: "View full analytics" }
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
    table: { name: "Name", size: "Files", date: "Date" },
    forgotPassword: { successTitle: "Email sent", successDesc: "Check your inbox to reset your password", backToLogin: "Back to login" },
    notifications: { copyOperation: "Copy operation", files: "files", transfers: "Transfers", seeAll: "See all", empty: "No notifications", seeHistory: "See full history", statusCompleted: "Completed", statusFailed: "Failed", statusInProgress: "In progress" },
    bottomNav: { home: "Home", explorer: "Explorer", operations: "Operations", integrations: "Connect", analytics: "Stats" },
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
    nav: { howItWorks: "How it works", features: "Features", pricing: "Pricing", security: "Security", login: "Log in", startFree: "Get started" },
    hero: {
      badge: "Connect your clouds in seconds",
      title: "Move your files between clouds",
      highlight: "without friction",
      description: "TERA connects your cloud services to transfer, sync, and back up your files automatically. No downloads. No hassle.",
      cta: "Get started for free",
      howItWorks: "How it works",
      noCard: "No credit card",
      encryption: "AES-256 Encryption",
      instantTransfer: "Instant transfer"
    },
    dragdrop: {
      badge: "New feature",
      title: "Drag and drop.",
      highlight: "That simple.",
      description: "In TERA's file explorer you can see your clouds side by side and drag files directly from one to the other. No forms, no extra steps — just drag and done.",
      f1: "Two simultaneous panels: source and destination",
      f2: "Drag individual files or select multiple",
      f3: "Transfer starts instantly",
      f4: "Compatible with folders and multiple formats",
      cta: "Try for free"
    },
    integrations: { label: "Available integrations", comingSoon: "+ more coming soon" },
    howItWorks: {
      label: "Process",
      title: "Three steps. Done.",
      step1Title: "Connect your accounts",
      step1Desc: "Link your Google Drive and Dropbox in seconds with secure OAuth. No passwords stored.",
      step2Title: "Configure the transfer",
      step2Desc: "Paste a Drive or Dropbox link, choose the destination and customize the options.",
      step3Title: "TERA does it for you",
      step3Desc: "The transfer runs in the cloud. You get an email when it's done and the history is saved."
    },
    features: {
      label: "Features",
      title: "Everything you need, nothing you don't",
      description: "Designed to do one thing very well: move files between clouds without you having to think about it.",
      f1Title: "Multi-cloud Transfers", f1Desc: "Copy files and entire folders between your cloud services with one click. No downloads to your device.",
      f2Title: "Auto Sync", f2Desc: "Schedule tasks to keep your folders synced between clouds. Daily, weekly, or whenever you want.",
      f3Title: "Version History", f3Desc: "Every transferred file is recorded with its version. Restore any previous state in seconds.",
      f4Title: "Share Inbox", f4Desc: "Receive files shared by anyone and send them directly to your favorite cloud, no middlemen.",
      f5Title: "Email Notifications", f5Desc: "We notify you when a transfer finishes, fails, or needs your attention. Never miss anything.",
      f6Title: "AES-256 Encrypted Tokens", f6Desc: "Your Google Drive and Dropbox credentials are stored with AES-256-GCM encryption. No one else has access."
    },
    tasks: {
      badge: "Auto sync · PRO",
      title: "Set it once.",
      highlight: "Forget it.",
      description: "Create scheduled tasks so TERA syncs your folders automatically. Daily, weekly, or whatever schedule you choose. New or modified files transfer on their own.",
      f1: "Incremental sync (only what changed)",
      f2: "Detection of new and modified files",
      f3: "Email notification on complete or errors",
      f4: "Run history with statistics",
      cta: "Create my first task"
    },
    security: {
      label: "Security",
      title: "Your files are yours. We just move them.",
      description: "TERA acts as an authorized intermediary between your clouds. We never store the content of your files — we only execute the operations you configure.",
      card1Title: "AES-256-GCM", card1Desc: "Your access credentials are encrypted with the military-grade standard before being stored.",
      card2Title: "Secure OAuth", card2Desc: "We never store your username or password. Only OAuth tokens with the minimum necessary permissions.",
      card3Title: "Operation log", card3Desc: "Every transfer is recorded with date, origin, destination and result.",
      card4Title: "Minimum permissions", card4Desc: "TERA only requests the strictly necessary permissions to operate on your accounts.",
      p1: "OAuth tokens encrypted with AES-256-GCM",
      p2: "HTTPS connection across the entire platform",
      p3: "We never store the content of your files",
      p4: "You can revoke access at any time"
    },
    pricing: {
      label: "Plans",
      title: "Simple and transparent",
      description: "Start free. Pay only when you need it.",
      forever: "forever",
      perMonth: "per month",
      popular: "Most popular",
      bestValue: "Best value",
      ctaFree: "Start for free",
      ctaPro: "Start Pro",
      ctaBiz: "Start Business",
      viewMore: "Want full details?",
      viewAllPlans: "See all plans →",
      freeF1: "5 GB cross-cloud traffic/month",
      freeF2: "20 transfers per month",
      freeF3: "100 MB max per file",
      freeF4: "Google Drive + Dropbox",
      proF1: "200 GB cross-cloud traffic/month",
      proF2: "300 transfers per month",
      proF3: "5 GB max per file",
      proF4: "5 cloud services",
      proF5: "5 scheduled tasks",
      proF6: "Analytics + email notifications",
      bizF1: "2 TB cross-cloud traffic/month",
      bizF2: "Unlimited transfers",
      bizF3: "50 GB max per file",
      bizF4: "Unlimited services & tasks",
    },
    cta: {
      title: "Your files deserve a better flow.",
      description: "Start free today. No credit card. Connect your accounts and make your first transfer in under 2 minutes.",
      button: "Create free account"
    },
    footer: {
      description: "The simplest way to move and sync files between your cloud services.",
      platform: "Platform", legal: "Legal", privacy: "Privacy", terms: "Terms",
      rights: "© 2026 TERA. All rights reserved.",
      operational: "Systems operational"
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
  },
  pricingPage: {
    nav: { products: "Products", pricing: "Pricing", security: "Security", goToApp: "Go to app", signIn: "Sign in", startFree: "Start free" },
    hero: { badge: "Plans & Pricing", title: "Simple and transparent", subtitle: "Start free. Pay only when you really need to." },
    toggle: { monthly: "Monthly", annual: "Annual" },
    perMonth: "/mo",
    freeForever: "Free forever",
    billedAnnual: "Billed {{sym}}{{total}}/year · save {{sym}}{{savings}}",
    loginRequired: { title: "You need an account", desc: "Create your free account to continue with your purchase." },
    plans: {
      free: { tagline: "Get started at no cost", cta: "Start free", f1: "5 GB cross-cloud traffic/month", f2: "20 transfers/month", f3: "100 MB max per file", f4: "2 connected services", f5: "Google Drive + Dropbox", f6: "7-day history", f7: "Scheduled tasks", f8: "Analytics", f9: "Email notifications" },
      pro: { tagline: "For regular and professional use", cta: "Start Pro", badge: "Most popular", f1: "200 GB cross-cloud traffic/month", f2: "300 transfers/month", f3: "5 GB max per file", f4: "5 connected services", f5: "All providers (OneDrive, Box, S3…)", f6: "90-day history", f7: "5 scheduled tasks", f8: "Basic analytics", f9: "Email notifications", f10: "Priority support 24h" },
      business: { tagline: "For intensive use", cta: "Start Business", badge: "Best value", f1: "2 TB cross-cloud traffic/month", f2: "Unlimited transfers", f3: "50 GB max per file", f4: "Unlimited services", f5: "All providers", f6: "Complete history", f7: "Unlimited scheduled tasks", f8: "Advanced analytics + versioning", f9: "Email notifications", f10: "Priority support 4h" }
    },
    traffic: { title: "What is cross-cloud traffic?", text: "When you transfer a file between different services (e.g. Google Drive → Dropbox), the data passes through our servers — that uses traffic. If you move files within the same service (Drive→Drive), traffic is always unlimited and free." },
    trust: { encrypted: "Encrypted data", encryptedSub: "AES-256-GCM", cancel: "Cancel anytime", cancelSub: "No commitment", refund: "Money-back guarantee", refundSub: "14 days", noCard: "No credit card", noCardSub: "For the Free plan" },
    comparison: { label: "Full comparison", title: "All the details", feature: "Feature", monthlyPrice: "Monthly price", cat1: "Traffic & Transfers", cat2: "Integrations", cat3: "Automation", cat4: "Support", r1f1: "Cross-cloud traffic/month", r1f2: "Transfers/month", r1f3: "Max per file", r1f4: "Same-provider (Drive→Drive)", r2f1: "Connected services", r3f1: "Scheduled tasks", r3f2: "Operations history", r3f3: "File versioning", r3f4: "Analytics", r4f1: "Email notifications", r4f2: "Support channel", r4f3: "Money-back guarantee", unlimited: "Unlimited", unlimitedM: "Unlimited", basic: "Basic", advanced: "Advanced", complete: "Complete", docs: "Documentation", email24h: "Email (24h)", priority4h: "Priority (4h)", tasks5: "5 tasks", days7: "7 days", days90: "90 days" },
    faq: { label: "Frequently asked questions", title: "Have questions?", q1: "What is cross-cloud traffic?", a1: "It's the amount of data transferred between different cloud services (e.g. Google Drive to Dropbox). When you move files within the same provider (Drive→Drive), it doesn't consume traffic and is always unlimited.", q2: "Can I change plans anytime?", a2: "Yes. Upgrading takes effect immediately. Downgrading applies at the end of the current billing cycle. No penalties or commitments.", q3: "What happens if I exceed my monthly traffic?", a3: "Cross-cloud transfers are paused until the next cycle. Same-provider transfers (same service) are never affected. You can upgrade at any time to continue.", q4: "Is there a free trial for Pro or Business?", a4: "The Free plan is permanent and requires no credit card. For Pro and Business we offer a 14-day money-back guarantee: if you're not satisfied, we refund you no questions asked.", q5: "How is the annual plan billed?", a5: "It's charged in a single payment at the start of the year. Pro annual: $65/year (save $30 vs monthly). Business annual: $159/year (save $81 vs monthly)." },
    cta: { title: "Connect your clouds today", subtitle: "Start free, no card required. Your first transfer in under 2 minutes.", startFree: "Start free", compare: "See comparison" }
  },
  settingsPage: {
    title: "Settings", subtitle: "Manage your account, plan and preferences",
    personal: { title: "Personal Information", description: "Update your name and email address", changePic: "Change photo (coming soon)", firstName: "First name", lastName: "Last name", email: "Email", emailVerifyNote: "Requires verification when changing", editBtn: "Edit information", saveBtn: "Save changes", savingBtn: "Saving...", cancelBtn: "Cancel", verifyPending: "Pending verification", verifyDesc: "We sent a 6-digit code to", verifyExpiry: "Expires in 10 minutes · Check spam if not found", confirmBtn: "Confirm" },
    plan: { title: "Plan & Billing", description: "Your current plan and upgrade options", active: "Active", freeLabel: "Free", proPrice: "$7.99 USD/mo", businessPrice: "$19.99 USD/mo", trafficLabel: "Traffic/month", transfersLabel: "Transfers", maxFileLabel: "Max. file", upgradeTitle: "Upgrade plan", proSub: "200 GB · 300 transfers", perMonth: "/mo", businessSub: "2 TB · Unlimited", upgradeToBusinessBtn: "Upgrade to Business", upgradeToBusinessSub: "2 TB · 50 GB files · 4h support", viewPlans: "View full plan comparison", cancelLink: "Cancel subscription", cancelTitle: "Cancel subscription?", cancelDesc: "Your plan will remain active until the end of the current period. Then you'll be downgraded to Free.", cancelConfirmBtn: "Confirm cancellation", keepPlanBtn: "Keep plan", welcomeTitle: "Thank you for your purchase!", welcomeDesc: "You now have access to all the benefits of your {{plan}} plan:", welcomeCta: "Start using it" },
    preferences: { title: "Preferences", description: "Language, notifications and appearance", languageLabel: "Interface language", languageSub: "Change the language of the entire app", notificationsLabel: "Email notifications", notificationsSub: "Receive alerts when a transfer finishes", darkModeLabel: "Dark mode", darkModeSub: "Enable the dark theme for the interface" },
    password: { title: "Password & Security", description: "Change your access password", currentLabel: "Current password", newLabel: "New password", confirmLabel: "Confirm new password", changeBtn: "Change password", changingBtn: "Changing...", successMsg: "Password updated successfully", minLength: "Minimum 8 characters", mismatch: "Passwords do not match", wrongCurrent: "Current password is incorrect" },
    account: { title: "Account Information", userId: "User ID", memberSince: "Member since", servicesTitle: "Connected Services", connected: "Connected", notConnected: "Not connected", manageLink: "Manage integrations →" },
    danger: { title: "Danger Zone", description: "Irreversible actions for your account", deleteLabel: "Delete account", deleteSub: "Permanently deletes your account and all data. This cannot be undone.", deleteBtn: "Delete (coming soon)" }
  },
  profilePage: {
    loading: "Loading profile...", editProfile: "Edit profile", connectNow: "connect now", noServices: "No services connected ·", memberSince: "Member since",
    activity: { title: "Activity Summary", description: "Statistics of your operations in TERA", total: "Total", completed: "Completed", failed: "Failed", success: "Success", successLabel: "Success rate" },
    recent: { title: "Recent Activity", description: "Your latest transfer operations", copyOp: "Copy operation", viewAll: "View all operations →", empty: "No activity yet", emptySub: "Start copying files to see your history here", completedStatus: "Completed", failedStatus: "Failed", inProgress: "In progress" },
    plan: { title: "Your Plan", freeLabel: "Free", proPrice: "$7.99 USD/mo", businessPrice: "$19.99 USD/mo", upgrade: "Upgrade plan", manage: "Manage subscription" },
    account: { title: "Account", status: "Status", active: "Active", userId: "User ID" },
    services: { title: "Services", connected: "Connected", notConnected: "Not connected", manage: "Manage integrations →" },
    quickActions: { title: "Quick actions", operations: "Operations", files: "My files", settings: "Settings" }
  },
  pageTitles: {
    landing: 'TERA — Multi-Cloud File Transfer',
    login: 'TERA — Log In',
    signup: 'TERA — Create Account',
    dashboard: 'TERA — Dashboard',
    explorer: 'TERA — File Explorer',
    integrations: 'TERA — Integrations',
    operations: 'TERA — Transfer History',
    pricing: 'TERA — Pricing',
    quickCopy: 'TERA — Copy from URL',
    myFiles: 'TERA — My Files',
    tasks: 'TERA — Scheduled Tasks',
    terms: 'TERA — Terms of Service',
    privacy: 'TERA — Privacy Policy',
    forgotPassword: 'TERA — Forgot Password',
  },
  globalTransferIndicator: {
    title: 'Transfers',
    active: 'active', actives: 'active',
    completedBadge: 'completed', completedsBadge: 'completed',
    noTransfers: 'No transfers',
    viewAll: 'View all', clearCompleted: 'Clear completed',
    more: '+{{count}} more', cancel: 'Cancel',
    cancelledToast: 'Transfer cancelled', cancelFailedToast: 'Could not cancel',
  },
  fileUpload: {
    button: 'Upload File', dialogTitle: 'Upload file to cloud',
    dialogDesc: 'Select a file and choose the destination to save it securely.',
    clickToSelect: 'Click to select a file', maxSize: 'Maximum 100 MB',
    destination: 'Upload destination',
    connectWarning: 'Make sure you have connected your {{provider}} account first.',
    uploading: 'Uploading file...', startUpload: 'Start Upload',
    successTitle: 'File uploaded successfully',
    successDesc: 'Your file "{{name}}" has been uploaded to {{provider}}.',
    errorTitle: 'Error uploading file', errorDesc: 'Something went wrong during upload.',
    tooLargeTitle: 'File too large', tooLargeDesc: 'File must not exceed 100 MB.',
  },
  globalSearch: {
    placeholder: 'Search across all your clouds...', hint: 'Type at least 2 characters to search',
    noResults: 'No results for', noIndex: 'No index — real-time search',
    indexed: 'Index:', buildIndex: 'Build index', refreshIndex: 'Update index',
  },
};

const ptTranslations = {
  welcomeMessages: ["Bem-vindo de volta!", "Olá novamente!", "Bom te ver de novo!", "Que bom ter você aqui!", "Vamos lá! 🚀"],
  sidebar: { storage: "Armazenamento" },
  myFiles: {
    title: "Meus Arquivos", searchPlaceholder: "Buscar arquivos...", noFilesFound: "Nenhum arquivo encontrado",
    noFilesCopied: "Nenhum arquivo transferido ainda", tryDifferentSearch: "Tente outra busca",
    filesWillAppearHere: "Seus arquivos transferidos aparecerão aqui",
    showing: "Mostrando", to: "a", of: "de", files: "arquivos", previous: "Anterior", next: "Próximo",
    subtitle: "Arquivos e Pastas", all: "Todos",
    filterDropbox: "Seus arquivos e pastas do Dropbox aparecerão aqui.",
    filterGoogle: "Seus arquivos e pastas do Google Drive aparecerão aqui.",
    copied: "Copiado", copiedSuccessfully: "Copiado com sucesso",
    linkCopied: "Link copiado", linkCopiedDesc: "O link foi copiado para a área de transferência",
    viewDetails: "Ver detalhes", openIn: "Abrir em {{provider}}", download: "Baixar",
    copyLink: "Copiar link", share: "Compartilhar", storedIn: "Armazenado em {{provider}}",
    fullName: "Nome completo", size: "Tamanho", type: "Tipo", copyDate: "Data de cópia",
    fileTypes: { file: "Arquivo", folder: "Pasta", image: "Imagem", video: "Vídeo", audio: "Áudio", pdf: "PDF", spreadsheet: "Planilha", document: "Documento", archive: "Arquivo compactado" }
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
    noDataTitle: "Sem dados ainda", noDataMessage: "Faça transferências para ver suas estatísticas",
    connectAccounts: "Conectar contas", exploreFiles: "Explorar arquivos"
  },
  pages: {
    cloudExplorer: {
      title: "Explorador Multi-nuvem", subtitle: "Arraste arquivos entre suas nuvens",
      syncMode: "Modo de transferência", cumulative: "Acumular", cumulativeDesc: "Adicionar arquivos sem remover os existentes",
      mirror: "Substituir", mirrorDesc: "Substituir arquivos com o mesmo nome", syncDesc: "Selecione um modo antes de transferir",
      dropToTransfer: "Soltar para transferir", search: "Buscar...", root: "Raiz",
      notConnected: "{{provider}} não conectado", connectAccount: "Conecte sua conta para explorar e transferir arquivos",
      goToIntegrations: "Ir para Integrações →", loadError: "Erro ao carregar arquivos", retry: "Tentar novamente",
      noResults: "Sem resultados", emptyFolder: "Pasta vazia", folder: "Pasta",
      cancel: "Cancelar", transfer: "Transferir",
      continueBtn: "Continuar", chooseDestination: "Escolha para onde enviar {{count}} arquivo(s)", sendHere: "Enviar aqui", backBtn: "Voltar",
      sameProvider: "Mesmo provedor", sameProviderDesc: "Arraste para o painel do outro provedor para transferir.",
      fileQueued: "\"{{name}}\" está na fila.", filesQueued: "{{count}} arquivos na fila para {{provider}}.",
      transferError: "Erro ao iniciar transferência", transferErrorDesc: "Não foi possível iniciar a transferência.",
      filesSelected: "{{count}} arquivos selecionados", countFiles: "{{count}} arquivos",
      skip: "Ignorar existentes", skipDesc: "Copia apenas arquivos novos, não sobrescreve",
      copyWithSuffix: "Copiar com novo nome", copyWithSuffixDesc: "Se já existe, cria uma cópia com sufixo (_1, _2…)",
      replace: "Substituir", replaceDesc: "Sobrescreve o arquivo existente com o mesmo nome",
      transferring: "Iniciando transferência...", dragHint: "Solte \"{{name}}\" no outro painel para transferir",
      s3NoBucket: "Selecione um bucket S3 primeiro", s3NoBucketDesc: "Navegue dentro de um bucket no painel de destino antes de transferir.",
      filesTransferred: "arquivos transferidos", of: "de", downloading: "Baixando", uploading: "Enviando"
    },
    integrations: {
      title: "Integrações", subtitle: "Conecte seus serviços de armazenamento",
      reconnectBannerTitle: "Reconecte o Google Drive.", reconnectBannerDesc: "Atualizamos as permissões do Google Drive para maior segurança. Por favor desconecte e reconecte sua conta para continuar usando o Cloud Explorer.",
      personalStorage: "Armazenamento pessoal", googleDriveDesc: "Armazenamento em nuvem do Google com colaboração em tempo real",
      dropboxDesc: "Armazenamento em nuvem com sincronização e compartilhamento fáceis", features: "Funcionalidades",
      autoSync: "Sincronização automática", sharedFolders: "Pastas compartilhadas", permissions: "Controle de permissões",
      maxSupport: "Arquivos de até 5TB", perFile: "por arquivo", collabAndFiles: "Colaboração e arquivos",
      realTimeCollab: "Colaboração em tempo real", versionHistory: "Histórico de versões",
      secureLinks: "Links de compartilhamento seguros", comingSoonTitle: "Em Breve",
      comingSoonSubtitle: "Estamos trabalhando em novas integrações",
      requestBtn: "Solicitar integração", requestDesc: "Não encontrou seu serviço? Você pode solicitá-lo",
      microsoftStorage: "Armazenamento Microsoft", onedriveDesc: "Conecte sua conta do Microsoft OneDrive para acessar e sincronizar arquivos da nuvem da Microsoft.",
      microsoftIntegration: "Integração com Microsoft 365", enterpriseStorage: "Armazenamento Empresarial",
      boxDesc: "Conecte sua conta do Box para gerenciar arquivos empresariais com segurança avançada e colaboração em equipe.",
      enterpriseSecurity: "Segurança empresarial avançada", complianceTools: "Ferramentas de conformidade",
      cloudInfrastructure: "Infraestrutura Cloud", s3Desc: "Conecte seus buckets do Amazon S3 para acessar e transferir arquivos da infraestrutura cloud da AWS.",
      infiniteStorage: "Armazenamento ilimitado", globalRegions: "Múltiplas regiões globais",
      s3Compatible: "Compatível com Wasabi e Backblaze B2",
      connect: "Conectar", connected: "Conectado", disconnect: "Desconectar",
      reconnect: "Reconectar", disconnected: "Desconectado", tokenExpired: "Token expirado",
      verifying: "Verificando...", cancel: "Cancelar",
      connectSuccess: "Conectado com sucesso!", connectSuccessDesc: "Sua conta {{provider}} foi conectada.",
      connectError: "Erro de conexão", connectErrorDesc: "Não foi possível conectar sua conta {{provider}}. Tente novamente.",
      disconnectSuccess: "Conta desconectada", disconnectSuccessDesc: "Sua conta {{provider}} foi desconectada.",
      tooltipConnected: "{{provider}} conectado", tooltipExpired: "Token expirado — reconexão necessária",
      tooltipConnect: "Conectar {{provider}}", disconnectTitle: "Desconectar {{provider}}?",
      disconnectDesc: "Isso removerá o acesso à sua conta {{provider}}. Você não poderá copiar arquivos até reconectar.",
      s3DialogDesc: "Insira suas credenciais do AWS IAM. Você precisa de um usuário com permissões de S3.",
      s3Region: "Região", s3InvalidCredentials: "Credenciais inválidas."
    },
    tasks: {
      title: "Tarefas Agendadas",
      subtitle: "Agende cópias automáticas de arquivos entre serviços na nuvem",
      taskCount: "{{count}}/{{limit}} tarefas",
      requiresPro: "Requer Pro",
      limitReached: "Limite atingido",
      newTask: "Nova tarefa",
      upgradeToPro: "Atualizar para Pro para criar tarefas",
      createFirstTask: "Criar primeira tarefa",
      createTask: "Criar tarefa",
      saveChanges: "Salvar alterações",
      emptyTitle: "Nenhuma tarefa agendada",
      emptyDesc: "Crie uma tarefa para copiar arquivos automaticamente entre serviços na nuvem no horário de sua preferência.",
      createTitle: "Criar tarefa agendada",
      createDesc: "Configure uma cópia automática de arquivos entre serviços",
      editTitle: "Editar tarefa",
      editDesc: "Modifique a configuração da tarefa agendada",
      versionHistoryTitle: "Histórico de Versões",
      versionHistoryDesc: "Explore versões anteriores e restaure alterações.",
      selectiveSyncTitle: "Sincronização Seletiva",
      selectiveSyncDesc: "Selecione quais pastas sincronizar ou excluir",
      form: {
        taskName: "Nome da tarefa *",
        taskNamePlaceholder: "Ex.: Backup diário de documentos",
        description: "Descrição",
        descriptionPlaceholder: "Descrição opcional da tarefa",
        operationType: "Tipo de operação",
        syncMode: "Modo de sincronização",
        selectiveSync: "Sincronização Seletiva",
        configFolders: "Configurar pastas",
        foldersSelected: "✓ {{count}} pastas selecionadas",
        syncingAll: "Sincronizando todo o conteúdo (padrão)",
        source: "Origem",
        destination: "Destino",
        sourceFolder: "Pasta de origem *",
        destFolder: "Pasta de destino",
        sourcePlaceholder: "Selecionar pasta de origem...",
        destPlaceholder: "Selecionar pasta de destino...",
        schedule: "Agendamento",
        frequency: "Frequência",
        selectDays: "Selecione os dias",
        atLeastOneDay: "Selecione pelo menos um dia",
        dayOfWeek: "Dia da semana",
        dayOfMonth: "Dia do mês",
        dayN: "Dia {{n}}",
        hour: "Hora (0-23)",
        minute: "Minuto",
        skipDuplicates: "Ignorar duplicatas",
        skipDuplicatesDesc: "Não copiar arquivos que já existem",
        notifyComplete: "Notificar ao concluir",
        notifyCompleteDesc: "Enviar notificação quando terminar",
        notifyErrors: "Notificar erros",
        notifyErrorsDesc: "Enviar notificação se houver erros",
        selectiveSyncTip: "💡 Dica: Com Sincronização Seletiva, apenas as pastas que você escolher serão sincronizadas, economizando tempo e espaço.",
        cumulativeHint: "✓ Copia apenas arquivos novos ou modificados\n✓ Economiza largura de banda\n⚠️ Arquivos excluídos na origem permanecerão no destino",
        mirrorHint: "↔️ Sincronização bidirecional automática\n✓ Alterações no Drive são refletidas no Dropbox e vice-versa\n⚠️ Pode detectar e resolver conflitos\n⏰ Executa no horário agendado",
        myDrive: "Meu Drive",
      },
      status: {
        active: "Ativa", paused: "Pausada", deleted: "Excluída",
        success: "Bem-sucedida", failed: "Falhou", running: "Em andamento",
      },
      actions: {
        runNow: "Executar agora", pause: "Pausar", resume: "Retomar",
        versionHistory: "Ver histórico de versões", manageConflicts: "Gerenciar conflitos",
        edit: "Editar", delete: "Excluir",
      },
      card: {
        schedule: "Agendamento", nextRun: "Próxima execução", lastRun: "Última execução",
        stats: "Estatísticas", statsValue: "{{success}} bem-sucedidas / {{failed}} falhas", lastError: "Último erro",
      },
      toast: {
        created: "Tarefa criada", createdDesc: "A tarefa agendada foi criada com sucesso.",
        updated: "Tarefa atualizada", updatedDesc: "As alterações foram salvas com sucesso.",
        deleted: "Tarefa excluída", deletedDesc: "A tarefa foi excluída.",
        paused: "Tarefa pausada", pausedDesc: "A tarefa foi pausada.",
        resumed: "Tarefa retomada", resumedDesc: "A tarefa será executada conforme o agendamento.",
        running: "Executando", runningDesc: "A tarefa está sendo executada agora.",
        errorCreate: "Não foi possível criar a tarefa.", errorUpdate: "Não foi possível atualizar a tarefa.",
        errorDelete: "Não foi possível excluir a tarefa.", errorPause: "Não foi possível pausar a tarefa.",
        errorResume: "Não foi possível retomar a tarefa.", errorRun: "Não foi possível executar a tarefa.",
        proRequired: "Recurso Pro", proRequiredDesc: "As tarefas agendadas requerem um plano Pro ou Business.",
        limitReached: "Limite de tarefas atingido",
        limitReachedDesc: "Seu plano Pro permite até {{limit}} tarefas. Atualize para Business para ter tarefas ilimitadas.",
        validationError: "Nome da tarefa e URL de origem são obrigatórios.",
        errorLoadFolders: "Não foi possível carregar as pastas",
        savedSelection: "Salvo", savedSelectionDesc: "As configurações de sincronização seletiva foram atualizadas.",
        errorSaveSelection: "Não foi possível salvar as alterações",
      },
      schedule: {
        hourly: "A cada hora, no minuto {{minute}}", daily: "Todos os dias às {{time}}",
        weekly: "Toda {{day}} às {{time}}", monthly: "No dia {{dayOfMonth}} de cada mês às {{time}}",
        custom: "{{days}} às {{time}}", default: "Agendado às {{time}}", never: "Nunca",
      },
      days: { "0": "Domingo", "1": "Segunda-feira", "2": "Terça-feira", "3": "Quarta-feira", "4": "Quinta-feira", "5": "Sexta-feira", "6": "Sábado" },
      freq: { hourly: "A cada hora", daily: "Diário", weekly: "Semanal", monthly: "Mensal", custom: "Dias específicos" },
      ops: {
        copy: { label: "Copiar", description: "Copia arquivos dentro do mesmo provedor" },
        transfer: { label: "Transferir", description: "Transfere arquivos entre provedores (Drive ↔ Dropbox)" },
      },
      syncModes: {
        copy: { label: "Cópia simples", description: "Copia todos os arquivos cada vez que é executado" },
        cumulative_sync: { label: "Sincronização acumulativa", description: "Copia apenas arquivos novos ou modificados desde a última sincronização" },
        mirror_sync: { label: "Espelho bidirecional (Mirror Sync)", description: "Sincronização automática em ambas as direções. Alterações em qualquer lado são refletidas no outro" },
      },
      selectiveSync: {
        loading: "Carregando pastas...", noFolders: "Nenhuma pasta disponível para sincronização seletiva",
        retry: "Tentar novamente", hint: "📌 Arraste pastas para as zonas abaixo, ou use os controles",
        sortName: "Nome", sortSize: "Tamanho",
        includeZone: "✓ Sincronizar ({{count}})", excludeZone: "✗ Omitir ({{count}})",
        saveBtn: "Salvar seleção",
      },
    },
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
    categories: { documents: "Documentos", images: "Imagens", media: "Mídia", others: "Outros" },
    title: "Minha Unidade", quickAccess: "Acesso Rápido", recentTransfers: "Transferências Recentes",
    onboarding: { badge: "Primeiros passos", title: "Bem-vindo ao TERA!", desc: "Conecte suas contas do Google Drive, Dropbox, OneDrive, Box e mais, e comece a mover arquivos entre suas nuvens em segundos.", connectBtn: "Conectar contas", exploreBtn: "Explorar arquivos", quickTransfer: "Transferência rápida" },
    stats: { completed: "Concluídas", inProgress: "Em andamento", failed: "Falhas", files: "Arquivos transferidos" },
    actions: { explorer: "Explorador", explorerDesc: "Mover arquivos entre nuvens", operations: "Operações", operationsDesc: "Histórico de transferências", integrations: "Integrações", integrationsDesc: "Conectar contas externas", analytics: "Análises", analyticsDesc: "Ver estatísticas detalhadas" },
    empty: { noTransfers: "Nenhuma transferência ainda", startTransfer: "Começar a transferir" },
    table: { status: "Status", files: "arquivos" },
    status: { completed: "Concluída", failed: "Falhou", inProgress: "Em andamento", pending: "Pendente" },
    performance: { title: "Desempenho geral", successRate: "Taxa de sucesso", completed: "concluídas", total: "total", viewAnalytics: "Ver análises completas" }
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
    table: { name: "Nome", size: "Arquivos", date: "Data" },
    forgotPassword: { successTitle: "E-mail enviado", successDesc: "Verifique sua caixa de entrada para redefinir sua senha", backToLogin: "Voltar ao login" },
    notifications: { copyOperation: "Operação de cópia", files: "arquivos", transfers: "Transferências", seeAll: "Ver todas", empty: "Sem notificações", seeHistory: "Ver histórico completo", statusCompleted: "Concluída", statusFailed: "Falhou", statusInProgress: "Em andamento" },
    bottomNav: { home: "Início", explorer: "Explorador", operations: "Operações", integrations: "Conectar", analytics: "Stats" },
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
    nav: { howItWorks: "Como funciona", features: "Funcionalidades", pricing: "Preços", security: "Segurança", login: "Entrar", startFree: "Começar grátis" },
    hero: {
      badge: "Conecte suas nuvens em segundos",
      title: "Mova seus arquivos entre nuvens",
      highlight: "sem fricção",
      description: "TERA conecta seus serviços na nuvem para transferir, sincronizar e fazer backup dos seus arquivos automaticamente. Sem downloads. Sem complicações.",
      cta: "Comece grátis hoje",
      howItWorks: "Como funciona",
      noCard: "Sem cartão de crédito",
      encryption: "Criptografia AES-256",
      instantTransfer: "Transferência imediata"
    },
    dragdrop: {
      badge: "Nova funcionalidade",
      title: "Arraste e solte.",
      highlight: "Simples assim.",
      description: "No explorador de arquivos do TERA você pode ver suas nuvens lado a lado e arrastar arquivos diretamente de uma para outra. Sem formulários, sem etapas extras — só arrasta e pronto.",
      f1: "Dois painéis simultâneos: origem e destino",
      f2: "Arraste arquivos individuais ou selecione vários",
      f3: "A transferência começa instantaneamente",
      f4: "Compatível com pastas e múltiplos formatos",
      cta: "Experimentar grátis"
    },
    integrations: { label: "Integrações disponíveis", comingSoon: "+ mais em breve" },
    howItWorks: {
      label: "Processo",
      title: "Três passos. Pronto.",
      step1Title: "Conecte suas contas",
      step1Desc: "Vincule seu Google Drive e Dropbox em segundos com OAuth seguro. Sem senhas armazenadas.",
      step2Title: "Configure a transferência",
      step2Desc: "Cole um link do Drive ou Dropbox, escolha o destino e personalize as opções.",
      step3Title: "TERA faz por você",
      step3Desc: "A transferência roda na nuvem. Você recebe um e-mail quando termina e o histórico fica salvo."
    },
    features: {
      label: "Funcionalidades",
      title: "Tudo que você precisa, nada que não",
      description: "Projetado para fazer uma coisa muito bem: mover arquivos entre nuvens sem que você precise pensar nisso.",
      f1Title: "Transferências Multi-nuvem", f1Desc: "Copie arquivos e pastas inteiras entre seus serviços na nuvem com um clique. Sem baixar nada.",
      f2Title: "Sincronização Automática", f2Desc: "Agende tarefas para manter suas pastas sincronizadas entre nuvens. Diário, semanal ou quando quiser.",
      f3Title: "Histórico de Versões", f3Desc: "Cada arquivo transferido fica registrado com sua versão. Restaure qualquer estado anterior em segundos.",
      f4Title: "Share Inbox", f4Desc: "Receba arquivos compartilhados por qualquer pessoa e envie diretamente para sua nuvem favorita.",
      f5Title: "Notificações por E-mail", f5Desc: "Avisamos quando uma transferência termina, falha ou precisa de atenção. Nunca perca nada.",
      f6Title: "Tokens Criptografados AES-256", f6Desc: "Suas credenciais do Google Drive e Dropbox são armazenadas com criptografia AES-256-GCM."
    },
    tasks: {
      badge: "Sincronização automática · PRO",
      title: "Configure uma vez.",
      highlight: "Esqueça.",
      description: "Crie tarefas programadas para que o TERA sincronize suas pastas automaticamente. Diário, semanal ou o horário que você escolher. Arquivos novos ou modificados se transferem sozinhos.",
      f1: "Sincronização incremental (só o que mudou)",
      f2: "Detecção de arquivos novos e modificados",
      f3: "Notificação por e-mail ao concluir ou em erros",
      f4: "Histórico de cada execução com estatísticas",
      cta: "Criar minha primeira tarefa"
    },
    security: {
      label: "Segurança",
      title: "Seus arquivos são seus. Nós só os movemos.",
      description: "O TERA age como intermediário autorizado entre suas nuvens. Nunca armazenamos o conteúdo dos seus arquivos — só executamos as operações que você configura.",
      card1Title: "AES-256-GCM", card1Desc: "Suas credenciais de acesso são criptografadas com o padrão militar antes de serem salvas.",
      card2Title: "OAuth Seguro", card2Desc: "Nunca armazenamos seu usuário ou senha. Só tokens OAuth com as permissões mínimas necessárias.",
      card3Title: "Registro de operações", card3Desc: "Cada transferência fica registrada com data, origem, destino e resultado.",
      card4Title: "Permissões mínimas", card4Desc: "O TERA solicita apenas as permissões estritamente necessárias para operar em suas contas.",
      p1: "Tokens OAuth criptografados com AES-256-GCM",
      p2: "Conexão HTTPS em toda a plataforma",
      p3: "Nunca salvamos o conteúdo dos seus arquivos",
      p4: "Você pode revogar o acesso a qualquer momento"
    },
    pricing: {
      label: "Planos",
      title: "Simples e transparente",
      description: "Comece grátis. Pague só quando precisar.",
      forever: "para sempre",
      perMonth: "por mês",
      popular: "Mais popular",
      bestValue: "Maior valor",
      ctaFree: "Começar grátis",
      ctaPro: "Começar Pro",
      ctaBiz: "Começar Business",
      viewMore: "Quer ver todos os detalhes?",
      viewAllPlans: "Ver todos os planos →",
      freeF1: "5 GB de tráfego cross-cloud/mês",
      freeF2: "20 transferências por mês",
      freeF3: "100 MB máximo por arquivo",
      freeF4: "Google Drive + Dropbox",
      proF1: "200 GB de tráfego cross-cloud/mês",
      proF2: "300 transferências por mês",
      proF3: "5 GB máximo por arquivo",
      proF4: "5 serviços conectados",
      proF5: "5 tarefas programadas",
      proF6: "Analytics + notificações por e-mail",
      bizF1: "2 TB de tráfego cross-cloud/mês",
      bizF2: "Transferências ilimitadas",
      bizF3: "50 GB máximo por arquivo",
      bizF4: "Serviços e tarefas ilimitados",
    },
    cta: {
      title: "Seus arquivos merecem um fluxo melhor.",
      description: "Comece grátis hoje. Sem cartão de crédito. Conecte suas contas e faça sua primeira transferência em menos de 2 minutos.",
      button: "Criar conta grátis"
    },
    footer: {
      description: "A forma mais simples de mover e sincronizar arquivos entre seus serviços na nuvem.",
      platform: "Plataforma", legal: "Legal", privacy: "Privacidade", terms: "Termos",
      rights: "© 2026 TERA. Todos os direitos reservados.",
      operational: "Sistemas operacionais"
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
  },
  pricingPage: {
    nav: { products: "Produtos", pricing: "Preços", security: "Segurança", goToApp: "Ir para o app", signIn: "Entrar", startFree: "Começar grátis" },
    hero: { badge: "Planos e Preços", title: "Simples e transparente", subtitle: "Comece de graça. Pague só quando realmente precisar." },
    toggle: { monthly: "Mensal", annual: "Anual" },
    perMonth: "/mês",
    freeForever: "Grátis para sempre",
    billedAnnual: "Cobrado {{sym}}{{total}}/ano · economize {{sym}}{{savings}}",
    loginRequired: { title: "Você precisa de uma conta", desc: "Crie sua conta grátis para continuar com a compra." },
    plans: {
      free: { tagline: "Para começar sem custo", cta: "Começar grátis", f1: "5 GB tráfego cross-cloud/mês", f2: "20 transferências/mês", f3: "100 MB máximo por arquivo", f4: "2 serviços conectados", f5: "Google Drive + Dropbox", f6: "7 dias de histórico", f7: "Tarefas agendadas", f8: "Analytics", f9: "Notificações por email" },
      pro: { tagline: "Para uso regular e profissional", cta: "Começar Pro", badge: "Mais popular", f1: "200 GB tráfego cross-cloud/mês", f2: "300 transferências/mês", f3: "5 GB máximo por arquivo", f4: "5 serviços conectados", f5: "Todos os provedores (OneDrive, Box, S3…)", f6: "90 dias de histórico", f7: "5 tarefas agendadas", f8: "Analytics básico", f9: "Notificações por email", f10: "Suporte prioritário 24h" },
      business: { tagline: "Para uso intensivo", cta: "Começar Business", badge: "Melhor valor", f1: "2 TB tráfego cross-cloud/mês", f2: "Transferências ilimitadas", f3: "50 GB máximo por arquivo", f4: "Serviços ilimitados", f5: "Todos os provedores", f6: "Histórico completo", f7: "Tarefas agendadas ilimitadas", f8: "Analytics avançado + versioning", f9: "Notificações por email", f10: "Suporte prioritário 4h" }
    },
    traffic: { title: "O que é tráfego cross-cloud?", text: "Quando você transfere um arquivo entre serviços diferentes (ex: Google Drive → Dropbox), os dados passam pelos nossos servidores — isso consome tráfego. Se mover arquivos dentro do mesmo serviço (Drive→Drive), o tráfego é sempre ilimitado e gratuito." },
    trust: { encrypted: "Dados criptografados", encryptedSub: "AES-256-GCM", cancel: "Cancele quando quiser", cancelSub: "Sem fidelidade", refund: "Garantia de devolução", refundSub: "14 dias", noCard: "Sem cartão de crédito", noCardSub: "Para o plano Free" },
    comparison: { label: "Comparação completa", title: "Tudo detalhado", feature: "Recurso", monthlyPrice: "Preço mensal", cat1: "Tráfego e Transferências", cat2: "Integrações", cat3: "Automação", cat4: "Suporte", r1f1: "Tráfego cross-cloud/mês", r1f2: "Transferências/mês", r1f3: "Máximo por arquivo", r1f4: "Same-provider (Drive→Drive)", r2f1: "Serviços conectados", r3f1: "Tarefas agendadas", r3f2: "Histórico de operações", r3f3: "Versionamento de arquivos", r3f4: "Analytics", r4f1: "Notificações email", r4f2: "Canal de suporte", r4f3: "Garantia de devolução", unlimited: "Ilimitadas", unlimitedM: "Ilimitados", basic: "Básico", advanced: "Avançado", complete: "Completo", docs: "Documentação", email24h: "Email (24h)", priority4h: "Prioritário (4h)", tasks5: "5 tarefas", days7: "7 dias", days90: "90 dias" },
    faq: { label: "Perguntas frequentes", title: "Tem dúvidas?", q1: "O que é tráfego cross-cloud?", a1: "É a quantidade de dados transferidos entre serviços de nuvem diferentes (ex: Google Drive para o Dropbox). Quando você move arquivos dentro do mesmo provedor (Drive→Drive), não consome tráfego e é sempre ilimitado.", q2: "Posso mudar de plano quando quiser?", a2: "Sim. Ao fazer upgrade o plano é imediato. Ao fazer downgrade, aplica-se no fim do ciclo de faturamento atual. Sem penalidades nem fidelidade.", q3: "O que acontece se eu ultrapassar o tráfego do mês?", a3: "As transferências cross-cloud são pausadas até o próximo ciclo. As transferências same-provider (mesmo serviço) nunca são afetadas. Você pode fazer upgrade a qualquer momento para continuar.", q4: "Tem teste gratuito para Pro ou Business?", a4: "O plano Free é permanente e não requer cartão de crédito. Para Pro e Business oferecemos garantia de devolução de 14 dias: se não ficar satisfeito, devolvemos o dinheiro sem perguntas.", q5: "Como é cobrado o plano anual?", a5: "É cobrado em um único pagamento no início do ano. Pro anual: R$359/ano (economize R$120 vs mensal). Business anual: R$899/ano (economize R$300 vs mensal)." },
    cta: { title: "Conecte suas nuvens hoje", subtitle: "Comece grátis, sem cartão. Sua primeira transferência em menos de 2 minutos.", startFree: "Começar grátis", compare: "Ver comparação" }
  },
  settingsPage: {
    title: "Configurações", subtitle: "Gerencie sua conta, plano e preferências",
    personal: { title: "Informações Pessoais", description: "Atualize seu nome e endereço de email", changePic: "Mudar foto (em breve)", firstName: "Nome", lastName: "Sobrenome", email: "Email", emailVerifyNote: "Requer verificação ao alterar", editBtn: "Editar informações", saveBtn: "Salvar alterações", savingBtn: "Salvando...", cancelBtn: "Cancelar", verifyPending: "Verificação pendente", verifyDesc: "Enviamos um código de 6 dígitos para", verifyExpiry: "Expira em 10 minutos · Verifique spam se não encontrar", confirmBtn: "Confirmar" },
    plan: { title: "Plano e Cobrança", description: "Seu plano atual e opções de upgrade", active: "Ativo", freeLabel: "Grátis", proPrice: "$7.99 USD/mês", businessPrice: "$19.99 USD/mês", trafficLabel: "Tráfego/mês", transfersLabel: "Transferências", maxFileLabel: "Arquivo máx.", upgradeTitle: "Melhorar plano", proSub: "200 GB · 300 transferências", perMonth: "/mês", businessSub: "2 TB · Ilimitadas", upgradeToBusinessBtn: "Melhorar para Business", upgradeToBusinessSub: "2 TB · arquivos de 50 GB · suporte 4h", viewPlans: "Ver comparação completa de planos", cancelLink: "Cancelar assinatura", cancelTitle: "Cancelar assinatura?", cancelDesc: "Seu plano permanecerá ativo até o fim do período atual. Depois será revertido para o plano Free.", cancelConfirmBtn: "Confirmar cancelamento", keepPlanBtn: "Manter plano", welcomeTitle: "Obrigado pela sua compra!", welcomeDesc: "Você já tem acesso a todos os benefícios do seu plano {{plan}}:", welcomeCta: "Começar a usar" },
    preferences: { title: "Preferências", description: "Idioma, notificações e aparência", languageLabel: "Idioma da interface", languageSub: "Mude o idioma de toda a aplicação", notificationsLabel: "Notificações por email", notificationsSub: "Receber avisos quando uma transferência terminar", darkModeLabel: "Modo escuro", darkModeSub: "Ativar o tema escuro da interface" },
    password: { title: "Senha e Segurança", description: "Altere sua senha de acesso", currentLabel: "Senha atual", newLabel: "Nova senha", confirmLabel: "Confirmar nova senha", changeBtn: "Alterar senha", changingBtn: "Alterando...", successMsg: "Senha atualizada com sucesso", minLength: "Mínimo 8 caracteres", mismatch: "As senhas não coincidem", wrongCurrent: "A senha atual está incorreta" },
    account: { title: "Informações da Conta", userId: "ID do Usuário", memberSince: "Membro desde", servicesTitle: "Serviços Conectados", connected: "Conectado", notConnected: "Não conectado", manageLink: "Gerenciar integrações →" },
    danger: { title: "Zona Perigosa", description: "Ações irreversíveis para sua conta", deleteLabel: "Excluir conta", deleteSub: "Exclui permanentemente sua conta e todos os dados. Não pode ser desfeito.", deleteBtn: "Excluir (em breve)" }
  },
  profilePage: {
    loading: "Carregando perfil...", editProfile: "Editar perfil", connectNow: "conectar agora", noServices: "Sem serviços conectados ·", memberSince: "Membro desde",
    activity: { title: "Resumo de Atividade", description: "Estatísticas das suas operações no TERA", total: "Totais", completed: "Concluídas", failed: "Falhas", success: "Sucesso", successLabel: "Taxa de sucesso" },
    recent: { title: "Atividade Recente", description: "Suas últimas operações de transferência", copyOp: "Operação de cópia", viewAll: "Ver todas as operações →", empty: "Sem atividade ainda", emptySub: "Comece copiando arquivos para ver seu histórico aqui", completedStatus: "Concluído", failedStatus: "Falhou", inProgress: "Em andamento" },
    plan: { title: "Seu Plano", freeLabel: "Grátis", proPrice: "$7.99 USD/mês", businessPrice: "$19.99 USD/mês", upgrade: "Melhorar plano", manage: "Gerenciar assinatura" },
    account: { title: "Conta", status: "Status", active: "Ativa", userId: "ID do usuário" },
    services: { title: "Serviços", connected: "Conectado", notConnected: "Não conectado", manage: "Gerenciar integrações →" },
    quickActions: { title: "Ações rápidas", operations: "Operações", files: "Meus arquivos", settings: "Configurações" }
  },
  pageTitles: {
    landing: 'TERA — Transferência Multi-nuvem',
    login: 'TERA — Entrar',
    signup: 'TERA — Criar conta',
    dashboard: 'TERA — Dashboard',
    explorer: 'TERA — Explorador de arquivos',
    integrations: 'TERA — Integrações',
    operations: 'TERA — Histórico de transferências',
    pricing: 'TERA — Preços',
    quickCopy: 'TERA — Copiar de URL',
    myFiles: 'TERA — Meus arquivos',
    tasks: 'TERA — Tarefas programadas',
    terms: 'TERA — Termos de serviço',
    privacy: 'TERA — Política de privacidade',
    forgotPassword: 'TERA — Recuperar senha',
  },
  globalTransferIndicator: {
    title: 'Transferências',
    active: 'ativa', actives: 'ativas',
    completedBadge: 'concluída', completedsBadge: 'concluídas',
    noTransfers: 'Sem transferências',
    viewAll: 'Ver todas', clearCompleted: 'Limpar concluídas',
    more: '+{{count}} mais', cancel: 'Cancelar',
    cancelledToast: 'Transferência cancelada', cancelFailedToast: 'Não foi possível cancelar',
  },
  fileUpload: {
    button: 'Enviar Arquivo', dialogTitle: 'Enviar arquivo para a nuvem',
    dialogDesc: 'Selecione um arquivo e escolha o destino para salvá-lo com segurança.',
    clickToSelect: 'Clique para selecionar um arquivo', maxSize: 'Máximo 100 MB',
    destination: 'Destino do upload',
    connectWarning: 'Certifique-se de ter conectado sua conta do {{provider}} primeiro.',
    uploading: 'Enviando arquivo...', startUpload: 'Iniciar Upload',
    successTitle: 'Arquivo enviado com sucesso',
    successDesc: 'Seu arquivo "{{name}}" foi enviado para {{provider}}.',
    errorTitle: 'Erro ao enviar arquivo', errorDesc: 'Algo deu errado durante o upload.',
    tooLargeTitle: 'Arquivo muito grande', tooLargeDesc: 'O arquivo não deve exceder 100 MB.',
  },
  globalSearch: {
    placeholder: 'Buscar em todas as suas nuvens...', hint: 'Digite pelo menos 2 caracteres para buscar',
    noResults: 'Sem resultados para', noIndex: 'Sem índice — busca em tempo real',
    indexed: 'Índice:', buildIndex: 'Construir índice', refreshIndex: 'Atualizar índice',
  },
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
