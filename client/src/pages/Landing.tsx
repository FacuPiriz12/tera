import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Menu, X, Shield, Lock, CheckCircle2, RefreshCw,
  Clock, Copy, Inbox, History, Zap, ChevronRight, Globe,
  Twitter, Linkedin, Github, ArrowLeftRight, FolderSync, Bell,
  GripVertical, MousePointer2, MoveRight
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import logoUrl from '../assets/logo.png';
import LanguageSelector from '../components/LanguageSelector';

// ─── Drag & Drop animated mockup ─────────────────────────────────────────────
function DragDropMockup() {
  const [dragging, setDragging] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const cycle = () => {
      setPhase(0); setDragging(false); setDropped(false);
      setTimeout(() => {
        setPhase(1); setDragging(true);
        setTimeout(() => {
          setPhase(2); setDragging(false); setDropped(true);
          setTimeout(() => { setPhase(0); setDropped(false); }, 2200);
        }, 1600);
      }, 1200);
    };
    cycle();
    const id = setInterval(cycle, 5500);
    return () => clearInterval(id);
  }, []);

  const files = [
    { name: 'Informe_final.pdf', icon: '📄', size: '2.1 MB' },
    { name: 'Logo_v3.png', icon: '🖼️', size: '840 KB' },
    { name: 'Contrato.docx', icon: '📝', size: '1.3 MB' },
  ];

  return (
    <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 shadow-sm select-none">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="h-9 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => (
              <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
            ))}
          </div>
          <div className="flex-1 mx-4 h-5 bg-gray-100 rounded-md text-[10px] font-medium text-gray-400 flex items-center px-3">
            mytera.app/explorer
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 h-64">
          <div className="p-3 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              </div>
              <span className="text-[11px] font-black text-gray-600">Google Drive</span>
            </div>
            <div className="space-y-1.5 flex-1">
              {files.map((file, i) => {
                const isDragged = dragging && i === 0;
                return (
                  <motion.div
                    key={file.name}
                    animate={isDragged ? { opacity: 0.3, scale: 0.95 } : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      i === 0 && phase === 0 ? 'bg-blue-50 border-blue-200 cursor-grab' : 'bg-white border-gray-100'
                    }`}
                  >
                    <span className="text-sm">{file.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-700 truncate">{file.name}</p>
                      <p className="text-[9px] text-gray-400">{file.size}</p>
                    </div>
                    {i === 0 && phase === 0 && <GripVertical className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className={`p-3 flex flex-col transition-all duration-300 ${dragging ? 'bg-blue-50' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-700" />
              </div>
              <span className="text-[11px] font-black text-gray-600">Dropbox</span>
            </div>

            <AnimatePresence>
              {dragging && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 border-2 border-dashed border-blue-400 rounded-xl flex flex-col items-center justify-center gap-2 bg-blue-50"
                >
                  <MoveRight className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600">Soltar aquí</span>
                </motion.div>
              )}
              {dropped && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-green-50 border border-green-200">
                    <span className="text-sm">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-700 truncate">Informe_final.pdf</p>
                      <p className="text-[9px] text-green-600 font-bold">✓ Transferido</p>
                    </div>
                  </div>
                </motion.div>
              )}
              {!dragging && !dropped && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center text-gray-300">
                  <span className="text-[10px] font-medium">Arrastrá archivos aquí</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            initial={{ x: 60, y: -120, opacity: 0 }}
            animate={{ x: 180, y: -80, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="absolute pointer-events-none"
            style={{ bottom: '5rem', left: '2rem' }}
          >
            <div className="relative">
              <MousePointer2 className="w-6 h-6 text-indigo-600 drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping opacity-70" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs font-bold text-gray-400 mt-4">
        Arrastrá archivos entre tus nubes directamente
      </p>
    </div>
  );
}

// ─── Animated transfer card shown in hero ────────────────────────────────────
function TransferCard() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const operations = [
    { from: 'Google Drive', to: 'Dropbox', file: 'Informe Q1 2026.pdf', size: '2.4 MB', color: '#4285F4' },
    { from: 'Dropbox', to: 'Google Drive', file: 'Presentación equipo.pptx', size: '8.1 MB', color: '#0061FF' },
    { from: 'Google Drive', to: 'Dropbox', file: 'Contratos firmados/', size: '45 archivos', color: '#4285F4' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setStep(s => (s + 1) % operations.length); return 0; }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const op = operations[step];

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100 p-7 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transferencia activa</span>
        </div>
        <div className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{Math.round(progress)}%</div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg viewBox="0 0 87.3 78" className="w-5 h-5">
              <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="M43.65 25L29.9 1.2C28.55.4 27 0 25.45 0H0l27.5 47.7 16.15-22.7z" fill="#00ac47"/>
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60.5l5.4 10.45L73.55 76.8z" fill="#ea4335"/>
              <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832d"/>
              <path d="M60.5 53.3H27.5L13.75 77.1c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2L60.5 53.3z" fill="#2684fc"/>
              <path d="M73.4 26.85l-13.75-23.8c-1.35-.8-2.9-1.2-4.45-1.2H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25l29.75 28.3 14.1-24.45c-.8-1.4-1.95-2.5-3.1-2.0z" fill="#00ac47"/>
            </svg>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Origen</p>
          <p className="text-sm font-black text-gray-900 mt-0.5">{op.from}</p>
        </div>

        <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowRight className="w-5 h-5 text-blue-500 flex-shrink-0" />
        </motion.div>

        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0061FF">
              <path d="M6 2C4.9 2 4 2.9 4 4v1.17A2 2 0 0 0 3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-1-1.73V4a2 2 0 0 0-2-2H6zm0 2h12v1H6V4zM5 8h14v9H5V8z"/>
            </svg>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Destino</p>
          <p className="text-sm font-black text-gray-900 mt-0.5">{op.to}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-gray-700 truncate max-w-[70%]">{op.file}</span>
          <span className="text-xs font-bold text-gray-400">{op.size}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
          <motion.div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: op.color }} transition={{ duration: 0.1 }} />
        </div>
      </div>

      <div className="space-y-2">
        {['Presupuesto 2026.xlsx', 'Logo_final_v3.png'].map((f, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-500 truncate">{f}</span>
            <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Listo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ step, icon: Icon, title, desc, delay }: { step: number, icon: any, title: string, desc: string, delay: number }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay, duration: 0.5 }} className="relative flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="absolute -top-3 -right-3 w-7 h-7 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center text-xs font-black text-blue-600 shadow-sm">{step}</div>
      <h4 className="text-lg font-black text-gray-900 mb-2 tracking-tight">{title}</h4>
      <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, badge, color, delay }: { icon: any, title: string, desc: string, badge?: string, color: string, delay: number }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay, duration: 0.5 }} whileHover={{ y: -6 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-400 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-lg font-black text-gray-900 tracking-tight">{title}</h4>
        {badge && <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md ml-2 flex-shrink-0">{badge}</span>}
      </div>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const features = [
    { icon: Copy,       title: t('landing.features.f1Title'), desc: t('landing.features.f1Desc'), color: 'blue' },
    { icon: FolderSync, title: t('landing.features.f2Title'), desc: t('landing.features.f2Desc'), badge: 'PRO', color: 'purple' },
    { icon: History,    title: t('landing.features.f3Title'), desc: t('landing.features.f3Desc'), color: 'green' },
    { icon: Inbox,      title: t('landing.features.f4Title'), desc: t('landing.features.f4Desc'), color: 'orange' },
    { icon: Bell,       title: t('landing.features.f5Title'), desc: t('landing.features.f5Desc'), color: 'blue' },
    { icon: Shield,     title: t('landing.features.f6Title'), desc: t('landing.features.f6Desc'), color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between h-18 py-3">
            <Link href="/" className="flex items-center cursor-pointer">
              <img src={logoUrl} alt="TERA" className="h-[7rem] w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">{t('landing.nav.howItWorks')}</a>
              <a href="#funcionalidades" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">{t('landing.nav.features')}</a>
              <Link href="/pricing" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">{t('landing.nav.pricing')}</Link>
              <a href="#seguridad" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">{t('landing.nav.security')}</a>
            </div>

            <div className="hidden md:flex items-center gap-5">
              <div className="w-px h-5 bg-gray-200" />
              <button onClick={() => setLocation('/login')} className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                {t('landing.nav.login')}
              </button>
              <button
                onClick={() => setLocation('/login?mode=register')}
                className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                {t('landing.nav.startFree')}
              </button>
              <LanguageSelector />
            </div>

            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-0 z-40 bg-white pt-24 md:hidden">
            <div className="flex flex-col gap-6 px-6 py-8">
              {[
                ['#como-funciona', t('landing.nav.howItWorks')],
                ['#funcionalidades', t('landing.nav.features')],
                ['/pricing', t('landing.nav.pricing')],
                ['#seguridad', t('landing.nav.security')],
              ].map(([href, label]) => (
                <a key={label} href={href} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-gray-900">{label}</a>
              ))}
              <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                <button onClick={() => setLocation('/login')} className="text-lg font-bold text-gray-900 py-2 text-left">{t('landing.nav.login')}</button>
                <button onClick={() => setLocation('/login?mode=register')} className="bg-blue-600 text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-blue-200">
                  {t('landing.nav.startFree')}
                </button>
                <LanguageSelector />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 px-6 lg:px-16 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 60, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-[700px] h-[700px] bg-blue-50/60 rounded-full blur-3xl -z-10" />
        <motion.div animate={{ scale: [1.1, 1, 1.1], rotate: [0, -60, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-6">
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }} className="inline-flex items-center gap-2.5 mb-8 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
                <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">{t('landing.hero.badge')}</span>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl lg:text-6xl font-black text-gray-900 leading-[1.08] mb-6 tracking-tight">
                {t('landing.hero.title')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {t('landing.hero.highlight')}
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg font-medium">
                {t('landing.hero.description')}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setLocation('/login?mode=register')} className="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group">
                  {t('landing.hero.cta')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#como-funciona" className="bg-white border-2 border-gray-100 text-gray-800 font-bold px-8 py-4 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
                  {t('landing.hero.howItWorks')}
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }} className="mt-12 flex flex-wrap items-center gap-6">
                {[
                  { icon: CheckCircle2, key: 'noCard' },
                  { icon: Shield,       key: 'encryption' },
                  { icon: Zap,          key: 'instantTransfer' },
                ].map(({ icon: Icon, key }) => (
                  <div key={key} className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                    <Icon className="w-4 h-4 text-blue-500" />
                    {t(`landing.hero.${key}`)}
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="w-full max-w-md">
                <TransferCard />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Drag & Drop feature ────────────────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full mb-6">
                <MousePointer2 className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-700">{t('landing.dragdrop.badge')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-5 leading-tight tracking-tight">
                {t('landing.dragdrop.title')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  {t('landing.dragdrop.highlight')}
                </span>
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 font-medium">{t('landing.dragdrop.description')}</p>
              <ul className="space-y-4 mb-8">
                {(['f1', 'f2', 'f3', 'f4'] as const).map((k) => (
                  <li key={k} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <span className="text-gray-700 font-semibold text-sm">{t(`landing.dragdrop.${k}`)}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setLocation('/login?mode=register')} className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all group">
                {t('landing.dragdrop.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
              <DragDropMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Integrations strip ─────────────────────────────────────────────── */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex flex-wrap items-center justify-center gap-12">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.25em]">{t('landing.integrations.label')}</p>
            {[
              { name: 'Google Drive', color: '#4285F4' },
              { name: 'Dropbox', color: '#0061FF' },
            ].map(({ name, color }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15', border: `1.5px solid ${color}30` }}>
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
                </div>
                <span className="text-sm font-black text-gray-700">{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-white border border-dashed border-gray-200 px-3 py-1.5 rounded-full">
              <span>{t('landing.integrations.comingSoon')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 bg-white scroll-mt-20" id="como-funciona">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-3">{t('landing.howItWorks.label')}</p>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">{t('landing.howItWorks.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-7 left-1/6 right-1/6 h-px bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 hidden md:block" />
            <StepCard step={1} icon={ArrowLeftRight} title={t('landing.howItWorks.step1Title')} desc={t('landing.howItWorks.step1Desc')} delay={0} />
            <StepCard step={2} icon={Copy}          title={t('landing.howItWorks.step2Title')} desc={t('landing.howItWorks.step2Desc')} delay={0.15} />
            <StepCard step={3} icon={RefreshCw}     title={t('landing.howItWorks.step3Title')} desc={t('landing.howItWorks.step3Desc')} delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 bg-gray-50/50 scroll-mt-20" id="funcionalidades">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-3">{t('landing.features.label')}</p>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-5 tracking-tight">{t('landing.features.title')}</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">{t('landing.features.description')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* ── Scheduled Tasks highlight ──────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8">
                <FolderSync className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-blue-400">{t('landing.tasks.badge')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                {t('landing.tasks.title')}{' '}
                <span className="text-blue-400">{t('landing.tasks.highlight')}</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed font-medium">{t('landing.tasks.description')}</p>
              <ul className="space-y-4 mb-10">
                {(['f1', 'f2', 'f3', 'f4'] as const).map((k) => (
                  <li key={k} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-gray-300 font-medium text-sm">{t(`landing.tasks.${k}`)}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setLocation('/login?mode=register')} className="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-500 transition-all flex items-center gap-2 group">
                {t('landing.tasks.cta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative">
              <div className="bg-gray-800 rounded-3xl p-7 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white font-black">Mis tareas programadas</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">2 activas</p>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-bold text-green-400">Activo</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Backup Proyectos', schedule: 'Diario · 23:00', last: 'Hace 3h · 47 archivos' },
                    { name: 'Sync Fotos Drive', schedule: 'Semanal · Lunes', last: 'Hace 6 días · 12 archivos' },
                  ].map((task, i) => (
                    <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.15 }} className="bg-gray-700/50 rounded-2xl p-5 border border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-bold text-sm">{task.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-400 font-medium">{task.schedule}</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-1" />
                      </div>
                      <div className="h-px bg-white/5 mb-3" />
                      <p className="text-xs text-gray-500 font-medium">Última ejecución: {task.last}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Security ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 bg-white scroll-mt-20" id="seguridad">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: Shield,       key: 'card1', bg: 'bg-blue-600',  text: 'text-white',      iconColor: 'text-white',    mt: false },
                { icon: Lock,         key: 'card2', bg: 'bg-gray-50',   text: 'text-gray-900',   iconColor: 'text-blue-600', mt: true  },
                { icon: History,      key: 'card3', bg: 'bg-gray-900',  text: 'text-white',      iconColor: 'text-blue-400', mt: false },
                { icon: CheckCircle2, key: 'card4', bg: 'bg-gray-50',   text: 'text-gray-900',   iconColor: 'text-green-600',mt: false },
              ].map(({ icon: Icon, key, bg, text, iconColor, mt }, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`${bg} ${text} rounded-3xl p-7 ${mt ? 'mt-10' : ''}`}>
                  <Icon className={`w-8 h-8 ${iconColor} mb-5`} />
                  <h5 className="text-base font-black mb-2 tracking-tight">{t(`landing.security.${key}Title`)}</h5>
                  <p className="text-sm leading-relaxed opacity-70 font-medium">{t(`landing.security.${key}Desc`)}</p>
                </motion.div>
              ))}
            </div>
            <div>
              <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">{t('landing.security.label')}</p>
              <h3 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">{t('landing.security.title')}</h3>
              <p className="text-lg text-gray-500 mb-8 font-medium leading-relaxed">{t('landing.security.description')}</p>
              <ul className="space-y-5">
                {(['p1', 'p2', 'p3', 'p4'] as const).map((k) => (
                  <li key={k} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-semibold text-sm">{t(`landing.security.${k}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 bg-gray-50/50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-3">{t('landing.pricing.label')}</p>
          <h2 className="text-4xl font-black text-gray-900 mb-5 tracking-tight">{t('landing.pricing.title')}</h2>
          <p className="text-lg text-gray-500 mb-12 font-medium">{t('landing.pricing.description')}</p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Free', price: '$0', period: t('landing.pricing.forever'),
                features: ['freeF1','freeF2','freeF3','freeF4'],
                ctaKey: 'ctaFree', highlight: false, badge: null,
              },
              {
                name: 'Pro', price: '$7.99', period: t('landing.pricing.perMonth'),
                features: ['proF1','proF2','proF3','proF4','proF5','proF6'],
                ctaKey: 'ctaPro', highlight: true, badge: t('landing.pricing.popular'),
              },
              {
                name: 'Business', price: '$19.99', period: t('landing.pricing.perMonth'),
                features: ['bizF1','bizF2','bizF3','bizF4'],
                ctaKey: 'ctaBiz', highlight: false, badge: t('landing.pricing.bestValue'),
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -4 }}
                className={`rounded-3xl p-7 text-left relative ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-[#0061D5] to-[#1a4fa3] text-white shadow-2xl shadow-blue-200'
                    : 'bg-white border border-gray-100 shadow-sm'
                }`}
              >
                {plan.badge && (
                  <span className={`absolute top-5 right-5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    plan.highlight ? 'bg-white/20 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <div className="mb-5">
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-black tracking-tighter ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-xs font-bold mb-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((fk) => (
                    <li key={fk} className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-blue-500'}`} />
                      <span className={`text-xs font-medium ${plan.highlight ? 'text-blue-100' : 'text-gray-600'}`}>{t(`landing.pricing.${fk}`)}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setLocation('/login?mode=register')}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-white text-[#0061D5] hover:bg-blue-50'
                      : plan.name === 'Business'
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-[#0061D5] text-white hover:bg-blue-700'
                  }`}
                >
                  {t(`landing.pricing.${plan.ctaKey}`)}
                </button>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-sm text-gray-400 font-medium">
            {t('landing.pricing.viewMore')}{' '}
            <Link href="/pricing" className="text-blue-600 font-bold hover:underline">{t('landing.pricing.viewAllPlans')}</Link>
          </p>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2.5rem] p-14 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700" />
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          <div className="relative z-10">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              {t('landing.cta.title')}
            </motion.h2>
            <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto font-medium leading-relaxed">{t('landing.cta.description')}</p>
            <button onClick={() => setLocation('/login?mode=register')} className="bg-white text-blue-600 font-black px-10 py-5 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1 text-lg">
              {t('landing.cta.button')}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-16 px-6 lg:px-16 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-16">
            <div className="md:col-span-2">
              <img src={logoUrl} alt="TERA" className="h-[7rem] w-auto mb-6" />
              <p className="text-gray-400 font-medium max-w-xs leading-relaxed text-sm">{t('landing.footer.description')}</p>
              <div className="flex items-center gap-4 mt-8">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">{t('landing.footer.platform')}</h4>
              <ul className="space-y-3">
                {[
                  ['#funcionalidades', t('landing.nav.features')],
                  ['/pricing',         t('landing.nav.pricing')],
                  ['#seguridad',       t('landing.nav.security')],
                  ['#como-funciona',   t('landing.nav.howItWorks')],
                ].map(([href, label]) => (
                  <li key={label}><a href={href} className="text-gray-400 hover:text-blue-600 font-semibold text-sm transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">{t('landing.footer.legal')}</h4>
              <ul className="space-y-3">
                {[
                  ['#', t('landing.footer.privacy')],
                  ['#', t('landing.footer.terms')],
                  ['#', t('landing.footer.cookies')],
                ].map(([href, label]) => (
                  <li key={label}><a href={href} className="text-gray-400 hover:text-blue-600 font-semibold text-sm transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 font-medium">{t('landing.footer.rights')}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-400">{t('landing.footer.operational')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
