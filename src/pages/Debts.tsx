import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, PartyPopper, CalendarClock, TrendingDown } from "lucide-react";
import { DebtFormDialog } from "@/components/debts/DebtFormDialog";
import { useDebts, debtStats } from "@/hooks/useDebts";
import { formatEUR, formatDebtDate, getDebtIcon, debtTypeLabel } from "@/lib/debts";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type FilterKey = "all" | "active" | "paid";

export default function Debts() {
  const navigate = useNavigate();
  const { debts, loading, createDebt } = useDebts();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");

  const rows = useMemo(
    () => debts.map((d) => ({ debt: d, stats: debtStats(d) })),
    [debts]
  );

  const totals = useMemo(() => {
    const active = rows.filter((r) => !r.stats.isPaid);
    return {
      remaining: rows.reduce((s, r) => s + r.stats.remaining, 0),
      paid: rows.reduce((s, r) => s + r.stats.totalPaid, 0),
      monthly: active.reduce((s, r) => s + r.stats.monthlyPayment, 0),
      interest: active.reduce((s, r) => s + r.stats.remainingInterest, 0),
      activeCount: active.length,
    };
  }, [rows]);

  const byType = useMemo(() => {
    const map = new Map<string, { name: string; value: number; color: string }>();
    rows
      .filter((r) => r.stats.remaining > 0)
      .forEach(({ debt, stats }) => {
        const key = debt.debtType;
        const prev = map.get(key);
        map.set(key, {
          name: debtTypeLabel(key),
          value: (prev?.value ?? 0) + stats.remaining,
          color: prev?.color ?? debt.color,
        });
      });
    return Array.from(map.values());
  }, [rows]);

  const upcoming = useMemo(
    () =>
      rows
        .filter((r) => !r.stats.isPaid && r.stats.nextPaymentDate)
        .map((r) => ({
          id: r.debt.id,
          name: r.debt.name,
          color: r.debt.color,
          date: r.stats.nextPaymentDate as string,
          amount: r.stats.monthlyPayment,
        }))
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(0, 5),
    [rows]
  );

  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "paid" ? r.stats.isPaid : !r.stats.isPaid
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="w-6 h-6 text-primary" />
              Deudas
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra tus deudas, sigue los pagos y controla los intereses.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1" /> Añadir deuda
          </Button>
        </div>

        {rows.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total pendiente</p>
              <p className="text-xl font-bold text-red-600">{formatEUR(totals.remaining)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total pagado</p>
              <p className="text-xl font-bold text-emerald-600">{formatEUR(totals.paid)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Cuotas mensuales</p>
              <p className="text-xl font-bold">{formatEUR(totals.monthly)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Intereses restantes</p>
              <p className="text-xl font-bold text-amber-600">{formatEUR(totals.interest)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Deudas activas</p>
              <p className="text-xl font-bold">{totals.activeCount}</p>
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-card p-5">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" /> Deuda pendiente por tipo
              </p>
              {byType.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tienes saldo pendiente. ¡Enhorabuena!</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byType} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {byType.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatEUR(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="font-semibold mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" /> Próximos pagos
              </p>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay pagos previstos.</p>
              ) : (
                <ul className="space-y-2">
                  {upcoming.map((u) => (
                    <li key={u.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: u.color }} />
                        <span className="truncate">{u.name}</span>
                      </span>
                      <span className="flex items-center gap-3 shrink-0">
                        <span className="text-muted-foreground">{formatDebtDate(u.date)}</span>
                        <strong>{formatEUR(u.amount)}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex gap-2">
            {([
              { id: "all", label: "Todas" },
              { id: "active", label: "Activas" },
              { id: "paid", label: "Pagadas" },
            ] as { id: FilterKey; label: string }[]).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                  filter === f.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando deudas...</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center space-y-3">
            <Receipt className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="font-semibold">Aún no tienes deudas registradas</p>
            <p className="text-sm text-muted-foreground">
              Añade tu primera deuda para ver cuánto debes y cuándo terminarás de pagarla.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Añadir deuda
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay deudas en este estado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map(({ debt, stats }) => {
              const Icon = getDebtIcon(debt.icon);
              return (
                <button
                  key={debt.id}
                  onClick={() => navigate(`/dividas/${debt.id}`)}
                  className="text-left rounded-2xl border bg-card p-5 hover:shadow-lg transition-all"
                  style={{ borderTop: `4px solid ${debt.color}` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ backgroundColor: `${debt.color}22`, color: debt.color }}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{debt.name}</p>
                      <p className="text-xs text-muted-foreground">{debtTypeLabel(debt.debtType)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Pendiente</p>
                      <p className="font-bold text-red-600">{formatEUR(stats.remaining)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pagado</p>
                      <p className="font-bold text-emerald-600">{formatEUR(stats.principalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cuota mensual</p>
                      <p className="font-bold">{formatEUR(stats.monthlyPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fin estimado</p>
                      <p className="font-bold">{formatDebtDate(stats.estimatedEnd)}</p>
                    </div>
                  </div>

                  <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${stats.progress}%`, backgroundColor: debt.color }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                    <span>{stats.progress.toFixed(1)}% pagado</span>
                    {stats.isPaid ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <PartyPopper className="w-3.5 h-3.5" /> Deuda pagada
                      </span>
                    ) : stats.nextPaymentDate ? (
                      <span className="text-muted-foreground">Próximo: {formatDebtDate(stats.nextPaymentDate)}</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <DebtFormDialog open={open} onOpenChange={setOpen} onSubmit={createDebt} />
    </Layout>
  );
}
