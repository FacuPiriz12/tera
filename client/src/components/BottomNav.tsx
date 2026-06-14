import { Home, Globe, FileText, Settings, BarChart3 } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const items = [
    { path: "/dashboard",      icon: Home,     label: "Inicio"      },
    { path: "/cloud-explorer", icon: Globe,    label: "Explorador"  },
    { path: "/operations",     icon: FileText, label: "Operaciones" },
    { path: "/integrations",   icon: Settings, label: "Integrar"    },
    { path: "/analytics",      icon: BarChart3,label: "Stats"       },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-gray-100 flex sm:hidden">
      {items.map(({ path, icon: Icon, label }) => {
        const isActive = location === path;
        return (
          <Link key={path} href={path} className="flex-1">
            <div className={`flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
              isActive ? 'text-[#0061D5]' : 'text-gray-400'
            }`}>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
