import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { 
  Plus, 
  Edit2, 
  Trash2,
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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  { id: 12, name: "Doações", color: "hsl(172, 66%, 50%)", subcategories: 0, total: 100.00, type: "despesa" },
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {filteredCategories.map((category, index) => {
            const Icon = categoryIcons[category.name] || Wallet;
            const isIncome = category.type === "receita";
            
            return (
              <div
                key={category.id}
                className="glass rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-200 animate-scale-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-stretch">
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
                              {isIncome ? "Receita" : "Despesa"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {category.subcategories > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {category.subcategories} subcategorias
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
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma categoria encontrada</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
