import { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FilterPopover } from "@/components/dashboard/FilterPopover";
import { AddRevenueDialog } from "@/components/dashboard/AddRevenueDialog";
import { AddExpenseDialog } from "@/components/dashboard/AddExpenseDialog";
import { usePeriod, PeriodType } from "@/contexts/PeriodContext";

const expenseData = [
  { name: "Casa", value: 1800, color: "hsl(340, 82%, 52%)" },
  { name: "Mercado", value: 650, color: "hsl(25, 95%, 53%)" },
  { name: "Transporte", value: 320, color: "hsl(45, 93%, 47%)" },
  { name: "Saúde", value: 450, color: "hsl(160, 84%, 39%)" },
  { name: "Lazer", value: 280, color: "hsl(217, 91%, 60%)" },
];

const incomeData = [
  { name: "Salário", value: 8500, color: "hsl(160, 84%, 39%)" },
  { name: "Freelance", value: 1200, color: "hsl(160, 84%, 50%)" },
  { name: "Investimentos", value: 350, color: "hsl(160, 84%, 60%)" },
];

const frequencyDataMonthly = [
  { period: "Jan", receitas: 8500, despesas: 4200 },
  { period: "Fev", receitas: 8500, despesas: 3800 },
  { period: "Mar", receitas: 9200, despesas: 4500 },
  { period: "Abr", receitas: 8500, despesas: 4100 },
  { period: "Mai", receitas: 10000, despesas: 5200 },
  { period: "Jun", receitas: 8500, despesas: 3900 },
  { period: "Jul", receitas: 8800, despesas: 4300 },
  { period: "Ago", receitas: 8500, despesas: 4000 },
  { period: "Set", receitas: 9500, despesas: 4800 },
  { period: "Out", receitas: 8500, despesas: 3700 },
  { period: "Nov", receitas: 8500, despesas: 4600 },
  { period: "Dez", receitas: 9700, despesas: 4230 },
];

const frequencyDataDaily = [
  { period: "01", receitas: 280, despesas: 150 },
  { period: "05", receitas: 350, despesas: 220 },
  { period: "10", receitas: 8500, despesas: 180 },
  { period: "15", receitas: 120, despesas: 450 },
  { period: "20", receitas: 200, despesas: 280 },
  { period: "25", receitas: 180, despesas: 320 },
  { period: "30", receitas: 150, despesas: 200 },
];

const monthAbbreviations = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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
        { period: "00:00", receitas: 0, despesas: 0, saldo: 0 },
        { period: "06:00", receitas: 150, despesas: 80, saldo: 70 },
        { period: "12:00", receitas: 320, despesas: 150, saldo: 170 },
        { period: "18:00", receitas: 180, despesas: 220, saldo: -40 },
        { period: "23:59", receitas: 100, despesas: 50, saldo: 50 },
      ];
    case "7days": {
      // Generate last 7 days ending on the 15th of current month (simulating current day)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const day = Math.max(1, 15 - i); // Simulating days ending on 15th
        const receitas = generateValue(day, 1100, 400);
        const despesas = generateValue(day, 700, 300);
        days.push({
          period: `${day} ${monthAbbr}`,
          receitas,
          despesas,
          saldo: receitas - despesas,
        });
      }
      return days;
    }
    case "month": {
      // Generate data points every 2 days for the month
      const days = [];
      for (let day = 2; day <= daysInMonth; day += 2) {
        const receitas = generateValue(day, 2200, 600);
        const despesas = generateValue(day, 1500, 400);
        days.push({
          period: `${day} ${monthAbbr}`,
          receitas,
          despesas,
          saldo: receitas - despesas,
        });
      }
      // Add last day if not already included
      if (daysInMonth % 2 !== 0) {
        const receitas = generateValue(daysInMonth, 2200, 600);
        const despesas = generateValue(daysInMonth, 1500, 400);
        days.push({
          period: `${daysInMonth} ${monthAbbr}`,
          receitas,
          despesas,
          saldo: receitas - despesas,
        });
      }
      return days;
    }
    case "year":
    default:
      return monthAbbreviations.map((abbr, idx) => {
        const receitas = generateValue(idx + 1, 8800, 1200);
        const despesas = generateValue(idx + 1, 4400, 600);
        return {
          period: abbr,
          receitas,
          despesas,
          saldo: receitas - despesas,
        };
      });
  }
};

const chartTypes = [
  { id: "area", label: "Área" },
  { id: "line", label: "Linha" },
  { id: "bar", label: "Coluna" },
  { id: "stacked", label: "Coluna empilhada" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
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
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const tableColumns = [
  "Responsável", "Descrição", "Valor", "Categoria", "Cartão", 
  "Vencimento", "Competência", "Pagamento", "Fixo/Variável", "Ação"
];

const periodButtons: { id: PeriodType; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "7days", label: "7 dias atrás" },
  { id: "month", label: "Esse mês" },
  { id: "year", label: "Esse ano" },
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

  const totalExpenses = expenseData.reduce((acc, item) => acc + item.value, 0);
  const totalIncome = incomeData.reduce((acc, item) => acc + item.value, 0);

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
            <Line type="monotone" dataKey="receitas" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="despesas" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
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
            <Bar dataKey="receitas" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
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
            <Bar dataKey="receitas" stackId="a" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" stackId="a" fill="hsl(0, 84%, 60%)" radius={[0, 0, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="receitas" stroke="hsl(160, 84%, 39%)" fillOpacity={1} fill="url(#colorReceitas)" />
            <Area type="monotone" dataKey="despesas" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorDespesas)" />
          </AreaChart>
        );
    }
  };

  const renderPendingTransactionsTable = (type: "receitas" | "despesas") => (
    <div className="space-y-4">
      {/* Controls Row - Dashboard style */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="w-4 h-4" />
          </Button>
          
          <Select defaultValue="none">
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Sem agrupamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem agrupamento</SelectItem>
              <SelectItem value="category">Categoria</SelectItem>
              <SelectItem value="date">Data de vencimento</SelectItem>
              <SelectItem value="responsible">Responsável</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={type === "receitas" ? "Buscar receitas..." : "Buscar despesas..."}
            className="pl-10 h-9"
          />
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <Select defaultValue="vencimento">
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Data de Vencimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vencimento">Data de Vencimento</SelectItem>
              <SelectItem value="competencia">Data de Competência</SelectItem>
              <SelectItem value="pagamento">Data de Pagamento</SelectItem>
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
                    Nenhum lançamento encontrado
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {type === "receitas" ? "Adicione uma receita para começar" : "Adicione uma despesa para começar"}
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
            Voltar
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próximo
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
              Lançamentos pendentes
            </TabsTrigger>
            <TabsTrigger 
              value="fluxo" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3 text-sm font-medium"
            >
              Fluxo de caixa
            </TabsTrigger>
          </TabsList>

          {/* Gráficos Tab */}
          <TabsContent value="graficos" className="mt-6 space-y-6">
            {/* Chart Management - Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <Settings2 className="h-4 w-4" />
                  <span className="text-sm">Gerenciar gráficos</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="glass rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "expenses", label: "Pizza - despesas" },
                      { key: "income", label: "Pizza - receitas" },
                      { key: "frequency", label: "Frequência receitas x despesas" },
                      { key: "expensesPaid", label: "Pizza - despesas pagas" },
                      { key: "expensesUnpaid", label: "Pizza - despesas não pagas" },
                      { key: "incomePaid", label: "Pizza - receitas pagas" },
                      { key: "incomeUnpaid", label: "Pizza - receitas não pagas" },
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
                  <h3 className="text-lg font-semibold mb-2">Despesas por categoria</h3>
                  <p className="text-xs text-muted-foreground mb-4">Dezembro 2024</p>
                  <div className="h-[200px] relative">
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
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
                  <h3 className="text-lg font-semibold mb-2">Receitas por categoria</h3>
                  <p className="text-xs text-muted-foreground mb-4">Dezembro 2024</p>
                  <div className="h-[200px] relative">
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-bold text-success">{formatCurrency(totalIncome)}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
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
                      <h3 className="text-lg font-semibold">Frequência</h3>
                      <p className="text-xs text-muted-foreground">Receitas x Despesas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Period Toggle - Diário / Mensal */}
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
                          Diário
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
                          Mensal
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
            </div>
          </TabsContent>

          {/* Lançamentos Pendentes Tab */}
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
                    Receita
                  </Button>
                  <Button 
                    className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => setIsExpenseDialogOpen(true)}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Despesa
                  </Button>
                </div>
              </div>

              {/* Summary Cards - Standard dashboard style */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* A Receber */}
                <div className="glass rounded-xl p-4 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">A Receber</span>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-2xl font-bold text-success">R$ 0,00</span>
                  <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
                </div>

                {/* A Pagar */}
                <div className="glass rounded-xl p-4 border border-destructive/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">A Pagar</span>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                  <span className="text-2xl font-bold text-destructive">R$ 0,00</span>
                  <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
                </div>

                {/* Saldo */}
                <div className="glass rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Saldo Previsto</span>
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary">R$ 0,00</span>
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
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={clearFilters}>
                  <Trash2 className="h-4 w-4" />
                  Limpar
                </Button>
                <Button variant="ghost" size="sm" className="h-8" onClick={refresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Transactions Tables - Two columns */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Receitas Pendentes */}
              <div className="glass rounded-xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Receitas pendentes</h3>
                      <p className="text-xs text-muted-foreground">Lançamentos a receber</p>
                    </div>
                  </div>
                </div>
                {renderPendingTransactionsTable("receitas")}
              </div>

              {/* Despesas Pendentes */}
              <div className="glass rounded-xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Despesas pendentes</h3>
                      <p className="text-xs text-muted-foreground">Lançamentos a pagar</p>
                    </div>
                  </div>
                </div>
                {renderPendingTransactionsTable("despesas")}
              </div>
            </div>

            {/* Dialogs */}
            <AddRevenueDialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen} />
            <AddExpenseDialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} />
          </TabsContent>

          {/* Fluxo de Caixa Tab */}
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
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button variant="ghost" size="sm" className="h-8 px-3 gap-1.5 text-xs rounded-lg" onClick={clearFilters}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Limpar
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
                    <h3 className="text-lg font-semibold">Gráfico de frequência Receitas X Despesas</h3>
                    <p className="text-sm text-muted-foreground">Visualize a frequência de receitas e despesas ao longo do tempo</p>
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
                              <Line type="monotone" dataKey="receitas" name="Receitas" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
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
                              <Bar dataKey="receitas" name="Receitas" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="despesas" name="Despesas" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
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
                              <Bar dataKey="receitas" name="Receitas" stackId="a" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="despesas" name="Despesas" stackId="a" fill="hsl(0, 84%, 60%)" />
                              {showSaldo && <Bar dataKey="saldo" name="Saldo" fill="hsl(217, 91%, 60%)" />}
                            </BarChart>
                          );
                        default:
                          return (
                            <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorReceitasCF" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorDespesasCF" x1="0" y1="0" x2="0" y2="1">
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
                              <Area type="monotone" dataKey="receitas" name="Receitas" stroke="hsl(160, 84%, 39%)" fillOpacity={1} fill="url(#colorReceitasCF)" />
                              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorDespesasCF)" />
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
