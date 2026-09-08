import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Minus,
  Pencil,
  Trash2,
  PartyPopper,
  ArrowDownCircle,
  ArrowUpCircle,
  Sparkles,
} from "lucide-react";
import { GoalFormDialog } from "@/components/savings/GoalFormDialog";
import { MovementDialog } from "@/components/savings/MovementDialog";
import { useSavingsGoals, goalSaved, goalProgress } from "@/hooks/useSavingsGoals";
import { formatEUR, formatGoalDate, getGoalIcon } from "@/lib/savingsGoals";
import { toast } from "sonner";

export default function SavingsGoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goals, loading, updateGoal, deleteGoal, addMovement, deleteMovement } = useSavingsGoals();
  const [editOpen, setEditOpen] = useState(false);
  const [movementType, setMovementType] = useState<"deposit" | "withdrawal" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const goal = useMemo(() => goals.find((g) => g.id === id), [goals, id]);

  if (loading && !goal) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          Cargando meta...
        </div>
      </Layout>
    );
  }

  if (!goal) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 space-y-4 text-center">
          <p className="font-semibold">Esta meta ya no existe</p>
          <Button onClick={() => navigate("/metas")}>Volver a metas de ahorro</Button>
        </div>
      </Layout>
    );
  }

  const Icon = getGoalIcon(goal.icon);
  const saved = goalSaved(goal);
  const pct = goalProgress(goal);
  const remaining = Math.max(0, goal.targetAmount - saved);
  const done = goal.targetAmount > 0 && saved >= goal.targetAmount;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/metas")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4 sm:mr-1 text-destructive" />
              <span className="hidden sm:inline text-destructive">Eliminar</span>
            </Button>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${goal.color}, ${goal.color}cc)` }}
        >
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-white/20 grid place-items-center shrink-0">
              <Icon className="w-6 h-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{goal.name}</h1>
              <p className="text-xs opacity-90">Fecha objetivo: {formatGoalDate(goal.targetDate)}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs opacity-80">Ahorrado</p>
              <p className="text-lg font-bold">{formatEUR(saved)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Meta</p>
              <p className="text-lg font-bold">{formatEUR(goal.targetAmount)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Progreso</p>
              <p className="text-lg font-bold">{pct.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Falta</p>
              <p className="text-lg font-bold">{formatEUR(remaining)}</p>
            </div>
          </div>

          <div className="mt-4 h-2.5 rounded-full bg-white/25 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>

          {done && (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <PartyPopper className="w-4 h-4" /> ¡Meta alcanzada!
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="flex-1" onClick={() => setMovementType("deposit")}>
            <Plus className="w-4 h-4 mr-1" /> Añadir dinero
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setMovementType("withdrawal")}>
            <Minus className="w-4 h-4 mr-1" /> Retirar dinero
          </Button>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Historial de movimientos</h2>
          </div>
          <div className="divide-y">
            {goal.movements.map((m) => {
              const isDep = m.type === "deposit";
              return (
                <div key={m.id} className="flex items-center gap-3 p-4">
                  {isDep ? (
                    <ArrowDownCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ArrowUpCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{isDep ? "Depósito" : "Retiro"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatGoalDate(m.date)}
                      {m.note ? ` · ${m.note}` : ""}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${
                      isDep ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {isDep ? "+" : "−"}
                    {formatEUR(m.amount)}
                  </p>
                  <button
                    aria-label="Eliminar movimiento"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={async () => {
                      const { error } = await deleteMovement(m.id);
                      if (error) toast.error(error.message);
                      else toast.success("Movimiento eliminado");
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            <div className="flex items-center gap-3 p-4">
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Saldo inicial</p>
                <p className="text-xs text-muted-foreground">
                  {formatGoalDate(goal.createdAt.split("T")[0])}
                </p>
              </div>
              <p className="text-sm font-bold text-primary">+{formatEUR(goal.initialAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <GoalFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        goal={goal}
        onSubmit={(values) =>
          updateGoal(goal.id, {
            goalType: values.goalType,
            name: values.name,
            targetAmount: values.targetAmount,
            targetDate: values.targetDate,
            color: values.color,
            icon: values.icon,
          })
        }
      />

      <MovementDialog
        open={movementType !== null}
        onOpenChange={(o) => !o && setMovementType(null)}
        type={movementType ?? "deposit"}
        balance={saved}
        onSubmit={(values) =>
          addMovement({
            goalId: goal.id,
            type: movementType ?? "deposit",
            amount: values.amount,
            date: values.date,
            note: values.note,
          })
        }
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta meta?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar esta meta? Se eliminará también su historial de
              depósitos y retiros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const { error } = await deleteGoal(goal.id);
                if (error) return toast.error(error.message);
                toast.success("Meta eliminada");
                navigate("/metas");
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
