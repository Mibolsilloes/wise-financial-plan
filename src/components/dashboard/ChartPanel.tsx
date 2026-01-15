import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePeriod } from "@/contexts/PeriodContext";

const chartTabs = [
  { id: "all", label: "Todas" },
  { id: "receitas", label: "Receitas" },
  { id: "despesas", label: "Despesas" },
  { id: "despesas-nao-pagas", label: "Despesas Não Pagas" },
  { id: "despesas-pagas", label: "Despesas Pagas" },
  { id: "receitas-nao-pagas", label: "Receitas Não Pagas" },
  { id: "receitas-pagas", label: "Receitas Pagas" },
];

const sampleData = [
  { name: "Casa", value: 1800, color: "hsl(340, 82%, 52%)" },
  { name: "Mercado", value: 650, color: "hsl(25, 95%, 53%)" },
  { name: "Transporte", value: 320, color: "hsl(45, 93%, 47%)" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass rounded-lg p-3 shadow-lg">
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

export function ChartPanel() {
  const [selectedTab, setSelectedTab] = useState("receitas-pagas");
  const { periodLabel } = usePeriod();
  
  const hasData = false; // Set to true when there's actual data

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTabLabel = () => {
    return chartTabs.find(t => t.id === selectedTab)?.label || "Receitas Pagas";
  };

  return (
    <div className="glass rounded-xl p-5 animate-slide-up h-full" style={{ animationDelay: "100ms" }}>
      {/* Header */}
      <h2 className="text-lg font-semibold mb-4">Gráficos</h2>

      {/* Tabs - Horizontal scrollable */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2 -mx-2 px-2">
        {chartTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
              selectedTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Title with Date */}
      <div className="text-center mb-4">
        <h3 className="font-medium text-foreground">{getTabLabel()}</h3>
        <p className="text-xs text-muted-foreground">{periodLabel}</p>
      </div>

      {/* Chart or Empty State */}
      <div className="h-[280px] relative flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sampleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {sampleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Flag className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Sem dados para exibir
            </p>
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="font-medium text-sm mb-3">Detalhes</h4>
        
        {hasData ? (
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {sampleData.map((item) => (
              <div 
                key={item.name}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
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
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma categoria encontrada
          </p>
        )}
      </div>
    </div>
  );
}
