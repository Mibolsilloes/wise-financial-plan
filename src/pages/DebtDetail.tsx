import { useState } from "react";
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
import { ArrowLeft, Plus, Pencil, Trash2, PartyPopper, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useDebts, debtStats } from "@/hooks/useDebts";
import { DebtFormDialog } from "@/components/debts/DebtFormDialog";
import { DebtPaymentDialog } from "@/components/debts/DebtPaymentDialog";
import {
  formatEUR,
  formatDebtDate,
  getDebtIcon,
  debtTypeLabel,
  humanDuration,
} from "@/lib/debts";

export default function DebtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { debts, loading, updateDebt, deleteDebt, addPayment, deletePayment } = useDebts();
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const debt = debts.find((d) => d.id === id);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          Cargando deuda...
        </div>
      </Layout>
    );
  }

  if (!debt) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 space-y-4">
          <p className="font-semibold">No encontramos esta deuda.</p>
          <Button variant="outline" onClick={() => navigate("/dividas")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Deudas
          </Button>
        </div>
      </Layout>
    );
  }

  const stats = debtStats(debt);
  const Icon = getDebtIcon(debt.icon);

  const handleDelete = async () => {
    const { error } = await deleteDebt(debt.id);
    if (error) return toast.error(error.message);
    toast.success("Deuda eliminada");
    navigate("/dividas");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dividas")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Deudas
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4 mr-1" /> Editar
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Eliminar
            </Button>
            <Button size="sm" onClick={() => setPayOpen(true)} disabled={stats.isPaid}>
              <Plus className="w-4 h-4 mr-1" /> Registrar pago
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-5" style={{ borderTop: `4px solid ${debt.color}` }}>
          <div className="flex items-center gap-3">
            <span className="w-14 h-14 rounded-2xl grid place-items-center" style={{ backgroundColor: `${debt.color}22`, color: debt.color }}>
              <Icon className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-xl font-bold">{debt.name}</h1>
              <p className="text-sm text-muted-foreground">{debtTypeLabel(debt.debtType)}</p>
            </div>
            {stats.isPaid && (
              <span className="ml-auto flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                <PartyPopper className="w-4 h-4" /> Deuda pagada
              </span>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm font-semibold mb-1">
              <span className="text-emerald-600">{formatEUR(stats.principalPaid)} pagados</span>
              <span className="text-red-600">{formatEUR(stats.remaining)} pendientes</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${stats.progress}%`, backgroundColor: debt.color }} />
            </div>
            <div className="flex justify-between text-xs mt-1 font-semibold">
              <span>{stats.progress.toFixed(1)}% pagado</span>
              <span>{(100 - stats.progress).toFixed(1)}% pendiente</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Metric label="Deuda inicial" value={formatEUR(debt.principal)} />
            <Metric label="Total pagado" value={formatEUR(stats.totalPaid)} className="text-emerald-600" />
            <Metric label="Saldo pendiente" value={formatEUR(stats.remaining)} className="text-red-600" />
            <Metric label="Cuota mensual" value={formatEUR(stats.monthlyPayment)} />
            <Metric label="Interés anual" value={`${debt.annualRate.toFixed(2)} %`} />
            <Metric label="Intereses pagados" value={formatEUR(stats.interestPaid)} />
            <Metric
              label="Intereses estimados"
              value={stats.hasRateData ? formatEUR(stats.totalInterestEstimated) : "Sin datos"}
            />
            <Metric
              label="Coste total"
              value={stats.hasRateData ? formatEUR(stats.totalCost) : formatEUR(debt.principal)}
            />
            <Metric label="Cuotas restantes" value={String(stats.remainingInstallments)} />
            <Metric label="Tiempo restante" value={humanDuration(stats.remainingInstallments)} />
            <Metric label="Fecha de inicio" value={formatDebtDate(debt.startDate)} />
            <Metric label="Fin estimado" value={formatDebtDate(stats.estimatedEnd)} />
          </div>

          {!stats.hasRateData && (
            <p className="text-xs text-muted-foreground">
              Faltan datos de interés o número de cuotas: los importes mostrados son una estimación
              basada en la información disponible.
            </p>
          )}
        </div>

        {!stats.isPaid && stats.upcomingPayments.length > 0 && (
          <div className="rounded-2xl border bg-card p-5">
            <p className="font-semibold mb-3 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" /> Próximos pagos
            </p>
            <ul className="space-y-2 text-sm">
              {stats.upcomingPayments.map((p) => (
                <li key={p.number} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                  <span className="text-muted-foreground">Cuota {p.number} — {formatDebtDate(p.date)}</span>
                  <strong>{formatEUR(p.amount)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border bg-card p-5">
          <p className="font-semibold mb-3">Historial de pagos</p>
          {debt.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay pagos registrados en esta deuda.
            </p>
          ) : (
            <ul className="space-y-3">
              {debt.payments.map((p, index) => {
                const later = debt.payments.slice(0, index).reduce((s, x) => s + x.principalPart, 0);
                const balanceAfter = Math.max(0, stats.remaining + later);
                return (
                  <li key={p.id} className="flex items-start justify-between gap-3 border-b last:border-0 pb-3 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-semibold text-red-600">−{formatEUR(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDebtDate(p.date)}
                        {p.installmentNumber ? ` · Cuota ${p.installmentNumber}` : ""}
                      </p>
                      <p className="text-xs mt-1">
                        Capital: <strong className="text-emerald-600">{formatEUR(p.principalPart)}</strong>{" "}
                        · Intereses: <strong className="text-amber-600">{formatEUR(p.interestPart)}</strong>
                      </p>
                      {p.note && <p className="text-xs text-muted-foreground mt-1">{p.note}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Saldo tras el pago</p>
                      <p className="text-sm font-bold">{formatEUR(balanceAfter)}</p>
                      <button
                        className="text-xs text-destructive hover:underline mt-1"
                        onClick={async () => {
                          const { error } = await deletePayment(p.id);
                          if (error) toast.error(error.message);
                          else toast.success("Pago eliminado");
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <DebtFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        debt={debt}
        onSubmit={(values) => updateDebt(debt.id, values)}
      />

      <DebtPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        remaining={stats.remaining}
        annualRate={debt.annualRate}
        suggestedAmount={stats.monthlyPayment}
        nextInstallmentNumber={stats.paymentsMade + 1}
        onSubmit={(values) => addPayment({ debtId: debt.id, ...values })}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta deuda?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar esta deuda? Esta acción también eliminará el
              historial de pagos asociado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-bold ${className ?? ""}`}>{value}</p>
    </div>
  );
}
