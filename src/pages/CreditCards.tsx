import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { 
  Plus, 
  Edit2, 
  Archive, 
  FileText,
  CreditCard,
  MoreVertical,
  Calendar,
  TrendingUp,
  Star
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    name: "Santander Platinum",
    brand: "Mastercard",
    limit: 15000.00,
    used: 4230.75,
    closingDay: 3,
    dueDay: 10,
    account: "Santander",
    person: "Juan"
  },
  { 
    id: 2, 
    name: "BBVA Aqua",
    brand: "Visa",
    limit: 8000.00,
    used: 2150.00,
    closingDay: 15,
    dueDay: 22,
    account: "BBVA",
    person: "María"
  },
  { 
    id: 3, 
    name: "CaixaBank Neo",
    brand: "Visa",
    limit: 5000.00,
    used: 890.50,
    closingDay: 20,
    dueDay: 27,
    account: "CaixaBank",
    person: "Juan"
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

export default function CreditCards() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<typeof cards[0] | null>(null);

  const openEditDialog = (card: typeof cards[0]) => {
    setSelectedCardForEdit(card);
    setEditDialogOpen(true);
  };
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tarjetas de crédito</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestiona tus tarjetas y controla tus facturas
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Añadir gasto
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary">
                  <Plus className="w-4 h-4" />
                  Nueva tarjeta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Registrar nueva tarjeta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="name">Descripción</Label>
                    <Input id="name" placeholder="Ej: Santander Platinum" className="mt-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="limit">Límite total</Label>
                      <Input id="limit" type="number" placeholder="0,00" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="brand">Marca</Label>
                      <Select>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="mastercard">Mastercard</SelectItem>
                          <SelectItem value="amex">American Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="closing">Día de cierre</Label>
                      <Input id="closing" type="number" min="1" max="31" placeholder="Ej: 15" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="due">Día de vencimiento</Label>
                      <Input id="due" type="number" min="1" max="31" placeholder="Ej: 22" className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="account">Cuenta asociada</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Seleccionar cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="santander">Santander</SelectItem>
                        <SelectItem value="bbva">BBVA</SelectItem>
                        <SelectItem value="caixabank">CaixaBank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Registrar tarjeta</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map((card, index) => {
            const available = card.limit - card.used;
            const usedPercentage = (card.used / card.limit) * 100;
            const brandColor = brandColors[card.brand] || "hsl(217, 91%, 60%)";
            
            return (
              <div
                key={card.id}
                className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Header with Person */}
                <div className="px-4 py-3 bg-muted/30 border-b border-border/40 flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {card.person.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">{card.person}</span>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-4">
                  {/* Card Name and Limit Used */}
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{card.name}</span>
                  </div>

                  {/* Limit Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">Límite usado</span>
                      <span className="text-sm font-medium">{formatCurrency(card.used)}</span>
                    </div>
                    <Progress 
                      value={usedPercentage} 
                      className="h-1.5 bg-muted"
                    />
                  </div>

                  {/* Three Column Limits */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Límite usado</p>
                      <p className="text-sm font-semibold text-destructive">{formatCurrency(card.used)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Límite disponible</p>
                      <p className="text-sm font-semibold text-success">{formatCurrency(available)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Límite total</p>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(card.limit)}</p>
                    </div>
                  </div>

                  {/* Dates Row */}
                  <div className="flex items-center gap-6 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Cierre</p>
                        <p className="text-xs font-medium">Día {card.closingDay}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Vencimiento</p>
                        <p className="text-xs font-medium">Día {card.dueDay}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1.5 text-muted-foreground hover:text-foreground h-8"
                    onClick={() => navigate(`/cartoes/${card.id}/fatura`)}
                  >
                    Detalles de la factura
                    <span className="text-lg leading-none">→</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openEditDialog(card)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Card Dialog */}
        {selectedCardForEdit && (
          <EditCardDialog
            card={selectedCardForEdit}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </div>
    </Layout>
  );
}

interface EditCardDialogProps {
  card: typeof cards[0];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditCardDialog({ card, open, onOpenChange }: EditCardDialogProps) {
  const [cardName, setCardName] = useState(card.name);
  const [limit, setLimit] = useState(card.limit.toString());
  const [brand, setBrand] = useState(card.brand.toLowerCase());
  const [closingDay, setClosingDay] = useState(card.closingDay.toString());
  const [dueDay, setDueDay] = useState(card.dueDay.toString());
  const [account, setAccount] = useState(card.account.toLowerCase());
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setCardName(card.name);
    setLimit(card.limit.toString());
    setBrand(card.brand.toLowerCase());
    setClosingDay(card.closingDay.toString());
    setDueDay(card.dueDay.toString());
    setAccount(card.account.toLowerCase());
  }, [card]);

  const cardColor = brandColors[card.brand] || "hsl(217, 91%, 60%)";

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
              style={{ backgroundColor: `${cardColor}20` }}
            >
              <CreditCard className="w-5 h-5" style={{ color: cardColor }} />
            </div>
            <div>
              <DialogTitle className="text-lg">Editar tarjeta</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Modifica la configuración de la tarjeta
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Card Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Descripción</Label>
            <Input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Ej: Santander Platinum"
            />
          </div>

          {/* Limit and Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Límite total</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <Input
                  type="text"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Marca</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="american express">American Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Closing and Due Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Día de cierre</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Día de vencimiento</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
              />
            </div>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cuenta asociada</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="santander">Santander</SelectItem>
                <SelectItem value="bbva">BBVA</SelectItem>
                <SelectItem value="caixabank">CaixaBank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Star className={cn(
                  "w-4 h-4",
                  isActive ? "text-success fill-success" : "text-muted-foreground"
                )} />
                <Label className="text-sm font-medium cursor-pointer">Tarjeta activa</Label>
              </div>
              <p className="text-[10px] text-muted-foreground max-w-[220px]">
                Las tarjetas inactivas no aparecen en las opciones de registro
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
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
            disabled={!cardName.trim()}
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
