import { Crown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
}

export function UpgradePlanDialog({ open, onOpenChange, reason }: UpgradePlanDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-warning" />
            <DialogTitle>Mejora a Premium</DialogTitle>
          </div>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-2">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Crown className="w-4 h-4 text-warning" /> Plan Premium · 9,90 €/mes
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Transacciones ilimitadas</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Cuentas bancarias ilimitadas</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Tarjetas ilimitadas</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-success" /> Informes avanzados</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ahora no
          </Button>
          <Button
            className="bg-warning text-warning-foreground hover:bg-warning/90"
            onClick={() => {
              onOpenChange(false);
              navigate("/configuracoes");
            }}
          >
            <Crown className="w-4 h-4 mr-2" />
            Mejorar plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
