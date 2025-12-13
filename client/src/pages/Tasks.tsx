import { ClipboardList, FileText, CheckCircle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function Tasks() {
  const { t } = useTranslation(['pages', 'common']);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col" data-testid="tasks-page">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
                <p className="text-muted-foreground mt-1">
                  Gestiona y ejecuta las tareas asignadas a tu cuenta
                </p>
              </div>
              <Button className="gap-2" data-testid="button-new-task">
                <Plus className="w-4 h-4" />
                Nueva tarea
              </Button>
            </div>

            <Card className="shadow-sm border-border">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <div className="relative">
                      <FileText className="w-8 h-8 text-blue-400 absolute -left-3 -top-2 rotate-[-15deg]" />
                      <ClipboardList className="w-10 h-10 text-blue-500 relative z-10" />
                      <CheckCircle className="w-6 h-6 text-green-500 absolute -right-2 -bottom-1" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Ya estás al día
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Las tareas que te asignen aparecerán aquí. Vuelve más tarde para empezar a trabajar.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
