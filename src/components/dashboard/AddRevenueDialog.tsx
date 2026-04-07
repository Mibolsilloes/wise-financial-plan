import { useState } from "react";
import { TrendingUp, TrendingDown, Calendar as CalendarIcon } from "lucide-react";
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
import { useTransactions } from "@/contexts/TransactionsContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useAccounts } from "@/contexts/AccountsContext";
import { useToast } from "@/hooks/use-toast";

interface AddRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const responsibles = [
  { id: "juan", label: "Juan García" },
  { id: "maria", label: "María López" },
];

export function AddRevenueDialog({ open, onOpenChange }: AddRevenueDialogProps) {
  const { addTransaction } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { toast } = useToast();

  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [foiRecebida, setFoiRecebida] = useState(true);
  const [dataRecebimento, setDataRecebimento] = useState<Date>(new Date());
  const [dataVencimento, setDataVencimento] = useState<Date>(new Date());
  const [conta, setConta] = useState("");
  const [receitaFixa, setReceitaFixa] = useState(false);
  const [repetirTransacao, setRepetirTransacao] = useState(false);
  const [responsavel, setResponsavel] = useState("");
  const [dataCompetencia, setDataCompetencia] = useState<Date>(new Date());

  const incomeCategories = categories.filter((c) => c.type === "ingreso");
  const selectedCategory = categories.find((c) => c.name === categoria);

  const resetForm = () => {
    setValor("");
    setDescricao("");
    setCategoria("");
    setSubcategoria("");
    setFoiRecebida(true);
    setDataRecebimento(new Date());
    setDataVencimento(new Date());
    setConta("");
    setReceitaFixa(false);
    setRepetirTransacao(false);
    setResponsavel("");
    setDataCompetencia(new Date());
  };

  const handleSave = async () => {
    // Validation
    const amount = parseFloat(valor);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Por favor, introduce un importe válido",
        variant: "destructive",
      });
      return;
    }

    if (!descricao.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce una descripción",
        variant: "destructive",
      });
      return;
    }

    if (!categoria) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una categoría",
        variant: "destructive",
      });
      return;
    }

    const selectedAcc = accounts.find((a) => a.id === conta);
    const responsibleName = responsibles.find((r) => r.id === responsavel)?.label || "Juan García";

    const { error } = await addTransaction({
      type: "ingreso",
      description:   descricao.trim(),
      amount,
      category:      categoria,
      categoryId:    selectedCategory?.id,
      subcategory:   subcategoria || undefined,
      account:       selectedAcc?.name || "",
      accountId:     conta || undefined,
      responsible:   responsibleName,
      dueDate:       dataVencimento,
      paymentDate:   foiRecebida ? dataRecebimento : undefined,
      competenceDate: dataCompetencia,
      status:        foiRecebida ? "cobrado" : "por_cobrar",
      isFixed:       receitaFixa,
      color:         selectedCategory?.color || "hsl(142, 76%, 36%)",
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el ingreso: ${error.message}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ingreso añadido",
      description: `Se ha registrado "${descricao}" por ${amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}`,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-success" />
            Añadir ingreso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
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
                placeholder="Ej: Nómina mensual"
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
                  {incomeCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {incomeCategories.length === 0 && (
                <p className="text-sm text-warning mt-2">
                  No hay categorías de ingreso. Crea una categoría en la página de Categorías primero.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Subcategoría</Label>
              <Select value={subcategoria} onValueChange={setSubcategoria} disabled={!selectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedCategory ? "Selecciona una subcategoría" : "Selecciona una categoría primero"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuración de transacción */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm font-medium text-muted-foreground">Configuración de transacción</span>
            </div>

            {/* Estado de cobro */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    foiRecebida ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {foiRecebida ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      foiRecebida ? "text-success" : "text-destructive"
                    )}>
                      {foiRecebida ? "Cobrado" : "No cobrado"}
                    </p>
                    <p className="text-xs text-muted-foreground">Estado del pago/cobro</p>
                  </div>
                </div>
                <Switch checked={foiRecebida} onCheckedChange={setFoiRecebida} />
              </div>

              {foiRecebida && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs">Fecha del cobro</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataRecebimento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataRecebimento ? format(dataRecebimento, "dd/MM/yyyy") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataRecebimento}
                        onSelect={(date) => date && setDataRecebimento(date)}
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
                  <p className="text-xs text-muted-foreground">Cuándo debe pagarse/cobrarse la transacción</p>
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
                      {acc.name} - {acc.bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ingreso fijo */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Ingreso fijo</p>
                    <p className="text-xs text-muted-foreground">Clasificar como ingreso fijo</p>
                  </div>
                </div>
                <Switch checked={receitaFixa} onCheckedChange={setReceitaFixa} />
              </div>
            </div>

            {/* Repetir transacción */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
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
          disabled={incomeCategories.length === 0}
          className="w-full bg-success hover:bg-success/90 text-white"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Guardar ingreso
        </Button>
      </DialogContent>
    </Dialog>
  );
}