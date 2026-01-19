import React, { useState } from 'react';
import { Database, Zap, Copy, CheckCircle2, ArrowRight, Menu, X, Cloud, Shield, Lock, Search, RefreshCw, Layers, Globe, Twitter, Linkedin, Github } from 'lucide-react';
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
    t('landing.ai.suggestions.suggestion1'),
    t('landing.ai.suggestions.suggestion2'),
    t('landing.ai.suggestions.suggestion3'),
    t('landing.ai.suggestions.suggestion4'),
    t('landing.ai.suggestions.suggestion5')
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
      title: t('landing.benefits.feature1.title'),
      description: t('landing.benefits.feature1.description'),
      color: "blue"
    },
    {
      icon: Layers,
      title: t('landing.benefits.feature2.title'),
      description: t('landing.benefits.feature2.description'),
      color: "purple"
    },
    {
      icon: Database,
      title: t('landing.benefits.feature3.title'),
      description: t('landing.benefits.feature3.description'),
      color: "pink"
    }
  ];

  const securityFeatures = [
    { icon: Shield, text: t('landing.security.aesDesc') },
    { icon: Lock, text: t('landing.security.zeroKnowledgeDesc') },
    { icon: Search, text: t('landing.security.auditDesc') },
    { icon: Layers, text: t('landing.security.syncDesc') }
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
                <a href="#productos" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">{t('landing.benefits.badge')}</a>
                <Link href="/pricing" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">{t('common.navigation.pricing')}</Link>
                <a href="#seguridad" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">{t('common.navigation.security')}</a>
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => setLocation('/auth')}
                  className="text-sm text-gray-900 font-bold hover:text-blue-600 transition-colors"
                >
                  {t('common.auth.login')}
                </button>
                <button 
                  onClick={() => setLocation('/auth')}
                  className="bg-blue-600 text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-blue-700 transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  {t('landing.hero.ctaButton')}
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
              <a href="#productos" className="text-2xl font-bold text-gray-900">{t('landing.benefits.badge')}</a>
              <Link href="/pricing" className="text-2xl font-bold text-gray-900">{t('common.navigation.pricing')}</Link>
              <a href="#seguridad" className="text-2xl font-bold text-gray-900">{t('common.navigation.security')}</a>
              <div className="pt-6 border-t border-gray-100 flex flex-col space-y-4">
                <button onClick={() => setLocation('/auth')} className="text-lg font-bold text-gray-900 py-2">{t('common.auth.login')}</button>
                <button onClick={() => setLocation('/auth')} className="bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg shadow-blue-200">
                  {t('landing.hero.ctaButton')}
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
                  <span className="text-blue-600">{t('common.buttons.next')}:</span> {t('landing.hero.syncBadge')}
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
                {t('landing.hero.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">{t('landing.hero.subtitle')}</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl font-medium"
              >
                {t('landing.hero.description')}
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
                  {t('landing.hero.ctaButton')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white border-2 border-gray-100 text-gray-900 font-bold px-10 py-5 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all text-lg shadow-sm">
                  {t('landing.hero.demoButton')}
                </button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mt-16 pt-10 border-t border-gray-100"
              >
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 text-center lg:text-left">{t('landing.hero.integrationsLabel')}</p>
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
                  <span>{t('landing.hero.syncBadge')}</span>
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
                        <span>{t('landing.hero.transferLabel')}: Dropbox → Drive</span>
                        <span className="text-blue-600">85% {t('landing.hero.completed')}</span>
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
                        <span>{t('landing.hero.backupLabel')}: Servidor → OneDrive</span>
                        <span className="text-purple-600">42% {t('landing.hero.scanning')}</span>
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
                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">{t('landing.hero.freedLabel')}</p>
                      <p className="text-2xl font-black text-blue-900 leading-none">12.4 GB</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                      <p className="text-xs font-bold text-green-600 uppercase mb-1">{t('landing.hero.duplicatesLabel')}</p>
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
                  <p className="text-sm font-black text-gray-900 leading-tight">{t('landing.hero.securityBadge')}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{t('landing.hero.encryptionLabel')}</p>
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
              { label: t('landing.stats.filesMoved'), value: "450M+" },
              { label: t('landing.stats.activeUsers'), value: "85k+" },
              { label: t('landing.stats.guaranteedUptime'), value: "99.9%" },
              { label: t('landing.stats.bankingSecurity'), value: "256-bit" }
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
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">{t('landing.benefits.badge')}</h2>
            <h3 className="text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tight">{t('landing.benefits.title')}</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              {t('landing.benefits.description')}
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
                      {t('landing.benefits.learnMore')} <ArrowRight className="w-4 h-4 ml-2" />
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
                {t('landing.ai.title')}<br />
                <span className="text-blue-400">{t('landing.ai.subtitle')}</span>
              </h2>
              <p className="text-xl text-gray-400 mb-12 font-medium">
                {t('landing.ai.description')}
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
                      <h5 className="text-white font-black">{t('landing.ai.panelTitle')}</h5>
                      <p className="text-xs font-bold text-blue-400 tracking-widest uppercase">{t('landing.ai.panelStatus')}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                          {t('landing.ai.aiMessage')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 flex-row-reverse space-x-reverse">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="bg-blue-600 rounded-2xl p-4 shadow-lg">
                        <p className="text-sm text-white font-bold italic">
                          {t('landing.ai.userResponse')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        <span>{t('landing.ai.progressLabel')}</span>
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
                    <h5 className="text-xl font-black text-gray-900 mb-3">{t('landing.security.aesTitle')}</h5>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{t('landing.security.aesDesc')}</p>
                  </div>
                  <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-500/20">
                    <Lock className="w-10 h-10 mb-6" />
                    <h5 className="text-xl font-black mb-3">{t('landing.security.zeroKnowledgeTitle')}</h5>
                    <p className="text-sm text-blue-100 font-medium leading-relaxed">{t('landing.security.zeroKnowledgeDesc')}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-900 rounded-[2rem] p-8 text-white">
                    <Search className="w-10 h-10 text-blue-400 mb-6" />
                    <h5 className="text-xl font-black mb-3">{t('landing.security.auditTitle')}</h5>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">{t('landing.security.auditDesc')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <RefreshCw className="w-10 h-10 text-purple-600 mb-6" />
                    <h5 className="text-xl font-black text-gray-900 mb-3">{t('landing.security.syncTitle')}</h5>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{t('landing.security.syncDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">{t('landing.security.badge')}</h2>
              <h3 className="text-5xl font-black text-gray-900 mb-8 leading-tight">{t('landing.security.title')}</h3>
              <p className="text-xl text-gray-600 mb-10 font-medium leading-relaxed">
                {t('landing.security.description')}
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
                  {t('landing.security.whitepaperButton')}
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
              {t('landing.cta.title', { interpolation: { escapeValue: false } })}
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              {t('landing.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => setLocation('/auth')}
                className="bg-white text-blue-600 font-black px-12 py-6 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1 text-lg"
              >
                {t('landing.cta.createAccount')}
              </button>
              <button className="bg-blue-700/30 backdrop-blur-md text-white border-2 border-white/20 font-black px-12 py-6 rounded-2xl hover:bg-blue-700/50 transition-all text-lg">
                {t('landing.cta.talkToSales')}
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
              <p className="text-lg text-gray-500 max-w-xs font-medium leading-relaxed">{t('landing.footer.description')}</p>
              
            <div className="flex items-center space-x-5 mt-10">
                <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                  <span className="sr-only">Twitter</span>
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                  <span className="sr-only">GitHub</span>
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-8">{t('landing.footer.platform')}</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">{t('landing.benefits.badge')}</a></li>
                <li><a href="/pricing" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">{t('common.navigation.pricing')}</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">{t('common.navigation.security')}</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">{t('common.navigation.integrations')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-8">{t('landing.footer.legal')}</h4>
              <ul className="space-y-4">
                <li><Link href="/privacy" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">{t('landing.footer.privacy')}</Link></li>
                <li><Link href="/terms" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">{t('landing.footer.terms')}</Link></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">{t('landing.footer.cookies')}</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">{t('landing.footer.compliance')}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-100 flex flex-col md:row items-center justify-between">
            <p className="text-gray-400 font-bold">{t('landing.footer.rights', { year: new Date().getFullYear() })}</p>
            <div className="flex items-center space-x-8 mt-6 md:mt-0">
              <span className="flex items-center text-xs font-bold text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                {t('landing.footer.status')}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
