import { usePageTitle } from '@/hooks/usePageTitle';
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Bell, ExternalLink, ChevronRight, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

type Lang = "es" | "en" | "pt";

const LAST_UPDATED: Record<Lang, string> = {
  es: "22 de junio de 2026",
  en: "June 22, 2026",
  pt: "22 de junho de 2026",
};
const CONTACT_EMAIL = "privacy@mytera.app";
const APP_URL = "https://mytera.app";

const SECTIONS: Record<Lang, { id: string; title: string }[]> = {
  es: [
    { id: "intro",       title: "Introducción" },
    { id: "quienes",     title: "Quiénes somos" },
    { id: "recopilamos", title: "Información que recopilamos" },
    { id: "usamos",      title: "Cómo usamos tu información" },
    { id: "seguridad",   title: "Almacenamiento y seguridad" },
    { id: "compartimos", title: "Compartición de datos" },
    { id: "terceros",    title: "Servicios de terceros" },
    { id: "derechos",    title: "Tus derechos" },
    { id: "cookies",     title: "Cookies y rastreo" },
    { id: "menores",     title: "Menores de edad" },
    { id: "internac",    title: "Transferencias internacionales" },
    { id: "cambios",     title: "Cambios en esta política" },
    { id: "gdpr",        title: "Base legal (GDPR)" },
    { id: "contacto",    title: "Contacto" },
    { id: "ley",         title: "Ley aplicable" },
  ],
  en: [
    { id: "intro",       title: "Introduction" },
    { id: "quienes",     title: "Who we are" },
    { id: "recopilamos", title: "Information we collect" },
    { id: "usamos",      title: "How we use your info" },
    { id: "seguridad",   title: "Storage and security" },
    { id: "compartimos", title: "Data sharing" },
    { id: "terceros",    title: "Third-party services" },
    { id: "derechos",    title: "Your rights" },
    { id: "cookies",     title: "Cookies and tracking" },
    { id: "menores",     title: "Minors" },
    { id: "internac",    title: "International transfers" },
    { id: "cambios",     title: "Policy changes" },
    { id: "gdpr",        title: "Legal basis (GDPR)" },
    { id: "contacto",    title: "Contact" },
    { id: "ley",         title: "Applicable law" },
  ],
  pt: [
    { id: "intro",       title: "Introdução" },
    { id: "quienes",     title: "Quem somos" },
    { id: "recopilamos", title: "Informações que coletamos" },
    { id: "usamos",      title: "Como usamos suas informações" },
    { id: "seguridad",   title: "Armazenamento e segurança" },
    { id: "compartimos", title: "Compartilhamento de dados" },
    { id: "terceros",    title: "Serviços de terceiros" },
    { id: "derechos",    title: "Seus direitos" },
    { id: "cookies",     title: "Cookies e rastreamento" },
    { id: "menores",     title: "Menores de idade" },
    { id: "internac",    title: "Transferências internacionais" },
    { id: "cambios",     title: "Alterações nesta política" },
    { id: "gdpr",        title: "Base legal (LGPD/GDPR)" },
    { id: "contacto",    title: "Contato" },
    { id: "ley",         title: "Lei aplicável" },
  ],
};

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('pageTitles.privacy', 'TERA — Privacy Policy'));
  const raw = i18n.language?.startsWith("pt") ? "pt" : i18n.language?.startsWith("en") ? "en" : "es";
  const [lang, setLang] = useState<Lang>(raw as Lang);
  const [activeSection, setActiveSection] = useState("intro");
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = SECTIONS[lang];

  const setLanguage = (l: Lang) => {
    setLang(l);
    i18n.changeLanguage(l);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [lang]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageTitle   = { es: "Política de Privacidad", en: "Privacy Policy", pt: "Política de Privacidade" }[lang];
  const contentLabel = { es: "Contenido", en: "Contents", pt: "Conteúdo" }[lang];
  const backLabel    = { es: "Volver", en: "Back", pt: "Voltar" }[lang];

  const subprocesadores = {
    es: [
      ["Supabase", "Autenticación y base de datos", "Email, hash de contraseña, datos de sesión"],
      ["Render", "Hosting de servidor", "Logs técnicos anonimizados"],
      ["Resend", "Emails transaccionales", "Dirección de email únicamente"],
      ["Google (OAuth)", "Integración con Google Drive", "Token OAuth mínimo necesario"],
      ["Dropbox (OAuth)", "Integración con Dropbox", "Token OAuth mínimo necesario"],
      ["Microsoft (OAuth)", "Integración con OneDrive", "Token OAuth mínimo necesario"],
      ["Box (OAuth)", "Integración con Box", "Token OAuth mínimo necesario"],
      ["Amazon AWS", "Integración con S3", "Credenciales IAM cifradas"],
    ],
    en: [
      ["Supabase", "Authentication and database", "Email, password hash, session data"],
      ["Render", "Server hosting", "Anonymized technical logs"],
      ["Resend", "Transactional emails", "Email address only"],
      ["Google (OAuth)", "Google Drive integration", "Minimum necessary OAuth token"],
      ["Dropbox (OAuth)", "Dropbox integration", "Minimum necessary OAuth token"],
      ["Microsoft (OAuth)", "OneDrive integration", "Minimum necessary OAuth token"],
      ["Box (OAuth)", "Box integration", "Minimum necessary OAuth token"],
      ["Amazon AWS", "S3 integration", "Encrypted IAM credentials"],
    ],
    pt: [
      ["Supabase", "Autenticação e banco de dados", "Email, hash de senha, dados de sessão"],
      ["Render", "Hospedagem do servidor", "Logs técnicos anonimizados"],
      ["Resend", "Emails transacionais", "Endereço de email apenas"],
      ["Google (OAuth)", "Integração com Google Drive", "Token OAuth mínimo necessário"],
      ["Dropbox (OAuth)", "Integração com Dropbox", "Token OAuth mínimo necessário"],
      ["Microsoft (OAuth)", "Integração com OneDrive", "Token OAuth mínimo necessário"],
      ["Box (OAuth)", "Integração com Box", "Token OAuth mínimo necessário"],
      ["Amazon AWS", "Integração com S3", "Credenciais IAM criptografadas"],
    ],
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> {backLabel}
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-[#0061D5] tracking-tight">TERA</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500 font-medium hidden sm:block">{pageTitle}</span>
          </div>
          {/* 3-lang selector */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
            {(["es", "en", "pt"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-3 py-2 transition-colors ${lang === l ? "bg-[#0061D5] text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0061D5] via-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">
                {{ es: "Privacidad", en: "Privacy", pt: "Privacidade" }[lang]}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">{pageTitle}</h1>
            <p className="text-lg text-blue-100 mb-6 leading-relaxed max-w-2xl">
              {{ es: "En TERA, tu privacidad no es una característica — es una responsabilidad. Este documento explica con total transparencia qué datos recopilamos, cómo los usamos y cómo los protegemos.", en: "At TERA, your privacy is not a feature — it's a responsibility. This document transparently explains what data we collect, how we use it, and how we protect it.", pt: "Na TERA, sua privacidade não é uma funcionalidade — é uma responsabilidade. Este documento explica com total transparência quais dados coletamos, como os usamos e como os protegemos." }[lang]}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {{ es: "Última actualización", en: "Last updated", pt: "Última atualização" }[lang]}: {LAST_UPDATED[lang]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-12">
          {/* TOC */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{contentLabel}</p>
              <nav className="space-y-1">
                {sections.map((s, i) => (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${activeSection === s.id ? "bg-blue-50 text-[#0061D5] font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}>
                    <span className={`text-xs font-black w-5 text-right flex-shrink-0 ${activeSection === s.id ? "text-[#0061D5]" : "text-slate-300"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="truncate">{s.title}</span>
                    {activeSection === s.id && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main ref={contentRef} className="flex-1 min-w-0 space-y-2">

            {/* 01 */}
            <Section id="intro" number="01" icon={<Shield className="w-5 h-5" />} title={sections[0].title}>
              {lang === "es" && <>
                <P>En <strong>TERA</strong> nos comprometemos con la privacidad de nuestros usuarios. Esta Política describe cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal al usar nuestra plataforma de transferencia de archivos entre nubes.</P>
                <P>Al registrarte y utilizar TERA, aceptás las prácticas descritas aquí. Si no estás de acuerdo, tenés el derecho de dejar de usar el servicio y solicitar la eliminación de tu cuenta.</P>
                <Callout color="blue" icon="💡">Escrito en lenguaje claro. Dudas: <strong>{CONTACT_EMAIL}</strong></Callout>
              </>}
              {lang === "en" && <>
                <P>At <strong>TERA</strong> we are committed to our users' privacy. This Policy describes how we collect, use, store and protect your personal information when using our cloud file transfer platform.</P>
                <P>By registering and using TERA, you accept the practices described here. If you disagree, you have the right to stop using the service and request account deletion.</P>
                <Callout color="blue" icon="💡">Written in plain language. Questions: <strong>{CONTACT_EMAIL}</strong></Callout>
              </>}
              {lang === "pt" && <>
                <P>Na <strong>TERA</strong> nos comprometemos com a privacidade dos nossos usuários. Esta Política descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais ao usar nossa plataforma de transferência de arquivos entre nuvens.</P>
                <P>Ao se cadastrar e usar a TERA, você aceita as práticas descritas aqui. Se não concordar, você tem o direito de parar de usar o serviço e solicitar a exclusão da sua conta.</P>
                <Callout color="blue" icon="💡">Escrito em linguagem clara. Dúvidas: <strong>{CONTACT_EMAIL}</strong></Callout>
              </>}
            </Section>

            {/* 02 */}
            <Section id="quienes" number="02" icon={<Eye className="w-5 h-5" />} title={sections[1].title}>
              {lang === "es" && <>
                <P><strong>TERA</strong> es una plataforma SaaS para transferir y sincronizar archivos entre Google Drive, Dropbox, OneDrive, Box, Amazon S3 y otros servicios de almacenamiento en la nube.</P>
                <InfoGrid items={[{ label: "Nombre comercial", value: "TERA" }, { label: "Sitio web", value: APP_URL }, { label: "Contacto", value: CONTACT_EMAIL }, { label: "País", value: "Argentina" }]} />
                <P>Actuamos como intermediario técnico autorizado. <strong>No somos propietarios de tus archivos.</strong> No vendemos ni usamos tus datos para publicidad.</P>
              </>}
              {lang === "en" && <>
                <P><strong>TERA</strong> is a SaaS platform for transferring and syncing files between Google Drive, Dropbox, OneDrive, Box, Amazon S3 and other cloud storage services.</P>
                <InfoGrid items={[{ label: "Trade name", value: "TERA" }, { label: "Website", value: APP_URL }, { label: "Contact", value: CONTACT_EMAIL }, { label: "Country", value: "Argentina" }]} />
                <P>We act as an authorized technical intermediary. <strong>We do not own your files.</strong> We do not sell or use your data for advertising.</P>
              </>}
              {lang === "pt" && <>
                <P><strong>TERA</strong> é uma plataforma SaaS para transferir e sincronizar arquivos entre Google Drive, Dropbox, OneDrive, Box, Amazon S3 e outros serviços de armazenamento em nuvem.</P>
                <InfoGrid items={[{ label: "Nome comercial", value: "TERA" }, { label: "Site", value: APP_URL }, { label: "Contato", value: CONTACT_EMAIL }, { label: "País", value: "Argentina" }]} />
                <P>Atuamos como intermediário técnico autorizado. <strong>Não somos proprietários dos seus arquivos.</strong> Não vendemos nem usamos seus dados para publicidade.</P>
              </>}
            </Section>

            {/* 03 */}
            <Section id="recopilamos" number="03" icon={<Database className="w-5 h-5" />} title={sections[2].title}>
              {lang === "es" && <>
                <SubHeading>Datos de cuenta</SubHeading>
                <BulletList items={["Nombre completo y correo electrónico", "Contraseña (hash bcrypt, nunca en texto plano)", "Foto de perfil (opcional, desde OAuth)", "Rol en la plataforma"]} />
                <SubHeading>Datos de uso</SubHeading>
                <BulletList items={["Historial de transferencias: origen, destino, archivos, fecha, duración", "Tareas programadas y sus registros de ejecución", "Preferencias de configuración e idioma seleccionado", "Logs de actividad para soporte técnico", "IP de acceso para seguridad"]} />
                <SubHeading>Tokens OAuth y credenciales</SubHeading>
                <BulletList items={["Access tokens y refresh tokens de cada servicio conectado", "Credenciales IAM de Amazon S3 (cifradas)", "Solo los permisos mínimos necesarios"]} />
                <Callout color="green" icon="🔒">Todos los tokens se cifran con <strong>AES-256-GCM</strong> antes de guardarse. Nunca aparecen en logs.</Callout>
                <SubHeading>Lo que NO recopilamos</SubHeading>
                <BulletList items={["Contenido de tus archivos", "Datos de tarjeta de crédito", "Datos biométricos"]} />
              </>}
              {lang === "en" && <>
                <SubHeading>Account data</SubHeading>
                <BulletList items={["Full name and email address", "Password (bcrypt hash, never in plain text)", "Profile photo (optional, from OAuth)", "Platform role"]} />
                <SubHeading>Usage data</SubHeading>
                <BulletList items={["Transfer history: source, destination, files, date, duration", "Scheduled tasks and execution logs", "Configuration preferences and selected language", "Activity logs for technical support", "Access IP for security"]} />
                <SubHeading>OAuth tokens and credentials</SubHeading>
                <BulletList items={["Access tokens and refresh tokens for each connected service", "Amazon S3 IAM credentials (encrypted)", "Only the minimum necessary permissions"]} />
                <Callout color="green" icon="🔒">All tokens are encrypted with <strong>AES-256-GCM</strong> before storage. Never appear in logs.</Callout>
                <SubHeading>What we do NOT collect</SubHeading>
                <BulletList items={["Content of your files", "Credit card data", "Biometric data"]} />
              </>}
              {lang === "pt" && <>
                <SubHeading>Dados de conta</SubHeading>
                <BulletList items={["Nome completo e endereço de email", "Senha (hash bcrypt, nunca em texto simples)", "Foto de perfil (opcional, via OAuth)", "Função na plataforma"]} />
                <SubHeading>Dados de uso</SubHeading>
                <BulletList items={["Histórico de transferências: origem, destino, arquivos, data, duração", "Tarefas agendadas e seus registros de execução", "Preferências de configuração e idioma selecionado", "Logs de atividade para suporte técnico", "IP de acesso para segurança"]} />
                <SubHeading>Tokens OAuth e credenciais</SubHeading>
                <BulletList items={["Tokens de acesso e atualização de cada serviço conectado", "Credenciais IAM do Amazon S3 (criptografadas)", "Apenas as permissões mínimas necessárias"]} />
                <Callout color="green" icon="🔒">Todos os tokens são criptografados com <strong>AES-256-GCM</strong> antes de serem armazenados. Nunca aparecem em logs.</Callout>
                <SubHeading>O que NÃO coletamos</SubHeading>
                <BulletList items={["Conteúdo dos seus arquivos", "Dados de cartão de crédito", "Dados biométricos"]} />
              </>}
            </Section>

            {/* 04 */}
            <Section id="usamos" number="04" icon={<UserCheck className="w-5 h-5" />} title={sections[3].title}>
              {lang === "es" && <>
                <BulletList items={["Proveer y mejorar los servicios de transferencia de archivos", "Autenticar tu identidad y mantener la seguridad de tu cuenta", "Ejecutar transferencias y sincronizaciones en tu nombre", "Enviar notificaciones transaccionales (confirmación de email, alertas de operaciones)", "Mostrar estadísticas e historial en tu panel de control", "Cumplir con obligaciones legales y prevenir fraudes", "Mejorar la UX mediante análisis agregados y anónimos", "Responder a consultas de soporte técnico"]} />
                <Callout color="yellow" icon="⚠️"><strong>Nunca</strong> usamos tu información para publicidad dirigida ni la compartimos con anunciantes.</Callout>
              </>}
              {lang === "en" && <>
                <BulletList items={["Provide and improve file transfer services", "Authenticate your identity and maintain account security", "Execute transfers and syncs on your behalf", "Send transactional notifications (email confirmation, operation alerts)", "Display statistics and history in your dashboard", "Comply with legal obligations and prevent fraud", "Improve UX through aggregated and anonymous analytics", "Respond to technical support inquiries"]} />
                <Callout color="yellow" icon="⚠️">We <strong>never</strong> use your information for targeted advertising or share it with advertisers.</Callout>
              </>}
              {lang === "pt" && <>
                <BulletList items={["Fornecer e melhorar os serviços de transferência de arquivos", "Autenticar sua identidade e manter a segurança da conta", "Executar transferências e sincronizações em seu nome", "Enviar notificações transacionais (confirmação de email, alertas de operações)", "Exibir estatísticas e histórico no seu painel de controle", "Cumprir obrigações legais e prevenir fraudes", "Melhorar a UX por meio de análises agregadas e anônimas", "Responder a consultas de suporte técnico"]} />
                <Callout color="yellow" icon="⚠️"><strong>Nunca</strong> usamos suas informações para publicidade direcionada nem as compartilhamos com anunciantes.</Callout>
              </>}
            </Section>

            {/* 05 */}
            <Section id="seguridad" number="05" icon={<Lock className="w-5 h-5" />} title={sections[4].title}>
              {lang === "es" && <>
                <SubHeading>Infraestructura</SubHeading>
                <BulletList items={["Servidores en Render (AWS us-east-1)", "Base de datos PostgreSQL en Supabase con cifrado en reposo", "AES-256-GCM para tokens OAuth y credenciales sensibles", "TLS 1.3 para todas las comunicaciones (HTTPS obligatorio)", "Autenticación con Supabase Auth y JWT seguro"]} />
                <SubHeading>Retención de datos</SubHeading>
                <BulletList items={["Datos personales eliminados en 30 días tras eliminar cuenta", "Tokens OAuth revocados inmediatamente", "Logs de operaciones anonimizados y conservados 90 días por razones legales", "Archivos en Google Drive, Dropbox, etc. no se ven afectados"]} />
                <Callout color="green" icon="🛡️">Implementamos medidas técnicas y organizativas de última generación para proteger tu información.</Callout>
              </>}
              {lang === "en" && <>
                <SubHeading>Infrastructure</SubHeading>
                <BulletList items={["Servers on Render (AWS us-east-1)", "PostgreSQL database on Supabase with encryption at rest", "AES-256-GCM for OAuth tokens and sensitive credentials", "TLS 1.3 for all communications (HTTPS mandatory)", "Authentication with Supabase Auth and secure JWT"]} />
                <SubHeading>Data retention</SubHeading>
                <BulletList items={["Personal data deleted within 30 days of account deletion", "OAuth tokens immediately revoked", "Operation logs anonymized and kept 90 days for legal reasons", "Files in Google Drive, Dropbox, etc. are not affected"]} />
                <Callout color="green" icon="🛡️">We implement state-of-the-art technical and organizational measures to protect your information.</Callout>
              </>}
              {lang === "pt" && <>
                <SubHeading>Infraestrutura</SubHeading>
                <BulletList items={["Servidores na Render (AWS us-east-1)", "Banco de dados PostgreSQL no Supabase com criptografia em repouso", "AES-256-GCM para tokens OAuth e credenciais sensíveis", "TLS 1.3 para todas as comunicações (HTTPS obrigatório)", "Autenticação com Supabase Auth e JWT seguro"]} />
                <SubHeading>Retenção de dados</SubHeading>
                <BulletList items={["Dados pessoais excluídos em 30 dias após excluir a conta", "Tokens OAuth revogados imediatamente", "Logs de operações anonimizados e mantidos por 90 dias por razões legais", "Arquivos no Google Drive, Dropbox, etc. não são afetados"]} />
                <Callout color="green" icon="🛡️">Implementamos medidas técnicas e organizacionais de última geração para proteger suas informações.</Callout>
              </>}
            </Section>

            {/* 06 */}
            <Section id="compartimos" number="06" icon={<Eye className="w-5 h-5" />} title={sections[5].title}>
              {lang === "es" && <><SubHeading>Lo que nunca hacemos</SubHeading><BulletList items={["Vender o alquilar tu información a terceros", "Compartir datos con anunciantes o brokers", "Usar tus archivos para entrenar IA"]} /></>}
              {lang === "en" && <><SubHeading>What we never do</SubHeading><BulletList items={["Sell or rent your information to third parties", "Share data with advertisers or brokers", "Use your files to train AI"]} /></>}
              {lang === "pt" && <><SubHeading>O que nunca fazemos</SubHeading><BulletList items={["Vender ou alugar suas informações a terceiros", "Compartilhar dados com anunciantes ou corretores", "Usar seus arquivos para treinar IA"]} /></>}

              <SubHeading>{{ es: "Subprocesadores", en: "Sub-processors", pt: "Subprocessadores" }[lang]}</SubHeading>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      {[{ es: "Proveedor", en: "Provider", pt: "Fornecedor" }, { es: "Propósito", en: "Purpose", pt: "Finalidade" }, { es: "Datos compartidos", en: "Data shared", pt: "Dados compartilhados" }].map((h) => (
                        <th key={h[lang]} className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-200">{h[lang]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subprocesadores.map(([p, pu, d], i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800 border border-slate-200">{p}</td>
                        <td className="px-4 py-3 text-slate-600 border border-slate-200">{pu}</td>
                        <td className="px-4 py-3 text-slate-600 border border-slate-200">{d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 07 */}
            <Section id="terceros" number="07" icon={<ExternalLink className="w-5 h-5" />} title={sections[6].title}>
              {[
                { name: "Google Drive", scopes: "drive.readonly, drive.file", revoke: "myaccount.google.com/permissions" },
                { name: "Dropbox", scopes: "files.content.read, files.content.write", revoke: "dropbox.com/account/applications" },
                { name: "Microsoft OneDrive", scopes: "Files.ReadWrite, offline_access", revoke: "account.live.com/consent/Manage" },
                { name: "Box", scopes: "root_readwrite", revoke: "app.box.com/master/settings/authorizedapps" },
                { name: "Amazon S3", scopes: { es: "Permisos IAM (definidos por vos)", en: "IAM permissions (defined by you)", pt: "Permissões IAM (definidas por você)" }[lang], revoke: { es: "Consola AWS IAM", en: "AWS IAM Console", pt: "Console AWS IAM" }[lang] },
              ].map(({ name, scopes, revoke }) => (
                <div key={name} className="mb-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2 text-sm">{name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">{{ es: "Permisos:", en: "Permissions:", pt: "Permissões:" }[lang]}</span><br />
                      <code className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-[#0061D5]">{scopes}</code>
                    </div>
                    <div>
                      <span className="text-slate-500">{{ es: "Revocar:", en: "Revoke:", pt: "Revogar:" }[lang]}</span><br />
                      <span className="text-slate-700 text-xs">{revoke}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Callout color="blue" icon="ℹ️">
                {{ es: "Podés desconectar cualquier servicio desde Integraciones. Al hacerlo, revocamos el acceso inmediatamente.", en: "You can disconnect any service from Integrations. When you do, we immediately revoke access.", pt: "Você pode desconectar qualquer serviço em Integrações. Ao fazer isso, revogamos o acesso imediatamente." }[lang]}
              </Callout>
            </Section>

            {/* 08 */}
            <Section id="derechos" number="08" icon={<UserCheck className="w-5 h-5" />} title={sections[7].title}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                {(lang === "es" ? [
                  ["👁️", "Acceso", "Solicitá una copia de tus datos personales."],
                  ["✏️", "Rectificación", "Corregí datos incorrectos en tu perfil."],
                  ["🗑️", "Supresión", "Solicitá la eliminación de tu cuenta y datos."],
                  ["📦", "Portabilidad", "Recibí tus datos en formato JSON/CSV."],
                  ["🚫", "Oposición", "Oponete al procesamiento para ciertos fines."],
                  ["⏸️", "Limitación", "Pedí restricción temporal del procesamiento."],
                ] : lang === "en" ? [
                  ["👁️", "Access", "Request a copy of your personal data."],
                  ["✏️", "Rectification", "Correct incorrect data in your profile."],
                  ["🗑️", "Erasure", "Request deletion of your account and data."],
                  ["📦", "Portability", "Receive your data in JSON/CSV format."],
                  ["🚫", "Objection", "Object to processing for certain purposes."],
                  ["⏸️", "Restriction", "Request temporary restriction of processing."],
                ] : [
                  ["👁️", "Acesso", "Solicite uma cópia dos seus dados pessoais."],
                  ["✏️", "Retificação", "Corrija dados incorretos no seu perfil."],
                  ["🗑️", "Exclusão", "Solicite a exclusão da sua conta e dados."],
                  ["📦", "Portabilidade", "Receba seus dados em formato JSON/CSV."],
                  ["🚫", "Oposição", "Oponha-se ao processamento para certos fins."],
                  ["⏸️", "Limitação", "Solicite restrição temporária do processamento."],
                ]).map(([icon, title, desc]) => (
                  <div key={title} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{icon}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <Callout color="blue" icon="📧">
                {{ es: `Para ejercer tus derechos, escribinos a ${CONTACT_EMAIL}. Respondemos en máximo 30 días hábiles.`, en: `To exercise your rights, write to us at ${CONTACT_EMAIL}. We respond within 30 business days.`, pt: `Para exercer seus direitos, escreva para ${CONTACT_EMAIL}. Respondemos em no máximo 30 dias úteis.` }[lang]}
              </Callout>
            </Section>

            {/* 09 */}
            <Section id="cookies" number="09" icon={<Bell className="w-5 h-5" />} title={sections[8].title}>
              {lang === "es" && <>
                <BulletList items={[
                  "Cookies de sesión autenticada (JWT — necesarias)",
                  "localStorage para idioma (<code>i18nextLng</code>)",
                  "localStorage para preferencias de apariencia: modo oscuro (<code>tera-theme</code>)",
                  "localStorage para preferencias de notificaciones por email (<code>tera-email-notif</code>)",
                  "Cookies de autenticación de Supabase",
                ]} />
                <SubHeading>Lo que NO hacemos</SubHeading>
                <BulletList items={["No usamos cookies de publicidad ni retargeting", "No instalamos cookies de análisis de comportamiento de terceros", "No compartimos datos con redes publicitarias", "No usamos píxeles de seguimiento ni fingerprinting"]} />
                <Callout color="blue" icon="ℹ️">Las preferencias guardadas en localStorage (<code>tera-theme</code>, <code>tera-email-notif</code>) permanecen en tu dispositivo y nunca se envían a nuestros servidores.</Callout>
              </>}
              {lang === "en" && <>
                <BulletList items={[
                  "Authenticated session cookies (JWT — required)",
                  "localStorage for language (<code>i18nextLng</code>)",
                  "localStorage for appearance preferences: dark mode (<code>tera-theme</code>)",
                  "localStorage for email notification preferences (<code>tera-email-notif</code>)",
                  "Supabase authentication cookies",
                ]} />
                <SubHeading>What we do NOT do</SubHeading>
                <BulletList items={["No advertising or retargeting cookies", "No third-party behavioral analytics cookies", "No data sharing with ad networks", "No tracking pixels or fingerprinting"]} />
                <Callout color="blue" icon="ℹ️">Preferences stored in localStorage (<code>tera-theme</code>, <code>tera-email-notif</code>) stay on your device and are never sent to our servers.</Callout>
              </>}
              {lang === "pt" && <>
                <BulletList items={[
                  "Cookies de sessão autenticada (JWT — necessários)",
                  "localStorage para idioma (<code>i18nextLng</code>)",
                  "localStorage para preferências de aparência: modo escuro (<code>tera-theme</code>)",
                  "localStorage para preferências de notificações por email (<code>tera-email-notif</code>)",
                  "Cookies de autenticação do Supabase",
                ]} />
                <SubHeading>O que NÃO fazemos</SubHeading>
                <BulletList items={["Sem cookies de publicidade ou retargeting", "Sem cookies de análise comportamental de terceiros", "Sem compartilhamento de dados com redes publicitárias", "Sem pixels de rastreamento ou fingerprinting"]} />
                <Callout color="blue" icon="ℹ️">As preferências salvas no localStorage (<code>tera-theme</code>, <code>tera-email-notif</code>) ficam no seu dispositivo e nunca são enviadas para nossos servidores.</Callout>
              </>}
            </Section>

            {/* 10 */}
            <Section id="menores" number="10" icon={<Shield className="w-5 h-5" />} title={sections[9].title}>
              {lang === "es" && <><P>TERA no está dirigido a menores de <strong>16 años</strong>. No recopilamos información de menores intencionalmente.</P><BulletList items={["Menores de 16 años no pueden usar el servicio", "Padres/tutores que identifiquen datos de menores deben contactarnos", "Eliminaremos inmediatamente cualquier dato de menores identificado"]} /></>}
              {lang === "en" && <><P>TERA is not directed at persons under <strong>16 years of age</strong>. We do not intentionally collect information from minors.</P><BulletList items={["Persons under 16 may not use the service", "Parents/guardians who identify minor's data should contact us", "We will immediately delete any identified minor's data"]} /></>}
              {lang === "pt" && <><P>A TERA não é direcionada a menores de <strong>16 anos</strong>. Não coletamos intencionalmente informações de menores.</P><BulletList items={["Menores de 16 anos não podem usar o serviço", "Pais/responsáveis que identifiquem dados de menores devem nos contatar", "Excluiremos imediatamente qualquer dado de menor identificado"]} /></>}
            </Section>

            {/* 11 */}
            <Section id="internac" number="11" icon={<Globe className="w-5 h-5" />} title={sections[10].title}>
              {lang === "es" && <><P>TERA opera desde Argentina y procesa datos en <strong>EE.UU.</strong> (Render / AWS us-east-1) y en la infraestructura de Supabase. Al usar TERA, consentís esta transferencia. Implementamos Cláusulas Contractuales Estándar (SCCs) para transferencias desde el EEE y cifrado en tránsito para todos los datos sensibles.</P></>}
              {lang === "en" && <><P>TERA operates from Argentina and processes data in the <strong>USA</strong> (Render / AWS us-east-1) and Supabase infrastructure. By using TERA, you consent to this transfer. We implement Standard Contractual Clauses (SCCs) for EEA transfers and in-transit encryption for all sensitive data.</P></>}
              {lang === "pt" && <><P>A TERA opera a partir da Argentina e processa dados nos <strong>EUA</strong> (Render / AWS us-east-1) e na infraestrutura do Supabase. Ao usar a TERA, você consente com essa transferência. Implementamos Cláusulas Contratuais Padrão (SCCs) para transferências do EEE e criptografia em trânsito para todos os dados sensíveis.</P></>}
            </Section>

            {/* 12 */}
            <Section id="cambios" number="12" icon={<Bell className="w-5 h-5" />} title={sections[11].title}>
              {lang === "es" && <BulletList items={["Notificamos por email con al menos 30 días de anticipación ante cambios significativos", "Mostramos aviso destacado dentro de la app", "Actualizamos la fecha 'Última actualización'", "El uso continuado implica aceptación de los cambios"]} />}
              {lang === "en" && <BulletList items={["We notify by email at least 30 days in advance for significant changes", "We display a prominent notice in the app", "We update the 'Last updated' date", "Continued use implies acceptance of changes"]} />}
              {lang === "pt" && <BulletList items={["Notificamos por email com pelo menos 30 dias de antecedência para alterações significativas", "Exibimos aviso destacado no app", "Atualizamos a data de 'Última atualização'", "O uso continuado implica aceitação das alterações"]} />}
            </Section>

            {/* 13 */}
            <Section id="gdpr" number="13" icon={<Shield className="w-5 h-5" />} title={sections[12].title}>
              {lang === "es" && <><P>Para usuarios en el EEE, procesamos tus datos bajo el Art. 6 del GDPR:</P><BulletList items={["<strong>Art. 6.1.b — Contrato:</strong> para proveer los servicios solicitados", "<strong>Art. 6.1.f — Intereses legítimos:</strong> para mejorar el servicio y garantizar seguridad", "<strong>Art. 6.1.c — Cumplimiento legal:</strong> cuando la ley lo exige", "<strong>Art. 6.1.a — Consentimiento:</strong> para marketing opcional (siempre opt-in)"]} /></>}
              {lang === "en" && <><P>For EEA users, we process your data under Art. 6 of the GDPR:</P><BulletList items={["<strong>Art. 6.1.b — Contract:</strong> to provide the requested services", "<strong>Art. 6.1.f — Legitimate interests:</strong> to improve the service and ensure security", "<strong>Art. 6.1.c — Legal compliance:</strong> when required by law", "<strong>Art. 6.1.a — Consent:</strong> for optional marketing (always opt-in)"]} /></>}
              {lang === "pt" && <><P>Para usuários no EEE, processamos seus dados com base no Art. 6 do GDPR. Para usuários no Brasil, aplicamos também a <strong>LGPD (Lei 13.709/2018)</strong>:</P><BulletList items={["<strong>Art. 6.1.b — Contrato:</strong> para fornecer os serviços solicitados", "<strong>Art. 6.1.f — Interesses legítimos:</strong> para melhorar o serviço e garantir segurança", "<strong>Art. 6.1.c — Cumprimento legal:</strong> quando exigido por lei", "<strong>Art. 6.1.a — Consentimento:</strong> para marketing opcional (sempre opt-in)", "<strong>LGPD Art. 7:</strong> bases legais equivalentes para tratamento de dados no Brasil"]} /></>}
            </Section>

            {/* 14 */}
            <Section id="contacto" number="14" icon={<Bell className="w-5 h-5" />} title={sections[13].title}>
              <div className="mt-2 p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0061D5] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg mb-1">TERA · {{ es: "Equipo de Privacidad", en: "Privacy Team", pt: "Equipe de Privacidade" }[lang]}</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0061D5] font-semibold text-lg hover:underline">{CONTACT_EMAIL}</a>
                    <p className="text-sm text-slate-500 mt-2">{{ es: "Respondemos en máximo 30 días hábiles.", en: "We respond within 30 business days.", pt: "Respondemos em no máximo 30 dias úteis." }[lang]}</p>
                  </div>
                </div>
              </div>
            </Section>

            {/* 15 */}
            <Section id="ley" number="15" icon={<Shield className="w-5 h-5" />} title={sections[14].title}>
              {lang === "es" && <BulletList items={["Argentina: Ley 25.326 de Protección de Datos Personales", "Unión Europea: GDPR (Reglamento UE 2016/679)", "California: CCPA", "Brasil: LGPD (Lei 13.709/2018) — para usuarios brasileños", "Jurisdicción: Ciudad Autónoma de Buenos Aires, Argentina"]} />}
              {lang === "en" && <BulletList items={["Argentina: Law 25,326 on Personal Data Protection", "European Union: GDPR (Regulation EU 2016/679)", "California: CCPA", "Brazil: LGPD (Law 13,709/2018) — for Brazilian users", "Jurisdiction: Autonomous City of Buenos Aires, Argentina"]} />}
              {lang === "pt" && <BulletList items={["Argentina: Lei 25.326 de Proteção de Dados Pessoais", "União Europeia: GDPR (Regulamento UE 2016/679)", "Califórnia: CCPA", "Brasil: LGPD (Lei 13.709/2018) — aplicável a usuários brasileiros", "Jurisdição: Cidade Autônoma de Buenos Aires, Argentina"]} />}
            </Section>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">© 2025 TERA · {{ es: "Todos los derechos reservados", en: "All rights reserved", pt: "Todos os direitos reservados" }[lang]}</span>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms"><span className="text-slate-500 hover:text-[#0061D5] cursor-pointer transition-colors">{{ es: "Términos de Servicio", en: "Terms of Service", pt: "Termos de Serviço" }[lang]}</span></Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-500 hover:text-[#0061D5] transition-colors">{CONTACT_EMAIL}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, number, icon, title, children }: { id: string; number: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-300 tabular-nums">{number}</span>
          <div className="w-8 h-8 bg-[#0061D5]/10 rounded-lg flex items-center justify-center text-[#0061D5]">{icon}</div>
        </div>
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
      </div>
      <div className="px-6 py-6 space-y-4">{children}</div>
    </section>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 leading-relaxed text-[15px]">{children}</p>;
}
function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-slate-900 text-[15px] mt-5 mb-2 pb-1 border-b border-slate-100">{children}</h3>;
}
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] text-slate-600 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 bg-[#0061D5] rounded-full flex-shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );
}
function Callout({ children, color, icon }: { children: React.ReactNode; color: "blue" | "green" | "yellow"; icon: string }) {
  const colors = { blue: "bg-blue-50 border-blue-200 text-blue-800", green: "bg-green-50 border-green-200 text-green-800", yellow: "bg-amber-50 border-amber-200 text-amber-800" };
  return (
    <div className={`flex gap-3 p-4 rounded-xl border text-sm leading-relaxed ${colors[color]}`}>
      <span className="text-base flex-shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  );
}
function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      {items.map(({ label, value }) => (
        <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
          <p className="text-sm font-semibold text-slate-800">{value}</p>
        </div>
      ))}
    </div>
  );
}
