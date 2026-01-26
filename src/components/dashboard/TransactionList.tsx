import { useState, useMemo } from "react";
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  ArrowUpDown,
  Filter,
  Check,
  Clock,
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
import { transactions } from "@/data/mockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const tableColumns = [
  "Responsable",
  "Descripción",
  "Importe",
  "Categoría",
  "Cuenta",
  "Vencimiento",
  "Estado",
  "Tipo",
];

export function TransactionList() {
  const [filter, setFilter] = useState<"all" | "ingresos" | "gastos">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("30");
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { monthName, handlePrevMonth, handleNextMonth } = usePeriod();

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by type
    if (filter === "ingresos") {
      result = result.filter(t => t.type === "ingreso");
    } else if (filter === "gastos") {
      result = result.filter(t => t.type === "gasto");
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.responsible.toLowerCase().includes(query)
      );
    }

    // Sort by due date
    result.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return result;
  }, [filter, searchQuery]);

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / parseInt(itemsPerPage));
  const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + parseInt(itemsPerPage));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const getStatusBadge = (status: string, type: string) => {
    const isPaid = status === "pagado" || status === "cobrado";
    return (
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        isPaid 
          ? "bg-success/10 text-success" 
          : "bg-warning/10 text-warning"
      )}>
        {isPaid ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {type === "ingreso" 
          ? (isPaid ? "Cobrado" : "Por cobrar")
          : (isPaid ? "Pagado" : "Pendiente")
        }
      </div>
    );
  };

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
            {paginatedTransactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="text-sm">{transaction.responsible}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: transaction.color }}
                    />
                    <span className="text-sm font-medium">{transaction.description}</span>
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-sm font-semibold",
                  transaction.type === "ingreso" ? "text-success" : "text-destructive"
                )}>
                  {transaction.type === "ingreso" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: `${transaction.color}20`,
                      color: transaction.color
                    }}
                  >
                    {transaction.category}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {transaction.account}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(transaction.dueDate, "dd/MM/yyyy", { locale: es })}
                </TableCell>
                <TableCell>
                  {getStatusBadge(transaction.status, transaction.type)}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    transaction.isFixed 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {transaction.isFixed ? "Fijo" : "Variable"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
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

        <span className="text-sm text-muted-foreground">Total: {totalItems}</span>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages || 1}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
