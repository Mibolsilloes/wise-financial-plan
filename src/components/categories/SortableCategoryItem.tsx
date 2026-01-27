import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Trash2, FileBarChart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Icon mapping
import {
  Utensils, Car, Home, ShoppingCart, Briefcase, Heart, Gamepad2,
  GraduationCap, Shirt, Plane, Cat, Gift, Tv, Wrench, Laptop, TrendingUp, Zap
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  "Alimentación": Utensils,
  "Transporte": Car,
  "Hogar": Home,
  "Supermercado": ShoppingCart,
  "Salario": Briefcase,
  "Salud": Heart,
  "Ocio": Gamepad2,
  "Educación": GraduationCap,
  "Ropa": Shirt,
  "Viajes": Plane,
  "Mascotas": Cat,
  "Donaciones": Gift,
  "Suscripciones": Tv,
  "Servicios": Wrench,
  "Otros": Wallet,
  "Freelance": Laptop,
  "Inversiones": TrendingUp,
  "Vivienda": Home,
  "Suministros": Zap,
};

interface CategoryItem {
  id: number;
  name: string;
  color: string;
  subcategories: number;
  total: number;
  type: string;
  keywords: string[];
}

interface SortableCategoryItemProps {
  category: CategoryItem;
  index: number;
  onEditClick: (category: CategoryItem) => void;
  onDeleteClick?: (category: CategoryItem) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

export function SortableCategoryItem({ 
  category, 
  index, 
  onEditClick,
  onDeleteClick 
}: SortableCategoryItemProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = categoryIcons[category.name] || Wallet;
  const isIncome = category.type === "ingreso";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-200 animate-scale-in",
        isDragging && "opacity-50 shadow-2xl scale-[1.02] border-primary"
      )}
      {...attributes}
    >
      <div className="flex items-stretch">
        {/* Drag Handle */}
        <button
          {...listeners}
          className="px-2 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors touch-none"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Color Bar */}
        <div 
          className="w-1.5 shrink-0"
          style={{ backgroundColor: category.color }}
        />
        
        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Icon, Name, Badge */}
            <div className="flex items-center gap-4 min-w-0">
              <div 
                className="p-2.5 rounded-xl shrink-0"
                style={{ backgroundColor: `${category.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: category.color }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{category.name}</h3>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[10px] shrink-0",
                      isIncome 
                        ? "bg-success/10 text-success border-success/20" 
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {isIncome ? "Ingreso" : "Gasto"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {category.subcategories > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {category.subcategories} subcategorías
                    </span>
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    isIncome ? "text-success" : "text-foreground"
                  )}>
                    {formatCurrency(category.total)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <div 
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => navigate(`/categorias/${category.id}/relatorio`)}
              >
                <FileBarChart className="w-4 h-4" />
                Informes
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEditClick(category)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteClick?.(category)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
