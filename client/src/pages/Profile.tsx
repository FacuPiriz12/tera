import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import type { CopyOperation } from "@shared/schema";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useLocation } from "wouter";
import {
  Mail, Calendar, Activity, FileText, Settings, Shield,
  Clock, HardDrive, Network, Crown, Zap, Package,
  CheckCircle2, XCircle, Loader2, Star
} from "lucide-react";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import OneDriveLogo from "@/components/OneDriveLogo";
import BoxLogo from "@/components/BoxLogo";
import S3Logo from "@/components/S3Logo";

const PLAN_DETAILS = {
  free:     { label: "Free",     color: "bg-gray-100 text-gray-700",         icon: Package, gradient: "from-gray-50 to-gray-100" },
  pro:      { label: "Pro",      color: "bg-blue-100 text-blue-700",         icon: Zap,     gradient: "from-blue-50 to-blue-100" },
  business: { label: "Business", color: "bg-violet-100 text-violet-700",     icon: Crown,   gradient: "from-violet-50 to-violet-100" },
} as const;

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: operationsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/copy-operations"],
    enabled: !!user,
  });
  const operations: CopyOperation[] = (operationsData as any)?.operations ?? (Array.isArray(operationsData) ? operationsData : []);

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

  const isAdmin = user.role === "admin";

  const allServices = [
    { logoBadge: <GoogleDriveLogo className="w-3.5 h-3.5" />, logoCard: <GoogleDriveLogo className="w-4 h-4" />, name: "Google Drive", connected: user.googleConnected },
    { logoBadge: <DropboxLogo className="w-3.5 h-3.5" />,     logoCard: <DropboxLogo className="w-4 h-4" />,     name: "Dropbox",      connected: user.dropboxConnected },
    { logoBadge: <OneDriveLogo className="w-3.5 h-3.5" />,    logoCard: <OneDriveLogo className="w-4 h-4" />,    name: "OneDrive",     connected: user.onedriveConnected },
    { logoBadge: <BoxLogo className="w-3.5 h-3.5" />,         logoCard: <BoxLogo className="w-4 h-4" />,         name: "Box",          connected: user.boxConnected },
    { logoBadge: <S3Logo className="w-3.5 h-3.5" />,          logoCard: <S3Logo className="w-4 h-4" />,          name: "Amazon S3",    connected: user.s3Connected },
  ];

  const plan = (user.membershipPlan as keyof typeof PLAN_DETAILS) || "free";
  const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
  const PlanIcon = planInfo.icon;

  const totalOps      = operations?.length || 0;
  const completedOps  = operations?.filter((op) => op.status === "completed").length || 0;
  const failedOps     = operations?.filter((op) => op.status === "failed").length || 0;
  const successRate   = totalOps > 0 ? Math.round((completedOps / totalOps) * 100) : 0;

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email?.split("@")[0] || "—";

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col pl-0 sm:pl-20">
      <Header />
      <Sidebar />

      <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl w-full mx-auto">

        {/* ── Hero Card ── */}
        <Card className="border-0 shadow-sm overflow-hidden mb-5">
          {/* Banner */}
          <div className="relative h-32 bg-gradient-to-r from-[#0061D5] via-[#1a73e8] to-[#004EB0]">
            {/* Decorative circles */}
            <div className="absolute top-4 right-12 w-20 h-20 rounded-full bg-white/5" />
            <div className="absolute -top-4 right-32 w-32 h-32 rounded-full bg-white/5" />
            {/* Avatar — absolutely positioned on the banner edge */}
            <div className="absolute -bottom-10 left-6">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-blue-700 text-white text-2xl font-black">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content — pt-12 to clear the overlapping avatar */}
          <CardContent className="pt-12 pb-5 px-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              {/* Left: identity */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-gray-900 leading-tight">{displayName}</h1>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      <Star className="w-2.5 h-2.5" />
                      Admin
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
                    <span>{t("profilePage.memberSince")} {formatDate(user.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Right: plan + edit */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin ? (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 font-bold px-3 py-1 flex items-center gap-1.5 shadow-sm">
                    <Shield className="w-3 h-3" />
                    Admin
                  </Badge>
                ) : (
                  <Badge className={`${planInfo.color} font-bold px-3 py-1 flex items-center gap-1.5 border-0`}>
                    <PlanIcon className="w-3 h-3" />
                    {planInfo.label}
                  </Badge>
                )}
                <Button size="sm" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => setLocation("/settings")}>
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  {t("profilePage.editProfile")}
                </Button>
              </div>
            </div>

            {/* Connected services chips */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {allServices.filter(s => s.connected).map(({ logoBadge, name }) => (
                <div key={name} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                  {logoBadge}
                  {name}
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
              ))}
              {!allServices.some(s => s.connected) && (
                <span className="text-xs text-gray-400">
                  {t("profilePage.noServices")}{" "}
                  <button onClick={() => setLocation("/integrations")} className="text-blue-500 hover:underline">
                    {t("profilePage.connectNow")}
                  </button>
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <Activity className="h-4 w-4 text-blue-600" />
                  {t("profilePage.activity.title")}
                </CardTitle>
                <CardDescription>{t("profilePage.activity.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: t("profilePage.activity.total"),     value: totalOps,        color: "text-gray-900",  bg: "bg-gray-50"   },
                        { label: t("profilePage.activity.completed"), value: completedOps,    color: "text-green-600", bg: "bg-green-50"  },
                        { label: t("profilePage.activity.failed"),    value: failedOps,       color: "text-red-500",   bg: "bg-red-50"    },
                        { label: t("profilePage.activity.success"),   value: `${successRate}%`, color: "text-blue-600", bg: "bg-blue-50"  },
                      ].map(({ label, value, color, bg }) => (
                        <div key={label} className={`${bg} border border-gray-100 rounded-xl p-3 text-center`}>
                          <p className={`text-2xl font-black ${color}`}>{value}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                    {totalOps > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>{t("profilePage.activity.successLabel")}</span>
                          <span className="font-semibold">{successRate}%</span>
                        </div>
                        <Progress value={successRate} className="h-1.5" />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <Clock className="h-4 w-4 text-blue-600" />
                  {t("profilePage.recent.title")}
                </CardTitle>
                <CardDescription>{t("profilePage.recent.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : operations && operations.length > 0 ? (
                  <div className="space-y-2">
                    {operations.slice(0, 6).map((op) => (
                      <div
                        key={op.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-gray-100">
                          {op.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : op.status === "failed" ? (
                            <XCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {op.copiedFileName || t("profilePage.recent.copyOp")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(op.createdAt)} ·{" "}
                            {op.status === "completed"
                              ? t("profilePage.recent.completedStatus")
                              : op.status === "failed"
                              ? t("profilePage.recent.failedStatus")
                              : op.status === "in_progress"
                              ? t("profilePage.recent.inProgress")
                              : op.status}
                          </p>
                        </div>
                        {op.totalFiles && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {op.completedFiles || 0}/{op.totalFiles}
                          </Badge>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setLocation("/operations")}
                      className="w-full text-center text-xs text-blue-600 hover:underline pt-1 font-medium"
                    >
                      {t("profilePage.recent.viewAll")}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">{t("profilePage.recent.empty")}</p>
                    <p className="text-xs mt-1">{t("profilePage.recent.emptySub")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Plan card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  {isAdmin ? <Star className="h-4 w-4 text-amber-500" /> : <PlanIcon className="h-4 w-4 text-blue-600" />}
                  {t("profilePage.plan.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isAdmin ? (
                  <div className="rounded-xl p-4 text-center bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-black text-gray-900">Admin</p>
                    <p className="text-xs text-amber-700 mt-0.5">Acceso completo a la plataforma</p>
                  </div>
                ) : (
                  <div className={`rounded-xl p-3 text-center bg-gradient-to-br ${planInfo.gradient}`}>
                    <PlanIcon className={`w-7 h-7 mx-auto mb-1 ${
                      plan === "business" ? "text-violet-600" : plan === "pro" ? "text-blue-600" : "text-gray-400"
                    }`} />
                    <p className="font-black text-gray-900">{planInfo.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {plan === "free" ? t("profilePage.plan.freeLabel") : plan === "pro" ? t("profilePage.plan.proPrice") : t("profilePage.plan.businessPrice")}
                    </p>
                  </div>
                )}
                {!isAdmin && (
                  <Button
                    variant={plan === "free" ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                    onClick={() => setLocation(plan === "free" ? "/pricing" : "/settings")}
                  >
                    {plan === "free" ? t("profilePage.plan.upgrade") : t("profilePage.plan.manage")}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Account info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <Shield className="h-4 w-4 text-blue-600" />
                  {t("profilePage.account.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t("profilePage.account.status")}</span>
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs font-semibold">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                    {t("profilePage.account.active")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Rol</span>
                  <span className="text-xs font-semibold text-gray-700 capitalize">{user.role || "user"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">{t("profilePage.account.userId")}</span>
                  <p className="text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-100 rounded p-1.5 truncate">{user.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <Network className="h-4 w-4 text-blue-600" />
                  {t("profilePage.services.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {allServices.map(({ logoCard, name, connected }) => (
                  <div key={name} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center shadow-sm">{logoCard}</div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <p className={`text-xs ${connected ? "text-green-500" : "text-gray-400"}`}>
                          {connected ? t("profilePage.services.connected") : t("profilePage.services.notConnected")}
                        </p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-200"}`} />
                  </div>
                ))}
                <button
                  onClick={() => setLocation("/integrations")}
                  className="w-full text-center text-xs text-blue-600 hover:underline pt-1 font-medium"
                >
                  {t("profilePage.services.manage")}
                </button>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-black">{t("profilePage.quickActions.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { icon: Activity,   label: t("profilePage.quickActions.operations"), path: "/operations" },
                  { icon: HardDrive,  label: t("profilePage.quickActions.files"),      path: "/my-files"   },
                  { icon: Settings,   label: t("profilePage.quickActions.settings"),   path: "/settings"   },
                ].map(({ icon: Icon, label, path }) => (
                  <button
                    key={path}
                    onClick={() => setLocation(path)}
                    className="w-full flex items-center gap-2.5 p-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium text-left"
                  >
                    <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
