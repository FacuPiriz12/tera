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
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signupSchema = z.object({
    name: z.string().min(2, { message: t('landing.auth.validation.nameRequired') }),
    email: z.string().email({ message: t('landing.auth.validation.invalidEmail') }),
    password: z.string().min(6, { message: t('landing.auth.validation.passwordTooShort') }),
    confirmPassword: z.string().min(6, { message: t('landing.auth.validation.passwordTooShort') }),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: t('landing.auth.validation.acceptTermsRequired')
    })
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('landing.auth.validation.passwordsDoNotMatch'),
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
          title: t('landing.errors.signupFailed'),
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('landing.auth.signup.success'),
        description: t('landing.auth.signup.checkEmail')
      });
      
      setTimeout(() => {
        setLocation('/signup/success');
      }, 1500);
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: t('landing.errors.signupFailed'),
        description: t('landing.errors.tryAgain'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-[#374151]">{t('landing.auth.signup.nameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('landing.auth.signup.namePlaceholder')}
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
                <FormLabel className="text-sm font-medium text-[#374151]">{t('landing.auth.signup.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('landing.auth.signup.emailPlaceholder')}
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
                <FormLabel className="text-sm font-medium text-[#374151]">{t('landing.auth.signup.passwordLabel')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder={t('landing.auth.signup.passwordPlaceholder')}
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
                <FormLabel className="text-sm font-medium text-[#374151]">{t('landing.auth.signup.confirmPasswordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={t('landing.auth.signup.confirmPasswordPlaceholder')}
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
                    {t('landing.auth.signup.acceptTerms.part1')}{' '}
                    <Link href="/terms">
                      <span className="text-[#4F46E5] hover:underline cursor-pointer">{t('landing.auth.signup.acceptTerms.termsLink')}</span>
                    </Link>{' '}
                    {t('landing.auth.signup.acceptTerms.and')}{' '}
                    <Link href="/privacy">
                      <span className="text-[#4F46E5] hover:underline cursor-pointer">{t('landing.auth.signup.acceptTerms.privacyLink')}</span>
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
            {isLoading ? t('common.status.loading') : t('landing.auth.signup.createAccountButton')}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2">
        <Link href="/login">
          <span className="text-sm text-[#374151] hover:underline cursor-pointer">{t('landing.auth.signup.hasAccount')} {t('landing.auth.signup.signIn')}</span>
        </Link>
      </div>
    </div>
  );
}