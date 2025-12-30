import { useState } from "react";
import { supabasePromise } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

interface SignupFormProps {
  onReplitLogin: () => void;
}

export default function SignupForm({ onReplitLogin }: SignupFormProps) {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signupSchema = z.object({
    name: z.string().min(2, { message: t('validation.nameRequired') }),
    email: z.string().email({ message: t('validation.invalidEmail') }),
    password: z.string().min(6, { message: t('validation.passwordTooShort') }),
    confirmPassword: z.string().min(6, { message: t('validation.passwordTooShort') }),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: t('validation.acceptTermsRequired')
    })
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordsDoNotMatch'),
    path: ["confirmPassword"]
  });

  type SignupFormData = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    }
  });

  const { toast } = useToast();

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const supabase = await supabasePromise;
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/verify`,
          data: {
            first_name: data.name.split(' ')[0],
            last_name: data.name.split(' ').slice(1).join(' ') || '',
            name: data.name
          }
        }
      });

      if (error) {
        toast({
          title: t('errors.signupFailed'),
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('signup.success'),
        description: t('signup.checkEmail')
      });
      
      setTimeout(() => {
        setLocation('/signup/success');
      }, 1500);
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: t('errors.signupFailed'),
        description: t('errors.tryAgain'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-10 relative">
      <div className="space-y-4">
        <h1 className="text-[42px] font-bold text-gray-900 tracking-tighter leading-[1]">Crea tu cuenta</h1>
        <p className="text-gray-500 text-[18px] font-medium leading-relaxed">Únete a TERA y comienza a gestionar tus nubes con facilidad</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Nombre completo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Damien Lewis"
                      className="h-16 px-6 rounded-2xl border-gray-100 focus:border-[#0061D5] focus:ring-[6px] focus:ring-blue-50 transition-all bg-gray-50/30 shadow-sm text-lg placeholder:text-gray-300"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-red-500" />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-16 px-6 pr-14 rounded-2xl border-gray-100 focus:border-[#0061D5] focus:ring-[6px] focus:ring-blue-50 transition-all bg-gray-50/30 shadow-sm text-lg"
                        />
                        <button
                          type="button"
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Confirmar</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="h-16 px-6 rounded-2xl border-gray-100 focus:border-[#0061D5] focus:ring-[6px] focus:ring-blue-50 transition-all bg-gray-50/30 shadow-sm text-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-semibold text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-6 h-6 rounded-lg border-gray-200 data-[state=checked]:bg-[#0061D5] data-[state=checked]:border-[#0061D5]"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-500 font-medium">
                    Acepto los <Link href="/terms"><span className="text-blue-600 font-bold hover:underline cursor-pointer">Términos</span></Link> y la <Link href="/privacy"><span className="text-blue-600 font-bold hover:underline cursor-pointer">Privacidad</span></Link>
                  </FormLabel>
                  <FormMessage className="text-xs font-semibold text-red-500" />
                </div>
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-700 ease-in-out ${i === 1 ? 'w-10 bg-blue-600' : 'w-2 bg-gray-100'}`}
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
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login">
            <span className="text-[#0061D5] font-black hover:underline cursor-pointer tracking-tight">Inicia sesión</span>
          </Link>
        </p>
      </div>
    </div>
  );
}