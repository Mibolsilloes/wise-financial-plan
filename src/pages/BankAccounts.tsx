import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Layout } from "@/components/layout/Layout";
import { useAccounts } from "@/contexts/AccountsContext";
import { usePlan } from "@/hooks/usePlan";
import { UpgradePlanDialog } from "@/components/UpgradePlanDialog";
import { toast } from "sonner";
import { 
  Plus, 
  Edit2, 
  Archive, 
  ArrowLeftRight,
  FileText,
  Settings2,
  Building2,
  Landmark,
  CreditCard as CreditCardIcon,
  Wallet,
  Star,
  MoreVertical,
  CalendarIcon,
  ArrowRight,
  SendHorizontal,
  TrendingUp,
  TrendingDown,
  Equal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BankAccount } from "@/data/mockData";

const bankIcons: Record<string, React.ElementType> = {
  "Santander": Landmark,
  "BBVA": Building2,
  "CaixaBank": Building2,
  "Sabadell": Building2,
  "Efectivo": Wallet,
}

const bankColors: Record<string, string> = {
  "Santander": "hsl(0, 84%, 60%)",
  "BBVA": "hsl(217, 91%, 60%)",
  "CaixaBank": "hsl(199, 89%, 48%)",
  "Sabadell": "hsl(25, 95%, 53%)",
  "Efectivo": "hsl(160, 84%, 39%)",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

type ActionResult = { error: Error | null };

interface TransferDialogProps {
  sourceAccount: BankAccount;
  accounts: BankAccount[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (fromId: string, toId: string, amount: number) => Promise<ActionResult>;
}

function TransferDialog({ sourceAccount, accounts, open, onOpenChange, onTransfer }: TransferDialogProps) {
  const [destinationAccountId, setDestinationAccountId] = useState<string>("");
  const [transferDate, setTransferDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setDestinationAccountId("");
      setAmount("");
      setDescription("");
      setTransferDate(new Date());
    }
  }, [open, sourceAccount]);

  const destinationAccount = accounts.find(a => a.id === destinationAccountId);
  const SourceIcon = bankIcons[sourceAccount.name] || Building2;
  const sourceColor = bankColors[sourceAccount.name] || "hsl(217, 91%, 60%)";

  const handleTransfer = async () => {
    const numAmount = parseFloat(amount.replace(",", ".")) || 0;
    if (!destinationAccountId || numAmount <= 0) {
      toast.error("Selecciona una cuenta de destino y un importe válido");
      return;
    }
    if (numAmount > sourceAccount.balance) {
      toast.error("Saldo insuficiente en la cuenta de origen");
      return;
    }
    const { error } = await onTransfer(sourceAccount.id, destinationAccountId, numAmount);
    if (error) {
      toast.error("No se pudo realizar la transferencia", { description: error.message });
      return;
    }
    toast.success(`Transferencia de ${formatCurrency(numAmount)} realizada correctamente`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <SendHorizontal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Transferir entre cuentas</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Mueve dinero entre tus cuentas</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Source and Destination Cards */}
          <div className="flex items-center gap-3">
            {/* Source Account */}
            <div className="flex-1 p-4 rounded-xl border border-border bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">De</p>
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${sourceColor}20` }}
                >
                  <SourceIcon className="w-4 h-4" style={{ color: sourceColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{sourceAccount.name}</p>
                  <p className="text-xs text-success">{formatCurrency(sourceAccount.balance)}</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>

            {/* Destination Account */}
            <div className="flex-1 p-4 rounded-xl border border-border bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">A</p>
              <Select value={destinationAccountId} onValueChange={setDestinationAccountId}>
                <SelectTrigger className="border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {accounts
                    .filter(a => a.id !== sourceAccount.id)
                    .map(account => {
                      const Icon = bankIcons[account.name] || Building2;
                      const color = bankColors[account.name] || "hsl(217, 91%, 60%)";
                      return (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color }} />
                            <span>{account.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatCurrency(account.balance)}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              {destinationAccount && (
                <p className="text-xs text-muted-foreground mt-1">
                  Saldo: {formatCurrency(destinationAccount.balance)}
                </p>
              )}
            </div>
          </div>

          {/* Amount and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Importe de la transferencia</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <Input
                  type="text"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 h-11 text-lg font-semibold"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Fecha de la transferencia</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !transferDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {transferDate ? format(transferDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={transferDate}
                    onSelect={(date) => date && setTransferDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Descripción (opcional)</Label>
            <Textarea
              placeholder="Ej: Transferencia a ahorros, fondo de emergencia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={!destinationAccountId || !amount}
            className="flex-1 gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AdjustBalanceDialogProps {
  account: BankAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjust: (id: string, amount: number, operation: "add" | "subtract" | "set") => Promise<ActionResult>;
}

function AdjustBalanceDialog({ account, open, onOpenChange, onAdjust }: AdjustBalanceDialogProps) {
  const [adjustmentDate, setAdjustmentDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
      setAdjustmentType("add");
      setReason("");
      setAdjustmentDate(new Date());
    }
  }, [open, account]);

  const AccountIcon = bankIcons[account.name] || Building2;
  const accountColor = bankColors[account.name] || "hsl(217, 91%, 60%)";

  const calculateNewBalance = () => {
    const numAmount = parseFloat(amount.replace(",", ".")) || 0;
    switch (adjustmentType) {
      case "add":
        return account.balance + numAmount;
      case "subtract":
        return account.balance - numAmount;
      case "set":
        return numAmount;
      default:
        return account.balance;
    }
  };

  const handleAdjust = async () => {
    const numAmount = parseFloat(amount.replace(",", ".")) || 0;
    if (numAmount <= 0 && adjustmentType !== "set") {
      toast.error("Introduce un importe válido");
      return;
    }
    const { error } = await onAdjust(account.id, numAmount, adjustmentType);
    if (error) {
      toast.error("No se pudo ajustar el saldo", { description: error.message });
      return;
    }
    toast.success("Saldo ajustado correctamente");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: `${accountColor}20` }}
            >
              <AccountIcon className="w-5 h-5" style={{ color: accountColor }} />
            </div>
            <div>
              <DialogTitle className="text-lg">Ajustar saldo</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cuenta: <span className="font-medium text-foreground">{account.name}</span>
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Current Balance Display */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Saldo actual</p>
              <p className={cn(
                "text-xl font-bold",
                account.balance >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(account.balance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Nuevo saldo</p>
              <p className={cn(
                "text-xl font-bold",
                calculateNewBalance() >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(calculateNewBalance())}
              </p>
            </div>
          </div>

          {/* Adjustment Type Tabs */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tipo de ajuste</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAdjustmentType("add")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                  adjustmentType === "add"
                    ? "border-success bg-success/10"
                    : "border-border hover:border-success/50"
                )}
              >
                <TrendingUp className={cn(
                  "w-5 h-5",
                  adjustmentType === "add" ? "text-success" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  adjustmentType === "add" ? "text-success" : "text-muted-foreground"
                )}>
                  Añadir
                </span>
              </button>
              <button
                onClick={() => setAdjustmentType("subtract")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                  adjustmentType === "subtract"
                    ? "border-destructive bg-destructive/10"
                    : "border-border hover:border-destructive/50"
                )}
              >
                <TrendingDown className={cn(
                  "w-5 h-5",
                  adjustmentType === "subtract" ? "text-destructive" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  adjustmentType === "subtract" ? "text-destructive" : "text-muted-foreground"
                )}>
                  Restar
                </span>
              </button>
              <button
                onClick={() => setAdjustmentType("set")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                  adjustmentType === "set"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Equal className={cn(
                  "w-5 h-5",
                  adjustmentType === "set" ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  adjustmentType === "set" ? "text-primary" : "text-muted-foreground"
                )}>
                  Establecer
                </span>
              </button>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {adjustmentType === "set" ? "Nuevo saldo" : "Importe"}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <Input
                  type="text"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 h-11 text-lg font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Fecha de aplicación</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !adjustmentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {adjustmentDate ? format(adjustmentDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={adjustmentDate}
                    onSelect={(date) => date && setAdjustmentDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Motivo del ajuste (opcional)</Label>
            <Input
              placeholder="Ej: Corrección de asiento duplicado..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-4 mt-2">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAdjust}
            disabled={!amount}
            className={cn(
              "flex-1 gap-2",
              adjustmentType === "add" && "bg-success hover:bg-success/90",
              adjustmentType === "subtract" && "bg-destructive hover:bg-destructive/90"
            )}
          >
            <Settings2 className="w-4 h-4" />
            {adjustmentType === "add" ? "Añadir" : adjustmentType === "subtract" ? "Restar" : "Establecer"} Saldo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditAccountDialogProps {
  account: BankAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<BankAccount>) => Promise<ActionResult>;
}

function EditAccountDialog({ account, open, onOpenChange, onSave }: EditAccountDialogProps) {
  const [accountName, setAccountName] = useState(account.name);
  const [isDefault, setIsDefault] = useState(account.isDefault);
  const [initialBalance, setInitialBalance] = useState(account.balance.toString());

  // Reset form when account changes
  useEffect(() => {
    setAccountName(account.name);
    setIsDefault(account.isDefault);
    setInitialBalance(account.balance.toString());
  }, [account]);

  const AccountIcon = bankIcons[account.name] || Building2;
  const accountColor = bankColors[account.name] || "hsl(217, 91%, 60%)";

  const handleSave = async () => {
    if (!accountName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const { error } = await onSave(account.id, {
      name: accountName.trim(),
      isDefault,
      balance: parseFloat(initialBalance.replace(",", ".")) || 0,
    });
    if (error) {
      toast.error("No se pudo actualizar la cuenta", { description: error.message });
      return;
    }
    toast.success("Cuenta actualizada correctamente");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: `${accountColor}20` }}
            >
              <AccountIcon className="w-5 h-5" style={{ color: accountColor }} />
            </div>
            <div>
              <DialogTitle className="text-lg">Editar cuenta</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Modifica la configuración de la cuenta
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nombre de la cuenta</Label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Ej: Banco Sabadell"
              className="h-11"
            />
            <p className="text-[10px] text-muted-foreground">
              Este nombre se mostrará en todas las transacciones e informes
            </p>
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Saldo inicial</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <Input
                type="text"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Default Account Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Star className={cn(
                  "w-4 h-4",
                  isDefault ? "text-warning fill-warning" : "text-muted-foreground"
                )} />
                <Label className="text-sm font-medium cursor-pointer">Cuenta por defecto</Label>
              </div>
              <p className="text-[10px] text-muted-foreground max-w-[220px]">
                Los movimientos automáticos se registrarán en esta cuenta
              </p>
            </div>
            <Switch
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!accountName.trim()}
            className="flex-1 gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BankAccounts() {
  const navigate = useNavigate();
  const { accounts, transfer, adjustBalance, updateAccount, addAccount, deleteAccount } = useAccounts();
  const { canAddBankAccount, isPremium, usage, limits } = usePlan();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // New account form state
  const [newAccountName, setNewAccountName]       = useState("");
  const [newAccountBank, setNewAccountBank]       = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("0");

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error("El nombre de la cuenta es obligatorio");
      return;
    }
    const { error } = await addAccount({
      name:    newAccountName.trim(),
      bank:    newAccountBank.trim() || newAccountName.trim(),
      type:    "corriente",
      balance: parseFloat(newAccountBalance.replace(",", ".")) || 0,
      color:   "hsl(157, 54%, 33%)",
    });
    if (error) {
      toast.error("No se pudo crear la cuenta", { description: error.message });
      return;
    }
    toast.success("Cuenta creada correctamente");
    setNewAccountName("");
    setNewAccountBank("");
    setNewAccountBalance("0");
    setIsDialogOpen(false);
  };

  const handleDeleteAccount = async (id: string) => {
    const { error } = await deleteAccount(id);
    if (error) {
      toast.error("No se pudo eliminar la cuenta", { description: error.message });
      return;
    }
    toast.success("Cuenta eliminada");
  };
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [adjustBalanceDialogOpen, setAdjustBalanceDialogOpen] = useState(false);
  const [editAccountDialogOpen, setEditAccountDialogOpen] = useState(false);
  const [selectedAccountForTransfer, setSelectedAccountForTransfer] = useState<BankAccount | null>(null);
  const [selectedAccountForAdjust, setSelectedAccountForAdjust] = useState<BankAccount | null>(null);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<BankAccount | null>(null);
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  const openTransferDialog = (account: BankAccount) => {
    setSelectedAccountForTransfer(account);
    setTransferDialogOpen(true);
  };

  const openAdjustBalanceDialog = (account: BankAccount) => {
    setSelectedAccountForAdjust(account);
    setAdjustBalanceDialogOpen(true);
  };

  const openEditAccountDialog = (account: BankAccount) => {
    setSelectedAccountForEdit(account);
    setEditAccountDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Cuentas bancarias</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestiona tus cuentas y controla tus saldos
            </p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(o) => {
              if (o && !canAddBankAccount) {
                setShowUpgrade(true);
                return;
              }
              setIsDialogOpen(o);
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary">
                <Plus className="w-4 h-4" />
                Nueva cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Crear nueva cuenta bancaria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="acc-name">Nombre de la cuenta</Label>
                  <Input
                    id="acc-name"
                    placeholder="Ej: Cuenta nómina"
                    className="mt-1.5"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="acc-bank">Banco</Label>
                  <Input
                    id="acc-bank"
                    placeholder="Ej: Santander, BBVA, CaixaBank..."
                    className="mt-1.5"
                    value={newAccountBank}
                    onChange={(e) => setNewAccountBank(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="acc-balance">Saldo inicial (€)</Label>
                  <Input
                    id="acc-balance"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="mt-1.5"
                    value={newAccountBalance}
                    onChange={(e) => setNewAccountBalance(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleCreateAccount} disabled={!newAccountName.trim()}>
                  Crear cuenta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Balance Card */}
        <div className="glass rounded-xl p-6 border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/20">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo total</p>
              <p className="text-3xl font-bold text-success">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">{accounts.length} cuentas activas</p>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account, index) => {
            const Icon = bankIcons[account.name] || Building2;
            const color = bankColors[account.name] || "hsl(217, 91%, 60%)";
            
            return (
              <div
                key={account.id}
                className="glass rounded-xl p-5 border border-border/50 hover:border-border transition-all duration-200 group animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isDefault && (
                      <Star className="w-4 h-4 text-warning fill-warning" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => openTransferDialog(account)}
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                          Transferir
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => openAdjustBalanceDialog(account)}
                        >
                          <Settings2 className="w-4 h-4" />
                          Ajustar saldo
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => navigate(`/contas/${account.id}/extrato`)}
                        >
                          <FileText className="w-4 h-4" />
                          Extracto
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => openEditAccountDialog(account)}
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Archive className="w-4 h-4" />
                          Eliminar cuenta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Name & Badge */}
                <h3 className="font-semibold mb-1">{account.name}</h3>
                {account.isDefault && (
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] bg-warning/10 text-warning border-warning/20 mb-4"
                  >
                    Cuenta por defecto
                  </Badge>
                )}

                {/* Balance */}
                <div className={cn("pt-4 border-t border-border/50", !account.isDefault && "mt-4")}>
                  <p className="text-xs text-muted-foreground mb-1">Saldo actual</p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(account.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {account.lastUpdate
                      ? `Actualizado el ${new Date(account.lastUpdate).toLocaleDateString("es-ES")}`
                      : "Recientemente actualizado"}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => openTransferDialog(account)}
                  >
                    <ArrowLeftRight className="w-3 h-3 mr-1" />
                    Transferir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/contas/${account.id}/extrato`)}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Extracto
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transfer Dialog */}
        {selectedAccountForTransfer && (
          <TransferDialog
            sourceAccount={selectedAccountForTransfer}
            accounts={accounts}
            open={transferDialogOpen}
            onOpenChange={setTransferDialogOpen}
            onTransfer={transfer}
          />
        )}

        {/* Adjust Balance Dialog */}
        {selectedAccountForAdjust && (
          <AdjustBalanceDialog
            account={selectedAccountForAdjust}
            open={adjustBalanceDialogOpen}
            onOpenChange={setAdjustBalanceDialogOpen}
            onAdjust={adjustBalance}
          />
        )}

        {/* Edit Account Dialog */}
        {selectedAccountForEdit && (
          <EditAccountDialog
            account={selectedAccountForEdit}
            open={editAccountDialogOpen}
            onOpenChange={setEditAccountDialogOpen}
            onSave={updateAccount}
          />
        )}
      </div>
      <UpgradePlanDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        reason={`Has alcanzado el límite de ${limits.bankAccounts} cuentas bancarias del plan Gratuito (${usage.bankAccounts}/${limits.bankAccounts}). Mejora a Premium para crear cuentas ilimitadas.`}
      />
    </Layout>
  );
}
