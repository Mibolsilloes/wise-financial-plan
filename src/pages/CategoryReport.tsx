import { useState, useMemo } from "react";
import { isWithinInterval, parseISO, startOfDay, endOfDay, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { 
  ArrowLeft, 
  X, 
  ChevronDown, 
  ChevronUp,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Wallet,
  Settings,
  Search,
  ArrowUpDown,
  Filter,
  FileText,
  LayoutGrid,
  TableIcon,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterPopover } from "@/components/dashboard/FilterPopover";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { usePeriod } from "@/contexts/PeriodContext";
import { cn } from "@/lib/utils";

type GroupingOption = "none" | "categoria" | "vencimento" | "criacao" | "responsavel";

const groupingLabels: Record<GroupingOption, string> = {
  none: "Sem agrupamento",
  categoria: "Categoria",
  vencimento: "Data de Vencimento",
  criacao: "Data de Criação",
  responsavel: "Responsável",
};

type SortOption = "criacao" | "vencimento" | "pagamento" | "competencia" | "valor";

const sortLabels: Record<SortOption, string> = {
  criacao: "Data de Criação",
  vencimento: "Data de Vencimento",
  pagamento: "Data de Pagamento",
  competencia: "Data de Competência",
  valor: "Valor",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Mock category data - would come from context/API
const categoryData: Record<string, { name: string; color: string; type: string }> = {
  "1": { name: "Alimentação", color: "hsl(25, 95%, 53%)", type: "despesa" },
  "2": { name: "Transporte", color: "hsl(217, 91%, 60%)", type: "despesa" },
  "3": { name: "Casa", color: "hsl(340, 82%, 52%)", type: "despesa" },
  "4": { name: "Mercado", color: "hsl(45, 93%, 47%)", type: "despesa" },
  "5": { name: "Salário", color: "hsl(160, 84%, 39%)", type: "receita" },
  "6": { name: "Saúde", color: "hsl(280, 65%, 60%)", type: "despesa" },
  "7": { name: "Lazer", color: "hsl(199, 89%, 48%)", type: "despesa" },
  "8": { name: "Educação", color: "hsl(142, 76%, 36%)", type: "despesa" },
  "9": { name: "Vestuário", color: "hsl(330, 81%, 60%)", type: "despesa" },
  "10": { name: "Viagem", color: "hsl(199, 89%, 48%)", type: "despesa" },
  "11": { name: "Pets", color: "hsl(35, 91%, 58%)", type: "despesa" },
  "12": { name: "Doações", color: "hsl(172, 66%, 50%)", type: "despesa" },
};

// Modern gradient card component matching "Lançamentos pendentes" style
interface GradientCardProps {
  title: string;
  value: number;
  subtitle?: string;
  variant: "income" | "expense" | "balance" | "predicted";
  showEye?: boolean;
}

const GradientCard = ({ 
  title, 
  value, 
  subtitle, 
  variant,
  showEye = false
}: GradientCardProps) => {
  const variants = {
    income: {
      bg: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      circle: "bg-emerald-500/10",
      label: "text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-700 dark:text-emerald-300",
      subtitle: "text-emerald-600/70 dark:text-emerald-400/70",
    },
    expense: {
      bg: "bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20",
      border: "border-rose-200/50 dark:border-rose-800/30",
      circle: "bg-rose-500/10",
      label: "text-rose-600 dark:text-rose-400",
      value: "text-rose-700 dark:text-rose-300",
      subtitle: "text-rose-600/70 dark:text-rose-400/70",
    },
    balance: {
      bg: "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/30",
      border: "border-slate-200/50 dark:border-slate-800/30",
      circle: "bg-slate-500/10",
      label: "text-slate-600 dark:text-slate-400",
      value: "text-slate-700 dark:text-slate-300",
      subtitle: "text-slate-600/70 dark:text-slate-400/70",
    },
    predicted: {
      bg: "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5",
      border: "border-primary/20 dark:border-primary/30",
      circle: "bg-primary/10",
      label: "text-primary dark:text-primary",
      value: "text-primary dark:text-primary",
      subtitle: "text-primary/70 dark:text-primary/70",
    },
  };

  const style = variants[variant];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-5 border",
      style.bg,
      style.border
    )}>
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8", style.circle)} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-medium uppercase tracking-wide", style.label)}>
            {title}
          </span>
          {showEye && (
            <Button variant="ghost" size="icon" className={cn("h-7 w-7", style.label, "opacity-50 hover:opacity-100")}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-2">
          <span className={cn("text-3xl font-bold", style.value)}>
            {formatCurrency(Math.abs(value))}
          </span>
        </div>
        {subtitle && (
          <p className={cn("text-xs mt-1", style.subtitle)}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default function CategoryReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMonth, currentYear, effectiveDateRange } = usePeriod();
  const [activeTab, setActiveTab] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [grouping, setGrouping] = useState<GroupingOption>("none");
  const [sortBy, setSortBy] = useState<SortOption>("valor");
  const [itemsPerPage, setItemsPerPage] = useState<30 | 50 | 100>(30);
  
  // Column visibility settings
  const [visibleColumns, setVisibleColumns] = useState({
    descricao: true,
    responsavel: true,
    valor: true,
    categoria: true,
    tipo: true,
    status: true,
    conta: true,
    cartao: true,
    dataVencimento: true,
    dataCompetencia: false,
    dataPagamento: false,
    fixoVariavel: true,
  });
  
  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };
  
  const category = id ? categoryData[id] : null;
  
  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <p>Categoria não encontrada</p>
        </div>
      </Layout>
    );
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Mock transactions with dates - would come from API
  const allTransactions = useMemo(() => [
    { id: 1, descricao: "Restaurante", responsavel: "João", valor: -85.50, tipo: "despesa", status: "Pago", conta: "Nubank", cartao: "Nubank Platinum", dataVencimento: "2026-01-15", dataCompetencia: "2026-01-15", dataPagamento: "2026-01-15", fixoVariavel: "Variável" },
    { id: 2, descricao: "Supermercado", responsavel: "Maria", valor: -320.00, tipo: "despesa", status: "Pendente", conta: "Itaú", cartao: "", dataVencimento: "2026-01-20", dataCompetencia: "2026-01-20", dataPagamento: "", fixoVariavel: "Variável" },
    { id: 3, descricao: "Delivery iFood", responsavel: "João", valor: -45.90, tipo: "despesa", status: "Pago", conta: "Nubank", cartao: "Nubank Platinum", dataVencimento: "2026-01-18", dataCompetencia: "2026-01-18", dataPagamento: "2026-01-18", fixoVariavel: "Variável" },
    { id: 4, descricao: "Padaria", responsavel: "Maria", valor: -28.00, tipo: "despesa", status: "Pago", conta: "Nubank", cartao: "", dataVencimento: "2026-01-19", dataCompetencia: "2026-01-19", dataPagamento: "2026-01-19", fixoVariavel: "Variável" },
    { id: 5, descricao: "Almoço trabalho", responsavel: "João", valor: -55.00, tipo: "despesa", status: "Pendente", conta: "Itaú", cartao: "", dataVencimento: "2026-01-22", dataCompetencia: "2026-01-22", dataPagamento: "", fixoVariavel: "Variável" },
    { id: 6, descricao: "Mercado mensal", responsavel: "Maria", valor: -850.00, tipo: "despesa", status: "Pago", conta: "Nubank", cartao: "", dataVencimento: "2026-01-05", dataCompetencia: "2026-01-05", dataPagamento: "2026-01-05", fixoVariavel: "Fixo" },
    { id: 7, descricao: "Lanche", responsavel: "João", valor: -22.50, tipo: "despesa", status: "Pago", conta: "Nubank", cartao: "Nubank Platinum", dataVencimento: "2026-01-12", dataCompetencia: "2026-01-12", dataPagamento: "2026-01-12", fixoVariavel: "Variável" },
    { id: 8, descricao: "Feira orgânica", responsavel: "Maria", valor: -180.00, tipo: "despesa", status: "Pendente", conta: "Itaú", cartao: "", dataVencimento: "2026-01-25", dataCompetencia: "2026-01-25", dataPagamento: "", fixoVariavel: "Variável" },
    // Transactions from December 2025
    { id: 9, descricao: "Ceia de Natal", responsavel: "Maria", valor: -450.00, tipo: "despesa", status: "Pago", conta: "Nubank", cartao: "", dataVencimento: "2025-12-24", dataCompetencia: "2025-12-24", dataPagamento: "2025-12-24", fixoVariavel: "Variável" },
    { id: 10, descricao: "Mercado dezembro", responsavel: "João", valor: -720.00, tipo: "despesa", status: "Pago", conta: "Itaú", cartao: "", dataVencimento: "2025-12-10", dataCompetencia: "2025-12-10", dataPagamento: "2025-12-10", fixoVariavel: "Fixo" },
    // Transactions from February 2026
    { id: 11, descricao: "Mercado fevereiro", responsavel: "Maria", valor: -380.00, tipo: "despesa", status: "Pendente", conta: "Nubank", cartao: "", dataVencimento: "2026-02-05", dataCompetencia: "2026-02-05", dataPagamento: "", fixoVariavel: "Fixo" },
  ], []);

  // Filter transactions based on effectiveDateRange
  const transactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      const transactionDate = parseISO(transaction.dataVencimento);
      return isWithinInterval(transactionDate, {
        start: startOfDay(effectiveDateRange.from),
        end: endOfDay(effectiveDateRange.to),
      });
    });
  }, [allTransactions, effectiveDateRange]);

  // Calculate financial data based on filtered transactions
  const financialData = useMemo(() => {
    const income = transactions
      .filter(t => t.tipo === "receita")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const expenses = transactions
      .filter(t => t.tipo === "despesa")
      .reduce((sum, t) => sum + Math.abs(t.valor), 0);
    
    const incomeReceived = transactions
      .filter(t => t.tipo === "receita" && t.status === "Pago")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const incomeToReceive = transactions
      .filter(t => t.tipo === "receita" && t.status === "Pendente")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const expensesPaid = transactions
      .filter(t => t.tipo === "despesa" && t.status === "Pago")
      .reduce((sum, t) => sum + Math.abs(t.valor), 0);
    
    const expensesToPay = transactions
      .filter(t => t.tipo === "despesa" && t.status === "Pendente")
      .reduce((sum, t) => sum + Math.abs(t.valor), 0);

    return {
      previousBalance: -50.00,
      income: income,
      expenses: -expenses,
      availableBalance: income - expenses - 50.00,
      expectedBalance: income - expenses - 50.00,
      incomeDetails: { received: incomeReceived, toReceive: incomeToReceive },
      expenseDetails: { paid: expensesPaid, toPay: expensesToPay },
    };
  }, [transactions]);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <PeriodSelector />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/categorias")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        
        {/* Category Badge */}
        <div>
          <Badge
            className="px-3 py-1.5 text-sm font-medium gap-2 rounded-full"
            style={{ 
              backgroundColor: category.color, 
              color: "white",
              borderColor: category.color 
            }}
          >
            {category.name}
            <button 
              onClick={() => navigate("/categorias")}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
        
        {/* Financial Summary Cards - Modern gradient style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GradientCard
            title="Saldo Anterior"
            value={financialData.previousBalance}
            subtitle={`Até ${format(subDays(effectiveDateRange.from, 1), "d 'de' MMMM", { locale: ptBR })}`}
            variant="balance"
          />
          
          <GradientCard
            title="Receitas"
            value={financialData.income}
            subtitle={`${format(effectiveDateRange.from, "d 'de' MMMM", { locale: ptBR })} - ${format(effectiveDateRange.to, "d 'de' MMMM", { locale: ptBR })}`}
            variant="income"
            showEye
          />
          
          <GradientCard
            title="Despesas"
            value={Math.abs(financialData.expenses)}
            subtitle={`${format(effectiveDateRange.from, "d 'de' MMMM", { locale: ptBR })} - ${format(effectiveDateRange.to, "d 'de' MMMM", { locale: ptBR })}`}
            variant="expense"
          />
          
          <GradientCard
            title="Saldo Disponível"
            value={financialData.availableBalance}
            subtitle={`Até ${format(effectiveDateRange.to, "d 'de' MMMM", { locale: ptBR })}`}
            variant={financialData.availableBalance >= 0 ? "income" : "expense"}
          />
        </div>
        
        {/* Expected Balance Card */}
        <div className="max-w-sm">
          <GradientCard
            title="Saldo Previsto"
            value={financialData.expectedBalance}
            subtitle={`Até ${format(effectiveDateRange.to, "d 'de' MMMM", { locale: ptBR })} (Receita - Despesa + Saldo Bancário)`}
            variant="predicted"
          />
        </div>
        
        {/* Transactions Section - Modern design */}
        <div className="bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Transações</h3>
                <p className="text-xs text-muted-foreground">Todas as movimentações da categoria</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="todas" className="text-xs rounded-lg">Todas</TabsTrigger>
                <TabsTrigger value="despesas" className="text-xs rounded-lg">Despesas</TabsTrigger>
                <TabsTrigger value="receitas" className="text-xs rounded-lg">Receitas</TabsTrigger>
              </TabsList>
            </Tabs>
          
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-0.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-3.5 h-3.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs rounded-lg">
                      <FileText className="w-3.5 h-3.5" />
                      Agrupar
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50">
                    {(Object.keys(groupingLabels) as GroupingOption[]).map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setGrouping(option)}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          grouping === option && "font-medium"
                        )}
                      >
                        {option === "none" && <FileText className="w-4 h-4" />}
                        {option === "categoria" && <LayoutGrid className="w-4 h-4" />}
                        {option === "vencimento" && <FileText className="w-4 h-4" />}
                        {option === "criacao" && <FileText className="w-4 h-4" />}
                        {option === "responsavel" && <FileText className="w-4 h-4" />}
                        {groupingLabels[option]}
                        {grouping === option && <Check className="w-4 h-4 ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar transações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-lg bg-muted/30 border-0 focus-visible:ring-1"
                />
              </div>

              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-md">
                      {sortLabels[sortBy]}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                    <p className="px-2 py-1.5 text-xs text-primary font-medium">Ordenar por</p>
                    {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSortBy(option)}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          sortBy === option && "font-medium"
                        )}
                      >
                        {sortLabels[option]}
                        {sortBy === option && <Check className="w-4 h-4 ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </Button>
                <FilterPopover>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md relative">
                    <Filter className="h-3.5 w-3.5" />
                  </Button>
                </FilterPopover>
              </div>
            </div>
          
            {/* Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Personalize sua visualização</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure como você quer ver suas transações de forma mais clara e organizada
                  </p>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* View Mode Selection */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Como você quer ver suas transações?</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setViewMode("cards")}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                          viewMode === "cards" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Cards</p>
                          <p className="text-[10px] text-muted-foreground">Visual e organizado</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setViewMode("table")}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                          viewMode === "table" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <TableIcon className="w-5 h-5 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Tabela</p>
                          <p className="text-[10px] text-muted-foreground">Compacto e detalhado</p>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Column Visibility */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Quais informações mostrar?</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {[
                        { key: "descricao", label: "Descrição" },
                        { key: "responsavel", label: "Responsável" },
                        { key: "valor", label: "Valor" },
                        { key: "categoria", label: "Categoria" },
                        { key: "tipo", label: "Tipo" },
                        { key: "status", label: "Status" },
                        { key: "conta", label: "Conta" },
                        { key: "cartao", label: "Cartão" },
                        { key: "dataVencimento", label: "Data de Vencimento" },
                        { key: "dataCompetencia", label: "Data de Competência" },
                        { key: "dataPagamento", label: "Data de Pagamento" },
                        { key: "fixoVariavel", label: "Fixo/Variável" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => toggleColumn(key as keyof typeof visibleColumns)}
                          className="flex items-center gap-2 py-1.5 text-sm hover:text-foreground transition-colors group"
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            visibleColumns[key as keyof typeof visibleColumns]
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40 group-hover:border-primary/60"
                          )}>
                            {visibleColumns[key as keyof typeof visibleColumns] && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className={cn(
                            visibleColumns[key as keyof typeof visibleColumns]
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="text-amber-500">⚡</span>
                    Escolha apenas o que você usa mais
                  </p>
                </div>
                
                <DialogFooter className="flex gap-3 sm:gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex-1"
                  >
                    Salvar Preferências
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          
            {/* Transactions Table */}
            <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    {visibleColumns.responsavel && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Responsável</TableHead>}
                    {visibleColumns.descricao && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Descrição</TableHead>}
                    {visibleColumns.valor && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Valor</TableHead>}
                    {visibleColumns.categoria && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Categoria</TableHead>}
                    {visibleColumns.tipo && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Tipo</TableHead>}
                    {visibleColumns.status && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Status</TableHead>}
                    {visibleColumns.conta && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Conta</TableHead>}
                    {visibleColumns.cartao && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Cartão</TableHead>}
                    {visibleColumns.dataVencimento && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Vencimento</TableHead>}
                    {visibleColumns.dataCompetencia && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Competência</TableHead>}
                    {visibleColumns.dataPagamento && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Pagamento</TableHead>}
                    {visibleColumns.fixoVariavel && <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Fixo/Variável</TableHead>}
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-28">
                        <div className="flex flex-col items-center justify-center text-center gap-1.5">
                          <div className="w-12 h-12 rounded-full bg-muted/80 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Nenhuma transação encontrada
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            Não há transações para exibir no período selecionado.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          
            {/* Pagination - Minimal */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hover:text-foreground transition-colors flex items-center gap-1">
                      {itemsPerPage}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50 min-w-[100px]">
                    {([30, 50, 100] as const).map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setItemsPerPage(option)}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          itemsPerPage === option && "font-medium"
                        )}
                      >
                        {option}
                        {itemsPerPage === option && <Check className="w-4 h-4 ml-2" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span>Total: 0</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled>
                  <ChevronDown className="h-3 w-3 mr-1 rotate-90" />
                  Anterior
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled>
                  Próximo
                  <ChevronDown className="h-3 w-3 ml-1 -rotate-90" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}