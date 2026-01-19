import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Layout } from "@/components/layout/Layout";
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Trash2,
  Filter,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Search,
  ArrowUpDown,
  LayoutGrid,
  TableIcon,
  Check,
  BarChart3,
  PieChart as PieChartIcon,
  Plus,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FilterPopover } from "@/components/dashboard/FilterPopover";
import { cn } from "@/lib/utils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";

type GroupingOption = "none" | "categoria" | "vencimento" | "responsavel";

const groupingLabels: Record<GroupingOption, string> = {
  none: "Sem agrupamento",
  categoria: "Categoria",
  vencimento: "Data de Vencimento",
  responsavel: "Responsável",
};

type SortOption = "criacao" | "vencimento" | "valor";

const sortLabels: Record<SortOption, string> = {
  criacao: "Data de Criação",
  vencimento: "Data de Vencimento",
  valor: "Valor",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Mock card data
const cardsData: Record<string, { 
  name: string; 
  brand: string; 
  limit: number; 
  closingDay: number; 
  dueDay: number;
  account: string;
}> = {
  "1": { name: "Nubank Platinum", brand: "Mastercard", limit: 15000, closingDay: 3, dueDay: 10, account: "Nubank" },
  "2": { name: "Itaú Click", brand: "Visa", limit: 8000, closingDay: 15, dueDay: 22, account: "Itaú" },
  "3": { name: "Bradesco Neo", brand: "Elo", limit: 5000, closingDay: 20, dueDay: 27, account: "Bradesco" },
};

const brandColors: Record<string, string> = {
  "Mastercard": "hsl(25, 95%, 53%)",
  "Visa": "hsl(217, 91%, 60%)",
  "Elo": "hsl(45, 93%, 47%)",
  "American Express": "hsl(199, 89%, 48%)",
};

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const categoryColors: Record<string, string> = {
  "Streaming": "hsl(280, 70%, 50%)",
  "Mercado": "hsl(140, 70%, 45%)",
  "Eletrônicos": "hsl(200, 80%, 50%)",
  "Alimentação": "hsl(25, 90%, 55%)",
  "Transporte": "hsl(45, 90%, 50%)",
  "Saúde": "hsl(340, 70%, 50%)",
  "Lazer": "hsl(170, 60%, 45%)",
  "Outros": "hsl(220, 15%, 55%)",
};

interface ExpensesPieChartProps {
  transactions: Array<{
    id: number;
    descricao: string;
    valor: number;
    categoria: string;
  }>;
}

function ExpensesPieChart({ transactions }: ExpensesPieChartProps) {
  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    transactions.forEach((t) => {
      const value = Math.abs(t.valor);
      if (categoryTotals[t.categoria]) {
        categoryTotals[t.categoria] += value;
      } else {
        categoryTotals[t.categoria] = value;
      }
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || `hsl(${Math.random() * 360}, 60%, 50%)`,
    }));
  }, [transactions]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
          <PieChartIcon className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          Não há dados suficientes para mostrar este gráfico.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Total in center label */}
      <div className="text-center -mt-2">
        <p className="text-lg font-bold text-destructive">{formatCurrency(total)}</p>
        <p className="text-[10px] text-muted-foreground">Total da fatura</p>
      </div>

      {/* Legend */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        {chartData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(item.value)}</span>
                <span className="text-muted-foreground text-[10px]">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const monthAbbreviations = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Generate monthly expense data based on transactions
const generateMonthlyExpenseData = (transactions: any[]) => {
  // Create base data for all months
  const monthlyData = monthAbbreviations.map((abbr, idx) => ({
    period: abbr,
    despesas: 0,
  }));
  
  // Aggregate transactions by month
  transactions.forEach((t) => {
    const date = parseISO(t.dataCompra);
    const monthIdx = date.getMonth();
    monthlyData[monthIdx].despesas += Math.abs(t.valor);
  });
  
  return monthlyData;
};

interface CreditCardExpenseChartsProps {
  transactions: any[];
  currentMonth: number;
  currentYear: number;
}

function CreditCardExpenseCharts({ transactions, currentMonth, currentYear }: CreditCardExpenseChartsProps) {
  const [chartType, setChartType] = useState<"bar" | "area" | "line">("bar");
  const [chartPeriod, setChartPeriod] = useState<"monthly" | "daily">("monthly");
  const [chartOpen, setChartOpen] = useState(true);

  const chartData = useMemo(() => generateMonthlyExpenseData(transactions), [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-border/50 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              Despesas: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = (type: "bar" | "area" | "line", data: any[]) => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: -20, bottom: 0 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => v > 0 ? `${(v/1000).toFixed(0)}k` : '0'} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="square"
              formatter={() => <span className="text-xs text-muted-foreground">Despesas</span>}
            />
            <Line type="monotone" dataKey="despesas" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => v > 0 ? `${(v/1000).toFixed(0)}k` : '0'} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="square"
              formatter={() => <span className="text-xs text-muted-foreground">Despesas</span>}
            />
            <Bar dataKey="despesas" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorDespesasCard" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => v > 0 ? `${(v/1000).toFixed(0)}k` : '0'} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="square"
              formatter={() => <span className="text-xs text-muted-foreground">Despesas</span>}
            />
            <Area type="monotone" dataKey="despesas" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorDespesasCard)" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Collapsible open={chartOpen} onOpenChange={setChartOpen}>
        <div className="glass rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ChevronDown className={cn("w-4 h-4 transition-transform", !chartOpen && "-rotate-90")} />
                <div className="text-left">
                  <h3 className="font-semibold text-sm">Despesas do Cartão</h3>
                  <p className="text-xs text-muted-foreground">Visualize as despesas ao longo do tempo</p>
                </div>
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={(v) => setChartType(v as any)}>
                <SelectTrigger className="h-8 w-[100px] text-xs border-border/50">
                  <BarChart3 className="w-3.5 h-3.5 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Coluna</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="line">Linha</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartPeriod} onValueChange={(v) => setChartPeriod(v as any)}>
                <SelectTrigger className="h-8 w-[100px] text-xs border-border/50">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CollapsibleContent>
            <div className="p-4">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart(chartType, chartData)}
                </ResponsiveContainer>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

export default function CreditCardInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [grouping, setGrouping] = useState<GroupingOption>("none");
  const [sortBy, setSortBy] = useState<SortOption>("valor");
  const [itemsPerPage, setItemsPerPage] = useState<30 | 50 | 100>(30);
  
  const [visibleColumns, setVisibleColumns] = useState({
    descricao: true,
    responsavel: true,
    valor: true,
    categoria: true,
    parcela: true,
    dataCompra: true,
    fixoVariavel: true,
  });
  
  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };
  
  const card = id ? cardsData[id] : null;
  
  if (!card) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <p>Cartão não encontrado</p>
        </div>
      </Layout>
    );
  }

  const cardColor = brandColors[card.brand] || "hsl(217, 91%, 60%)";

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Mock invoice data
  const invoiceData = {
    status: "Aberta",
    statusColor: "warning",
    total: 2450.75,
    closingDate: card.closingDay,
    dueDate: card.dueDay,
  };

  // Mock transactions
  const transactions = useMemo(() => [
    { id: 1, descricao: "Netflix", responsavel: "João", valor: -55.90, categoria: "Streaming", parcela: "1/1", dataCompra: "2026-01-05", fixoVariavel: "Fixo" },
    { id: 2, descricao: "Supermercado Extra", responsavel: "Maria", valor: -320.00, categoria: "Mercado", parcela: "1/1", dataCompra: "2026-01-10", fixoVariavel: "Variável" },
    { id: 3, descricao: "iPhone 15 Pro", responsavel: "João", valor: -899.90, categoria: "Eletrônicos", parcela: "3/12", dataCompra: "2025-11-15", fixoVariavel: "Variável" },
    { id: 4, descricao: "Spotify Family", responsavel: "Maria", valor: -34.90, categoria: "Streaming", parcela: "1/1", dataCompra: "2026-01-08", fixoVariavel: "Fixo" },
    { id: 5, descricao: "Restaurante Outback", responsavel: "João", valor: -189.00, categoria: "Alimentação", parcela: "1/1", dataCompra: "2026-01-12", fixoVariavel: "Variável" },
  ], []);

  // Filtered transactions based on search - used by both table and chart
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    
    const query = searchQuery.toLowerCase();
    return transactions.filter((t) =>
      t.descricao.toLowerCase().includes(query) ||
      t.responsavel.toLowerCase().includes(query) ||
      t.categoria.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const getStatusBadge = () => {
    switch (invoiceData.status) {
      case "Fechada":
        return <Badge className="bg-success/10 text-success border-success/20">Fechada</Badge>;
      case "Paga":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Paga</Badge>;
      case "Parcial":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Parcial</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">Aberta</Badge>;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Month Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={() => navigate("/cartoes")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">
              Fatura {months[currentMonth]} {currentYear}
            </h1>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Trash2 className="w-3.5 h-3.5" />
              Limpar filtro
            </Button>
            <FilterPopover>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Filter className="w-3.5 h-3.5" />
              </Button>
            </FilterPopover>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Card Info Badge */}
        <div className="flex items-center gap-3">
          <Badge
            className="px-3 py-1.5 text-sm font-medium gap-2 rounded-full"
            style={{ 
              backgroundColor: cardColor, 
              color: "white",
              borderColor: cardColor 
            }}
          >
            <CreditCard className="w-4 h-4" />
            {card.name}
          </Badge>
          <span className="text-sm text-muted-foreground">• {card.brand}</span>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Invoice Status */}
          <div className="glass rounded-xl p-5 border border-border/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Status da Fatura</p>
                <p className="text-2xl font-bold text-warning">{invoiceData.status}</p>
                <p className="text-xs text-muted-foreground mt-1">Fatura {invoiceData.status.toLowerCase()}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-warning/10">
                <FileText className="w-5 h-5 text-warning" />
              </div>
            </div>
            <div className="mt-4 h-1 rounded-full bg-warning/20">
              <div className="h-full w-1/2 rounded-full bg-warning" />
            </div>
          </div>

          {/* Invoice Amount */}
          <div className="glass rounded-xl p-5 border border-border/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Valor da fatura</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(invoiceData.total)}</p>
                <p className="text-xs text-muted-foreground mt-1">Valor total da fatura</p>
              </div>
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <DollarSign className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </div>

          {/* Invoice Dates */}
          <div className="glass rounded-xl p-5 border border-border/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Datas da fatura</p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-bold">Dia {invoiceData.closingDate}</p>
                    <p className="text-xs text-muted-foreground">Fechamento</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-2xl font-bold">Dia {invoiceData.dueDate}</p>
                    <p className="text-xs text-muted-foreground">Vencimento</p>
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Fatura {months[currentMonth]}</h2>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(currentYear, currentMonth, card.closingDay), "dd 'de' MMMM", { locale: ptBR })} - {format(new Date(currentYear, currentMonth + 1, card.closingDay - 1), "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <Button className="gap-2 bg-destructive hover:bg-destructive/90">
                <Plus className="w-4 h-4" />
                Despesa Cartão
              </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 text-xs"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    Agrupar: {groupingLabels[grouping]}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50">
                  {(Object.entries(groupingLabels) as [GroupingOption, string][]).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setGrouping(key)}
                      className={cn(
                        "flex items-center justify-between cursor-pointer",
                        grouping === key && "font-medium"
                      )}
                    >
                      {label}
                      {grouping === key && <Check className="w-4 h-4 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs bg-muted/30 border-0"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    {sortLabels[sortBy]}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                  {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setSortBy(key)}
                      className={cn(
                        "flex items-center justify-between cursor-pointer",
                        sortBy === key && "font-medium"
                      )}
                    >
                      {label}
                      {sortBy === key && <Check className="w-4 h-4 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </Button>
              <FilterPopover>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs relative">
                  <Filter className="w-3.5 h-3.5" />
                </Button>
              </FilterPopover>
            </div>

            {/* Transactions Table */}
            <div className="glass rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    {visibleColumns.responsavel && <TableHead className="text-xs font-medium">Responsável</TableHead>}
                    {visibleColumns.descricao && <TableHead className="text-xs font-medium">Descrição</TableHead>}
                    {visibleColumns.valor && <TableHead className="text-xs font-medium">Valor</TableHead>}
                    {visibleColumns.categoria && <TableHead className="text-xs font-medium">Categoria</TableHead>}
                    {visibleColumns.parcela && <TableHead className="text-xs font-medium">Parcela</TableHead>}
                    {visibleColumns.dataCompra && <TableHead className="text-xs font-medium">Data Compra</TableHead>}
                    {visibleColumns.fixoVariavel && <TableHead className="text-xs font-medium">Fixo/Variável</TableHead>}
                    <TableHead className="text-xs font-medium">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-40">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-sm">Nenhuma transação encontrada</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Não há transações para exibir no período selecionado.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-border/50">
                        {visibleColumns.responsavel && <TableCell className="text-xs">{transaction.responsavel}</TableCell>}
                        {visibleColumns.descricao && <TableCell className="text-xs font-medium">{transaction.descricao}</TableCell>}
                        {visibleColumns.valor && (
                          <TableCell className="text-xs font-medium text-destructive">
                            {formatCurrency(transaction.valor)}
                          </TableCell>
                        )}
                        {visibleColumns.categoria && <TableCell className="text-xs">{transaction.categoria}</TableCell>}
                        {visibleColumns.parcela && (
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {transaction.parcela}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.dataCompra && (
                          <TableCell className="text-xs">
                            {format(parseISO(transaction.dataCompra), "dd/MM/yyyy")}
                          </TableCell>
                        )}
                        {visibleColumns.fixoVariavel && (
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {transaction.fixoVariavel}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Settings className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hover:text-foreground transition-colors flex items-center gap-1">
                      Mostrar {itemsPerPage}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50 min-w-[120px]">
                    {([30, 50, 100] as const).map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setItemsPerPage(option)}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          itemsPerPage === option && "font-medium"
                        )}
                      >
                        Mostrar {option}
                        {itemsPerPage === option && <Check className="w-4 h-4 ml-2" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span>|</span>
                <span>Total: {filteredTransactions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                  Voltar
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                  Próximo
                </Button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Pie Chart Section */}
            <div className="glass rounded-xl p-5 border border-border/50">
              <h3 className="font-semibold mb-4">Gráficos</h3>
              <Tabs defaultValue="despesas" className="w-full">
                <TabsList className="w-full bg-muted/50 p-1">
                  <TabsTrigger value="despesas" className="flex-1 text-xs">Despesas</TabsTrigger>
                </TabsList>
                <TabsContent value="despesas" className="mt-4">
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">Despesas por Categoria</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {format(new Date(currentYear, currentMonth, card.closingDay), "dd 'de' MMMM", { locale: ptBR })} - {format(new Date(currentYear, currentMonth + 1, card.closingDay - 1), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <ExpensesPieChart transactions={filteredTransactions} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Details Section */}
            <div className="glass rounded-xl p-5 border border-border/50">
              <h3 className="font-semibold mb-4">Detalhes</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cartão</span>
                  <span className="font-medium">{card.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bandeira</span>
                  <span className="font-medium">{card.brand}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conta</span>
                  <span className="font-medium">{card.account}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Limite</span>
                  <span className="font-medium">{formatCurrency(card.limit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Charts Section */}
        <CreditCardExpenseCharts transactions={transactions} currentMonth={currentMonth} currentYear={currentYear} />

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Personalize sua visualização</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure como você quer ver suas transações
              </p>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* View Mode */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Modo de visualização</h4>
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
                    <span className="text-sm font-medium">Cards</span>
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
                    <span className="text-sm font-medium">Tabela</span>
                  </button>
                </div>
              </div>
              
              {/* Columns */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Colunas visíveis</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "descricao", label: "Descrição" },
                    { key: "responsavel", label: "Responsável" },
                    { key: "valor", label: "Valor" },
                    { key: "categoria", label: "Categoria" },
                    { key: "parcela", label: "Parcela" },
                    { key: "dataCompra", label: "Data Compra" },
                    { key: "fixoVariavel", label: "Fixo/Variável" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => toggleColumn(key as keyof typeof visibleColumns)}
                      className="flex items-center gap-2 py-1.5 text-sm"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        visibleColumns[key as keyof typeof visibleColumns]
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      )}>
                        {visibleColumns[key as keyof typeof visibleColumns] && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsSettingsOpen(false)} className="w-full">
                Salvar Preferências
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
