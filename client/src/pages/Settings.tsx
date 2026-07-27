import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import Sidebar from "@/components/Sidebar";
import LanguageSelector from "@/components/LanguageSelector";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  User, Save, Shield, Trash2, CheckCircle2, AlertCircle,
  Loader2, Crown, Zap, Globe, Star, Package, Lock, Eye, EyeOff,
  Bell, Moon, ExternalLink, Pencil, X, Network, ChevronRight,
  Mail, Calendar,
} from "lucide-react";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import OneDriveLogo from "@/components/OneDriveLogo";
import BoxLogo from "@/components/BoxLogo";
import S3Logo from "@/components/S3Logo";

const settingsSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  email:     z.string().email(),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

const PLAN_DETAILS = {
  free:     { label: "Free",     icon: Package, color: "text-gray-500",   badge: "bg-gray-100 text-gray-700",       bg: "bg-gray-100",   gradient: "from-gray-50 to-gray-100",     price: "Gratis"    },
  pro:      { label: "Pro",      icon: Zap,     color: "text-blue-600",   badge: "bg-blue-100 text-blue-700",       bg: "bg-blue-100",   gradient: "from-blue-50 to-indigo-100",   price: "$7.99/mo"  },
  business: { label: "Business", icon: Crown,   color: "text-violet-600", badge: "bg-violet-100 text-violet-700",   bg: "bg-violet-100", gradient: "from-violet-50 to-purple-100", price: "$19.99/mo" },
} as const;

const PRICE_TO_PLAN: Record<string, "pro" | "business"> = {
  price_1Tk1ozGMtCDZ5sKadebYpBII: "pro",
  price_1Tk1viGMtCDZ5sKaWGPYSJfA: "business",
};
const PLAN_FEATURES: Record<"pro" | "business", number> = { pro: 10, business: 10 };

function useNotifications() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("tera-email-notif");
    return v === null ? true : v === "true";
  });
  const toggle = () =>
    setEnabled(prev => {
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
  const { enabled: notifEnabled, toggle: toggleNotif } = useNotifications();

  const [isEditing, setIsEditing]         = useState(false);
  const [pendingEmail, setPendingEmail]   = useState<string | null>(null);
  const [otpCode, setOtpCode]             = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [welcomePlan, setWelcomePlan]     = useState<"pro" | "business" | null>(null);
  const pendingPlanRef                    = useRef<"pro" | "business" | null>(null);

  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwChanging, setPwChanging]   = useState(false);
  const [pwError, setPwError]         = useState("");

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  useEffect(() => {
    if (user) form.reset({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "" });
  }, [user?.id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("session_id")) return;
    window.history.replaceState({}, "", window.location.pathname);
    const expectedPlan = sessionStorage.getItem("tera_pending_plan") as "pro" | "business" | null;
    sessionStorage.removeItem("tera_pending_plan");
    if (!expectedPlan) return;
    pendingPlanRef.current = expectedPlan;
    let attempts = 0;
    const poll = () => { attempts++; queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); if (attempts < 6 && pendingPlanRef.current) setTimeout(poll, 1500); };
    poll();
  }, []);

  useEffect(() => {
    if (pendingPlanRef.current && user?.membershipPlan === pendingPlanRef.current) {
      setWelcomePlan(pendingPlanRef.current);
      pendingPlanRef.current = null;
    }
  }, [user?.membershipPlan]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => apiRequest("PATCH", "/api/user/update", data),
    onSuccess: async (res) => {
      const data = await res.json();
      if (data?.requiresEmailVerification) {
        setPendingEmail(data.pendingEmail);
        setIsEditing(false);
        toast({ title: t("settingsPage.personal.verifyPending"), description: `${t("settingsPage.personal.verifyDesc")} ${data.pendingEmail}` });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setIsEditing(false);
        toast({ title: "Información actualizada correctamente" });
      }
    },
    onError: (err: any) => {
      const msg = err?.message?.includes("409") ? "El email ya está en uso"
        : err?.message?.includes("404") ? "Usuario no encontrado"
        : "Error al guardar los cambios";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) => apiRequest("POST", "/api/user/verify-email-change", { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setPendingEmail(null); setOtpCode("");
      toast({ title: "Email actualizado correctamente" });
    },
    onError: () => toast({ title: "Código inválido o expirado", variant: "destructive" }),
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/stripe/cancel-subscription", {}),
    onSuccess: () => { setCancelConfirm(false); toast({ title: t("settingsPage.plan.cancelLink") }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const handleCheckout = async (priceId: string) => {
    try {
      setCheckoutLoading(priceId);
      if (PRICE_TO_PLAN[priceId]) sessionStorage.setItem("tera_pending_plan", PRICE_TO_PLAN[priceId]);
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ priceId }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch { toast({ title: "Error al iniciar el checkout", variant: "destructive" }); }
    finally { setCheckoutLoading(null); }
  };

  const handlePasswordChange = async () => {
    setPwError("");
    if (!currentPw || !newPw || !confirmPw) { setPwError("Completá todos los campos para cambiar la contraseña"); return; }
    if (newPw.length < 8) { setPwError(t("settingsPage.password.minLength")); return; }
    if (newPw !== confirmPw) { setPwError(t("settingsPage.password.mismatch")); return; }
    setPwChanging(true);
    try {
      const supabase = await supabasePromise;
      if (!supabase) throw new Error("Auth not configured");
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user!.email!, password: currentPw });
      if (signInErr) { setPwError(t("settingsPage.password.wrongCurrent")); return; }
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast({ title: t("settingsPage.password.successMsg") });
    } catch (e: any) { if (!pwError) toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setPwChanging(false); }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </div>
    </div>
  );

  const isAdmin    = user.role === "admin";
  const plan       = (user.membershipPlan as keyof typeof PLAN_DETAILS) || "free";
  const planInfo   = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
  const PlanIcon   = planInfo.icon;
  const WelcomePlanIcon = welcomePlan ? PLAN_DETAILS[welcomePlan].icon : Package;

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email?.split("@")[0] || "—";

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const allServices = [
    { logo: <GoogleDriveLogo className="w-4 h-4" />, name: "Google Drive", connected: user.googleConnected },
    { logo: <DropboxLogo className="w-4 h-4" />,     name: "Dropbox",      connected: user.dropboxConnected },
    { logo: <OneDriveLogo className="w-4 h-4" />,    name: "OneDrive",     connected: user.onedriveConnected },
    { logo: <BoxLogo className="w-4 h-4" />,          name: "Box",          connected: user.boxConnected },
    { logo: <S3Logo className="w-4 h-4" />,           name: "Amazon S3",    connected: user.s3Connected },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col pl-0 sm:pl-20">
      <Header />
      <Sidebar />

      <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl w-full mx-auto">

        {/* ── Hero Card — same structure as Profile ── */}
        <Card className="border-0 shadow-sm overflow-hidden mb-5">
          <div className="relative h-32 bg-gradient-to-r from-[#0061D5] via-[#1a73e8] to-[#004EB0]">
            <div className="absolute top-4 right-12 w-20 h-20 rounded-full bg-white/5" />
            <div className="absolute -top-4 right-32 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 left-6">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-blue-700 text-white text-2xl font-black">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardContent className="pt-12 pb-5 px-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-gray-900 leading-tight">{displayName}</h1>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      <Star className="w-2.5 h-2.5" /> Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span>{user.email}</span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>Miembro desde {formatDate(user.createdAt)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin ? (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 font-bold px-3 py-1 flex items-center gap-1.5 shadow-sm">
                    <Shield className="w-3 h-3" /> Admin
                  </Badge>
                ) : (
                  <Badge className={`${planInfo.badge} font-bold px-3 py-1 flex items-center gap-1.5 border-0`}>
                    <PlanIcon className="w-3 h-3" />
                    {planInfo.label}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Personal Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-black">
                      <User className="h-4 w-4 text-blue-600" />
                      {t("settingsPage.personal.title")}
                    </CardTitle>
                    <CardDescription>{t("settingsPage.personal.description")}</CardDescription>
                  </div>
                  {!isEditing && !pendingEmail && (
                    <Button type="button" variant="outline" size="sm"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 flex-shrink-0"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                      {t("settingsPage.personal.editBtn")}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Pending email verification */}
                {pendingEmail && (
                  <div className="border-t border-b border-amber-100 bg-amber-50 px-5 py-4 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-amber-800">{t("settingsPage.personal.verifyPending")}</p>
                        <p className="text-xs text-amber-600 mt-0.5">{t("settingsPage.personal.verifyDesc")} <strong>{pendingEmail}</strong></p>
                      </div>
                      <div className="flex gap-2 items-end flex-wrap">
                        <Input
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000" maxLength={6}
                          className="text-center text-lg tracking-[0.4em] font-mono max-w-[140px]"
                          onKeyDown={e => e.key === "Enter" && otpCode.length === 6 && verifyEmailMutation.mutate(otpCode)}
                        />
                        <Button onClick={() => verifyEmailMutation.mutate(otpCode)} disabled={otpCode.length !== 6 || verifyEmailMutation.isPending} className="bg-amber-600 hover:bg-amber-700" size="sm">
                          {verifyEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          <span className="ml-1.5">{t("settingsPage.personal.confirmBtn")}</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setPendingEmail(null); setOtpCode(""); form.setValue("email", user.email || ""); }}>
                          {t("settingsPage.personal.cancelBtn")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(d => updateUserMutation.mutate(d))} className="px-5 pb-5 pt-2 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("settingsPage.personal.firstName")}</FormLabel>
                            <FormControl><Input {...field} autoFocus className="bg-white" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("settingsPage.personal.lastName")}</FormLabel>
                            <FormControl><Input {...field} className="bg-white" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            {t("settingsPage.personal.email")}
                            <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full normal-case">{t("settingsPage.personal.emailVerifyNote")}</span>
                          </FormLabel>
                          <FormControl><Input {...field} type="email" disabled={!!pendingEmail} className="bg-white" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={updateUserMutation.isPending} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          {updateUserMutation.isPending
                            ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{t("settingsPage.personal.savingBtn")}</>
                            : <><Save className="h-3.5 w-3.5 mr-1.5" />{t("settingsPage.personal.saveBtn")}</>}
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={updateUserMutation.isPending}
                          onClick={() => { form.reset({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "" }); setIsEditing(false); }}
                        >
                          <X className="h-3.5 w-3.5 mr-1.5" />{t("settingsPage.personal.cancelBtn")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="grid grid-cols-2 gap-3 p-5">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("settingsPage.personal.firstName")}</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.firstName || "—"}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("settingsPage.personal.lastName")}</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.lastName || "—"}</p>
                    </div>
                    <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("settingsPage.personal.email")}</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.email || "—"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password & Security */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  {t("settingsPage.password.title")}
                </CardTitle>
                <CardDescription>{t("settingsPage.password.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t("settingsPage.password.currentLabel")}</Label>
                  <div className="relative">
                    <Input type={showCurrent ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password" className="bg-white pr-10" />
                    <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t("settingsPage.password.newLabel")}</Label>
                    <div className="relative">
                      <Input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" className="bg-white pr-10" />
                      <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t("settingsPage.password.confirmLabel")}</Label>
                    <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password"
                      className={`bg-white ${confirmPw && newPw !== confirmPw ? "border-red-300" : ""}`}
                    />
                  </div>
                </div>
                {pwError && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />{pwError}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={handlePasswordChange} disabled={pwChanging} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {pwChanging ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Lock className="h-3.5 w-3.5 mr-1.5" />}
                    {pwChanging ? t("settingsPage.password.changingBtn") : t("settingsPage.password.changeBtn")}
                  </Button>
                  <span className="text-xs text-gray-400">{t("settingsPage.password.minLength")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <Globe className="h-4 w-4 text-amber-500" />
                  {t("settingsPage.preferences.title")}
                </CardTitle>
                <CardDescription>{t("settingsPage.preferences.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Language */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t("settingsPage.preferences.languageLabel")}</p>
                      <p className="text-xs text-gray-400">{t("settingsPage.preferences.languageSub")}</p>
                    </div>
                  </div>
                  <LanguageSelector />
                </div>

                {/* Email notifications */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t("settingsPage.preferences.notificationsLabel")}</p>
                      <p className="text-xs text-gray-400">{t("settingsPage.preferences.notificationsSub")}</p>
                    </div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={notifEnabled}
                    onClick={() => {
                      toggleNotif();
                      toast({ title: !notifEnabled ? "Notificaciones activadas" : "Notificaciones desactivadas", description: "Se aplica en las próximas transferencias." });
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${notifEnabled ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${notifEnabled ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Dark mode */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 opacity-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                      <Moon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t("settingsPage.preferences.darkModeLabel")}</p>
                      <p className="text-xs text-gray-400">{t("settingsPage.preferences.darkModeSub")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Próximamente</span>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-not-allowed">
                      <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow-md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Plan card */}
            {!isAdmin ? (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-black">
                    <PlanIcon className="h-4 w-4 text-blue-600" />
                    {t("settingsPage.plan.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Current plan */}
                  <div className={`rounded-xl p-3 bg-gradient-to-br ${planInfo.gradient}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${planInfo.bg} flex items-center justify-center flex-shrink-0`}>
                        <PlanIcon className={`w-5 h-5 ${planInfo.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-black text-gray-900">Plan {planInfo.label}</p>
                          {plan !== "free" && <Badge className="bg-green-100 text-green-700 border-0 text-[10px] font-bold">Activo</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">{planInfo.price}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: t("settingsPage.plan.trafficLabel"),   value: plan === "free" ? "5 GB"   : plan === "pro" ? "200 GB" : "2 TB"   },
                        { label: t("settingsPage.plan.transfersLabel"), value: plan === "free" ? "20/día" : plan === "pro" ? "300/día": "∞"       },
                        { label: t("settingsPage.plan.maxFileLabel"),   value: plan === "free" ? "100 MB" : plan === "pro" ? "5 GB"   : "50 GB"  },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between bg-white/60 rounded-lg px-2.5 py-1.5">
                          <span className="text-[11px] text-gray-500">{label}</span>
                          <span className="text-[11px] font-black text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upgrade to Pro or Business */}
                  {plan === "free" && (
                    <div className="space-y-2">
                      {[
                        { priceId: "price_1Tk1ozGMtCDZ5sKadebYpBII", name: "Pro",      Icon: Zap,   color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200 hover:border-blue-400",     gradient: "from-blue-600 to-indigo-600"   },
                        { priceId: "price_1Tk1viGMtCDZ5sKaWGPYSJfA", name: "Business", Icon: Crown, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200 hover:border-violet-400", gradient: "from-violet-600 to-purple-600" },
                      ].map(({ priceId, name, Icon, color, bg, border, gradient }) => (
                        <button key={priceId} onClick={() => handleCheckout(priceId)} disabled={!!checkoutLoading}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border ${border} ${bg} hover:shadow-sm transition-all text-left`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <span className={`text-sm font-black ${color}`}>Elegir {name}</span>
                          </div>
                          {checkoutLoading === priceId
                            ? <Loader2 className={`w-3.5 h-3.5 animate-spin ${color}`} />
                            : <ChevronRight className={`w-3.5 h-3.5 ${color}`} />}
                        </button>
                      ))}
                    </div>
                  )}

                  {plan === "pro" && (
                    <button onClick={() => handleCheckout("price_1Tk1viGMtCDZ5sKaWGPYSJfA")} disabled={!!checkoutLoading}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-violet-200 hover:border-violet-400 bg-violet-50 hover:shadow-sm transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-black text-violet-700">{t("settingsPage.plan.upgradeToBusinessBtn")}</span>
                      </div>
                      {checkoutLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-700" /> : <ChevronRight className="w-3.5 h-3.5 text-violet-700" />}
                    </button>
                  )}

                  <Link href="/pricing" className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold py-0.5">
                    <Star className="w-3 h-3" />{t("settingsPage.plan.viewPlans")}
                  </Link>

                  {plan !== "free" && !cancelConfirm && (
                    <div className="text-center">
                      <button onClick={() => setCancelConfirm(true)} className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
                        {t("settingsPage.plan.cancelLink")}
                      </button>
                    </div>
                  )}
                  {cancelConfirm && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
                      <p className="text-xs font-semibold text-red-800">{t("settingsPage.plan.cancelTitle")}</p>
                      <p className="text-xs text-red-600">{t("settingsPage.plan.cancelDesc")}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => cancelSubscriptionMutation.mutate()} disabled={cancelSubscriptionMutation.isPending} className="text-xs h-7">
                          {cancelSubscriptionMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {t("settingsPage.plan.cancelConfirmBtn")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setCancelConfirm(false)} className="text-xs h-7">
                          {t("settingsPage.plan.keepPlanBtn")}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Admin plan card */
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="rounded-xl p-4 text-center bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-black text-gray-900">Admin</p>
                    <p className="text-xs text-amber-700 mt-0.5">Acceso completo a la plataforma</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connected services */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <Network className="h-4 w-4 text-blue-600" />
                  {t("settingsPage.account.servicesTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {allServices.map(({ logo, name, connected }) => (
                  <div key={name} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center shadow-sm">{logo}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{name}</p>
                        <p className={`text-xs ${connected ? "text-green-500" : "text-gray-400"}`}>
                          {connected ? t("settingsPage.account.connected") : t("settingsPage.account.notConnected")}
                        </p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-200"}`} />
                  </div>
                ))}
                <Link href="/integrations" className="flex items-center justify-center gap-1.5 pt-1 text-xs text-blue-600 hover:underline font-semibold">
                  <ExternalLink className="w-3 h-3" />{t("settingsPage.account.manageLink")}
                </Link>
              </CardContent>
            </Card>

            {/* Account info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <Shield className="h-4 w-4 text-blue-600" />
                  {t("settingsPage.account.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Estado</span>
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs font-semibold">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                    Activo
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Rol</span>
                  <span className="text-xs font-semibold text-gray-700">{isAdmin ? "Administrador" : "Usuario"}</span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t("settingsPage.account.memberSince")}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 block mb-1">{t("settingsPage.account.userId")}</span>
                  <p className="text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-100 rounded p-1.5 truncate">{user.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-black text-red-600">
                  <Trash2 className="h-4 w-4" />
                  {t("settingsPage.danger.title")}
                </CardTitle>
                <CardDescription>{t("settingsPage.danger.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-xl border border-dashed border-red-200 bg-red-50/50 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t("settingsPage.danger.deleteLabel")}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t("settingsPage.danger.deleteSub")}</p>
                  </div>
                  <Button variant="destructive" size="sm" disabled className="flex-shrink-0 text-xs">
                    <Trash2 className="h-3 w-3 mr-1" />
                    {t("settingsPage.danger.deleteBtn")}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* Welcome plan dialog */}
      <Dialog open={!!welcomePlan} onOpenChange={open => !open && setWelcomePlan(null)}>
        <DialogContent className="sm:max-w-md">
          {welcomePlan && (
            <>
              <DialogHeader>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${welcomePlan === "business" ? "bg-violet-600" : "bg-blue-600"}`}>
                  <WelcomePlanIcon className="w-6 h-6 text-white" />
                </div>
                <DialogTitle className="text-xl font-black">{t("settingsPage.plan.welcomeTitle")}</DialogTitle>
                <DialogDescription>{t("settingsPage.plan.welcomeDesc", { plan: PLAN_DETAILS[welcomePlan].label })}</DialogDescription>
              </DialogHeader>
              <ul className="space-y-2 py-2">
                {Array.from({ length: PLAN_FEATURES[welcomePlan] }, (_, i) => i + 1).map(n => (
                  <li key={n} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {t(`pricingPage.plans.${welcomePlan}.f${n}`)}
                  </li>
                ))}
              </ul>
              <Button onClick={() => setWelcomePlan(null)} className="w-full">{t("settingsPage.plan.welcomeCta")}</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
