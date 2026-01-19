import React, { useState } from 'react';
import { Database, Zap, Copy, CheckCircle2, ArrowRight, Menu, X, Cloud, Shield, Lock, Search, RefreshCw, Layers, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

import logoUrl from '../assets/logo.png';
import LanguageSelector from '../components/LanguageSelector';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const chatSuggestions = [
    "Mueve mis archivos de Dropbox a Google Drive",
    "Crea una copia de seguridad de mis fotos en OneDrive",
    "¿Qué nubes tengo integradas actualmente?",
    "Transfiere la carpeta 'Proyectos' a mi cuenta de Box",
    "Sincroniza mi carpeta de Notion con mi Drive"
  ];

  const cloudProviders = [
    { name: 'Google Drive', color: '#4285F4' },
    { name: 'Dropbox', color: '#0061FF' },
    { name: 'Box', color: '#0061D5' },
    { name: 'OneDrive', color: '#0078D4' }
  ];

  const features = [
    {
      icon: RefreshCw,
      title: "Transferencias Multi-nube",
      description: "Mueve gigabytes entre Dropbox, Drive y OneDrive con un solo clic. Sin descargar nada a tu equipo.",
      color: "blue"
    },
    {
      icon: Layers,
      title: "Copias de Seguridad Inteligentes",
      description: "Programa respaldos automáticos entre nubes para que tus archivos más importantes siempre tengan un espejo.",
      color: "purple"
    },
    {
      icon: Database,
      title: "+50 Integraciones Nativas",
      description: "Conecta Slack, Teams, Notion y todas tus herramientas de trabajo para centralizar tu ecosistema digital.",
      color: "pink"
    }
  ];

  const securityFeatures = [
    { icon: Shield, text: "Cifrado de grado bancario para todas tus nubes" },
    { icon: Lock, text: "Misma seguridad que tu banco online" },
    { icon: Search, text: "Tus datos nunca se comparten con terceros" },
    { icon: Layers, text: "Criptografía de punta a punta en cada transferencia" }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
              <img src={logoUrl} alt="TERA Logo" className="h-[8.4rem] w-auto group-hover:scale-105 transition-transform duration-300" />
            </Link>
            
            <div className="hidden md:flex items-center space-x-10">
              <div className="flex items-center space-x-8">
                <a href="#productos" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Productos</a>
                <Link href="/pricing" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Precios</Link>
                <a href="#seguridad" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Seguridad</a>
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => setLocation('/auth')}
                  className="text-sm text-gray-900 font-bold hover:text-blue-600 transition-colors"
                >
                  Iniciar sesión
                </button>
                <button 
                  onClick={() => setLocation('/auth')}
                  className="bg-blue-600 text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-blue-700 transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Comenzar
                </button>

                <LanguageSelector />
              </div>
            </div>

            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 md:hidden"
          >
            <div className="flex flex-col space-y-6 px-6 py-10">
              <a href="#productos" className="text-2xl font-bold text-gray-900">Productos</a>
              <Link href="/pricing" className="text-2xl font-bold text-gray-900">Precios</Link>
              <a href="#seguridad" className="text-2xl font-bold text-gray-900">Seguridad</a>
              <div className="pt-6 border-t border-gray-100 flex flex-col space-y-4">
                <button onClick={() => setLocation('/auth')} className="text-lg font-bold text-gray-900 py-2">Iniciar sesión</button>
                <button onClick={() => setLocation('/auth')} className="bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg shadow-blue-200">
                  Comenzar ahora
                </button>
                <div className="flex justify-center pt-4">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-20 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl -z-10"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 260,
                  damping: 20 
                }}
                className="inline-flex items-center space-x-3 mb-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200/50 px-5 py-2.5 rounded-2xl backdrop-blur-sm group cursor-default"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white fill-current" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-black text-gray-900 tracking-tight">
                  <span className="text-blue-600">Nuevo:</span> Automatización Multi-Nube
                </span>
                <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                  PRO
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight"
              >
                Mueve y protege tus archivos con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Inteligencia Real</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl font-medium"
              >
                TERA es el puente entre tus nubes. Transfiere archivos entre plataformas, programa copias de seguridad automáticas y conecta tus herramientas favoritas en segundos.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5"
              >
                <button 
                  onClick={() => setLocation('/auth')}
                  className="bg-blue-600 text-white font-bold px-10 py-5 rounded-2xl hover:bg-blue-700 transition-all hover:shadow-[0_20px_40px_rgba(59,130,246,0.4)] hover:-translate-y-1 flex items-center justify-center group text-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  Empieza gratis hoy
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white border-2 border-gray-100 text-gray-900 font-bold px-10 py-5 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all text-lg shadow-sm">
                  Ver demostración
                </button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mt-16 pt-10 border-t border-gray-100"
              >
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 text-center lg:text-left">Mejores Integraciones</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="flex items-center space-x-3 group cursor-default">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Cloud className="w-6 h-6 text-blue-600 group-hover:text-white" />
                    </div>
                    <span className="text-lg font-black text-gray-800 tracking-tighter">Google Drive</span>
                  </div>
                  <div className="flex items-center space-x-3 group cursor-default">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-400 transition-colors">
                      <Cloud className="w-6 h-6 text-blue-400 group-hover:text-white" />
                    </div>
                    <span className="text-lg font-black text-gray-800 tracking-tighter">Dropbox</span>
                  </div>
                  <div className="flex items-center space-x-3 group cursor-default">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                      <Cloud className="w-6 h-6 text-blue-700 group-hover:text-white" />
                    </div>
                    <span className="text-lg font-black text-gray-800 tracking-tighter">OneDrive</span>
                  </div>
                  <div className="flex items-center space-x-3 group cursor-default">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                      <Cloud className="w-6 h-6 text-blue-500 group-hover:text-white" />
                    </div>
                    <span className="text-lg font-black text-gray-800 tracking-tighter">Box</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 2 }}
                transition={{ duration: 0.8 }}
                className="relative bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-8 border border-gray-50"
              >
                {/* Floating Badge */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl flex items-center space-x-2 animate-bounce">
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  <span>Auto-Sincronización</span>
                </div>

                <div className="space-y-8">
                  <div className="flex justify-between items-center px-2">
                    {cloudProviders.map((provider, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -5, scale: 1.1 }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
                        style={{ backgroundColor: provider.color + '10', borderBottom: '4px solid ' + provider.color }}
                      >
                        <Cloud className="w-7 h-7" style={{ color: provider.color }} />
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-6 space-y-6">
                      <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>Transferencia: Dropbox → Drive</span>
                        <span className="text-blue-600">85% Completado</span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>Backup: Servidor → OneDrive</span>
                        <span className="text-purple-600">42% Escaneando</span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '42%' }}
                          transition={{ duration: 2, delay: 0.8 }}
                          className="h-full bg-purple-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">Liberado</p>
                      <p className="text-2xl font-black text-blue-900 leading-none">12.4 GB</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                      <p className="text-xs font-bold text-green-600 uppercase mb-1">Duplicados</p>
                      <p className="text-2xl font-black text-green-900 leading-none">1,240</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative side cards */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-10 -left-10 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 flex items-center space-x-4 max-w-[240px]"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 leading-tight">Seguridad Activa</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Cifrado de 256 bits</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* Stats/Social Proof Section */}
      <section className="py-20 bg-white border-y border-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Archivos Movidos", value: "450M+" },
              { label: "Usuarios Activos", value: "85k+" },
              { label: "Uptime Garantizado", value: "99.9%" },
              { label: "Seguridad Bancaria", value: "256-bit" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl lg:text-5xl font-black text-blue-600 mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Benefits Grid */}
      <section className="py-32 px-6 lg:px-20 bg-gray-50/50" id="productos">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">¿Por qué elegir TERA?</h2>
            <h3 className="text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tight">El estándar del mañana hoy</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Simplificamos lo complejo. Automatizamos lo tedioso. Protegemos lo que importa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[2rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 border border-gray-50 shadow-sm ${
                    feature.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    feature.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    'bg-pink-50 text-pink-600'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-5 tracking-tight">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed font-medium">{feature.description}</p>
                  <div className="mt-8 pt-8 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-sm font-bold text-blue-600 flex items-center">
                      Saber más <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* AI Chat Interaction Section */}
      <section className="py-32 px-6 lg:px-20 bg-gray-900 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-blue-500 rounded-full blur-xl"
              style={{
                width: Math.random() * 100 + 50 + 'px',
                height: Math.random() * 100 + 50 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `pulse ${Math.random() * 5 + 5}s infinite alternate`
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 leading-tight">
                Tú define las reglas,<br />
                <span className="text-blue-400">TERA las ejecuta por ti.</span>
              </h2>
              <p className="text-xl text-gray-400 mb-12 font-medium">
                Configura flujos de trabajo potentes en segundos. TERA monitorea tus archivos 24/7 y realiza las tareas repetitivas para que tú no tengas que hacerlo.
              </p>
              
              <div className="space-y-4">
                {chatSuggestions.map((suggestion, idx) => (
                  <motion.button 
                    key={idx}
                    onMouseEnter={() => setActiveSuggestion(idx)}
                    onMouseLeave={() => setActiveSuggestion(null)}
                    whileHover={{ x: 10 }}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
                      activeSuggestion === idx 
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                        : 'border-white/10 bg-white/5 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <span className="text-lg font-bold">{suggestion}</span>
                    <RefreshCw className={`w-5 h-5 transition-transform duration-1000 ${activeSuggestion === idx ? 'rotate-180' : ''}`} />
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-800 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center space-x-4 mb-10 border-b border-white/5 pb-6">
                    <div className="w-12 h-12 rounded-xl bg-transparent overflow-hidden flex items-center justify-center shadow-lg">
                      <img src={logoUrl} alt="TERA Automation" className="w-10 h-auto" />
                    </div>
                    <div>
                      <h5 className="text-white font-black">Panel de Automatización</h5>
                      <p className="text-xs font-bold text-blue-400 tracking-widest uppercase">Sistema Inteligente Activo</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                          "He detectado 150 archivos nuevos en tu Dropbox. ¿Deseas que inicie la migración automática a tu carpeta de Proyectos 2024 en Google Drive?"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 flex-row-reverse space-x-reverse">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="bg-blue-600 rounded-2xl p-4 shadow-lg">
                        <p className="text-sm text-white font-bold italic">
                          "Sí, por favor. Y elimina los duplicados de más de 6 meses."
                        </p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        <span>Migración en curso</span>
                        <span className="text-blue-400">72%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: "72%" }}
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Security Detailed Section */}
      <section className="py-32 px-6 lg:px-20 bg-white" id="seguridad">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-12">
                  <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <Shield className="w-10 h-10 text-blue-600 mb-6" />
                    <h5 className="text-xl font-black text-gray-900 mb-3">AES-256</h5>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">Encriptación de nivel militar para cada bit de información.</p>
                  </div>
                  <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-500/20">
                    <Lock className="w-10 h-10 mb-6" />
                    <h5 className="text-xl font-black mb-3">Zero Knowledge</h5>
                    <p className="text-sm text-blue-100 font-medium leading-relaxed">Tus claves son solo tuyas. Ni siquiera nosotros podemos ver tus archivos.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-900 rounded-[2rem] p-8 text-white">
                    <Search className="w-10 h-10 text-blue-400 mb-6" />
                    <h5 className="text-xl font-black mb-3">Auditoría Real</h5>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">Registros detallados de cada movimiento para tu control total.</p>
                  </div>
                  <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <RefreshCw className="w-10 h-10 text-purple-600 mb-6" />
                    <h5 className="text-xl font-black text-gray-900 mb-3">Sincronización</h5>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">Tus nubes siempre en armonía, protegidas por nuestro firewall inteligente.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Seguridad sin Compromisos</h2>
              <h3 className="text-5xl font-black text-gray-900 mb-8 leading-tight">Dormir tranquilo es parte del plan</h3>
              <p className="text-xl text-gray-600 mb-10 font-medium leading-relaxed">
                No escatimamos en seguridad. TERA utiliza los mismos protocolos que las instituciones financieras globales para garantizar que tus datos nunca caigan en manos equivocadas.
              </p>
              
              <ul className="space-y-6">
                {securityFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-4">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-lg font-bold text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-12">
                <button className="bg-gray-900 text-white font-bold px-10 py-5 rounded-2xl hover:bg-black transition-all shadow-xl hover:-translate-y-1">
                  Lee nuestro Whitepaper de Seguridad
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto bg-blue-600 rounded-[3rem] p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-blue-500/40">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700" />
          
          <div className="relative z-10">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter">
              El futuro de tus archivos<br />comienza hoy.
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Únete a más de 85,000 profesionales que ya han optimizado su ecosistema digital con TERA. Sin tarjetas, sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => setLocation('/auth')}
                className="bg-white text-blue-600 font-black px-12 py-6 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1 text-lg"
              >
                Crear mi cuenta gratis
              </button>
              <button className="bg-blue-700/30 backdrop-blur-md text-white border-2 border-white/20 font-black px-12 py-6 rounded-2xl hover:bg-blue-700/50 transition-all text-lg">
                Hablar con ventas
              </button>
            </div>
          </div>

          {/* Abstract geometric shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 lg:px-20 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <img src={logoUrl} alt="TERA Logo" className="h-[8.4rem] w-auto object-contain mb-8" />
              <p className="text-lg text-gray-500 max-w-xs font-medium leading-relaxed">Elevando la gestión de archivos a una nueva dimensión de inteligencia y seguridad.</p>
              
              <div className="flex items-center space-x-5 mt-10">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current rounded-sm" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Plataforma</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Características</a></li>
                <li><a href="/pricing" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Precios</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Seguridad</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Integraciones</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="/privacy" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Términos</Link></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Cookies</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Cumplimiento</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-100 flex flex-col md:row items-center justify-between">
            <p className="text-gray-400 font-bold">© {new Date().getFullYear()} TERA Cloud Technologies Inc.</p>
            <div className="flex items-center space-x-8 mt-6 md:mt-0">
              <span className="flex items-center text-xs font-bold text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Sistemas Operativos
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
