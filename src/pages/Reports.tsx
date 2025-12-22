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

export default function Reports() {
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

  const totalExpenses = expenseData.reduce((acc, item) => acc + item.value, 0);
  const totalIncome = incomeData.reduce((acc, item) => acc + item.value, 0);

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visualize seus dados financeiros de forma detalhada
          </p>
        </div>

        {/* Chart Management */}
        <div className="glass rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Gerenciamento de gráficos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                />
                <Label htmlFor={chart.key} className="text-sm cursor-pointer">
                  {chart.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

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
      </div>
    </Layout>
  );
}
