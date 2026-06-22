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
import { useLocation } from "wouter";
import {
  Mail, Calendar, Activity, FileText, Settings, Shield,
  Clock, HardDrive, Network, Crown, Zap, Package,
  CheckCircle2, XCircle, Loader2
} from "lucide-react";
import GoogleDriveLogo from "@/components/GoogleDriveLogo";
import DropboxLogo from "@/components/DropboxLogo";
import OneDriveLogo from "@/components/OneDriveLogo";
import BoxLogo from "@/components/BoxLogo";
import S3Logo from "@/components/S3Logo";

const PLAN_DETAILS = {
  free:     { label: "Free",     color: "bg-gray-100 text-gray-700",     icon: Package, border: "border-gray-200" },
  pro:      { label: "Pro",      color: "bg-blue-100 text-blue-700",     icon: Zap,     border: "border-blue-200" },
  business: { label: "Business", color: "bg-violet-100 text-violet-700", icon: Crown,   border: "border-violet-200" },
} as const;

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: operations, isLoading: statsLoading } = useQuery<CopyOperation[]>({
    queryKey: ["/api/copy-operations"],
    enabled: !!user,
  });

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

  const allServices = [
    { logoBadge: <GoogleDriveLogo className="w-3.5 h-3.5" />, logoCard: <GoogleDriveLogo className="w-4 h-4" />, name: "Google Drive", connected: user.googleConnected },
    { logoBadge: <DropboxLogo className="w-3.5 h-3.5" />, logoCard: <DropboxLogo className="w-4 h-4" />, name: "Dropbox", connected: user.dropboxConnected },
    { logoBadge: <OneDriveLogo className="w-3.5 h-3.5" />, logoCard: <OneDriveLogo className="w-4 h-4" />, name: "OneDrive", connected: user.onedriveConnected },
    { logoBadge: <BoxLogo className="w-3.5 h-3.5" />, logoCard: <BoxLogo className="w-4 h-4" />, name: "Box", connected: user.boxConnected },
    { logoBadge: <S3Logo className="w-3.5 h-3.5" />, logoCard: <S3Logo className="w-4 h-4" />, name: "Amazon S3", connected: user.s3Connected },
  ];

  const plan = (user.membershipPlan as keyof typeof PLAN_DETAILS) || "free";
  const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
  const PlanIcon = planInfo.icon;

  const totalOps = operations?.length || 0;
  const completedOps = operations?.filter((op) => op.status === "completed").length || 0;
  const failedOps = operations?.filter((op) => op.status === "failed").length || 0;
  const successRate = totalOps > 0 ? Math.round((completedOps / totalOps) * 100) : 0;

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email?.split("@")[0] || "—";

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-5xl pt-24">

        {/* ── Hero Card ── */}
        <Card className="border-0 shadow-sm overflow-hidden mb-5">
          <div className="h-24 bg-gradient-to-r from-[#0061D5] to-[#004EB0]" />
          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
              <div className="flex items-end gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-md flex-shrink-0">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl font-black">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h1 className="text-xl font-black text-gray-900 leading-tight">{displayName}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>{t("profilePage.memberSince")} {formatDate(user.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Badge className={`${planInfo.color} font-bold px-3 py-1 flex items-center gap-1.5`}>
                  <PlanIcon className="w-3 h-3" />
                  {planInfo.label}
                </Badge>
                <Button size="sm" onClick={() => setLocation("/settings")}>
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  {t("profilePage.editProfile")}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
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
                        { label: t("profilePage.activity.total"), value: totalOps, color: "text-gray-900" },
                        { label: t("profilePage.activity.completed"), value: completedOps, color: "text-green-600" },
                        { label: t("profilePage.activity.failed"), value: failedOps, color: "text-red-500" },
                        { label: t("profilePage.activity.success"), value: `${successRate}%`, color: "text-blue-600" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
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
                  <PlanIcon className="h-4 w-4 text-blue-600" />
                  {t("profilePage.plan.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`rounded-xl p-3 text-center ${
                  plan === "business" ? "bg-gradient-to-br from-violet-50 to-violet-100"
                  : plan === "pro" ? "bg-gradient-to-br from-blue-50 to-blue-100"
                  : "bg-gray-50"
                }`}>
                  <PlanIcon className={`w-7 h-7 mx-auto mb-1 ${
                    plan === "business" ? "text-violet-600" : plan === "pro" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <p className="font-black text-gray-900">{planInfo.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {plan === "free" ? t("profilePage.plan.freeLabel") : plan === "pro" ? t("profilePage.plan.proPrice") : t("profilePage.plan.businessPrice")}
                  </p>
                </div>
                <Button
                  variant={plan === "free" ? "default" : "outline"}
                  className="w-full"
                  size="sm"
                  onClick={() => setLocation(plan === "free" ? "/pricing" : "/settings")}
                >
                  {plan === "free" ? t("profilePage.plan.upgrade") : t("profilePage.plan.manage")}
                </Button>
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
                  <div key={name} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center">{logoCard}</div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <p className="text-xs text-gray-400">{connected ? t("profilePage.services.connected") : t("profilePage.services.notConnected")}</p>
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
              <CardContent className="space-y-1.5">
                {[
                  { icon: Activity, label: t("profilePage.quickActions.operations"), path: "/operations" },
                  { icon: HardDrive, label: t("profilePage.quickActions.files"), path: "/my-files" },
                  { icon: Settings, label: t("profilePage.quickActions.settings"), path: "/settings" },
                ].map(({ icon: Icon, label, path }) => (
                  <button
                    key={path}
                    onClick={() => setLocation(path)}
                    className="w-full flex items-center gap-2.5 p-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium text-left"
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    {label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
