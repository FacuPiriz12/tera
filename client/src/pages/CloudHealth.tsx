import { useQuery } from "@tanstack/react-query";
import { 
  HeartPulse, 
  Trash2, 
  FileWarning, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function CloudHealth() {
  // Mock data for health insights
  const healthData = {
    duplicateFiles: 124,
    duplicateSize: "1.2 GB",
    oldFiles: 850,
    oldFilesSize: "3.5 GB",
    unusedSpace: "5.8 GB",
    healthScore: 72,
    insights: [
      {
        id: 1,
        title: "Archivos duplicados detectados",
        description: "Encontramos 124 archivos idénticos en Drive y Dropbox.",
        action: "Ver duplicados",
        impact: "Ahorra 1.2 GB",
        type: "warning"
      },
      {
        id: 2,
        title: "Archivos antiguos sin usar",
        description: "850 archivos no han sido abiertos en los últimos 2 años.",
        action: "Revisar archivos",
        impact: "Libera 3.5 GB",
        type: "info"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col" data-testid="cloud-health-page">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <HeartPulse className="text-red-500 w-7 h-7" />
                  Salud de tu Nube
                </h1>
                <p className="text-muted-foreground mt-1">
                  Análisis inteligente para optimizar tu almacenamiento y ahorrar espacio
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border shadow-sm">
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Puntaje de Salud</p>
                  <p className="text-2xl font-bold text-green-600">{healthData.healthScore}/100</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin-slow flex items-center justify-center">
                   <span className="text-xs font-bold text-green-700">72%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-l-4 border-l-amber-500 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileWarning className="w-4 h-4 text-amber-500" />
                    Duplicados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{healthData.duplicateSize}</p>
                  <p className="text-xs text-muted-foreground mt-1">{healthData.duplicateFiles} archivos idénticos</p>
                  <Button variant="link" className="px-0 h-auto text-xs mt-3 text-amber-600 hover:text-amber-700">
                    Limpiar duplicados <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Archivos Inactivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{healthData.oldFilesSize}</p>
                  <p className="text-xs text-muted-foreground mt-1">{healthData.oldFiles} sin abrir en 2 años</p>
                  <Button variant="link" className="px-0 h-auto text-xs mt-3 text-blue-600 hover:text-blue-700">
                    Archivar antiguos <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    Ahorro Potencial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">4.7 GB</p>
                  <p className="text-xs text-muted-foreground mt-1">Si optimizas hoy mismo</p>
                  <Progress value={35} className="h-1.5 mt-4" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold text-lg">Insights de Optimización</h3>
                {healthData.insights.map((insight) => (
                  <Card key={insight.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className={`w-2 ${insight.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                          </div>
                          <Badge variant="outline" className={`${insight.type === 'warning' ? 'text-amber-700 border-amber-200 bg-amber-50' : 'text-blue-700 border-blue-200 bg-blue-50'}`}>
                            {insight.impact}
                          </Badge>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button size="sm" className={insight.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}>
                            {insight.action}
                          </Button>
                          <Button size="sm" variant="outline">Ignorar</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="bg-white rounded-2xl border p-6 shadow-sm h-fit">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500 w-5 h-5" />
                  ¿Por qué es importante?
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Reduce Costos</p>
                      <p className="text-xs text-muted-foreground">Evita pagar planes superiores de almacenamiento eliminando basura.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Mejor Organización</p>
                      <p className="text-xs text-muted-foreground">Encuentra tus archivos más rápido sin la distracción de versiones antiguas.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Seguridad</p>
                      <p className="text-xs text-muted-foreground">Elimina copias innecesarias de documentos sensibles.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed text-center">
                  <p className="text-xs text-muted-foreground">Próximamente: Auto-limpieza programada</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}
