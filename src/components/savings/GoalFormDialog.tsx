import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft } from "lucide-react";
import {
  GOAL_COLORS,
  GOAL_ICON_NAMES,
  GOAL_TEMPLATES,
  formatEUR,
  formatGoalDate,
  getGoalIcon,
} from "@/lib/savingsGoals";
import type { SavingsGoal } from "@/hooks/useSavingsGoals";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: SavingsGoal | null;
  onSubmit: (values: {
    goalType: string;
    name: string;
    targetAmount: number;
    initialAmount: number;
    targetDate: string | null;
    color: string;
    icon: string;
  }) => Promise<{ error: Error | null }>;
}

export function GoalFormDialog({ open, onOpenChange, goal, onSubmit }: Props) {
  const isEdit = Boolean(goal);
  const [step, setStep] = useState<"form" | "summary">("form");
  const [goalType, setGoalType] = useState("emergencia");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [initial, setInitial] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [icon, setIcon] = useState("Shield");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("form");
    if (goal) {
      setGoalType(goal.goalType);
      setName(goal.name);
      setTarget(String(goal.targetAmount));
      setInitial(String(goal.initialAmount));
      setDate(goal.targetDate ?? "");
      setColor(goal.color);
      setIcon(goal.icon);
    } else {
      setGoalType("emergencia");
      setName("");
      setTarget("");
      setInitial("");
      setDate("");
      setColor(GOAL_COLORS[0]);
      setIcon("Shield");
    }
  }, [open, goal]);

  const targetAmount = Math.max(0, Number(target.replace(",", ".")) || 0);
  const initialAmount = Math.max(0, Number(initial.replace(",", ".")) || 0);
  const pct = targetAmount > 0 ? Math.min(100, (initialAmount / targetAmount) * 100) : 0;
  const Icon = getGoalIcon(icon);

  const pickTemplate = (id: string) => {
    const tpl = GOAL_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setGoalType(id);
    setIcon(tpl.icon);
    setColor(tpl.color);
    if (!name || GOAL_TEMPLATES.some((t) => t.label === name)) {
      setName(id === "otro" ? "" : tpl.label);
    }
  };

  const goSummary = () => {
    if (!name.trim()) return toast.error("Ponle un nombre a tu meta");
    if (targetAmount <= 0) return toast.error("El valor objetivo debe ser mayor que 0");
    if (!isEdit && initialAmount > targetAmount)
      return toast.error("El valor inicial no puede superar el objetivo");
    setStep("summary");
  };

  const confirm = async () => {
    setSaving(true);
    const { error } = await onSubmit({
      goalType,
      name: name.trim(),
      targetAmount,
      initialAmount,
      targetDate: date || null,
      color,
      icon,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isEdit ? "Meta actualizada" : "Meta creada");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar meta" : step === "form" ? "Crear nueva meta" : "Resumen de la meta"}
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Tipo de objetivo</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GOAL_TEMPLATES.map((t) => {
                  const TIcon = getGoalIcon(t.icon);
                  const active = goalType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => pickTemplate(t.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2 text-xs font-medium transition-all text-left",
                        active ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                      )}
                    >
                      <span
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${t.color}22`, color: t.color }}
                      >
                        <TIcon className="w-4 h-4" />
                      </span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-name">Nombre de la meta</Label>
              <Input
                id="goal-name"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fondo de emergencia"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="goal-target">Valor objetivo (€)</Label>
                <Input
                  id="goal-target"
                  inputMode="decimal"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-initial">Valor inicial (€)</Label>
                <Input
                  id="goal-initial"
                  inputMode="decimal"
                  value={initial}
                  disabled={isEdit}
                  onChange={(e) => setInitial(e.target.value)}
                  placeholder="1000"
                />
                {isEdit && (
                  <p className="text-[11px] text-muted-foreground">
                    El saldo inicial no se modifica al editar.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-date">Fecha objetivo</Label>
              <Input
                id="goal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap items-center gap-2">
                {GOAL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Color ${c}`}
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full flex items-center justify-center border border-border/50"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
                <label className="w-7 h-7 rounded-full border border-dashed border-border grid place-items-center cursor-pointer overflow-hidden">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 cursor-pointer opacity-0 absolute"
                    aria-label="Color personalizado"
                  />
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{
                      background:
                        "conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)",
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icono</Label>
              <ScrollArea className="h-32 rounded-lg border p-2">
                <div className="grid grid-cols-8 gap-2">
                  {GOAL_ICON_NAMES.map((n) => {
                    const NIcon = getGoalIcon(n);
                    const active = icon === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        aria-label={n}
                        onClick={() => setIcon(n)}
                        className={cn(
                          "w-9 h-9 rounded-lg grid place-items-center transition-all",
                          active ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                        )}
                        style={active ? { backgroundColor: color } : undefined}
                      >
                        <NIcon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={goSummary}>Continuar</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
            >
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-white/20 grid place-items-center">
                  <Icon className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-lg font-bold leading-tight">{name}</p>
                  <p className="text-xs opacity-90">Meta: {formatGoalDate(date || null)}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{formatEUR(initialAmount)}</p>
                <p className="text-sm opacity-90">de {formatEUR(targetAmount)}</p>
                <div className="mt-3 h-2 rounded-full bg-white/25 overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-xs font-semibold">{pct.toFixed(0)}% completado</p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("form")}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Volver a editar
              </Button>
              <Button onClick={confirm} disabled={saving}>
                {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear meta"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
