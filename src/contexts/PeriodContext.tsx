import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  format 
} from "date-fns";
import { ptBR } from "date-fns/locale";

export type PeriodType = "today" | "7days" | "month" | "year" | "custom";

interface PeriodContextType {
  // Current period selection
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
  
  // Month/Year navigation
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  
  // Custom date range
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  
  // Computed values
  effectiveDateRange: { from: Date; to: Date };
  periodLabel: string;
  monthName: string;
  
  // Actions
  clearFilters: () => void;
  refresh: () => void;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const now = new Date();
  
  // State
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("month");
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    // When navigating months, switch to month period
    setSelectedPeriod("month");
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    // When navigating months, switch to month period
    setSelectedPeriod("month");
  };

  // Compute effective date range based on selected period
  const effectiveDateRange = useMemo(() => {
    const today = new Date();
    
    switch (selectedPeriod) {
      case "today":
        return {
          from: startOfDay(today),
          to: endOfDay(today),
        };
      case "7days":
        return {
          from: startOfDay(subDays(today, 7)),
          to: endOfDay(today),
        };
      case "month":
        const monthDate = new Date(currentYear, currentMonth, 1);
        return {
          from: startOfMonth(monthDate),
          to: endOfMonth(monthDate),
        };
      case "year":
        const yearDate = new Date(currentYear, 0, 1);
        return {
          from: startOfYear(yearDate),
          to: endOfYear(yearDate),
        };
      case "custom":
        if (dateRange?.from && dateRange?.to) {
          return {
            from: startOfDay(dateRange.from),
            to: endOfDay(dateRange.to),
          };
        }
        // Fallback to current month if custom range is incomplete
        const fallbackDate = new Date(currentYear, currentMonth, 1);
        return {
          from: startOfMonth(fallbackDate),
          to: endOfMonth(fallbackDate),
        };
      default:
        const defaultDate = new Date(currentYear, currentMonth, 1);
        return {
          from: startOfMonth(defaultDate),
          to: endOfMonth(defaultDate),
        };
    }
  }, [selectedPeriod, currentMonth, currentYear, dateRange, refreshTrigger]);

  // Format period label for display
  const periodLabel = useMemo(() => {
    const { from, to } = effectiveDateRange;
    return `${format(from, "dd/MM/yyyy")} - ${format(to, "dd/MM/yyyy")}`;
  }, [effectiveDateRange]);

  const monthName = months[currentMonth];

  // Actions
  const clearFilters = () => {
    const today = new Date();
    setSelectedPeriod("month");
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setDateRange(undefined);
  };

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const value: PeriodContextType = {
    selectedPeriod,
    setSelectedPeriod,
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    handlePrevMonth,
    handleNextMonth,
    dateRange,
    setDateRange,
    effectiveDateRange,
    periodLabel,
    monthName,
    clearFilters,
    refresh,
  };

  return (
    <PeriodContext.Provider value={value}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error("usePeriod must be used within a PeriodProvider");
  }
  return context;
}
