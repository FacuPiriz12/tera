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
import { Eye, EyeOff, Lock, Mail, Github, ArrowRight } from "lucide-react";
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
    <div className="w-full space-y-8 relative">
      <div className="space-y-3">
        <h1 className="text-[36px] font-bold text-gray-900 tracking-tighter leading-[1.1]">Inicia sesión hoy</h1>
        <p className="text-gray-500 text-[17px] font-medium">Ingresa tu email y contraseña para acceder a tu cuenta</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="damien.lewis@gmail.com"
                    className="h-14 px-5 rounded-2xl border-gray-200 focus:border-[#0061D5] focus:ring-4 focus:ring-blue-50 transition-all bg-gray-50/50 shadow-none text-lg"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Contraseña</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-14 px-5 pr-14 rounded-2xl border-gray-200 focus:border-[#0061D5] focus:ring-4 focus:ring-blue-50 transition-all bg-gray-50/50 shadow-none text-lg"
                    />
                    <button
                      type="button"
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === 0 ? 'w-6 bg-gray-300' : 'w-1.5 bg-gray-100'}`}
                />
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="submit" 
                className="h-14 px-10 rounded-2xl bg-[#0061D5] hover:bg-[#0052B3] text-white font-extrabold text-base shadow-xl shadow-blue-600/20 gap-3 transition-all group"
                disabled={isLoading}
              >
                {isLoading ? "Cargando..." : "Continuar"}
                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>

      <div className="pt-8 border-t border-gray-50 text-center">
        <p className="text-gray-500 font-medium">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup">
            <span className="text-[#0061D5] font-bold hover:underline cursor-pointer">Regístrate gratis</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
