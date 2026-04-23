import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import {
  format,
  isWithinInterval,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { usePeriod } from "@/contexts/PeriodContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { calculateTotals } from "@/data/mockData";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCurrencyFull = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);

interface KpiCardProps {
  label: string;
  value: number;
  delta?: number;
  icon: React.ElementType;
  variant: "success" | "danger" | "info" | "neutral";
}

function KpiCard({ label, value, delta, icon: Icon, variant }: KpiCardProps) {
  const styles = {
    success: "from-success/20 to-success/5 text-success",
    danger: "from-destructive/20 to-destructive/5 text-destructive",
    info: "from-info/20 to-info/5 text-info",
    neutral: "from-muted to-muted/30 text-foreground",
  };
  const valueColor = {
    success: "text-success",
    danger: "text-destructive",
    info: "text-info",
    neutral: "text-foreground",
  };

  const positiveDelta = delta !== undefined && delta >= 0;

  return (
    <div className="glass rounded-xl p-5 relative overflow-hidden animate-scale-in">
      <div
        className={cn(
          "absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl",
          styles[variant]
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={cn("p-2 rounded-lg bg-gradient-to-br", styles[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className={cn("text-2xl font-bold mb-1", valueColor[variant])}>
          {formatCurrencyFull(value)}
        </p>
        {delta !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              positiveDelta ? "text-success" : "text-destructive"
            )}
          >
            {positiveDelta ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>
              {positiveDelta ? "+" : ""}
              {delta.toFixed(1)}% vs mes anterior
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg p-3 shadow-lg border border-border">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">
            {formatCurrencyFull(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function DashboardView() {
  const { effectiveDateRange } = usePeriod();
  const { transactions } = useTransactions();

  // Filtered for current period
  const filtered = useMemo(
    () =>
      transactions.filter((t) =>
        isWithinInterval(t.dueDate, {
          start: effectiveDateRange.from,
          end: effectiveDateRange.to,
        })
      ),
    [transactions, effectiveDateRange]
  );

  // Previous period for comparison
  const prevTotals = useMemo(() => {
    const prevStart = startOfMonth(subMonths(effectiveDateRange.from, 1));
    const prevEnd = endOfMonth(subMonths(effectiveDateRange.from, 1));
    const prev = transactions.filter((t) =>
      isWithinInterval(t.dueDate, { start: prevStart, end: prevEnd })
    );
    return calculateTotals(prev);
  }, [transactions, effectiveDateRange]);

  const totals = calculateTotals(filtered);

  const calcDelta = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Monthly evolution (last 6 months)
  const monthlyEvolution = useMemo(() => {
    const end = endOfMonth(effectiveDateRange.to);
    const start = startOfMonth(subMonths(end, 5));
    const months = eachMonthOfInterval({ start, end });
    return months.map((m) => {
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const monthTx = transactions.filter((t) =>
        isWithinInterval(t.dueDate, { start: mStart, end: mEnd })
      );
      const ingresos = monthTx
        .filter((t) => t.type === "ingreso")
        .reduce((s, t) => s + t.amount, 0);
      const gastos = monthTx
        .filter((t) => t.type === "gasto")
        .reduce((s, t) => s + t.amount, 0);
      return {
        mes: format(m, "MMM", { locale: es }),
        Ingresos: ingresos,
        Gastos: gastos,
        Balance: ingresos - gastos,
      };
    });
  }, [transactions, effectiveDateRange]);

  // Top categories (gastos)
  const topGastos = useMemo(() => {
    const map = new Map<string, { name: string; value: number; color: string }>();
    filtered
      .filter((t) => t.type === "gasto")
      .forEach((t) => {
        const ex = map.get(t.category);
        if (ex) ex.value += t.amount;
        else map.set(t.category, { name: t.category, value: t.amount, color: t.color });
      });
    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filtered]);

  // Cash flow status pie
  const statusBreakdown = useMemo(() => {
    return [
      { name: "Cobrado", value: totals.ingresosCobrados, color: "hsl(var(--success))" },
      { name: "Por cobrar", value: totals.ingresosPorCobrar, color: "hsl(var(--warning))" },
      { name: "Pagado", value: totals.gastosPagados, color: "hsl(var(--destructive))" },
      { name: "Pendiente", value: totals.gastosPendientes, color: "hsl(var(--muted-foreground))" },
    ].filter((d) => d.value > 0);
  }, [totals]);

  const tasaAhorro =
    totals.totalIngresos > 0
      ? ((totals.totalIngresos - totals.totalGastos) / totals.totalIngresos) * 100
      : 0;

  const hasData = filtered.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ingresos del período"
          value={totals.totalIngresos}
          delta={calcDelta(totals.totalIngresos, prevTotals.totalIngresos)}
          icon={TrendingUp}
          variant="success"
        />
        <KpiCard
          label="Gastos del período"
          value={totals.totalGastos}
          delta={calcDelta(totals.totalGastos, prevTotals.totalGastos)}
          icon={TrendingDown}
          variant="danger"
        />
        <KpiCard
          label="Balance neto"
          value={totals.totalIngresos - totals.totalGastos}
          icon={Wallet}
          variant="info"
        />
        <KpiCard
          label="Tasa de ahorro"
          value={tasaAhorro}
          icon={Target}
          variant={tasaAhorro >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Evolution chart */}
      <div className="glass rounded-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Evolución últimos 6 meses
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tendencia de ingresos vs gastos
            </p>
          </div>
        </div>
        <div className="h-[280px]">
          {monthlyEvolution.some((m) => m.Ingresos || m.Gastos) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEvolution}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="Ingresos"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  fill="url(#colorIngresos)"
                />
                <Area
                  type="monotone"
                  dataKey="Gastos"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  fill="url(#colorGastos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Sin datos para mostrar
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top categorías */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-1">Top 5 categorías de gasto</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Donde más estás gastando este período
          </p>
          <div className="h-[260px]">
            {topGastos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topGastos} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v) => formatCurrency(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={100}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Gastado" radius={[0, 6, 6, 0]}>
                    {topGastos.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Sin gastos registrados
              </div>
            )}
          </div>
        </div>

        {/* Estado de pagos */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-1">Estado del flujo</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Distribución de cobros y pagos
          </p>
          <div className="h-[260px] flex items-center">
            {statusBreakdown.length > 0 ? (
              <div className="w-full grid grid-cols-2 gap-4 items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusBreakdown.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusBreakdown.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground truncate">{s.name}</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrencyFull(s.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full text-center text-sm text-muted-foreground">
                Sin movimientos en el período
              </div>
            )}
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay transacciones en este período. Agrega ingresos o gastos para ver tu
            dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
