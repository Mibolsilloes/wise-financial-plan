import { useState } from "react";
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
  FileText
} from "lucide-react";
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
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { usePeriod } from "@/contexts/PeriodContext";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Mock category data - would come from context/API
const categoryData: Record<string, { name: string; color: string; type: string }> = {
  "1": { name: "Alimentação", color: "hsl(25, 95%, 53%)", type: "despesa" },
  "2": { name: "Transporte", color: "hsl(217, 91%, 60%)", type: "despesa" },
  "3": { name: "Casa", color: "hsl(340, 82%, 52%)", type: "despesa" },
  "4": { name: "Mercado", color: "hsl(45, 93%, 47%)", type: "despesa" },
  "5": { name: "Salário", color: "hsl(160, 84%, 39%)", type: "receita" },
  "6": { name: "Saúde", color: "hsl(280, 65%, 60%)", type: "despesa" },
  "7": { name: "Lazer", color: "hsl(199, 89%, 48%)", type: "despesa" },
  "8": { name: "Educação", color: "hsl(142, 76%, 36%)", type: "despesa" },
  "9": { name: "Vestuário", color: "hsl(330, 81%, 60%)", type: "despesa" },
  "10": { name: "Viagem", color: "hsl(199, 89%, 48%)", type: "despesa" },
  "11": { name: "Pets", color: "hsl(35, 91%, 58%)", type: "despesa" },
  "12": { name: "Doações", color: "hsl(172, 66%, 50%)", type: "despesa" },
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
            {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
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

export default function CategoryReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMonth, currentYear } = usePeriod();
  const [activeTab, setActiveTab] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  
  const category = id ? categoryData[id] : null;
  
  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <p>Categoria não encontrada</p>
        </div>
      </Layout>
    );
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Mock financial data for this category
  const financialData = {
    previousBalance: -50.00,
    income: 0.00,
    expenses: 0.00,
    availableBalance: -50.00,
    expectedBalance: -50.00,
    incomeDetails: { received: 0, toReceive: 0 },
    expenseDetails: { paid: 0, toPay: 0 },
  };

  // Mock transactions - empty for demo
  const transactions: any[] = [];
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <PeriodSelector />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/categorias")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        
        {/* Category Badge */}
        <div>
          <Badge
            className="px-3 py-1.5 text-sm font-medium gap-2 rounded-full"
            style={{ 
              backgroundColor: category.color, 
              color: "white",
              borderColor: category.color 
            }}
          >
            {category.name}
            <button 
              onClick={() => navigate("/categorias")}
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
            subtitle={`Até ${new Date(currentYear, currentMonth - 1, 0).getDate()} de ${monthNames[currentMonth - 1]} (Receita - Despesa + Saldo Bancário)`}
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            iconColor="text-primary"
            expandable
            details={[
              { label: "Pendências", value: financialData.previousBalance, color: "destructive" },
              { label: "Disponível", value: financialData.previousBalance, color: "success" },
            ]}
          />
          
          <FinancialCard
            title="Receitas"
            value={financialData.income}
            subtitle={`1 de ${monthNames[currentMonth]} - ${new Date(currentYear, currentMonth + 1, 0).getDate()} de ${monthNames[currentMonth]}`}
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            iconColor="text-success"
            showEye
            expandable
            details={[
              { label: "Recebido", value: financialData.incomeDetails.received, color: "success" },
              { label: "A receber", value: financialData.incomeDetails.toReceive, color: "default" },
            ]}
          />
          
          <FinancialCard
            title="Despesas"
            value={financialData.expenses}
            subtitle={`1 de ${monthNames[currentMonth]} - ${new Date(currentYear, currentMonth + 1, 0).getDate()} de ${monthNames[currentMonth]}`}
            icon={<TrendingDown className="w-3.5 h-3.5" />}
            iconColor="text-destructive"
            expandable
            details={[
              { label: "Pago", value: financialData.expenseDetails.paid, color: "success" },
              { label: "A pagar", value: financialData.expenseDetails.toPay, color: "destructive" },
            ]}
          />
          
          <FinancialCard
            title="Saldo Disponível"
            value={financialData.availableBalance}
            subtitle={`Até ${new Date(currentYear, currentMonth + 1, 0).getDate()} de ${monthNames[currentMonth]} (Receita - Despesa + Saldo Bancário)`}
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
            Até {new Date(currentYear, currentMonth + 1, 0).getDate()} de {monthNames[currentMonth]} (Receita - Despesa + Saldo Bancário)
          </p>
        </div>
        
        {/* Transactions Section */}
        <div className="space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="todas" className="text-xs">Todas</TabsTrigger>
              <TabsTrigger value="despesas" className="text-xs">Despesas</TabsTrigger>
              <TabsTrigger value="receitas" className="text-xs">Receitas</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Sem agrupamento
            </Button>
          </div>
          
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar transações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                Valor
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs relative">
                <Filter className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">
                  1
                </span>
              </Button>
            </div>
          </div>
          
          {/* Transactions Table */}
          <div className="glass rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-medium">Responsável</TableHead>
                  <TableHead className="text-xs font-medium">Descrição</TableHead>
                  <TableHead className="text-xs font-medium">Valor</TableHead>
                  <TableHead className="text-xs font-medium">Categoria</TableHead>
                  <TableHead className="text-xs font-medium">Tipo</TableHead>
                  <TableHead className="text-xs font-medium">Status</TableHead>
                  <TableHead className="text-xs font-medium">Conta</TableHead>
                  <TableHead className="text-xs font-medium">Cartão</TableHead>
                  <TableHead className="text-xs font-medium">Vencimento</TableHead>
                  <TableHead className="text-xs font-medium">Fixo/Variável</TableHead>
                  <TableHead className="text-xs font-medium">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-40">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm">Nenhuma transação encontrada</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Não há transações para exibir no período selecionado.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Mostrar 30</span>
              <span>|</span>
              <span>Total: 0</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                Voltar
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                Próximo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}