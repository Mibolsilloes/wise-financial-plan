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

// Cash flow data generators based on period
const getCashFlowData = (period: string) => {
  switch (period) {
    case "today":
      return [
        { period: "00:00", receitas: 0, despesas: 0, saldo: 0 },
        { period: "06:00", receitas: 150, despesas: 80, saldo: 70 },
        { period: "12:00", receitas: 320, despesas: 150, saldo: 170 },
        { period: "18:00", receitas: 180, despesas: 220, saldo: -40 },
        { period: "23:59", receitas: 100, despesas: 50, saldo: 50 },
      ];
    case "7days":
      return [
        { period: "Seg", receitas: 1200, despesas: 800, saldo: 400 },
        { period: "Ter", receitas: 950, despesas: 600, saldo: 350 },
        { period: "Qua", receitas: 1100, despesas: 750, saldo: 350 },
        { period: "Qui", receitas: 1300, despesas: 900, saldo: 400 },
        { period: "Sex", receitas: 1500, despesas: 1100, saldo: 400 },
        { period: "Sáb", receitas: 800, despesas: 400, saldo: 400 },
        { period: "Dom", receitas: 600, despesas: 300, saldo: 300 },
      ];
    case "month":
      return [
        { period: "Sem 1", receitas: 2500, despesas: 1800, saldo: 700 },
        { period: "Sem 2", receitas: 3200, despesas: 2100, saldo: 1100 },
        { period: "Sem 3", receitas: 2800, despesas: 1900, saldo: 900 },
        { period: "Sem 4", receitas: 3500, despesas: 2300, saldo: 1200 },
      ];
    case "year":
    default:
      return [
        { period: "Jan", receitas: 8500, despesas: 4200, saldo: 4300 },
        { period: "Fev", receitas: 8200, despesas: 4100, saldo: 4100 },
        { period: "Mar", receitas: 9000, despesas: 4800, saldo: 4200 },
        { period: "Abr", receitas: 8500, despesas: 4300, saldo: 4200 },
        { period: "Mai", receitas: 10200, despesas: 5100, saldo: 5100 },
        { period: "Jun", receitas: 8800, despesas: 4000, saldo: 4800 },
        { period: "Jul", receitas: 9100, despesas: 4500, saldo: 4600 },
        { period: "Ago", receitas: 8600, despesas: 4200, saldo: 4400 },
        { period: "Set", receitas: 9800, despesas: 5000, saldo: 4800 },
        { period: "Out", receitas: 8400, despesas: 3900, saldo: 4500 },
        { period: "Nov", receitas: 8700, despesas: 4700, saldo: 4000 },
        { period: "Dez", receitas: 10000, despesas: 4500, saldo: 5500 },
      ];
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
    <div className="space-y-3">
      {/* Toolbar - Compact */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md">
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 h-7 px-2 rounded-md text-xs">
            <SlidersHorizontal className="h-3 w-3" />
            Agrupar
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder={type === "receitas" ? "Buscar receitas..." : "Buscar despesas..."}
            className="pl-8 h-8 text-xs rounded-lg bg-muted/30 border-0 focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-md">
            Valor
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md">
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
          <FilterPopover>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md">
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </FilterPopover>
        </div>
      </div>

      {/* Table - Cleaner design */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/20">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {tableColumns.map((col) => (
                <TableHead key={col} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap h-9 px-3">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={tableColumns.length} className="h-28">
                <div className="flex flex-col items-center justify-center text-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-muted/80 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nenhum lançamento
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {type === "receitas" ? "Adicione uma receita para começar" : "Adicione uma despesa para começar"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Minimal */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Select defaultValue="30">
            <SelectTrigger className="h-7 w-20 text-xs border-0 bg-muted/50">
              <SelectValue placeholder="30" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>Total: 0</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled>
            <ChevronLeft className="h-3 w-3 mr-1" />
            Anterior
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled>
            Próximo
            <ChevronRight className="h-3 w-3 ml-1" />
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
            {/* Period Selector - Compact horizontal bar */}
            <div className="bg-gradient-to-r from-muted/80 to-muted/40 rounded-2xl p-3 border border-border/50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Month Navigation - More prominent */}
                <div className="flex items-center gap-1 bg-background rounded-xl px-2 py-1 shadow-sm">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-base font-bold min-w-[90px] text-center px-2">
                    {monthName}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Period Buttons - Pill style */}
                <div className="flex items-center gap-1 bg-background/60 rounded-full p-1">
                  {periodButtons.map((btn) => (
                    <Button
                      key={btn.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPeriod(btn.id)}
                      className={cn(
                        "text-xs rounded-full h-7 px-3 transition-all",
                        selectedPeriod === btn.id 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-muted"
                      )}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>

                {/* Actions - Grouped */}
                <div className="flex items-center gap-2">
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "gap-1.5 text-xs rounded-full h-7 bg-background",
                          selectedPeriod === "custom" && "border-primary"
                        )}
                      >
                        <CalendarIcon className="h-3 w-3" />
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
                  <div className="flex items-center bg-background rounded-full p-0.5">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-xs rounded-full h-7 px-2"
                      onClick={clearFilters}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Limpar</span>
                    </Button>
                    <FilterPopover>
                      <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0">
                        <Filter className="h-3.5 w-3.5" />
                      </Button>
                    </FilterPopover>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full h-7 w-7 p-0"
                      onClick={refresh}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards - New design with gradients and icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total a receber */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 p-5 border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">A Receber</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600/50 hover:text-emerald-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">R$ 0,00</span>
                  </div>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">{getDateRange()}</p>
                </div>
              </div>

              {/* Total a pagar */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20 p-5 border border-rose-200/50 dark:border-rose-800/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wide">A Pagar</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600/50 hover:text-rose-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-rose-700 dark:text-rose-300">R$ 0,00</span>
                  </div>
                  <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">{getDateRange()}</p>
                </div>
              </div>

              {/* Saldo - Combined card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/30 p-5 border border-slate-200/50 dark:border-slate-800/30">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium text-muted-foreground">Saldo Disponível</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">R$ 0,00</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Saldo Previsto</span>
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground/50" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Considerando lançamentos futuros</p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-xl font-bold text-primary">R$ 0,00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Transactions Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Receitas Pendentes */}
              <div className="bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Receitas pendentes</h3>
                      <p className="text-xs text-muted-foreground">Lançamentos a receber</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md"
                    onClick={() => setIsRevenueDialogOpen(true)}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    Nova Receita
                  </Button>
                </div>
                <div className="p-4">
                  {renderPendingTransactionsTable("receitas")}
                </div>
              </div>

              {/* Despesas Pendentes */}
              <div className="bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500/5 to-transparent border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Despesas pendentes</h3>
                      <p className="text-xs text-muted-foreground">Lançamentos a pagar</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-full bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-md"
                    onClick={() => setIsExpenseDialogOpen(true)}
                  >
                    <TrendingDown className="h-3.5 w-3.5" />
                    Nova Despesa
                  </Button>
                </div>
                <div className="p-4">
                  {renderPendingTransactionsTable("despesas")}
                </div>
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
                      const cashFlowData = getCashFlowData(selectedPeriod);
                      
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
