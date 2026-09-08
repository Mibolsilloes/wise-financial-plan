import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, PiggyBank, PartyPopper, Calendar } from "lucide-react";
import { GoalFormDialog } from "@/components/savings/GoalFormDialog";
import { useSavingsGoals, goalSaved, goalProgress } from "@/hooks/useSavingsGoals";
import { formatEUR, formatGoalDate, getGoalIcon } from "@/lib/savingsGoals";

export default function SavingsGoals() {
  const navigate = useNavigate();
  const { goals, loading, createGoal } = useSavingsGoals();
  const [open, setOpen] = useState(false);

  const totalSaved = goals.reduce((s, g) => s + goalSaved(g), 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <PiggyBank className="w-6 h-6 text-primary" />
              Metas de ahorro
            </h1>
            <p className="text-sm text-muted-foreground">
              Crea objetivos, registra depósitos y sigue tu progreso.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1" /> Crear nueva meta
          </Button>
        </div>

        {goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total ahorrado</p>
              <p className="text-xl font-bold text-primary">{formatEUR(totalSaved)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Suma de objetivos</p>
              <p className="text-xl font-bold">{formatEUR(totalTarget)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Metas activas</p>
              <p className="text-xl font-bold">{goals.length}</p>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando metas...</p>
        ) : goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center space-y-3">
            <PiggyBank className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="font-semibold">Aún no tienes metas de ahorro</p>
            <p className="text-sm text-muted-foreground">
              Crea tu primera meta y empieza a seguir tu progreso.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Crear nueva meta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const Icon = getGoalIcon(goal.icon);
              const saved = goalSaved(goal);
              const pct = goalProgress(goal);
              const done = goal.targetAmount > 0 && saved >= goal.targetAmount;
              return (
                <button
                  key={goal.id}
                  onClick={() => navigate(`/metas/${goal.id}`)}
                  className="text-left rounded-2xl border bg-card p-5 hover:shadow-lg transition-all"
                  style={{ borderTop: `4px solid ${goal.color}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
                      style={{ backgroundColor: `${goal.color}22`, color: goal.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{goal.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatGoalDate(goal.targetDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xl font-bold" style={{ color: goal.color }}>
                      {formatEUR(saved)}
                    </p>
                    <p className="text-xs text-muted-foreground">de {formatEUR(goal.targetAmount)}</p>
                  </div>

                  <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                    <span>{pct.toFixed(0)}%</span>
                    {done && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <PartyPopper className="w-3.5 h-3.5" /> ¡Meta alcanzada!
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <GoalFormDialog open={open} onOpenChange={setOpen} onSubmit={createGoal} />
    </Layout>
  );
}
