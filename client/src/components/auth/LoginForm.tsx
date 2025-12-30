import { useState } from "react";
import { supabasePromise } from "@/lib/supabase";
import { setCachedSession } from "@/lib/supabaseSession";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Lock, Mail, Github } from "lucide-react";
import { Link } from "wouter";
import { SiGoogle } from "react-icons/si";
import { motion } from "framer-motion";
import CloneDriveLogo from "@/components/CloneDriveLogo";

interface LoginFormProps {
  onReplitLogin: () => void;
}

export default function LoginForm({ onReplitLogin }: LoginFormProps) {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().email({ message: t('validation.invalidEmail') }),
    password: z.string().min(6, { message: t('validation.passwordTooShort') })
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const { toast } = useToast();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const supabase = await supabasePromise;
      if (!supabase) throw new Error("Supabase not configured");
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;
      setCachedSession(authData.session);
      toast({ title: t('login.success') });
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: t('errors.loginFailed'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <CloneDriveLogo className="h-12 w-auto mx-auto mb-6 text-[#0061D5]" />
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bienvenido a TERA</h1>
        <p className="text-gray-500 mt-2">Ingresa tus credenciales para continuar</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-12 rounded-2xl border-gray-200 hover:bg-gray-50 gap-2 font-semibold"
          onClick={onReplitLogin}
        >
          <SiGoogle className="w-5 h-5" />
          Google
        </Button>
        <Button 
          variant="outline" 
          className="h-12 rounded-2xl border-gray-200 hover:bg-gray-50 gap-2 font-semibold"
        >
          <Github className="w-5 h-5" />
          GitHub
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-400 font-medium">O usa tu email</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      className="h-14 pl-12 rounded-2xl border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all bg-gray-50/30"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">Contraseña</FormLabel>
                  <Link href="/forgot-password">
                    <span className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">¿Olvidaste tu contraseña?</span>
                  </Link>
                </div>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-14 pl-12 pr-12 rounded-2xl border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all bg-gray-50/30"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-[#0061D5] hover:bg-[#0052B3] text-white text-base font-bold shadow-[0_8px_24px_-8px_rgba(0,97,213,0.4)] transition-all"
              disabled={isLoading}
            >
              {isLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cargando...</span> : "Iniciar Sesión"}
            </Button>
          </motion.div>
        </form>
      </Form>

      <p className="text-center text-sm text-gray-500">
        ¿No tienes una cuenta?{" "}
        <Link href="/signup">
          <span className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer">Regístrate gratis</span>
        </Link>
      </p>
    </div>
  );
}
