import { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DEBT_COLORS,
  DEBT_ICON_NAMES,
  DEBT_TYPES,
  formatDebtDate,
  formatEUR,
  frenchInstallment,
  addMonths,
  getDebtIcon,
} from "@/lib/debts";
import type { Debt, DebtInput } from "@/hooks/useDebts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: Debt | null;
  onSubmit: (values: DebtInput) => Promise<{ error: Error | null }>;
}

const today = () => new Date().toISOString().split("T")[0];

export function DebtFormDialog({ open, onOpenChange, debt, onSubmit }: Props) {
  const [step, setStep] = useState<"form" | "summary">("form");
  const [name, setName] = useState("");
  const [debtType, setDebtType] = useState("personal");
  const [principal, setPrincipal] = useState("");
  const [rateValue, setRateValue] = useState("");
  const [ratePeriod, setRatePeriod] = useState<"annual" | "monthly">("annual");
  const [installments, setInstallments] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [initialPaid, setInitialPaid] = useState("");
  const [color, setColor] = useState("#26805D");
  const [icon, setIcon] = useState("Landmark");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("form");
    if (debt) {
      setName(debt.name);
      setDebtType(debt.debtType);
      setPrincipal(String(debt.principal));
      setRateValue(String(debt.annualRate));
      setRatePeriod("annual");
      setInstallments(debt.installments ? String(debt.installments) : "");
      setInstallmentAmount(debt.installmentAmount ? String(debt.installmentAmount) : "");
      setStartDate(debt.startDate);
      setEndDate(debt.endDate ?? "");
      setInitialPaid(String(debt.initialPaid));
      setColor(debt.color);
      setIcon(debt.icon);
      setNote(debt.note ?? "");
    } else {
      setName("");
      setDebtType("personal");
      setPrincipal("");
      setRateValue("");
      setRatePeriod("annual");
      setInstallments("");
      setInstallmentAmount("");
      setStartDate(today());
      setEndDate("");
      setInitialPaid("");
      setColor("#26805D");
      setIcon("Landmark");
      setNote("");
    }
  }, [open, debt]);

  const num = (v: string) => Number(v.replace(",", ".")) || 0;

  const annualRate = ratePeriod === "annual" ? num(rateValue) : num(rateValue) * 12;
  const principalNum = num(principal);
  const installmentsNum = Math.round(num(installments));
  const estimated = useMemo(
    () => frenchInstallment(principalNum, annualRate, installmentsNum),
    [principalNum, annualRate, installmentsNum]
  );
  const finalInstallment = num(installmentAmount) > 0 ? num(installmentAmount) : estimated;
  const computedEnd =
    endDate || (installmentsNum > 0 && startDate ? addMonths(startDate, installmentsNum) : "");

  const onTypeChange = (id: string) => {
    setDebtType(id);
    const t = DEBT_TYPES.find((x) => x.id === id);
    if (t && !debt) {
      setIcon(t.icon);
      setColor(t.color);
      if (!name) setName(t.label);
    }
  };

  const validate = () => {
    if (!name.trim()) return "Escribe un nombre para la deuda";
    if (principalNum <= 0) return "El importe inicial debe ser mayor que 0";
    if (annualRate < 0) return "El interés no puede ser negativo";
    if (installmentsNum < 0) return "El número de cuotas no puede ser negativo";
    if (num(initialPaid) < 0) return "La cantidad ya pagada no puede ser negativa";
    if (num(initialPaid) > principalNum) return "Lo ya pagado no puede superar el importe inicial";
    if (computedEnd && computedEnd < startDate)
      return "La fecha de finalización no puede ser anterior a la de inicio";
    return null;
  };

  const goSummary = () => {
    const err = validate();
    if (err) return toast.error(err);
    setStep("summary");
  };

  const submit = async () => {
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    const { error } = await onSubmit({
      name: name.trim(),
      debtType,
      principal: principalNum,
      annualRate,
      installments: installmentsNum,
      installmentAmount: finalInstallment,
      startDate,
      endDate: computedEnd || null,
      initialPaid: num(initialPaid),
      color,
      icon,
      note: note.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(debt ? "Deuda actualizada" : "Deuda creada");
    onOpenChange(false);
  };

  const Icon = getDebtIcon(icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {debt ? "Editar deuda" : step === "form" ? "Añadir deuda" : "Confirma tu deuda"}
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de deuda</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEBT_TYPES.map((t) => {
                  const TIcon = getDebtIcon(t.icon);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onTypeChange(t.id)}
                      className={cn(
                        "rounded-xl border p-2.5 text-left text-xs flex items-center gap-2 transition-all",
                        debtType === t.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                      )}
                    >
                      <TIcon className="w-4 h-4 shrink-0" style={{ color: t.color }} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="d-name">Nombre de la deuda</Label>
                <Input id="d-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Préstamo del coche" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-principal">Valor inicial (€)</Label>
                <Input id="d-principal" inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="10000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-rate">Interés (%)</Label>
                <div className="flex gap-2">
                  <Input id="d-rate" inputMode="decimal" value={rateValue} onChange={(e) => setRateValue(e.target.value)} placeholder="6,5" />
                  <Select value={ratePeriod} onValueChange={(v) => setRatePeriod(v as "annual" | "monthly")}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Anual</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-inst">Número de cuotas</Label>
                <Input id="d-inst" inputMode="numeric" value={installments} onChange={(e) => setInstallments(e.target.value)} placeholder="24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-amount">Valor de la cuota (€)</Label>
                <Input
                  id="d-amount"
                  inputMode="decimal"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                  placeholder={estimated > 0 ? estimated.toFixed(2) : "450"}
                />
                {estimated > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Cuota estimada: <strong>{formatEUR(estimated)}</strong>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-paid">Cantidad ya pagada (€)</Label>
                <Input id="d-paid" inputMode="decimal" value={initialPaid} onChange={(e) => setInitialPaid(e.target.value)} placeholder="3000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-start">Fecha de inicio</Label>
                <Input id="d-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-end">Fecha de finalización</Label>
                <Input id="d-end" type="date" value={computedEnd} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {DEBT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn("w-7 h-7 rounded-full border-2", color === c ? "border-foreground scale-110" : "border-transparent")}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded-full border cursor-pointer bg-transparent"
                  aria-label="Color personalizado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-2">
                {DEBT_ICON_NAMES.map((n) => {
                  const NIcon = getDebtIcon(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setIcon(n)}
                      className={cn(
                        "w-9 h-9 rounded-lg grid place-items-center border transition-all",
                        icon === n ? "border-primary bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <NIcon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-note">Información adicional (opcional)</Label>
              <Textarea id="d-note" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderTop: `4px solid ${color}` }}>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl grid place-items-center" style={{ backgroundColor: `${color}22`, color }}>
                <Icon className="w-6 h-6" />
              </span>
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {DEBT_TYPES.find((t) => t.id === debtType)?.label}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Valor inicial</p><p className="font-bold">{formatEUR(principalNum)}</p></div>
              <div><p className="text-xs text-muted-foreground">Ya pagado</p><p className="font-bold">{formatEUR(num(initialPaid))}</p></div>
              <div><p className="text-xs text-muted-foreground">Pendiente</p><p className="font-bold">{formatEUR(Math.max(0, principalNum - num(initialPaid)))}</p></div>
              <div><p className="text-xs text-muted-foreground">Cuota mensual</p><p className="font-bold">{formatEUR(finalInstallment)}</p></div>
              <div><p className="text-xs text-muted-foreground">Interés anual</p><p className="font-bold">{annualRate.toFixed(2)} %</p></div>
              <div><p className="text-xs text-muted-foreground">Cuotas</p><p className="font-bold">{installmentsNum || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Inicio</p><p className="font-bold">{formatDebtDate(startDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Fin previsto</p><p className="font-bold">{formatDebtDate(computedEnd || null)}</p></div>
            </div>
            {(annualRate <= 0 || installmentsNum <= 0) && (
              <p className="text-xs text-muted-foreground">
                Faltan datos de interés o cuotas: los importes se muestran como estimación.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "summary" && !debt ? (
            <>
              <Button variant="outline" onClick={() => setStep("form")}>Volver</Button>
              <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Crear deuda"}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              {debt ? (
                <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
              ) : (
                <Button onClick={goSummary}>Continuar</Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
