import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FB] p-4 sm:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="w-full max-w-[1100px] h-full min-h-[600px] grid lg:grid-cols-2 bg-white rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100"
        >
          {/* Left Side: Animation & Graphics */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0061D5] to-[#0047A5] relative overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10"
            >
              <h2 className="text-4xl font-bold text-white leading-tight">
                Gestiona tus archivos <br /> 
                <span className="text-blue-200">con inteligencia.</span>
              </h2>
              <p className="mt-4 text-blue-100 text-lg max-w-sm">
                La plataforma multi-nube más potente para sincronizar, organizar y proteger tus datos.
              </p>
            </motion.div>

            {/* Floating Elements Animation */}
            <div className="absolute inset-0 z-0">
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] right-[10%] w-64 h-64 bg-white/10 rounded-[40px] blur-3xl"
              />
              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[10%] left-[10%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="relative z-10 flex items-center gap-4 text-blue-100 text-sm font-medium"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0061D5] bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <span>+10k usuarios confían en TERA</span>
            </motion.div>
          </div>

          {/* Right Side: Form */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-20 bg-white">
            <LoginForm onReplitLogin={handleReplitLogin} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
