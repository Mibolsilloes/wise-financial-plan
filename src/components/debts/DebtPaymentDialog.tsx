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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatEUR } from "@/lib/debts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remaining: number;
  annualRate: number;
  suggestedAmount: number;
  nextInstallmentNumber: number;
  onSubmit: (values: {
    amount: number;
    date: string;
    principalPart: number;
    interestPart: number;
    installmentNumber: number | null;
    note?: string;
  }) => Promise<{ error: Error | null }>;
}

export function DebtPaymentDialog({
  open,
  onOpenChange,
  remaining,
  annualRate,
  suggestedAmount,
  nextInstallmentNumber,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [installment, setInstallment] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOver, setConfirmOver] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(suggestedAmount > 0 ? suggestedAmount.toFixed(2) : "");
      setDate(new Date().toISOString().split("T")[0]);
      setInstallment(String(nextInstallmentNumber));
      setNote("");
      setConfirmOver(false);
    }
  }, [open, suggestedAmount, nextInstallmentNumber]);

  const value = Number(amount.replace(",", ".")) || 0;
  const monthlyRate = annualRate / 100 / 12;
  const interestPart = Math.min(value, Math.max(0, remaining * monthlyRate));
  const principalPart = Math.max(0, Math.min(remaining, value - interestPart));

  const submit = async () => {
    if (value <= 0) return toast.error("Introduce una cantidad mayor que 0");
    if (principalPart > remaining + 0.01 && !confirmOver) {
      setConfirmOver(true);
      return toast.warning("El pago supera el saldo pendiente. Pulsa de nuevo para confirmar.");
    }
    setSaving(true);
    const { error } = await onSubmit({
      amount: value,
      date,
      principalPart,
      interestPart,
      installmentNumber: Number(installment) || null,
      note: note.trim() || undefined,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Pago registrado");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-amount">Cantidad pagada (€)</Label>
            <Input id="p-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="450" />
            <p className="text-xs text-muted-foreground">Saldo pendiente: {formatEUR(remaining)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="p-date">Fecha</Label>
              <Input id="p-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-num">Nº de cuota</Label>
              <Input id="p-num" inputMode="numeric" value={installment} onChange={(e) => setInstallment(e.target.value)} />
            </div>
          </div>
          {value > 0 && (
            <div className="rounded-xl border bg-muted/40 p-3 text-sm">
              <p className="flex justify-between"><span>Capital</span><strong className="text-emerald-600">{formatEUR(principalPart)}</strong></p>
              <p className="flex justify-between"><span>Intereses</span><strong className="text-red-600">{formatEUR(interestPart)}</strong></p>
              <p className="flex justify-between mt-1 pt-1 border-t"><span>Saldo tras el pago</span><strong>{formatEUR(Math.max(0, remaining - principalPart))}</strong></p>
              {annualRate <= 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Sin interés registrado: todo el importe se aplica a capital.
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="p-note">Nota (opcional)</Label>
            <Textarea id="p-note" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Guardando..." : confirmOver ? "Confirmar pago" : "Registrar pago"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
