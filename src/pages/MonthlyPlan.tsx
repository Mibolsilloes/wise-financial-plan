import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  Wallet,
  TrendingUp,
  Plus,
  Trash2,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useCategories } from "@/contexts/CategoriesContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useMonthlyPlan } from "@/hooks/useMonthlyPlan";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export default function MonthlyPlan() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const { plan, loading, saving, saveBasics, upsertItem, removeItem } = useMonthlyPlan(month, year);

  const [incomeInput, setIncomeInput] = useState("0");
  const [savingsInput, setSavingsInput] = useState("0");
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({});
  const [newCategoryId, setNewCategoryId] = useState<string>("");

  useEffect(() => {
    setIncomeInput(plan ? String(plan.income) : "0");
    setSavingsInput(plan ? String(plan.savingsPercent) : "0");
    setAmountDrafts(
      Object.fromEntries((plan?.items ?? []).map((i) => [i.categoryId, String(i.amount)]))
    );
  }, [plan]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "gasto"),
    [categories]
  );

  const income = Math.max(0, Number(incomeInput.replace(",", ".")) || 0);
  const savingsPercent = Math.min(100, Math.max(0, Number(savingsInput.replace(",", ".")) || 0));
  const savingsAmount = (income * savingsPercent) / 100;
  const available = Math.max(0, income - savingsAmount);

  const items = plan?.items ?? [];
  const distributed = items.reduce((sum, i) => sum + i.amount, 0);
  const pending = available - distributed;
  const distributedPct = available > 0 ? Math.min(100, (distributed / available) * 100) : 0;

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type !== "gasto" || !t.categoryId) return;
      const d = new Date(t.dueDate);
      if (d.getMonth() + 1 !== month || d.getFullYear() !== year) return;
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
    });
    return map;
  }, [transactions, month, year]);

  const handlePrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1);
  };
  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };

  const handleSaveBasics = async () => {
    const { error } = await saveBasics(income, savingsPercent);
    if (error) toast.error("No se pudo guardar la planificación");
    else toast.success("Planificación guardada");
  };

  const handleSaveAmount = async (categoryId: string) => {
    const raw = amountDrafts[categoryId] ?? "0";
    const amount = Math.max(0, Number(raw.replace(",", ".")) || 0);
    const current = items.find((i) => i.categoryId === categoryId)?.amount ?? 0;
    if (amount === current) return;
    const others = distributed - current;
    if (others + amount > available) {
      toast.error("La suma asignada supera el dinero disponible para gastar");
      setAmountDrafts((p) => ({ ...p, [categoryId]: String(current) }));
      return;
    }
    const { error } = await upsertItem(categoryId, amount);
    if (error) toast.error("No se pudo guardar la cantidad");
  };

  const handleAddCategory = async () => {
    if (!newCategoryId) return;
    if (items.some((i) => i.categoryId === newCategoryId)) {
      toast.error("Esa categoría ya está en el plan");
      return;
    }
    const { error } = await upsertItem(newCategoryId, 0);
    if (error) toast.error("No se pudo añadir la categoría");
    else setNewCategoryId("");
  };

  const handleRemove = async (categoryId: string) => {
    const { error } = await removeItem(categoryId);
    if (error) toast.error("No se pudo eliminar la categoría");
  };

  const availableToAdd = expenseCategories.filter(
    (c) => !items.some((i) => i.categoryId === c.id)
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Plan mensual
            </h1>
            <p className="text-sm text-muted-foreground">
              Cuánto vas a recibir, cuánto quieres ahorrar y en qué lo vas a gastar.
            </p>
          </div>
          <div className="flex items-center gap-2 glass rounded-xl px-2 py-1 self-start">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[130px] text-center">
              {MONTHS[month - 1]} {year}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Entradas */}
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income">¿Cuánto ingresas este mes?</Label>
              <Input
                id="income"
                inputMode="decimal"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                onBlur={handleSaveBasics}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savings">¿Qué porcentaje quieres ahorrar? (%)</Label>
              <Input
                id="savings"
                inputMode="decimal"
                value={savingsInput}
                onChange={(e) => setSavingsInput(e.target.value)}
                onBlur={handleSaveBasics}
              />
            </div>
          </div>
          <Button onClick={handleSaveBasics} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Guardando..." : "Guardar planificación"}
          </Button>
        </div>

        {/* Indicadores */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Ingresos previstos"
            value={formatCurrency(income)}
            variant="income"
          />
          <SummaryCard
            icon={<PiggyBank className="w-5 h-5" />}
            label={`Ahorro (${savingsPercent}%)`}
            value={formatCurrency(savingsAmount)}
            variant="savings"
          />
          <SummaryCard
            icon={<Wallet className="w-5 h-5" />}
            label="Disponible para gastar"
            value={formatCurrency(available)}
            variant="available"
          />
          <SummaryCard
            icon={<Calendar className="w-5 h-5" />}
            label="Pendiente de distribuir"
            value={formatCurrency(pending)}
            variant="pending"
          />
        </div>

        {/* Progreso de distribución */}
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Distribuido</span>
            <span className="font-semibold">
              {formatCurrency(distributed)} de {formatCurrency(available)}
            </span>
          </div>
          <div className="relative">
            <Progress value={distributedPct} className="h-3" />
            {distributedPct >= 100 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completo
              </div>
            )}
          </div>
          {pending < 0 && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Has distribuido más de lo disponible. Revisa las categorías.
            </div>
          )}
        </div>

        {/* Distribución por categorías */}
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-semibold">Distribución por categorías</h2>
            <div className="flex items-center gap-2">
              <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Añadir categoría" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No quedan categorías de gasto
                    </div>
                  ) : (
                    availableToAdd.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleAddCategory} disabled={!newCategoryId} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Cargando plan...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Todavía no has repartido tu dinero. Añade una categoría para empezar.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const category = categories.find((c) => c.id === item.categoryId);
                const spent = spentByCategory[item.categoryId] ?? 0;
                const rest = item.amount - spent;
                const pct = item.amount > 0 ? Math.min(100, (spent / item.amount) * 100) : 0;
                const overBudget = rest < 0;

                return (
                  <div
                    key={item.categoryId}
                    className={cn(
                      "rounded-xl border border-border p-4 space-y-3 transition-shadow hover:shadow-card",
                      overBudget && "border-destructive/40 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 ring-2 ring-background"
                        style={{ backgroundColor: category?.color || "hsl(var(--primary))" }}
                      />
                      <span className="font-semibold flex-1 truncate">
                        {category?.name ?? "Categoría eliminada"}
                      </span>
                      <Input
                        className="w-32 text-right font-semibold"
                        inputMode="decimal"
                        value={amountDrafts[item.categoryId] ?? "0"}
                        onChange={(e) =>
                          setAmountDrafts((p) => ({ ...p, [item.categoryId]: e.target.value }))
                        }
                        onBlur={() => handleSaveAmount(item.categoryId)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(item.categoryId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {Math.round(pct)}% usado
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            overBudget ? "text-destructive" : "text-success"
                          )}
                        >
                          {overBudget ? "Sobrepasado" : "Dentro del plan"}
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className={cn("h-2", overBudget && "[&>div]:bg-destructive")}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <MetricBadge
                        label="Planificado"
                        value={formatCurrency(item.amount)}
                        tone="default"
                      />
                      <MetricBadge
                        label="Gastado"
                        value={formatCurrency(spent)}
                        tone="danger"
                      />
                      <MetricBadge
                        label="Disponible"
                        value={formatCurrency(rest)}
                        tone={overBudget ? "danger" : "success"}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "default" | "income" | "savings" | "available" | "pending";
}) {
  const variantStyles = {
    default: "",
    income: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
    savings: "bg-gradient-to-br from-warning/15 to-warning/5 border-warning/30",
    available: "bg-gradient-to-br from-success/15 to-success/5 border-success/30 ring-1 ring-success/20",
    pending: "bg-gradient-to-br from-info/15 to-info/5 border-info/30",
  };

  const iconStyles = {
    default: "text-primary bg-primary/10",
    income: "text-primary bg-primary/15",
    savings: "text-warning bg-warning/20",
    available: "text-success bg-success/20",
    pending: "text-info bg-info/20",
  };

  return (
    <div className={cn("glass rounded-xl p-4 space-y-3 border", variantStyles[variant])}>
      <div className="flex items-center gap-3">
        <span className={cn("p-2 rounded-lg", iconStyles[variant])}>{icon}</span>
        <span className="text-sm text-muted-foreground font-medium leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function MetricBadge({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2 text-center",
        tone === "default" && "bg-muted/60",
        tone === "success" && "bg-success/10",
        tone === "danger" && "bg-destructive/10"
      )}
    >
      <p
        className={cn(
          "text-xs font-bold uppercase tracking-wide mb-0.5",
          tone === "default" && "text-muted-foreground",
          tone === "success" && "text-success",
          tone === "danger" && "text-destructive"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-bold",
          tone === "default" && "text-foreground",
          tone === "success" && "text-success",
          tone === "danger" && "text-destructive"
        )}
      >
        {value}
      </p>
    </div>
  );
}
