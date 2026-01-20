import i18n from 'i18next';
// Note: Add the following translation keys to the Spanish (es) translations:
// 'auth.resetPassword.newPasswordLabel': 'Nueva contraseña'
// 
// And for English (en) translations:
// 'auth.resetPassword.newPasswordLabel': 'New password'
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
        forgotPassword: {
          title: "Olvidé mi contraseña",
          description: "Introduce tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.",
          emailLabel: "Correo electrónico",
          emailPlaceholder: "tu@email.com",
          submitButton: "Enviar instrucciones",
          successTitle: "¡Pronto!",
          successDesc: "Hemos enviado un email a {{email}} para confirmar.",
          backToLogin: "Volver al inicio de sesión"
        },
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
            welcomeMessages: ["¡Bienvenido de nuevo!", "¡Hola de nuevo!", "Qué bueno verte"],
            emailLabel: "Correo electrónico",
            emailPlaceholder: "tu@email.com",
            passwordLabel: "Contraseña",
            passwordPlaceholder: "Tu contraseña",
            signInButton: "Iniciar Sesión",
            noAccount: "¿No tienes cuenta? Regístrate",
            forgotPassword: "¿Olvidaste tu contraseña?"
          },
          signup: {
            title: "Crea tu cuenta",
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
            content: "Si alguna parte de estos términos es inválida, el resto seguirá siendo vigente."
          },
          section13: {
            title: "13. Ley Aplicable",
            content: "Estos términos se rigen por las leyes internacionales de comercio electrónico."
          },
          section14: {
            title: "14. Contacto",
            content: "Para dudas legales, contáctanos.",
            email: "legal@tera.cloud"
          }
        },
        notFound: {
          title: "Página no encontrada",
          description: "Lo sentimos, la página que estás buscando no existe."
        },
        errors: {
          loginFailed: "Error al iniciar sesión",
          signupFailed: "Error al crear cuenta",
          tryAgain: "Por favor, inténtalo de nuevo"
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
        forgotPassword: {
          title: "Forgot password",
          description: "Enter your email address and we'll send you instructions to reset your password.",
          emailLabel: "Email address",
          emailPlaceholder: "you@email.com",
          submitButton: "Send instructions",
          successTitle: "Ready!",
          successDesc: "We've sent an email to {{email}} to confirm.",
          backToLogin: "Back to login"
        },
        resetPassword: {
          title: "Choose new password",
          description: "Almost done. Enter your new password and you're all set.",
          passwordLabel: "New password",
          confirmPasswordLabel: "Confirm new password",
          submitButton: "Reset password",
          successTitle: "Password updated",
          successDesc: "Your password has been successfully reset.",
          successLongDesc: "Your password has been updated. You can now log in with your new password.",
          backToLogin: "Back to login",
          req: {
            lowercase: "one lowercase character",
            special: "one special character",
            uppercase: "one uppercase character",
            minimum: "8 character minimum",
            number: "one number"
          }
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
      landing: {
        hero: {
          title: "Move and protect your files with",
          subtitle: "Real Intelligence",
          description: "TERA is the bridge between your clouds. Transfer files between platforms, schedule automatic backups, and connect your favorite tools in seconds.",
          ctaButton: "Start for free today",
          demoButton: "See demo",
          integrationsLabel: "Top Integrations",
          syncBadge: "Auto-Sync",
          transferLabel: "Transfer",
          backupLabel: "Backup",
          completed: "Completed",
          scanning: "Scanning",
          freedLabel: "Freed",
          duplicatesLabel: "Duplicates",
          securityBadge: "Active Security",
          encryptionLabel: "256-bit encryption"
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
            description: "Move gigabytes between Dropbox, Drive and OneDrive with a single click. Without downloading anything to your computer."
          },
          feature2: {
            title: "Smart Backups",
            description: "Schedule automatic backups between clouds so your most important files always have a mirror."
          },
          feature3: {
            title: "+50 Native Integrations",
            description: "Connect Slack, Teams, Notion and all your work tools to centralize your digital ecosystem."
          }
        },
        ai: {
          title: "You define the rules,",
          subtitle: "TERA executes them for you.",
          description: "Set up powerful workflows in seconds. TERA monitors your files 24/7 and performs repetitive tasks so you don't have to.",
          panelTitle: "Automation Panel",
          panelStatus: "Active Intelligent System",
          aiMessage: "\"I have detected 150 new files in your Dropbox. Do you want me to start the automatic migration to your 2024 Projects folder in Google Drive?\"",
          userResponse: "\"Yes, please. And delete duplicates older than 6 months.\"",
          progressLabel: "Migration in progress",
          suggestions: {
            suggestion1: "Move my files from Dropbox to Google Drive",
            suggestion2: "Create a backup of my photos in OneDrive",
            suggestion3: "What clouds do I currently have integrated?",
            suggestion4: "Transfer the 'Projects' folder to my Box account",
            suggestion5: "Sync my Notion folder with my Drive"
          }
        },
        security: {
          badge: "Security without Compromise",
          title: "Sleeping soundly is part of the plan",
          description: "We don't skimp on security. TERA uses the same protocols as global financial institutions to ensure your data never falls into the wrong hands.",
          whitepaperButton: "Read our Security Whitepaper",
          aesTitle: "AES-256",
          aesDesc: "Military-grade encryption for every bit of information.",
          zeroKnowledgeTitle: "Zero Knowledge",
          zeroKnowledgeDesc: "Your keys are yours alone. Not even we can see your files.",
          auditTitle: "Real Audit",
          auditDesc: "Detailed logs of every movement for your total control.",
          syncTitle: "Synchronization",
          syncDesc: "Your clouds always in harmony, protected by our intelligent firewall."
        },
        cta: {
          title: "The future of your files starts today.",
          description: "Join over 85,000 professionals who have already optimized their digital ecosystem with TERA. No cards, no complications.",
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
          status: "Operating Systems",
          back: "Back"
        },
        auth: {
          login: {
            title: "Welcome back!",
            welcomeMessages: ["Welcome back!", "Hello again!", "Great to see you"],
            emailLabel: "Email address",
            emailPlaceholder: "you@email.com",
            passwordLabel: "Password",
            passwordPlaceholder: "Your password",
            signInButton: "Sign In",
            noAccount: "Don't have an account? Sign up",
            forgotPassword: "Forgot password?"
          },
          signup: {
            title: "Create your account",
            nameLabel: "Full Name",
            namePlaceholder: "Your name",
            emailLabel: "Email address",
            emailPlaceholder: "you@email.com",
            passwordLabel: "Password",
            passwordPlaceholder: "Create a password",
            confirmPasswordLabel: "Confirm Password",
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
              item2: "Setting preferences",
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
              title: "Third-Party Integrations",
              intro: "When connecting services like Google Drive or Dropbox, we collect:",
              item1: "Access tokens (encrypted)",
              item2: "List of files and folders",
              item3: "Service user ID"
            }
          },
          section3: {
            title: "3. How We Use Your Information",
            intro: "We use collected data to:",
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
              item3: "File cache: Temporary until operation completion"
            },
            subsection3: {
              title: "Server Location",
              content: "Our services are primarily hosted on secure cloud infrastructures with global redundancy.",
              intro: "We guarantee:",
              item1: "High availability",
              item2: "Daily backups",
              item3: "Data isolation per user",
              item4: "Regional compliance"
            }
          },
          section5: {
            title: "5. Your Rights",
            subsection1: {
              title: "Control over your data",
              item1: "Right of access",
              item2: "Right of rectification",
              item3: "Right of erasure (to be forgotten)"
            },
            subsection2: {
              title: "Other powers",
              item1: "Data portability",
              item2: "Restriction of processing",
              item3: "Opposition to direct marketing",
              item4: "Withdrawal of consent",
              item5: "Complaint filing"
            },
            subsection3: {
              title: "How to exercise your rights",
              content: "You can manage most of these options from your settings panel or by contacting our support."
            }
          },
          section6: {
            title: "6. Information Sharing",
            intro: "We never sell your personal data. We only share information with:",
            subsection1: {
              title: "Authorized third parties",
              item1: "Payment processors (Stripe)",
              item2: "Infrastructure services (AWS/Google Cloud)",
              item3: "Anonymous analytics tools",
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
            item5: "Browsing security",
            item6: "Improve interface"
          },
          section8: {
            title: "8. Children's Privacy",
            intro: "Our service is not directed to children under 13. If we detect data from minors without parental consent:",
            item1: "We will proceed to immediate deletion",
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
            intro: "As a TERA user, you commit to:",
            item1: "Provide truthful information",
            item2: "Maintain account security",
            item3: "Not use the service for illegal purposes",
            item4: "Respect file copyrights"
          },
          section4: {
            title: "4. Intellectual Property",
            intro: "Our policy on intellectual property includes:",
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
            item2: "Service interruptions beyond our control",
            item3: "Improper account use by the user"
          },
          section6: {
            title: "6. Suspension and Termination",
            intro: "We may suspend your account if:",
            item1: "You violate these terms",
            item2: "You perform suspicious activities",
            item3: "Required by a legal authority",
            item4: "Lack of payment in premium plans"
          },
          section7: {
            title: "7. Fees and Payments",
            content: "Premium plans are billed monthly or annually. No partial refunds unless required by law."
          },
          section8: {
            title: "8. Service Modifications",
            content: "We reserve the right to modify or discontinue any part of the service with prior notice."
          },
          section9: {
            title: "9. API Use",
            intro: "The use of our integrations implies:",
            item1: "Compliance with provider quotas",
            item2: "No reverse engineering",
            item3: "Responsible resource use",
            item4: "Respect for authentication tokens",
            item5: "Security in API calls"
          },
          section10: {
            title: "10. Privacy",
            content: "Use of the service is also governed by our Privacy Policy."
          },
          section11: {
            title: "11. Force Majeure",
            content: "We will not be liable for failures due to causes beyond our reasonable control."
          },
          section12: {
            title: "12. Severability",
            content: "If any part of these terms is invalid, the rest will remain in effect."
          },
          section13: {
            title: "13. Governing Law",
            content: "These terms are governed by international electronic commerce laws."
          },
          section14: {
            title: "14. Contact",
            content: "For legal questions, contact us.",
            email: "legal@tera.cloud"
          }
        },
        notFound: {
          title: "Page Not Found",
          description: "Sorry, the page you are looking for does not exist."
        },
        errors: {
          loginFailed: "Login failed",
          signupFailed: "Signup failed",
          tryAgain: "Please try again"
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
        },
        status: {
          loading: "Carregando..."
        }
      },
      landing: {
        hero: {
          title: "Mova e proteja seus arquivos com",
          subtitle: "Inteligencia Real",
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
        stats: {
          filesMoved: "Arquivos Movidos",
          activeUsers: "Usuários Ativos",
          guaranteedUptime: "Tempo de Atividade Garantido",
          bankingSecurity: "Segurança Bancária"
        },
        benefits: {
          badge: "Produtos",
          title: "Todo o seu conteúdo, conectado",
          description: "Simplificamos o complexo. Automatizamos o tedioso. Protegemos lo que importa.",
          learnMore: "Saiba mais",
          feature1: {
            title: "Transferências Multi-nuvem",
            description: "Mova gigabytes entre Dropbox, Drive e OneDrive com um único clique. Sem baixar nada para o seu computador."
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
          subtitle: "TERA as executa para você.",
          description: "Configure fluxos de trabalho potentes em segundos. A TERA monitora seus arquivos 24 horas por dia, 7 dias por semana e realiza as tarefas repetitivas para que você não precise fazer.",
          panelTitle: "Painel de Automação",
          panelStatus: "Sistema Inteligente Activo",
          aiMessage: "\"Detectei 150 novos arquivos no seu Dropbox. Deseja que eu inicie a migração automática para sua pasta Projetos 2024 no Google Drive?\"",
          userResponse: "\"Sim, por favor. E exclua duplicatas com mais de 6 meses.\"",
          progressLabel: "Migração em curso",
          suggestions: {
            suggestion1: "Mova meus arquivos do Dropbox para o Google Drive",
            suggestion2: "Crie um backup das minhas fotos no OneDrive",
            suggestion3: "Quais nuvens eu tenho integradas atualmente?",
            suggestion4: "Transfira a pasta 'Projetos' para minha conta do Box",
            suggestion5: "Sincronize minha pasta do Notion com meu Drive"
          }
        },
        security: {
          badge: "Segurança sem Compromisso",
          title: "Dormir tranquilo faz parte do plano",
          description: "Não economizamos na segurança. A TERA usa os mesmos protocolos que as instituições financeiras globais para garantir que seus dados nunca caiam em mãos erradas.",
          whitepaperButton: "Leia nosso Whitepaper de Segurança",
          aesTitle: "AES-256",
          aesDesc: "Criptografia de nível militar para cada bit de informação.",
          zeroKnowledgeTitle: "Zero Knowledge",
          zeroKnowledgeDesc: "Suas chaves são apenas suas. Nem nós podemos ver seus arquivos.",
          auditTitle: "Auditoria Real",
          auditDesc: "Registros detalhados de cada movimento para seu controle total.",
          syncTitle: "Sincronização",
          syncDesc: "Suas nuvens sempre em harmonia, protegidas por nosso firewall inteligente."
        },
        cta: {
          title: "O futuro dos seus arquivos começa hoje.",
          description: "Junte-se a mais de 85.000 profissionais que já otimizaram seu ecossistema digital com a TERA. Sem cartões, sem complicações.",
          createAccount: "Criar minha conta grátis",
          talkToSales: "Falar com vendas"
        },
        footer: {
          description: "Elevando a gestão de arquivos a una nova dimensão de inteligência e seguridad.",
          platform: "Plataforma",
          legal: "Legal",
          privacy: "Privacidade",
          terms: "Termos",
          cookies: "Cookies",
          compliance: "Conformidade",
          rights: "© {{year}} TERA Cloud Technologies Inc.",
          status: "Sistemas Operacionais"
        },
        auth: {
          login: {
            title: "Bem-vindo de volta!",
            welcomeMessages: ["Bem-vindo de volta!", "Olá de novo!", "Bom ver você"],
            emailLabel: "Endereço de e-mail",
            emailPlaceholder: "seu@email.com",
            passwordLabel: "Senha",
            passwordPlaceholder: "Sua senha",
            signInButton: "Entrar",
            noAccount: "Não tem uma conta? Cadastre-se",
            forgotPassword: "Esqueceu a senha?"
          },
          signup: {
            title: "Crie sua conta",
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
            signIn: "Entrar",
            acceptTerms: {
              part1: "Eu aceito os",
              termsLink: "Termos de Serviço",
              and: "e a",
              privacyLink: "Política de Privacidade"
            }
          },
          validation: {
            invalidEmail: "Endereço de e-mail inválido",
            passwordTooShort: "A senha deve ter pelo menos 6 caracteres",
            nameRequired: "Nome é obrigatório",
            acceptTermsRequired: "Você deve aceitar os termos",
            passwordsDoNotMatch: "As senhas não coincidem"
          }
        },
        errors: {
          loginFailed: "Falha ao entrar",
          signupFailed: "Falha ao cadastrar",
          tryAgain: "Por favor, tente novamente"
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