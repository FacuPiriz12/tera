import React, { useState } from 'react';
import { Check, X, ArrowRight, Star, Zap, Shield, Zap as ZapIcon, Users, HardDrive, RefreshCw, Clock, FileText, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import logoUrl from '../assets/logo.png';

const PricingPage = () => {
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
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
              <img src={logoUrl} alt="TERA Logo" className="h-[8.4rem] w-auto group-hover:scale-105 transition-transform duration-300" />
            </Link>
            
            <div className="hidden md:flex items-center space-x-10">
              <div className="flex items-center space-x-8">
                <Link href="/#productos" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Productos</Link>
                <Link href="/pricing" className="text-sm font-semibold text-blue-600 transition-colors">Precios</Link>
                <Link href="/#seguridad" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Seguridad</Link>
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-6">
                <button className="text-sm text-gray-900 font-bold hover:text-blue-600 transition-colors">
                  Iniciar sesión
                </button>
                <button className="bg-blue-600 text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
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
              className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              <Star className="w-4 h-4 fill-current" />
              <span>PLANES Y PRECIOS</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight"
            >
              Elige el plan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">perfecto para ti</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto font-medium mb-10"
            >
              Desde uso personal hasta equipos empresariales. Todos los planes incluyen 14 días de prueba gratuita.
            </motion.p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Facturación mensual
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Facturación anual
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Ahorra 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 items-start mb-32">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
                className={`relative rounded-[2.5rem] transition-all duration-300 p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl scale-105 lg:scale-110 z-10'
                    : 'bg-white border-2 border-gray-100 hover:border-blue-100 hover:shadow-xl'
                } flex flex-col`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {plan.highlight}
                  </div>
                )}

                <div className="mb-8">
                  <p className={`text-sm font-bold mb-2 uppercase tracking-widest ${plan.popular ? 'text-blue-100' : 'text-blue-600'}`}>
                    {plan.tagline}
                  </p>
                  <h3 className={`text-3xl font-black mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm font-medium ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      ${plan.price[billingCycle]}
                    </span>
                    <span className={`ml-2 font-bold ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                      /mes
                    </span>
                  </div>
                  {billingCycle === 'annual' && plan.price.annual !== "0" && (
                    <p className={`text-sm mt-2 font-bold ${plan.popular ? 'text-blue-100' : 'text-green-600'}`}>
                      Facturado como ${plan.price.annual} al año
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-10">
                  <button className={`w-full py-4 rounded-2xl font-black text-lg transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center group ${
                    plan.popular
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="space-y-4 flex-grow">
                  {plan.features.map((feature, featureIdx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={featureIdx} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-5 h-5 mt-0.5 ${
                          feature.included
                            ? plan.popular ? 'text-white' : 'text-blue-600'
                            : 'text-gray-300'
                        }`}>
                          {feature.included ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </div>
                        <span className={`text-sm font-bold leading-relaxed ${
                          feature.included
                            ? plan.popular ? 'text-white' : 'text-gray-700'
                            : 'text-gray-400 line-through'
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
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">COMPARACIÓN DETALLADA</span>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mt-4 mb-6 tracking-tight">
                Compara todos los planes
              </h2>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-black text-gray-900 uppercase tracking-widest">Beneficio</th>
                      <th className="px-8 py-6 text-center text-sm font-black text-gray-900 uppercase tracking-widest">Tera Free</th>
                      <th className="px-8 py-6 text-center text-sm font-black text-blue-700 bg-blue-50/50 uppercase tracking-widest">Tera Pro</th>
                      <th className="px-8 py-6 text-center text-sm font-black text-gray-900 uppercase tracking-widest">Tera Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="px-8 py-6 font-black text-gray-900">Precio Mensual</td>
                      <td className="px-8 py-6 text-center font-bold text-gray-700">$0</td>
                      <td className="px-8 py-6 text-center font-black text-blue-700 bg-blue-50/30">$12.00</td>
                      <td className="px-8 py-6 text-center font-bold text-gray-700">$25.00</td>
                    </tr>
                    {comparisonFeatures.map((category, catIdx) => (
                      <React.Fragment key={catIdx}>
                        <tr className="bg-gray-50/50">
                          <td colSpan={4} className="px-8 py-4 text-xs font-black text-blue-600 uppercase tracking-widest">
                            {category.category}
                          </td>
                        </tr>
                        {category.features.map((feature, featIdx) => (
                          <tr key={featIdx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-6 text-gray-700 font-bold">{feature.name}</td>
                            <td className="px-8 py-6 text-center text-gray-600 font-medium">{feature.free}</td>
                            <td className="px-8 py-6 text-center text-blue-700 bg-blue-50/30 font-black">{feature.pro}</td>
                            <td className="px-8 py-6 text-center text-gray-600 font-medium">{feature.business}</td>
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
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">PREGUNTAS FRECUENTES</span>
              <h2 className="text-4xl font-black text-gray-900 mt-4 mb-6 tracking-tight">¿Tienes preguntas?</h2>
            </div>
            <div className="grid gap-6">
              {[
                { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se reflejarán en tu próxima facturación.' },
                { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas de crédito, débito y PayPal. Para planes empresariales también ofrecemos facturación por transferencia.' },
                { q: '¿Hay cargos por cancelación?', a: 'No, no hay cargos por cancelación. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones.' }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] border-2 border-gray-100 p-8 hover:border-blue-200 transition-all shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">{faq.q}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600 rounded-[3rem] -rotate-1 scale-105 opacity-10"></div>
            <div className="bg-white border-2 border-gray-100 rounded-[3rem] p-12 lg:p-20 text-center relative z-10 shadow-xl hover:border-blue-200 transition-all duration-500">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                ¿Listo para simplificar <br className="hidden md:block" />
                <span className="text-blue-600">tu flujo de trabajo?</span>
              </h2>
              <p className="text-lg text-gray-500 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
                Prueba TERA sin compromiso durante 14 días. Configura tus nubes, automatiza tus respaldos y siente la verdadera libertad digital.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="bg-blue-600 text-white font-black px-10 py-5 rounded-2xl hover:bg-blue-700 transition-all hover:shadow-[0_20px_40px_rgba(59,130,246,0.2)] hover:-translate-y-1 text-lg inline-flex items-center group w-full sm:w-auto">
                  Comenzar ahora gratis
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-20 px-6 lg:px-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <img src={logoUrl} alt="TERA Logo" className="h-20 w-auto mx-auto mb-8 opacity-50" />
          <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">© 2026 TERA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;