import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart3, 
  Tags, 
  Building2, 
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { path: "/categorias", label: "Categorias", icon: Tags },
  { path: "/contas", label: "Contas", icon: Building2 },
  { path: "/cartoes", label: "Cartões", icon: CreditCard },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-primary shadow-lg">
      <div className="flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-white bg-white/20"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
