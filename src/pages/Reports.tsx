import { useState } from "react";
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
  Calendar,
  Eraser,
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
import { cn } from "@/lib/utils";

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

const frequencyData = [
  { month: "Jan", receitas: 8500, despesas: 4200 },
  { month: "Fev", receitas: 8500, despesas: 3800 },
  { month: "Mar", receitas: 9200, despesas: 4500 },
  { month: "Abr", receitas: 8500, despesas: 4100 },
  { month: "Mai", receitas: 10000, despesas: 5200 },
  { month: "Jun", receitas: 8500, despesas: 3900 },
  { month: "Jul", receitas: 8800, despesas: 4300 },
  { month: "Ago", receitas: 8500, despesas: 4000 },
  { month: "Set", receitas: 9500, despesas: 4800 },
  { month: "Out", receitas: 8500, despesas: 3700 },
  { month: "Nov", receitas: 8500, despesas: 4600 },
  { month: "Dez", receitas: 9700, despesas: 4230 },
];

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

const periodButtons = [
  { id: "today", label: "Hoje" },
  { id: "7days", label: "7 dias atrás" },
  { id: "month", label: "Esse mês" },
  { id: "year", label: "Esse ano" },
];

const tableColumns = [
  "Responsável", "Descrição", "Valor", "Categoria", "Cartão", 
  "Vencimento", "Competência", "Pagamento", "Fixo/Variável", "Ação"
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("graficos");
  const [chartType, setChartType] = useState("area");
  const [charts, setCharts] = useState({
    expenses: true,
    income: true,
    frequency: true,
    expensesPaid: false,
    expensesUnpaid: false,
    incomePaid: false,
    incomeUnpaid: false,
  });
  
  // Lançamentos pendentes state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const totalExpenses = expenseData.reduce((acc, item) => acc + item.value, 0);
  const totalIncome = incomeData.reduce((acc, item) => acc + item.value, 0);

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

  const getDateRange = () => {
    const firstDay = 1;
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    return `${firstDay} De ${months[currentMonth]} - ${lastDay} De ${months[currentMonth]}`;
  };

  const renderFrequencyChart = () => {
    const commonProps = {
      data: frequencyData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-xs">Sem agrupamento</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={type === "receitas" ? "Pesquisar receitas..." : "Pesquisar despesas..."}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <span className="text-xs">Valor</span>
        </Button>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
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
              <TableCell colSpan={tableColumns.length} className="h-32">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <FileText className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Nenhuma transação encontrada
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Não há {type} para exibir no período selecionado.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue placeholder="Mostrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Mostrar 10</SelectItem>
              <SelectItem value="30">Mostrar 30</SelectItem>
              <SelectItem value="50">Mostrar 50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">Total: 0</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled>Voltar</Button>
          <Button variant="outline" size="sm" disabled>Próximo</Button>
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
          <TabsContent value="lancamentos" className="mt-6 space-y-6">
            {/* Period Selector */}
            <div className="glass rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[100px] text-center">
                    {months[currentMonth]}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Period Buttons */}
                <div className="flex items-center gap-1">
                  {periodButtons.map((btn) => (
                    <Button
                      key={btn.id}
                      variant={selectedPeriod === btn.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod(btn.id)}
                      className="text-xs"
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>

                {/* Date Range */}
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  01/01/{currentYear} - 31/01/{currentYear}
                </Button>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Eraser className="h-3.5 w-3.5" />
                    Limpar filtro
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total a receber */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-success text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span>Total a receber</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      <span className="text-2xl font-bold text-success">R$ 0,00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{getDateRange()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Total a pagar */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <TrendingDown className="h-4 w-4" />
                      <span>Total a pagar</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-bold text-destructive">R$ 0,00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{getDateRange()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Saldo */}
              <div className="glass rounded-xl p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-success text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>Saldo Disponível</span>
                      </div>
                      <span className="text-xl font-bold text-success">R$ 0,00</span>
                      <p className="text-xs text-muted-foreground">Receitas X Despesas</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">(Receita - Despesa + Saldo Bancário)</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <div className="flex items-center gap-2 text-success text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>Saldo Previsto</span>
                        <TooltipProvider>
                          <UITooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Saldo previsto considerando lançamentos futuros</p>
                            </TooltipContent>
                          </UITooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-xl font-bold text-success">R$ 0,00</span>
                      <p className="text-xs text-muted-foreground">Receitas X Despesas</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">(Receita - Despesa + Saldo Bancário)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Transactions Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Receitas Pendentes */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Receitas pendentes</h3>
                    <p className="text-xs text-muted-foreground">Lançamentos a receber</p>
                  </div>
                  <Button size="sm" className="bg-success hover:bg-success/90 text-white gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    Receita
                  </Button>
                </div>
                {renderPendingTransactionsTable("receitas")}
              </div>

              {/* Despesas Pendentes */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Despesas pendentes</h3>
                    <p className="text-xs text-muted-foreground">Lançamentos a pagar</p>
                  </div>
                  <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white gap-1.5">
                    <TrendingDown className="h-4 w-4" />
                    Despesa
                  </Button>
                </div>
                {renderPendingTransactionsTable("despesas")}
              </div>
            </div>
          </TabsContent>

          {/* Fluxo de Caixa Tab */}
          <TabsContent value="fluxo" className="mt-6">
            <div className="glass rounded-xl p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Em breve</h3>
              <p className="text-sm text-muted-foreground/70">
                O fluxo de caixa estará disponível em uma próxima atualização.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
