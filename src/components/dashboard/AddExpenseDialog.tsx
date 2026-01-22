import { useState } from "react";
import { TrendingDown, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { id: "alimentacion", label: "Alimentación" },
  { id: "suscripcion", label: "Suscripción" },
  { id: "hogar", label: "Hogar" },
  { id: "cuidado-personal", label: "Cuidado personal" },
  { id: "donaciones", label: "Donaciones" },
  { id: "educacion", label: "Educación" },
  { id: "impuestos", label: "Impuestos" },
  { id: "ocio", label: "Ocio y entretenimiento" },
  { id: "supermercado", label: "Supermercado" },
  { id: "otros", label: "Otros" },
  { id: "mascotas", label: "Mascotas" },
  { id: "salario", label: "Salario" },
  { id: "salud", label: "Salud" },
  { id: "transporte", label: "Transporte" },
  { id: "servicios", label: "Servicios" },
  { id: "ropa", label: "Ropa" },
  { id: "viaje", label: "Viaje" },
];

const accounts = [
  { id: "santander", label: "Cuenta Santander" },
  { id: "bbva", label: "BBVA" },
  { id: "caixabank", label: "CaixaBank" },
];

const cards = [
  { id: "visa", label: "Visa Santander" },
  { id: "mastercard", label: "Mastercard BBVA" },
];

const responsibles = [
  { id: "juan", label: "Juan García" },
  { id: "maria", label: "María López" },
];

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [foiPaga, setFoiPaga] = useState(true);
  const [dataPagamento, setDataPagamento] = useState<Date>(new Date());
  const [dataVencimento, setDataVencimento] = useState<Date>(new Date());
  const [conta, setConta] = useState("");
  const [cartao, setCartao] = useState("");
  const [despesaFixa, setDespesaFixa] = useState(false);
  const [repetirTransacao, setRepetirTransacao] = useState(false);
  const [responsavel, setResponsavel] = useState("");
  const [dataCompetencia, setDataCompetencia] = useState<Date>(new Date());

  const handleSave = () => {
    // TODO: Implement save logic
    console.log({
      valor,
      descricao,
      categoria,
      subcategoria,
      foiPaga,
      dataPagamento,
      dataVencimento,
      conta,
      cartao,
      despesaFixa,
      repetirTransacao,
      responsavel,
      dataCompetencia,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Añadir gasto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Información básica</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Importe</Label>
              <Input
                id="valor"
                placeholder="Introduce el importe"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descripción</Label>
              <Input
                id="descricao"
                placeholder="Ej: Compra en el supermercado"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subcategoría</Label>
              <Select value={subcategoria} onValueChange={setSubcategoria} disabled={!categoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría primero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sub1">Subcategoría 1</SelectItem>
                  <SelectItem value="sub2">Subcategoría 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuración de transacción */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Configuración de transacción</span>
            </div>

            {/* Estado de pago */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    foiPaga ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {foiPaga ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      foiPaga ? "text-success" : "text-destructive"
                    )}>
                      {foiPaga ? "Pagado" : "No pagado"}
                    </p>
                    <p className="text-xs text-muted-foreground">Estado del pago</p>
                  </div>
                </div>
                <Switch checked={foiPaga} onCheckedChange={setFoiPaga} />
              </div>

              {foiPaga && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs">Fecha de pago</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataPagamento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataPagamento ? format(dataPagamento, "dd/MM/yyyy") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataPagamento}
                        onSelect={(date) => date && setDataPagamento(date)}
                        locale={es}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Fecha de vencimiento */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-sm">Fecha de vencimiento</p>
                  <p className="text-xs text-muted-foreground">Cuándo debe pagarse la transacción</p>
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataVencimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataVencimento ? format(dataVencimento, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataVencimento}
                    onSelect={(date) => date && setDataVencimento(date)}
                    locale={es}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Cuenta */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cuenta</p>
                  <p className="text-xs text-muted-foreground">Elige la cuenta para esta transacción</p>
                </div>
              </div>
              <Select value={conta} onValueChange={setConta}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tarjeta de crédito */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <div className="w-4 h-3 rounded bg-violet-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Tarjeta de crédito</p>
                  <p className="text-xs text-muted-foreground">Vincular a una tarjeta (opcional)</p>
                </div>
              </div>
              <Select value={cartao} onValueChange={setCartao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gasto fijo */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Gasto fijo</p>
                    <p className="text-xs text-muted-foreground">Clasificar como gasto fijo</p>
                  </div>
                </div>
                <Switch checked={despesaFixa} onCheckedChange={setDespesaFixa} />
              </div>
            </div>

            {/* Repetir transacción */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Repetir transacción</p>
                    <p className="text-xs text-muted-foreground">Crear múltiples transacciones automáticamente</p>
                  </div>
                </div>
                <Switch checked={repetirTransacao} onCheckedChange={setRepetirTransacao} />
              </div>
            </div>

            {/* Persona responsable */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-cyan-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Persona responsable</p>
                  <p className="text-xs text-muted-foreground">Identifica a alguien</p>
                </div>
              </div>
              <Select value={responsavel} onValueChange={setResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {responsibles.map((resp) => (
                    <SelectItem key={resp.id} value={resp.id}>
                      {resp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha de competencia */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Fecha de competencia</p>
                  <p className="text-xs text-muted-foreground">Fecha de adquisición o emisión del producto o servicio</p>
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataCompetencia && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataCompetencia ? format(dataCompetencia, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataCompetencia}
                    onSelect={(date) => date && setDataCompetencia(date)}
                    locale={es}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <Button
          onClick={handleSave}
          className="w-full bg-destructive hover:bg-destructive/90 text-white"
        >
          <TrendingDown className="mr-2 h-4 w-4" />
          Guardar gasto
        </Button>
      </DialogContent>
    </Dialog>
  );
}