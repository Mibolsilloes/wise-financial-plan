import { AlertTriangle } from "lucide-react";
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
import { useTransactions } from "@/contexts/TransactionsContext";
import { toast } from "@/hooks/use-toast";
import { Transaction } from "@/data/mockData";

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: DeleteTransactionDialogProps) {
  const { deleteTransaction } = useTransactions();

  const handleDelete = () => {
    if (!transaction) return;

    deleteTransaction(transaction.id);

    toast({
      title: "Transacción eliminada",
      description: `"${transaction.description}" ha sido eliminada correctamente.`,
    });

    onOpenChange(false);
  };

  if (!transaction) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Esta acción no se puede deshacer. Se eliminará permanentemente la
            siguiente transacción:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-border bg-muted/50 p-4 my-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.category} • {transaction.account}
              </p>
            </div>
            <p
              className={
                transaction.type === "ingreso"
                  ? "text-success font-semibold"
                  : "text-destructive font-semibold"
              }
            >
              {transaction.type === "ingreso" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
