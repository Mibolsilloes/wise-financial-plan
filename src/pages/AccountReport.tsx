import { useState, useMemo } from "react";
import { isWithinInterval, parseISO, startOfDay, endOfDay, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { 
  ArrowLeft, 
  X, 
  ChevronDown, 
  ChevronUp,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Wallet,
  Settings,
  Search,
  ArrowUpDown,
  Filter,
  FileText,
  LayoutGrid,
  TableIcon,
  Check,
  Building2,
  Landmark,
  CreditCard as CreditCardIcon,
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import { EditTransactionDialog } from "@/components/dashboard/EditTransactionDialog";
import { DeleteTransactionDialog } from "@/components/dashboard/DeleteTransactionDialog";
import { Transaction } from "@/data/mockData";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterPopover } from "@/components/dashboard/FilterPopover";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { usePeriod } from "@/contexts/PeriodContext";
import { useFilters } from "@/contexts/FilterContext";
import { cn } from "@/lib/utils";

type GroupingOption = "none" | "categoria" | "vencimiento" | "creacion" | "responsable";

const groupingLabels: Record<GroupingOption, string> = {
  none: "Sin agrupación",
  categoria: "Categoría",
  vencimiento: "Fecha de vencimiento",
  creacion: "Fecha de creación",
  responsable: "Responsable",
};

type SortOption = "creacion" | "vencimiento" | "pago" | "competencia" | "valor";

const sortLabels: Record<SortOption, string> = {
  creacion: "Fecha de creación",
  vencimiento: "Fecha de vencimiento",
  pago: "Fecha de pago",
  competencia: "Fecha de competencia",
  valor: "Importe",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

// Mock account data - would come from context/API
const accountsData: Record<string, { name: string; color: string; balance: number; icon: string }> = {
  "1": { name: "Santander", color: "hsl(0, 84%, 50%)", balance: 5420.50, icon: "landmark" },
  "2": { name: "BBVA", color: "hsl(210, 100%, 40%)", balance: 12350.00, icon: "landmark" },
  "3": { name: "CaixaBank", color: "hsl(200, 70%, 45%)", balance: 890.25, icon: "building" },
  "4": { name: "Efectivo", color: "hsl(160, 84%, 39%)", balance: 150.00, icon: "wallet" },
};

const getAccountIcon = (iconType: string) => {
  switch (iconType) {
    case "credit-card":
      return CreditCardIcon;
    case "landmark":
      return Landmark;
    case "building":
      return Building2;
    case "wallet":
      return Wallet;
    default:
      return Building2;
  }
};

interface FinancialCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
  expandable?: boolean;
  details?: { label: string; value: number; color: string }[];
  showEye?: boolean;
}

const FinancialCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor,
  expandable = false,
  details,
  showEye = false
}: FinancialCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="glass rounded-xl p-4 border border-border/50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs", iconColor)}>{icon}</span>
          <span className="text-xs text-muted-foreground font-medium">{title}</span>
        </div>
        {showEye && (
          <button className="text-muted-foreground hover:text-foreground">
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className={cn(
        "text-xl font-bold flex items-center gap-1",
        value < 0 ? "text-destructive" : value > 0 ? "text-success" : "text-foreground"
      )}>
        {value < 0 ? <TrendingDown className="w-4 h-4" /> : value > 0 ? <TrendingUp className="w-4 h-4" /> : null}
        {formatCurrency(Math.abs(value))}
      </div>
      
      {subtitle && (
        <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
      )}
      
      {expandable && (
        <>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
          >
            {isExpanded ? "Ocultar detalles" : "Ver detalles"}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {isExpanded && details && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {details.map((detail, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "rounded-lg px-3 py-2 text-center",
                    detail.color === "success" ? "bg-success/10 border border-success/20" :
                    detail.color === "destructive" ? "bg-destructive/10 border border-destructive/20" :
                    "bg-muted/50 border border-border"
                  )}
                >
                  <p className={cn(
                    "text-[10px] font-medium mb-0.5",
                    detail.color === "success" ? "text-success" :
                    detail.color === "destructive" ? "text-destructive" :
                    "text-muted-foreground"
                  )}>
                    {detail.label}
                  </p>
                  <p className={cn(
                    "text-sm font-bold",
                    detail.color === "success" ? "text-success" :
                    detail.color === "destructive" ? "text-destructive" :
                    "text-foreground"
                  )}>
                    {formatCurrency(detail.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function AccountReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMonth, currentYear, effectiveDateRange } = usePeriod();
  const { filters } = useFilters();
  const [activeTab, setActiveTab] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [grouping, setGrouping] = useState<GroupingOption>("none");
  const [sortBy, setSortBy] = useState<SortOption>("valor");
  const [itemsPerPage, setItemsPerPage] = useState<30 | 50 | 100>(30);
  
  // Column visibility settings
  const [visibleColumns, setVisibleColumns] = useState({
    descricao: true,
    responsavel: true,
    valor: true,
    categoria: true,
    tipo: true,
    status: true,
    conta: true,
    cartao: true,
    dataVencimiento: true,
    dataCompetencia: false,
    dataPagamento: false,
    fixoVariavel: true,
  });
  
  // Action dialogs state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };
  
  // Get real transactions from context
  const { transactions: contextTransactions, getTransactionsByAccount } = useTransactions();
  
  const account = id ? accountsData[id] : null;
  const accountName = account?.name || "";
  
  // Get transactions for this account from the real context
  const accountTransactions = useMemo(() => {
    return getTransactionsByAccount(accountName);
  }, [getTransactionsByAccount, accountName]);

  // Transform transactions to display format
  const allTransactions = useMemo(() => {
    return accountTransactions.map(t => ({
      id: t.id,
      descripcion: t.description,
      responsable: t.responsible,
      valor: t.type === "gasto" ? -t.amount : t.amount,
      tipo: t.type,
      status: t.status,
      cuenta: t.account,
      tarjeta: t.creditCard || "",
      categoria: t.category,
      fechaVencimiento: format(t.dueDate, "yyyy-MM-dd"),
      fechaCompetencia: format(t.competenceDate, "yyyy-MM-dd"),
      fechaPago: t.paymentDate ? format(t.paymentDate, "yyyy-MM-dd") : "",
      fijoVariable: t.isFixed ? "Fijo" : "Variable",
      originalTransaction: t, // Keep reference to original for edit/delete
    }));
  }, [accountTransactions]);

  // Handler for edit - use original Transaction directly
  const handleEditClick = (t: typeof allTransactions[0]) => {
    setSelectedTransaction(t.originalTransaction);
    setEditDialogOpen(true);
  };

  // Handler for delete - use original Transaction directly
  const handleDeleteClick = (t: typeof allTransactions[0]) => {
    setSelectedTransaction(t.originalTransaction);
    setDeleteDialogOpen(true);
  };

  // Filter transactions based on effectiveDateRange, filters, tab, and search
  const filteredTransactions = useMemo(() => {
    let result = allTransactions.filter(transaction => {
      // Filter by date range
      let dateToCheck: string;
      switch (filters.dateType) {
        case "pago":
          dateToCheck = transaction.fechaPago || transaction.fechaVencimiento;
          break;
        case "competencia":
          dateToCheck = transaction.fechaCompetencia;
          break;
        default:
          dateToCheck = transaction.fechaVencimiento;
      }
      const transactionDate = parseISO(dateToCheck);
      return isWithinInterval(transactionDate, {
        start: startOfDay(effectiveDateRange.from),
        end: endOfDay(effectiveDateRange.to),
      });
    });

    // Filter by tab
    if (activeTab === "despesas") {
      result = result.filter(t => t.tipo === "gasto");
    } else if (activeTab === "receitas") {
      result = result.filter(t => t.tipo === "ingreso");
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.descripcion.toLowerCase().includes(query) ||
        t.categoria.toLowerCase().includes(query) ||
        t.responsable.toLowerCase().includes(query)
      );
    }

    // Filter by category from FilterContext
    if (filters.category !== "todas") {
      result = result.filter(t => t.categoria === filters.category);
    }

    // Filter by payment status from FilterContext
    if (filters.paymentStatus !== "todos") {
      if (filters.paymentStatus === "pago") {
        result = result.filter(t => t.status === "pagado" || t.status === "cobrado");
      } else {
        result = result.filter(t => t.status === "pendiente");
      }
    }

    // Filter by responsible from FilterContext
    if (filters.responsible) {
      result = result.filter(t => t.responsable === filters.responsible);
    }

    // Filter by transaction type (fixed/variable) from FilterContext
    if (filters.transactionType !== "todos") {
      if (filters.transactionType === "fijas") {
        result = result.filter(t => t.fijoVariable === "Fijo");
      } else {
        result = result.filter(t => t.fijoVariable === "Variable");
      }
    }

    // Sort transactions
    result.sort((a, b) => {
      switch (sortBy) {
        case "valor":
          return b.valor - a.valor;
        case "vencimiento":
          return parseISO(b.fechaVencimiento).getTime() - parseISO(a.fechaVencimiento).getTime();
        case "pago":
          return (parseISO(b.fechaPago || b.fechaVencimiento).getTime()) - (parseISO(a.fechaPago || a.fechaVencimiento).getTime());
        case "competencia":
          return parseISO(b.fechaCompetencia).getTime() - parseISO(a.fechaCompetencia).getTime();
        default:
          return parseISO(b.fechaVencimiento).getTime() - parseISO(a.fechaVencimiento).getTime();
      }
    });

    return result;
  }, [allTransactions, effectiveDateRange, activeTab, searchQuery, filters, sortBy]);

  // Calculate financial data based on all transactions in period (not filtered by tab/search)
  const financialData = useMemo(() => {
    // Use allTransactions filtered only by date for financial summary
    const periodTransactions = allTransactions.filter(transaction => {
      const transactionDate = parseISO(transaction.fechaVencimiento);
      return isWithinInterval(transactionDate, {
        start: startOfDay(effectiveDateRange.from),
        end: endOfDay(effectiveDateRange.to),
      });
    });

    const accountBalance = account?.balance || 0;

    const income = periodTransactions
      .filter(t => t.tipo === "ingreso")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const expenses = periodTransactions
      .filter(t => t.tipo === "gasto")
      .reduce((sum, t) => sum + Math.abs(t.valor), 0);
    
    const incomeReceived = periodTransactions
      .filter(t => t.tipo === "ingreso" && t.status === "cobrado")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const incomeToReceive = periodTransactions
      .filter(t => t.tipo === "ingreso" && t.status === "pendiente")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const expensesPaid = periodTransactions
      .filter(t => t.tipo === "gasto" && t.status === "pagado")
      .reduce((sum, t) => sum + Math.abs(t.valor), 0);
    
    const expensesToPay = periodTransactions
      .filter(t => t.tipo === "gasto" && t.status === "pendiente")
      .reduce((sum, t) => sum + Math.abs(t.valor), 0);

    return {
      previousBalance: accountBalance,
      income: income,
      expenses: -expenses,
      availableBalance: accountBalance + income - expenses,
      expectedBalance: accountBalance + income - expenses,
      incomeDetails: { received: incomeReceived, toReceive: incomeToReceive },
      expenseDetails: { paid: expensesPaid, toPay: expensesToPay },
    };
  }, [allTransactions, effectiveDateRange, account?.balance]);
  
  if (!account) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <p>Cuenta no encontrada</p>
        </div>
      </Layout>
    );
  }

  const AccountIcon = getAccountIcon(account.icon);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <PeriodSelector />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/cuentas")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        
        {/* Account Badge */}
        <div>
          <Badge
            className="px-3 py-1.5 text-sm font-medium gap-2 rounded-full"
            style={{ 
              backgroundColor: account.color, 
              color: "white",
              borderColor: account.color 
            }}
          >
            <AccountIcon className="w-4 h-4" />
            {account.name}
            <button 
              onClick={() => navigate("/cuentas")}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
        
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialCard
            title="Saldo Anterior"
            value={financialData.previousBalance}
            subtitle={`Hasta ${format(subDays(effectiveDateRange.from, 1), "d 'de' MMMM", { locale: es })}`}
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            iconColor="text-primary"
            expandable
            details={[
              { label: "Pendientes", value: 0, color: "destructive" },
              { label: "Disponible", value: financialData.previousBalance, color: "success" },
            ]}
          />
          
          <FinancialCard
            title="Ingresos"
            value={financialData.income}
            subtitle={`${format(effectiveDateRange.from, "d 'de' MMMM", { locale: es })} - ${format(effectiveDateRange.to, "d 'de' MMMM", { locale: es })}`}
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            iconColor="text-success"
            showEye
            expandable
            details={[
              { label: "Cobrado", value: financialData.incomeDetails.received, color: "success" },
              { label: "Por cobrar", value: financialData.incomeDetails.toReceive, color: "default" },
            ]}
          />
          
          <FinancialCard
            title="Gastos"
            value={financialData.expenses}
            subtitle={`${format(effectiveDateRange.from, "d 'de' MMMM", { locale: es })} - ${format(effectiveDateRange.to, "d 'de' MMMM", { locale: es })}`}
            icon={<TrendingDown className="w-3.5 h-3.5" />}
            iconColor="text-destructive"
            expandable
            details={[
              { label: "Pagado", value: financialData.expenseDetails.paid, color: "success" },
              { label: "Por pagar", value: financialData.expenseDetails.toPay, color: "destructive" },
            ]}
          />
          
          <FinancialCard
            title="Saldo Disponible"
            value={financialData.availableBalance}
            subtitle={`Hasta ${format(effectiveDateRange.to, "d 'de' MMMM", { locale: es })}`}
            icon={<Wallet className="w-3.5 h-3.5" />}
            iconColor="text-primary"
          />
        </div>
        
        {/* Expected Balance Card */}
        <div className="glass rounded-xl p-4 border border-border/50 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Saldo Previsto</span>
          </div>
          <div className="text-xl font-bold flex items-center gap-1">
            <Wallet className="w-4 h-4" />
            {formatCurrency(financialData.expectedBalance)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Hasta {format(effectiveDateRange.to, "d 'de' MMMM", { locale: es })} (Ingresos - Gastos + Saldo Anterior)
          </p>
        </div>
        
        {/* Transactions Section */}
        <div className="space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="todas" className="text-xs">Todas</TabsTrigger>
              <TabsTrigger value="despesas" className="text-xs">Gastos</TabsTrigger>
              <TabsTrigger value="receitas" className="text-xs">Ingresos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-xs"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  {groupingLabels[grouping]}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50">
                {(Object.keys(groupingLabels) as GroupingOption[]).map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setGrouping(option)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      grouping === option && "font-medium"
                    )}
                  >
                    {option === "none" && <FileText className="w-4 h-4" />}
                    {option === "categoria" && <LayoutGrid className="w-4 h-4" />}
                    {option === "vencimiento" && <FileText className="w-4 h-4" />}
                    {option === "creacion" && <FileText className="w-4 h-4" />}
                    {option === "responsable" && <FileText className="w-4 h-4" />}
                    {groupingLabels[option]}
                    {grouping === option && <Check className="w-4 h-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Settings Dialog */}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Personaliza tu visualización</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configura cómo quieres ver tus transacciones de forma más clara y organizada
                </p>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* View Mode Selection */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">¿Cómo quieres ver tus transacciones?</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setViewMode("cards")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                        viewMode === "cards" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Tarjetas</p>
                        <p className="text-[10px] text-muted-foreground">Visual y organizado</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                        viewMode === "table" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <TableIcon className="w-5 h-5 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Tabla</p>
                        <p className="text-[10px] text-muted-foreground">Compacto y detallado</p>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Column Visibility */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">¿Qué información mostrar?</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      { key: "descricao", label: "Descripción" },
                      { key: "responsavel", label: "Responsable" },
                      { key: "valor", label: "Importe" },
                      { key: "categoria", label: "Categoría" },
                      { key: "tipo", label: "Tipo" },
                      { key: "status", label: "Estado" },
                      { key: "conta", label: "Cuenta" },
                      { key: "cartao", label: "Tarjeta" },
                      { key: "dataVencimiento", label: "Fecha de Vencimiento" },
                      { key: "dataCompetencia", label: "Fecha de Competencia" },
                      { key: "dataPagamento", label: "Fecha de Pago" },
                      { key: "fixoVariavel", label: "Fijo/Variable" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => toggleColumn(key as keyof typeof visibleColumns)}
                        className="flex items-center gap-2 py-1.5 text-sm hover:text-foreground transition-colors group"
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          visibleColumns[key as keyof typeof visibleColumns]
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40 group-hover:border-primary/60"
                        )}>
                          {visibleColumns[key as keyof typeof visibleColumns] && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className={cn(
                          visibleColumns[key as keyof typeof visibleColumns]
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="text-amber-500">⚡</span>
                  Elige solo lo que más usas
                </p>
              </div>
              
              <DialogFooter className="flex gap-3 sm:gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1"
                >
                  Guardar Preferencias
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transacciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    {sortLabels[sortBy]}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                  <p className="px-2 py-1.5 text-xs text-primary font-medium">Ordenar por</p>
                  {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        sortBy === option && "font-medium"
                      )}
                    >
                      {sortLabels[option]}
                      {sortBy === option && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </Button>
              <FilterPopover>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs relative">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">
                    1
                  </span>
                </Button>
              </FilterPopover>
            </div>
          </div>
          
          {/* Transactions Table */}
          <div className="glass rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  {visibleColumns.responsavel && <TableHead className="text-xs font-medium">Responsable</TableHead>}
                  {visibleColumns.descricao && <TableHead className="text-xs font-medium">Descripción</TableHead>}
                  {visibleColumns.valor && <TableHead className="text-xs font-medium">Importe</TableHead>}
                  {visibleColumns.categoria && <TableHead className="text-xs font-medium">Categoría</TableHead>}
                  {visibleColumns.tipo && <TableHead className="text-xs font-medium">Tipo</TableHead>}
                  {visibleColumns.status && <TableHead className="text-xs font-medium">Estado</TableHead>}
                  {visibleColumns.conta && <TableHead className="text-xs font-medium">Cuenta</TableHead>}
                  {visibleColumns.cartao && <TableHead className="text-xs font-medium">Tarjeta</TableHead>}
                  {visibleColumns.dataVencimiento && <TableHead className="text-xs font-medium">Vencimiento</TableHead>}
                  {visibleColumns.dataCompetencia && <TableHead className="text-xs font-medium">Competencia</TableHead>}
                  {visibleColumns.dataPagamento && <TableHead className="text-xs font-medium">Pago</TableHead>}
                  {visibleColumns.fixoVariavel && <TableHead className="text-xs font-medium">Fijo/Variable</TableHead>}
                  <TableHead className="text-xs font-medium">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-40">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm">No se encontraron transacciones</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          No hay transacciones para mostrar en el período seleccionado.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-border/50">
                      {visibleColumns.responsavel && <TableCell className="text-xs">{transaction.responsable}</TableCell>}
                      {visibleColumns.descricao && <TableCell className="text-xs font-medium">{transaction.descripcion}</TableCell>}
                      {visibleColumns.valor && (
                        <TableCell className={cn("text-xs font-medium", transaction.valor < 0 ? "text-destructive" : "text-success")}>
                          {formatCurrency(transaction.valor)}
                        </TableCell>
                      )}
                      {visibleColumns.categoria && <TableCell className="text-xs">{transaction.categoria}</TableCell>}
                      {visibleColumns.tipo && (
                        <TableCell>
                          <Badge variant={transaction.tipo === "ingreso" ? "default" : "secondary"} className="text-[10px]">
                            {transaction.tipo === "ingreso" ? "Ingreso" : "Gasto"}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.status && (
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px]",
                              transaction.status === "pagado" || transaction.status === "cobrado"
                                ? "border-success/30 bg-success/10 text-success" 
                                : "border-warning/30 bg-warning/10 text-warning"
                            )}
                          >
                            {transaction.status === "pagado" ? "Pagado" : 
                             transaction.status === "cobrado" ? "Cobrado" : 
                             transaction.tipo === "ingreso" ? "Por cobrar" : "Pendiente"}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.conta && <TableCell className="text-xs">{transaction.cuenta}</TableCell>}
                      {visibleColumns.cartao && <TableCell className="text-xs">{transaction.tarjeta || "-"}</TableCell>}
                      {visibleColumns.dataVencimiento && (
                        <TableCell className="text-xs">
                          {format(parseISO(transaction.fechaVencimiento), "dd/MM/yyyy")}
                        </TableCell>
                      )}
                      {visibleColumns.dataCompetencia && (
                        <TableCell className="text-xs">
                          {format(parseISO(transaction.fechaCompetencia), "dd/MM/yyyy")}
                        </TableCell>
                      )}
                      {visibleColumns.dataPagamento && (
                        <TableCell className="text-xs">
                          {transaction.fechaPago ? format(parseISO(transaction.fechaPago), "dd/MM/yyyy") : "-"}
                        </TableCell>
                      )}
                      {visibleColumns.fixoVariavel && (
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {transaction.fijoVariable}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50 min-w-[140px]">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(transaction)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(transaction)}
                              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:text-foreground transition-colors flex items-center gap-1">
                    Mostrar {itemsPerPage}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50 min-w-[120px]">
                  {([30, 50, 100] as const).map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => setItemsPerPage(option)}
                      className={cn(
                        "flex items-center justify-between cursor-pointer",
                        itemsPerPage === option && "font-medium"
                      )}
                    >
                      Mostrar {option}
                      {itemsPerPage === option && <Check className="w-4 h-4 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span>|</span>
              <span>Total: {filteredTransactions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        transaction={selectedTransaction}
      />

      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        transaction={selectedTransaction}
      />
    </Layout>
  );
}
