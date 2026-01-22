import { useState } from "react";
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  ArrowUpDown,
  Filter,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AddRevenueDialog } from "./AddRevenueDialog";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { FilterPopover } from "./FilterPopover";
import { usePeriod } from "@/contexts/PeriodContext";

const tableColumns = [
  "Responsable",
  "Descripción",
  "Importe",
  "Categoría",
  "Tipo",
  "Cuenta",
  "Tarjeta",
  "Vencimiento",
  "Competencia",
  "Pago",
  "Fijo/Variable",
  "Acción",
];

export function TransactionList() {
  const [filter, setFilter] = useState<"all" | "ingresos" | "gastos">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("30");
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const { monthName, handlePrevMonth, handleNextMonth } = usePeriod();

  return (
    <div className="glass rounded-xl p-5 animate-slide-up">
      {/* Header with Month Navigation and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[100px] text-center">
            {monthName}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => setIsRevenueDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Ingreso
          </Button>
          <Button 
            className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={() => setIsExpenseDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Gasto
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddRevenueDialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen} />
      <AddExpenseDialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {(["all", "ingresos", "gastos"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-[1px]",
              filter === f
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "Todas" : f === "ingresos" ? "Ingresos" : "Gastos"}
          </button>
        ))}
      </div>

      {/* Controls Row */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="w-4 h-4" />
          </Button>
          
          <Select defaultValue="none">
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Sin agrupación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin agrupación</SelectItem>
              <SelectItem value="category">Categoría</SelectItem>
              <SelectItem value="date">Fecha de vencimiento</SelectItem>
              <SelectItem value="responsible">Responsable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transacciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <Select defaultValue="competencia">
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Fecha de competencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="competencia">Fecha de competencia</SelectItem>
              <SelectItem value="vencimiento">Fecha de vencimiento</SelectItem>
              <SelectItem value="pago">Fecha de pago</SelectItem>
              <SelectItem value="creacion">Fecha de creación</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <ArrowUpDown className="w-4 h-4" />
          </Button>

          <FilterPopover>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="w-4 h-4" />
            </Button>
          </FilterPopover>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {tableColumns.map((column) => (
                <TableHead key={column} className="text-xs font-medium whitespace-nowrap">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Empty State */}
            <TableRow>
              <TableCell colSpan={tableColumns.length} className="h-[300px]">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    No se encontraron transacciones
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Añade un ingreso o gasto para empezar
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mostrar</span>
          <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground">Total: 0</span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}