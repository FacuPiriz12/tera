import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Star, Zap, Shield, RefreshCw, Clock, BarChart2, Bell, Loader2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import logoUrl from '../assets/logo.png';
import Footer from '../components/Footer';
import LanguageSelector from '../components/LanguageSelector';
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';

type Currency = 'USD' | 'BRL' | 'EUR';

const EUROZONE = new Set(['AT','BE','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES']);

function langToCurrency(lang: string): Currency {
  const [language, region] = lang.split('-');
  if (language === 'pt' && region?.toUpperCase() === 'BR') return 'BRL';
  if (language === 'pt') return 'BRL';
  if (region && EUROZONE.has(region.toUpperCase())) return 'EUR';
  // fallback: use navigator locale
  const navRegion = (navigator.language || '').split('-')[1]?.toUpperCase();
  if (navRegion === 'BR') return 'BRL';
  if (navRegion && EUROZONE.has(navRegion)) return 'EUR';
  return 'USD';
}

const CURRENCY_CONFIG: Record<Currency, { symbol: string }> = {
  USD: { symbol: '$' },
  BRL: { symbol: 'R$' },
  EUR: { symbol: '€' },
};
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para empezar sin costo',
    prices: {
      USD: { monthly: 0, annual: 0, annualTotal: null as number | null },
      BRL: { monthly: 0, annual: 0, annualTotal: null as number | null },
      EUR: { monthly: 0, annual: 0, annualTotal: null as number | null },
    },
    priceId: { monthly: '0', annual: '0' },
    cta: 'Empezar gratis',
    highlight: false,
    badge: null as string | null,
    features: [
      { label: '5 GB tráfico cross-cloud/mes', highlight: true },
      { label: '20 transferencias/mes' },
      { label: '100 MB máximo por archivo' },
      { label: '2 servicios conectados' },
      { label: 'Google Drive + Dropbox' },
      { label: '7 días de historial' },
      { label: 'Tareas programadas', disabled: true },
      { label: 'Analytics', disabled: true },
      { label: 'Notificaciones por email', disabled: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para uso regular y profesional',
    prices: {
      USD: { monthly: 7.99,  annual: 5.42,  annualTotal: 65  as number | null },
      BRL: { monthly: 39.90, annual: 29.92, annualTotal: 359 as number | null },
      EUR: { monthly: 7.99,  annual: 4.92,  annualTotal: 59  as number | null },
    },
    priceId: { monthly: 'price_1Tk1ozGMtCDZ5sKadebYpBII', annual: 'price_1Tk1uAGMtCDZ5sKaHHyc8KGc' },
    cta: 'Comenzar Pro',
    highlight: true,
    badge: 'Más popular',
    features: [
      { label: '200 GB tráfico cross-cloud/mes', highlight: true },
      { label: '300 transferencias/mes' },
      { label: '5 GB máximo por archivo' },
      { label: '5 servicios conectados' },
      { label: 'Todos los proveedores (OneDrive, Box, S3…)' },
      { label: '90 días de historial' },
      { label: '5 tareas programadas' },
      { label: 'Analytics básico' },
      { label: 'Notificaciones por email' },
      { label: 'Soporte prioritario 24h' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Para uso intensivo',
    prices: {
      USD: { monthly: 19.99, annual: 13.25, annualTotal: 159 as number | null },
      BRL: { monthly: 99.90, annual: 74.92, annualTotal: 899 as number | null },
      EUR: { monthly: 17.99, annual: 11.58, annualTotal: 139 as number | null },
    },
    priceId: { monthly: 'price_1Tk1viGMtCDZ5sKaWGPYSJfA', annual: 'price_1Tk1xwGMtCDZ5sKaBukVmyZb' },
    cta: 'Comenzar Business',
    highlight: false,
    badge: 'Mayor valor',
    features: [
      { label: '2 TB tráfico cross-cloud/mes', highlight: true },
      { label: 'Transferencias ilimitadas' },
      { label: '50 GB máximo por archivo' },
      { label: 'Servicios ilimitados' },
      { label: 'Todos los proveedores' },
      { label: 'Historial completo' },
      { label: 'Tareas programadas ilimitadas' },
      { label: 'Analytics avanzado + versioning' },
      { label: 'Notificaciones por email' },
      { label: 'Soporte prioritario 4h' },
    ],
  },
];

const COMPARISON = [
  {
    category: 'Tráfico y Transferencias',
    icon: RefreshCw,
    rows: [
      { feature: 'Tráfico cross-cloud/mes', free: '5 GB', pro: '200 GB', business: '2 TB' },
      { feature: 'Transferencias/mes', free: '20', pro: '300', business: 'Ilimitadas' },
      { feature: 'Máximo por archivo', free: '100 MB', pro: '5 GB', business: '50 GB' },
      { feature: 'Same-provider (Drive→Drive)', free: true, pro: true, business: true },
    ],
  },
  {
    category: 'Integraciones',
    icon: Zap,
    rows: [
      { feature: 'Servicios conectados', free: '2', pro: '5', business: 'Ilimitados' },
      { feature: 'Google Drive', free: true, pro: true, business: true },
      { feature: 'Dropbox', free: true, pro: true, business: true },
      { feature: 'Microsoft OneDrive', free: false, pro: true, business: true },
      { feature: 'Box', free: false, pro: true, business: true },
      { feature: 'Amazon S3', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'Automatización',
    icon: Clock,
    rows: [
      { feature: 'Tareas programadas', free: false, pro: '5 tareas', business: 'Ilimitadas' },
      { feature: 'Historial de operaciones', free: '7 días', pro: '90 días', business: 'Completo' },
      { feature: 'Versioning de archivos', free: false, pro: false, business: true },
      { feature: 'Analytics', free: false, pro: 'Básico', business: 'Avanzado' },
    ],
  },
  {
    category: 'Soporte',
    icon: Shield,
    rows: [
      { feature: 'Notificaciones email', free: false, pro: true, business: true },
      { feature: 'Canal de soporte', free: 'Documentación', pro: 'Email (24h)', business: 'Prioritario (4h)' },
      { feature: 'Garantía de devolución', free: '—', pro: '14 días', business: '14 días' },
    ],
  },
];

const FAQS = [
  {
    q: '¿Qué es el tráfico cross-cloud?',
    a: 'Es la cantidad de datos que se transfieren entre servicios de nube distintos (por ejemplo, de Google Drive a Dropbox). Cuando movés archivos dentro del mismo proveedor (Drive→Drive), no consume tráfico y es siempre ilimitado.',
  },
  {
    q: '¿Puedo cambiar de plan cuando quiera?',
    a: 'Sí. Al subir de plan el cambio es inmediato. Al bajarlo, se aplica al terminar el ciclo de facturación actual. Sin penalizaciones ni permanencia.',
  },
  {
    q: '¿Qué pasa si supero el tráfico del mes?',
    a: 'Las transferencias cross-cloud se pausan hasta el próximo ciclo. Las transferencias same-provider (mismo servicio) nunca se ven afectadas. Podés subir de plan en cualquier momento para continuar.',
  },
  {
    q: '¿Hay prueba gratuita para Pro o Business?',
    a: 'El plan Free es permanente y no requiere tarjeta de crédito. Para Pro y Business ofrecemos garantía de devolución de 14 días: si no quedás conforme, te devolvemos el dinero sin preguntas.',
  },
  {
    q: '¿Cómo se factura el plan anual?',
    a: 'Se cobra en un solo pago al inicio del año. Pro anual: $65/año (ahorrás $30 vs mensual). Business anual: $159/año (ahorrás $81 vs mensual).',
  },
];

function CellValue({ val }: { val: boolean | string }) {
  if (val === true) return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (val === false) return <X className="w-4 h-4 text-gray-300 mx-auto" />;
  return <span className="text-sm font-semibold text-gray-700">{val}</span>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { i18n } = useTranslation();
  const [currency, setCurrency] = useState<Currency>('USD');
  useEffect(() => { setCurrency(langToCurrency(i18n.language)); }, [i18n.language]);

  const handleCheckout = async (priceId: string) => {
    if (priceId === '0') {
      window.location.href = '/';
      return;
    }
    try {
      setLoading(priceId);
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ priceId }),
      });
      if (res.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al crear la sesión de pago');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans">
      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center group cursor-pointer">
              <img src={logoUrl} alt="TERA" className="h-[8.4rem] w-auto group-hover:scale-105 transition-transform duration-300" />
            </Link>
            <div className="hidden md:flex items-center gap-10">
              <div className="flex items-center gap-8">
                <Link href="/#productos" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Productos</Link>
                <Link href="/pricing" className="text-sm font-bold text-blue-600">Precios</Link>
                <Link href="/#seguridad" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Seguridad</Link>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-6">
                {!authLoading && (user ? (
                  <Link href="/dashboard" className="bg-[#0061D5] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-200 hover:-translate-y-0.5">
                    Ir a la app
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">Iniciar sesión</Link>
                    <Link href="/login?mode=register" className="bg-[#0061D5] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-200 hover:-translate-y-0.5">
                      Comenzar gratis
                    </Link>
                  </>
                ))}
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        {/* ── Hero ── */}
        <section className="text-center px-6 mb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest mb-6">
            <Star className="w-3.5 h-3.5 fill-current" />
            Planes y Precios
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-5">
            Simple y transparente
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-lg text-gray-500 font-medium max-w-xl mx-auto mb-10">
            Empieza gratis. Pagá solo cuando realmente lo necesites.
          </motion.p>

          {/* Toggle */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-7 py-2.5 rounded-full text-sm font-black transition-all duration-300 ${billing === 'monthly' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-7 py-2.5 rounded-full text-sm font-black transition-all duration-300 flex items-center gap-2 ${billing === 'annual' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Anual
              <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">−34%</span>
            </button>
          </motion.div>
        </section>

        {/* ── Pricing Cards ── */}
        <section className="max-w-6xl mx-auto px-6 mb-12">
          <div className="grid lg:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((plan, idx) => {
              const planPrices = plan.prices[currency];
              const price = billing === 'annual' && planPrices.annual > 0 ? planPrices.annual : planPrices.monthly;
              const annualTotal = planPrices.annualTotal;
              const sym = CURRENCY_CONFIG[currency].symbol;
              const priceId = plan.priceId[billing];
              const isLoading = loading === priceId;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (idx + 1) }}
                  className={`relative flex flex-col rounded-3xl overflow-hidden ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-[#0061D5] to-[#1a4fa3] text-white shadow-[0_24px_60px_rgba(0,97,213,0.3)] lg:scale-105 z-10'
                      : plan.id === 'business'
                      ? 'bg-white border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300'
                      : 'bg-white border-2 border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300'
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute top-5 right-5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${
                      plan.highlight ? 'bg-white/20 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-8 pb-6 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="mb-8">
                      <p className={`text-[11px] font-black uppercase tracking-[0.18em] mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                        {plan.tagline}
                      </p>
                      <h2 className={`text-3xl font-black tracking-tight ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                        {plan.name}
                      </h2>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-end gap-1">
                        <span className={`text-2xl font-black mt-1 ${plan.highlight ? 'text-blue-100' : 'text-gray-400'}`}>{sym}</span>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={`${plan.id}-${billing}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className={`text-6xl font-black tracking-tighter leading-none ${plan.highlight ? 'text-white' : 'text-gray-900'}`}
                          >
                            {price === 0 ? '0' : price.toFixed(2)}
                          </motion.span>
                        </AnimatePresence>
                        <span className={`text-sm font-bold mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>/mes</span>
                      </div>
                      {billing === 'annual' && annualTotal && (
                        <p className={`mt-2 text-xs font-semibold ${plan.highlight ? 'text-blue-200' : 'text-emerald-600'}`}>
                          Facturado {sym}{annualTotal}/año · ahorrás {sym}{(planPrices.monthly * 12 - annualTotal).toFixed(0)}
                        </p>
                      )}
                      {price === 0 && (
                        <p className={`mt-2 text-xs font-semibold ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                          Gratis para siempre
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleCheckout(priceId)}
                      disabled={!!loading}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-8 ${
                        plan.highlight
                          ? 'bg-white text-[#0061D5] hover:bg-blue-50 shadow-lg'
                          : plan.id === 'business'
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-[#0061D5] text-white hover:bg-blue-700 shadow-md shadow-blue-100'
                      } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {plan.cta}
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    {/* Divider */}
                    <div className={`h-px mb-7 ${plan.highlight ? 'bg-white/15' : 'bg-gray-100'}`} />

                    {/* Features */}
                    <ul className="space-y-3.5 flex-1">
                      {plan.features.map((f, fi) => {
                        const disabled = (f as any).disabled;
                        const highlighted = (f as any).highlight;
                        return (
                          <li key={fi} className={`flex items-start gap-3 ${highlighted ? 'rounded-xl px-3 py-2 -mx-3 ' + (plan.highlight ? 'bg-white/10' : 'bg-blue-50/60') : ''}`}>
                            <span className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                              disabled
                                ? plan.highlight ? 'bg-white/10' : 'bg-gray-100'
                                : plan.highlight ? 'bg-white/25' : 'bg-blue-100'
                            }`}>
                              {disabled
                                ? <X className={`w-2.5 h-2.5 ${plan.highlight ? 'text-white/40' : 'text-gray-300'}`} />
                                : <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-white' : 'text-blue-600'}`} />
                              }
                            </span>
                            <span className={`text-sm font-semibold leading-tight ${
                              disabled
                                ? plan.highlight ? 'text-white/30 line-through' : 'text-gray-300 line-through'
                                : highlighted
                                ? plan.highlight ? 'text-white font-black' : 'text-blue-700 font-black'
                                : plan.highlight ? 'text-blue-50' : 'text-gray-700'
                            }`}>
                              {f.label}
                            </span>
                            {highlighted && <Zap className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-yellow-300' : 'text-blue-500'}`} />}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Traffic explainer ── */}
        <section className="max-w-3xl mx-auto px-6 mb-20">
          <div className="bg-white border border-blue-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 mb-1">¿Qué es el tráfico cross-cloud?</p>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Cuando transferís un archivo entre servicios <em>distintos</em> (ej: Google Drive → Dropbox), los datos pasan por nuestros servidores — eso consume tráfico.
                Si movés archivos dentro del <em>mismo</em> servicio (Drive→Drive), el tráfico es <strong className="text-gray-700">siempre ilimitado y gratis</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* ── Trust strip ── */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: 'Datos cifrados', sub: 'AES-256-GCM' },
              { icon: RefreshCw, label: 'Cancela cuando quieras', sub: 'Sin permanencia' },
              { icon: BarChart2, label: 'Garantía de devolución', sub: '14 días' },
              { icon: Bell, label: 'Sin tarjeta de crédito', sub: 'Para el plan Free' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-blue-600 w-[18px] h-[18px]" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 leading-tight">{label}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Comparison table ── */}
        <section className="max-w-6xl mx-auto px-6 mb-24">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">Comparación completa</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Todo detallado</h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-2/5">Característica</th>
                    <th className="px-6 py-6 text-center text-sm font-black text-gray-700 uppercase tracking-wider">Free</th>
                    <th className="px-6 py-6 text-center text-sm font-black text-[#0061D5] bg-blue-50/50 uppercase tracking-wider">Pro</th>
                    <th className="px-6 py-6 text-center text-sm font-black text-gray-700 uppercase tracking-wider">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((section) => (
                    <React.Fragment key={section.category}>
                      <tr className="bg-gray-50/60">
                        <td colSpan={4} className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <section.icon className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{section.category}</span>
                          </div>
                        </td>
                      </tr>
                      {section.rows.map((row) => (
                        <tr key={row.feature} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-4 text-sm font-semibold text-gray-800">{row.feature}</td>
                          <td className="px-6 py-4 text-center"><CellValue val={row.free} /></td>
                          <td className="px-6 py-4 text-center bg-blue-50/20"><CellValue val={row.pro} /></td>
                          <td className="px-6 py-4 text-center"><CellValue val={row.business} /></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="border-t-2 border-gray-100">
                    <td className="px-8 py-6 text-sm font-black text-gray-900">Precio mensual</td>
                    <td className="px-6 py-6 text-center font-black text-gray-700">$0</td>
                    <td className="px-6 py-6 text-center font-black text-[#0061D5] bg-blue-50/20 text-lg">$7.99</td>
                    <td className="px-6 py-6 text-center font-black text-gray-700">$19.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-6 mb-24">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">Preguntas frecuentes</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">¿Tenés dudas?</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-100 transition-colors shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left gap-4"
                >
                  <span className="text-sm font-black text-gray-900">{faq.q}</span>
                  {openFaq === idx
                    ? <ChevronUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  }
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <p className="px-7 pb-6 text-sm text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="relative bg-gradient-to-br from-[#0061D5] to-[#1a4fa3] rounded-[2.5rem] p-12 lg:p-20 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
                Conectá tus nubes hoy
              </h2>
              <p className="text-blue-100 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
                Empieza gratis, sin tarjeta. Tu primera transferencia en menos de 2 minutos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login?mode=register" className="bg-white text-[#0061D5] font-black px-10 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg hover:-translate-y-0.5 text-sm uppercase tracking-wide inline-flex items-center gap-2 group">
                  Empezar gratis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/#planes" className="bg-white/10 text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/20 transition-all text-sm">
                  Ver comparación
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
