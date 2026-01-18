import React, { useState } from 'react';
import { Check, X, ArrowRight, Star, Zap, Shield, Zap as ZapIcon, Users, HardDrive, RefreshCw, Clock, FileText, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import logoUrl from '../assets/logo.png';
import Footer from '@/components/Footer';

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
              Elige el plan <span className="text-blue-600">perfecto para ti</span>
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
                </div>

                <div className="space-y-4 flex-grow mb-10">
                  {plan.features.map((feature, featureIdx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={featureIdx} className="flex items-center space-x-3">
                        <div className={`p-1 rounded-full ${plan.popular ? (feature.included ? 'bg-white/20' : 'bg-white/10') : (feature.included ? 'bg-blue-50' : 'bg-gray-50')}`}>
                          {feature.included ? (
                            <Check className={`w-3 h-3 ${plan.popular ? 'text-white' : 'text-blue-600'}`} />
                          ) : (
                            <X className={`w-3 h-3 ${plan.popular ? 'text-white/40' : 'text-gray-300'}`} />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${plan.popular ? 'text-blue-100' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${
                            plan.popular 
                              ? (feature.included ? 'text-white' : 'text-white/50') 
                              : (feature.included ? 'text-gray-700' : 'text-gray-400')
                          }`}>
                            {feature.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 order-last mt-auto">
                  <button className={`w-full py-4 rounded-2xl font-black text-lg transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center group ${
                    plan.popular
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detailed Comparison */}
          <div className="mt-20">
            <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">Comparativa detallada</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-6 px-4 text-sm font-black text-gray-400 uppercase tracking-widest">Funcionalidad</th>
                    <th className="py-6 px-4 text-sm font-black text-gray-900 uppercase tracking-widest">Free</th>
                    <th className="py-6 px-4 text-sm font-black text-blue-600 uppercase tracking-widest">Pro</th>
                    <th className="py-6 px-4 text-sm font-black text-purple-600 uppercase tracking-widest">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category, catIdx) => (
                    <React.Fragment key={catIdx}>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="py-4 px-4 text-sm font-black text-gray-900">{category.category}</td>
                      </tr>
                      {category.features.map((feature, fIdx) => (
                        <tr key={fIdx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="py-6 px-4 text-sm font-bold text-gray-600">{feature.name}</td>
                          <td className="py-6 px-4 text-sm font-bold text-gray-900">{feature.free}</td>
                          <td className="py-6 px-4 text-sm font-bold text-blue-600">{feature.pro}</td>
                          <td className="py-6 px-4 text-sm font-bold text-purple-600">{feature.business}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
