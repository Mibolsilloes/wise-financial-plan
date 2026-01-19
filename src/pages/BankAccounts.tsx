import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  MoreVertical
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export default function BankAccounts() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

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
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <ArrowLeftRight className="w-4 h-4" />
                          Transferir
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
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
                        <DropdownMenuItem className="gap-2 cursor-pointer">
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
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
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
      </div>
    </Layout>
  );
}
