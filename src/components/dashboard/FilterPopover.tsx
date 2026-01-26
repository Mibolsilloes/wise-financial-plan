import { useState } from "react";
import { 
  Building2, 
  Tag, 
  Layers, 
  CheckCircle2, 
  Users, 
  Repeat, 
  CreditCard, 
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFilters } from "@/contexts/FilterContext";
import { categories, bankAccounts, creditCards } from "@/data/mockData";

interface FilterPopoverContentProps {
  onApply: () => void;
  onClear: () => void;
}

function FilterPopoverContent({ onApply, onClear }: FilterPopoverContentProps) {
  const { filters, updateFilter, clearFilters } = useFilters();

  const handleClear = () => {
    clearFilters();
    onClear();
  };

  const handleApply = () => {
    onApply();
  };

  // Get unique responsibles from transactions
  const responsibles = ["Juan García", "María López"];

  return (
    <div className="flex flex-col gap-4 p-4 w-[300px]">
      {/* Cuenta Bancaria */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Cuenta Bancaria</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por una cuenta específica</p>
        <Select value={filters.account} onValueChange={(v) => updateFilter("account", v)}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Todas las cuentas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las cuentas</SelectItem>
            {bankAccounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.name}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categoría Principal */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-500">Categoría Principal</span>
        </div>
        <p className="text-xs text-muted-foreground">Elija una categoría para filtrar</p>
        <Select value={filters.category} onValueChange={(v) => updateFilter("category", v)}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategorías */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">Subcategorías</span>
        </div>
        <p className="text-xs text-muted-foreground">Seleccione múltiples subcategorías</p>
        <Input
          placeholder="Elegir subcategorías..."
          value={filters.subcategory}
          onChange={(e) => updateFilter("subcategory", e.target.value)}
          className="h-9 bg-background"
        />
      </div>

      {/* Estado del Pago */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-success">Estado del Pago</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por estado de pago</p>
        <div className="flex gap-2">
          {(["todos", "pago", "pendiente"] as const).map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => updateFilter("paymentStatus", status)}
              className={cn(
                "flex-1 h-9 gap-1.5",
                filters.paymentStatus === status 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {status === "todos" ? "Todos" : status === "pago" ? "Pagado" : "Pendiente"}
            </Button>
          ))}
        </div>
      </div>

      {/* Responsable */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-500">Responsable</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por persona responsable</p>
        <Select value={filters.responsible || "todos"} onValueChange={(v) => updateFilter("responsible", v === "todos" ? "" : v)}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Todos los responsables" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los responsables</SelectItem>
            {responsibles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Transacción */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Tipo de Transacción</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por tipo fijo o variable</p>
        <div className="flex gap-2">
          {([
            { value: "todos", label: "Todos" },
            { value: "fijas", label: "Fijas" },
            { value: "variables", label: "Variables" },
          ] as const).map((item) => (
            <Button
              key={item.value}
              variant="outline"
              size="sm"
              onClick={() => updateFilter("transactionType", item.value)}
              className={cn(
                "flex-1 h-9 gap-1.5",
                filters.transactionType === item.value 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background"
              )}
            >
              <Repeat className="w-3.5 h-3.5" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tarjetas de Crédito */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Tarjetas de Crédito</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por tarjeta específica</p>
        <Select value={filters.creditCard || "todas"} onValueChange={(v) => updateFilter("creditCard", v === "todas" ? "" : v)}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Todas las tarjetas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las tarjetas</SelectItem>
            {creditCards.map((card) => (
              <SelectItem key={card.id} value={card.name}>
                {card.name} - {card.bank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Fecha */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">Tipo de Fecha</span>
        </div>
        <p className="text-xs text-muted-foreground">Elija qué fecha usar para filtrar</p>
        <div className="flex gap-2">
          {([
            { value: "vencimiento", label: "Venc." },
            { value: "pago", label: "Pago" },
            { value: "competencia", label: "Comp." },
          ] as const).map((item) => (
            <Button
              key={item.value}
              variant="outline"
              size="sm"
              onClick={() => updateFilter("dateType", item.value)}
              className={cn(
                "flex-1 h-9 gap-1.5",
                filters.dateType === item.value 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <Button 
          className="w-full gap-2" 
          onClick={handleApply}
        >
          <Filter className="w-4 h-4" />
          Aplicar Filtros
        </Button>
        <Button 
          variant="ghost" 
          className="w-full gap-2 text-muted-foreground" 
          onClick={handleClear}
        >
          <Filter className="w-4 h-4" />
          Limpiar Todo
        </Button>
      </div>
    </div>
  );
}

interface FilterPopoverProps {
  children: React.ReactNode;
}

export function FilterPopover({ children }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const { hasActiveFilters } = useFilters();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          {children}
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 max-h-[80vh] overflow-y-auto" 
        align="end"
        sideOffset={8}
      >
        <FilterPopoverContent 
          onApply={() => setOpen(false)} 
          onClear={() => setOpen(false)} 
        />
      </PopoverContent>
    </Popover>
  );
}
