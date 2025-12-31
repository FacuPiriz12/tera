import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Copy, Shield, Zap, Database, MessageSquare, CheckCircle2 } from "lucide-react";
import CloneDriveLogo from "@/components/CloneDriveLogo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Landing() {
  const { t } = useTranslation(['landing', 'common']);
  const [, setLocation] = useLocation();
  
  const handleLogin = () => {
    setLocation("/login");
  };

  const handleSignup = () => {
    setLocation("/signup");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <CloneDriveLogo className="h-10" />
            <div className="flex items-center gap-6">
              <LanguageSwitcher variant="icon" />
              <button 
                onClick={handleLogin}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Iniciar sesión
              </button>
              <Button 
                onClick={handleSignup}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full font-medium"
              >
                Comenzar gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-900 mb-6">
                El primer asistente de archivos con IA que realmente entiende tu nube
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                TERA es la única app que combina multicloud con IA para darte control total sobre tus archivos - sin que tengas que lidiar con interfaces complicadas o transferencias manuales lentas.
              </p>
              <Button 
                size="lg"
                onClick={handleSignup}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-7 rounded-full shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1"
              >
                Pruébalo gratis por 14 días
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-100 rounded-3xl -rotate-3 scale-105 opacity-20"></div>
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1544396821-4dd40b938ad3?q=80&w=2073&auto=format&fit=crop" 
                  alt="TERA Cloud Interface" 
                  className="rounded-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Why TERA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">¿Por qué TERA?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="w-8 h-8 text-indigo-600" />,
                title: "Conecta automáticamente",
                desc: "Vincula todas tus cuentas de Google Drive y Dropbox de forma instantánea."
              },
              {
                icon: <Zap className="w-8 h-8 text-indigo-600" />,
                title: "Experiencia personalizada",
                desc: "Nuestro sistema entiende tus necesidades y sugiere acciones para optimizar tu espacio."
              },
              {
                icon: <Copy className="w-8 h-8 text-indigo-600" />,
                title: "Sincroniza solo",
                desc: "No pierdas tiempo con cargas manuales. TERA clona y organiza tus archivos mientras descansas."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="mb-6 bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: TERA Answers */}
      <section className="py-24 bg-[#1C3F3A] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-16">Tú tienes preguntas, TERA tiene respuestas</h2>
          <div className="bg-[#264D47] rounded-3xl p-8 lg:p-12 text-left border border-white/10 shadow-2xl max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">T</div>
              <p className="text-lg opacity-80">Pregúntame cualquier cosa sobre tus archivos...</p>
            </div>
            <div className="grid gap-4">
              {[
                "¿Dónde tengo archivos duplicados?",
                "¿Cuánto espacio puedo liberar hoy?",
                "¿A qué nube moví mis fotos de viaje?",
                "¿Qué archivos ocupan más de 1GB?",
                "Sincroniza mis tareas de esta semana"
              ].map((q, i) => (
                <button 
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Safety */}
      <section className="py-24 bg-[#EBE8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Tus datos están seguros con nosotros
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                "Cifrado de grado bancario",
                "Misma seguridad que tu banco online",
                "Tus datos nunca se comparten",
                "Criptografía de punta a punta"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/50 p-6 rounded-2xl border border-white/20">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Call To Action */}
      <section className="py-24 bg-[#1C3F3A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Retoma el control de tu vida digital</h2>
          <div className="space-y-4 mb-10 text-lg opacity-90">
            <p>✓ 14 días gratis - cancela cuando quieras</p>
            <p>✓ Conecta tus nubes en 2 minutos</p>
            <p>✓ Sin sorpresas - precio fijo después de la prueba</p>
          </div>
          <Button 
            size="lg"
            onClick={handleSignup}
            className="bg-white text-[#1C3F3A] hover:bg-slate-100 text-xl px-12 py-8 rounded-full font-bold shadow-2xl"
          >
            Pruébalo gratis ahora →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
