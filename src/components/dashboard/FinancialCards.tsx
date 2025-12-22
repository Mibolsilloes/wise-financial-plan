import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  mainValue: number;
  subtitle1: { label: string; value: number };
  subtitle2: { label: string; value: number };
  icon: React.ElementType;
  variant: "neutral" | "success" | "danger" | "info";
  period: string;
}

function FinancialCard({ 
  title, 
  mainValue, 
  subtitle1, 
  subtitle2, 
  icon: Icon, 
  variant,
  period 
}: FinancialCardProps) {
  const [hidden, setHidden] = useState(false);

  const formatCurrency = (value: number) => {
    if (hidden) return "R$ •••••";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getSubtitleColor = (value: number) => {
    if (value > 0) return "text-success";
    if (value < 0) return "text-destructive";
    return "text-warning";
  };

  const variantStyles = {
    neutral: "from-secondary to-secondary/50 border-border/50",
    success: "from-success/10 to-success/5 border-success/20",
    danger: "from-destructive/10 to-destructive/5 border-destructive/20",
    info: "from-info/10 to-info/5 border-info/20",
  };

  const iconStyles = {
    neutral: "bg-secondary text-foreground",
    success: "bg-success/20 text-success",
    danger: "bg-destructive/20 text-destructive",
    info: "bg-info/20 text-info",
  };

  return (
    <div 
      className={cn(
        "relative rounded-xl p-5 border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] animate-scale-in",
        variantStyles[variant]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        <button
          onClick={() => setHidden(!hidden)}
          className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Title & Period */}
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground/70 mb-3">{period}</p>

      {/* Main Value */}
      <p className={cn(
        "text-2xl font-bold mb-4",
        variant === "success" && "text-success",
        variant === "danger" && "text-destructive",
        variant === "info" && "text-info"
      )}>
        {formatCurrency(mainValue)}
      </p>

      {/* Subtitles */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          {subtitle1.value >= 0 ? (
            <ArrowUpRight className={cn("w-3.5 h-3.5", getSubtitleColor(subtitle1.value))} />
          ) : (
            <ArrowDownRight className={cn("w-3.5 h-3.5", getSubtitleColor(subtitle1.value))} />
          )}
          <span className="text-muted-foreground">{subtitle1.label}:</span>
          <span className={getSubtitleColor(subtitle1.value)}>
            {formatCurrency(Math.abs(subtitle1.value))}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-sm mt-1">
        {subtitle2.value >= 0 ? (
          <ArrowUpRight className={cn("w-3.5 h-3.5", getSubtitleColor(subtitle2.value))} />
        ) : (
          <ArrowDownRight className={cn("w-3.5 h-3.5", getSubtitleColor(subtitle2.value))} />
        )}
        <span className="text-muted-foreground">{subtitle2.label}:</span>
        <span className={getSubtitleColor(subtitle2.value)}>
          {formatCurrency(Math.abs(subtitle2.value))}
        </span>
      </div>
    </div>
  );
}

export function FinancialCards() {
  const period = "01/12/2024 - 31/12/2024";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <FinancialCard
        title="Saldo do período anterior"
        mainValue={5420.50}
        subtitle1={{ label: "Pendências", value: -350.00 }}
        subtitle2={{ label: "Disponível", value: 5070.50 }}
        icon={Wallet}
        variant="neutral"
        period={period}
      />
      <FinancialCard
        title="Receitas"
        mainValue={8500.00}
        subtitle1={{ label: "Recebido", value: 7200.00 }}
        subtitle2={{ label: "A receber", value: 1300.00 }}
        icon={TrendingUp}
        variant="success"
        period={period}
      />
      <FinancialCard
        title="Despesas"
        mainValue={4230.75}
        subtitle1={{ label: "Pago", value: -3850.75 }}
        subtitle2={{ label: "A pagar", value: -380.00 }}
        icon={TrendingDown}
        variant="danger"
        period={period}
      />
      <FinancialCard
        title="Saldo previsto"
        mainValue={9689.75}
        subtitle1={{ label: "Disponível", value: 8769.75 }}
        subtitle2={{ label: "Previsto", value: 920.00 }}
        icon={PiggyBank}
        variant="info"
        period={period}
      />
    </div>
  );
}
