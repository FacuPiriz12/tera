import React, { useState } from 'react';
import { Database, Zap, Copy, CheckCircle2, ArrowRight, Menu, X, Cloud, Shield, Lock, Search, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

import logoUrl from '../assets/logo.png';
import LanguageSelector from '../components/LanguageSelector';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

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
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => setLocation('/')}>
              <img src={logoUrl} alt="TERA Logo" className="h-[8.4rem] w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
            </div>
            
            <div className="hidden md:flex items-center space-x-10">
              <div className="flex items-center space-x-8">
                <a href="#productos" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Productos</a>
                <button 
                  onClick={() => setLocation('/pricing')}
                  className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Precios
                </button>
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
                <div className="z-[10000]">
                  <LanguageSelector />
                </div>
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
              <button 
                onClick={() => { setLocation('/pricing'); setIsMenuOpen(false); }}
                className="text-2xl font-bold text-gray-900 text-left"
              >
                Precios
              </button>
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
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl -z-10"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
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
                  {cloudProviders.map((provider) => (
                    <div key={provider.name} className="flex items-center space-x-3 group cursor-default">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Cloud className="w-6 h-6 text-blue-600 group-hover:text-white" />
                      </div>
                      <span className="text-lg font-black text-gray-800 tracking-tighter">{provider.name}</span>
                    </div>
                  ))}
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
                        <span>Transferencia en curso</span>
                        <span className="text-blue-600">84%</span>
                      </div>
                      <div className="h-3 bg-white rounded-full overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "84%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Copy className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-none">Proyecto_Final.zip</p>
                          <p className="text-[10px] text-gray-400 mt-1">Dropbox → Google Drive</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="productos" className="py-32 px-6 lg:px-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">Todo lo que necesitas para dominar tu nube</h2>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">Olvídate de descargar y volver a subir archivos. TERA gestiona tus datos directamente entre plataformas con seguridad total.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-50 flex items-center justify-center mb-8 group-hover:bg-${feature.color}-600 transition-colors`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600 group-hover:text-white`} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="seguridad" className="py-32 px-6 lg:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto bg-gray-900 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] -z-0" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 blur-[100px] -z-0" />
          
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">Tu seguridad es nuestra <span className="text-blue-400">prioridad absoluta</span></h2>
              <div className="grid gap-6">
                {securityFeatures.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-lg font-bold text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-64 h-64 border-2 border-dashed border-blue-500/30 rounded-full flex items-center justify-center"
                >
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="w-48 h-48 border-2 border-dashed border-purple-500/30 rounded-full flex items-center justify-center"
                  />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)]">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 lg:px-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <img src={logoUrl} alt="TERA Logo" className="h-[8.4rem] w-auto object-contain mb-8" />
              <p className="text-lg text-gray-500 max-w-xs font-medium">Simplificando la gestión de archivos en la nube con inteligencia y seguridad.</p>
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Compañía</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Carreras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a href="/privacy" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Privacidad</a></li>
                <li><a href="/terms" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Términos</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-bold">© {new Date().getFullYear()} TERA Cloud. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}