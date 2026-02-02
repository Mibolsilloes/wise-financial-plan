import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePeriod } from "@/contexts/PeriodContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { isWithinInterval } from "date-fns";

const chartTabs = [
  { id: "all", label: "Todas" },
  { id: "ingresos", label: "Ingresos" },
  { id: "gastos", label: "Gastos" },
  { id: "gastos-no-pagados", label: "Gastos No Pagados" },
  { id: "gastos-pagados", label: "Gastos Pagados" },
  { id: "ingresos-no-cobrados", label: "Ingresos No Cobrados" },
  { id: "ingresos-cobrados", label: "Ingresos Cobrados" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0].payload.total || 0;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="glass rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{data.name}</p>
        <p className="text-sm" style={{ color: data.payload.color }}>
          {new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
          }).format(data.value)}
        </p>
        <p className="text-xs text-muted-foreground">{percentage}%</p>
      </div>
    );
  }
  return null;
};

export function ChartPanel() {
  const [selectedTab, setSelectedTab] = useState("gastos-pagados");
  const { periodLabel, effectiveDateRange } = usePeriod();
  const { transactions } = useTransactions();

  const chartData = useMemo(() => {
    // First filter by date range
    let filteredTransactions = transactions.filter(t => 
      isWithinInterval(t.dueDate, { start: effectiveDateRange.from, end: effectiveDateRange.to })
    );

    // Then filter by selected tab
    switch (selectedTab) {
      case "ingresos":
        filteredTransactions = filteredTransactions.filter(t => t.type === "ingreso");
        break;
      case "gastos":
        filteredTransactions = filteredTransactions.filter(t => t.type === "gasto");
        break;
      case "gastos-no-pagados":
        filteredTransactions = filteredTransactions.filter(t => t.type === "gasto" && t.status === "pendiente");
        break;
      case "gastos-pagados":
        filteredTransactions = filteredTransactions.filter(t => t.type === "gasto" && t.status === "pagado");
        break;
      case "ingresos-no-cobrados":
        filteredTransactions = filteredTransactions.filter(t => t.type === "ingreso" && t.status === "por_cobrar");
        break;
      case "ingresos-cobrados":
        filteredTransactions = filteredTransactions.filter(t => t.type === "ingreso" && t.status === "cobrado");
        break;
      default:
        // all - show expenses by default for pie chart
        filteredTransactions = filteredTransactions.filter(t => t.type === "gasto");
    }

    // Group by category
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    filteredTransactions.forEach(t => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
      }
    });

    const data = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return data.map(item => ({ ...item, total }));
  }, [selectedTab, effectiveDateRange, transactions]);

  const hasData = chartData.length > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const getTabLabel = () => {
    return chartTabs.find(t => t.id === selectedTab)?.label || "Gastos Pagados";
  };

  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="glass rounded-xl p-5 animate-slide-up h-full" style={{ animationDelay: "100ms" }}>
      {/* Encabezado */}
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
        {hasData && (
          <p className="text-lg font-bold mt-1 text-primary">{formatCurrency(totalAmount)}</p>
        )}
      </div>

      {/* Chart or Empty State */}
      <div className="h-[280px] relative flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
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
              Sin datos para mostrar
            </p>
          </div>
        )}
      </div>

      {/* Sección de Detalles */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="font-medium text-sm mb-3">Detalles</h4>
        
        {hasData ? (
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {chartData.map((item) => {
              const percentage = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : 0;
              return (
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
                    <span className="text-xs text-muted-foreground">({percentage}%)</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ninguna categoría encontrada
          </p>
        )}
      </div>
    </div>
  );
}
