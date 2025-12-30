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
    <div className="w-full space-y-10 relative">
      <div className="space-y-4">
        <h1 className="text-[42px] font-bold text-gray-900 tracking-tighter leading-[1] transition-all hover:tracking-tight">Inicia sesión hoy</h1>
        <p className="text-gray-500 text-[18px] font-medium leading-relaxed">Ingresa tu email y contraseña para acceder a tu cuenta</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="damien.lewis@gmail.com"
                    className="h-16 px-6 rounded-2xl border-gray-100 focus:border-[#0061D5] focus:ring-[6px] focus:ring-blue-50 transition-all bg-gray-50/30 shadow-sm text-lg placeholder:text-gray-300"
                  />
                </FormControl>
                <FormMessage className="text-xs font-semibold text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Contraseña</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-16 px-6 pr-16 rounded-2xl border-gray-100 focus:border-[#0061D5] focus:ring-[6px] focus:ring-blue-50 transition-all bg-gray-50/30 shadow-sm text-lg placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors p-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-semibold text-red-500" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-700 ease-in-out ${i === 0 ? 'w-10 bg-blue-600' : 'w-2 bg-gray-100'}`}
                />
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.05, x: 8 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="submit" 
                className="h-16 px-12 rounded-2xl bg-[#0061D5] hover:bg-[#0052B3] text-white font-black text-lg shadow-[0_20px_40px_-10px_rgba(0,97,213,0.3)] gap-4 transition-all group"
                disabled={isLoading}
              >
                {isLoading ? "Cargando..." : "Continuar"}
                {!isLoading && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>

      <div className="pt-10 border-t border-gray-100 text-center">
        <p className="text-gray-400 font-medium text-lg">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup">
            <span className="text-[#0061D5] font-black hover:underline cursor-pointer tracking-tight">Regístrate gratis</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
