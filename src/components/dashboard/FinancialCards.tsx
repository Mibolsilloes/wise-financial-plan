import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePeriod } from "@/contexts/PeriodContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { format, subMonths, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { calculateTotals } from "@/data/mockData";

interface DetailBadge {
  label: string;
  value: number;
  variant: "success" | "danger" | "warning" | "neutral";
}

interface FinancialCardProps {
  title: string;
  mainValue: number;
  subtitle: string;
  formula?: string;
  details: DetailBadge[];
  icon: React.ElementType;
  variant: "neutral" | "success" | "danger" | "info";
}

function FinancialCard({ 
  title, 
  mainValue, 
  subtitle,
  formula,
  details,
  icon: Icon, 
  variant,
}: FinancialCardProps) {
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const formatCurrency = (value: number) => {
    if (hidden) return "€ •••••";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const getValueColor = () => {
    if (variant === "success") return "text-success";
    if (variant === "danger") return "text-destructive";
    if (variant === "info") return "text-info";
    return "text-foreground";
  };

  const getBadgeStyles = (badgeVariant: DetailBadge["variant"]) => {
    switch (badgeVariant) {
      case "success":
        return "bg-success/10 text-success border-success/20";
      case "danger":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const iconStyles = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-success/10 text-success",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  };

  return (
    <div className="glass rounded-xl p-5 animate-scale-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", iconStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <button
          onClick={() => setHidden(!hidden)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Value */}
      <p className={cn("text-3xl font-bold mb-2", getValueColor())}>
        {formatCurrency(mainValue)}
      </p>

      {/* Subtitle & Formula */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {formula && (
          <p className="text-xs text-muted-foreground/70">({formula})</p>
        )}
      </div>

      {/* Expandable Details */}
      <div className="border-t border-border pt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? "Ocultar detalles" : "Mostrar detalles"}
        </button>

        {expanded && (
          <div className="mt-3 flex flex-wrap gap-2">
            {details.map((detail, index) => (
              <div
                key={index}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm font-medium",
                  getBadgeStyles(detail.variant)
                )}
              >
                <span className="text-muted-foreground font-normal">{detail.label}: </span>
                {formatCurrency(detail.value)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function FinancialCards() {
  const { effectiveDateRange, monthName, selectedPeriod } = usePeriod();
  const { transactions } = useTransactions();
  
  // Filter transactions by effective date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      isWithinInterval(t.dueDate, { start: effectiveDateRange.from, end: effectiveDateRange.to })
    );
  }, [effectiveDateRange, transactions]);
  
  // Calculate totals from filtered transactions
  const totals = calculateTotals(filteredTransactions);
  
  // Get previous month name for the "Saldo Del Período Anterior" card
  const previousMonthDate = subMonths(effectiveDateRange.from, 1);
  const previousMonthName = format(previousMonthDate, "MMMM", { locale: es });
  const previousMonthFormatted = previousMonthName.charAt(0).toUpperCase() + previousMonthName.slice(1);
  
  // Format the end date of the previous month
  const previousMonthEndDate = format(subMonths(effectiveDateRange.from, 1), "dd 'de' MMMM", { locale: es });
  
  // Determine the period label for the cards
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "today":
        return "Hoy";
      case "7days":
        return "Últimos 7 días";
      case "year":
        return `${effectiveDateRange.from.getFullYear()}`;
      case "custom":
        return `${format(effectiveDateRange.from, "dd/MM")} - ${format(effectiveDateRange.to, "dd/MM")}`;
      default:
        return monthName;
    }
  };

  const periodLabel = getPeriodLabel();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <FinancialCard
        title="Saldo del período anterior"
        mainValue={0}
        subtitle={`Hasta ${previousMonthEndDate}`}
        formula="Ingresos - Gastos + Saldo bancario"
        details={[
          { label: "Pendiente", value: 0, variant: "danger" },
          { label: "Disponible", value: 0, variant: "success" },
        ]}
        icon={Wallet}
        variant="neutral"
      />
      <FinancialCard
        title="Ingresos"
        mainValue={totals.totalIngresos}
        subtitle={`Total en ${periodLabel}`}
        details={[
          { label: "Cobrado", value: totals.ingresosCobrados, variant: "success" },
          { label: "Por cobrar", value: totals.ingresosPorCobrar, variant: "warning" },
        ]}
        icon={TrendingUp}
        variant="success"
      />
      <FinancialCard
        title="Gastos"
        mainValue={totals.totalGastos}
        subtitle={`Total en ${periodLabel}`}
        details={[
          { label: "Pagado", value: totals.gastosPagados, variant: "danger" },
          { label: "Por pagar", value: totals.gastosPendientes, variant: "warning" },
        ]}
        icon={TrendingDown}
        variant="danger"
      />
      <FinancialCard
        title="Saldo previsto"
        mainValue={totals.saldoPrevisto}
        subtitle={`Previsión para ${periodLabel}`}
        formula="Ingresos - Gastos"
        details={[
          { label: "Disponible", value: totals.saldoDisponible, variant: "success" },
          { label: "Previsto", value: totals.ingresosPorCobrar - totals.gastosPendientes, variant: "neutral" },
        ]}
        icon={PiggyBank}
        variant="info"
      />
    </div>
  );
}
