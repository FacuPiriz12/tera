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
            suggestion5: "Sincroniza mi carpeta de Notion con mi Drive"
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
          status: "Sistemas Operativos"
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
          status: "Operating Systems"
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
          panelStatus: "Sistema Inteligente Ativo",
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
          description: "Elevando a gestão de arquivos a uma nova dimensão de inteligência e segurança.",
          platform: "Plataforma",
          legal: "Legal",
          privacy: "Privacidade",
          terms: "Termos",
          cookies: "Cookies",
          compliance: "Conformidade",
          rights: "© {{year}} TERA Cloud Technologies Inc.",
          status: "Sistemas Operacionais"
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