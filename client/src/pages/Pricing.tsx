import React, { useState, useEffect, useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
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
    tagline: 'pricingPage.plans.free.tagline',
    prices: {
      USD: { monthly: 0, annual: 0, annualTotal: null as number | null },
      BRL: { monthly: 0, annual: 0, annualTotal: null as number | null },
      EUR: { monthly: 0, annual: 0, annualTotal: null as number | null },
    },
    priceId: { monthly: '0', annual: '0' },
    cta: 'pricingPage.plans.free.cta',
    highlight: false,
    badge: null as string | null,
    features: [
      { label: 'pricingPage.plans.free.f1', highlight: true },
      { label: 'pricingPage.plans.free.f2' },
      { label: 'pricingPage.plans.free.f3' },
      { label: 'pricingPage.plans.free.f4' },
      { label: 'pricingPage.plans.free.f5' },
      { label: 'pricingPage.plans.free.f6' },
      { label: 'pricingPage.plans.free.f7', disabled: true },
      { label: 'pricingPage.plans.free.f8', disabled: true },
      { label: 'pricingPage.plans.free.f9', disabled: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'pricingPage.plans.pro.tagline',
    prices: {
      USD: { monthly: 7.99,  annual: 5.42,  annualTotal: 65  as number | null },
      BRL: { monthly: 39.90, annual: 29.92, annualTotal: 359 as number | null },
      EUR: { monthly: 7.99,  annual: 4.92,  annualTotal: 59  as number | null },
    },
    priceId: { monthly: 'price_1Tk1ozGMtCDZ5sKadebYpBII', annual: 'price_1Tk1uAGMtCDZ5sKaHHyc8KGc' },
    cta: 'pricingPage.plans.pro.cta',
    highlight: true,
    badge: 'pricingPage.plans.pro.badge' as string | null,
    features: [
      { label: 'pricingPage.plans.pro.f1', highlight: true },
      { label: 'pricingPage.plans.pro.f2' },
      { label: 'pricingPage.plans.pro.f3' },
      { label: 'pricingPage.plans.pro.f4' },
      { label: 'pricingPage.plans.pro.f5' },
      { label: 'pricingPage.plans.pro.f6' },
      { label: 'pricingPage.plans.pro.f7' },
      { label: 'pricingPage.plans.pro.f8' },
      { label: 'pricingPage.plans.pro.f9' },
      { label: 'pricingPage.plans.pro.f10' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'pricingPage.plans.business.tagline',
    prices: {
      USD: { monthly: 19.99, annual: 13.25, annualTotal: 159 as number | null },
      BRL: { monthly: 99.90, annual: 74.92, annualTotal: 899 as number | null },
      EUR: { monthly: 17.99, annual: 11.58, annualTotal: 139 as number | null },
    },
    priceId: { monthly: 'price_1Tk1viGMtCDZ5sKaWGPYSJfA', annual: 'price_1Tk1xwGMtCDZ5sKaBukVmyZb' },
    cta: 'pricingPage.plans.business.cta',
    highlight: false,
    badge: 'pricingPage.plans.business.badge' as string | null,
    features: [
      { label: 'pricingPage.plans.business.f1', highlight: true },
      { label: 'pricingPage.plans.business.f2' },
      { label: 'pricingPage.plans.business.f3' },
      { label: 'pricingPage.plans.business.f4' },
      { label: 'pricingPage.plans.business.f5' },
      { label: 'pricingPage.plans.business.f6' },
      { label: 'pricingPage.plans.business.f7' },
      { label: 'pricingPage.plans.business.f8' },
      { label: 'pricingPage.plans.business.f9' },
      { label: 'pricingPage.plans.business.f10' },
    ],
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
  const { i18n, t } = useTranslation();
  usePageTitle(t('pageTitles.pricing', 'TERA — Pricing'));
  const [currency, setCurrency] = useState<Currency>('USD');
  useEffect(() => { setCurrency(langToCurrency(i18n.language)); }, [i18n.language]);
  const sym = CURRENCY_CONFIG[currency].symbol;

  const COMPARISON = useMemo(() => [
    { category: t('pricingPage.comparison.cat1'), icon: RefreshCw, rows: [
      { feature: t('pricingPage.comparison.r1f1'), free: '5 GB', pro: '200 GB', business: '2 TB' },
      { feature: t('pricingPage.comparison.r1f2'), free: '20', pro: '300', business: t('pricingPage.comparison.unlimited') },
      { feature: t('pricingPage.comparison.r1f3'), free: '100 MB', pro: '5 GB', business: '50 GB' },
      { feature: t('pricingPage.comparison.r1f4'), free: true, pro: true, business: true },
    ]},
    { category: t('pricingPage.comparison.cat2'), icon: Zap, rows: [
      { feature: t('pricingPage.comparison.r2f1'), free: '2', pro: '5', business: t('pricingPage.comparison.unlimitedM') },
      { feature: 'Google Drive', free: true, pro: true, business: true },
      { feature: 'Dropbox', free: true, pro: true, business: true },
      { feature: 'Microsoft OneDrive', free: false, pro: true, business: true },
      { feature: 'Box', free: false, pro: true, business: true },
      { feature: 'Amazon S3', free: false, pro: true, business: true },
    ]},
    { category: t('pricingPage.comparison.cat3'), icon: Clock, rows: [
      { feature: t('pricingPage.comparison.r3f1'), free: false, pro: t('pricingPage.comparison.tasks5'), business: t('pricingPage.comparison.unlimited') },
      { feature: t('pricingPage.comparison.r3f2'), free: t('pricingPage.comparison.days7'), pro: t('pricingPage.comparison.days90'), business: t('pricingPage.comparison.complete') },
      { feature: t('pricingPage.comparison.r3f3'), free: false, pro: false, business: true },
      { feature: t('pricingPage.comparison.r3f4'), free: false, pro: t('pricingPage.comparison.basic'), business: t('pricingPage.comparison.advanced') },
    ]},
    { category: t('pricingPage.comparison.cat4'), icon: Shield, rows: [
      { feature: t('pricingPage.comparison.r4f1'), free: false, pro: true, business: true },
      { feature: t('pricingPage.comparison.r4f2'), free: t('pricingPage.comparison.docs'), pro: t('pricingPage.comparison.email24h'), business: t('pricingPage.comparison.priority4h') },
      { feature: t('pricingPage.comparison.r4f3'), free: '—', pro: t('pricingPage.comparison.days7').replace('7', '14'), business: t('pricingPage.comparison.days7').replace('7', '14') },
    ]},
  ], [t]);

  const FAQS = useMemo(() => [
    { q: t('pricingPage.faq.q1'), a: t('pricingPage.faq.a1') },
    { q: t('pricingPage.faq.q2'), a: t('pricingPage.faq.a2') },
    { q: t('pricingPage.faq.q3'), a: t('pricingPage.faq.a3') },
    { q: t('pricingPage.faq.q4'), a: t('pricingPage.faq.a4') },
    { q: t('pricingPage.faq.q5'), a: t('pricingPage.faq.a5') },
  ], [t]);

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
        body: JSON.stringify({ priceId, currency: currency.toLowerCase() }),
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
                <Link href="/#productos" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">{t('pricingPage.nav.products')}</Link>
                <Link href="/pricing" className="text-sm font-bold text-blue-600">{t('pricingPage.nav.pricing')}</Link>
                <Link href="/#seguridad" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">{t('pricingPage.nav.security')}</Link>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-6">
                {!authLoading && (user ? (
                  <Link href="/dashboard" className="bg-[#0061D5] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-200 hover:-translate-y-0.5">
                    {t('pricingPage.nav.goToApp')}
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">{t('pricingPage.nav.signIn')}</Link>
                    <Link href="/login?mode=register" className="bg-[#0061D5] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-200 hover:-translate-y-0.5">
                      {t('pricingPage.nav.startFree')}
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
            {t('pricingPage.hero.badge')}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-5">
            {t('pricingPage.hero.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-lg text-gray-500 font-medium max-w-xl mx-auto mb-10">
            {t('pricingPage.hero.subtitle')}
          </motion.p>

          {/* Toggle */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-7 py-2.5 rounded-full text-sm font-black transition-all duration-300 ${billing === 'monthly' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {t('pricingPage.toggle.monthly')}
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-7 py-2.5 rounded-full text-sm font-black transition-all duration-300 flex items-center gap-2 ${billing === 'annual' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {t('pricingPage.toggle.annual')}
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
                      {plan.badge ? t(plan.badge) : null}
                    </div>
                  )}

                  <div className="p-8 pb-6 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="mb-8">
                      <p className={`text-[11px] font-black uppercase tracking-[0.18em] mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                        {t(plan.tagline)}
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
                        <span className={`text-sm font-bold mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{t('pricingPage.perMonth')}</span>
                      </div>
                      {billing === 'annual' && annualTotal && (
                        <p className={`mt-2 text-xs font-semibold ${plan.highlight ? 'text-blue-200' : 'text-emerald-600'}`}>
                          {t('pricingPage.billedAnnual', { sym, total: annualTotal, savings: (planPrices.monthly * 12 - annualTotal).toFixed(0) })}
                        </p>
                      )}
                      {price === 0 && (
                        <p className={`mt-2 text-xs font-semibold ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                          {t('pricingPage.freeForever')}
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
                      {t(plan.cta)}
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
                              {t(f.label)}
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
              <p className="text-sm font-black text-gray-900 mb-1">{t('pricingPage.traffic.title')}</p>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{t('pricingPage.traffic.text')}</p>
            </div>
          </div>
        </section>

        {/* ── Trust strip ── */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: t('pricingPage.trust.encrypted'), sub: t('pricingPage.trust.encryptedSub') },
              { icon: RefreshCw, label: t('pricingPage.trust.cancel'), sub: t('pricingPage.trust.cancelSub') },
              { icon: BarChart2, label: t('pricingPage.trust.refund'), sub: t('pricingPage.trust.refundSub') },
              { icon: Bell, label: t('pricingPage.trust.noCard'), sub: t('pricingPage.trust.noCardSub') },
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
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">{t('pricingPage.comparison.label')}</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{t('pricingPage.comparison.title')}</h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-2/5">{t('pricingPage.comparison.feature')}</th>
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
                    <td className="px-8 py-6 text-sm font-black text-gray-900">{t('pricingPage.comparison.monthlyPrice')}</td>
                    <td className="px-6 py-6 text-center font-black text-gray-700">{sym}0</td>
                    <td className="px-6 py-6 text-center font-black text-[#0061D5] bg-blue-50/20 text-lg">{sym}{PLANS[1].prices[currency].monthly}</td>
                    <td className="px-6 py-6 text-center font-black text-gray-700">{sym}{PLANS[2].prices[currency].monthly}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-6 mb-24">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">{t('pricingPage.faq.label')}</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{t('pricingPage.faq.title')}</h2>
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
                {t('pricingPage.cta.title')}
              </h2>
              <p className="text-blue-100 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
                {t('pricingPage.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login?mode=register" className="bg-white text-[#0061D5] font-black px-10 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg hover:-translate-y-0.5 text-sm uppercase tracking-wide inline-flex items-center gap-2 group">
                  {t('pricingPage.cta.startFree')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/#planes" className="bg-white/10 text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/20 transition-all text-sm">
                  {t('pricingPage.cta.compare')}
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
