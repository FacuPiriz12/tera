import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traducciones inline como fallback
const resources = {
  es: {
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
        integrations: "Integraciones"
      },
      language: {
        select: "Seleccionar idioma",
        spanish: "Español",
        english: "English",
        switchLanguage: "Cambiar idioma"
      },
      auth: {
        login: "Iniciar Sesión",
        logout: "Cerrar Sesión",
        loggingOut: "Cerrando sesión..."
      },
      actions: {
        new: "Nuevo",
        search: "Buscar",
        searchPlaceholder: "Buscar en tus archivos...",
        upload: "Subir",
        download: "Descargar",
        copy: "Copiar",
        delete: "Eliminar",
        edit: "Editar",
        view: "Ver"
      },
      user: {
        fallbackName: "Usuario",
        myAccount: "Mi Cuenta",
        profile: "Perfil",
        settings: "Configuración"
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
        loading: "Cargando...",
        success: "Éxito",
        error: "Error",
        completed: "Completado",
        pending: "Pendiente",
        inProgress: "En progreso"
      },
      footer: {
        copyright: "© 2025 TERA. Todos los derechos reservados."
      },
      sidebar: {
        recentActivity: "Actividad Reciente",
        storage: "Almacenamiento",
        storageUsed: "{{used}} de {{total}} usado",
        copyingFiles: "Copiando archivos...",
        filesProgress: "{{completed}} de {{total}} archivos",
        operationCompleted: "Operación completada",
        noRecentActivity: "No hay actividad reciente"
      },
      dashboard: {
        totalFiles: "Total de Archivos",
        activeOperations: "Operaciones Activas", 
        totalOperations: "Total Operaciones",
        completedOperations: "Completadas",
        filesManaged: "Archivos gestionados",
        inProgress: "En progreso", 
        successfully: "Exitosamente",
        operationsPerformed: "Operaciones realizadas",
        recentFiles: "Archivos Recientes",
        noAccountConnected: "Ninguna cuenta ha sido conectada. Por favor, conecte una cuenta en",
        integrations: "Integraciones",
        toStartWorking: "para comenzar a trabajar."
      }
    },
    copy: {
      quickCopy: {
        title: "Copia Rápida",
        urlLabel: "URL Compartida",
        urlPlaceholder: "Ingresa una URL de Google Drive o Dropbox",
        destinationLabel: "Carpeta de destino",
        includeSubfolders: "Incluir subcarpetas",
        preview: "Ver Vista Previa",
        starting: "Iniciando..."
      },
      preview: {
        title: "Vista Previa de Copia",
        analyzing: "Analizando archivos y carpetas...",
        destination: "Destino de copia",
        destinationMessage: "Los archivos se copiarán a esta carpeta",
        confirmCopy: "Confirmar y Copiar",
        initiating: "Iniciando copia..."
      },
      folderBrowser: {
        title: "Seleccionar Carpeta de Destino",
        loading: "Cargando carpetas...",
        noFolders: "No hay subcarpetas en esta ubicación",
        selectCurrent: "Seleccionar esta carpeta",
        goBack: "Volver",
        myDrive: "Mi Drive"
      },
      operations: {
        started: "Copia iniciada",
        startedMessage: "La operación de copia ha comenzado. Puedes ver el progreso en la barra lateral."
      }
    },
    pages: {
      myFiles: {
        title: "Mis Archivos",
        description: "Archivos y carpetas copiados desde Google Drive",
        searchPlaceholder: "Buscar archivos...",
        noFilesFound: "No se encontraron archivos",
        noFilesCopied: "No hay archivos copiados", 
        tryDifferentSearch: "Intenta con otro término de búsqueda",
        filesWillAppearHere: "Los archivos que copies desde Google Drive aparecerán aquí",
        copied: "Copiado",
        showing: "Mostrando",
        to: "a",
        of: "de",
        files: "archivos",
        previous: "Anterior",
        next: "Siguiente"
      },
      operations: {
        title: "Operaciones",
        description: "Historial completo de todas las operaciones de copia realizadas",
        noOperations: "No hay operaciones registradas",
        operationsWillAppear: "Cuando realices copias de archivos, aparecerán aquí con todos los detalles",
        copyOperation: "Operación de Copia",
        date: "Fecha",
        duration: "Duración",
        state: "Estado",
        successful: "Exitoso",
        inProgress: "En curso",
        error: "Error",
        pending: "Pendiente",
        sourceUrl: "URL de origen:",
        copyCompletedSuccessfully: "Copia completada exitosamente",
        copiedFile: "Archivo copiado:",
        linkToCopiedFolder: "Enlace a la carpeta copiada en tu Drive:",
        openInGoogleDrive: "Abrir en Google Drive"
      },
      notFound: {
        title: "404 Página No Encontrada",
        description: "¿Olvidaste agregar la página al router?"
      },
      analytics: {
        title: "Análisis",
        description: "Estadísticas detalladas de tus operaciones de copia",
        totalOperations: "Total Operaciones",
        filesCopied: "Archivos Copiados",
        successRate: "Tasa de Éxito",
        averageTime: "Tiempo Promedio",
        inProgress: "en progreso",
        totalFilesProcessed: "Total de archivos procesados",
        perCompletedOperation: "Por operación completada",
        operationStatus: "Estado de Operaciones",
        completed: "Completadas",
        failed: "Fallidas",
        inProgressStatus: "En Progreso",
        activityLast7Days: "Actividad Últimos 7 Días",
        noDataTitle: "No hay datos para analizar",
        noDataMessage: "Realiza algunas operaciones de copia para ver estadísticas detalladas aquí"
      },
      terms: {
        title: "Términos de Servicio",
        lastUpdated: "Última actualización",
        back: "Volver",
        section1: {
          title: "1. Aceptación de los Términos",
          content: "Al acceder y utilizar TERA (\"el Servicio\"), aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio."
        },
        section2: {
          title: "2. Descripción del Servicio",
          content: "TERA es una aplicación web que permite a los usuarios copiar archivos y carpetas desde enlaces compartidos de Google Drive y Dropbox a su propia cuenta de almacenamiento en la nube. El servicio actúa como intermediario para facilitar la transferencia de archivos entre cuentas de almacenamiento."
        },
        section3: {
          title: "3. Requisitos de Cuenta",
          intro: "Para utilizar el Servicio, debes:",
          item1: "Tener al menos 13 años de edad",
          item2: "Proporcionar información de registro precisa y completa",
          item3: "Mantener la seguridad de tu cuenta y contraseña",
          item4: "Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta"
        },
        section4: {
          title: "4. Uso Aceptable",
          intro: "Te comprometes a NO utilizar el Servicio para:",
          item1: "Copiar, almacenar o distribuir contenido que viole derechos de autor, marcas registradas u otros derechos de propiedad intelectual",
          item2: "Distribuir malware, virus o cualquier código malicioso",
          item3: "Realizar actividades ilegales o fraudulentas",
          item4: "Intentar obtener acceso no autorizado a nuestros sistemas o a las cuentas de otros usuarios",
          item5: "Sobrecargar o interferir con la infraestructura del Servicio",
          item6: "Copiar archivos de los cuales no tienes permiso legítimo de acceso"
        },
        section5: {
          title: "5. Autorización de Google Drive y Dropbox",
          intro: "Al conectar tu cuenta de Google Drive o Dropbox, nos autorizas a:",
          item1: "Acceder a archivos y carpetas compartidos contigo",
          item2: "Crear copias de archivos en tu almacenamiento personal",
          item3: "Leer metadatos de archivos (nombre, tamaño, tipo)",
          note: "Puedes revocar este acceso en cualquier momento desde la configuración de tu cuenta de Google o Dropbox."
        },
        section6: {
          title: "6. Límites del Servicio",
          intro: "El Servicio puede tener límites en:",
          item1: "Número de operaciones de copia por día",
          item2: "Tamaño máximo de archivos que se pueden copiar",
          item3: "Cantidad total de almacenamiento utilizado",
          item4: "Número de operaciones concurrentes",
          note: "Estos límites pueden variar según tu plan de membresía y pueden cambiar sin previo aviso."
        },
        section7: {
          title: "7. Propiedad Intelectual",
          content: "El Servicio y su contenido original (excluyendo el contenido proporcionado por los usuarios) son propiedad de TERA y están protegidos por derechos de autor, marcas registradas y otras leyes."
        },
        section8: {
          title: "8. Responsabilidad del Usuario por el Contenido",
          content: "Eres el único responsable de todo el contenido que copies, almacenes o compartas a través del Servicio. Garantizas que tienes todos los derechos necesarios sobre el contenido que procesas a través de nuestro servicio."
        },
        section9: {
          title: "9. Limitación de Responsabilidad",
          intro: "EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY, TERA NO SERÁ RESPONSABLE DE:",
          item1: "Pérdida de datos, archivos o información",
          item2: "Interrupciones del servicio o errores técnicos",
          item3: "Daños indirectos, incidentales o consecuentes",
          item4: "Uso no autorizado de tu cuenta",
          item5: "Contenido copiado que viole derechos de terceros",
          note: "EL SERVICIO SE PROPORCIONA \"TAL CUAL\" SIN GARANTÍAS DE NINGÚN TIPO, YA SEAN EXPRESAS O IMPLÍCITAS."
        },
        section10: {
          title: "10. Modificaciones al Servicio",
          content: "Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio (o cualquier parte del mismo) en cualquier momento, con o sin previo aviso. No seremos responsables ante ti ni ante terceros por cualquier modificación, suspensión o discontinuación del Servicio."
        },
        section11: {
          title: "11. Terminación",
          content: "Podemos terminar o suspender tu acceso al Servicio inmediatamente, sin previo aviso, por cualquier motivo, incluyendo, sin limitación, si incumples estos Términos de Servicio."
        },
        section12: {
          title: "12. Cambios a los Términos",
          content: "Nos reservamos el derecho de actualizar estos Términos en cualquier momento. Te notificaremos sobre cambios significativos publicando los nuevos términos en esta página y actualizando la fecha de \"Última actualización\"."
        },
        section13: {
          title: "13. Ley Aplicable",
          content: "Estos Términos se regirán e interpretarán de acuerdo con las leyes de tu jurisdicción local, sin dar efecto a ningún principio de conflictos de leyes."
        },
        section14: {
          title: "14. Contacto",
          content: "Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos en:",
          email: "facupiriz87@gmail.com"
        }
      },
      privacy: {
        title: "Política de Privacidad",
        lastUpdated: "Última actualización",
        back: "Volver",
        section1: {
          title: "1. Introducción",
          content: "TERA (\"nosotros\", \"nuestro\" o \"el Servicio\") se compromete a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando utilizas nuestro servicio de copia de archivos de almacenamiento en la nube."
        },
        section2: {
          title: "2. Información que Recopilamos",
          subsection1: {
            title: "2.1 Información que Proporcionas Directamente",
            item1: "Información de cuenta: nombre, apellido, dirección de correo electrónico",
            item2: "Credenciales de autenticación: tokens de acceso OAuth para Google Drive y Dropbox",
            item3: "Información de perfil: imagen de perfil (opcional)"
          },
          subsection2: {
            title: "2.2 Información Recopilada Automáticamente",
            item1: "Datos de uso: URLs de archivos copiados, nombres de archivos, tamaños, fechas de operación",
            item2: "Metadatos de archivos: tipo de archivo, proveedor de almacenamiento (Google Drive/Dropbox)",
            item3: "Información técnica: dirección IP, tipo de navegador, sistema operativo",
            item4: "Cookies y tecnologías similares: para mantener tu sesión y preferencias"
          },
          subsection3: {
            title: "2.3 Información de Proveedores de Almacenamiento",
            intro: "Cuando conectas tu cuenta de Google Drive o Dropbox, recibimos:",
            item1: "Información básica de perfil (nombre, email, foto)",
            item2: "Tokens de acceso para realizar operaciones en tu nombre",
            item3: "Lista de archivos y carpetas a los que tienes acceso"
          }
        },
        section3: {
          title: "3. Cómo Utilizamos tu Información",
          intro: "Utilizamos la información recopilada para:",
          item1: "Proporcionar el Servicio: copiar archivos entre cuentas de almacenamiento en la nube",
          item2: "Gestionar tu cuenta: autenticación, acceso y configuraciones personales",
          item3: "Mejorar el Servicio: análisis de uso, corrección de errores, desarrollo de nuevas funcionalidades",
          item4: "Comunicarnos contigo: notificaciones de servicio, actualizaciones importantes",
          item5: "Seguridad: detectar y prevenir fraudes, abusos o actividades no autorizadas",
          item6: "Cumplimiento legal: responder a solicitudes legales y hacer cumplir nuestros términos"
        },
        section4: {
          title: "4. Acceso a Google Drive y Dropbox",
          subsection1: {
            title: "4.1 Scopes de Google Drive",
            intro: "Solicitamos los siguientes permisos de Google:",
            item1: "https://www.googleapis.com/auth/drive - Acceso completo a Google Drive para copiar archivos",
            item2: "https://www.googleapis.com/auth/drive.file - Acceso a archivos creados por la aplicación"
          },
          subsection2: {
            title: "4.2 Scopes de Dropbox",
            intro: "Solicitamos los siguientes permisos de Dropbox:",
            item1: "Lectura y escritura de archivos",
            item2: "Acceso a enlaces compartidos",
            item3: "Creación de carpetas"
          },
          subsection3: {
            title: "4.3 Uso Limitado",
            content: "El uso que hace TERA de la información recibida de las APIs de Google y Dropbox cumple con las Políticas de Datos de Usuario de Google API Services, incluyendo los requisitos de Uso Limitado.",
            intro: "NO transferimos, vendemos ni utilizamos datos de Google Drive o Dropbox para:",
            item1: "Publicidad personalizada",
            item2: "Perfiles de comportamiento de usuarios",
            item3: "Entrenar modelos de inteligencia artificial",
            item4: "Cualquier propósito no directamente relacionado con la funcionalidad de copia de archivos"
          }
        },
        section5: {
          title: "5. Almacenamiento y Seguridad de Datos",
          subsection1: {
            title: "5.1 Dónde Almacenamos tus Datos",
            item1: "Base de datos: PostgreSQL alojada en la nube",
            item2: "Tokens de autenticación: Encriptados en la base de datos",
            item3: "Archivos: NO almacenamos el contenido de tus archivos; solo metadatos"
          },
          subsection2: {
            title: "5.2 Medidas de Seguridad",
            item1: "Conexiones HTTPS/TLS encriptadas",
            item2: "Tokens OAuth almacenados de forma segura",
            item3: "Autenticación con verificación de email",
            item4: "Gestión de sesiones seguras",
            item5: "Acceso limitado a datos del servidor"
          },
          subsection3: {
            title: "5.3 Retención de Datos",
            content: "Conservamos tu información mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta en cualquier momento, y eliminaremos tus datos dentro de los 30 días siguientes."
          }
        },
        section6: {
          title: "6. Compartir Información con Terceros",
          intro: "NO vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en los siguientes casos:",
          subsection1: {
            title: "6.1 Proveedores de Servicios",
            item1: "Autenticación de usuarios",
            item2: "Almacenamiento de base de datos",
            item3: "Hosting y deployment",
            item4: "APIs de almacenamiento en la nube (Google/Dropbox)"
          },
          subsection2: {
            title: "6.2 Requisitos Legales",
            content: "Podemos divulgar tu información si es requerido por ley, orden judicial, proceso legal o solicitud gubernamental."
          }
        },
        section7: {
          title: "7. Tus Derechos y Opciones",
          intro: "Tienes derecho a:",
          item1: "Acceder: Solicitar una copia de tu información personal",
          item2: "Rectificar: Corregir información inexacta o incompleta",
          item3: "Eliminar: Solicitar la eliminación de tu cuenta y datos asociados",
          item4: "Revocar acceso: Desconectar Google Drive o Dropbox en cualquier momento",
          item5: "Portabilidad: Exportar tus datos en formato legible",
          item6: "Oponerte: Rechazar ciertos usos de tu información",
          contact: "Para ejercer estos derechos, contáctanos en: facupiriz87@gmail.com"
        },
        section8: {
          title: "8. Cookies y Tecnologías de Seguimiento",
          intro: "Utilizamos cookies para:",
          item1: "Mantener tu sesión de usuario iniciada",
          item2: "Recordar tus preferencias de idioma y tema",
          item3: "Analizar el uso del servicio (cookies analíticas opcionales)",
          note: "Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar la funcionalidad del servicio."
        },
        section9: {
          title: "9. Privacidad de Menores",
          content: "Nuestro servicio no está dirigido a menores de 13 años. No recopilamos conscientemente información personal de menores de 13 años. Si descubrimos que hemos recopilado información de un menor sin consentimiento parental, tomaremos medidas para eliminar esa información."
        },
        section10: {
          title: "10. Transferencias Internacionales de Datos",
          content: "Tus datos pueden ser transferidos y procesados en servidores ubicados fuera de tu país de residencia. Tomamos medidas para garantizar que tus datos reciban un nivel adecuado de protección."
        },
        section11: {
          title: "11. Cambios a esta Política de Privacidad",
          content: "Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos publicando la nueva política en esta página y actualizando la fecha de \"Última actualización\"."
        },
        section12: {
          title: "12. Contacto",
          content: "Si tienes preguntas, inquietudes o solicitudes sobre esta Política de Privacidad o el manejo de tus datos, contáctanos en:",
          email: "facupiriz87@gmail.com"
        },
        section13: {
          title: "13. Cumplimiento de GDPR (Usuarios de la UE)",
          intro: "Si resides en la Unión Europea, tienes derechos adicionales bajo el Reglamento General de Protección de Datos (GDPR):",
          item1: "Base legal para el procesamiento: consentimiento y ejecución de contrato",
          item2: "Derecho a presentar una queja ante una autoridad supervisora",
          item3: "Derecho a la portabilidad de datos en formato estructurado",
          item4: "Derecho a retirar el consentimiento en cualquier momento"
        }
      }
    },
    landing: {
      hero: {
        title: "Copia archivos de Google Drive",
        subtitle: "de forma inteligente",
        description: "TERA te permite copiar archivos y carpetas desde drives compartidos a tu Google Drive personal con solo pegar una URL. Simple, rápido y seguro.",
        ctaButton: "Comenzar Ahora"
      },
      features: {
        title: "¿Por qué elegir TERA?",
        subtitle: "Diseñado para hacer que copiar archivos de Google Drive sea tan simple como pegar una URL",
        smartCopy: {
          title: "Copia Inteligente",
          description: "Copia archivos y carpetas completas manteniendo la estructura original"
        },
        driveCompatible: {
          title: "Compatible con Drive",
          description: "Funciona con cualquier enlace público o privado de Google Drive"
        },
        fast: {
          title: "Súper Rápido",
          description: "Copia directa servidor a servidor sin descargar archivos localmente"
        },
        secure: {
          title: "100% Seguro",
          description: "Usa la autenticación oficial de Google. Tus datos siempre protegidos"
        }
      },
      howItWorks: {
        title: "Cómo funciona",
        subtitle: "En solo 3 simples pasos tendrás tus archivos copiados",
        step1: {
          title: "Pega la URL",
          description: "Copia la URL del archivo o carpeta de Google Drive que quieres clonar"
        },
        step2: {
          title: "Elige destino",
          description: "Selecciona dónde quieres guardar los archivos en tu Google Drive"
        },
        step3: {
          title: "¡Listo!",
          description: "Los archivos se copian automáticamente. Puedes ver el progreso en tiempo real"
        }
      },
      cta: {
        title: "¿Listo para comenzar?",
        subtitle: "Únete a miles de usuarios que ya están copiando archivos de forma inteligente",
        button: "Iniciar Sesión con Google"
      },
      footer: {
        tagline: "Gestor de Archivos Inteligente - Hecho con ❤️ para la comunidad"
      }
    },
    errors: {
      validation: {
        urlRequired: "URL requerida",
        invalidUrl: "Por favor ingresa una URL válida de Google Drive",
        invalidEmail: "Por favor ingresa un email válido",
        passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
        nameRequired: "El nombre es requerido",
        acceptTermsRequired: "Debes aceptar los términos y condiciones",
        passwordsDoNotMatch: "Las contraseñas no coinciden"
      },
      loginFailed: "Error al iniciar sesión",
      signupFailed: "Error al crear cuenta",
      tryAgain: "Por favor intenta de nuevo"
    },
    auth: {
      login: {
        title: "Iniciar Sesión",
        subtitle: "Accede a tu cuenta de TERA",
        continueWithReplit: "Continuar con Replit",
        orContinueWith: "o continúa con",
        emailLabel: "Correo electrónico",
        emailPlaceholder: "tu@email.com",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "Tu contraseña",
        signInButton: "Iniciar Sesión",
        forgotPassword: "¿Olvidaste tu contraseña?",
        noAccount: "¿No tienes una cuenta?",
        signUp: "Regístrate",
        success: "Inicio de sesión exitoso",
        welcomeBack: "Bienvenido de vuelta"
      },
      signup: {
        title: "Crear Cuenta",
        subtitle: "Únete a TERA y comienza a gestionar tus archivos",
        continueWithReplit: "Registrarse con Replit",
        orCreateAccountWith: "o crear cuenta con",
        nameLabel: "Nombre completo",
        namePlaceholder: "Tu nombre completo",
        emailLabel: "Correo electrónico",
        emailPlaceholder: "tu@email.com",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "Mínimo 6 caracteres",
        confirmPasswordLabel: "Confirmar contraseña",
        confirmPasswordPlaceholder: "Confirma tu contraseña",
        acceptTerms: {
          part1: "Acepto los",
          termsLink: "términos de servicio",
          and: "y",
          privacyLink: "política de privacidad"
        },
        createAccountButton: "Crear Cuenta",
        hasAccount: "¿Ya tienes una cuenta?",
        signIn: "Inicia sesión",
        success: "Registro exitoso",
        checkEmail: "Revisa tu correo para verificar tu cuenta"
      },
      emailConfirmation: {
        verifying: "Verificando tu email",
        confirmed: "¡Email confirmado!",
        failed: "Error en la verificación",
        verifyingDescription: "Estamos verificando tu dirección de correo electrónico...",
        confirmedDescription: "Tu cuenta ha sido verificada exitosamente",
        failedDescription: "No pudimos verificar tu dirección de correo",
        success: "Tu cuenta ha sido verificada correctamente",
        error: "Hubo un problema al verificar tu cuenta",
        invalidLink: "El enlace de verificación no es válido o ha expirado",
        redirecting: "Serás redirigido automáticamente en unos segundos...",
        continueToApp: "Ir a la aplicación",
        signupAgain: "Registrarse nuevamente",
        tryLogin: "Intentar iniciar sesión"
      },
      validation: {
        invalidEmail: "Por favor ingresa un email válido",
        passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
        nameRequired: "El nombre es requerido",
        acceptTermsRequired: "Debes aceptar los términos y condiciones",
        passwordsDoNotMatch: "Las contraseñas no coinciden"
      },
      signupSuccess: {
        title: "¡Registro Exitoso!",
        subtitle: "Tu cuenta ha sido creada correctamente",
        checkEmailTitle: "Revisa tu correo electrónico",
        checkEmailDescription: "Te hemos enviado un email de verificación. Haz clic en el enlace para activar tu cuenta.",
        nextStepsTitle: "Próximos pasos:",
        step1: "Abre tu bandeja de entrada de correo",
        step2: "Busca el email de verificación de TERA",
        step3: "Haz clic en el enlace de verificación",
        continueToLogin: "Ir a Iniciar Sesión",
        backToHome: "Volver al Inicio",
        noEmail: "¿No recibiste el correo?",
        tryAgain: "Intenta registrarte de nuevo"
      }
    }
  },
  en: {
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
        integrations: "Integrations"
      },
      language: {
        select: "Select language",
        spanish: "Español",
        english: "English",
        switchLanguage: "Switch language"
      },
      auth: {
        login: "Log In",
        logout: "Log Out",
        loggingOut: "Logging out..."
      },
      actions: {
        new: "New",
        search: "Search",
        searchPlaceholder: "Search your files...",
        upload: "Upload",
        download: "Download",
        copy: "Copy",
        delete: "Delete",
        edit: "Edit",
        view: "View"
      },
      user: {
        fallbackName: "User",
        myAccount: "My Account",
        profile: "Profile",
        settings: "Settings"
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
        loading: "Loading...",
        success: "Success",
        error: "Error",
        completed: "Completed",
        pending: "Pending",
        inProgress: "In progress"
      },
      footer: {
        copyright: "© 2025 TERA. All rights reserved."
      },
      sidebar: {
        recentActivity: "Recent Activity",
        storage: "Storage",
        storageUsed: "{{used}} of {{total}} used",
        copyingFiles: "Copying files...",
        filesProgress: "{{completed}} of {{total}} files",
        operationCompleted: "Operation completed",
        noRecentActivity: "No recent activity"
      },
      dashboard: {
        totalFiles: "Total Files",
        activeOperations: "Active Operations", 
        totalOperations: "Total Operations",
        completedOperations: "Completed",
        filesManaged: "Files managed",
        inProgress: "In progress", 
        successfully: "Successfully",
        operationsPerformed: "Operations performed",
        recentFiles: "Recent Files",
        noAccountConnected: "No account has been connected. Please connect an account in",
        integrations: "Integrations",
        toStartWorking: "to start working."
      }
    },
    copy: {
      quickCopy: {
        title: "Quick Copy",
        urlLabel: "Shared URL",
        urlPlaceholder: "Enter a URL from Google Drive or Dropbox",
        destinationLabel: "Destination folder",
        includeSubfolders: "Include subfolders",
        preview: "Preview",
        starting: "Starting..."
      },
      preview: {
        title: "Copy Preview",
        analyzing: "Analyzing files and folders...",
        destination: "Copy destination",
        destinationMessage: "Files will be copied to this folder",
        confirmCopy: "Confirm and Copy",
        initiating: "Starting copy..."
      },
      folderBrowser: {
        title: "Select Destination Folder",
        loading: "Loading folders...",
        noFolders: "No subfolders in this location", 
        selectCurrent: "Select this folder",
        goBack: "Go back",
        myDrive: "My Drive"
      },
      operations: {
        started: "Copy started",
        startedMessage: "The copy operation has started. You can see the progress in the sidebar."
      }
    },
    pages: {
      myFiles: {
        title: "My Files",
        description: "Files and folders copied from Google Drive",
        searchPlaceholder: "Search files...",
        noFilesFound: "No files found",
        noFilesCopied: "No files copied", 
        tryDifferentSearch: "Try a different search term",
        filesWillAppearHere: "Files you copy from Google Drive will appear here",
        copied: "Copied",
        showing: "Showing",
        to: "to",
        of: "of",
        files: "files",
        previous: "Previous",
        next: "Next"
      },
      operations: {
        title: "Operations",
        description: "Complete history of all copy operations performed",
        noOperations: "No operations recorded",
        operationsWillAppear: "When you perform file copies, they will appear here with all the details",
        copyOperation: "Copy Operation",
        date: "Date",
        duration: "Duration",
        state: "State",
        successful: "Successful",
        inProgress: "In progress",
        error: "Error",
        pending: "Pending",
        sourceUrl: "Source URL:",
        copyCompletedSuccessfully: "Copy completed successfully",
        copiedFile: "Copied file:",
        linkToCopiedFolder: "Link to copied folder in your Drive:",
        openInGoogleDrive: "Open in Google Drive"
      },
      notFound: {
        title: "404 Page Not Found",
        description: "Did you forget to add the page to the router?"
      },
      analytics: {
        title: "Analytics",
        description: "Detailed statistics of your copy operations",
        totalOperations: "Total Operations",
        filesCopied: "Files Copied",
        successRate: "Success Rate",
        averageTime: "Average Time",
        inProgress: "in progress",
        totalFilesProcessed: "Total files processed",
        perCompletedOperation: "Per completed operation",
        operationStatus: "Operation Status",
        completed: "Completed",
        failed: "Failed",
        inProgressStatus: "In Progress",
        activityLast7Days: "Activity Last 7 Days",
        noDataTitle: "No data to analyze",
        noDataMessage: "Perform some copy operations to see detailed statistics here"
      },
      terms: {
        title: "Terms of Service",
        lastUpdated: "Last updated",
        back: "Back",
        section1: {
          title: "1. Acceptance of Terms",
          content: "By accessing and using TERA (\"the Service\"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our service."
        },
        section2: {
          title: "2. Service Description",
          content: "TERA is a web application that allows users to copy files and folders from shared Google Drive and Dropbox links to their own cloud storage account. The service acts as an intermediary to facilitate file transfers between storage accounts."
        },
        section3: {
          title: "3. Account Requirements",
          intro: "To use the Service, you must:",
          item1: "Be at least 13 years of age",
          item2: "Provide accurate and complete registration information",
          item3: "Maintain the security of your account and password",
          item4: "Notify us immediately of any unauthorized use of your account"
        },
        section4: {
          title: "4. Acceptable Use",
          intro: "You agree NOT to use the Service to:",
          item1: "Copy, store, or distribute content that violates copyright, trademarks, or other intellectual property rights",
          item2: "Distribute malware, viruses, or any malicious code",
          item3: "Engage in illegal or fraudulent activities",
          item4: "Attempt to gain unauthorized access to our systems or other users' accounts",
          item5: "Overload or interfere with the Service infrastructure",
          item6: "Copy files to which you do not have legitimate access permission"
        },
        section5: {
          title: "5. Google Drive and Dropbox Authorization",
          intro: "By connecting your Google Drive or Dropbox account, you authorize us to:",
          item1: "Access files and folders shared with you",
          item2: "Create copies of files in your personal storage",
          item3: "Read file metadata (name, size, type)",
          note: "You can revoke this access at any time from your Google or Dropbox account settings."
        },
        section6: {
          title: "6. Service Limits",
          intro: "The Service may have limits on:",
          item1: "Number of copy operations per day",
          item2: "Maximum file size that can be copied",
          item3: "Total storage amount used",
          item4: "Number of concurrent operations",
          note: "These limits may vary according to your membership plan and may change without prior notice."
        },
        section7: {
          title: "7. Intellectual Property",
          content: "The Service and its original content (excluding user-provided content) are owned by TERA and are protected by copyright, trademark, and other laws."
        },
        section8: {
          title: "8. User Responsibility for Content",
          content: "You are solely responsible for all content you copy, store, or share through the Service. You warrant that you have all necessary rights to the content you process through our service."
        },
        section9: {
          title: "9. Limitation of Liability",
          intro: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, TERA SHALL NOT BE LIABLE FOR:",
          item1: "Loss of data, files, or information",
          item2: "Service interruptions or technical errors",
          item3: "Indirect, incidental, or consequential damages",
          item4: "Unauthorized use of your account",
          item5: "Copied content that violates third-party rights",
          note: "THE SERVICE IS PROVIDED \"AS IS\" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED."
        },
        section10: {
          title: "10. Service Modifications",
          content: "We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without prior notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service."
        },
        section11: {
          title: "11. Termination",
          content: "We may terminate or suspend your access to the Service immediately, without prior notice, for any reason, including, without limitation, if you breach these Terms of Service."
        },
        section12: {
          title: "12. Changes to Terms",
          content: "We reserve the right to update these Terms at any time. We will notify you of significant changes by posting the new terms on this page and updating the \"Last Updated\" date."
        },
        section13: {
          title: "13. Governing Law",
          content: "These Terms shall be governed and construed in accordance with the laws of your local jurisdiction, without giving effect to any principles of conflicts of laws."
        },
        section14: {
          title: "14. Contact",
          content: "If you have questions about these Terms of Service, you can contact us at:",
          email: "facupiriz87@gmail.com"
        }
      },
      privacy: {
        title: "Privacy Policy",
        lastUpdated: "Last updated",
        back: "Back",
        section1: {
          title: "1. Introduction",
          content: "TERA (\"we\", \"our\", or \"the Service\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our cloud storage file copying service."
        },
        section2: {
          title: "2. Information We Collect",
          subsection1: {
            title: "2.1 Information You Provide Directly",
            item1: "Account information: name, surname, email address",
            item2: "Authentication credentials: OAuth access tokens for Google Drive and Dropbox",
            item3: "Profile information: profile picture (optional)"
          },
          subsection2: {
            title: "2.2 Information Collected Automatically",
            item1: "Usage data: URLs of copied files, file names, sizes, operation dates",
            item2: "File metadata: file type, storage provider (Google Drive/Dropbox)",
            item3: "Technical information: IP address, browser type, operating system",
            item4: "Cookies and similar technologies: to maintain your session and preferences"
          },
          subsection3: {
            title: "2.3 Information from Storage Providers",
            intro: "When you connect your Google Drive or Dropbox account, we receive:",
            item1: "Basic profile information (name, email, photo)",
            item2: "Access tokens to perform operations on your behalf",
            item3: "List of files and folders you have access to"
          }
        },
        section3: {
          title: "3. How We Use Your Information",
          intro: "We use the collected information to:",
          item1: "Provide the Service: copy files between cloud storage accounts",
          item2: "Manage your account: authentication, access, and personal settings",
          item3: "Improve the Service: usage analysis, bug fixes, new feature development",
          item4: "Communicate with you: service notifications, important updates",
          item5: "Security: detect and prevent fraud, abuse, or unauthorized activities",
          item6: "Legal compliance: respond to legal requests and enforce our terms"
        },
        section4: {
          title: "4. Google Drive and Dropbox Access",
          subsection1: {
            title: "4.1 Google Drive Scopes",
            intro: "We request the following Google permissions:",
            item1: "https://www.googleapis.com/auth/drive - Full access to Google Drive for copying files",
            item2: "https://www.googleapis.com/auth/drive.file - Access to files created by the application"
          },
          subsection2: {
            title: "4.2 Dropbox Scopes",
            intro: "We request the following Dropbox permissions:",
            item1: "File read and write",
            item2: "Shared link access",
            item3: "Folder creation"
          },
          subsection3: {
            title: "4.3 Limited Use",
            content: "TERA's use of information received from Google and Dropbox APIs complies with Google API Services User Data Policies, including Limited Use requirements.",
            intro: "We do NOT transfer, sell, or use Google Drive or Dropbox data for:",
            item1: "Personalized advertising",
            item2: "User behavior profiling",
            item3: "Training artificial intelligence models",
            item4: "Any purpose not directly related to file copying functionality"
          }
        },
        section5: {
          title: "5. Data Storage and Security",
          subsection1: {
            title: "5.1 Where We Store Your Data",
            item1: "Database: Cloud-hosted PostgreSQL",
            item2: "Authentication tokens: Encrypted in the database",
            item3: "Files: We do NOT store the content of your files; only metadata"
          },
          subsection2: {
            title: "5.2 Security Measures",
            item1: "Encrypted HTTPS/TLS connections",
            item2: "Securely stored OAuth tokens",
            item3: "Email verification authentication",
            item4: "Secure session management",
            item5: "Limited server data access"
          },
          subsection3: {
            title: "5.3 Data Retention",
            content: "We retain your information while your account is active. You can request account deletion at any time, and we will delete your data within 30 days."
          }
        },
        section6: {
          title: "6. Sharing Information with Third Parties",
          intro: "We do NOT sell, rent, or share your personal information with third parties, except in the following cases:",
          subsection1: {
            title: "6.1 Service Providers",
            item1: "User authentication",
            item2: "Database storage",
            item3: "Hosting and deployment",
            item4: "Cloud storage APIs (Google/Dropbox)"
          },
          subsection2: {
            title: "6.2 Legal Requirements",
            content: "We may disclose your information if required by law, court order, legal process, or government request."
          }
        },
        section7: {
          title: "7. Your Rights and Choices",
          intro: "You have the right to:",
          item1: "Access: Request a copy of your personal information",
          item2: "Rectify: Correct inaccurate or incomplete information",
          item3: "Delete: Request deletion of your account and associated data",
          item4: "Revoke access: Disconnect Google Drive or Dropbox at any time",
          item5: "Portability: Export your data in a readable format",
          item6: "Object: Reject certain uses of your information",
          contact: "To exercise these rights, contact us at: facupiriz87@gmail.com"
        },
        section8: {
          title: "8. Cookies and Tracking Technologies",
          intro: "We use cookies to:",
          item1: "Keep your user session logged in",
          item2: "Remember your language and theme preferences",
          item3: "Analyze service usage (optional analytics cookies)",
          note: "You can configure your browser to reject cookies, but this may affect service functionality."
        },
        section9: {
          title: "9. Children's Privacy",
          content: "Our service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover we have collected information from a minor without parental consent, we will take steps to delete that information."
        },
        section10: {
          title: "10. International Data Transfers",
          content: "Your data may be transferred and processed on servers located outside your country of residence. We take measures to ensure your data receives an adequate level of protection."
        },
        section11: {
          title: "11. Changes to This Privacy Policy",
          content: "We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on this page and updating the \"Last Updated\" date."
        },
        section12: {
          title: "12. Contact",
          content: "If you have questions, concerns, or requests about this Privacy Policy or the handling of your data, contact us at:",
          email: "facupiriz87@gmail.com"
        },
        section13: {
          title: "13. GDPR Compliance (EU Users)",
          intro: "If you reside in the European Union, you have additional rights under the General Data Protection Regulation (GDPR):",
          item1: "Legal basis for processing: consent and contract execution",
          item2: "Right to file a complaint with a supervisory authority",
          item3: "Right to data portability in structured format",
          item4: "Right to withdraw consent at any time"
        }
      }
    },
    landing: {
      hero: {
        title: "Copy Google Drive files",
        subtitle: "intelligently",
        description: "TERA allows you to copy files and folders from shared drives to your personal Google Drive by just pasting a URL. Simple, fast and secure.",
        ctaButton: "Get Started"
      },
      features: {
        title: "Why choose TERA?",
        subtitle: "Designed to make copying Google Drive files as simple as pasting a URL",
        smartCopy: {
          title: "Smart Copy",
          description: "Copy complete files and folders while maintaining the original structure"
        },
        driveCompatible: {
          title: "Drive Compatible",
          description: "Works with any public or private Google Drive link"
        },
        fast: {
          title: "Super Fast",
          description: "Direct server-to-server copy without downloading files locally"
        },
        secure: {
          title: "100% Secure",
          description: "Uses official Google authentication. Your data always protected"
        }
      },
      howItWorks: {
        title: "How it works",
        subtitle: "In just 3 simple steps you'll have your files copied",
        step1: {
          title: "Paste the URL",
          description: "Copy the URL of the Google Drive file or folder you want to clone"
        },
        step2: {
          title: "Choose destination",
          description: "Select where you want to save the files in your Google Drive"
        },
        step3: {
          title: "Done!",
          description: "Files are copied automatically. You can see the progress in real-time"
        }
      },
      cta: {
        title: "Ready to get started?",
        subtitle: "Join thousands of users who are already copying files intelligently",
        button: "Sign In with Google"
      },
      footer: {
        tagline: "Smart File Manager - Made with ❤️ for the community"
      }
    },
    errors: {
      validation: {
        urlRequired: "URL required",
        invalidUrl: "Please enter a valid Google Drive URL",
        invalidEmail: "Please enter a valid email",
        passwordTooShort: "Password must be at least 6 characters",
        nameRequired: "Name is required",
        acceptTermsRequired: "You must accept the terms and conditions",
        passwordsDoNotMatch: "Passwords do not match"
      },
      loginFailed: "Login failed",
      signupFailed: "Account creation failed",
      tryAgain: "Please try again"
    },
    auth: {
      login: {
        title: "Sign In",
        subtitle: "Access your TERA account",
        continueWithReplit: "Continue with Replit",
        orContinueWith: "or continue with",
        emailLabel: "Email address",
        emailPlaceholder: "your@email.com",
        passwordLabel: "Password",
        passwordPlaceholder: "Your password",
        signInButton: "Sign In",
        forgotPassword: "Forgot your password?",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
        success: "Login successful",
        welcomeBack: "Welcome back"
      },
      signup: {
        title: "Create Account",
        subtitle: "Join TERA and start managing your files",
        continueWithReplit: "Sign up with Replit",
        orCreateAccountWith: "or create account with",
        nameLabel: "Full name",
        namePlaceholder: "Your full name",
        emailLabel: "Email address",
        emailPlaceholder: "your@email.com",
        passwordLabel: "Password",
        passwordPlaceholder: "At least 6 characters",
        confirmPasswordLabel: "Confirm password",
        confirmPasswordPlaceholder: "Confirm your password",
        acceptTerms: {
          part1: "I accept the",
          termsLink: "terms of service",
          and: "and",
          privacyLink: "privacy policy"
        },
        createAccountButton: "Create Account",
        hasAccount: "Already have an account?",
        signIn: "Sign in",
        success: "Registration successful",
        checkEmail: "Check your email to verify your account"
      },
      emailConfirmation: {
        verifying: "Verifying your email",
        confirmed: "Email confirmed!",
        failed: "Verification failed",
        verifyingDescription: "We're verifying your email address...",
        confirmedDescription: "Your account has been successfully verified",
        failedDescription: "We couldn't verify your email address",
        success: "Your account has been verified successfully",
        error: "There was a problem verifying your account",
        invalidLink: "The verification link is invalid or has expired",
        redirecting: "You'll be automatically redirected in a few seconds...",
        continueToApp: "Go to app",
        signupAgain: "Sign up again",
        tryLogin: "Try logging in"
      },
      validation: {
        invalidEmail: "Please enter a valid email",
        passwordTooShort: "Password must be at least 6 characters",
        nameRequired: "Name is required",
        acceptTermsRequired: "You must accept the terms and conditions",
        passwordsDoNotMatch: "Passwords do not match"
      },
      signupSuccess: {
        title: "Registration Successful!",
        subtitle: "Your account has been created successfully",
        checkEmailTitle: "Check your email",
        checkEmailDescription: "We've sent you a verification email. Click the link to activate your account.",
        nextStepsTitle: "Next steps:",
        step1: "Open your email inbox",
        step2: "Look for the verification email from TERA",
        step3: "Click the verification link",
        continueToLogin: "Go to Login",
        backToHome: "Back to Home",
        noEmail: "Didn't receive the email?",
        tryAgain: "Try signing up again"
      }
    }
  }
};

// Evitar inicialización duplicada durante HMR
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // Configuración de detección de idioma
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      
      resources,
      fallbackLng: 'es', // Español por defecto
      debug: import.meta.env.DEV,
      
      // Idiomas soportados
      supportedLngs: ['es', 'en'],
      
      // Espacios de nombres
      ns: ['common', 'copy', 'errors', 'landing', 'pages', 'auth'],
      defaultNS: 'common',
      
      interpolation: {
        escapeValue: false, // React ya escapa los valores
      },
      
      // Opciones específicas de React
      react: {
        useSuspense: false, // Desactivar suspense para mejor control
      },
    });
}

export default i18n;