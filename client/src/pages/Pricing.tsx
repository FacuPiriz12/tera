import React, { useState } from 'react';
import { Check, X, ArrowRight, Star, Zap, Shield, Zap as ZapIcon, Users, HardDrive, RefreshCw, Clock, FileText, Sparkles, Crown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import logoUrl from '../assets/logo.png';
import Footer from '../components/Footer';

const PricingPage = () => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState({ code: 'ES', name: 'Español', flag: '🇪🇸' });

  const languages = [
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'PT', name: 'Português', flag: '🇵🇹' }
  ];

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: "Free",
      price: { monthly: "0", annual: "0" },
      tagline: 'Para uso personal',
      description: "Ideal para empezar a organizar tus archivos personales.",
      features: [
        { icon: Users, text: '1 usuario', included: true },
        { icon: HardDrive, text: '15 GB de Almacenamiento', included: true },
        { icon: RefreshCw, text: '5 GB / mes Transferencia Cloud', included: true },
        { icon: FileText, text: 'Carga de Archivo Hasta 2 GB', included: true },
        { icon: Sparkles, text: 'Detección Duplicados Básica', included: true },
        { icon: Clock, text: 'Sincronización Manual', included: true },
        { icon: FileText, text: '1 versión de historial', included: true },
        { icon: Shield, text: 'Protege archivos con contraseña', included: false },
        { icon: Zap, text: 'IA para organizar archivos', included: false }
      ],
      cta: "Empezar gratis",
      popular: false,
      color: "gray"
    },
    {
      name: "Pro",
      price: { monthly: "12.00", annual: "120" },
      tagline: 'Para profesionales',
      highlight: 'La mejor oferta',
      description: "Para usuarios avanzados que necesitan automatización real.",
      features: [
        { icon: Users, text: '1 usuario', included: true },
        { icon: HardDrive, text: '2 TB de Almacenamiento', included: true },
        { icon: RefreshCw, text: '500 GB / mes Transferencia Cloud', included: true },
        { icon: FileText, text: 'Carga de Archivo 100 GB', included: true },
        { icon: Sparkles, text: 'Detección Avanzada (Contenido)', included: true },
        { icon: Clock, text: 'Automática / Programada', included: true },
        { icon: FileText, text: '30 días de historial', included: true },
        { icon: Shield, text: 'Protege archivos con contraseña', included: true },
        { icon: Zap, text: 'IA para organizar y etiquetar archivos', included: true },
        { icon: Crown, text: 'Asistente IA con prioridad', included: true }
      ],
      cta: "Prueba Pro gratis",
      popular: true,
      color: "blue"
    },
    {
      name: "Business",
      price: { monthly: "25.00", annual: "250" },
      tagline: 'Para equipos',
      description: "Soluciones a medida para equipos y grandes organizaciones.",
      features: [
        { icon: Users, text: 'Hasta 10 usuarios', included: true },
        { icon: HardDrive, text: 'Almacenamiento Ilimitado', included: true },
        { icon: RefreshCw, text: 'Transferencia Cloud Ilimitada', included: true },
        { icon: FileText, text: 'Carga de Archivo Sin Límite', included: true },
        { icon: Sparkles, text: 'Avanzada + Auto-Limpieza', included: true },
        { icon: Clock, text: 'Espejo (Mirror) en Tiempo Real', included: true },
        { icon: FileText, text: '180 días / Ilimitado', included: true },
        { icon: Shield, text: 'Protege archivos con contraseña', included: true },
        { icon: Zap, text: 'IA avanzada para organización de equipo', included: true },
        { icon: Crown, text: 'Asistente IA de uso compartido sin límites', included: true },
        { icon: Users, text: 'Administración avanzada de equipos', included: true },
        { icon: Shield, text: 'Políticas de seguridad empresarial', included: true }
      ],
      cta: "Cómpralo",
      popular: false,
      color: "purple"
    }
  ];

  const comparisonFeatures = [
    { 
      category: 'Almacenamiento y Transferencia',
      features: [
        { name: 'Almacenamiento', free: '15 GB', pro: '2 TB', business: 'Ilimitado' },
        { name: 'Transferencia Cloud', free: '5 GB / mes', pro: '500 GB / mes', business: 'Ilimitada' },
        { name: 'Carga de Archivo', free: 'Hasta 2 GB', pro: '100 GB', business: 'Sin Límite' }
      ]
    },
    {
      category: 'Funcionalidades IA',
      features: [
        { name: 'Detección Duplicados', free: 'Básica', pro: 'Avanzada (Contenido)', business: 'Avanzada + Auto-Limpieza' },
        { name: 'Sincronización', free: 'Manual', pro: 'Automática / Programada', business: 'Espejo (Mirror) en Tiempo Real' },
        { name: 'Versiones', free: '1 versión', pro: '30 días de historial', business: '180 días / ilimitado' },
        { name: 'Organización IA', free: 'No', pro: 'Sí', business: 'Avanzada para equipos' }
      ]
    },
    {
      category: 'Colaboración y Seguridad',
      features: [
        { name: 'Usuarios', free: '1 usuario', pro: '1 usuario', business: 'Hasta 10 usuarios' },
        { name: 'Protección con contraseña', free: 'No', pro: 'Sí', business: 'Sí + Políticas' },
        { name: 'SSO (Inicio único)', free: 'No', pro: 'No', business: 'Sí' },
        { name: 'Cumplimiento empresarial', free: 'No', pro: 'No', business: 'Sí' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
              <img src={logoUrl} alt="TERA Logo" className="h-[8.4rem] w-auto group-hover:scale-105 transition-transform duration-300" />
            </Link>

            <div className="hidden md:flex items-center space-x-10">
              {/* Language Selector */}
              <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-xl">{currentLang.flag}</span>
                  <span className="text-sm font-bold text-gray-700">{currentLang.code}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isLangOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsLangOpen(false)}
                      ></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 overflow-hidden"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setCurrentLang(lang);
                              setIsLangOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                              currentLang.code === lang.code 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="text-sm font-bold">{lang.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center space-x-8">
                <Link href="/#productos" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">Productos</Link>
                <Link href="/pricing" className="text-sm font-bold text-blue-600 transition-colors">Precios</Link>
                <Link href="/#seguridad" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">Seguridad</Link>
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-6">
                <button className="text-sm text-gray-900 font-bold hover:text-blue-600 transition-colors tracking-tight">
                  Iniciar sesión
                </button>
                <button className="bg-blue-600 text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 tracking-tight">
                  Comenzar
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black mb-6 tracking-widest uppercase"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>PLANES Y PRECIOS</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl text-gray-900 mb-6 tracking-tight leading-tight font-bold"
            >
              Elige el plan <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">perfecto para ti</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto font-bold mb-10 leading-relaxed"
            >
              Desde uso personal hasta equipos empresariales. Todos los planes incluyen 14 días de prueba gratuita.
            </motion.p>

            <div className="inline-flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 shadow-inner">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-full text-sm font-black transition-all duration-300 uppercase tracking-tight ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Facturación mensual
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-8 py-3 rounded-full text-sm font-black transition-all duration-300 uppercase tracking-tight flex items-center ${
                  billingCycle === 'annual'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Facturación anual
                <span className="ml-2 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black">
                  Ahorra 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 items-stretch mb-32">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
                className={`relative rounded-[3rem] transition-all duration-500 p-10 flex flex-col h-full group ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_30px_60px_rgba(59,130,246,0.3)] scale-105 lg:scale-110 z-10 border-none'
                    : 'bg-white border-2 border-gray-100 hover:border-blue-100 hover:shadow-2xl'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-black px-5 py-2 rounded-full shadow-lg uppercase tracking-widest z-20">
                    {plan.highlight}
                  </div>
                )}

                <div className="mb-8">
                  <p className={`text-xs font-black mb-3 uppercase tracking-[0.2em] ${plan.popular ? 'text-blue-100' : 'text-blue-600'}`}>
                    {plan.tagline}
                  </p>
                  <h3 className={`text-4xl font-black mb-3 tracking-tight ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm font-bold leading-relaxed ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[1.5rem] font-black mr-1">$</span>
                    <span className={`text-6xl font-black tracking-tighter ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price[billingCycle]}
                    </span>
                    <span className={`text-sm font-black uppercase tracking-widest ${plan.popular ? 'text-blue-100' : 'text-gray-400'}`}>
                      /mes
                    </span>
                  </div>
                  {billingCycle === 'annual' && plan.price.annual !== "0" && (
                    <div className={`mt-3 inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight ${
                      plan.popular ? 'bg-white/10 text-white' : 'bg-green-50 text-green-600'
                    }`}>
                      Facturado como ${plan.price.annual} al año
                    </div>
                  )}
                </div>

                <div className="mb-10 order-last lg:order-none">
                  <button className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.1em] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center group ${
                    plan.popular
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="space-y-5 flex-grow mb-10">
                  <div className={`h-px w-full mb-6 ${plan.popular ? 'bg-white/10' : 'bg-gray-100'}`}></div>
                  {plan.features.map((feature, featureIdx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={featureIdx} className="flex items-center space-x-3 group/feat">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          feature.included
                            ? plan.popular ? 'bg-white/20 text-white shadow-lg shadow-blue-900/20' : 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'bg-gray-50 text-gray-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-bold leading-tight ${
                          feature.included
                            ? plan.popular ? 'text-white' : 'text-gray-700'
                            : 'text-gray-400 line-through decoration-2'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">COMPARACIÓN DETALLADA</span>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mt-4 mb-6 tracking-tight leading-tight">
                Compara todos los planes
              </h2>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-2 border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-10 py-10 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b-2 border-gray-100">Beneficio</th>
                      <th className="px-10 py-10 text-center text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-gray-100">TERA FREE</th>
                      <th className="px-10 py-10 text-center text-sm font-black text-blue-700 bg-blue-50/50 uppercase tracking-widest border-b-2 border-blue-100">TERA PRO</th>
                      <th className="px-10 py-10 text-center text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-gray-100">TERA BUSINESS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-50">
                    <tr className="group">
                      <td className="px-10 py-8 font-black text-gray-900 text-lg uppercase tracking-tight">Precio Mensual</td>
                      <td className="px-10 py-8 text-center font-bold text-gray-700 text-lg">$0</td>
                      <td className="px-10 py-8 text-center font-black text-blue-700 bg-blue-50/30 text-2xl">$12.00</td>
                      <td className="px-10 py-8 text-center font-bold text-gray-700 text-lg">$25.00</td>
                    </tr>
                    {comparisonFeatures.map((category, catIdx) => (
                      <React.Fragment key={catIdx}>
                        <tr className="bg-blue-50/20">
                          <td colSpan={4} className="px-10 py-6 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">
                            {category.category}
                          </td>
                        </tr>
                        {category.features.map((feature, featIdx) => (
                          <tr key={featIdx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-10 py-7 text-gray-900 font-black tracking-tight">{feature.name}</td>
                            <td className="px-10 py-7 text-center text-gray-600 font-bold">{feature.free}</td>
                            <td className="px-10 py-7 text-center text-blue-800 bg-blue-50/30 font-black">{feature.pro}</td>
                            <td className="px-10 py-7 text-center text-gray-600 font-bold">{feature.business}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-32">
            <div className="text-center mb-16">
              <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">PREGUNTAS FRECUENTES</span>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mt-4 mb-6 tracking-tight">¿Tienes preguntas?</h2>
            </div>
            <div className="grid gap-6">
              {[
                { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Por supuesto. Al subir de plan, el cambio es instantáneo. Al bajarlo, se aplicará al finalizar tu ciclo de facturación actual. Sin permanencia.' },
                { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos todas las tarjetas de crédito/débito principales, PayPal y Apple/Google Pay. Para planes Business superiores, permitimos transferencia bancaria.' },
                { q: '¿Hay cargos por cancelación?', a: 'Absolutamente ninguno. Puedes cancelar con un solo clic desde tu panel de control y seguirás teniendo acceso hasta que termine tu periodo pagado.' }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-10 hover:border-blue-200 transition-all duration-300 shadow-sm group hover:shadow-xl">
                  <h3 className="text-2xl font-black text-gray-900 mb-5 tracking-tight group-hover:text-blue-600 transition-colors">{faq.q}</h3>
                  <p className="text-gray-600 font-bold leading-relaxed text-lg">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 rounded-[4rem] -rotate-1 scale-105 opacity-10 blur-3xl"></div>
            <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-gray-100 rounded-[4rem] p-12 lg:p-24 text-center relative z-10 shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full -ml-32 -mb-32 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

              <h2 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-[1.1]">
                ¿Listo para simplificar <br className="hidden md:block" />
                <span className="text-blue-600">tu flujo de trabajo?</span>
              </h2>
              <p className="text-xl text-gray-600 mb-12 font-bold max-w-2xl mx-auto leading-relaxed">
                Únete a más de 500,000 usuarios que ya han tomado el control de sus nubes con TERA. 
                <span className="block mt-2 text-blue-600/60">Pruébalo 14 días gratis, sin tarjetas.</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="bg-blue-600 text-white font-black px-12 py-6 rounded-2xl hover:bg-blue-700 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:shadow-[0_25px_50px_rgba(59,130,246,0.4)] hover:-translate-y-2 text-xl inline-flex items-center group w-full sm:w-auto uppercase tracking-widest">
                  Comenzar ahora gratis
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
                <button className="bg-white text-gray-900 border-2 border-gray-100 font-black px-12 py-6 rounded-2xl hover:bg-gray-50 transition-all hover:-translate-y-1 text-xl w-full sm:w-auto uppercase tracking-widest">
                  Ver demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;