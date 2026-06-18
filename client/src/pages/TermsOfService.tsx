import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Globe, FileText, Shield, AlertTriangle, CreditCard, Scale, UserX, RefreshCw, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const LAST_UPDATED = "18 de junio de 2025";
const LAST_UPDATED_EN = "June 18, 2025";
const CONTACT_EMAIL = "legal@mytera.app";
const APP_URL = "https://mytera.app";

const SECTIONS_ES = [
  { id: "aceptacion",   title: "Aceptación de los términos" },
  { id: "servicio",     title: "Descripción del servicio" },
  { id: "cuenta",       title: "Registro y cuenta" },
  { id: "uso",          title: "Uso aceptable" },
  { id: "prohibido",    title: "Usos prohibidos" },
  { id: "planes",       title: "Planes y pagos" },
  { id: "propiedad",    title: "Propiedad intelectual" },
  { id: "privacidad",   title: "Privacidad y datos" },
  { id: "limitacion",   title: "Limitación de responsabilidad" },
  { id: "disponib",     title: "Disponibilidad del servicio" },
  { id: "terminacion",  title: "Terminación" },
  { id: "indemniz",     title: "Indemnización" },
  { id: "cambios",      title: "Cambios en los términos" },
  { id: "disputas",     title: "Resolución de disputas" },
  { id: "ley",          title: "Ley aplicable" },
  { id: "contacto",     title: "Contacto" },
];

const SECTIONS_EN = [
  { id: "aceptacion",   title: "Acceptance of terms" },
  { id: "servicio",     title: "Service description" },
  { id: "cuenta",       title: "Registration and account" },
  { id: "uso",          title: "Acceptable use" },
  { id: "prohibido",    title: "Prohibited uses" },
  { id: "planes",       title: "Plans and payments" },
  { id: "propiedad",    title: "Intellectual property" },
  { id: "privacidad",   title: "Privacy and data" },
  { id: "limitacion",   title: "Limitation of liability" },
  { id: "disponib",     title: "Service availability" },
  { id: "terminacion",  title: "Termination" },
  { id: "indemniz",     title: "Indemnification" },
  { id: "cambios",      title: "Changes to terms" },
  { id: "disputas",     title: "Dispute resolution" },
  { id: "ley",          title: "Applicable law" },
  { id: "contacto",     title: "Contact" },
];

export default function TermsOfService() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<"es" | "en">(
    (i18n.language?.startsWith("en") ? "en" : "es") as "es" | "en"
  );
  const [activeSection, setActiveSection] = useState("aceptacion");
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
              {es ? "Términos y Condiciones" : "Terms of Service"}
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
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                {es ? "Legal" : "Legal"}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              {es ? "Términos y Condiciones de Uso" : "Terms and Conditions of Use"}
            </h1>
            <p className="text-lg text-slate-300 mb-6 leading-relaxed max-w-2xl">
              {es
                ? "Al usar TERA, acordás con estos términos. Los escribimos en lenguaje claro para que sepas exactamente qué podés esperar de nosotros y qué esperamos de vos."
                : "By using TERA, you agree to these terms. We wrote them in plain language so you know exactly what to expect from us and what we expect from you."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                {es ? "Última actualización" : "Last updated"}: {es ? LAST_UPDATED : LAST_UPDATED_EN}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
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
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span className={`text-xs font-bold w-5 text-right flex-shrink-0 ${activeSection === s.id ? "text-slate-400" : "text-slate-300"}`}>
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

            {/* 01 — Aceptación */}
            <Section id="aceptacion" number="01" icon={<FileText className="w-5 h-5" />} title={es ? "Aceptación de los términos" : "Acceptance of terms"}>
              {es ? (
                <>
                  <P>Al acceder, registrarte o utilizar <strong>TERA</strong> y sus servicios, aceptás estar vinculado por estos Términos y Condiciones de Uso ("Términos"), junto con nuestra <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Política de Privacidad</span></Link> y cualquier política adicional que podamos publicar.</P>
                  <P>Estos Términos constituyen un acuerdo legal vinculante entre vos ("Usuario") y TERA. Si no estás de acuerdo con alguna parte de estos términos, no podés acceder ni utilizar el servicio.</P>
                  <P>Estos términos aplican a todos los usuarios: visitantes, usuarios registrados, usuarios de planes gratuitos y de planes de pago.</P>
                  <Callout color="blue" icon="💡">
                    Al hacer clic en "Crear cuenta" o "Iniciar sesión", confirmás que leíste, entendiste y aceptaste estos Términos.
                  </Callout>
                </>
              ) : (
                <>
                  <P>By accessing, registering, or using <strong>TERA</strong> and its services, you agree to be bound by these Terms and Conditions of Use ("Terms"), together with our <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Privacy Policy</span></Link> and any additional policies we may publish.</P>
                  <P>These Terms constitute a legally binding agreement between you ("User") and TERA. If you disagree with any part of these terms, you may not access or use the service.</P>
                  <P>These terms apply to all users: visitors, registered users, free plan users and paid plan users.</P>
                  <Callout color="blue" icon="💡">
                    By clicking "Create account" or "Sign in", you confirm that you have read, understood and accepted these Terms.
                  </Callout>
                </>
              )}
            </Section>

            {/* 02 — Descripción */}
            <Section id="servicio" number="02" icon={<FileText className="w-5 h-5" />} title={es ? "Descripción del servicio" : "Service description"}>
              {es ? (
                <>
                  <P><strong>TERA</strong> es una plataforma de software como servicio (SaaS) que permite a los usuarios:</P>
                  <BulletList items={[
                    "Conectar múltiples cuentas de almacenamiento en la nube (Google Drive, Dropbox, OneDrive, Box, Amazon S3 y otros)",
                    "Transferir, copiar y mover archivos y carpetas entre distintos servicios de almacenamiento",
                    "Programar tareas automáticas de sincronización y transferencia",
                    "Explorar y gestionar archivos de múltiples nubes desde una única interfaz",
                    "Ver historial detallado, estadísticas y análisis de operaciones realizadas",
                    "Recibir notificaciones por email sobre el estado de las operaciones",
                  ]} />
                  <P>TERA opera como intermediario técnico autorizado. <strong>No almacenamos el contenido de tus archivos.</strong> Los archivos solo pasan a través de nuestra infraestructura durante la transferencia y no se guardan de forma permanente en nuestros servidores.</P>
                  <Callout color="yellow" icon="⚠️">
                    TERA no es un servicio de almacenamiento en la nube. Solo transferimos y sincronizamos archivos entre los servicios de terceros que vos conectás.
                  </Callout>
                </>
              ) : (
                <>
                  <P><strong>TERA</strong> is a Software as a Service (SaaS) platform that allows users to:</P>
                  <BulletList items={[
                    "Connect multiple cloud storage accounts (Google Drive, Dropbox, OneDrive, Box, Amazon S3 and others)",
                    "Transfer, copy and move files and folders between different storage services",
                    "Schedule automatic synchronization and transfer tasks",
                    "Explore and manage files from multiple clouds from a single interface",
                    "View detailed history, statistics and analysis of operations performed",
                    "Receive email notifications about operation status",
                  ]} />
                  <P>TERA operates as an authorized technical intermediary. <strong>We do not store the content of your files.</strong> Files only pass through our infrastructure during transfer and are not permanently stored on our servers.</P>
                  <Callout color="yellow" icon="⚠️">
                    TERA is not a cloud storage service. We only transfer and sync files between third-party services you connect.
                  </Callout>
                </>
              )}
            </Section>

            {/* 03 — Cuenta */}
            <Section id="cuenta" number="03" icon={<Shield className="w-5 h-5" />} title={es ? "Registro y cuenta de usuario" : "Registration and user account"}>
              {es ? (
                <>
                  <SubHeading>Requisitos para registrarse</SubHeading>
                  <BulletList items={[
                    "Tener al menos <strong>16 años de edad</strong> (o la edad mínima requerida por la ley de tu país)",
                    "Proporcionar información veraz, completa y actualizada al momento del registro",
                    "Ser una persona física o representar legalmente a la entidad por la que actuás",
                    "No tener una cuenta previamente suspendida o cancelada por violación de estos Términos",
                  ]} />

                  <SubHeading>Responsabilidades del usuario</SubHeading>
                  <BulletList items={[
                    "Mantener la confidencialidad de tus credenciales de acceso (email y contraseña)",
                    "Notificarnos inmediatamente si sospechás un acceso no autorizado a tu cuenta",
                    "Ser responsable de toda actividad que ocurra bajo tu cuenta, autorizada o no",
                    "Mantener actualizada tu dirección de email para recibir comunicaciones importantes",
                    "No compartir tu cuenta con otras personas",
                  ]} />

                  <Callout color="yellow" icon="⚠️">
                    Sos responsable de cualquier actividad que ocurra bajo tu cuenta. Si descubrís un uso no autorizado, contactanos inmediatamente en <strong>{CONTACT_EMAIL}</strong>.
                  </Callout>
                </>
              ) : (
                <>
                  <SubHeading>Requirements to register</SubHeading>
                  <BulletList items={[
                    "Be at least <strong>16 years of age</strong> (or the minimum age required by your country's law)",
                    "Provide truthful, complete and up-to-date information at the time of registration",
                    "Be a natural person or legally represent the entity on whose behalf you act",
                    "Not have a previously suspended or cancelled account due to violation of these Terms",
                  ]} />

                  <SubHeading>User responsibilities</SubHeading>
                  <BulletList items={[
                    "Maintain the confidentiality of your access credentials (email and password)",
                    "Notify us immediately if you suspect unauthorized access to your account",
                    "Be responsible for all activity that occurs under your account, authorized or not",
                    "Keep your email address updated to receive important communications",
                    "Not share your account with other people",
                  ]} />

                  <Callout color="yellow" icon="⚠️">
                    You are responsible for any activity that occurs under your account. If you discover unauthorized use, contact us immediately at <strong>{CONTACT_EMAIL}</strong>.
                  </Callout>
                </>
              )}
            </Section>

            {/* 04 — Uso aceptable */}
            <Section id="uso" number="04" icon={<Shield className="w-5 h-5" />} title={es ? "Uso aceptable" : "Acceptable use"}>
              {es ? (
                <>
                  <P>Podés usar TERA para cualquier propósito legítimo que sea consistente con estos Términos. En particular:</P>
                  <BulletList items={[
                    "Transferir archivos personales y profesionales entre tus propias cuentas de almacenamiento",
                    "Automatizar respaldos y sincronizaciones entre servicios de tu propiedad o en los que tenés autorización",
                    "Gestionar y organizar archivos en múltiples plataformas de nube",
                    "Compartir el acceso con colaboradores en los que tenés autorización de compartir",
                    "Usar las funciones de análisis e historial para controlar tus propias transferencias",
                  ]} />
                </>
              ) : (
                <>
                  <P>You may use TERA for any legitimate purpose that is consistent with these Terms. In particular:</P>
                  <BulletList items={[
                    "Transfer personal and professional files between your own storage accounts",
                    "Automate backups and synchronizations between services you own or are authorized to use",
                    "Manage and organize files across multiple cloud platforms",
                    "Share access with collaborators you are authorized to share with",
                    "Use analytics and history features to monitor your own transfers",
                  ]} />
                </>
              )}
            </Section>

            {/* 05 — Prohibido */}
            <Section id="prohibido" number="05" icon={<AlertTriangle className="w-5 h-5" />} title={es ? "Usos prohibidos" : "Prohibited uses"}>
              {es ? (
                <>
                  <P>Al usar TERA, te comprometés a <strong>NO</strong> realizar ninguna de las siguientes acciones:</P>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { icon: "⚖️", title: "Actividades ilegales", desc: "Violar leyes locales, nacionales o internacionales, incluyendo leyes de propiedad intelectual, privacidad y exportación." },
                      { icon: "🦠", title: "Contenido malicioso", desc: "Transferir, almacenar o distribuir virus, malware, ransomware, spyware u otro software malicioso." },
                      { icon: "🔓", title: "Acceso no autorizado", desc: "Intentar acceder a sistemas, cuentas o datos que no te pertenecen sin autorización expresa." },
                      { icon: "📧", title: "Spam y phishing", desc: "Usar TERA para enviar correos masivos no solicitados, mensajes de phishing u otras comunicaciones engañosas." },
                      { icon: "🏴‍☠️", title: "Piratería de contenido", desc: "Transferir o distribuir contenido protegido por derechos de autor sin la debida autorización del titular." },
                      { icon: "💣", title: "Sobrecarga del sistema", desc: "Realizar ataques de denegación de servicio, sobrecargar intencionalmente la infraestructura o intentar degradar el servicio." },
                      { icon: "🔍", title: "Ingeniería inversa", desc: "Descompilar, desensamblar o intentar obtener el código fuente de TERA por cualquier medio." },
                      { icon: "🤖", title: "Scraping automatizado", desc: "Usar bots, scrapers o herramientas automatizadas para extraer datos del servicio sin autorización expresa." },
                      { icon: "👥", title: "Suplantación de identidad", desc: "Hacerse pasar por otra persona o entidad, o tergiversar tu afiliación con cualquier persona o entidad." },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                        <span className="text-lg flex-shrink-0">{icon}</span>
                        <div>
                          <p className="font-bold text-red-900 text-sm mb-0.5">{title}</p>
                          <p className="text-red-700 text-sm leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Callout color="yellow" icon="⚠️">
                    La violación de cualquiera de estas prohibiciones puede resultar en la suspensión o cancelación inmediata de tu cuenta, sin reembolso, y puede dar lugar a acciones legales.
                  </Callout>
                </>
              ) : (
                <>
                  <P>When using TERA, you agree <strong>NOT</strong> to perform any of the following actions:</P>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { icon: "⚖️", title: "Illegal activities", desc: "Violate local, national or international laws, including intellectual property, privacy and export laws." },
                      { icon: "🦠", title: "Malicious content", desc: "Transfer, store or distribute viruses, malware, ransomware, spyware or other malicious software." },
                      { icon: "🔓", title: "Unauthorized access", desc: "Attempt to access systems, accounts or data that do not belong to you without express authorization." },
                      { icon: "📧", title: "Spam and phishing", desc: "Use TERA to send unsolicited bulk emails, phishing messages or other deceptive communications." },
                      { icon: "🏴‍☠️", title: "Content piracy", desc: "Transfer or distribute copyright-protected content without proper authorization from the rights holder." },
                      { icon: "💣", title: "System overload", desc: "Conduct denial of service attacks, intentionally overload infrastructure, or attempt to degrade the service." },
                      { icon: "🔍", title: "Reverse engineering", desc: "Decompile, disassemble or attempt to obtain TERA's source code by any means." },
                      { icon: "🤖", title: "Automated scraping", desc: "Use bots, scrapers or automated tools to extract data from the service without express authorization." },
                      { icon: "👥", title: "Identity impersonation", desc: "Impersonate another person or entity, or misrepresent your affiliation with any person or entity." },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                        <span className="text-lg flex-shrink-0">{icon}</span>
                        <div>
                          <p className="font-bold text-red-900 text-sm mb-0.5">{title}</p>
                          <p className="text-red-700 text-sm leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Callout color="yellow" icon="⚠️">
                    Violation of any of these prohibitions may result in immediate suspension or cancellation of your account, without refund, and may give rise to legal action.
                  </Callout>
                </>
              )}
            </Section>

            {/* 06 — Planes y pagos */}
            <Section id="planes" number="06" icon={<CreditCard className="w-5 h-5" />} title={es ? "Planes y pagos" : "Plans and payments"}>
              {es ? (
                <>
                  <SubHeading>Planes disponibles</SubHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🆓</span>
                        <h4 className="font-black text-slate-900">Plan Gratuito</h4>
                      </div>
                      <BulletList items={[
                        "100 transferencias por día",
                        "5 operaciones simultáneas",
                        "Historial de últimas 30 operaciones",
                        "Google Drive + Dropbox",
                        "Soporte por email",
                      ]} />
                    </div>
                    <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">⚡</span>
                        <h4 className="font-black text-[#0061D5]">Plan PRO</h4>
                      </div>
                      <BulletList items={[
                        "500 transferencias por día",
                        "20 operaciones simultáneas",
                        "Historial completo ilimitado",
                        "Todos los servicios (Drive, Dropbox, OneDrive, Box, S3)",
                        "Tareas programadas automáticas",
                        "Notificaciones por email",
                        "Soporte prioritario",
                      ]} />
                    </div>
                  </div>

                  <SubHeading>Condiciones de pago</SubHeading>
                  <BulletList items={[
                    "Los pagos son procesados de forma segura a través de nuestro proveedor de pagos",
                    "No almacenamos datos de tarjetas de crédito en nuestros servidores",
                    "Las suscripciones se renuevan automáticamente al final del período contratado",
                    "Los precios están sujetos a cambios con un aviso previo de <strong>30 días</strong>",
                    "Podés cancelar tu suscripción en cualquier momento desde tu perfil",
                  ]} />

                  <SubHeading>Reembolsos</SubHeading>
                  <BulletList items={[
                    "Ofrecemos un período de prueba de 14 días para el Plan PRO",
                    "Dentro de los primeros 14 días: reembolso completo sin preguntas",
                    "Después de los 14 días: no se ofrecen reembolsos salvo casos excepcionales",
                    "Para solicitar un reembolso: enviá un email a <strong>{CONTACT_EMAIL}</strong>",
                  ]} />
                </>
              ) : (
                <>
                  <SubHeading>Available plans</SubHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🆓</span>
                        <h4 className="font-black text-slate-900">Free Plan</h4>
                      </div>
                      <BulletList items={[
                        "100 transfers per day",
                        "5 concurrent operations",
                        "History of last 30 operations",
                        "Google Drive + Dropbox",
                        "Email support",
                      ]} />
                    </div>
                    <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">⚡</span>
                        <h4 className="font-black text-[#0061D5]">PRO Plan</h4>
                      </div>
                      <BulletList items={[
                        "500 transfers per day",
                        "20 concurrent operations",
                        "Complete unlimited history",
                        "All services (Drive, Dropbox, OneDrive, Box, S3)",
                        "Automatic scheduled tasks",
                        "Email notifications",
                        "Priority support",
                      ]} />
                    </div>
                  </div>

                  <SubHeading>Payment conditions</SubHeading>
                  <BulletList items={[
                    "Payments are processed securely through our payment provider",
                    "We do not store credit card data on our servers",
                    "Subscriptions renew automatically at the end of the contracted period",
                    "Prices are subject to change with <strong>30 days</strong> prior notice",
                    "You can cancel your subscription at any time from your profile",
                  ]} />

                  <SubHeading>Refunds</SubHeading>
                  <BulletList items={[
                    "We offer a 14-day trial period for the PRO Plan",
                    "Within the first 14 days: full refund, no questions asked",
                    "After 14 days: no refunds are offered except in exceptional cases",
                    "To request a refund: send an email to <strong>{CONTACT_EMAIL}</strong>",
                  ]} />
                </>
              )}
            </Section>

            {/* 07 — Propiedad intelectual */}
            <Section id="propiedad" number="07" icon={<Scale className="w-5 h-5" />} title={es ? "Propiedad intelectual" : "Intellectual property"}>
              {es ? (
                <>
                  <SubHeading>Propiedad de TERA</SubHeading>
                  <P>TERA, su nombre, logotipo, interfaz, código fuente, diseño, funcionalidades y documentación son propiedad exclusiva de sus creadores y están protegidos por las leyes de propiedad intelectual aplicables. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.</P>

                  <SubHeading>Tus archivos son tuyos</SubHeading>
                  <P>Tus archivos y el contenido que manejás a través de TERA siguen siendo de tu propiedad en todo momento. Al usar TERA, nos otorgás únicamente una licencia técnica limitada, no exclusiva y revocable para acceder y operar con tus archivos <strong>exclusivamente</strong> según tus instrucciones. Esta licencia:</P>
                  <BulletList items={[
                    "No nos otorga ningún derecho de propiedad sobre tu contenido",
                    "Solo existe para ejecutar las operaciones que vos configurás",
                    "Se revoca automáticamente al desconectar un servicio o eliminar tu cuenta",
                    "Nunca usamos tu contenido para entrenamiento de IA, análisis comercial ni ningún otro propósito",
                  ]} />

                  <Callout color="green" icon="✅">
                    TERA nunca lee, analiza ni utiliza el contenido de tus archivos más allá de lo técnicamente necesario para ejecutar la operación que vos solicitaste.
                  </Callout>
                </>
              ) : (
                <>
                  <SubHeading>TERA's property</SubHeading>
                  <P>TERA, its name, logo, interface, source code, design, features and documentation are the exclusive property of its creators and are protected by applicable intellectual property laws. Reproduction, distribution or modification without express authorization is prohibited.</P>

                  <SubHeading>Your files are yours</SubHeading>
                  <P>Your files and the content you handle through TERA remain your property at all times. By using TERA, you grant us only a limited, non-exclusive, revocable technical license to access and operate with your files <strong>exclusively</strong> according to your instructions. This license:</P>
                  <BulletList items={[
                    "Does not grant us any ownership rights over your content",
                    "Only exists to execute the operations you configure",
                    "Is automatically revoked when you disconnect a service or delete your account",
                    "We never use your content for AI training, commercial analysis or any other purpose",
                  ]} />

                  <Callout color="green" icon="✅">
                    TERA never reads, analyzes or uses the content of your files beyond what is technically necessary to execute the operation you requested.
                  </Callout>
                </>
              )}
            </Section>

            {/* 08 — Privacidad */}
            <Section id="privacidad" number="08" icon={<Shield className="w-5 h-5" />} title={es ? "Privacidad y datos" : "Privacy and data"}>
              {es ? (
                <>
                  <P>El uso de TERA implica el procesamiento de ciertos datos personales. El tratamiento de estos datos está descrito en detalle en nuestra <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Política de Privacidad</span></Link>, que forma parte integral de estos Términos.</P>
                  <P>En resumen:</P>
                  <BulletList items={[
                    "Recopilamos solo los datos mínimos necesarios para prestar el servicio",
                    "No vendemos, alquilamos ni compartimos tus datos con terceros con fines comerciales",
                    "Todos los tokens OAuth y credenciales se almacenan cifrados con AES-256-GCM",
                    "Podés eliminar tu cuenta y todos tus datos en cualquier momento",
                    "Respetamos el GDPR para usuarios europeos y la Ley 25.326 para usuarios argentinos",
                  ]} />
                </>
              ) : (
                <>
                  <P>Using TERA involves the processing of certain personal data. The processing of this data is described in detail in our <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Privacy Policy</span></Link>, which forms an integral part of these Terms.</P>
                  <P>In summary:</P>
                  <BulletList items={[
                    "We collect only the minimum data necessary to provide the service",
                    "We do not sell, rent or share your data with third parties for commercial purposes",
                    "All OAuth tokens and credentials are stored encrypted with AES-256-GCM",
                    "You can delete your account and all your data at any time",
                    "We respect GDPR for European users and Law 25,326 for Argentine users",
                  ]} />
                </>
              )}
            </Section>

            {/* 09 — Limitación */}
            <Section id="limitacion" number="09" icon={<AlertTriangle className="w-5 h-5" />} title={es ? "Limitación de responsabilidad" : "Limitation of liability"}>
              {es ? (
                <>
                  <P>TERA se proporciona <strong>"tal cual"</strong> y <strong>"según disponibilidad"</strong>. En la máxima medida permitida por la ley aplicable:</P>
                  <BulletList items={[
                    "No garantizamos que el servicio sea ininterrumpido, libre de errores, seguro o exento de virus",
                    "No nos responsabilizamos por pérdidas de datos causadas por errores de terceros (Google, Dropbox, etc.) o por interrupciones del servicio",
                    "No nos responsabilizamos por daños indirectos, incidentales, especiales, consecuentes o punitivos",
                    "No nos responsabilizamos por el contenido de los archivos que transferís a través de TERA",
                    "Nuestra responsabilidad máxima total hacia vos no excederá el monto que pagaste por el servicio en los últimos <strong>12 meses</strong>",
                  ]} />
                  <Callout color="yellow" icon="⚠️">
                    Te recomendamos mantener copias de respaldo de tus archivos importantes en todo momento. TERA es una herramienta de transferencia, no un servicio de respaldo garantizado.
                  </Callout>
                </>
              ) : (
                <>
                  <P>TERA is provided <strong>"as is"</strong> and <strong>"as available"</strong>. To the maximum extent permitted by applicable law:</P>
                  <BulletList items={[
                    "We do not guarantee that the service will be uninterrupted, error-free, secure or virus-free",
                    "We are not responsible for data loss caused by third-party errors (Google, Dropbox, etc.) or service interruptions",
                    "We are not responsible for indirect, incidental, special, consequential or punitive damages",
                    "We are not responsible for the content of files you transfer through TERA",
                    "Our maximum total liability to you shall not exceed the amount you paid for the service in the last <strong>12 months</strong>",
                  ]} />
                  <Callout color="yellow" icon="⚠️">
                    We recommend keeping backup copies of your important files at all times. TERA is a transfer tool, not a guaranteed backup service.
                  </Callout>
                </>
              )}
            </Section>

            {/* 10 — Disponibilidad */}
            <Section id="disponib" number="10" icon={<RefreshCw className="w-5 h-5" />} title={es ? "Disponibilidad del servicio" : "Service availability"}>
              {es ? (
                <>
                  <P>Nos esforzamos por mantener TERA disponible con la mayor continuidad posible. Sin embargo:</P>
                  <BulletList items={[
                    "No garantizamos disponibilidad ininterrumpida 24/7/365",
                    "Podemos realizar mantenimientos programados notificando con al menos 24 horas de anticipación",
                    "En caso de interrupciones no planificadas, trabajaremos para restablecer el servicio lo antes posible",
                    "Las interrupciones en servicios de terceros (Google, Dropbox, etc.) están fuera de nuestro control",
                    "Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del servicio en cualquier momento",
                  ]} />
                </>
              ) : (
                <>
                  <P>We strive to keep TERA available with the greatest continuity possible. However:</P>
                  <BulletList items={[
                    "We do not guarantee uninterrupted 24/7/365 availability",
                    "We may perform scheduled maintenance with at least 24 hours notice",
                    "In case of unplanned outages, we will work to restore service as soon as possible",
                    "Interruptions in third-party services (Google, Dropbox, etc.) are outside our control",
                    "We reserve the right to modify, suspend or discontinue any part of the service at any time",
                  ]} />
                </>
              )}
            </Section>

            {/* 11 — Terminación */}
            <Section id="terminacion" number="11" icon={<UserX className="w-5 h-5" />} title={es ? "Terminación de la cuenta" : "Account termination"}>
              {es ? (
                <>
                  <SubHeading>Cancelación voluntaria</SubHeading>
                  <P>Podés cancelar tu cuenta en cualquier momento desde tu perfil de usuario o contactándonos. Al cancelar:</P>
                  <BulletList items={[
                    "Perderás acceso inmediato al servicio",
                    "Tus datos personales se eliminarán según nuestra Política de Privacidad",
                    "Los tokens de acceso a servicios de terceros se revocarán",
                    "Tus archivos en Google Drive, Dropbox y otros servicios <strong>no se ven afectados</strong>",
                  ]} />

                  <SubHeading>Suspensión por violación de términos</SubHeading>
                  <P>Podemos suspender o cancelar tu cuenta inmediatamente, sin previo aviso, si:</P>
                  <BulletList items={[
                    "Violás estos Términos y Condiciones",
                    "Detectamos actividad fraudulenta, maliciosa o abusiva",
                    "Tu suscripción de pago vence sin renovación (acceso degradado a plan gratuito)",
                    "Recibimos un requerimiento legal para hacerlo",
                    "TERA cesa operaciones (con aviso previo de 30 días en este caso)",
                  ]} />
                </>
              ) : (
                <>
                  <SubHeading>Voluntary cancellation</SubHeading>
                  <P>You can cancel your account at any time from your user profile or by contacting us. Upon cancellation:</P>
                  <BulletList items={[
                    "You will lose immediate access to the service",
                    "Your personal data will be deleted according to our Privacy Policy",
                    "Access tokens to third-party services will be revoked",
                    "Your files in Google Drive, Dropbox and other services <strong>are not affected</strong>",
                  ]} />

                  <SubHeading>Suspension for terms violation</SubHeading>
                  <P>We may suspend or cancel your account immediately, without prior notice, if:</P>
                  <BulletList items={[
                    "You violate these Terms and Conditions",
                    "We detect fraudulent, malicious or abusive activity",
                    "Your paid subscription expires without renewal (access degraded to free plan)",
                    "We receive a legal requirement to do so",
                    "TERA ceases operations (with 30 days prior notice in this case)",
                  ]} />
                </>
              )}
            </Section>

            {/* 12 — Indemnización */}
            <Section id="indemniz" number="12" icon={<Scale className="w-5 h-5" />} title={es ? "Indemnización" : "Indemnification"}>
              {es ? (
                <>
                  <P>Aceptás indemnizar, defender y mantener indemne a TERA, sus fundadores, empleados, colaboradores, licenciantes y proveedores de servicios de y contra cualquier reclamación, responsabilidad, daño, sentencia, recompensa, pérdida, costo, gasto u honorario (incluidos honorarios legales razonables) que surjan de o en relación con:</P>
                  <BulletList items={[
                    "Tu violación de estos Términos y Condiciones",
                    "Tu uso del servicio TERA de forma no autorizada o prohibida",
                    "Tu violación de cualquier derecho de terceros, incluidos derechos de propiedad intelectual o privacidad",
                    "El contenido de los archivos que transferís o gestionás a través de TERA",
                    "Cualquier declaración falsa o engañosa que hagas en relación con TERA",
                  ]} />
                </>
              ) : (
                <>
                  <P>You agree to indemnify, defend and hold harmless TERA, its founders, employees, collaborators, licensors and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses or fees (including reasonable legal fees) arising out of or in connection with:</P>
                  <BulletList items={[
                    "Your violation of these Terms and Conditions",
                    "Your use of the TERA service in an unauthorized or prohibited manner",
                    "Your violation of any third-party rights, including intellectual property or privacy rights",
                    "The content of the files you transfer or manage through TERA",
                    "Any false or misleading statement you make in connection with TERA",
                  ]} />
                </>
              )}
            </Section>

            {/* 13 — Cambios */}
            <Section id="cambios" number="13" icon={<RefreshCw className="w-5 h-5" />} title={es ? "Cambios en los términos" : "Changes to terms"}>
              {es ? (
                <>
                  <P>Podemos modificar estos Términos en cualquier momento. Cuando realicemos cambios significativos:</P>
                  <BulletList items={[
                    "Te notificaremos por email con al menos <strong>30 días de anticipación</strong>",
                    "Mostraremos un aviso destacado dentro de la aplicación",
                    "Actualizaremos la fecha de 'Última actualización' en este documento",
                    "En caso de cambios menores (correcciones tipográficas, clarificaciones), los publicaremos sin aviso previo",
                  ]} />
                  <P>El uso continuado de TERA después de que los cambios entren en vigor constituirá tu aceptación de los nuevos Términos. Si no aceptás los cambios, debés dejar de usar el servicio y eliminar tu cuenta.</P>
                </>
              ) : (
                <>
                  <P>We may modify these Terms at any time. When we make significant changes:</P>
                  <BulletList items={[
                    "We will notify you by email with at least <strong>30 days notice</strong>",
                    "We will display a prominent notice within the application",
                    "We will update the 'Last updated' date on this document",
                    "For minor changes (typographical corrections, clarifications), we will post them without prior notice",
                  ]} />
                  <P>Continued use of TERA after changes take effect will constitute your acceptance of the new Terms. If you do not accept the changes, you must stop using the service and delete your account.</P>
                </>
              )}
            </Section>

            {/* 14 — Disputas */}
            <Section id="disputas" number="14" icon={<Scale className="w-5 h-5" />} title={es ? "Resolución de disputas" : "Dispute resolution"}>
              {es ? (
                <>
                  <P>Ante cualquier disputa, reclamación o controversia relacionada con estos Términos o el uso de TERA:</P>
                  <BulletList items={[
                    "<strong>Paso 1 — Resolución amistosa:</strong> Las partes acuerdan intentar resolver el conflicto de forma directa mediante comunicación escrita a {CONTACT_EMAIL} dentro de los primeros 30 días",
                    "<strong>Paso 2 — Mediación:</strong> Si no se llega a un acuerdo, las partes pueden optar por mediación ante una institución neutral acordada por ambas partes",
                    "<strong>Paso 3 — Arbitraje o litigio:</strong> De persistir el conflicto, se someterá a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires",
                  ]} />
                  <P>Para usuarios de la Unión Europea: tenés el derecho adicional de acudir a la plataforma de resolución de disputas en línea de la Comisión Europea.</P>
                </>
              ) : (
                <>
                  <P>For any dispute, claim or controversy related to these Terms or the use of TERA:</P>
                  <BulletList items={[
                    "<strong>Step 1 — Friendly resolution:</strong> The parties agree to attempt to resolve the conflict directly through written communication to {CONTACT_EMAIL} within the first 30 days",
                    "<strong>Step 2 — Mediation:</strong> If no agreement is reached, the parties may opt for mediation before a neutral institution agreed upon by both parties",
                    "<strong>Step 3 — Arbitration or litigation:</strong> If the conflict persists, it will be submitted to the jurisdiction of the ordinary courts of the Autonomous City of Buenos Aires",
                  ]} />
                  <P>For European Union users: you have the additional right to access the European Commission's online dispute resolution platform.</P>
                </>
              )}
            </Section>

            {/* 15 — Ley */}
            <Section id="ley" number="15" icon={<Scale className="w-5 h-5" />} title={es ? "Ley aplicable" : "Applicable law"}>
              {es ? (
                <>
                  <P>Estos Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la <strong>República Argentina</strong>, sin dar efecto a ninguna disposición sobre conflicto de leyes.</P>
                  <BulletList items={[
                    "Ley general: Legislación civil y comercial de la República Argentina",
                    "Protección al consumidor: Ley 24.240 de Defensa del Consumidor (Argentina)",
                    "Privacidad de datos: Ley 25.326 de Protección de Datos Personales (Argentina)",
                    "Usuarios europeos: Reglamento (UE) 2016/679 (GDPR) en lo que corresponda",
                    "Jurisdicción: Tribunales ordinarios de la Ciudad Autónoma de Buenos Aires",
                  ]} />
                </>
              ) : (
                <>
                  <P>These Terms and Conditions are governed by and construed in accordance with the laws of the <strong>Republic of Argentina</strong>, without giving effect to any conflict of law provisions.</P>
                  <BulletList items={[
                    "General law: Civil and commercial legislation of the Republic of Argentina",
                    "Consumer protection: Law 24,240 on Consumer Defense (Argentina)",
                    "Data privacy: Law 25,326 on Personal Data Protection (Argentina)",
                    "European users: Regulation (EU) 2016/679 (GDPR) where applicable",
                    "Jurisdiction: Ordinary courts of the Autonomous City of Buenos Aires",
                  ]} />
                </>
              )}
            </Section>

            {/* 16 — Contacto */}
            <Section id="contacto" number="16" icon={<FileText className="w-5 h-5" />} title={es ? "Contacto" : "Contact"}>
              {es ? (
                <>
                  <P>Para consultas, solicitudes o reclamos relacionados con estos Términos y Condiciones:</P>
                  <div className="mt-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Scale className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg mb-1">TERA · Equipo Legal</p>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0061D5] font-semibold text-lg hover:underline">{CONTACT_EMAIL}</a>
                        <p className="text-sm text-slate-500 mt-2">Respondemos en un máximo de 15 días hábiles.</p>
                      </div>
                    </div>
                  </div>
                  <P className="mt-4">Para consultas de privacidad: <a href="mailto:privacy@mytera.app" className="text-[#0061D5] hover:underline">privacy@mytera.app</a></P>
                </>
              ) : (
                <>
                  <P>For inquiries, requests or complaints related to these Terms and Conditions:</P>
                  <div className="mt-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Scale className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg mb-1">TERA · Legal Team</p>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0061D5] font-semibold text-lg hover:underline">{CONTACT_EMAIL}</a>
                        <p className="text-sm text-slate-500 mt-2">We respond within a maximum of 15 business days.</p>
                      </div>
                    </div>
                  </div>
                  <P className="mt-4">For privacy inquiries: <a href="mailto:privacy@mytera.app" className="text-[#0061D5] hover:underline">privacy@mytera.app</a></P>
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
            <Link href="/privacy"><span className="text-slate-500 hover:text-[#0061D5] cursor-pointer transition-colors">{es ? "Política de Privacidad" : "Privacy Policy"}</span></Link>
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
          <div className="w-8 h-8 bg-slate-800/10 rounded-lg flex items-center justify-center text-slate-700">{icon}</div>
        </div>
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
      </div>
      <div className="px-6 py-6 space-y-4">{children}</div>
    </section>
  );
}

function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-slate-600 leading-relaxed text-[15px] ${className}`}>{children}</p>;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-slate-900 text-[15px] mt-6 mb-2 pb-1 border-b border-slate-100">{children}</h3>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] text-slate-600 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 bg-slate-700 rounded-full flex-shrink-0" />
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
