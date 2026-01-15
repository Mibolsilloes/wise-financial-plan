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
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { id: "alimentacao", label: "Alimentação" },
  { id: "assinatura", label: "Assinatura" },
  { id: "casa", label: "Casa" },
  { id: "cuidados-pessoais", label: "Cuidados pessoais" },
  { id: "doacoes", label: "Doações" },
  { id: "educacao", label: "Educação" },
  { id: "impostos", label: "Impostos" },
  { id: "lazer", label: "Lazer e Entretenimento" },
  { id: "mercado", label: "Mercado" },
  { id: "outros", label: "Outros" },
  { id: "pets", label: "Pets" },
  { id: "salario", label: "Salário" },
  { id: "saude", label: "Saúde" },
  { id: "transporte", label: "Transporte" },
  { id: "utilidades", label: "Utilidades" },
  { id: "vestuario", label: "Vestuário" },
  { id: "viagem", label: "Viagem" },
];

const accounts = [
  { id: "itau", label: "Conta Itaú" },
  { id: "nubank", label: "Nubank" },
  { id: "bradesco", label: "Bradesco" },
];

const cards = [
  { id: "nubank", label: "Nubank Crédito" },
  { id: "itau", label: "Itaú Platinum" },
];

const responsibles = [
  { id: "renan", label: "Renan Gomes Jardon" },
  { id: "maria", label: "Maria Silva" },
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
            Adicionar Despesa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Informações Básicas</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                placeholder="Digite o valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                placeholder="Ex: Compra no supermercado"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma categoria" />
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
              <Label>Subcategoria</Label>
              <Select value={subcategoria} onValueChange={setSubcategoria} disabled={!categoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria primeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sub1">Subcategoria 1</SelectItem>
                  <SelectItem value="sub2">Subcategoria 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configurações de Transação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Configurações de Transação</span>
            </div>

            {/* Foi Paga */}
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
                      {foiPaga ? "Foi Paga" : "Não Foi Paga"}
                    </p>
                    <p className="text-xs text-muted-foreground">Status do pagamento</p>
                  </div>
                </div>
                <Switch checked={foiPaga} onCheckedChange={setFoiPaga} />
              </div>

              {foiPaga && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs">Data do Pagamento</Label>
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
                        {dataPagamento ? format(dataPagamento, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataPagamento}
                        onSelect={(date) => date && setDataPagamento(date)}
                        locale={ptBR}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Data de Vencimento */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-sm">Data de Vencimento</p>
                  <p className="text-xs text-muted-foreground">Quando a transação deve ser paga</p>
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
                    {dataVencimento ? format(dataVencimento, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataVencimento}
                    onSelect={(date) => date && setDataVencimento(date)}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Conta */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Conta</p>
                  <p className="text-xs text-muted-foreground">Escolha a conta para esta transação</p>
                </div>
              </div>
              <Select value={conta} onValueChange={setConta}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
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

            {/* Cartão de Crédito */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <div className="w-4 h-3 rounded bg-violet-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cartão de Crédito</p>
                  <p className="text-xs text-muted-foreground">Vincular a um cartão (opcional)</p>
                </div>
              </div>
              <Select value={cartao} onValueChange={setCartao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cartão" />
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

            {/* Despesa Fixa */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Despesa Fixa</p>
                    <p className="text-xs text-muted-foreground">Classifica como uma despesa fixa</p>
                  </div>
                </div>
                <Switch checked={despesaFixa} onCheckedChange={setDespesaFixa} />
              </div>
            </div>

            {/* Repetir Transação */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Repetir Transação</p>
                    <p className="text-xs text-muted-foreground">Criar múltiplas transações automaticamente</p>
                  </div>
                </div>
                <Switch checked={repetirTransacao} onCheckedChange={setRepetirTransacao} />
              </div>
            </div>

            {/* Pessoa Responsável */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-cyan-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pessoa Responsável</p>
                  <p className="text-xs text-muted-foreground">Identifique alguém</p>
                </div>
              </div>
              <Select value={responsavel} onValueChange={setResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
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

            {/* Data de Competência */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Data de Competência</p>
                  <p className="text-xs text-muted-foreground">Data de aquisição ou emissão do produto ou serviço</p>
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
                    {dataCompetencia ? format(dataCompetencia, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataCompetencia}
                    onSelect={(date) => date && setDataCompetencia(date)}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-destructive hover:bg-destructive/90 text-white"
        >
          <TrendingDown className="mr-2 h-4 w-4" />
          Salvar Despesa
        </Button>
      </DialogContent>
    </Dialog>
  );
}
