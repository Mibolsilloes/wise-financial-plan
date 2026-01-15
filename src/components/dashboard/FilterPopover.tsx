import { useState } from "react";
import { 
  Building2, 
  Tag, 
  Layers, 
  CheckCircle2, 
  Users, 
  Repeat, 
  CreditCard, 
  Calendar 
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

const categories = [
  "Alimentação",
  "Assinatura", 
  "Casa",
  "Cuidados pessoais",
  "Doações",
  "Educação",
  "Impostos",
  "Lazer",
  "Mercado",
  "Pets",
  "Saúde",
  "Transporte",
  "Salário",
  "Utilidades",
  "Vestuário",
  "Viagem",
  "Outros",
];

interface FilterPopoverContentProps {
  onApply: () => void;
  onClear: () => void;
}

export function FilterPopoverContent({ onApply, onClear }: FilterPopoverContentProps) {
  const [contaBancaria, setContaBancaria] = useState("todas");
  const [categoriaPrincipal, setCategoriaPrincipal] = useState("todas");
  const [subcategorias, setSubcategorias] = useState("");
  const [statusPagamento, setStatusPagamento] = useState<"todos" | "pago" | "pendente">("todos");
  const [pessoa, setPessoa] = useState("");
  const [tipoTransacao, setTipoTransacao] = useState<"todos" | "fixas" | "variaveis">("todos");
  const [cartaoCredito, setCartaoCredito] = useState("");
  const [tipoData, setTipoData] = useState<"venc" | "pago" | "comp">("venc");

  return (
    <div className="flex flex-col gap-4 p-4 w-[300px]">
      {/* Conta Bancária */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Conta Bancária</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por uma conta específica</p>
        <Select value={contaBancaria} onValueChange={setContaBancaria}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Todas as contas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as contas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categoria Principal */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-500">Categoria Principal</span>
        </div>
        <p className="text-xs text-muted-foreground">Escolha uma categoria para filtrar</p>
        <Select value={categoriaPrincipal} onValueChange={setCategoriaPrincipal}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategorias */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">Subcategorias</span>
        </div>
        <p className="text-xs text-muted-foreground">Selecione múltiplas subcategorias</p>
        <Input
          placeholder="Escolher subcategorias..."
          value={subcategorias}
          onChange={(e) => setSubcategorias(e.target.value)}
          className="h-9 bg-background"
        />
      </div>

      {/* Status do Pagamento */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-success">Status do Pagamento</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por status de pagamento</p>
        <div className="flex gap-2">
          {(["todos", "pago", "pendente"] as const).map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => setStatusPagamento(status)}
              className={cn(
                "flex-1 h-9 gap-1.5",
                statusPagamento === status 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Pessoas */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-500">Pessoas</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por pessoa responsável</p>
        <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            R
          </div>
          <span className="text-sm">Renan Gomes Jardon</span>
        </div>
      </div>

      {/* Tipo de Transação */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Tipo de Transação</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por tipo fixo ou variável</p>
        <div className="flex gap-2">
          {([
            { value: "todos", icon: Repeat, label: "Todos" },
            { value: "fixas", icon: Repeat, label: "Fixas" },
            { value: "variaveis", icon: Repeat, label: "Variáveis" },
          ] as const).map((item) => (
            <Button
              key={item.value}
              variant="outline"
              size="sm"
              onClick={() => setTipoTransacao(item.value)}
              className={cn(
                "flex-1 h-9 gap-1.5",
                tipoTransacao === item.value 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background"
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cartões de Crédito */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Cartões de Crédito</span>
        </div>
        <p className="text-xs text-muted-foreground">Filtre por cartão específico</p>
        <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            R
          </div>
          <span className="text-sm">Itau</span>
        </div>
      </div>

      {/* Tipo de Data */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">Tipo de Data</span>
        </div>
        <p className="text-xs text-muted-foreground">Escolha qual data usar para filtrar</p>
        <div className="flex gap-2">
          {([
            { value: "venc", label: "Venc." },
            { value: "pago", label: "Pago" },
            { value: "comp", label: "Comp." },
          ] as const).map((item) => (
            <Button
              key={item.value}
              variant="outline"
              size="sm"
              onClick={() => setTipoData(item.value)}
              className={cn(
                "flex-1 h-9 gap-1.5",
                tipoData === item.value 
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
          onClick={onApply}
        >
          <Filter className="w-4 h-4" />
          Aplicar Filtros
        </Button>
        <Button 
          variant="ghost" 
          className="w-full gap-2 text-muted-foreground" 
          onClick={onClear}
        >
          <Filter className="w-4 h-4" />
          Limpar Tudo
        </Button>
      </div>
    </div>
  );
}

import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterPopoverProps {
  children: React.ReactNode;
}

export function FilterPopover({ children }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
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
