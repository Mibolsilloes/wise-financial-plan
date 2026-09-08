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
import { formatEUR } from "@/lib/savingsGoals";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "deposit" | "withdrawal";
  balance: number;
  onSubmit: (values: { amount: number; date: string; note?: string }) => Promise<{ error: Error | null }>;
}

export function MovementDialog({ open, onOpenChange, type, balance, onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
    }
  }, [open]);

  const isDeposit = type === "deposit";

  const submit = async () => {
    const value = Number(amount.replace(",", ".")) || 0;
    if (value <= 0) return toast.error("Introduce una cantidad mayor que 0");
    if (!isDeposit && value > balance)
      return toast.error(`No puedes retirar más de ${formatEUR(balance)} disponibles en esta meta`);

    setSaving(true);
    const { error } = await onSubmit({ amount: value, date, note: note.trim() || undefined });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isDeposit ? "Depósito registrado" : "Retiro registrado");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isDeposit ? "Añadir dinero" : "Retirar dinero"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mv-amount">Cantidad (€)</Label>
            <Input
              id="mv-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
            />
            {!isDeposit && (
              <p className="text-xs text-muted-foreground">
                Disponible en la meta: {formatEUR(balance)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mv-date">Fecha</Label>
            <Input id="mv-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mv-note">Nota (opcional)</Label>
            <Textarea
              id="mv-note"
              value={note}
              maxLength={200}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ahorro del mes"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
