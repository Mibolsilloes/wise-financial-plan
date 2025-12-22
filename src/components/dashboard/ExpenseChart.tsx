import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const chartOptions = [
  { id: "all", label: "Todas (receitas + despesas)" },
  { id: "expenses", label: "Despesas por categoria" },
  { id: "income", label: "Receitas por categoria" },
  { id: "expenses-paid", label: "Despesas pagas" },
  { id: "expenses-unpaid", label: "Despesas não pagas" },
  { id: "income-received", label: "Receitas recebidas" },
  { id: "income-pending", label: "Receitas não recebidas" },
];

const expenseData = [
  { name: "Casa", value: 1800, color: "hsl(340, 82%, 52%)" },
  { name: "Mercado", value: 650, color: "hsl(25, 95%, 53%)" },
  { name: "Transporte", value: 320, color: "hsl(45, 93%, 47%)" },
  { name: "Saúde", value: 450, color: "hsl(160, 84%, 39%)" },
  { name: "Lazer", value: 280, color: "hsl(217, 91%, 60%)" },
  { name: "Outros", value: 180, color: "hsl(280, 65%, 60%)" },
];

const incomeData = [
  { name: "Salário", value: 8500, color: "hsl(160, 84%, 39%)" },
  { name: "Freelance", value: 1200, color: "hsl(160, 84%, 50%)" },
  { name: "Investimentos", value: 350, color: "hsl(160, 84%, 60%)" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass rounded-lg p-3 border border-border/50 shadow-lg">
        <p className="font-medium text-foreground">{data.name}</p>
        <p className="text-sm" style={{ color: data.payload.color }}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ExpenseChart() {
  const [selectedChart, setSelectedChart] = useState("expenses");
  
  const data = selectedChart.includes("income") ? incomeData : expenseData;
  const total = data.reduce((acc, item) => acc + item.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Análise</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              {chartOptions.find(o => o.id === selectedChart)?.label}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            {chartOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => setSelectedChart(option.id)}
                className={cn(
                  "cursor-pointer",
                  selectedChart === option.id && "bg-primary/10"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chart */}
      <div className="h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className={cn(
            "text-lg font-bold",
            selectedChart.includes("income") ? "text-success" : "text-destructive"
          )}>
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* Category List */}
      <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto">
        {data.map((item, index) => (
          <div 
            key={item.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
