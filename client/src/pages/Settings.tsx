import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getAuthHeaders } from "@/lib/queryClient";
import { supabasePromise } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Header from "@/components/Header";
import LanguageSelector from "@/components/LanguageSelector";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  User, Camera, Save, Shield, Trash2, CheckCircle2, AlertCircle,
  Loader2, Crown, Zap, Globe, CreditCard, ArrowUpRight, XCircle,
  Star, Package, Lock, Eye, EyeOff, Bell, Moon, Sun, ExternalLink
} from "lucide-react";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import OneDriveLogo from "@/components/OneDriveLogo";
import BoxLogo from "@/components/BoxLogo";
import S3Logo from "@/components/S3Logo";

const settingsSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

const PLAN_DETAILS = {
  free:     { label: "Free",     color: "bg-gray-100 text-gray-700",     icon: Package,  monthlyUSD: 0 },
  pro:      { label: "Pro",      color: "bg-blue-100 text-blue-700",     icon: Zap,      monthlyUSD: 7.99 },
  business: { label: "Business", color: "bg-violet-100 text-violet-700", icon: Crown,    monthlyUSD: 19.99 },
} as const;

const PRICE_ID_TO_PLAN: Record<string, "pro" | "business"> = {
  price_1Tk1ozGMtCDZ5sKadebYpBII: "pro",
  price_1Tk1viGMtCDZ5sKaWGPYSJfA: "business",
};
const PLAN_FEATURE_COUNT: Record<"pro" | "business", number> = { pro: 10, business: 10 };

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("tera-theme") === "dark" ||
      (!localStorage.getItem("tera-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tera-theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}

function useNotifications() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("tera-email-notif");
    return v === null ? true : v === "true";
  });

  const toggle = () => setEnabled(prev => {
    const next = !prev;
    localStorage.setItem("tera-email-notif", String(next));
    return next;
  });

  return { enabled, toggle };
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { dark, toggle: toggleDark } = useTheme();
  const { enabled: notifEnabled, toggle: toggleNotif } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [welcomePlan, setWelcomePlan] = useState<"pro" | "business" | null>(null);
  const pendingPlanRef = useRef<"pro" | "business" | null>(null);

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState("");

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user?.id]);

  // Returning from Stripe checkout: confirm the new plan and show the welcome dialog.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("session_id")) return;
    window.history.replaceState({}, "", window.location.pathname);

    const expectedPlan = sessionStorage.getItem("tera_pending_plan") as "pro" | "business" | null;
    sessionStorage.removeItem("tera_pending_plan");
    if (!expectedPlan) return;
    pendingPlanRef.current = expectedPlan;

    let attempts = 0;
    const poll = () => {
      attempts++;
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (attempts < 6 && pendingPlanRef.current) setTimeout(poll, 1500);
    };
    poll();
  }, []);

  useEffect(() => {
    if (pendingPlanRef.current && user?.membershipPlan === pendingPlanRef.current) {
      setWelcomePlan(pendingPlanRef.current);
      pendingPlanRef.current = null;
    }
  }, [user?.membershipPlan]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: SettingsFormData) =>
      apiRequest("PATCH", "/api/user/update", data),
    onSuccess: async (res) => {
      const data = await res.json();
      if (data?.requiresEmailVerification) {
        setPendingEmail(data.pendingEmail);
        setIsEditing(false);
        toast({ title: t("settingsPage.personal.verifyPending"), description: `${t("settingsPage.personal.verifyDesc")} ${data.pendingEmail}` });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setIsEditing(false);
      }
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) =>
      apiRequest("POST", "/api/user/verify-email-change", { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setPendingEmail(null);
      setOtpCode("");
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/stripe/cancel-subscription", {}),
    onSuccess: () => {
      setCancelConfirm(false);
      toast({ title: t("settingsPage.plan.cancelLink") });
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const handleCheckout = async (priceId: string) => {
    try {
      setCheckoutLoading(priceId);
      if (PRICE_ID_TO_PLAN[priceId]) {
        sessionStorage.setItem("tera_pending_plan", PRICE_ID_TO_PLAN[priceId]);
      }
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ priceId }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleCancel = () => {
    form.reset({ firstName: user?.firstName || "", lastName: user?.lastName || "", email: user?.email || "" });
    setIsEditing(false);
  };

  const handleCancelEmailChange = () => {
    setPendingEmail(null);
    setOtpCode("");
    form.setValue("email", user?.email || "");
  };

  const handlePasswordChange = async () => {
    setPwError("");
    if (newPw.length < 8) { setPwError(t("settingsPage.password.minLength")); return; }
    if (newPw !== confirmPw) { setPwError(t("settingsPage.password.mismatch")); return; }

    setPwChanging(true);
    try {
      const supabase = await supabasePromise;
      if (!supabase) throw new Error("Auth not configured");

      // Re-authenticate with current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPw,
      });
      if (signInError) { setPwError(t("settingsPage.password.wrongCurrent")); return; }

      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;

      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast({ title: t("settingsPage.password.successMsg") });
    } catch (e: any) {
      if (!pwError) toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setPwChanging(false);
    }
  };

  const plan = (user?.membershipPlan as keyof typeof PLAN_DETAILS) || "free";
  const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
  const PlanIcon = planInfo.icon;
  const WelcomePlanIcon = welcomePlan ? PLAN_DETAILS[welcomePlan].icon : Package;

  const allServices = [
    { logo: <GoogleDriveLogo className="w-5 h-5" />, name: "Google Drive", connected: user?.googleConnected, href: "/integrations" },
    { logo: <DropboxLogo className="w-5 h-5" />, name: "Dropbox", connected: user?.dropboxConnected, href: "/integrations" },
    { logo: <OneDriveLogo className="w-5 h-5" />, name: "OneDrive", connected: user?.onedriveConnected, href: "/integrations" },
    { logo: <BoxLogo className="w-5 h-5" />, name: "Box", connected: user?.boxConnected, href: "/integrations" },
    { logo: <S3Logo className="w-5 h-5" />, name: "Amazon S3", connected: user?.s3Connected, href: "/integrations" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">{t("profilePage.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-4xl pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{t("settingsPage.title")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("settingsPage.subtitle")}</p>
          </div>
          <Badge className={`${planInfo.color} font-bold px-3 py-1.5 flex items-center gap-1.5`}>
            <PlanIcon className="w-3.5 h-3.5" />
            Plan {planInfo.label}
          </Badge>
        </div>

        <div className="space-y-5">

          {/* ── Información Personal ── */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <User className="h-4 w-4 text-blue-600" />
                {t("settingsPage.personal.title")}
              </CardTitle>
              <CardDescription>{t("settingsPage.personal.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-blue-100">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-lg font-black">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "—"}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <Button variant="outline" size="sm" disabled className="mt-2 h-7 text-xs">
                    <Camera className="h-3 w-3 mr-1.5" />
                    {t("settingsPage.personal.changePic")}
                  </Button>
                </div>
              </div>

              <Separator />

              {pendingEmail && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">{t("settingsPage.personal.verifyPending")}</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {t("settingsPage.personal.verifyDesc")} <strong>{pendingEmail}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-lg tracking-[0.4em] font-mono"
                        onKeyDown={(e) => e.key === "Enter" && otpCode.length === 6 && verifyEmailMutation.mutate(otpCode)}
                      />
                    </div>
                    <Button
                      onClick={() => verifyEmailMutation.mutate(otpCode)}
                      disabled={otpCode.length !== 6 || verifyEmailMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      size="sm"
                    >
                      {verifyEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      <span className="ml-1.5">{t("settingsPage.personal.confirmBtn")}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEmailChange}>{t("settingsPage.personal.cancelBtn")}</Button>
                  </div>
                  <p className="text-xs text-amber-600">{t("settingsPage.personal.verifyExpiry")}</p>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => updateUserMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t("settingsPage.personal.firstName")}</FormLabel>
                        <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t("settingsPage.personal.lastName")}</FormLabel>
                        <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        {t("settingsPage.personal.email")}
                        {isEditing && <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full normal-case tracking-normal">{t("settingsPage.personal.emailVerifyNote")}</span>}
                      </FormLabel>
                      <FormControl><Input {...field} type="email" disabled={!isEditing || !!pendingEmail} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-2 pt-1">
                    {!isEditing ? (
                      <Button type="button" onClick={() => setIsEditing(true)} size="sm">
                        <User className="h-3.5 w-3.5 mr-1.5" />{t("settingsPage.personal.editBtn")}
                      </Button>
                    ) : (
                      <>
                        <Button type="submit" disabled={updateUserMutation.isPending} size="sm">
                          {updateUserMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                          {updateUserMutation.isPending ? t("settingsPage.personal.savingBtn") : t("settingsPage.personal.saveBtn")}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={handleCancel}>{t("settingsPage.personal.cancelBtn")}</Button>
                      </>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* ── Contraseña y Seguridad ── */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <Lock className="h-4 w-4 text-blue-600" />
                {t("settingsPage.password.title")}
              </CardTitle>
              <CardDescription>{t("settingsPage.password.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                    {t("settingsPage.password.currentLabel")}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                      {t("settingsPage.password.newLabel")}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                      {t("settingsPage.password.confirmLabel")}
                    </Label>
                    <Input
                      type="password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      autoComplete="new-password"
                      className={confirmPw && newPw !== confirmPw ? "border-red-300" : ""}
                    />
                  </div>
                </div>
              </div>

              {pwError && (
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {pwError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={handlePasswordChange}
                  disabled={!currentPw || !newPw || !confirmPw || pwChanging}
                >
                  {pwChanging ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Lock className="h-3.5 w-3.5 mr-1.5" />}
                  {pwChanging ? t("settingsPage.password.changingBtn") : t("settingsPage.password.changeBtn")}
                </Button>
                <p className="text-xs text-gray-400">{t("settingsPage.password.minLength")}</p>
              </div>
            </CardContent>
          </Card>

          {/* ── Plan y Facturación ── */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <CreditCard className="h-4 w-4 text-blue-600" />
                {t("settingsPage.plan.title")}
              </CardTitle>
              <CardDescription>{t("settingsPage.plan.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`rounded-xl p-4 flex items-center justify-between ${
                plan === "business" ? "bg-gradient-to-r from-violet-50 to-violet-100 border border-violet-200"
                : plan === "pro"  ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
                : "bg-gray-50 border border-gray-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan === "business" ? "bg-violet-600" : plan === "pro" ? "bg-blue-600" : "bg-gray-400"
                  }`}>
                    <PlanIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900">Plan {planInfo.label}</p>
                    <p className="text-xs text-gray-500">
                      {plan === "free" ? t("settingsPage.plan.freeLabel")
                      : plan === "pro" ? t("settingsPage.plan.proPrice")
                      : t("settingsPage.plan.businessPrice")}
                    </p>
                  </div>
                </div>
                {plan !== "free" && (
                  <Badge className="bg-green-100 text-green-700 border-0 font-semibold">{t("settingsPage.plan.active")}</Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t("settingsPage.plan.trafficLabel"), value: plan === "free" ? "5 GB" : plan === "pro" ? "200 GB" : "2 TB" },
                  { label: t("settingsPage.plan.transfersLabel"), value: plan === "free" ? "20" : plan === "pro" ? "300" : "∞" },
                  { label: t("settingsPage.plan.maxFileLabel"), value: plan === "free" ? "100 MB" : plan === "pro" ? "5 GB" : "50 GB" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-sm font-black text-gray-900">{value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {plan === "free" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("settingsPage.plan.upgradeTitle")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCheckout("price_1Tk1ozGMtCDZ5sKadebYpBII")}
                      disabled={!!checkoutLoading}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all group text-left"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="font-black text-blue-900 text-sm">Pro</span>
                        </div>
                        <p className="text-[11px] text-blue-600 mt-0.5">{t("settingsPage.plan.proSub")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-900">$7.99</p>
                        <p className="text-[11px] text-blue-500">{t("settingsPage.plan.perMonth")}</p>
                        {checkoutLoading === "price_1Tk1ozGMtCDZ5sKadebYpBII"
                          ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 mt-1 ml-auto" />
                          : <ArrowUpRight className="w-4 h-4 text-blue-400 mt-1 ml-auto group-hover:text-blue-600 transition-colors" />
                        }
                      </div>
                    </button>
                    <button
                      onClick={() => handleCheckout("price_1Tk1viGMtCDZ5sKaWGPYSJfA")}
                      disabled={!!checkoutLoading}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 hover:border-violet-400 transition-all group text-left"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-violet-600" />
                          <span className="font-black text-violet-900 text-sm">Business</span>
                        </div>
                        <p className="text-[11px] text-violet-600 mt-0.5">{t("settingsPage.plan.businessSub")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-violet-900">$19.99</p>
                        <p className="text-[11px] text-violet-500">{t("settingsPage.plan.perMonth")}</p>
                        {checkoutLoading === "price_1Tk1viGMtCDZ5sKaWGPYSJfA"
                          ? <Loader2 className="w-4 h-4 animate-spin text-violet-600 mt-1 ml-auto" />
                          : <ArrowUpRight className="w-4 h-4 text-violet-400 mt-1 ml-auto group-hover:text-violet-600 transition-colors" />
                        }
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {plan === "pro" && (
                <button
                  onClick={() => handleCheckout("price_1Tk1viGMtCDZ5sKaWGPYSJfA")}
                  disabled={!!checkoutLoading}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 transition-all group text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-violet-600" />
                      <span className="font-black text-violet-900 text-sm">{t("settingsPage.plan.upgradeToBusinessBtn")}</span>
                    </div>
                    <p className="text-[11px] text-violet-600 mt-0.5">{t("settingsPage.plan.upgradeToBusinessSub")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-violet-900">$19.99{t("settingsPage.plan.perMonth")}</p>
                    {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin ml-auto mt-1" /> : <ArrowUpRight className="w-4 h-4 text-violet-400 ml-auto mt-1" />}
                  </div>
                </button>
              )}

              <div className="flex items-center justify-between pt-1">
                <Link href="/pricing" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3" /> {t("settingsPage.plan.viewPlans")}
                </Link>
                {plan !== "free" && !cancelConfirm && (
                  <button onClick={() => setCancelConfirm(true)} className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
                    {t("settingsPage.plan.cancelLink")}
                  </button>
                )}
              </div>

              {cancelConfirm && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">{t("settingsPage.plan.cancelTitle")}</p>
                      <p className="text-xs text-red-600 mt-0.5">{t("settingsPage.plan.cancelDesc")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => cancelSubscriptionMutation.mutate()} disabled={cancelSubscriptionMutation.isPending}>
                      {cancelSubscriptionMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                      {t("settingsPage.plan.cancelConfirmBtn")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCancelConfirm(false)}>
                      {t("settingsPage.plan.keepPlanBtn")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Preferencias ── */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <Globe className="h-4 w-4 text-blue-600" />
                {t("settingsPage.preferences.title")}
              </CardTitle>
              <CardDescription>{t("settingsPage.preferences.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Idioma */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t("settingsPage.preferences.languageLabel")}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t("settingsPage.preferences.languageSub")}</p>
                </div>
                <LanguageSelector />
              </div>

              {/* Notificaciones */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t("settingsPage.preferences.notificationsLabel")}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t("settingsPage.preferences.notificationsSub")}</p>
                  </div>
                </div>
                <Switch checked={notifEnabled} onCheckedChange={toggleNotif} />
              </div>

              {/* Modo oscuro */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    {dark ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t("settingsPage.preferences.darkModeLabel")}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t("settingsPage.preferences.darkModeSub")}</p>
                  </div>
                </div>
                <Switch checked={dark} onCheckedChange={toggleDark} />
              </div>
            </CardContent>
          </Card>

          {/* ── Cuenta ── */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <Shield className="h-4 w-4 text-blue-600" />
                {t("settingsPage.account.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("settingsPage.account.userId")}</Label>
                  <p className="text-xs text-gray-600 font-mono bg-gray-50 border border-gray-100 p-2 rounded-lg mt-1 truncate">{user.id}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("settingsPage.account.memberSince")}</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("settingsPage.account.servicesTitle")}</p>
                  <Link href="/integrations" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {t("settingsPage.account.manageLink")}
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {allServices.map(({ logo, name, connected }) => (
                    <div key={name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center">{logo}</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{name}</p>
                          <p className="text-xs text-gray-400">{connected ? t("settingsPage.account.connected") : t("settingsPage.account.notConnected")}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-300"}`} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Zona Peligrosa ── */}
          <Card className="border-red-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-black text-red-600">
                <Trash2 className="h-4 w-4" />
                {t("settingsPage.danger.title")}
              </CardTitle>
              <CardDescription>{t("settingsPage.danger.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t("settingsPage.danger.deleteLabel")}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t("settingsPage.danger.deleteSub")}</p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  {t("settingsPage.danger.deleteBtn")}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog open={!!welcomePlan} onOpenChange={(open) => !open && setWelcomePlan(null)}>
        <DialogContent className="sm:max-w-md">
          {welcomePlan && (
            <>
              <DialogHeader>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${
                  welcomePlan === "business" ? "bg-violet-600" : "bg-blue-600"
                }`}>
                  <WelcomePlanIcon className="w-6 h-6 text-white" />
                </div>
                <DialogTitle className="text-xl font-black">
                  {t("settingsPage.plan.welcomeTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("settingsPage.plan.welcomeDesc", { plan: PLAN_DETAILS[welcomePlan].label })}
                </DialogDescription>
              </DialogHeader>
              <ul className="space-y-2 py-2">
                {Array.from({ length: PLAN_FEATURE_COUNT[welcomePlan] }, (_, i) => i + 1).map((n) => (
                  <li key={n} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {t(`pricingPage.plans.${welcomePlan}.f${n}`)}
                  </li>
                ))}
              </ul>
              <Button onClick={() => setWelcomePlan(null)} className="w-full">
                {t("settingsPage.plan.welcomeCta")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
