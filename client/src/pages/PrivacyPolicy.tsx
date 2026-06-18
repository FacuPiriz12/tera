import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Globe, Shield, Lock, Eye, Database, UserCheck, Bell, ExternalLink, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const LAST_UPDATED = "18 de junio de 2025";
const LAST_UPDATED_EN = "June 18, 2025";
const CONTACT_EMAIL = "privacy@mytera.app";
const APP_URL = "https://mytera.app";

const SECTIONS_ES = [
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
];

const SECTIONS_EN = [
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
];

export default function PrivacyPolicy() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<"es" | "en">(
    (i18n.language?.startsWith("en") ? "en" : "es") as "es" | "en"
  );
  const [activeSection, setActiveSection] = useState("intro");
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = lang === "es" ? SECTIONS_ES : SECTIONS_EN;

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    setLang(next);
    i18n.changeLanguage(next);
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

  const es = lang === "es";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              {es ? "Volver" : "Back"}
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-[#0061D5] tracking-tight">TERA</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500 font-medium">
              {es ? "Política de Privacidad" : "Privacy Policy"}
            </span>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 text-sm font-semibold text-[#0061D5] hover:text-blue-700 border border-[#0061D5]/30 hover:border-[#0061D5] px-3 py-1.5 rounded-lg transition-all"
          >
            <Globe className="w-4 h-4" />
            {lang === "es" ? "English" : "Español"}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#0061D5] via-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">
                {es ? "Privacidad" : "Privacy"}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              {es ? "Política de Privacidad" : "Privacy Policy"}
            </h1>
            <p className="text-lg text-blue-100 mb-6 leading-relaxed max-w-2xl">
              {es
                ? "En TERA, tu privacidad no es una característica — es una responsabilidad. Este documento explica con total transparencia qué datos recopilamos, cómo los usamos y cómo los protegemos."
                : "At TERA, your privacy is not a feature — it's a responsibility. This document transparently explains what data we collect, how we use it, and how we protect it."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                {es ? "Última actualización" : "Last updated"}: {es ? LAST_UPDATED : LAST_UPDATED_EN}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
                {es ? "Versión 2.0" : "Version 2.0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-12">

          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {es ? "Contenido" : "Contents"}
              </p>
              <nav className="space-y-1">
                {sections.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === s.id
                        ? "bg-blue-50 text-[#0061D5] font-semibold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span className={`text-xs font-bold w-5 text-right flex-shrink-0 ${activeSection === s.id ? "text-[#0061D5]" : "text-slate-300"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{s.title}</span>
                    {activeSection === s.id && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main ref={contentRef} className="flex-1 min-w-0 space-y-2">

            {/* 01 — Introducción */}
            <Section id="intro" number="01" icon={<Shield className="w-5 h-5" />} title={es ? "Introducción" : "Introduction"}>
              {es ? (
                <>
                  <P>En <strong>TERA</strong> nos comprometemos con la privacidad y seguridad de nuestros usuarios. Esta Política de Privacidad describe de forma detallada y transparente cómo recopilamos, utilizamos, almacenamos, protegemos y compartimos la información personal cuando utilizás nuestra plataforma de transferencia y gestión de archivos entre servicios de almacenamiento en la nube.</P>
                  <P>Al registrarte y utilizar TERA, aceptás las prácticas descritas en este documento. Si en algún momento no estás de acuerdo con alguna de estas prácticas, tenés el derecho de dejar de utilizar el servicio y solicitar la eliminación de tu cuenta.</P>
                  <Callout color="blue" icon="💡">
                    Este documento está redactado en lenguaje claro y accesible. Si tenés alguna duda, podés contactarnos directamente en <strong>{CONTACT_EMAIL}</strong>.
                  </Callout>
                </>
              ) : (
                <>
                  <P>At <strong>TERA</strong> we are committed to the privacy and security of our users. This Privacy Policy describes in detail and transparently how we collect, use, store, protect, and share personal information when you use our cloud file transfer and management platform.</P>
                  <P>By registering and using TERA, you accept the practices described in this document. If at any point you disagree with any of these practices, you have the right to stop using the service and request deletion of your account.</P>
                  <Callout color="blue" icon="💡">
                    This document is written in plain, accessible language. If you have any questions, you can contact us directly at <strong>{CONTACT_EMAIL}</strong>.
                  </Callout>
                </>
              )}
            </Section>

            {/* 02 — Quiénes somos */}
            <Section id="quienes" number="02" icon={<Eye className="w-5 h-5" />} title={es ? "Quiénes somos" : "Who we are"}>
              {es ? (
                <>
                  <P><strong>TERA</strong> es una plataforma de software desarrollada para facilitar la transferencia, sincronización y gestión de archivos entre múltiples servicios de almacenamiento en la nube (Google Drive, Dropbox, OneDrive, Box, Amazon S3, entre otros).</P>
                  <InfoGrid items={[
                    { label: "Nombre comercial", value: "TERA" },
                    { label: "Sitio web", value: APP_URL },
                    { label: "Contacto de privacidad", value: CONTACT_EMAIL },
                    { label: "País de operación", value: "Argentina" },
                  ]} />
                  <P>TERA actúa como intermediario técnico autorizado entre tus cuentas de almacenamiento en la nube. <strong>No somos propietarios de tus archivos.</strong> No vendemos tus datos. No los usamos para publicidad. Solo los procesamos para ejecutar las operaciones que vos configurás.</P>
                </>
              ) : (
                <>
                  <P><strong>TERA</strong> is a software platform developed to facilitate the transfer, synchronization, and management of files between multiple cloud storage services (Google Drive, Dropbox, OneDrive, Box, Amazon S3, among others).</P>
                  <InfoGrid items={[
                    { label: "Trade name", value: "TERA" },
                    { label: "Website", value: APP_URL },
                    { label: "Privacy contact", value: CONTACT_EMAIL },
                    { label: "Country of operation", value: "Argentina" },
                  ]} />
                  <P>TERA acts as an authorized technical intermediary between your cloud storage accounts. <strong>We do not own your files.</strong> We do not sell your data. We do not use it for advertising. We only process it to execute the operations you configure.</P>
                </>
              )}
            </Section>

            {/* 03 — Información que recopilamos */}
            <Section id="recopilamos" number="03" icon={<Database className="w-5 h-5" />} title={es ? "Información que recopilamos" : "Information we collect"}>
              {es ? (
                <>
                  <SubHeading>Datos de cuenta</SubHeading>
                  <BulletList items={[
                    "Nombre completo y dirección de correo electrónico",
                    "Contraseña (almacenada con hash seguro bcrypt, nunca en texto plano)",
                    "Foto de perfil (opcional, si la proporcionás mediante OAuth)",
                    "Rol en la plataforma (usuario estándar o administrador)",
                  ]} />

                  <SubHeading>Datos de uso y operaciones</SubHeading>
                  <BulletList items={[
                    "Historial completo de transferencias: origen, destino, archivos procesados, fecha, duración y estado",
                    "Tareas programadas: nombre, frecuencia, fuente, destino y registros de ejecución",
                    "Preferencias de configuración y ajustes de la interfaz (incluido idioma seleccionado)",
                    "Logs de actividad para diagnóstico, soporte técnico y mejora del servicio",
                    "Información del dispositivo y navegador (tipo, versión, sistema operativo, resolución)",
                    "Dirección IP de acceso (para seguridad y detección de accesos no autorizados)",
                  ]} />

                  <SubHeading>Tokens de acceso OAuth y credenciales</SubHeading>
                  <P>Cuando conectás servicios de terceros, almacenamos de forma cifrada:</P>
                  <BulletList items={[
                    "Tokens de acceso temporales (access tokens) para operar en tu nombre",
                    "Tokens de actualización (refresh tokens) para mantener la conexión activa sin pedirte permiso constantemente",
                    "Región y configuración de Amazon S3 (si aplicable)",
                    "Solo los permisos mínimos necesarios para las funciones que solicitaste",
                  ]} />

                  <Callout color="green" icon="🔒">
                    Todos los tokens y credenciales se cifran con <strong>AES-256-GCM</strong> antes de guardarse en la base de datos. Nunca los vemos en texto plano ni aparecen en logs del sistema.
                  </Callout>

                  <SubHeading>Lo que NO recopilamos</SubHeading>
                  <BulletList items={[
                    "El contenido de tus archivos (solo accedemos a ellos para ejecutar la operación que pediste)",
                    "Datos de tarjeta de crédito (procesados directamente por el proveedor de pagos)",
                    "Información de contacto de personas en tus archivos",
                    "Datos biométricos de ningún tipo",
                  ]} />
                </>
              ) : (
                <>
                  <SubHeading>Account data</SubHeading>
                  <BulletList items={[
                    "Full name and email address",
                    "Password (stored with secure bcrypt hash, never in plain text)",
                    "Profile photo (optional, provided via OAuth)",
                    "Platform role (standard user or administrator)",
                  ]} />

                  <SubHeading>Usage data and operations</SubHeading>
                  <BulletList items={[
                    "Complete transfer history: source, destination, processed files, date, duration and status",
                    "Scheduled tasks: name, frequency, source, destination and execution logs",
                    "Configuration preferences and UI settings (including selected language)",
                    "Activity logs for diagnostics, technical support and service improvement",
                    "Device and browser information (type, version, operating system, resolution)",
                    "Access IP address (for security and unauthorized access detection)",
                  ]} />

                  <SubHeading>OAuth access tokens and credentials</SubHeading>
                  <P>When you connect third-party services, we securely store:</P>
                  <BulletList items={[
                    "Temporary access tokens to operate on your behalf",
                    "Refresh tokens to keep the connection active without constantly asking for permission",
                    "Region and Amazon S3 configuration (if applicable)",
                    "Only the minimum permissions necessary for the functions you requested",
                  ]} />

                  <Callout color="green" icon="🔒">
                    All tokens and credentials are encrypted with <strong>AES-256-GCM</strong> before being stored in the database. We never see them in plain text and they never appear in system logs.
                  </Callout>

                  <SubHeading>What we do NOT collect</SubHeading>
                  <BulletList items={[
                    "The content of your files (we only access them to execute the operation you requested)",
                    "Credit card data (processed directly by the payment provider)",
                    "Contact information of people in your files",
                    "Biometric data of any kind",
                  ]} />
                </>
              )}
            </Section>

            {/* 04 — Cómo usamos */}
            <Section id="usamos" number="04" icon={<UserCheck className="w-5 h-5" />} title={es ? "Cómo usamos tu información" : "How we use your information"}>
              {es ? (
                <>
                  <P>Utilizamos la información recopilada <strong>exclusivamente</strong> para los siguientes propósitos:</P>
                  <BulletList items={[
                    "Proveer, operar y mejorar los servicios de transferencia y gestión de archivos",
                    "Autenticar tu identidad y mantener la seguridad de tu cuenta",
                    "Ejecutar transferencias, copias y sincronizaciones en tu nombre en los servicios que conectaste",
                    "Enviar notificaciones transaccionales: confirmación de email, restablecimiento de contraseña, alertas de operaciones",
                    "Mostrar estadísticas e historial de tus propias operaciones en tu panel de control",
                    "Cumplir con obligaciones legales y prevenir fraudes o abusos",
                    "Mejorar la experiencia de usuario a través de análisis agregados y anónimos (nunca individuales)",
                    "Responder a consultas de soporte técnico que nos enviés",
                  ]} />
                  <Callout color="yellow" icon="⚠️">
                    <strong>Nunca</strong> usamos tu información para publicidad dirigida, perfilado comercial, ni la compartimos con anunciantes o brokers de datos.
                  </Callout>
                </>
              ) : (
                <>
                  <P>We use the collected information <strong>exclusively</strong> for the following purposes:</P>
                  <BulletList items={[
                    "Provide, operate and improve file transfer and management services",
                    "Authenticate your identity and maintain account security",
                    "Execute transfers, copies and synchronizations on your behalf on connected services",
                    "Send transactional notifications: email confirmation, password reset, operation alerts",
                    "Display statistics and history of your own operations in your dashboard",
                    "Comply with legal obligations and prevent fraud or abuse",
                    "Improve user experience through aggregated and anonymous analytics (never individual)",
                    "Respond to technical support inquiries you send us",
                  ]} />
                  <Callout color="yellow" icon="⚠️">
                    We <strong>never</strong> use your information for targeted advertising, commercial profiling, or share it with advertisers or data brokers.
                  </Callout>
                </>
              )}
            </Section>

            {/* 05 — Almacenamiento y seguridad */}
            <Section id="seguridad" number="05" icon={<Lock className="w-5 h-5" />} title={es ? "Almacenamiento y seguridad" : "Storage and security"}>
              {es ? (
                <>
                  <SubHeading>Infraestructura técnica</SubHeading>
                  <BulletList items={[
                    "Servidores alojados en Render (región US-East), con infraestructura sobre AWS",
                    "Base de datos PostgreSQL gestionada por Supabase con cifrado en reposo",
                    "Cifrado AES-256-GCM para todos los tokens OAuth y credenciales sensibles",
                    "TLS 1.3 para todas las comunicaciones en tránsito (HTTPS obligatorio en toda la plataforma)",
                    "Autenticación gestionada por Supabase Auth con soporte para JWT seguro",
                  ]} />

                  <SubHeading>Retención de datos</SubHeading>
                  <P>Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta:</P>
                  <BulletList items={[
                    "Tus datos personales (nombre, email) se eliminan dentro de los 30 días",
                    "Los tokens OAuth de todos los servicios conectados se revocan inmediatamente",
                    "Los registros de operaciones se anonimizan y se conservan hasta 90 días por razones legales y de auditoría",
                    "Los archivos en Google Drive, Dropbox, OneDrive, Box, S3 u otros servicios <strong>no se ven afectados</strong>",
                  ]} />

                  <SubHeading>Acceso interno a los datos</SubHeading>
                  <BulletList items={[
                    "Solo el personal técnico necesario puede acceder a datos para soporte o depuración",
                    "Todo acceso interno queda registrado en logs de auditoría",
                    "Ningún empleado o colaborador puede ver el contenido de tus archivos",
                  ]} />

                  <Callout color="green" icon="🛡️">
                    Implementamos medidas de seguridad técnicas y organizativas acorde con el estado del arte para proteger tu información contra acceso no autorizado, pérdida, destrucción o alteración.
                  </Callout>
                </>
              ) : (
                <>
                  <SubHeading>Technical infrastructure</SubHeading>
                  <BulletList items={[
                    "Servers hosted on Render (US-East region), with infrastructure on AWS",
                    "PostgreSQL database managed by Supabase with encryption at rest",
                    "AES-256-GCM encryption for all OAuth tokens and sensitive credentials",
                    "TLS 1.3 for all communications in transit (HTTPS mandatory across the platform)",
                    "Authentication managed by Supabase Auth with secure JWT support",
                  ]} />

                  <SubHeading>Data retention</SubHeading>
                  <P>We retain your data while your account is active. When you delete your account:</P>
                  <BulletList items={[
                    "Your personal data (name, email) is deleted within 30 days",
                    "OAuth tokens for all connected services are immediately revoked",
                    "Operation records are anonymized and kept for up to 90 days for legal and audit reasons",
                    "Files in Google Drive, Dropbox, OneDrive, Box, S3 or other services <strong>are not affected</strong>",
                  ]} />

                  <SubHeading>Internal data access</SubHeading>
                  <BulletList items={[
                    "Only necessary technical staff can access data for support or debugging",
                    "All internal access is recorded in audit logs",
                    "No employee or collaborator can see the content of your files",
                  ]} />

                  <Callout color="green" icon="🛡️">
                    We implement technical and organizational security measures consistent with the state of the art to protect your information against unauthorized access, loss, destruction or alteration.
                  </Callout>
                </>
              )}
            </Section>

            {/* 06 — Compartición */}
            <Section id="compartimos" number="06" icon={<Eye className="w-5 h-5" />} title={es ? "Compartición de datos" : "Data sharing"}>
              {es ? (
                <>
                  <SubHeading>Lo que nunca hacemos</SubHeading>
                  <BulletList items={[
                    "Vender, alquilar o intercambiar tu información personal con terceros",
                    "Compartir tus datos con anunciantes, redes publicitarias o brokers de información",
                    "Usar tus archivos o su contenido para entrenamiento de modelos de IA",
                    "Acceder al contenido de tus archivos más allá de lo técnicamente necesario",
                  ]} />

                  <SubHeading>Proveedores de servicios (subprocesadores)</SubHeading>
                  <P>Compartimos datos mínimos y necesarios con los siguientes proveedores de infraestructura, todos sujetos a acuerdos de procesamiento de datos compatibles con GDPR:</P>
                  <div className="overflow-x-auto mt-4 mb-4">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-200 rounded-tl-lg">Proveedor</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-200">Propósito</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-200 rounded-tr-lg">Datos compartidos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Supabase", "Autenticación y base de datos", "Email, hash de contraseña, datos de sesión"],
                          ["Render", "Hosting de servidor de aplicaciones", "Logs técnicos anonimizados"],
                          ["Resend", "Envío de emails transaccionales", "Dirección de email únicamente"],
                          ["Google (OAuth)", "Integración con Google Drive", "Solo el token OAuth mínimo necesario"],
                          ["Dropbox (OAuth)", "Integración con Dropbox", "Solo el token OAuth mínimo necesario"],
                          ["Microsoft (OAuth)", "Integración con OneDrive", "Solo el token OAuth mínimo necesario"],
                          ["Box (OAuth)", "Integración con Box", "Solo el token OAuth mínimo necesario"],
                          ["Amazon AWS", "Integración con S3", "Credenciales IAM cifradas"],
                        ].map(([p, pu, d], i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800 border border-slate-200">{p}</td>
                            <td className="px-4 py-3 text-slate-600 border border-slate-200">{pu}</td>
                            <td className="px-4 py-3 text-slate-600 border border-slate-200">{d}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <SubHeading>Requerimientos legales</SubHeading>
                  <P>Podemos divulgar información personal si la ley nos lo exige, en respuesta a procesos legales válidos (orden judicial, requerimiento gubernamental), o cuando sea necesario para proteger los derechos, la propiedad o la seguridad de TERA, sus usuarios o terceros.</P>
                </>
              ) : (
                <>
                  <SubHeading>What we never do</SubHeading>
                  <BulletList items={[
                    "Sell, rent, or exchange your personal information with third parties",
                    "Share your data with advertisers, advertising networks, or data brokers",
                    "Use your files or their content for AI model training",
                    "Access the content of your files beyond what is technically necessary",
                  ]} />

                  <SubHeading>Service providers (sub-processors)</SubHeading>
                  <P>We share minimal and necessary data with the following infrastructure providers, all subject to GDPR-compatible data processing agreements:</P>
                  <div className="overflow-x-auto mt-4 mb-4">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-200">Provider</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-200">Purpose</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-200">Data shared</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Supabase", "Authentication and database", "Email, password hash, session data"],
                          ["Render", "Application server hosting", "Anonymized technical logs"],
                          ["Resend", "Transactional email delivery", "Email address only"],
                          ["Google (OAuth)", "Google Drive integration", "Minimum necessary OAuth token only"],
                          ["Dropbox (OAuth)", "Dropbox integration", "Minimum necessary OAuth token only"],
                          ["Microsoft (OAuth)", "OneDrive integration", "Minimum necessary OAuth token only"],
                          ["Box (OAuth)", "Box integration", "Minimum necessary OAuth token only"],
                          ["Amazon AWS", "S3 integration", "Encrypted IAM credentials"],
                        ].map(([p, pu, d], i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800 border border-slate-200">{p}</td>
                            <td className="px-4 py-3 text-slate-600 border border-slate-200">{pu}</td>
                            <td className="px-4 py-3 text-slate-600 border border-slate-200">{d}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <SubHeading>Legal requirements</SubHeading>
                  <P>We may disclose personal information if required by law, in response to valid legal processes (court order, government request), or when necessary to protect the rights, property, or safety of TERA, its users, or third parties.</P>
                </>
              )}
            </Section>

            {/* 07 — Terceros */}
            <Section id="terceros" number="07" icon={<ExternalLink className="w-5 h-5" />} title={es ? "Integración con servicios de terceros" : "Third-party service integrations"}>
              {es ? (
                <>
                  <P>TERA se conecta con servicios de terceros únicamente cuando vos lo autorizás explícitamente. Aquí detallamos cómo funciona cada integración:</P>

                  {[
                    { name: "Google Drive", scopes: "drive.readonly, drive.file", revoke: "myaccount.google.com/permissions" },
                    { name: "Dropbox", scopes: "files.content.read, files.content.write, account_info.read", revoke: "dropbox.com/account/applications" },
                    { name: "Microsoft OneDrive", scopes: "Files.ReadWrite, offline_access", revoke: "account.live.com/consent/Manage" },
                    { name: "Box", scopes: "root_readwrite", revoke: "app.box.com/master/settings/authorizedapps" },
                    { name: "Amazon S3", scopes: "Permisos de bucket IAM (definidos por vos)", revoke: "Desde tu consola AWS IAM" },
                  ].map(({ name, scopes, revoke }) => (
                    <div key={name} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">{name}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-slate-500">Permisos solicitados:</span><br /><code className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-[#0061D5]">{scopes}</code></div>
                        <div><span className="text-slate-500">Para revocar el acceso:</span><br /><span className="text-slate-700 text-xs">{revoke}</span></div>
                      </div>
                    </div>
                  ))}

                  <Callout color="blue" icon="ℹ️">
                    Podés desconectar cualquier servicio en cualquier momento desde <strong>Integraciones</strong> en tu panel de control. Al hacerlo, revocamos el acceso y eliminamos los tokens almacenados inmediatamente.
                  </Callout>
                </>
              ) : (
                <>
                  <P>TERA connects to third-party services only when you explicitly authorize it. Here we detail how each integration works:</P>

                  {[
                    { name: "Google Drive", scopes: "drive.readonly, drive.file", revoke: "myaccount.google.com/permissions" },
                    { name: "Dropbox", scopes: "files.content.read, files.content.write, account_info.read", revoke: "dropbox.com/account/applications" },
                    { name: "Microsoft OneDrive", scopes: "Files.ReadWrite, offline_access", revoke: "account.live.com/consent/Manage" },
                    { name: "Box", scopes: "root_readwrite", revoke: "app.box.com/master/settings/authorizedapps" },
                    { name: "Amazon S3", scopes: "IAM bucket permissions (defined by you)", revoke: "From your AWS IAM console" },
                  ].map(({ name, scopes, revoke }) => (
                    <div key={name} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">{name}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-slate-500">Requested permissions:</span><br /><code className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-[#0061D5]">{scopes}</code></div>
                        <div><span className="text-slate-500">To revoke access:</span><br /><span className="text-slate-700 text-xs">{revoke}</span></div>
                      </div>
                    </div>
                  ))}

                  <Callout color="blue" icon="ℹ️">
                    You can disconnect any service at any time from <strong>Integrations</strong> in your dashboard. When you do, we immediately revoke access and delete stored tokens.
                  </Callout>
                </>
              )}
            </Section>

            {/* 08 — Derechos */}
            <Section id="derechos" number="08" icon={<UserCheck className="w-5 h-5" />} title={es ? "Tus derechos sobre tus datos" : "Your rights over your data"}>
              {es ? (
                <>
                  <P>Dependiendo de tu ubicación geográfica, tenés los siguientes derechos sobre tus datos personales:</P>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    {[
                      { icon: "👁️", title: "Acceso", desc: "Solicitá una copia completa de los datos personales que tenemos sobre vos." },
                      { icon: "✏️", title: "Rectificación", desc: "Corregí datos incorrectos, inexactos o incompletos en tu perfil." },
                      { icon: "🗑️", title: "Supresión", desc: "Solicitá la eliminación de tu cuenta y todos tus datos personales ('derecho al olvido')." },
                      { icon: "📦", title: "Portabilidad", desc: "Recibí tus datos en formato estructurado, legible por máquina (JSON/CSV)." },
                      { icon: "🚫", title: "Oposición", desc: "Oponete al procesamiento de tus datos para determinados fines." },
                      { icon: "⏸️", title: "Limitación", desc: "Solicitá la restricción temporal del procesamiento de tus datos." },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{icon}</span>
                          <h4 className="font-bold text-slate-900">{title}</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <Callout color="blue" icon="📧">
                    Para ejercer cualquiera de estos derechos, enviá un email a <strong>{CONTACT_EMAIL}</strong> con el asunto "Ejercicio de derechos ARCO" y describiremos cómo proceder. Respondemos en un máximo de <strong>30 días hábiles</strong>.
                  </Callout>
                </>
              ) : (
                <>
                  <P>Depending on your geographic location, you have the following rights over your personal data:</P>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    {[
                      { icon: "👁️", title: "Access", desc: "Request a complete copy of the personal data we hold about you." },
                      { icon: "✏️", title: "Rectification", desc: "Correct incorrect, inaccurate or incomplete data in your profile." },
                      { icon: "🗑️", title: "Erasure", desc: "Request deletion of your account and all personal data ('right to be forgotten')." },
                      { icon: "📦", title: "Portability", desc: "Receive your data in structured, machine-readable format (JSON/CSV)." },
                      { icon: "🚫", title: "Objection", desc: "Object to the processing of your data for certain purposes." },
                      { icon: "⏸️", title: "Restriction", desc: "Request temporary restriction of processing of your data." },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{icon}</span>
                          <h4 className="font-bold text-slate-900">{title}</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <Callout color="blue" icon="📧">
                    To exercise any of these rights, send an email to <strong>{CONTACT_EMAIL}</strong> with the subject "Data rights request" and we will describe how to proceed. We respond within a maximum of <strong>30 business days</strong>.
                  </Callout>
                </>
              )}
            </Section>

            {/* 09 — Cookies */}
            <Section id="cookies" number="09" icon={<Bell className="w-5 h-5" />} title={es ? "Cookies y tecnologías de rastreo" : "Cookies and tracking technologies"}>
              {es ? (
                <>
                  <P>TERA utiliza un número mínimo de tecnologías de almacenamiento local estrictamente necesarias para el funcionamiento de la plataforma:</P>
                  <BulletList items={[
                    "Cookies de sesión autenticada: necesarias para mantener tu sesión iniciada de forma segura (JWT)",
                    "localStorage: para guardar tu preferencia de idioma y configuración visual de la interfaz",
                    "Cookies de autenticación de Supabase: para gestión segura de tokens de acceso",
                  ]} />
                  <SubHeading>Lo que NO hacemos</SubHeading>
                  <BulletList items={[
                    "No utilizamos cookies de publicidad, tracking o retargeting",
                    "No instalamos cookies de terceros con fines analíticos o de comportamiento",
                    "No compartimos datos de comportamiento con redes publicitarias o plataformas de análisis externas",
                    "No usamos píxeles de seguimiento ni fingerprinting",
                  ]} />
                  <P>Podés gestionar o eliminar las cookies desde la configuración de tu navegador en cualquier momento. La eliminación de cookies de sesión cerrará tu sesión activa.</P>
                </>
              ) : (
                <>
                  <P>TERA uses a minimum number of local storage technologies strictly necessary for platform operation:</P>
                  <BulletList items={[
                    "Authenticated session cookies: necessary to keep your session logged in securely (JWT)",
                    "localStorage: to save your language preference and UI configuration",
                    "Supabase authentication cookies: for secure access token management",
                  ]} />
                  <SubHeading>What we do NOT do</SubHeading>
                  <BulletList items={[
                    "We do not use advertising, tracking or retargeting cookies",
                    "We do not install third-party cookies for analytics or behavioral purposes",
                    "We do not share behavioral data with advertising networks or external analytics platforms",
                    "We do not use tracking pixels or fingerprinting",
                  ]} />
                  <P>You can manage or delete cookies from your browser settings at any time. Deleting session cookies will log you out of your active session.</P>
                </>
              )}
            </Section>

            {/* 10 — Menores */}
            <Section id="menores" number="10" icon={<Shield className="w-5 h-5" />} title={es ? "Menores de edad" : "Minors"}>
              {es ? (
                <>
                  <P>TERA no está dirigido a personas menores de <strong>16 años</strong>. No recopilamos intencionalmente información personal de menores de esa edad.</P>
                  <BulletList items={[
                    "Si tenés menos de 16 años, no podés utilizar nuestros servicios",
                    "Si sos padre, madre o tutor legal y creés que tu hijo/a nos proporcionó datos personales sin tu consentimiento, contactanos",
                    "Eliminaremos inmediatamente cualquier dato identificado como perteneciente a un menor de 16 años",
                    "En algunas jurisdicciones la edad mínima puede ser mayor; consultá la ley local aplicable",
                  ]} />
                </>
              ) : (
                <>
                  <P>TERA is not directed at persons under <strong>16 years of age</strong>. We do not intentionally collect personal information from minors.</P>
                  <BulletList items={[
                    "If you are under 16 years old, you may not use our services",
                    "If you are a parent or legal guardian and believe your child provided us with personal data without your consent, contact us",
                    "We will immediately delete any data identified as belonging to a minor under 16",
                    "In some jurisdictions the minimum age may be higher; consult applicable local law",
                  ]} />
                </>
              )}
            </Section>

            {/* 11 — Internacional */}
            <Section id="internac" number="11" icon={<Globe className="w-5 h-5" />} title={es ? "Transferencias internacionales de datos" : "International data transfers"}>
              {es ? (
                <>
                  <P>TERA opera desde Argentina y procesa datos en servidores ubicados en <strong>Estados Unidos</strong> (Render / AWS us-east-1) y en la infraestructura de <strong>Supabase</strong> (EU y US).</P>
                  <P>Al crear una cuenta y usar TERA, consentís expresamente que tus datos sean procesados en estas ubicaciones. Implementamos las siguientes salvaguardas para proteger las transferencias internacionales:</P>
                  <BulletList items={[
                    "Cláusulas Contractuales Estándar (SCCs) aprobadas por la Comisión Europea para transferencias desde el EEE",
                    "Proveedores subprocesadores que cumplen con el Marco de Privacidad de Datos UE-EE.UU. (Data Privacy Framework)",
                    "Cifrado de extremo a extremo para todos los datos sensibles durante el tránsito",
                  ]} />
                </>
              ) : (
                <>
                  <P>TERA operates from Argentina and processes data on servers located in the <strong>United States</strong> (Render / AWS us-east-1) and on <strong>Supabase</strong> infrastructure (EU and US).</P>
                  <P>By creating an account and using TERA, you expressly consent to your data being processed in these locations. We implement the following safeguards to protect international transfers:</P>
                  <BulletList items={[
                    "Standard Contractual Clauses (SCCs) approved by the European Commission for transfers from the EEA",
                    "Sub-processor providers compliant with the EU-US Data Privacy Framework",
                    "End-to-end encryption for all sensitive data in transit",
                  ]} />
                </>
              )}
            </Section>

            {/* 12 — Cambios */}
            <Section id="cambios" number="12" icon={<Bell className="w-5 h-5" />} title={es ? "Cambios en esta política" : "Changes to this policy"}>
              {es ? (
                <>
                  <P>Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas, en la tecnología, en los requisitos legales o en el servicio.</P>
                  <P>Cuando realicemos cambios significativos:</P>
                  <BulletList items={[
                    "Te notificaremos por correo electrónico con al menos 30 días de anticipación",
                    "Mostraremos un aviso destacado dentro de la aplicación",
                    "Actualizaremos la fecha de 'Última actualización' al inicio de este documento",
                    "Mantendremos versiones anteriores accesibles si las solicitás",
                  ]} />
                  <P>El uso continuado de TERA después de que los cambios entren en vigor implica la aceptación de la nueva política.</P>
                </>
              ) : (
                <>
                  <P>We may periodically update this Privacy Policy to reflect changes in our practices, technology, legal requirements, or service.</P>
                  <P>When we make significant changes:</P>
                  <BulletList items={[
                    "We will notify you by email at least 30 days in advance",
                    "We will display a prominent notice within the application",
                    "We will update the 'Last updated' date at the beginning of this document",
                    "We will keep previous versions accessible upon request",
                  ]} />
                  <P>Continued use of TERA after changes take effect implies acceptance of the new policy.</P>
                </>
              )}
            </Section>

            {/* 13 — GDPR */}
            <Section id="gdpr" number="13" icon={<Shield className="w-5 h-5" />} title={es ? "Base legal para el procesamiento (GDPR)" : "Legal basis for processing (GDPR)"}>
              {es ? (
                <>
                  <P>Para usuarios en el Espacio Económico Europeo, procesamos tus datos bajo las siguientes bases legales del Artículo 6 del GDPR:</P>
                  <BulletList items={[
                    "<strong>Ejecución de contrato (Art. 6.1.b):</strong> para proveer los servicios que solicitaste al registrarte",
                    "<strong>Intereses legítimos (Art. 6.1.f):</strong> para mejorar nuestros servicios, garantizar la seguridad y prevenir fraudes",
                    "<strong>Cumplimiento legal (Art. 6.1.c):</strong> cuando la ley nos requiere conservar o proporcionar información",
                    "<strong>Consentimiento (Art. 6.1.a):</strong> para comunicaciones de marketing y notificaciones opcionales (siempre opt-in, nunca por defecto)",
                  ]} />
                  <P>Podés retirar tu consentimiento en cualquier momento contactándonos, sin que esto afecte la legalidad del procesamiento previo.</P>
                </>
              ) : (
                <>
                  <P>For users in the European Economic Area, we process your data under the following legal bases of Article 6 of the GDPR:</P>
                  <BulletList items={[
                    "<strong>Contract performance (Art. 6.1.b):</strong> to provide the services you requested when registering",
                    "<strong>Legitimate interests (Art. 6.1.f):</strong> to improve our services, ensure security and prevent fraud",
                    "<strong>Legal compliance (Art. 6.1.c):</strong> when the law requires us to retain or provide information",
                    "<strong>Consent (Art. 6.1.a):</strong> for marketing communications and optional notifications (always opt-in, never by default)",
                  ]} />
                  <P>You can withdraw your consent at any time by contacting us, without affecting the lawfulness of prior processing.</P>
                </>
              )}
            </Section>

            {/* 14 — Contacto */}
            <Section id="contacto" number="14" icon={<Bell className="w-5 h-5" />} title={es ? "Contacto" : "Contact"}>
              {es ? (
                <>
                  <P>Si tenés preguntas, comentarios, solicitudes o reclamos relacionados con esta Política de Privacidad o el tratamiento de tus datos personales, contactanos:</P>
                  <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#0061D5] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg mb-1">TERA · Equipo de Privacidad</p>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0061D5] font-semibold text-lg hover:underline">{CONTACT_EMAIL}</a>
                        <p className="text-sm text-slate-500 mt-2">Respondemos en un máximo de 30 días hábiles.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <P>If you have questions, comments, requests or complaints related to this Privacy Policy or the processing of your personal data, contact us:</P>
                  <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#0061D5] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg mb-1">TERA · Privacy Team</p>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0061D5] font-semibold text-lg hover:underline">{CONTACT_EMAIL}</a>
                        <p className="text-sm text-slate-500 mt-2">We respond within a maximum of 30 business days.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Section>

            {/* 15 — Ley */}
            <Section id="ley" number="15" icon={<Shield className="w-5 h-5" />} title={es ? "Ley aplicable" : "Applicable law"}>
              {es ? (
                <>
                  <P>Esta Política de Privacidad se rige por las leyes de la <strong>República Argentina</strong>, sin perjuicio de los derechos adicionales que puedan corresponder a usuarios de la Unión Europea bajo el GDPR o de California bajo la CCPA.</P>
                  <BulletList items={[
                    "Argentina: Ley 25.326 de Protección de Datos Personales y sus disposiciones reglamentarias",
                    "Unión Europea: Reglamento (UE) 2016/679 (GDPR) para usuarios del EEE",
                    "California, EE.UU.: California Consumer Privacy Act (CCPA) para residentes de California",
                    "Jurisdicción competente: Ciudad Autónoma de Buenos Aires, Argentina",
                  ]} />
                </>
              ) : (
                <>
                  <P>This Privacy Policy is governed by the laws of the <strong>Republic of Argentina</strong>, without prejudice to the additional rights that may correspond to European Union users under the GDPR or California users under the CCPA.</P>
                  <BulletList items={[
                    "Argentina: Law 25,326 on Personal Data Protection and its regulatory provisions",
                    "European Union: Regulation (EU) 2016/679 (GDPR) for EEA users",
                    "California, USA: California Consumer Privacy Act (CCPA) for California residents",
                    "Competent jurisdiction: Autonomous City of Buenos Aires, Argentina",
                  ]} />
                </>
              )}
            </Section>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">© 2025 TERA · {es ? "Todos los derechos reservados" : "All rights reserved"}</span>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms"><span className="text-slate-500 hover:text-[#0061D5] cursor-pointer transition-colors">{es ? "Términos de Servicio" : "Terms of Service"}</span></Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-500 hover:text-[#0061D5] transition-colors">{CONTACT_EMAIL}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
  return <h3 className="font-bold text-slate-900 text-[15px] mt-6 mb-2 pb-1 border-b border-slate-100">{children}</h3>;
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
  const colors = {
    blue:   "bg-blue-50 border-blue-200 text-blue-800",
    green:  "bg-green-50 border-green-200 text-green-800",
    yellow: "bg-amber-50 border-amber-200 text-amber-800",
  };
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
