import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
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
  TrendingDown,
  Pencil
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
import { EditTransactionDialog } from "@/components/dashboard/EditTransactionDialog";
import { DeleteTransactionDialog } from "@/components/dashboard/DeleteTransactionDialog";
import { useFilters } from "@/contexts/FilterContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Transaction } from "@/data/mockData";
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

type GroupingOption = "none" | "categoria" | "vencimiento" | "responsable";

const groupingLabels: Record<GroupingOption, string> = {
  none: "Sin agrupación",
  categoria: "Categoría",
  vencimiento: "Fecha de vencimiento",
  responsable: "Responsable",
};

type SortOption = "creacion" | "vencimiento" | "valor";

const sortLabels: Record<SortOption, string> = {
  creacion: "Fecha de creación",
  vencimiento: "Fecha de vencimiento",
  valor: "Importe",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
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
  "1": { name: "Santander Platinum", brand: "Mastercard", limit: 15000, closingDay: 3, dueDay: 10, account: "Santander" },
  "2": { name: "BBVA Aqua", brand: "Visa", limit: 8000, closingDay: 15, dueDay: 22, account: "BBVA" },
  "3": { name: "CaixaBank Visa", brand: "Visa", limit: 5000, closingDay: 20, dueDay: 27, account: "CaixaBank" },
};

const brandColors: Record<string, string> = {
  "Mastercard": "hsl(25, 95%, 53%)",
  "Visa": "hsl(217, 91%, 60%)",
  "American Express": "hsl(199, 89%, 48%)",
};

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const categoryColors: Record<string, string> = {
  "Streaming": "hsl(280, 70%, 50%)",
  "Supermercado": "hsl(140, 70%, 45%)",
  "Electrónica": "hsl(200, 80%, 50%)",
  "Alimentación": "hsl(25, 90%, 55%)",
  "Transporte": "hsl(45, 90%, 50%)",
  "Salud": "hsl(340, 70%, 50%)",
  "Ocio": "hsl(170, 60%, 45%)",
  "Otros": "hsl(220, 15%, 55%)",
};

// Local transaction type for this page
interface LocalTransaction {
  id: string;
  descripcion: string;
  responsable: string;
  valor: number;
  categoria: string;
  parcela: string;
  dataCompra: string;
  fixoVariavel: string;
  status: string;
}

interface ExpensesPieChartProps {
  transactions: LocalTransaction[];
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
          No hay datos suficientes para mostrar este gráfico.
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
        <p className="text-[10px] text-muted-foreground">Total de la factura</p>
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

const monthAbbreviations = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

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

// Generate daily expense data for a specific month
const generateDailyExpenseData = (transactions: any[], month: number, year: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthAbbr = monthAbbreviations[month];
  
  // Create base data for all days in the month
  const dailyData = Array.from({ length: daysInMonth }, (_, idx) => ({
    period: `${idx + 1} ${monthAbbr}`,
    despesas: 0,
  }));
  
  // Aggregate transactions by day
  transactions.forEach((t) => {
    const date = parseISO(t.dataCompra);
    if (date.getMonth() === month && date.getFullYear() === year) {
      const dayIdx = date.getDate() - 1;
      dailyData[dayIdx].despesas += Math.abs(t.valor);
    }
  });
  
  return dailyData;
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

  const chartData = useMemo(() => {
    if (chartPeriod === "daily") {
      return generateDailyExpenseData(transactions, currentMonth, currentYear);
    }
    return generateMonthlyExpenseData(transactions);
  }, [transactions, chartPeriod, currentMonth, currentYear]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-border/50 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              Gastos: {formatCurrency(entry.value)}
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
              formatter={() => <span className="text-xs text-muted-foreground">Gastos</span>}
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
              formatter={() => <span className="text-xs text-muted-foreground">Gastos</span>}
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
              formatter={() => <span className="text-xs text-muted-foreground">Gastos</span>}
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
                  <h3 className="font-semibold text-sm">Gastos de la Tarjeta</h3>
                  <p className="text-xs text-muted-foreground">Visualiza los gastos a lo largo del tiempo</p>
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
                  <SelectItem value="bar">Columna</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="line">Línea</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartPeriod} onValueChange={(v) => setChartPeriod(v as any)}>
                <SelectTrigger className="h-8 w-[100px] text-xs border-border/50">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="daily">Diario</SelectItem>
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
  const { filters, clearFilters, hasActiveFilters } = useFilters();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [grouping, setGrouping] = useState<GroupingOption>("none");
  const [sortBy, setSortBy] = useState<SortOption>("valor");
  const [itemsPerPage, setItemsPerPage] = useState<30 | 50 | 100>(30);
  
  // Dialog states for edit/delete
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [visibleColumns, setVisibleColumns] = useState({
    descripcion: true,
    responsable: true,
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

  // Mock transactions with UUID IDs - must be before early return for hooks rules
  const transactions: LocalTransaction[] = useMemo(() => [
    { id: "cc-txn-001", descripcion: "Netflix", responsable: "Carlos", valor: -55.90, categoria: "Streaming", parcela: "1/1", dataCompra: "2026-01-05", fixoVariavel: "Fijo", status: "pendiente" },
    { id: "cc-txn-002", descripcion: "Supermercado Mercadona", responsable: "María", valor: -320.00, categoria: "Supermercado", parcela: "1/1", dataCompra: "2026-01-10", fixoVariavel: "Variable", status: "pendiente" },
    { id: "cc-txn-003", descripcion: "iPhone 15 Pro", responsable: "Carlos", valor: -899.90, categoria: "Electrónica", parcela: "3/12", dataCompra: "2025-11-15", fixoVariavel: "Variable", status: "pendiente" },
    { id: "cc-txn-004", descripcion: "Spotify Family", responsable: "María", valor: -34.90, categoria: "Streaming", parcela: "1/1", dataCompra: "2026-01-08", fixoVariavel: "Fijo", status: "pendiente" },
    { id: "cc-txn-005", descripcion: "Restaurante Lateral", responsable: "Carlos", valor: -189.00, categoria: "Alimentación", parcela: "1/1", dataCompra: "2026-01-12", fixoVariavel: "Variable", status: "pendiente" },
  ], []);

  // Filtered transactions based on filters and search - must be before early return
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Filter by category
    if (filters.category && filters.category !== "todas") {
      result = result.filter((t) => t.categoria === filters.category);
    }

    // Filter by payment status
    if (filters.paymentStatus !== "todos") {
      result = result.filter((t) => {
        if (filters.paymentStatus === "pago") {
          return t.status === "pagado";
        }
        return t.status === "pendiente";
      });
    }

    // Filter by responsible
    if (filters.responsible) {
      result = result.filter((t) => t.responsable === filters.responsible);
    }

    // Filter by transaction type (fixed/variable)
    if (filters.transactionType !== "todos") {
      const expectedType = filters.transactionType === "fijas" ? "Fijo" : "Variable";
      result = result.filter((t) => t.fixoVariavel === expectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.descripcion.toLowerCase().includes(query) ||
        t.responsable.toLowerCase().includes(query) ||
        t.categoria.toLowerCase().includes(query)
      );
    }

    return result;
  }, [transactions, filters, searchQuery]);
  
  if (!card) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <p>Tarjeta no encontrada</p>
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
    status: "Abierta",
    statusColor: "warning",
    total: 2450.75,
    closingDate: card.closingDay,
    dueDate: card.dueDay,
  };
  // Convert local transaction to global Transaction format for dialogs
  const convertToGlobalTransaction = (t: LocalTransaction): Transaction => ({
    id: t.id,
    type: "gasto",
    description: t.descripcion,
    amount: Math.abs(t.valor),
    category: t.categoria,
    subcategory: t.categoria,
    account: card.account,
    creditCard: card.name,
    responsible: t.responsable,
    dueDate: parseISO(t.dataCompra),
    paymentDate: undefined,
    competenceDate: parseISO(t.dataCompra),
    status: t.status === "pagado" ? "pagado" : "pendiente",
    isFixed: t.fixoVariavel === "Fijo",
    color: "hsl(340, 82%, 52%)",
  });

  const handleEdit = (transaction: LocalTransaction) => {
    setSelectedTransaction(convertToGlobalTransaction(transaction));
    setEditDialogOpen(true);
  };

  const handleDelete = (transaction: LocalTransaction) => {
    setSelectedTransaction(convertToGlobalTransaction(transaction));
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = () => {
    switch (invoiceData.status) {
      case "Cerrada":
        return <Badge className="bg-success/10 text-success border-success/20">Cerrada</Badge>;
      case "Pagada":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Pagada</Badge>;
      case "Parcial":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Parcial</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">Abierta</Badge>;
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
            Volver
          </button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">
              Factura {months[currentMonth]} {currentYear}
            </h1>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 text-xs"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar filtro
            </Button>
            <FilterPopover>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Filter className="w-3.5 h-3.5" />
              </Button>
            </FilterPopover>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
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
                <p className="text-xs text-muted-foreground mb-2">Estado de la Factura</p>
                <p className="text-2xl font-bold text-warning">{invoiceData.status}</p>
                <p className="text-xs text-muted-foreground mt-1">Factura {invoiceData.status.toLowerCase()}</p>
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
                <p className="text-xs text-muted-foreground mb-2">Importe de la factura</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(invoiceData.total)}</p>
                <p className="text-xs text-muted-foreground mt-1">Valor total de la factura</p>
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
                <p className="text-xs text-muted-foreground mb-2">Fechas de la factura</p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-bold">Día {invoiceData.closingDate}</p>
                    <p className="text-xs text-muted-foreground">Cierre</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-2xl font-bold">Día {invoiceData.dueDate}</p>
                    <p className="text-xs text-muted-foreground">Vencimiento</p>
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
                <h2 className="text-lg font-semibold">Factura {months[currentMonth]}</h2>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(currentYear, currentMonth, card.closingDay), "dd 'de' MMMM", { locale: es })} - {format(new Date(currentYear, currentMonth + 1, card.closingDay - 1), "dd 'de' MMMM", { locale: es })}
                </p>
              </div>
              <Button className="gap-2 bg-destructive hover:bg-destructive/90">
                <Plus className="w-4 h-4" />
                Gasto Tarjeta
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
                  placeholder="Buscar transacciones..."
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "h-8 gap-1.5 text-xs relative",
                    hasActiveFilters && "border-primary"
                  )}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </FilterPopover>
            </div>

            {/* Transactions Table */}
            <div className="glass rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    {visibleColumns.responsable && <TableHead className="text-xs font-medium">Responsable</TableHead>}
                    {visibleColumns.descripcion && <TableHead className="text-xs font-medium">Descripción</TableHead>}
                    {visibleColumns.valor && <TableHead className="text-xs font-medium">Importe</TableHead>}
                    {visibleColumns.categoria && <TableHead className="text-xs font-medium">Categoría</TableHead>}
                    {visibleColumns.parcela && <TableHead className="text-xs font-medium">Cuota</TableHead>}
                    {visibleColumns.dataCompra && <TableHead className="text-xs font-medium">Fecha Compra</TableHead>}
                    {visibleColumns.fixoVariavel && <TableHead className="text-xs font-medium">Fijo/Variable</TableHead>}
                    <TableHead className="text-xs font-medium">Acción</TableHead>
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
                          <p className="font-medium text-sm">No se encontraron transacciones</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            No hay transacciones para mostrar en el período seleccionado.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-border/50">
                        {visibleColumns.responsable && <TableCell className="text-xs">{transaction.responsable}</TableCell>}
                        {visibleColumns.descripcion && <TableCell className="text-xs font-medium">{transaction.descripcion}</TableCell>}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Settings className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                              <DropdownMenuItem 
                                onClick={() => handleEdit(transaction)}
                                className="cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(transaction)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                  Anterior
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                  Siguiente
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
                  <TabsTrigger value="despesas" className="flex-1 text-xs">Gastos</TabsTrigger>
                </TabsList>
                <TabsContent value="despesas" className="mt-4">
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">Gastos por Categoría</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {format(new Date(currentYear, currentMonth, card.closingDay), "dd 'de' MMMM", { locale: es })} - {format(new Date(currentYear, currentMonth + 1, card.closingDay - 1), "dd 'de' MMMM", { locale: es })}
                    </p>
                    <ExpensesPieChart transactions={filteredTransactions} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Expense Charts Section */}
            <CreditCardExpenseCharts transactions={transactions} currentMonth={currentMonth} currentYear={currentYear} />

            {/* Details Section */}
            <div className="glass rounded-xl p-5 border border-border/50">
              <h3 className="font-semibold mb-4">Detalles</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tarjeta</span>
                  <span className="font-medium">{card.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Marca</span>
                  <span className="font-medium">{card.brand}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cuenta</span>
                  <span className="font-medium">{card.account}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Límite</span>
                  <span className="font-medium">{formatCurrency(card.limit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Personaliza tu visualización</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configura cómo quieres ver tus transacciones
              </p>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* View Mode */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Modo de visualización</h4>
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
                    <span className="text-sm font-medium">Tabla</span>
                  </button>
                </div>
              </div>
              
              {/* Columns */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Columnas visibles</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "descripcion", label: "Descripción" },
                    { key: "responsable", label: "Responsable" },
                    { key: "valor", label: "Importe" },
                    { key: "categoria", label: "Categoría" },
                    { key: "parcela", label: "Cuota" },
                    { key: "dataCompra", label: "Fecha Compra" },
                    { key: "fixoVariavel", label: "Fijo/Variable" },
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
                Guardar Preferencias
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Dialog */}
        <EditTransactionDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
        />

        {/* Delete Transaction Dialog */}
        <DeleteTransactionDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
        />
      </div>
    </Layout>
  );
}
