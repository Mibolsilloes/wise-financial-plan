import { useState } from "react";
import { 
  Calendar, 
  RefreshCw, 
  X, 
  ChevronDown,
  Filter,
  Clock,
  CalendarCheck,
  CalendarClock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const periods = [
  { id: "today", label: "Hoje" },
  { id: "7days", label: "Últimos 7 dias" },
  { id: "month", label: "Este mês" },
  { id: "year", label: "Este ano" },
  { id: "custom", label: "Personalizado" },
];

const dateViews = [
  { id: "vencimento", label: "Data de vencimento", icon: CalendarCheck, description: "Recomendado para planejamento financeiro" },
  { id: "pagamento", label: "Data de pagamento", icon: Clock, description: "Recomendado para fluxo de caixa real" },
  { id: "competencia", label: "Data de competência", icon: CalendarClock, description: "Recomendado para relatórios contábeis" },
];

export function PeriodSelector() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [dateView, setDateView] = useState("vencimento");
  const [activeFilters, setActiveFilters] = useState(0);

  return (
    <div className="glass rounded-xl p-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Period Selection */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">Período:</span>
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                selectedPeriod === period.id
                  ? "bg-primary text-primary-foreground shadow-glow-primary"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Date View Selection */}
        <div className="flex items-center gap-2 lg:ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {dateViews.find(d => d.id === dateView)?.icon && (
                  <span className="w-4 h-4">
                    {(() => {
                      const Icon = dateViews.find(d => d.id === dateView)?.icon;
                      return Icon ? <Icon className="w-4 h-4" /> : null;
                    })()}
                  </span>
                )}
                {dateViews.find(d => d.id === dateView)?.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-popover border-border">
              <DropdownMenuLabel>Visualização de data</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {dateViews.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  onClick={() => setDateView(view.id)}
                  className={cn(
                    "flex flex-col items-start gap-1 cursor-pointer py-3",
                    dateView === view.id && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <view.icon className="w-4 h-4 text-primary" />
                    <span className="font-medium">{view.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground pl-6">
                    {view.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {activeFilters > 0 && (
                <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-popover border-border">
            <DropdownMenuLabel>Filtros avançados</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <div className="p-2 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Conta bancária</label>
                <Select>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    <SelectItem value="nubank">Nubank</SelectItem>
                    <SelectItem value="itau">Itaú</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                <Select>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="alimentacao">Alimentação</SelectItem>
                    <SelectItem value="transporte">Transporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <Select>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setActiveFilters(0)}
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
}
