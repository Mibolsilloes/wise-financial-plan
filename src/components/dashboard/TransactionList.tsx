import { useState } from "react";
import { 
  Search, 
  ArrowUpDown, 
  MoreVertical, 
  Edit2, 
  Trash2,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Briefcase,
  Heart,
  Gamepad2,
  GraduationCap,
  LayoutGrid,
  List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
};

const transactions = [
  {
    id: 1,
    description: "Salário mensal",
    value: 8500.00,
    type: "receita",
    category: "Salário",
    date: "2024-12-05",
    responsible: "João",
    fixed: true,
    status: "pago",
  },
  {
    id: 2,
    description: "Supermercado Extra",
    value: -456.80,
    type: "despesa",
    category: "Mercado",
    date: "2024-12-03",
    responsible: "Maria",
    fixed: false,
    status: "pago",
  },
  {
    id: 3,
    description: "Aluguel do apartamento",
    value: -1800.00,
    type: "despesa",
    category: "Casa",
    date: "2024-12-10",
    responsible: "João",
    fixed: true,
    status: "pendente",
  },
  {
    id: 4,
    description: "Uber semanal",
    value: -89.50,
    type: "despesa",
    category: "Transporte",
    date: "2024-12-08",
    responsible: "João",
    fixed: false,
    status: "pago",
  },
  {
    id: 5,
    description: "Plano de saúde",
    value: -450.00,
    type: "despesa",
    category: "Saúde",
    date: "2024-12-15",
    responsible: "Família",
    fixed: true,
    status: "pendente",
  },
  {
    id: 6,
    description: "Freelance design",
    value: 1200.00,
    type: "receita",
    category: "Salário",
    date: "2024-12-12",
    responsible: "João",
    fixed: false,
    status: "pendente",
  },
];

export function TransactionList() {
  const [filter, setFilter] = useState<"all" | "receitas" | "despesas">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "receitas") return t.type === "receita";
    if (filter === "despesas") return t.type === "despesa";
    return true;
  }).filter((t) => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="glass rounded-xl p-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <h2 className="text-lg font-semibold">Movimentações</h2>
        
        {/* Quick Filters */}
        <div className="flex items-center gap-2 sm:ml-auto">
          {(["all", "receitas", "despesas"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                filter === f
                  ? f === "receitas" 
                    ? "bg-success/20 text-success"
                    : f === "despesas"
                    ? "bg-destructive/20 text-destructive"
                    : "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {f === "all" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Ordenar
          </Button>
          <div className="flex items-center border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredTransactions.map((transaction, index) => {
          const CategoryIcon = categoryIcons[transaction.category] || ShoppingCart;
          const isIncome = transaction.type === "receita";
          
          return (
            <div
              key={transaction.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-border/60 transition-all duration-200 group",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Category Icon */}
              <div className={cn(
                "p-2.5 rounded-lg shrink-0",
                isIncome ? "bg-success/20" : "bg-destructive/20"
              )}>
                <CategoryIcon className={cn(
                  "w-5 h-5",
                  isIncome ? "text-success" : "text-destructive"
                )} />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{transaction.description}</p>
                  {transaction.fixed && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                      Fixo
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.date)}</span>
                  <span>•</span>
                  <span>{transaction.responsible}</span>
                </div>
              </div>

              {/* Value & Status */}
              <div className="text-right shrink-0">
                <p className={cn(
                  "font-semibold",
                  isIncome ? "text-success" : "text-destructive"
                )}>
                  {isIncome ? "+" : "-"}{formatCurrency(transaction.value)}
                </p>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-[10px] mt-1",
                    transaction.status === "pago" 
                      ? "bg-success/10 text-success border-success/20" 
                      : "bg-warning/10 text-warning border-warning/20"
                  )}
                >
                  {transaction.status === "pago" ? "Pago" : "Pendente"}
                </Badge>
              </div>

              {/* Actions */}
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
                  <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
