import { usePageTitle } from '@/hooks/usePageTitle';
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, FileText, Shield, AlertTriangle, CreditCard, Scale, UserX, RefreshCw, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type Lang = "es" | "en" | "pt";

const LAST_UPDATED: Record<Lang, string> = {
  es: "22 de junio de 2026",
  en: "June 22, 2026",
  pt: "22 de junho de 2026",
};
const CONTACT_EMAIL  = "legal@mytera.app";
const PRIVACY_EMAIL  = "privacy@mytera.app";

const SECTIONS: Record<Lang, { id: string; title: string }[]> = {
  es: [
    { id: "aceptacion",  title: "Aceptación de los términos" },
    { id: "servicio",    title: "Descripción del servicio" },
    { id: "cuenta",      title: "Registro y cuenta" },
    { id: "uso",         title: "Uso aceptable" },
    { id: "prohibido",   title: "Usos prohibidos" },
    { id: "planes",      title: "Planes y pagos" },
    { id: "propiedad",   title: "Propiedad intelectual" },
    { id: "privacidad",  title: "Privacidad y datos" },
    { id: "limitacion",  title: "Limitación de responsabilidad" },
    { id: "disponib",    title: "Disponibilidad del servicio" },
    { id: "terminacion", title: "Terminación" },
    { id: "indemniz",    title: "Indemnización" },
    { id: "cambios",     title: "Cambios en los términos" },
    { id: "disputas",    title: "Resolución de disputas" },
    { id: "ley",         title: "Ley aplicable" },
    { id: "contacto",    title: "Contacto" },
  ],
  en: [
    { id: "aceptacion",  title: "Acceptance of terms" },
    { id: "servicio",    title: "Service description" },
    { id: "cuenta",      title: "Registration and account" },
    { id: "uso",         title: "Acceptable use" },
    { id: "prohibido",   title: "Prohibited uses" },
    { id: "planes",      title: "Plans and payments" },
    { id: "propiedad",   title: "Intellectual property" },
    { id: "privacidad",  title: "Privacy and data" },
    { id: "limitacion",  title: "Limitation of liability" },
    { id: "disponib",    title: "Service availability" },
    { id: "terminacion", title: "Termination" },
    { id: "indemniz",    title: "Indemnification" },
    { id: "cambios",     title: "Changes to terms" },
    { id: "disputas",    title: "Dispute resolution" },
    { id: "ley",         title: "Applicable law" },
    { id: "contacto",    title: "Contact" },
  ],
  pt: [
    { id: "aceptacion",  title: "Aceitação dos termos" },
    { id: "servicio",    title: "Descrição do serviço" },
    { id: "cuenta",      title: "Cadastro e conta" },
    { id: "uso",         title: "Uso aceitável" },
    { id: "prohibido",   title: "Usos proibidos" },
    { id: "planes",      title: "Planos e pagamentos" },
    { id: "propiedad",   title: "Propriedade intelectual" },
    { id: "privacidad",  title: "Privacidade e dados" },
    { id: "limitacion",  title: "Limitação de responsabilidade" },
    { id: "disponib",    title: "Disponibilidade do serviço" },
    { id: "terminacion", title: "Encerramento" },
    { id: "indemniz",    title: "Indenização" },
    { id: "cambios",     title: "Alterações nos termos" },
    { id: "disputas",    title: "Resolução de disputas" },
    { id: "ley",         title: "Lei aplicável" },
    { id: "contacto",    title: "Contato" },
  ],
};

export default function TermsOfService() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('pageTitles.terms', 'TERA — Terms of Service'));
  const raw = i18n.language?.startsWith("pt") ? "pt" : i18n.language?.startsWith("en") ? "en" : "es";
  const [lang, setLang] = useState<Lang>(raw as Lang);
  const [activeSection, setActiveSection] = useState("aceptacion");
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

  const pageTitle   = { es: "Términos y Condiciones de Uso", en: "Terms and Conditions of Use", pt: "Termos e Condições de Uso" }[lang];
  const contentLabel = { es: "Contenido", en: "Contents", pt: "Conteúdo" }[lang];
  const backLabel    = { es: "Volver", en: "Back", pt: "Voltar" }[lang];

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
                className={`px-3 py-2 transition-colors ${lang === l ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">{pageTitle}</h1>
            <p className="text-lg text-slate-300 mb-6 leading-relaxed max-w-2xl">
              {{ es: "Al usar TERA, acordás con estos términos. Los escribimos en lenguaje claro para que sepas exactamente qué podés esperar de nosotros y qué esperamos de vos.", en: "By using TERA, you agree to these terms. We wrote them in plain language so you know exactly what to expect from us and what we expect from you.", pt: "Ao usar a TERA, você concorda com estes termos. Os escrevemos em linguagem clara para que você saiba exatamente o que pode esperar de nós e o que esperamos de você." }[lang]}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
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
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${activeSection === s.id ? "bg-slate-800 text-white font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}>
                    <span className={`text-xs font-black w-5 text-right flex-shrink-0 ${activeSection === s.id ? "text-slate-400" : "text-slate-300"}`}>{String(i + 1).padStart(2, "0")}</span>
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
            <Section id="aceptacion" number="01" icon={<FileText className="w-5 h-5" />} title={sections[0].title}>
              {lang === "es" && <>
                <P>Al acceder, registrarte o utilizar <strong>TERA</strong>, aceptás estar vinculado por estos Términos, junto con nuestra <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Política de Privacidad</span></Link>. Aplica a todos los usuarios: visitantes, registrados y suscriptores de pago.</P>
                <Callout color="blue" icon="💡">Al hacer clic en "Crear cuenta" o "Iniciar sesión", confirmás que leíste y aceptaste estos Términos.</Callout>
              </>}
              {lang === "en" && <>
                <P>By accessing, registering, or using <strong>TERA</strong>, you agree to be bound by these Terms, together with our <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Privacy Policy</span></Link>. Applies to all users: visitors, registered users and paid subscribers.</P>
                <Callout color="blue" icon="💡">By clicking "Create account" or "Sign in", you confirm you have read and accepted these Terms.</Callout>
              </>}
              {lang === "pt" && <>
                <P>Ao acessar, se cadastrar ou usar a <strong>TERA</strong>, você concorda com estes Termos, juntamente com nossa <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Política de Privacidade</span></Link>. Aplica-se a todos os usuários: visitantes, cadastrados e assinantes pagantes.</P>
                <Callout color="blue" icon="💡">Ao clicar em "Criar conta" ou "Entrar", você confirma que leu e aceitou estes Termos.</Callout>
              </>}
            </Section>

            {/* 02 */}
            <Section id="servicio" number="02" icon={<FileText className="w-5 h-5" />} title={sections[1].title}>
              {lang === "es" && <>
                <P><strong>TERA</strong> es una plataforma SaaS que permite conectar múltiples cuentas de almacenamiento en la nube y transferir archivos entre ellas. <strong>No almacenamos el contenido de tus archivos</strong> — solo los movemos según tus instrucciones.</P>
                <BulletList items={["Conectar Google Drive, Dropbox, OneDrive, Box, Amazon S3", "Transferir y copiar archivos entre servicios de nube", "Programar tareas automáticas de sincronización", "Ver historial, estadísticas y análisis de operaciones"]} />
                <Callout color="yellow" icon="⚠️">TERA no es un servicio de almacenamiento — solo transferimos archivos entre los servicios que vos conectás.</Callout>
              </>}
              {lang === "en" && <>
                <P><strong>TERA</strong> is a SaaS platform that allows connecting multiple cloud storage accounts and transferring files between them. <strong>We do not store the content of your files</strong> — we only move them according to your instructions.</P>
                <BulletList items={["Connect Google Drive, Dropbox, OneDrive, Box, Amazon S3", "Transfer and copy files between cloud services", "Schedule automatic synchronization tasks", "View history, statistics and operation analytics"]} />
                <Callout color="yellow" icon="⚠️">TERA is not a storage service — we only transfer files between the services you connect.</Callout>
              </>}
              {lang === "pt" && <>
                <P><strong>TERA</strong> é uma plataforma SaaS que permite conectar várias contas de armazenamento em nuvem e transferir arquivos entre elas. <strong>Não armazenamos o conteúdo dos seus arquivos</strong> — apenas os movemos conforme suas instruções.</P>
                <BulletList items={["Conectar Google Drive, Dropbox, OneDrive, Box, Amazon S3", "Transferir e copiar arquivos entre serviços de nuvem", "Agendar tarefas automáticas de sincronização", "Ver histórico, estatísticas e análises de operações"]} />
                <Callout color="yellow" icon="⚠️">A TERA não é um serviço de armazenamento — apenas transferimos arquivos entre os serviços que você conecta.</Callout>
              </>}
            </Section>

            {/* 03 */}
            <Section id="cuenta" number="03" icon={<Shield className="w-5 h-5" />} title={sections[2].title}>
              {lang === "es" && <>
                <SubHeading>Requisitos</SubHeading>
                <BulletList items={["Tener al menos <strong>16 años</strong>", "Proporcionar información veraz al registrarte", "No tener cuenta previamente suspendida por violación de estos Términos"]} />
                <SubHeading>Responsabilidades</SubHeading>
                <BulletList items={["Mantener la confidencialidad de tus credenciales", "Notificarnos ante cualquier acceso no autorizado", "Ser responsable de toda actividad bajo tu cuenta", "No compartir tu cuenta con terceros"]} />
                <Callout color="yellow" icon="⚠️">Ante acceso no autorizado, contactanos inmediatamente en <strong>{CONTACT_EMAIL}</strong>.</Callout>
              </>}
              {lang === "en" && <>
                <SubHeading>Requirements</SubHeading>
                <BulletList items={["Be at least <strong>16 years old</strong>", "Provide truthful information when registering", "Not have a previously suspended account for violating these Terms"]} />
                <SubHeading>Responsibilities</SubHeading>
                <BulletList items={["Maintain confidentiality of your credentials", "Notify us of any unauthorized access", "Be responsible for all activity under your account", "Do not share your account with third parties"]} />
                <Callout color="yellow" icon="⚠️">Upon unauthorized access, contact us immediately at <strong>{CONTACT_EMAIL}</strong>.</Callout>
              </>}
              {lang === "pt" && <>
                <SubHeading>Requisitos</SubHeading>
                <BulletList items={["Ter pelo menos <strong>16 anos</strong>", "Fornecer informações verdadeiras ao se cadastrar", "Não ter conta previamente suspensa por violação destes Termos"]} />
                <SubHeading>Responsabilidades</SubHeading>
                <BulletList items={["Manter a confidencialidade das suas credenciais", "Nos notificar sobre qualquer acesso não autorizado", "Ser responsável por toda atividade na sua conta", "Não compartilhar sua conta com terceiros"]} />
                <Callout color="yellow" icon="⚠️">Em caso de acesso não autorizado, entre em contato imediatamente em <strong>{CONTACT_EMAIL}</strong>.</Callout>
              </>}
            </Section>

            {/* 04 */}
            <Section id="uso" number="04" icon={<Shield className="w-5 h-5" />} title={sections[3].title}>
              {lang === "es" && <BulletList items={["Transferir archivos personales y profesionales entre tus propias cuentas", "Automatizar respaldos y sincronizaciones entre servicios de tu propiedad", "Gestionar y organizar archivos en múltiples plataformas de nube", "Usar las funciones de análisis e historial para controlar tus transferencias"]} />}
              {lang === "en" && <BulletList items={["Transfer personal and professional files between your own accounts", "Automate backups and syncs between services you own", "Manage and organize files across multiple cloud platforms", "Use analytics and history features to monitor your transfers"]} />}
              {lang === "pt" && <BulletList items={["Transferir arquivos pessoais e profissionais entre suas próprias contas", "Automatizar backups e sincronizações entre serviços de sua propriedade", "Gerenciar e organizar arquivos em várias plataformas de nuvem", "Usar as funções de análise e histórico para monitorar suas transferências"]} />}
            </Section>

            {/* 05 */}
            <Section id="prohibido" number="05" icon={<AlertTriangle className="w-5 h-5" />} title={sections[4].title}>
              <div className="grid grid-cols-1 gap-3">
                {(lang === "es" ? [
                  ["⚖️", "Actividades ilegales", "Violar leyes locales, nacionales o internacionales, incluyendo propiedad intelectual y privacidad."],
                  ["🦠", "Contenido malicioso", "Transferir virus, malware, ransomware u otro software malicioso."],
                  ["🔓", "Acceso no autorizado", "Intentar acceder a cuentas o datos que no te pertenecen."],
                  ["📧", "Spam y phishing", "Usar TERA para actividades fraudulentas o comunicaciones engañosas."],
                  ["🏴‍☠️", "Piratería", "Transferir contenido protegido por derechos de autor sin autorización."],
                  ["💣", "Sobrecarga del sistema", "Ataques DDoS o sobrecarga intencional de la infraestructura."],
                  ["🔍", "Ingeniería inversa", "Descompilar o intentar obtener el código fuente de TERA."],
                  ["🤖", "Scraping", "Usar bots para extraer datos del servicio sin autorización."],
                ] : lang === "en" ? [
                  ["⚖️", "Illegal activities", "Violate local, national or international laws, including intellectual property and privacy."],
                  ["🦠", "Malicious content", "Transfer viruses, malware, ransomware or other malicious software."],
                  ["🔓", "Unauthorized access", "Attempt to access accounts or data that do not belong to you."],
                  ["📧", "Spam and phishing", "Use TERA for fraudulent activities or deceptive communications."],
                  ["🏴‍☠️", "Piracy", "Transfer copyright-protected content without authorization."],
                  ["💣", "System overload", "DDoS attacks or intentional infrastructure overloading."],
                  ["🔍", "Reverse engineering", "Decompile or attempt to obtain TERA's source code."],
                  ["🤖", "Scraping", "Use bots to extract data from the service without authorization."],
                ] : [
                  ["⚖️", "Atividades ilegais", "Violar leis locais, nacionais ou internacionais, incluindo propriedade intelectual e privacidade."],
                  ["🦠", "Conteúdo malicioso", "Transferir vírus, malware, ransomware ou outros softwares maliciosos."],
                  ["🔓", "Acesso não autorizado", "Tentar acessar contas ou dados que não lhe pertencem."],
                  ["📧", "Spam e phishing", "Usar a TERA para atividades fraudulentas ou comunicações enganosas."],
                  ["🏴‍☠️", "Pirataria", "Transferir conteúdo protegido por direitos autorais sem autorização."],
                  ["💣", "Sobrecarga do sistema", "Ataques DDoS ou sobrecarga intencional da infraestrutura."],
                  ["🔍", "Engenharia reversa", "Descompilar ou tentar obter o código-fonte da TERA."],
                  ["🤖", "Scraping", "Usar bots para extrair dados do serviço sem autorização."],
                ]).map(([icon, title, desc]) => (
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
                {{ es: "Violar estas prohibiciones puede resultar en suspensión inmediata de la cuenta y acciones legales.", en: "Violating these prohibitions may result in immediate account suspension and legal action.", pt: "Violar essas proibições pode resultar em suspensão imediata da conta e ação legal." }[lang]}
              </Callout>
            </Section>

            {/* 06 */}
            <Section id="planes" number="06" icon={<CreditCard className="w-5 h-5" />} title={sections[5].title}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2">
                {/* Free */}
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🆓</span>
                    <h4 className="font-black text-slate-900">{{ es: "Gratuito", en: "Free", pt: "Gratuito" }[lang]}</h4>
                  </div>
                  <p className="text-xl font-black text-slate-700 mb-3">$0</p>
                  <BulletList items={{ es: ["20 operaciones/mes", "5 GB de tráfico", "Google Drive, Dropbox, OneDrive, Box, S3", "Soporte por email"], en: ["20 operations/month", "5 GB traffic", "Google Drive, Dropbox, OneDrive, Box, S3", "Email support"], pt: ["20 operações/mês", "5 GB de tráfego", "Google Drive, Dropbox, OneDrive, Box, S3", "Suporte por email"] }[lang]} />
                </div>
                {/* Pro */}
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">⚡</span>
                    <h4 className="font-black text-[#0061D5]">Pro</h4>
                  </div>
                  <p className="text-xl font-black text-blue-700 mb-3">$7.99<span className="text-sm font-semibold text-blue-400">{{ es: "/mes", en: "/mo", pt: "/mês" }[lang]}</span></p>
                  <BulletList items={{ es: ["300 operaciones/mes", "200 GB de tráfico", "Google Drive, Dropbox, OneDrive, Box, S3", "Tareas programadas automáticas", "Notificaciones por email", "Soporte prioritario"], en: ["300 operations/month", "200 GB traffic", "Google Drive, Dropbox, OneDrive, Box, S3", "Automatic scheduled tasks", "Email notifications", "Priority support"], pt: ["300 operações/mês", "200 GB de tráfego", "Google Drive, Dropbox, OneDrive, Box, S3", "Tarefas agendadas automáticas", "Notificações por email", "Suporte prioritário"] }[lang]} />
                </div>
                {/* Business */}
                <div className="p-5 bg-violet-50 rounded-xl border border-violet-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">👑</span>
                    <h4 className="font-black text-violet-700">Business</h4>
                  </div>
                  <p className="text-xl font-black text-violet-700 mb-3">$19.99<span className="text-sm font-semibold text-violet-400">{{ es: "/mes", en: "/mo", pt: "/mês" }[lang]}</span></p>
                  <BulletList items={{ es: ["Operaciones ilimitadas", "2 TB de tráfico", "Google Drive, Dropbox, OneDrive, Box, S3", "Todo lo de Pro incluido", "Soporte empresarial"], en: ["Unlimited operations", "2 TB traffic", "Google Drive, Dropbox, OneDrive, Box, S3", "Everything in Pro included", "Business support"], pt: ["Operações ilimitadas", "2 TB de tráfego", "Google Drive, Dropbox, OneDrive, Box, S3", "Tudo do Pro incluído", "Suporte empresarial"] }[lang]} />
                </div>
              </div>
              <Callout color="blue" icon="ℹ️">
                {{ es: "Todos los planes incluyen acceso a los 5 servicios de nube compatibles: Google Drive, Dropbox, Microsoft OneDrive, Box y Amazon S3.", en: "All plans include access to all 5 supported cloud services: Google Drive, Dropbox, Microsoft OneDrive, Box and Amazon S3.", pt: "Todos os planos incluem acesso a todos os 5 serviços de nuvem compatíveis: Google Drive, Dropbox, Microsoft OneDrive, Box e Amazon S3." }[lang]}
              </Callout>
              <SubHeading>{{ es: "Condiciones de pago", en: "Payment conditions", pt: "Condições de pagamento" }[lang]}</SubHeading>
              {lang === "es" && <BulletList items={["No almacenamos datos de tarjetas de crédito — procesado por Stripe", "Las suscripciones se renuevan automáticamente cada mes", "Precios en USD, sujetos a cambios con 30 días de aviso previo", "Cancelación disponible en cualquier momento desde Configuración"]} />}
              {lang === "en" && <BulletList items={["We do not store credit card data — processed by Stripe", "Subscriptions renew automatically each month", "Prices in USD, subject to change with 30 days prior notice", "Cancellation available at any time from Settings"]} />}
              {lang === "pt" && <BulletList items={["Não armazenamos dados de cartão de crédito — processado pela Stripe", "As assinaturas são renovadas automaticamente a cada mês", "Preços em USD, sujeitos a alterações com 30 dias de aviso prévio", "Cancelamento disponível a qualquer momento em Configurações"]} />}
              <SubHeading>{{ es: "Reembolsos", en: "Refunds", pt: "Reembolsos" }[lang]}</SubHeading>
              {lang === "es" && <BulletList items={["Reembolso completo dentro de los primeros <strong>7 días</strong> tras la suscripción", "Sin reembolsos después de 7 días (salvo errores técnicos imputables a TERA)", "Al cancelar, el plan permanece activo hasta el fin del período facturado"]} />}
              {lang === "en" && <BulletList items={["Full refund within the first <strong>7 days</strong> of subscription", "No refunds after 7 days (except technical errors attributable to TERA)", "Upon cancellation, the plan remains active until the end of the billing period"]} />}
              {lang === "pt" && <BulletList items={["Reembolso total nos primeiros <strong>7 dias</strong> após a assinatura", "Sem reembolsos após 7 dias (exceto erros técnicos imputáveis à TERA)", "Ao cancelar, o plano permanece ativo até o fim do período faturado"]} />}
            </Section>

            {/* 07 */}
            <Section id="propiedad" number="07" icon={<Scale className="w-5 h-5" />} title={sections[6].title}>
              {lang === "es" && <>
                <SubHeading>Propiedad de TERA</SubHeading>
                <P>TERA, su nombre, logotipo, código fuente y diseño son propiedad de sus creadores y están protegidos por leyes de propiedad intelectual. Queda prohibida su reproducción sin autorización expresa.</P>
                <SubHeading>Tus archivos son tuyos</SubHeading>
                <P>Tus archivos siguen siendo de tu propiedad. Solo te pedimos una licencia técnica limitada para ejecutar las operaciones que vos configurás. <strong>Nunca usamos tu contenido para entrenamiento de IA ni análisis comercial.</strong></P>
                <Callout color="green" icon="✅">TERA nunca lee ni analiza el contenido de tus archivos más allá de lo técnicamente necesario para ejecutar la operación solicitada.</Callout>
              </>}
              {lang === "en" && <>
                <SubHeading>TERA's property</SubHeading>
                <P>TERA, its name, logo, source code and design are the property of its creators and protected by intellectual property laws. Reproduction without express authorization is prohibited.</P>
                <SubHeading>Your files are yours</SubHeading>
                <P>Your files remain your property. We only ask for a limited technical license to execute the operations you configure. <strong>We never use your content for AI training or commercial analysis.</strong></P>
                <Callout color="green" icon="✅">TERA never reads or analyzes the content of your files beyond what is technically necessary to execute the requested operation.</Callout>
              </>}
              {lang === "pt" && <>
                <SubHeading>Propriedade da TERA</SubHeading>
                <P>A TERA, seu nome, logotipo, código-fonte e design são propriedade de seus criadores e protegidos pelas leis de propriedade intelectual. A reprodução sem autorização expressa é proibida.</P>
                <SubHeading>Seus arquivos são seus</SubHeading>
                <P>Seus arquivos permanecem de sua propriedade. Solicitamos apenas uma licença técnica limitada para executar as operações que você configura. <strong>Nunca usamos seu conteúdo para treinamento de IA ou análise comercial.</strong></P>
                <Callout color="green" icon="✅">A TERA nunca lê nem analisa o conteúdo dos seus arquivos além do tecnicamente necessário para executar a operação solicitada.</Callout>
              </>}
            </Section>

            {/* 08 */}
            <Section id="privacidad" number="08" icon={<Shield className="w-5 h-5" />} title={sections[7].title}>
              {lang === "es" && <><P>El uso de TERA implica el procesamiento de datos personales. Consultá nuestra <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Política de Privacidad</span></Link> para el detalle completo.</P><BulletList items={["Solo recopilamos datos mínimos necesarios", "No vendemos ni compartimos datos con fines comerciales", "Tokens OAuth cifrados con AES-256-GCM", "Podés eliminar tu cuenta y datos en cualquier momento"]} /></>}
              {lang === "en" && <><P>Using TERA involves processing personal data. See our <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Privacy Policy</span></Link> for full details.</P><BulletList items={["We only collect minimum necessary data", "We do not sell or share data for commercial purposes", "OAuth tokens encrypted with AES-256-GCM", "You can delete your account and data at any time"]} /></>}
              {lang === "pt" && <><P>O uso da TERA implica o processamento de dados pessoais. Consulte nossa <Link href="/privacy"><span className="text-[#0061D5] hover:underline cursor-pointer">Política de Privacidade</span></Link> para detalhes completos.</P><BulletList items={["Coletamos apenas os dados mínimos necessários", "Não vendemos nem compartilhamos dados para fins comerciais", "Tokens OAuth criptografados com AES-256-GCM", "Você pode excluir sua conta e dados a qualquer momento"]} /></>}
            </Section>

            {/* 09 */}
            <Section id="limitacion" number="09" icon={<AlertTriangle className="w-5 h-5" />} title={sections[8].title}>
              {lang === "es" && <>
                <P>TERA se proporciona <strong>"tal cual"</strong> y <strong>"según disponibilidad"</strong>. En la máxima medida permitida por ley:</P>
                <BulletList items={["No garantizamos disponibilidad ininterrumpida", "No nos responsabilizamos por pérdidas de datos causadas por servicios de terceros", "No nos responsabilizamos por daños indirectos o consecuentes", "Nuestra responsabilidad máxima no excederá lo pagado en los últimos 12 meses"]} />
                <Callout color="yellow" icon="⚠️">Recomendamos mantener copias de respaldo de tus archivos importantes. TERA es una herramienta de transferencia, no de respaldo garantizado.</Callout>
              </>}
              {lang === "en" && <>
                <P>TERA is provided <strong>"as is"</strong> and <strong>"as available"</strong>. To the maximum extent permitted by law:</P>
                <BulletList items={["We do not guarantee uninterrupted availability", "We are not responsible for data loss caused by third-party services", "We are not responsible for indirect or consequential damages", "Our maximum liability will not exceed what you paid in the last 12 months"]} />
                <Callout color="yellow" icon="⚠️">We recommend keeping backup copies of your important files. TERA is a transfer tool, not a guaranteed backup service.</Callout>
              </>}
              {lang === "pt" && <>
                <P>A TERA é fornecida <strong>"como está"</strong> e <strong>"conforme disponibilidade"</strong>. Na medida máxima permitida por lei:</P>
                <BulletList items={["Não garantimos disponibilidade ininterrupta", "Não nos responsabilizamos por perda de dados causada por serviços de terceiros", "Não nos responsabilizamos por danos indiretos ou consequentes", "Nossa responsabilidade máxima não excederá o valor pago nos últimos 12 meses"]} />
                <Callout color="yellow" icon="⚠️">Recomendamos manter cópias de backup dos seus arquivos importantes. A TERA é uma ferramenta de transferência, não de backup garantido.</Callout>
              </>}
            </Section>

            {/* 10 */}
            <Section id="disponib" number="10" icon={<RefreshCw className="w-5 h-5" />} title={sections[9].title}>
              {lang === "es" && <BulletList items={["No garantizamos disponibilidad 24/7/365", "Mantenimientos programados con al menos 24h de aviso", "Trabajamos para restablecer el servicio lo antes posible ante interrupciones", "Interrupciones en servicios de terceros están fuera de nuestro control"]} />}
              {lang === "en" && <BulletList items={["We do not guarantee 24/7/365 availability", "Scheduled maintenance with at least 24h notice", "We work to restore service as soon as possible upon outages", "Third-party service interruptions are outside our control"]} />}
              {lang === "pt" && <BulletList items={["Não garantimos disponibilidade 24/7/365", "Manutenções agendadas com pelo menos 24h de aviso", "Trabalhamos para restaurar o serviço o mais rápido possível em caso de interrupções", "Interrupções em serviços de terceiros estão fora do nosso controle"]} />}
            </Section>

            {/* 11 */}
            <Section id="terminacion" number="11" icon={<UserX className="w-5 h-5" />} title={sections[10].title}>
              {lang === "es" && <>
                <SubHeading>Cancelación voluntaria</SubHeading>
                <BulletList items={["Podés cancelar en cualquier momento desde tu perfil", "Los tokens OAuth se revocan inmediatamente", "Tus archivos en los servicios de terceros no se ven afectados"]} />
                <SubHeading>Suspensión por incumplimiento</SubHeading>
                <BulletList items={["Violación de estos Términos", "Detección de actividad fraudulenta o maliciosa", "Requerimiento legal", "TERA cesa operaciones (con 30 días de aviso)"]} />
              </>}
              {lang === "en" && <>
                <SubHeading>Voluntary cancellation</SubHeading>
                <BulletList items={["You can cancel at any time from your profile", "OAuth tokens are immediately revoked", "Your files in third-party services are not affected"]} />
                <SubHeading>Suspension for non-compliance</SubHeading>
                <BulletList items={["Violation of these Terms", "Detection of fraudulent or malicious activity", "Legal requirement", "TERA ceases operations (with 30 days notice)"]} />
              </>}
              {lang === "pt" && <>
                <SubHeading>Cancelamento voluntário</SubHeading>
                <BulletList items={["Você pode cancelar a qualquer momento no seu perfil", "Os tokens OAuth são revogados imediatamente", "Seus arquivos nos serviços de terceiros não são afetados"]} />
                <SubHeading>Suspensão por descumprimento</SubHeading>
                <BulletList items={["Violação destes Termos", "Detecção de atividade fraudulenta ou maliciosa", "Exigência legal", "A TERA encerra as operações (com 30 dias de aviso)"]} />
              </>}
            </Section>

            {/* 12 */}
            <Section id="indemniz" number="12" icon={<Scale className="w-5 h-5" />} title={sections[11].title}>
              {lang === "es" && <P>Aceptás indemnizar a TERA, sus fundadores y colaboradores de cualquier reclamación, daño o gasto (incluidos honorarios legales) que surjan de: tu violación de estos Términos, tu uso no autorizado del servicio, o la violación de derechos de terceros a través de tu uso de TERA.</P>}
              {lang === "en" && <P>You agree to indemnify TERA, its founders and collaborators from any claims, damages or expenses (including legal fees) arising from: your violation of these Terms, your unauthorized use of the service, or violation of third-party rights through your use of TERA.</P>}
              {lang === "pt" && <P>Você concorda em indenizar a TERA, seus fundadores e colaboradores de quaisquer reclamações, danos ou despesas (incluindo honorários advocatícios) decorrentes de: sua violação destes Termos, seu uso não autorizado do serviço ou violação de direitos de terceiros por meio do seu uso da TERA.</P>}
            </Section>

            {/* 13 */}
            <Section id="cambios" number="13" icon={<RefreshCw className="w-5 h-5" />} title={sections[12].title}>
              {lang === "es" && <BulletList items={["Notificamos por email con al menos <strong>30 días de anticipación</strong> ante cambios significativos", "Mostramos aviso destacado dentro de la app", "El uso continuado implica aceptación de los nuevos términos", "Si no aceptás los cambios, podés cancelar tu cuenta"]} />}
              {lang === "en" && <BulletList items={["We notify by email at least <strong>30 days in advance</strong> for significant changes", "We display a prominent notice in the app", "Continued use implies acceptance of the new terms", "If you don't accept the changes, you can cancel your account"]} />}
              {lang === "pt" && <BulletList items={["Notificamos por email com pelo menos <strong>30 dias de antecedência</strong> para alterações significativas", "Exibimos aviso destacado no app", "O uso continuado implica aceitação dos novos termos", "Se não aceitar as alterações, você pode cancelar sua conta"]} />}
            </Section>

            {/* 14 */}
            <Section id="disputas" number="14" icon={<Scale className="w-5 h-5" />} title={sections[13].title}>
              {lang === "es" && <BulletList items={["<strong>Paso 1:</strong> Resolución amistosa — contactarnos en " + CONTACT_EMAIL + " dentro de los 30 días", "<strong>Paso 2:</strong> Mediación ante institución neutral acordada por ambas partes", "<strong>Paso 3:</strong> Tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, Argentina"]} />}
              {lang === "en" && <BulletList items={["<strong>Step 1:</strong> Friendly resolution — contact us at " + CONTACT_EMAIL + " within 30 days", "<strong>Step 2:</strong> Mediation before a neutral institution agreed by both parties", "<strong>Step 3:</strong> Ordinary courts of the Autonomous City of Buenos Aires, Argentina"]} />}
              {lang === "pt" && <BulletList items={["<strong>Passo 1:</strong> Resolução amigável — entre em contato em " + CONTACT_EMAIL + " dentro de 30 dias", "<strong>Passo 2:</strong> Mediação perante instituição neutra acordada pelas partes", "<strong>Passo 3:</strong> Tribunais ordinários da Cidade Autônoma de Buenos Aires, Argentina"]} />}
            </Section>

            {/* 15 */}
            <Section id="ley" number="15" icon={<Scale className="w-5 h-5" />} title={sections[14].title}>
              {lang === "es" && <BulletList items={["Ley general: Legislación civil y comercial de la República Argentina", "Consumidor: Ley 24.240 de Defensa del Consumidor", "Privacidad: Ley 25.326 de Protección de Datos Personales", "Usuarios europeos: GDPR en lo que corresponda", "Jurisdicción: Tribunales de la Ciudad Autónoma de Buenos Aires"]} />}
              {lang === "en" && <BulletList items={["General law: Civil and commercial legislation of Argentina", "Consumer: Law 24,240 on Consumer Defense", "Privacy: Law 25,326 on Personal Data Protection", "European users: GDPR where applicable", "Jurisdiction: Courts of the Autonomous City of Buenos Aires"]} />}
              {lang === "pt" && <BulletList items={["Lei geral: Legislação civil e comercial da República Argentina", "Consumidor: Lei 24.240 de Defesa do Consumidor (Argentina)", "Privacidade: Lei 25.326 de Proteção de Dados Pessoais + LGPD para usuários brasileiros", "Usuários europeus: GDPR quando aplicável", "Jurisdição: Tribunais da Cidade Autônoma de Buenos Aires, Argentina"]} />}
            </Section>

            {/* 16 */}
            <Section id="contacto" number="16" icon={<FileText className="w-5 h-5" />} title={sections[15].title}>
              <div className="mt-2 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg mb-1">TERA · {{ es: "Equipo Legal", en: "Legal Team", pt: "Equipe Jurídica" }[lang]}</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0061D5] font-semibold text-lg hover:underline">{CONTACT_EMAIL}</a>
                    <p className="text-sm text-slate-500 mt-2">{{ es: "Respondemos en máximo 15 días hábiles.", en: "We respond within 15 business days.", pt: "Respondemos em no máximo 15 dias úteis." }[lang]}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                {{ es: "Para consultas de privacidad:", en: "For privacy inquiries:", pt: "Para consultas de privacidade:" }[lang]}{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[#0061D5] hover:underline">{PRIVACY_EMAIL}</a>
              </p>
            </Section>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">© 2025 TERA · {{ es: "Todos los derechos reservados", en: "All rights reserved", pt: "Todos os direitos reservados" }[lang]}</span>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy"><span className="text-slate-500 hover:text-[#0061D5] cursor-pointer transition-colors">{{ es: "Política de Privacidad", en: "Privacy Policy", pt: "Política de Privacidade" }[lang]}</span></Link>
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
          <div className="w-8 h-8 bg-slate-800/10 rounded-lg flex items-center justify-center text-slate-700">{icon}</div>
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
          <span className="mt-2 w-1.5 h-1.5 bg-slate-700 rounded-full flex-shrink-0" />
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
