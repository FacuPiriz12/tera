import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FileVersionTimeline from "@/components/FileVersionTimeline";

export default function FileVersions() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const fileId = searchParams.get("fileId");
  const fileName = searchParams.get("fileName") || "Archivo";

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
