import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useAccounts } from "@/contexts/AccountsContext";
import { useCreditCards } from "@/contexts/CreditCardsContext";
import { toast } from "@/hooks/use-toast";
import { Transaction } from "@/data/mockData";

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: EditTransactionDialogProps) {
  const { updateTransaction } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [creditCard, setCreditCard] = useState("");
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [competenceDate, setCompetenceDate] = useState<Date | undefined>();
  const [paymentDate, setPaymentDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<string>("");
  const [isFixed, setIsFixed] = useState(false);

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setAccount(transaction.account);
      setCreditCard(transaction.creditCard || "");
      setResponsible(transaction.responsible);
      setDueDate(transaction.dueDate);
      setCompetenceDate(transaction.competenceDate);
      setPaymentDate(transaction.paymentDate || undefined);
      setStatus(transaction.status);
      setIsFixed(transaction.isFixed);
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction) return;

    if (!description.trim()) {
      toast({
        title: "Error",
        description: "La descripción es obligatoria",
        variant: "destructive",
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Error",
        description: "El importe debe ser un número positivo",
        variant: "destructive",
      });
      return;
    }

    if (!dueDate) {
      toast({
        title: "Error",
        description: "La fecha de vencimiento es obligatoria",
        variant: "destructive",
      });
      return;
    }

    const categoryData = categories.find((c) => c.name === category);

    updateTransaction(transaction.id, {
      description: description.trim(),
      amount: parsedAmount,
      category,
      account,
      creditCard: creditCard || undefined,
      responsible,
      dueDate,
      competenceDate: competenceDate || dueDate,
      paymentDate: paymentDate || undefined,
      status: status as Transaction["status"],
      isFixed,
      color: categoryData?.color || transaction.color,
    });

    toast({
      title: "Transacción actualizada",
      description: `"${description}" ha sido actualizada correctamente.`,
    });

    onOpenChange(false);
  };

  const filteredCategories = categories.filter(
    (c) => c.type === transaction?.type
  );

  const isPaid = status === "pagado" || status === "cobrado";

  const toggleStatus = () => {
    if (transaction?.type === "ingreso") {
      setStatus(status === "cobrado" ? "por_cobrar" : "cobrado");
    } else {
      setStatus(status === "pagado" ? "pendiente" : "pagado");
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Editar {transaction.type === "ingreso" ? "Ingreso" : "Gasto"}
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de la transacción.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la transacción"
            />
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Importe (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="grid gap-2">
            <Label>Cuenta</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.name}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsible */}
          <div className="grid gap-2">
            <Label htmlFor="responsible">Responsable</Label>
            <Input
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Nombre del responsable"
            />
          </div>

          {/* Due Date */}
          <div className="grid gap-2">
            <Label>Fecha de vencimiento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate
                    ? format(dueDate, "PPP", { locale: es })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Toggle */}
          <div className="grid gap-2">
            <Label>Estado</Label>
            <Button
              type="button"
              variant="outline"
              onClick={toggleStatus}
              className={cn(
                "justify-start gap-2",
                isPaid
                  ? "border-success text-success hover:bg-success/10"
                  : "border-warning text-warning hover:bg-warning/10"
              )}
            >
              {isPaid ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {transaction.type === "ingreso"
                ? isPaid
                  ? "Cobrado"
                  : "Por cobrar"
                : isPaid
                ? "Pagado"
                : "Pendiente"}
            </Button>
          </div>

          {/* Fixed/Variable Toggle */}
          <div className="grid gap-2">
            <Label>Tipo de transacción</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isFixed ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFixed(true)}
              >
                Fijo
              </Button>
              <Button
                type="button"
                variant={!isFixed ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFixed(false)}
              >
                Variable
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
