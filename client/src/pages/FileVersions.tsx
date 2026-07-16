import { useLocation, Link } from "wouter";
import { ChevronLeft, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FileVersionTimeline from "@/components/FileVersionTimeline";
import { useAuth } from "@/hooks/useAuth";

export default function FileVersions() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const plan = user?.membershipPlan || 'free';
  const isAdmin = user?.role === 'admin';
  const isBusiness = plan === 'business' || isAdmin;

  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const fileId = searchParams.get("fileId");
  const fileName = searchParams.get("fileName") || "Archivo";

  if (!isBusiness) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <Button variant="ghost" onClick={() => navigate("/cloud")}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Card className="mt-6 border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 gap-5">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-center max-w-sm">
                    <Badge className="mb-3 bg-purple-100 text-purple-700 border-0">Plan Business requerido</Badge>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Historial de versiones</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Explorá el historial completo de cada archivo y restaurá cualquier versión anterior en segundos.
                    </p>
                  </div>
                  <Link href="/pricing">
                    <Button className="gap-2 mt-2">
                      Ver planes <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!fileId) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <Button variant="ghost" onClick={() => navigate("/cloud")}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <p className="text-muted-foreground mt-4">No se especificó archivo</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/cloud")}
              className="mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver a Explorador
            </Button>
            
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Historial de versiones
              </h1>
              <p className="text-muted-foreground">
                {fileName}
              </p>
            </div>

            <FileVersionTimeline fileId={fileId} fileName={fileName} />
          </div>
        </main>
      </div>
    </div>
  );
}
