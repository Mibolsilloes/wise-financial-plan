import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Layout } from "@/components/layout/Layout";
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

const bankIcons: Record<string, React.ElementType> = {
  "Nubank": CreditCardIcon,
  "Itaú": Landmark,
  "Bradesco": Building2,
  "Santander": Building2,
  "Carteira": Wallet,
};

const bankColors: Record<string, string> = {
  "Nubank": "hsl(280, 100%, 50%)",
  "Itaú": "hsl(25, 95%, 53%)",
  "Bradesco": "hsl(0, 84%, 60%)",
  "Santander": "hsl(0, 84%, 60%)",
  "Carteira": "hsl(160, 84%, 39%)",
};

const accounts = [
  { 
    id: 1, 
    name: "Nubank", 
    balance: 5420.50, 
    isDefault: true,
    lastUpdate: "2024-12-20"
  },
  { 
    id: 2, 
    name: "Itaú", 
    balance: 12350.00, 
    isDefault: false,
    lastUpdate: "2024-12-19"
  },
  { 
    id: 3, 
    name: "Bradesco", 
    balance: 890.25, 
    isDefault: false,
    lastUpdate: "2024-12-18"
  },
  { 
    id: 4, 
    name: "Carteira", 
    balance: 150.00, 
    isDefault: false,
    lastUpdate: "2024-12-20"
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

interface TransferDialogProps {
  sourceAccount: typeof accounts[0];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TransferDialog({ sourceAccount, open, onOpenChange }: TransferDialogProps) {
  const [destinationAccountId, setDestinationAccountId] = useState<string>("");
  const [transferDate, setTransferDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const destinationAccount = accounts.find(a => a.id.toString() === destinationAccountId);
  const SourceIcon = bankIcons[sourceAccount.name] || Building2;
  const sourceColor = bankColors[sourceAccount.name] || "hsl(217, 91%, 60%)";

  const handleTransfer = () => {
    // Would handle transfer logic here
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
              <DialogTitle className="text-lg">Transferir entre contas</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Mova dinheiro entre suas contas</p>
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
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Para</p>
              <Select value={destinationAccountId} onValueChange={setDestinationAccountId}>
                <SelectTrigger className="border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0">
                  <SelectValue placeholder="Selecionar conta" />
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
              <Label className="text-xs text-muted-foreground">Valor da transferência</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
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
              <Label className="text-xs text-muted-foreground">Data da transferência</Label>
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
                    {transferDate ? format(transferDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={transferDate}
                    onSelect={(date) => date && setTransferDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
            <Textarea
              placeholder="Ex: Transferência para poupança, reserva de emergência..."
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
  account: typeof accounts[0];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AdjustBalanceDialog({ account, open, onOpenChange }: AdjustBalanceDialogProps) {
  const [adjustmentDate, setAdjustmentDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add");
  const [reason, setReason] = useState("");

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

  const handleAdjust = () => {
    // Would handle adjustment logic here
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
                Conta: <span className="font-medium text-foreground">{account.name}</span>
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Current Balance Display */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Saldo atual</p>
              <p className={cn(
                "text-xl font-bold",
                account.balance >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(account.balance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Novo saldo</p>
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
                  Adicionar
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
                  Subtrair
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
                  Definir
                </span>
              </button>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {adjustmentType === "set" ? "Novo saldo" : "Valor"}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
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
              <Label className="text-xs text-muted-foreground">Data de competência</Label>
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
                    {adjustmentDate ? format(adjustmentDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={adjustmentDate}
                    onSelect={(date) => date && setAdjustmentDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Motivo do ajuste (opcional)</Label>
            <Input
              placeholder="Ex: Correção de lançamento duplicado..."
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
            {adjustmentType === "add" ? "Adicionar" : adjustmentType === "subtract" ? "Subtrair" : "Definir"} Saldo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditAccountDialogProps {
  account: typeof accounts[0];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditAccountDialog({ account, open, onOpenChange }: EditAccountDialogProps) {
  const [accountName, setAccountName] = useState(account.name);
  const [isDefault, setIsDefault] = useState(account.isDefault);
  const [initialBalance, setInitialBalance] = useState(account.balance.toString());

  const AccountIcon = bankIcons[account.name] || Building2;
  const accountColor = bankColors[account.name] || "hsl(217, 91%, 60%)";

  const handleSave = () => {
    // Would handle save logic here
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
              <DialogTitle className="text-lg">Editar conta</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Altere as configurações da conta
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nome da conta</Label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Ex: Banco Inter"
              className="h-11"
            />
            <p className="text-[10px] text-muted-foreground">
              Este nome será exibido em todas as transações e relatórios
            </p>
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Saldo inicial</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
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
                <Label className="text-sm font-medium cursor-pointer">Conta padrão</Label>
              </div>
              <p className="text-[10px] text-muted-foreground max-w-[220px]">
                Lançamentos automáticos serão feitos nesta conta, sem precisar informar
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
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BankAccounts() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [adjustBalanceDialogOpen, setAdjustBalanceDialogOpen] = useState(false);
  const [editAccountDialogOpen, setEditAccountDialogOpen] = useState(false);
  const [selectedAccountForTransfer, setSelectedAccountForTransfer] = useState<typeof accounts[0] | null>(null);
  const [selectedAccountForAdjust, setSelectedAccountForAdjust] = useState<typeof accounts[0] | null>(null);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<typeof accounts[0] | null>(null);
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  const openTransferDialog = (account: typeof accounts[0]) => {
    setSelectedAccountForTransfer(account);
    setTransferDialogOpen(true);
  };

  const openAdjustBalanceDialog = (account: typeof accounts[0]) => {
    setSelectedAccountForAdjust(account);
    setAdjustBalanceDialogOpen(true);
  };

  const openEditAccountDialog = (account: typeof accounts[0]) => {
    setSelectedAccountForEdit(account);
    setEditAccountDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Contas bancárias</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie suas contas e acompanhe seus saldos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary">
                <Plus className="w-4 h-4" />
                Nova conta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Criar nova conta bancária</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Nome da conta</Label>
                  <Input id="name" placeholder="Ex: Banco Inter" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="balance">Saldo inicial</Label>
                  <Input id="balance" type="number" placeholder="0,00" className="mt-1.5" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="default">Conta padrão</Label>
                    <p className="text-xs text-muted-foreground">Definir como conta principal</p>
                  </div>
                  <Switch id="default" />
                </div>
                <Button className="w-full">Criar conta</Button>
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
              <p className="text-xs text-muted-foreground mt-1">{accounts.length} contas ativas</p>
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
                          Extrato
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => openEditAccountDialog(account)}
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer text-warning">
                          <Archive className="w-4 h-4" />
                          Arquivar
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
                    Conta padrão
                  </Badge>
                )}

                {/* Balance */}
                <div className={cn("pt-4 border-t border-border/50", !account.isDefault && "mt-4")}>
                  <p className="text-xs text-muted-foreground mb-1">Saldo atual</p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(account.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Atualizado em {new Date(account.lastUpdate).toLocaleDateString("pt-BR")}
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
                    Extrato
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
            open={transferDialogOpen}
            onOpenChange={setTransferDialogOpen}
          />
        )}

        {/* Adjust Balance Dialog */}
        {selectedAccountForAdjust && (
          <AdjustBalanceDialog
            account={selectedAccountForAdjust}
            open={adjustBalanceDialogOpen}
            onOpenChange={setAdjustBalanceDialogOpen}
          />
        )}

        {/* Edit Account Dialog */}
        {selectedAccountForEdit && (
          <EditAccountDialog
            account={selectedAccountForEdit}
            open={editAccountDialogOpen}
            onOpenChange={setEditAccountDialogOpen}
          />
        )}
      </div>
    </Layout>
  );
}
