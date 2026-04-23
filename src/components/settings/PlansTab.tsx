import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";

function UsageStat({ label, used, max }: { label: string; used: number; max: number }) {
  const isInf = !isFinite(max);
  const pct = isInf ? 0 : Math.min(100, (used / Math.max(max, 1)) * 100);
  const isWarn = !isInf && pct >= 80;
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl font-bold", isWarn && "text-warning")}>
        {used}
        <span className="text-sm text-muted-foreground font-normal">
          {" "}/ {isInf ? "∞" : max}
        </span>
      </p>
      {!isInf && (
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full transition-all", isWarn ? "bg-warning" : "bg-primary")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function PlansTab() {
  const { profile, updateProfile } = useAuth();
  const currentPlan =
    (profile as { plan?: string } | null)?.plan === "premium" ? "premium" : "free";
  const { usage, limits } = usePlan();

  const handleSwitchPlan = async (target: "free" | "premium") => {
    const { error } = await updateProfile({ plan: target } as Partial<{
      plan: "free" | "premium";
    }>);
    if (error) toast.error("No se pudo cambiar el plan");
    else
      toast.success(
        target === "premium" ? "¡Plan Premium activado!" : "Plan Gratuito activado"
      );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {currentPlan === "free" && (
        <div className="glass rounded-xl p-6 border border-border/50">
          <h3 className="text-base font-semibold mb-4">Tu uso actual</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UsageStat
              label="Transacciones este mes"
              used={usage.transactionsThisMonth}
              max={limits.transactionsPerMonth as number}
            />
            <UsageStat
              label="Cuentas bancarias"
              used={usage.bankAccounts}
              max={limits.bankAccounts as number}
            />
            <UsageStat
              label="Tarjetas de crédito"
              used={usage.creditCards}
              max={limits.creditCards as number}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={cn(
            "glass rounded-xl p-6 border",
            currentPlan === "free"
              ? "border-primary/50 shadow-glow-primary"
              : "border-border/50"
          )}
        >
          <h3 className="text-lg font-semibold mb-2">Plan Gratuito</h3>
          <p className="text-3xl font-bold mb-4">
            0 €<span className="text-sm font-normal text-muted-foreground">/mes</span>
          </p>
          <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
            <li>• Hasta 50 transacciones/mes</li>
            <li>• 2 cuentas bancarias</li>
            <li>• 1 tarjeta de crédito</li>
            <li>• Informes básicos</li>
          </ul>
          <Button
            variant="outline"
            className="w-full"
            disabled={currentPlan === "free"}
            onClick={() => handleSwitchPlan("free")}
          >
            {currentPlan === "free" ? "Plan actual" : "Cambiar a Gratuito"}
          </Button>
        </div>

        <div
          className={cn(
            "relative glass rounded-xl p-6 bg-gradient-to-br from-warning/10 to-warning/5",
            currentPlan === "premium"
              ? "border-2 border-warning shadow-glow-primary"
              : "border-2 border-warning/50"
          )}
        >
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning text-warning-foreground">
            {currentPlan === "premium" ? "Activo" : "Recomendado"}
          </Badge>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold">Plan Premium</h3>
          </div>
          <p className="text-3xl font-bold mb-4">
            9,90 €<span className="text-sm font-normal text-muted-foreground">/mes</span>
          </p>
          <ul className="space-y-2 mb-6 text-sm">
            <li className="text-success">✓ Transacciones ilimitadas</li>
            <li className="text-success">✓ Cuentas ilimitadas</li>
            <li className="text-success">✓ Tarjetas ilimitadas</li>
            <li className="text-success">✓ Informes avanzados</li>
            <li className="text-success">✓ Gestión compartida</li>
            <li className="text-success">✓ Soporte prioritario</li>
          </ul>
          <Button
            className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
            disabled={currentPlan === "premium"}
            onClick={() => handleSwitchPlan("premium")}
          >
            {currentPlan === "premium" ? "Plan actual" : "Mejorar plan"}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        * El cobro real se habilitará próximamente. Por ahora puedes activar el plan
        Premium para probar todas las funciones sin límites.
      </p>
    </div>
  );
}
