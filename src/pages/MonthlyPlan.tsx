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

  // Gasto real por categoría en el mes del plan
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
          />
          <SummaryCard
            icon={<PiggyBank className="w-5 h-5" />}
            label={`Ahorro (${savingsPercent}%)`}
            value={formatCurrency(savingsAmount)}
          />
          <SummaryCard
            icon={<Wallet className="w-5 h-5" />}
            label="Disponible para gastar"
            value={formatCurrency(available)}
            highlight
          />
          <SummaryCard
            icon={<Target className="w-5 h-5" />}
            label="Pendiente de distribuir"
            value={formatCurrency(pending)}
            tone={pending < 0 ? "danger" : pending === 0 ? "ok" : "default"}
          />
        </div>

        {/* Progreso de distribución */}
        <div className="glass rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Distribuido</span>
            <span className="font-semibold">
              {formatCurrency(distributed)} de {formatCurrency(available)}
            </span>
          </div>
          <Progress value={distributedPct} className="h-3" />
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
                return (
                  <div key={item.categoryId} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: category?.color || "hsl(var(--primary))" }}
                      />
                      <span className="font-medium flex-1 truncate">
                        {category?.name ?? "Categoría eliminada"}
                      </span>
                      <Input
                        className="w-32 text-right"
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
                        className="text-destructive"
                        onClick={() => handleRemove(item.categoryId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Planificado: {formatCurrency(item.amount)}</span>
                      <span>Gastado: {formatCurrency(spent)}</span>
                      <span className={cn(rest < 0 && "text-destructive font-medium")}>
                        Disponible: {formatCurrency(rest)}
                      </span>
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
  highlight,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "default" | "ok" | "danger";
}) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-4 space-y-2",
        highlight && "ring-1 ring-primary/40"
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p
        className={cn(
          "text-xl font-bold",
          tone === "danger" && "text-destructive",
          tone === "ok" && "text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}
