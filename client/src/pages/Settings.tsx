import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/queryClient";
import Header from "@/components/Header";
import LanguageSelector from "@/components/LanguageSelector";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  User, Camera, Save, Shield, Trash2, CheckCircle2, AlertCircle,
  Loader2, Crown, Zap, Globe, CreditCard, ArrowUpRight, XCircle,
  Star, Package
} from "lucide-react";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";

const settingsSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

const PLAN_DETAILS = {
  free:     { label: "Free",     color: "bg-gray-100 text-gray-700",    icon: Package,  monthlyUSD: 0 },
  pro:      { label: "Pro",      color: "bg-blue-100 text-blue-700",    icon: Zap,      monthlyUSD: 7.99 },
  business: { label: "Business", color: "bg-violet-100 text-violet-700", icon: Crown,    monthlyUSD: 19.99 },
} as const;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

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

  const updateUserMutation = useMutation({
    mutationFn: async (data: SettingsFormData) =>
      apiRequest("PATCH", "/api/user/update", data),
    onSuccess: async (res) => {
      const data = await res.json();
      if (data?.requiresEmailVerification) {
        setPendingEmail(data.pendingEmail);
        setIsEditing(false);
        toast({ title: "Código enviado", description: `Revisá ${data.pendingEmail} e ingresá el código de 6 dígitos.` });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Información actualizada", description: "Tus datos fueron actualizados exitosamente." });
        setIsEditing(false);
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar la información", variant: "destructive" });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) =>
      apiRequest("POST", "/api/user/verify-email-change", { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setPendingEmail(null);
      setOtpCode("");
      toast({ title: "Email actualizado", description: "Tu dirección de email fue cambiada exitosamente." });
    },
    onError: (error: any) => {
      toast({ title: "Código incorrecto", description: error.message || "Verificá el código e intentá de nuevo.", variant: "destructive" });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/stripe/cancel-subscription", {}),
    onSuccess: () => {
      setCancelConfirm(false);
      toast({ title: "Suscripción cancelada", description: "Tu plan seguirá activo hasta el fin del período de facturación." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo cancelar la suscripción.", variant: "destructive" });
    },
  });

  const handleCheckout = async (priceId: string) => {
    try {
      setCheckoutLoading(priceId);
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ priceId }),
      });
      if (!res.ok) throw new Error("Error al crear sesión de pago");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast({ title: "Error", description: "No se pudo iniciar el pago.", variant: "destructive" });
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

  const plan = (user?.membershipPlan as keyof typeof PLAN_DETAILS) || "free";
  const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
  const PlanIcon = planInfo.icon;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Cargando configuraciones...</p>
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
            <h1 className="text-2xl font-black text-gray-900">Configuraciones</h1>
            <p className="text-sm text-gray-500 mt-1">Gestioná tu cuenta, plan y preferencias</p>
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
                Información Personal
              </CardTitle>
              <CardDescription>Actualizá tu nombre y dirección de email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-blue-100">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-lg font-black">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Sin nombre"}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <Button variant="outline" size="sm" disabled className="mt-2 h-7 text-xs">
                    <Camera className="h-3 w-3 mr-1.5" />
                    Cambiar foto (próximamente)
                  </Button>
                </div>
              </div>

              <Separator />

              {/* OTP panel */}
              {pendingEmail && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Verificación pendiente</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Enviamos un código de 6 dígitos a <strong>{pendingEmail}</strong>
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
                      <span className="ml-1.5">Confirmar</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEmailChange}>Cancelar</Button>
                  </div>
                  <p className="text-xs text-amber-600">Vence en 10 minutos · Revisá spam si no aparece</p>
                </div>
              )}

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => updateUserMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nombre</FormLabel>
                        <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Apellido</FormLabel>
                        <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        Email
                        {isEditing && <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full normal-case tracking-normal">Requiere verificación al cambiar</span>}
                      </FormLabel>
                      <FormControl><Input {...field} type="email" disabled={!isEditing || !!pendingEmail} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-2 pt-1">
                    {!isEditing ? (
                      <Button type="button" onClick={() => setIsEditing(true)} size="sm">
                        <User className="h-3.5 w-3.5 mr-1.5" />Editar información
                      </Button>
                    ) : (
                      <>
                        <Button type="submit" disabled={updateUserMutation.isPending} size="sm">
                          {updateUserMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                          {updateUserMutation.isPending ? "Guardando..." : "Guardar cambios"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={handleCancel}>Cancelar</Button>
                      </>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* ── Plan y Facturación ── */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Plan y Facturación
              </CardTitle>
              <CardDescription>Tu plan actual y opciones de actualización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current plan banner */}
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
                      {plan === "free" ? "Gratis para siempre · sin tarjeta requerida"
                      : plan === "pro" ? "$7.99 USD/mes"
                      : "$19.99 USD/mes"}
                    </p>
                  </div>
                </div>
                {plan !== "free" && (
                  <Badge className="bg-green-100 text-green-700 border-0 font-semibold">Activo</Badge>
                )}
              </div>

              {/* Limits summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Tráfico/mes", value: plan === "free" ? "5 GB" : plan === "pro" ? "200 GB" : "2 TB" },
                  { label: "Transferencias", value: plan === "free" ? "20" : plan === "pro" ? "300" : "Ilimitadas" },
                  { label: "Archivo máx.", value: plan === "free" ? "100 MB" : plan === "pro" ? "5 GB" : "50 GB" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-sm font-black text-gray-900">{value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Upgrade options */}
              {plan === "free" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mejorar plan</p>
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
                        <p className="text-[11px] text-blue-600 mt-0.5">200 GB · 300 transferencias</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-900">$7.99</p>
                        <p className="text-[11px] text-blue-500">/mes</p>
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
                        <p className="text-[11px] text-violet-600 mt-0.5">2 TB · Ilimitadas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-violet-900">$19.99</p>
                        <p className="text-[11px] text-violet-500">/mes</p>
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
                <div className="space-y-2">
                  <button
                    onClick={() => handleCheckout("price_1Tk1viGMtCDZ5sKaWGPYSJfA")}
                    disabled={!!checkoutLoading}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 transition-all group text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-violet-600" />
                        <span className="font-black text-violet-900 text-sm">Mejorar a Business</span>
                      </div>
                      <p className="text-[11px] text-violet-600 mt-0.5">2 TB · archivos de 50 GB · soporte 4h</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-violet-900">$19.99/mes</p>
                      {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin ml-auto mt-1" /> : <ArrowUpRight className="w-4 h-4 text-violet-400 ml-auto mt-1" />}
                    </div>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <Link href="/pricing" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3" /> Ver comparación completa de planes
                </Link>
                {plan !== "free" && !cancelConfirm && (
                  <button
                    onClick={() => setCancelConfirm(true)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                  >
                    Cancelar suscripción
                  </button>
                )}
              </div>

              {/* Cancel confirmation */}
              {cancelConfirm && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">¿Cancelar suscripción?</p>
                      <p className="text-xs text-red-600 mt-0.5">Tu plan seguirá activo hasta el fin del período actual. Después pasarás al plan Free.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cancelSubscriptionMutation.mutate()}
                      disabled={cancelSubscriptionMutation.isPending}
                    >
                      {cancelSubscriptionMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                      Confirmar cancelación
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCancelConfirm(false)}>
                      Mantener plan
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
                Preferencias
              </CardTitle>
              <CardDescription>Idioma y configuraciones de la interfaz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Idioma de la interfaz</p>
                  <p className="text-xs text-gray-500 mt-0.5">Cambia el idioma de toda la aplicación</p>
                </div>
                <LanguageSelector />
              </div>
            </CardContent>
          </Card>

          {/* ── Cuenta ── */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <Shield className="h-4 w-4 text-blue-600" />
                Información de Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ID de Usuario</Label>
                  <p className="text-xs text-gray-600 font-mono bg-gray-50 border border-gray-100 p-2 rounded-lg mt-1 truncate">{user.id}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Miembro desde</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Servicios Conectados</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { logo: <GoogleDriveLogo className="w-5 h-5" />, name: "Google Drive", connected: user.googleConnected },
                    { logo: <DropboxLogo className="w-5 h-5" />, name: "Dropbox", connected: user.dropboxConnected },
                  ].map(({ logo, name, connected }) => (
                    <div key={name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center">{logo}</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{name}</p>
                          <p className="text-xs text-gray-400">{connected ? "Conectado" : "No conectado"}</p>
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
                Zona Peligrosa
              </CardTitle>
              <CardDescription>Acciones irreversibles para tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Eliminar cuenta</p>
                  <p className="text-xs text-gray-500 mt-0.5">Elimina permanentemente tu cuenta y todos los datos. No se puede deshacer.</p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Eliminar (próximamente)
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
