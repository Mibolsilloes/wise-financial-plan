import { 
  ChevronLeft,
  ChevronRight,
  RefreshCw, 
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { usePeriod, PeriodType } from "@/contexts/PeriodContext";
import { useState } from "react";

const periods: { id: PeriodType; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "7days", label: "7 días atrás" },
  { id: "month", label: "Este mes" },
  { id: "year", label: "Este año" },
];

export function PeriodSelector() {
  const {
    selectedPeriod,
    setSelectedPeriod,
    monthName,
    handlePrevMonth,
    handleNextMonth,
    dateRange,
    setDateRange,
    clearFilters,
    refresh,
    periodLabel,
  } = usePeriod();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePeriodClick = (periodId: PeriodType) => {
    setSelectedPeriod(periodId);
  };

  const handleDateRangeSelect = (range: typeof dateRange) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setSelectedPeriod("custom");
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`;
    }
    if (dateRange?.from) {
      return format(dateRange.from, "dd/MM/yyyy");
    }
    return periodLabel;
  };

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

        {/* Period Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => handlePeriodClick(period.id)}
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

        {/* Date Range Picker */}
        <div className="flex items-center gap-4 lg:ml-auto">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal gap-2",
                  selectedPeriod === "custom" && "border-primary"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
                locale={es}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Action Buttons */}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={clearFilters}
          >
            <Trash2 className="w-4 h-4" />
            Limpiar filtro
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={refresh}
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  );
}
