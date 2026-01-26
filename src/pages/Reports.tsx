import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Filter, 
  FileText,
  Settings,
  RefreshCw,
  Calendar as CalendarIcon,
  Trash2,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { es } from "date-fns/locale";
import { FilterPopover } from "@/components/dashboard/FilterPopover";
import { AddRevenueDialog } from "@/components/dashboard/AddRevenueDialog";
import { AddExpenseDialog } from "@/components/dashboard/AddExpenseDialog";
import { usePeriod, PeriodType } from "@/contexts/PeriodContext";
import { transactions, Transaction } from "@/data/mockData";

const frequencyDataMonthly = [
  { period: "Ene", ingresos: 8500, gastos: 4200 },
  { period: "Feb", ingresos: 8500, gastos: 3800 },
  { period: "Mar", ingresos: 9200, gastos: 4500 },
  { period: "Abr", ingresos: 8500, gastos: 4100 },
  { period: "May", ingresos: 10000, gastos: 5200 },
  { period: "Jun", ingresos: 8500, gastos: 3900 },
  { period: "Jul", ingresos: 8800, gastos: 4300 },
  { period: "Ago", ingresos: 8500, gastos: 4000 },
  { period: "Sep", ingresos: 9500, gastos: 4800 },
  { period: "Oct", ingresos: 8500, gastos: 3700 },
  { period: "Nov", ingresos: 8500, gastos: 4600 },
  { period: "Dic", ingresos: 9700, gastos: 4230 },
];

const frequencyDataDaily = [
  { period: "01", ingresos: 280, gastos: 150 },
  { period: "05", ingresos: 350, gastos: 220 },
  { period: "10", ingresos: 8500, gastos: 180 },
  { period: "15", ingresos: 120, gastos: 450 },
  { period: "20", ingresos: 200, gastos: 280 },
  { period: "25", ingresos: 180, gastos: 320 },
  { period: "30", ingresos: 150, gastos: 200 },
];

const monthAbbreviations = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Get days in month
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Cash flow data generators based on period
const getCashFlowData = (period: string, currentMonth: number, currentYear: number) => {
  const monthAbbr = monthAbbreviations[currentMonth];
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  
  // Generate random but consistent values based on day
  const generateValue = (day: number, base: number, variance: number) => {
    return Math.round(base + (Math.sin(day * 1.5) * variance));
  };

  switch (period) {
    case "today":
      return [
        { period: "00:00", ingresos: 0, gastos: 0, saldo: 0 },
        { period: "06:00", ingresos: 150, gastos: 80, saldo: 70 },
        { period: "12:00", ingresos: 320, gastos: 150, saldo: 170 },
        { period: "18:00", ingresos: 180, gastos: 220, saldo: -40 },
        { period: "23:59", ingresos: 100, gastos: 50, saldo: 50 },
      ];
    case "7days": {
      // Generate last 7 days ending on the 15th of current month (simulating current day)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const day = Math.max(1, 15 - i); // Simulating days ending on 15th
        const ingresos = generateValue(day, 1100, 400);
        const gastos = generateValue(day, 700, 300);
        days.push({
          period: `${day} ${monthAbbr}`,
          ingresos,
          gastos,
          saldo: ingresos - gastos,
        });
      }
      return days;
    }
    case "month": {
      // Generate data points every 2 days for the month
      const days = [];
      for (let day = 2; day <= daysInMonth; day += 2) {
        const ingresos = generateValue(day, 2200, 600);
        const gastos = generateValue(day, 1500, 400);
        days.push({
          period: `${day} ${monthAbbr}`,
          ingresos,
          gastos,
          saldo: ingresos - gastos,
        });
      }
      // Add last day if not already included
      if (daysInMonth % 2 !== 0) {
        const ingresos = generateValue(daysInMonth, 2200, 600);
        const gastos = generateValue(daysInMonth, 1500, 400);
        days.push({
          period: `${daysInMonth} ${monthAbbr}`,
          ingresos,
          gastos,
          saldo: ingresos - gastos,
        });
      }
      return days;
    }
    case "year":
    default:
      return monthAbbreviations.map((abbr, idx) => {
        const ingresos = generateValue(idx + 1, 8800, 1200);
        const gastos = generateValue(idx + 1, 4400, 600);
        return {
          period: abbr,
          ingresos,
          gastos,
          saldo: ingresos - gastos,
        };
      });
  }
};

const chartTypes = [
  { id: "area", label: "Área" },
  { id: "line", label: "Línea" },
  { id: "bar", label: "Columna" },
  { id: "stacked", label: "Columna apilada" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-border/50 shadow-lg">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const tableColumns = [
  "Responsable", "Descripción", "Importe", "Categoría", "Tarjeta", 
  "Vencimiento", "Aplicación", "Pago", "Fijo/Variable", "Acción"
];

const periodButtons: { id: PeriodType; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "7days", label: "Últimos 7 días" },
  { id: "month", label: "Este mes" },
  { id: "year", label: "Este año" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("graficos");
  const [chartType, setChartType] = useState("area");
  const [frequencyPeriod, setFrequencyPeriod] = useState<"daily" | "monthly">("monthly");
  const [showSaldo, setShowSaldo] = useState(true);
  const [cashFlowChartType, setCashFlowChartType] = useState("area");
  const [charts, setCharts] = useState({
    expenses: true,
    income: true,
    frequency: true,
    expensesPaid: false,
    expensesUnpaid: false,
    incomePaid: false,
    incomeUnpaid: false,
  });
  
  // Use global period context
  const {
    selectedPeriod,
    setSelectedPeriod,
    monthName,
    handlePrevMonth,
    handleNextMonth,
    dateRange,
    setDateRange,
    clearFilters,
    refresh,
    periodLabel,
    currentMonth,
    currentYear,
  } = usePeriod();

  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "7days":
        startDate = startOfDay(subDays(now, 6));
        endDate = endOfDay(now);
        break;
      case "month":
        startDate = startOfMonth(new Date(currentYear, currentMonth));
        endDate = endOfMonth(new Date(currentYear, currentMonth));
        break;
      case "year":
        startDate = startOfYear(new Date(currentYear, 0));
        endDate = endOfYear(new Date(currentYear, 11));
        break;
      case "custom":
        startDate = dateRange?.from || startOfMonth(now);
        endDate = dateRange?.to || endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(new Date(currentYear, currentMonth));
        endDate = endOfMonth(new Date(currentYear, currentMonth));
    }

    return transactions.filter(t => 
      isWithinInterval(t.dueDate, { start: startDate, end: endDate })
    );
  }, [selectedPeriod, currentMonth, currentYear, dateRange]);

  // Generate chart data from filtered transactions
  const expenseData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === "gasto");
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    expenses.forEach(t => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const incomeData = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === "ingreso");
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    income.forEach(t => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const expenseDataPaid = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === "gasto" && t.status === "pagado");
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    expenses.forEach(t => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const expenseDataUnpaid = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === "gasto" && t.status === "pendiente");
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    expenses.forEach(t => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const incomeDataPaid = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === "ingreso" && t.status === "cobrado");
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    income.forEach(t => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const incomeDataUnpaid = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === "ingreso" && t.status === "por_cobrar");
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    income.forEach(t => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Generate frequency data for charts
  const frequencyDataDaily = useMemo(() => {
    const days: { period: string; ingresos: number; gastos: number }[] = [];
    const dayMap = new Map<number, { ingresos: number; gastos: number }>();

    filteredTransactions.forEach(t => {
      const day = t.dueDate.getDate();
      const existing = dayMap.get(day) || { ingresos: 0, gastos: 0 };
      if (t.type === "ingreso") {
        existing.ingresos += t.amount;
      } else {
        existing.gastos += t.amount;
      }
      dayMap.set(day, existing);
    });

    Array.from(dayMap.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([day, data]) => {
        days.push({ period: `${day}`, ingresos: data.ingresos, gastos: data.gastos });
      });

    return days;
  }, [filteredTransactions]);

  const frequencyDataMonthly = useMemo(() => {
    const monthAbbr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthMap = new Map<number, { ingresos: number; gastos: number }>();

    filteredTransactions.forEach(t => {
      const month = t.dueDate.getMonth();
      const existing = monthMap.get(month) || { ingresos: 0, gastos: 0 };
      if (t.type === "ingreso") {
        existing.ingresos += t.amount;
      } else {
        existing.gastos += t.amount;
      }
      monthMap.set(month, existing);
    });

    return monthAbbr.map((abbr, idx) => {
      const data = monthMap.get(idx) || { ingresos: 0, gastos: 0 };
      return { period: abbr, ingresos: data.ingresos, gastos: data.gastos };
    });
  }, [filteredTransactions]);

  const totalExpenses = expenseData.reduce((acc, item) => acc + item.value, 0);
  const totalIncome = incomeData.reduce((acc, item) => acc + item.value, 0);
  const totalExpensesPaid = expenseDataPaid.reduce((acc, item) => acc + item.value, 0);
  const totalExpensesUnpaid = expenseDataUnpaid.reduce((acc, item) => acc + item.value, 0);
  const totalIncomePaid = incomeDataPaid.reduce((acc, item) => acc + item.value, 0);
  const totalIncomeUnpaid = incomeDataUnpaid.reduce((acc, item) => acc + item.value, 0);

  // Sync frequency chart period with selected period
  useEffect(() => {
    if (selectedPeriod === "today" || selectedPeriod === "7days") {
      setFrequencyPeriod("daily");
    } else if (selectedPeriod === "month" || selectedPeriod === "year") {
      setFrequencyPeriod("monthly");
    }
  }, [selectedPeriod]);

  const handleDateRangeSelect = (range: typeof dateRange) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setSelectedPeriod("custom");
      setIsCalendarOpen(false);
    }
  };

  const formatDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "dd/MM/yy")} - ${format(dateRange.to, "dd/MM/yy")}`;
    }
    return periodLabel;
  };

  const getDateRange = () => {
    return periodLabel;
  };

  const renderFrequencyChart = () => {
    const frequencyData = frequencyPeriod === "daily" ? frequencyDataDaily : frequencyDataMonthly;
    const commonProps = {
      data: frequencyData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="gastos" name="Gastos" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="ingresos" name="Ingresos" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" name="Gastos" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "stacked":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="ingresos" name="Ingresos" stackId="a" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" name="Gastos" stackId="a" fill="hsl(0, 84%, 60%)" radius={[0, 0, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="hsl(160, 84%, 39%)" fillOpacity={1} fill="url(#colorIngresos)" />
            <Area type="monotone" dataKey="gastos" name="Gastos" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorGastos)" />
          </AreaChart>
        );
    }
  };

  const renderPendingTransactionsTable = (type: "ingresos" | "gastos") => (
    <div className="space-y-4">
      {/* Controls Row - Dashboard style */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="w-4 h-4" />
          </Button>
          
          <Select defaultValue="none">
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Sin agrupar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin agrupar</SelectItem>
              <SelectItem value="category">Categoría</SelectItem>
              <SelectItem value="date">Fecha de vencimiento</SelectItem>
              <SelectItem value="responsible">Responsable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={type === "ingresos" ? "Buscar ingresos..." : "Buscar gastos..."}
            className="pl-10 h-9"
          />
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <Select defaultValue="vencimiento">
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Fecha de vencimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vencimiento">Fecha de vencimiento</SelectItem>
              <SelectItem value="aplicacion">Fecha de aplicación</SelectItem>
              <SelectItem value="pago">Fecha de pago</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9">
            <ArrowUpDown className="w-4 h-4" />
          </Button>

          <FilterPopover>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4" />
            </Button>
          </FilterPopover>
        </div>
      </div>

      {/* Table - Dashboard style */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {tableColumns.map((col) => (
                <TableHead key={col} className="text-xs font-medium whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={tableColumns.length} className="h-[200px]">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    No se encontraron movimientos
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {type === "ingresos" ? "Añade un ingreso para comenzar" : "Añade un gasto para comenzar"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Dashboard style */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mostrar</span>
          <Select defaultValue="30">
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground">Total: 0</span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-6">
            <TabsTrigger 
              value="graficos" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 text-sm font-medium"
            >
              Gráficos
            </TabsTrigger>
            <TabsTrigger 
              value="lancamentos" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 text-sm font-medium"
            >
              Movimientos pendientes
            </TabsTrigger>
            <TabsTrigger 
              value="fluxo" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 text-sm font-medium"
            >
              Flujo de caja
            </TabsTrigger>
          </TabsList>

          {/* Gráficos Tab */}
          <TabsContent value="graficos" className="mt-6 space-y-6">
            {/* Period Selector */}
            <div className="glass rounded-xl p-4 animate-fade-in">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[100px] text-center">
                    {monthName}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Period Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {periodButtons.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                        selectedPeriod === period.id
                          ? "bg-primary text-primary-foreground border-primary shadow-glow-primary"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      )}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center gap-4 lg:ml-auto">
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal gap-2",
                          selectedPeriod === "custom" && "border-primary"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {formatDateRange()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={2}
                        locale={es}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Action Buttons */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={clearFilters}
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpiar filtro
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={refresh}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                  </Button>
                </div>
              </div>
            </div>

            {/* Chart Management - Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <Settings2 className="h-4 w-4" />
                  <span className="text-sm">Gestionar gráficos</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="glass rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "expenses", label: "Tarta - gastos" },
                      { key: "income", label: "Tarta - ingresos" },
                      { key: "frequency", label: "Frecuencia ingresos x gastos" },
                      { key: "expensesPaid", label: "Tarta - gastos pagados" },
                      { key: "expensesUnpaid", label: "Tarta - gastos no pagados" },
                      { key: "incomePaid", label: "Tarta - ingresos cobrados" },
                      { key: "incomeUnpaid", label: "Tarta - ingresos no cobrados" },
                    ].map((chart) => (
                      <div key={chart.key} className="flex items-center space-x-2">
                        <Switch
                          id={chart.key}
                          checked={charts[chart.key as keyof typeof charts]}
                          onCheckedChange={(checked) => setCharts({ ...charts, [chart.key]: checked })}
                          className="scale-90"
                        />
                        <Label htmlFor={chart.key} className="text-xs cursor-pointer text-muted-foreground">
                          {chart.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Expenses Pie */}
              {charts.expenses && (
                <div className="glass rounded-xl p-5 animate-scale-in">
                  <h3 className="text-lg font-semibold mb-2">Gastos por categoría</h3>
                  <p className="text-xs text-muted-foreground mb-4">{periodLabel}</p>
                  <div className="h-[200px] relative">
                    {expenseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Sin datos en este período</p>
                      </div>
                    )}
                    {expenseData.length > 0 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto">
                    {expenseData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Income Pie */}
              {charts.income && (
                <div className="glass rounded-xl p-5 animate-scale-in" style={{ animationDelay: "100ms" }}>
                  <h3 className="text-lg font-semibold mb-2">Ingresos por categoría</h3>
                  <p className="text-xs text-muted-foreground mb-4">{periodLabel}</p>
                  <div className="h-[200px] relative">
                    {incomeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {incomeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Sin datos en este período</p>
                      </div>
                    )}
                    {incomeData.length > 0 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-success">{formatCurrency(totalIncome)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto">
                    {incomeData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequency Chart */}
              {charts.frequency && (
                <div className="glass rounded-xl p-5 lg:col-span-1 animate-scale-in" style={{ animationDelay: "200ms" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Frecuencia</h3>
                      <p className="text-xs text-muted-foreground">{periodLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Period Toggle - Diario / Mensual */}
                      <div className="flex items-center bg-muted rounded-lg p-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFrequencyPeriod("daily")}
                          className={cn(
                            "h-7 px-3 text-xs rounded-md transition-all",
                            frequencyPeriod === "daily"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Diario
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFrequencyPeriod("monthly")}
                          className={cn(
                            "h-7 px-3 text-xs rounded-md transition-all",
                            frequencyPeriod === "monthly"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Mensual
                        </Button>
                      </div>
                      <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {chartTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {renderFrequencyChart()}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Expenses Paid Pie */}
              {charts.expensesPaid && (
                <div className="glass rounded-xl p-5 animate-scale-in">
                  <h3 className="text-lg font-semibold mb-2">Gastos pagados</h3>
                  <p className="text-xs text-muted-foreground mb-4">{periodLabel}</p>
                  <div className="h-[200px] relative">
                    {expenseDataPaid.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseDataPaid}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {expenseDataPaid.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Sin datos en este período</p>
                      </div>
                    )}
                    {expenseDataPaid.length > 0 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-destructive">{formatCurrency(totalExpensesPaid)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto">
                    {expenseDataPaid.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expenses Unpaid Pie */}
              {charts.expensesUnpaid && (
                <div className="glass rounded-xl p-5 animate-scale-in">
                  <h3 className="text-lg font-semibold mb-2">Gastos no pagados</h3>
                  <p className="text-xs text-muted-foreground mb-4">{periodLabel}</p>
                  <div className="h-[200px] relative">
                    {expenseDataUnpaid.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseDataUnpaid}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {expenseDataUnpaid.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Sin datos en este período</p>
                      </div>
                    )}
                    {expenseDataUnpaid.length > 0 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-warning">{formatCurrency(totalExpensesUnpaid)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto">
                    {expenseDataUnpaid.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Income Paid Pie */}
              {charts.incomePaid && (
                <div className="glass rounded-xl p-5 animate-scale-in">
                  <h3 className="text-lg font-semibold mb-2">Ingresos cobrados</h3>
                  <p className="text-xs text-muted-foreground mb-4">{periodLabel}</p>
                  <div className="h-[200px] relative">
                    {incomeDataPaid.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeDataPaid}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {incomeDataPaid.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Sin datos en este período</p>
                      </div>
                    )}
                    {incomeDataPaid.length > 0 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-success">{formatCurrency(totalIncomePaid)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto">
                    {incomeDataPaid.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Income Unpaid Pie */}
              {charts.incomeUnpaid && (
                <div className="glass rounded-xl p-5 animate-scale-in">
                  <h3 className="text-lg font-semibold mb-2">Ingresos no cobrados</h3>
                  <p className="text-xs text-muted-foreground mb-4">{periodLabel}</p>
                  <div className="h-[200px] relative">
                    {incomeDataUnpaid.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeDataUnpaid}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {incomeDataUnpaid.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Sin datos en este período</p>
                      </div>
                    )}
                    {incomeDataUnpaid.length > 0 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-warning">{formatCurrency(totalIncomeUnpaid)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto">
                    {incomeDataUnpaid.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Movimientos Pendientes Tab */}
          <TabsContent value="lancamentos" className="mt-6 space-y-5">
            {/* Header with Month Navigation and Summary Cards - Dashboard style */}
            <div className="glass rounded-xl p-5 animate-slide-up">
              {/* Header with Month Navigation and Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[100px] text-center">
                    {monthName}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button 
                    className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => setIsRevenueDialogOpen(true)}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Ingreso
                  </Button>
                  <Button 
                    className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => setIsExpenseDialogOpen(true)}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Gasto
                  </Button>
                </div>
              </div>

              {/* Summary Cards - Standard dashboard style */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Por Cobrar */}
                <div className="glass rounded-xl p-4 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Por Cobrar</span>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-2xl font-bold text-success">€ 0,00</span>
                  <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
                </div>

                {/* Por Pagar */}
                <div className="glass rounded-xl p-4 border border-destructive/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Por Pagar</span>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                  <span className="text-2xl font-bold text-destructive">€ 0,00</span>
                  <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
                </div>

                {/* Saldo */}
                <div className="glass rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Saldo Previsto</span>
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary">€ 0,00</span>
                  <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
                </div>
              </div>

              {/* Period Buttons */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {periodButtons.map((btn) => (
                  <Button
                    key={btn.id}
                    variant={selectedPeriod === btn.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(btn.id)}
                    className="h-8"
                  >
                    {btn.label}
                  </Button>
                ))}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={selectedPeriod === "custom" ? "default" : "outline"}
                      size="sm"
                      className="gap-2 h-8"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {formatDateRange()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                      locale={es}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={clearFilters}>
                  <Trash2 className="h-4 w-4" />
                  Limpiar
                </Button>
                <Button variant="ghost" size="sm" className="h-8" onClick={refresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Transactions Tables - Two columns */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Ingresos Pendientes */}
              <div className="glass rounded-xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Ingresos pendientes</h3>
                      <p className="text-xs text-muted-foreground">Movimientos por cobrar</p>
                    </div>
                  </div>
                </div>
                {renderPendingTransactionsTable("ingresos")}
              </div>

              {/* Gastos Pendientes */}
              <div className="glass rounded-xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Gastos pendientes</h3>
                      <p className="text-xs text-muted-foreground">Movimientos por pagar</p>
                    </div>
                  </div>
                </div>
                {renderPendingTransactionsTable("gastos")}
              </div>
            </div>

            {/* Dialogs */}
            <AddRevenueDialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen} />
            <AddExpenseDialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} />
          </TabsContent>

          {/* Flujo de Caja Tab */}
          <TabsContent value="fluxo" className="mt-6 space-y-5">
            {/* Period Selector Bar */}
            <div className="bg-gradient-to-r from-primary/5 via-background to-accent/5 rounded-2xl p-4 border border-border/40 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Month Navigation */}
                <div className="flex items-center gap-2 bg-background/80 rounded-xl px-3 py-1.5 shadow-sm border border-border/30">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold min-w-[100px] text-center">
                    {monthName}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Period Buttons */}
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-xl p-1">
                  {periodButtons.map((btn) => (
                    <Button
                      key={btn.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPeriod(btn.id)}
                      className={cn(
                        "text-xs rounded-lg h-8 px-4 transition-all font-medium",
                        selectedPeriod === btn.id 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-background/80"
                      )}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-3 gap-2 text-xs rounded-lg border-border/50">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {formatDateRange()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={2}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button variant="ghost" size="sm" className="h-8 px-3 gap-1.5 text-xs rounded-lg" onClick={clearFilters}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Limpiar
                  </Button>
                  <FilterPopover>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </FilterPopover>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={refresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-background rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              {/* Chart Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 p-5 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Gráfico de frecuencia Ingresos X Gastos</h3>
                    <p className="text-sm text-muted-foreground">Visualiza la frecuencia de ingresos y gastos a lo largo del tiempo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Toggle Saldo */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaldo(!showSaldo)}
                    className={cn(
                      "h-8 px-3 gap-2 text-xs rounded-lg border-border/50 transition-all",
                      showSaldo ? "bg-muted" : ""
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showSaldo ? "Ocultar Saldo" : "Mostrar Saldo"}
                  </Button>
                  
                  {/* Chart Type */}
                  <Select value={cashFlowChartType} onValueChange={setCashFlowChartType}>
                    <SelectTrigger className="w-28 h-8 text-xs rounded-lg border-border/50">
                      <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Chart Area */}
              <div className="p-5">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      const cashFlowData = getCashFlowData(selectedPeriod, currentMonth, currentYear);
                      
                      switch (cashFlowChartType) {
                        case "line":
                          return (
                            <LineChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="gastos" name="Gastos" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
                              {showSaldo && <Line type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} />}
                            </LineChart>
                          );
                        case "bar":
                          return (
                            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="ingresos" name="Ingresos" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="gastos" name="Gastos" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                              {showSaldo && <Bar dataKey="saldo" name="Saldo" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />}
                            </BarChart>
                          );
                        case "stacked":
                          return (
                            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="ingresos" name="Ingresos" stackId="a" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="gastos" name="Gastos" stackId="a" fill="hsl(0, 84%, 60%)" />
                              {showSaldo && <Bar dataKey="saldo" name="Saldo" fill="hsl(217, 91%, 60%)" />}
                            </BarChart>
                          );
                        default:
                          return (
                            <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorIngresosCF" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorGastosCF" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSaldoCF" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="hsl(160, 84%, 39%)" fillOpacity={1} fill="url(#colorIngresosCF)" />
                              <Area type="monotone" dataKey="gastos" name="Gastos" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorGastosCF)" />
                              {showSaldo && <Area type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(217, 91%, 60%)" fillOpacity={1} fill="url(#colorSaldoCF)" />}
                            </AreaChart>
                          );
                      }
                    })()}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Dialogs */}
            <AddRevenueDialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen} />
            <AddExpenseDialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
