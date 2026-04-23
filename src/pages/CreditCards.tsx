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
  Star,
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
import { useCreditCards } from "@/contexts/CreditCardsContext";
import { useAccounts } from "@/contexts/AccountsContext";
import { toast } from "sonner";

const brandColors: Record<string, string> = {
  "Visa":             "hsl(217, 91%, 60%)",
  "Mastercard":       "hsl(25, 95%, 53%)",
  "Elo":              "hsl(45, 93%, 47%)",
  "American Express": "hsl(199, 89%, 48%)",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);

// ─── tipos locais ────────────────────────────────────────────
interface CardForEdit {
  id: string;
  name: string;
  brand: string;
  lastDigits: string;
  limit: number;
  used: number;
  closingDay: number;
  dueDay: number;
  account: string;
  person: string;
}

const BRANDS = ["Visa", "Mastercard", "American Express", "Elo"];

// ─── componente principal ─────────────────────────────────────
export default function CreditCards() {
  const navigate                            = useNavigate();
  const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard } = useCreditCards();
  const { accounts }                        = useAccounts();

  const [isDialogOpen,   setIsDialogOpen]   = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<CardForEdit | null>(null);
  const [savingNew, setSavingNew] = useState(false);

  // ── estado do formulário "Nova tarjeta" ──
  const [newName,       setNewName]       = useState("");
  const [newLimit,      setNewLimit]      = useState("");
  const [newBrand,      setNewBrand]      = useState("Visa");
  const [newLastDigits, setNewLastDigits] = useState("");
  const [newClosingDay, setNewClosingDay] = useState("15");
  const [newDueDay,     setNewDueDay]     = useState("22");
  const [newAccountId,  setNewAccountId]  = useState("none");

  const resetNewForm = () => {
    setNewName("");
    setNewLimit("");
    setNewBrand("Visa");
    setNewLastDigits("");
    setNewClosingDay("15");
    setNewDueDay("22");
    setNewAccountId("none");
  };

  const handleCreateCard = async () => {
    if (!newName.trim()) {
      toast.error("La descripción de la tarjeta es obligatoria");
      return;
    }
    const limit = parseFloat(newLimit.replace(",", "."));
    if (isNaN(limit) || limit <= 0) {
      toast.error("Introduce un límite válido");
      return;
    }
    const cleanedDigits = newLastDigits.replace(/\D/g, "");
    if (cleanedDigits.length !== 4) {
      toast.error("Introduce los últimos 4 dígitos de la tarjeta");
      return;
    }
    const closing = parseInt(newClosingDay);
    const due = parseInt(newDueDay);
    if (isNaN(closing) || closing < 1 || closing > 31) {
      toast.error("El día de cierre debe estar entre 1 y 31");
      return;
    }
    if (isNaN(due) || due < 1 || due > 31) {
      toast.error("El día de vencimiento debe estar entre 1 y 31");
      return;
    }

    setSavingNew(true);
    const { error } = await addCreditCard({
      name:       newName.trim(),
      bank:       newBrand,
      brand:      newBrand,
      lastDigits: cleanedDigits,
      limit,
      used:       0,
      closingDay: closing,
      dueDay:     due,
      color:      brandColors[newBrand] || "hsl(217, 91%, 60%)",
    });
    setSavingNew(false);

    if (error) {
      toast.error("No se pudo registrar la tarjeta", { description: error.message });
      return;
    }
    toast.success("Tarjeta registrada correctamente");
    resetNewForm();
    setIsDialogOpen(false);
  };

  // ── mapear cards para exibição ──
  const cards: CardForEdit[] = creditCards.map((card) => ({
    id:         card.id,
    name:       card.name,
    brand:      card.brand || card.bank,
    lastDigits: card.lastDigits || "",
    limit:      card.limit,
    used:       card.used,
    closingDay: card.closingDay,
    dueDay:     card.dueDay,
    account:    card.account || "Sin cuenta",
    person:     card.holder  || "Usuario",
  }));

  const openEditDialog = (card: CardForEdit) => {
    setSelectedCardForEdit(card);
    setEditDialogOpen(true);
  };

  const handleSaveCard = async (id: string, updates: Partial<CardForEdit>) => {
    const { error } = await updateCreditCard(id, {
      name:       updates.name,
      brand:      updates.brand,
      lastDigits: updates.lastDigits,
      limit:      updates.limit,
      closingDay: updates.closingDay,
      dueDay:     updates.dueDay,
    });
    if (error) {
      toast.error("No se pudo actualizar la tarjeta", { description: error.message });
      return;
    }
    toast.success("Tarjeta actualizada correctamente");
  };

  const handleDeleteCard = async (id: string) => {
    const { error } = await deleteCreditCard(id);
    if (error) {
      toast.error("No se pudo eliminar la tarjeta", { description: error.message });
      return;
    }
    toast.success("Tarjeta eliminada");
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

          <Dialog open={isDialogOpen} onOpenChange={(o) => { if (!o) resetNewForm(); setIsDialogOpen(o); }}>
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
                {/* Nombre */}
                <div>
                  <Label htmlFor="card-name">Descripción</Label>
                  <Input
                    id="card-name"
                    placeholder="Ej: Santander Platinum"
                    className="mt-1.5"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                {/* Límite + Marca */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-limit">Límite total (€)</Label>
                    <Input
                      id="card-limit"
                      type="number"
                      placeholder="0,00"
                      className="mt-1.5"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Marca</Label>
                    <Select value={newBrand} onValueChange={setNewBrand}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANDS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Días cierre / vencimiento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-closing">Día de cierre</Label>
                    <Input
                      id="card-closing"
                      type="number"
                      min="1" max="31"
                      placeholder="15"
                      className="mt-1.5"
                      value={newClosingDay}
                      onChange={(e) => setNewClosingDay(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-due">Día de vencimiento</Label>
                    <Input
                      id="card-due"
                      type="number"
                      min="1" max="31"
                      placeholder="22"
                      className="mt-1.5"
                      value={newDueDay}
                      onChange={(e) => setNewDueDay(e.target.value)}
                    />
                  </div>
                </div>

                {/* Cuenta asociada */}
                <div>
                  <Label>Cuenta asociada (opcional)</Label>
                  <Select value={newAccountId} onValueChange={setNewAccountId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Seleccionar cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin cuenta</SelectItem>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} — {acc.bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateCard}
                  disabled={!newName.trim() || !newLimit}
                >
                  Registrar tarjeta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tienes tarjetas registradas</p>
              <p className="text-sm mt-1">Haz clic en "Nueva tarjeta" para añadir una</p>
            </div>
          )}
          {cards.map((card, index) => {
            const available      = card.limit - card.used;
            const usedPercentage = card.limit > 0 ? (card.used / card.limit) * 100 : 0;
            const brandColor     = brandColors[card.brand] || "hsl(217, 91%, 60%)";

            return (
              <div
                key={card.id}
                className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Header */}
                <div className="px-4 py-3 bg-muted/30 border-b border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {card.brand.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{card.brand}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEditDialog(card)}>
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => navigate(`/cartoes/${card.id}/fatura`)}
                      >
                        <FileText className="w-4 h-4" />
                        Ver factura
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => { deleteCreditCard(card.id); toast.success("Tarjeta eliminada"); }}
                      >
                        <Archive className="w-4 h-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{card.name}</span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">Límite usado</span>
                      <span className="text-sm font-medium">{formatCurrency(card.used)}</span>
                    </div>
                    <Progress value={usedPercentage} className="h-1.5 bg-muted" />
                  </div>

                  {/* Limits grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Usado</p>
                      <p className="text-sm font-semibold text-destructive">{formatCurrency(card.used)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Disponible</p>
                      <p className="text-sm font-semibold text-success">{formatCurrency(available)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Límite total</p>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(card.limit)}</p>
                    </div>
                  </div>

                  {/* Dates */}
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

                {/* Footer */}
                <div className="px-4 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1.5 text-muted-foreground hover:text-foreground h-8"
                    onClick={() => navigate(`/cartoes/${card.id}/fatura`)}
                  >
                    Detalles de la factura →
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(card)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
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
            onSave={handleSaveCard}
          />
        )}
      </div>
    </Layout>
  );
}

// ─── Edit Dialog ─────────────────────────────────────────────
interface EditCardDialogProps {
  card: CardForEdit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<CardForEdit>) => void;
}

function EditCardDialog({ card, open, onOpenChange, onSave }: EditCardDialogProps) {
  const [cardName,   setCardName]   = useState(card.name);
  const [limit,      setLimit]      = useState(card.limit.toString());
  const [brand,      setBrand]      = useState(card.brand);
  const [closingDay, setClosingDay] = useState(card.closingDay.toString());
  const [dueDay,     setDueDay]     = useState(card.dueDay.toString());

  useEffect(() => {
    setCardName(card.name);
    setLimit(card.limit.toString());
    setBrand(card.brand);
    setClosingDay(card.closingDay.toString());
    setDueDay(card.dueDay.toString());
  }, [card]);

  const cardColor = brandColors[card.brand] || "hsl(217, 91%, 60%)";

  const handleSave = () => {
    onSave(card.id, {
      name:       cardName,
      brand,
      limit:      parseFloat(limit)      || card.limit,
      closingDay: parseInt(closingDay)   || card.closingDay,
      dueDay:     parseInt(dueDay)       || card.dueDay,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${cardColor}20` }}>
              <CreditCard className="w-5 h-5" style={{ color: cardColor }} />
            </div>
            <div>
              <DialogTitle className="text-lg">Editar tarjeta</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Modifica la configuración de la tarjeta</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Descripción</Label>
            <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Ej: Santander Platinum" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Límite total (€)</Label>
              <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Marca</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Día de cierre</Label>
              <Input type="number" min="1" max="31" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Día de vencimiento</Label>
              <Input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} disabled={!cardName.trim()} className="flex-1 gap-2">
            <Edit2 className="w-4 h-4" />
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
