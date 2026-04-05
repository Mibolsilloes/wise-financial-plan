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

  const [description,  setDescription]  = useState("");
  const [amount,       setAmount]        = useState("");
  const [categoryId,   setCategoryId]    = useState("");
  const [accountId,    setAccountId]     = useState("");
  const [creditCardId, setCreditCardId]  = useState("");
  const [responsible,  setResponsible]   = useState("");
  const [dueDate,      setDueDate]       = useState<Date | undefined>();
  const [paymentDate,  setPaymentDate]   = useState<Date | undefined>();
  const [status,       setStatus]        = useState<string>("");
  const [isFixed,      setIsFixed]       = useState(false);

  // Preenche o form quando a transação mudar
  useEffect(() => {
    if (!transaction) return;
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    // Usa o ID se disponível, senão tenta resolver pelo nome
    setCategoryId(
      transaction.categoryId ||
      categories.find((c) => c.name === transaction.category)?.id ||
      ""
    );
    setAccountId(
      transaction.accountId ||
      accounts.find((a) => a.name === transaction.account)?.id ||
      ""
    );
    setCreditCardId(
      transaction.creditCardId ||
      creditCards.find((c) => c.name === transaction.creditCard)?.id ||
      ""
    );
    setResponsible(transaction.responsible);
    setDueDate(transaction.dueDate);
    setPaymentDate(transaction.paymentDate || undefined);
    setStatus(transaction.status);
    setIsFixed(transaction.isFixed);
  }, [transaction, categories, accounts, creditCards]);

  const handleSave = () => {
    if (!transaction) return;

    if (!description.trim()) {
      toast({ title: "Error", description: "La descripción es obligatoria", variant: "destructive" });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: "Error", description: "El importe debe ser un número positivo", variant: "destructive" });
      return;
    }

    if (!dueDate) {
      toast({ title: "Error", description: "La fecha de vencimiento es obligatoria", variant: "destructive" });
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedAccount  = accounts.find((a) => a.id === accountId);
    const selectedCard     = creditCards.find((c) => c.id === creditCardId);

    updateTransaction(transaction.id, {
      description:   description.trim(),
      amount:        parsedAmount,
      category:      selectedCategory?.name || transaction.category,
      categoryId:    categoryId   || undefined,
      account:       selectedAccount?.name  || "",
      accountId:     accountId    || undefined,
      creditCard:    selectedCard?.name,
      creditCardId:  creditCardId || undefined,
      responsible,
      dueDate,
      competenceDate: dueDate,
      paymentDate,
      status:        status as Transaction["status"],
      isFixed,
      color:         selectedCategory?.color || transaction.color,
    });

    toast({ title: "Transacción actualizada", description: `"${description}" ha sido actualizada correctamente.` });
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
          {/* Descripción */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la transacción"
            />
          </div>

          {/* Importe */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Importe</Label>
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

          {/* Categoría — usa ID como value */}
          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cuenta — usa ID como value */}
          <div className="grid gap-2">
            <Label>Cuenta</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} — {acc.bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tarjeta de crédito — apenas para gastos, usa ID como value */}
          {transaction.type === "gasto" && (
            <div className="grid gap-2">
              <Label>Tarjeta de crédito</Label>
              <Select value={creditCardId} onValueChange={setCreditCardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin tarjeta (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin tarjeta</SelectItem>
                  {creditCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} — {card.brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Responsable */}
          <div className="grid gap-2">
            <Label htmlFor="responsible">Responsable</Label>
            <Input
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Nombre del responsable"
            />
          </div>

          {/* Fecha de vencimiento */}
          <div className="grid gap-2">
            <Label>Fecha de vencimiento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} locale={es} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de pago / cobro */}
          <div className="grid gap-2">
            <Label>
              {transaction.type === "ingreso" ? "Fecha de cobro" : "Fecha de pago"}
              <span className="text-muted-foreground text-xs ml-1">(opcional)</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: es }) : "Sin fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} locale={es} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Estado */}
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
              {isPaid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {transaction.type === "ingreso"
                ? isPaid ? "Cobrado" : "Por cobrar"
                : isPaid ? "Pagado"  : "Pendiente"}
            </Button>
          </div>

          {/* Tipo (Fijo / Variable) */}
          <div className="grid gap-2">
            <Label>Tipo de transacción</Label>
            <div className="flex gap-2">
              <Button type="button" variant={isFixed ? "default" : "outline"} size="sm" onClick={() => setIsFixed(true)}>
                Fijo
              </Button>
              <Button type="button" variant={!isFixed ? "default" : "outline"} size="sm" onClick={() => setIsFixed(false)}>
                Variable
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
