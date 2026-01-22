import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart3, 
  Tags, 
  Building2, 
  CreditCard, 
  Settings,
  User,
  ChevronDown,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const navItems = [
  { path: "/", label: "Planifica tu dinero", icon: Home },
  { path: "/relatorios", label: "Informes", icon: BarChart3 },
  { path: "/categorias", label: "Categorías", icon: Tags },
  { path: "/contas", label: "Cuentas bancarias", icon: Building2 },
  { path: "/cartoes", label: "Tarjetas de crédito", icon: CreditCard },
  { path: "/configuracoes", label: "Ajustes", icon: Settings },
];

export function TopNav() {
  const location = useLocation();
  const [user] = useState({
    name: "Juan García",
    plan: "Premium",
    avatar: "",
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm">MB</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                <Avatar className="w-8 h-8 border-2 border-white/30">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-300" />
                    <span className="text-xs text-yellow-300">{user.plan}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-white/70 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">juan@email.com</p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild>
                <Link to="/configuracoes" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/configuracoes" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Ajustes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}