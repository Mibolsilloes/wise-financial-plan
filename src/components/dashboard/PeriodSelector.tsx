import { useState } from "react";
import { 
  ChevronLeft,
  ChevronRight,
  RefreshCw, 
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const periods = [
  { id: "today", label: "Hoje" },
  { id: "7days", label: "7 dias atrás" },
  { id: "month", label: "Esse mês" },
  { id: "year", label: "Esse ano" },
];

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function PeriodSelector() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [currentMonth, setCurrentMonth] = useState(0); // Janeiro
  const [currentYear, setCurrentYear] = useState(2026);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calculate date range based on current month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const startDate = `01/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;
  const endDate = `${getDaysInMonth(currentMonth, currentYear)}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;

  return (
    <div className="glass rounded-xl p-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
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
            {months[currentMonth]}
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

        {/* Period Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                selectedPeriod === period.id
                  ? "bg-primary text-primary-foreground border-primary shadow-glow-primary"
                  : "bg-card text-foreground border-border hover:bg-muted"
              )}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Date Range Display */}
        <div className="flex items-center gap-4 lg:ml-auto">
          <div className="px-4 py-2 rounded-lg bg-muted border border-border text-sm">
            {startDate} - {endDate}
          </div>

          {/* Action Buttons */}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar filtro
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
