import { createContext, useContext, useState, ReactNode } from "react";

export interface TransactionFilters {
  account: string;
  category: string;
  subcategory: string;
  paymentStatus: "todos" | "pago" | "pendiente";
  responsible: string;
  transactionType: "todos" | "fijas" | "variables";
  creditCard: string;
  dateType: "vencimiento" | "pago" | "competencia";
}

const defaultFilters: TransactionFilters = {
  account: "todas",
  category: "todas",
  subcategory: "",
  paymentStatus: "todos",
  responsible: "",
  transactionType: "todos",
  creditCard: "",
  dateType: "vencimiento",
};

interface FilterContextType {
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  updateFilter: <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);

  const updateFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = 
    filters.account !== "todas" ||
    filters.category !== "todas" ||
    filters.subcategory !== "" ||
    filters.paymentStatus !== "todos" ||
    filters.responsible !== "" ||
    filters.transactionType !== "todos" ||
    filters.creditCard !== "";

  const value: FilterContextType = {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
