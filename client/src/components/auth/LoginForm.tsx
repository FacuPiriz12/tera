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
    <div className="w-full space-y-6">
      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-11 border-[#E5E7EB] text-[#374151] hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"
        onClick={onReplitLogin}
      >
        <SiGoogle className="w-4 h-4 text-[#EA4335]" />
        Sign in with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E5E7EB]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-[#9CA3AF]">or</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-[#374151]">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="name@company.com"
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
                <FormLabel className="text-sm font-medium text-[#374151]">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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

          <Button 
            type="submit" 
            className="w-full h-11 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-md shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Log In"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center justify-between pt-2">
        <Link href="/signup">
          <span className="text-sm text-[#374151] hover:underline cursor-pointer">Don't have an account?</span>
        </Link>
        <button type="button" className="text-sm text-[#374151] hover:underline">
          Forgot Password?
        </button>
      </div>
    </div>
  );
}
