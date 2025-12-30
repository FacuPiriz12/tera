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
    <div className="w-full space-y-6">
      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-11 border-[#E5E7EB] text-[#374151] hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"
        onClick={onReplitLogin}
      >
        <SiGoogle className="w-4 h-4 text-[#EA4335]" />
        {t('signup.continueWithReplit')}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E5E7EB]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-[#9CA3AF] lowercase">{t('common:or')}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-[#374151]">{t('signup.nameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('signup.namePlaceholder')}
                    className="h-11 border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-[#374151]">{t('signup.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('signup.emailPlaceholder')}
                    className="h-11 border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
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
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-[#374151]">{t('signup.passwordLabel')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder={t('signup.passwordPlaceholder')}
                      className="h-11 border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-[#374151]">{t('signup.confirmPasswordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={t('signup.confirmPasswordPlaceholder')}
                    className="h-11 border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0 py-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                </FormControl>
                <div className="leading-none">
                  <FormLabel className="text-xs text-[#6B7280] font-normal">
                    {t('signup.acceptTerms.part1')}{' '}
                    <Link href="/terms">
                      <span className="text-[#4F46E5] hover:underline cursor-pointer">{t('signup.acceptTerms.termsLink')}</span>
                    </Link>{' '}
                    {t('signup.acceptTerms.and')}{' '}
                    <Link href="/privacy">
                      <span className="text-[#4F46E5] hover:underline cursor-pointer">{t('signup.acceptTerms.privacyLink')}</span>
                    </Link>
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-11 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-md shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? t('common:status.loading') : t('signup.createAccountButton')}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2">
        <Link href="/login">
          <span className="text-sm text-[#374151] hover:underline cursor-pointer">{t('signup.hasAccount')} {t('signup.signIn')}</span>
        </Link>
      </div>
    </div>
  );
}