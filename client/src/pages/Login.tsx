import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleReplitLogin = () => {
    const isDevelopment = import.meta.env.DEV;
    window.location.href = isDevelopment ? "/api/dev-login" : "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white p-4 sm:p-6">
      {/* Refined Background with Stratis-style Pastel Gradients */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: '50px 50px' 
          }}
        />
        
        {/* Soft Pastel Orbs - Adjusted colors for the requested palette */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full blur-[120px] bg-[#FFD6E0]/20"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-[#D6E4FF]/30"
        />
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[120px] bg-[#E0F7FA]/30"
        />
        <motion.div
          animate={{ 
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#F3E5F5]/30"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[1000px] relative z-10 flex flex-col items-center"
        >
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-10 h-10 bg-black rounded-xl shadow-2xl flex items-center justify-center transform transition-transform hover:rotate-12">
              <div className="w-5 h-5 bg-white rotate-45 rounded-sm" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">TERA</span>
          </motion.div>

          {/* Main Card */}
          <div className="w-full grid lg:grid-cols-[1.1fr_0.9fr] bg-white rounded-[48px] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,0.12)] border border-white/50 min-h-[620px] backdrop-blur-sm">
            {/* Left Side: Login Form */}
            <div className="p-10 sm:p-14 lg:p-20 flex flex-col justify-center bg-white relative">
              <LoginForm onReplitLogin={handleReplitLogin} />
            </div>

            {/* Right Side: Stratis Quote Style */}
            <div className="hidden lg:flex flex-col justify-center p-14 lg:p-20 bg-[#F9FAFB]/80 backdrop-blur-md relative overflow-hidden border-l border-gray-50">
              {/* Decorative gradient elements */}
              <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-60" />
              <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-pink-100/50 rounded-full blur-3xl opacity-60" />
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-12 relative z-10"
              >
                <div className="space-y-10">
                  <p className="text-[28px] leading-[1.4] text-gray-800 font-medium tracking-tight">
                    "TERA nos ha permitido construir flujos de trabajo listos para producción en minutos, realmente nos ayudó a expandir nuestras capacidades rápidamente"
                  </p>
                  
                  <div className="flex items-center gap-5 pt-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" 
                        alt="Alison Bothman" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xl tracking-tight">Alison Bothman</p>
                      <p className="text-gray-500 font-semibold text-sm uppercase tracking-widest">Product Designer, Google</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex gap-10 text-[13px] text-gray-400 font-bold uppercase tracking-widest"
          >
            <Link href="/terms" className="hover:text-[#0061D5] transition-colors cursor-pointer">Términos de servicio</Link>
            <Link href="/privacy" className="hover:text-[#0061D5] transition-colors cursor-pointer">Política de privacidad</Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
