import CloneDriveLogo from "@/components/CloneDriveLogo";
import SignupForm from "@/components/auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

import { useTranslation } from "react-i18next";

export default function Signup() {
  const { t } = useTranslation(['auth', 'common']);
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
    <div className="min-h-screen w-full flex flex-col items-center bg-[#F9FAFB] p-6 relative">
      {/* Logo Section - Top Left */}
      <div className="absolute top-8 left-8">
        <CloneDriveLogo className="h-12" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] flex flex-col items-center mt-20"
        >
          <div className="w-full space-y-8">
            <h1 className="text-3xl font-semibold text-center text-[#111827]">{t('signup.title')}</h1>
            
            <div className="w-full bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-8">
              <SignupForm onReplitLogin={handleReplitLogin} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
