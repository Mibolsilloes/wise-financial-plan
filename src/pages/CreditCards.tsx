import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { 
  Plus, 
  Edit2, 
  Archive, 
  FileText,
  CreditCard,
  MoreVertical,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const brandColors: Record<string, string> = {
  "Visa": "hsl(217, 91%, 60%)",
  "Mastercard": "hsl(25, 95%, 53%)",
  "Elo": "hsl(45, 93%, 47%)",
  "American Express": "hsl(199, 89%, 48%)",
};

const brandGradients: Record<string, string> = {
  "Visa": "from-blue-600 to-blue-800",
  "Mastercard": "from-orange-500 to-red-600",
  "Elo": "from-yellow-500 to-yellow-700",
  "American Express": "from-cyan-500 to-blue-600",
};

const cards = [
  { 
    id: 1, 
    name: "Nubank Platinum",
    brand: "Mastercard",
    limit: 15000.00,
    used: 4230.75,
    closingDay: 3,
    dueDay: 10,
    account: "Nubank",
    person: "João"
  },
  { 
    id: 2, 
    name: "Itaú Click",
    brand: "Visa",
    limit: 8000.00,
    used: 2150.00,
    closingDay: 15,
    dueDay: 22,
    account: "Itaú",
    person: "Maria"
  },
  { 
    id: 3, 
    name: "Bradesco Neo",
    brand: "Elo",
    limit: 5000.00,
    used: 890.50,
    closingDay: 20,
    dueDay: 27,
    account: "Bradesco",
    person: "João"
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function CreditCards() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Cartões de crédito</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie seus cartões e acompanhe suas faturas
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Adicionar despesa
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary">
                  <Plus className="w-4 h-4" />
                  Novo cartão
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Cadastrar novo cartão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="name">Descrição</Label>
                    <Input id="name" placeholder="Ex: Nubank Ultravioleta" className="mt-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="limit">Limite total</Label>
                      <Input id="limit" type="number" placeholder="0,00" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="brand">Bandeira</Label>
                      <Select>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="mastercard">Mastercard</SelectItem>
                          <SelectItem value="elo">Elo</SelectItem>
                          <SelectItem value="amex">American Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="closing">Dia fechamento</Label>
                      <Input id="closing" type="number" min="1" max="31" placeholder="Ex: 15" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="due">Dia vencimento</Label>
                      <Input id="due" type="number" min="1" max="31" placeholder="Ex: 22" className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="account">Conta associada</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nubank">Nubank</SelectItem>
                        <SelectItem value="itau">Itaú</SelectItem>
                        <SelectItem value="bradesco">Bradesco</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Cadastrar cartão</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const available = card.limit - card.used;
            const usedPercentage = (card.used / card.limit) * 100;
            const gradient = brandGradients[card.brand] || "from-gray-600 to-gray-800";
            
            return (
              <div
                key={card.id}
                className="relative animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Credit Card Visual */}
                <div className={cn(
                  "relative h-48 rounded-2xl p-6 bg-gradient-to-br shadow-xl overflow-hidden",
                  gradient
                )}>
                  {/* Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white transform translate-x-10 -translate-y-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white transform -translate-x-10 translate-y-10" />
                  </div>

                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white/70 text-xs mb-1">Limite usado</p>
                        <p className="text-white text-xl font-bold">{formatCurrency(card.used)}</p>
                      </div>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        {card.brand}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <CreditCard className="w-10 h-10 text-white/80" />
                        <div className="text-white/50 text-lg tracking-widest">
                          •••• •••• •••• ••••
                        </div>
                      </div>
                      <p className="text-white font-medium">{card.name}</p>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="glass rounded-xl p-5 mt-4 border border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{card.name}</h3>
                      <p className="text-xs text-muted-foreground">{card.person} • {card.account}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <FileText className="w-4 h-4" />
                          Detalhes da fatura
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

                  {/* Limit Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-destructive">Usado: {formatCurrency(card.used)}</span>
                      <span className="text-success">Disponível: {formatCurrency(available)}</span>
                    </div>
                    <Progress 
                      value={usedPercentage} 
                      className="h-2 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Limite total: {formatCurrency(card.limit)}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="flex gap-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Fecha dia</span>
                      <span className="font-medium">{card.closingDay}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Vence dia</span>
                      <span className="font-medium">{card.dueDay}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
