import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const PricingPage = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: "Tera Free",
      price: "$0",
      description: "Ideal para usuarios individuales que buscan organización básica.",
      features: [
        "15 GB de almacenamiento",
        "10 GB de transferencia mensual",
        "Detección de duplicados básica (Nombre)",
        "Tamaño máximo de archivo: 2 GB",
        "Soporte comunitario",
      ],
      buttonText: "Comenzar gratis",
      highlight: false,
    },
    {
      name: "Tera Pro",
      price: "$12.00",
      description: "El equilibrio perfecto entre espacio y potencia de transferencia.",
      features: [
        "2 TB de almacenamiento",
        "500 GB de transferencia mensual",
        "Detección de duplicados avanzada (Contenido)",
        "Tamaño máximo de archivo: 100 GB",
        "Sincronización automática (Diaria)",
        "30 días de historial de versiones",
        "Soporte prioritario",
      ],
      buttonText: "Comprar ahora",
      highlight: true,
    },
    {
      name: "Tera Business",
      price: "$25.00",
      description: "Diseñado para profesionales y equipos con necesidades ilimitadas.",
      features: [
        "Almacenamiento ILIMITADO",
        "Transferencia cloud ILIMITADA",
        "Detección de duplicados con auto-limpieza",
        "Sin límite de tamaño de archivo",
        "Sincronización en tiempo real (Mirror)",
        "Historial de versiones ilimitado",
        "Soporte VIP 24/7",
      ],
      buttonText: "Contactar ventas",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl sm:tracking-tight lg:text-6xl">
          Planes diseñados para tu libertad digital
        </h1>
        <p className="mt-5 text-xl text-muted-foreground max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades de almacenamiento y transferencia entre nubes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:max-w-6xl lg:mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`flex flex-col border-2 ${
              plan.highlight ? 'border-primary shadow-lg scale-105 relative' : 'border-border'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                Más popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mes</span>
              </div>
              <CardDescription className="mt-4 min-h-[48px]">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full text-lg h-12" 
                variant={plan.highlight ? "default" : "outline"}
                asChild
              >
                <Link href={plan.name === "Tera Free" ? "/signup" : "/contact"}>
                  {plan.buttonText}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold mb-8">Preguntas frecuentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold text-lg mb-2">¿Cómo funciona la transferencia cloud?</h3>
            <p className="text-muted-foreground">
              Nuestra tecnología permite mover archivos directamente de Google Drive a Dropbox (y viceversa) en nuestros servidores, sin usar tu conexión a internet ni descargar archivos.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">¿Qué es la detección de duplicados avanzada?</h3>
            <p className="text-muted-foreground">
              A diferencia de otros servicios, comparamos el contenido real del archivo (hash) y no solo el nombre, para asegurar que no tengas copias repetidas que gasten tu espacio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
