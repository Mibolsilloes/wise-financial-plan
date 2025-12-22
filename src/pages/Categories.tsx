import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { 
  Plus, 
  Edit2, 
  Archive, 
  BarChart3,
  Utensils,
  Car,
  Home,
  ShoppingCart,
  Briefcase,
  Heart,
  Gamepad2,
  GraduationCap,
  Shirt,
  Plane,
  PawPrint,
  Gift,
  Tv,
  Wrench,
  Wallet,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  "Alimentação": Utensils,
  "Transporte": Car,
  "Casa": Home,
  "Mercado": ShoppingCart,
  "Salário": Briefcase,
  "Saúde": Heart,
  "Lazer": Gamepad2,
  "Educação": GraduationCap,
  "Vestuário": Shirt,
  "Viagem": Plane,
  "Pets": PawPrint,
  "Doações": Gift,
  "Assinatura": Tv,
  "Utilidades": Wrench,
  "Outros": Wallet,
};

const defaultCategories = [
  { id: 1, name: "Alimentação", color: "hsl(25, 95%, 53%)", subcategories: 3, total: 1250.00, type: "despesa" },
  { id: 2, name: "Transporte", color: "hsl(217, 91%, 60%)", subcategories: 2, total: 450.00, type: "despesa" },
  { id: 3, name: "Casa", color: "hsl(340, 82%, 52%)", subcategories: 4, total: 2100.00, type: "despesa" },
  { id: 4, name: "Mercado", color: "hsl(45, 93%, 47%)", subcategories: 0, total: 680.00, type: "despesa" },
  { id: 5, name: "Salário", color: "hsl(160, 84%, 39%)", subcategories: 2, total: 9700.00, type: "receita" },
  { id: 6, name: "Saúde", color: "hsl(280, 65%, 60%)", subcategories: 3, total: 520.00, type: "despesa" },
  { id: 7, name: "Lazer", color: "hsl(199, 89%, 48%)", subcategories: 5, total: 380.00, type: "despesa" },
  { id: 8, name: "Educação", color: "hsl(142, 76%, 36%)", subcategories: 2, total: 850.00, type: "despesa" },
  { id: 9, name: "Vestuário", color: "hsl(330, 81%, 60%)", subcategories: 0, total: 320.00, type: "despesa" },
  { id: 10, name: "Viagem", color: "hsl(199, 89%, 48%)", subcategories: 1, total: 0.00, type: "despesa" },
  { id: 11, name: "Pets", color: "hsl(35, 91%, 58%)", subcategories: 2, total: 180.00, type: "despesa" },
  { id: 12, name: "Doações", color: "hsl(340, 82%, 52%)", subcategories: 0, total: 100.00, type: "despesa" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function Categories() {
  const [categories] = useState(defaultCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Categorias</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Organize suas transações por categorias
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary">
                <Plus className="w-4 h-4" />
                Nova categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Criar nova categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Nome da categoria</Label>
                  <Input id="name" placeholder="Ex: Investimentos" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <div className="flex gap-2 mt-1.5">
                    {["hsl(340, 82%, 52%)", "hsl(25, 95%, 53%)", "hsl(45, 93%, 47%)", "hsl(160, 84%, 39%)", "hsl(217, 91%, 60%)", "hsl(280, 65%, 60%)"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-foreground/50 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea id="description" placeholder="Descreva esta categoria..." className="mt-1.5" />
                </div>
                <Button className="w-full">Criar categoria</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.name] || Wallet;
            const isIncome = category.type === "receita";
            
            return (
              <div
                key={category.id}
                className="glass rounded-xl p-5 border border-border/50 hover:border-border transition-all duration-200 group animate-scale-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: category.color }} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <BarChart3 className="w-4 h-4" />
                        Relatório
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer text-warning">
                        <Archive className="w-4 h-4" />
                        Arquivar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Name & Badge */}
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[10px]",
                      isIncome 
                        ? "bg-success/10 text-success border-success/20" 
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {isIncome ? "Receita" : "Despesa"}
                  </Badge>
                  {category.subcategories > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {category.subcategories} subcategorias
                    </span>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Total este mês</p>
                  <p className={cn(
                    "text-lg font-bold",
                    isIncome ? "text-success" : "text-foreground"
                  )}>
                    {formatCurrency(category.total)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
