// Interfaces y funciones helper (sin datos mock)

export interface Transaction {
  id: string;
  type: "ingreso" | "gasto";
  description: string;
  amount: number;
  category: string;
  categoryId?: string;
  subcategory?: string;
  account: string;
  accountId?: string;
  creditCard?: string;
  creditCardId?: string;
  responsible: string;
  dueDate: Date;
  paymentDate?: Date;
  competenceDate: Date;
  status: "pagado" | "pendiente" | "cobrado" | "por_cobrar";
  isFixed: boolean;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: "ingreso" | "gasto";
  color: string;
  icon: string;
  subcategories: string[];
  totalAmount: number;
  position?: number;
  keywords?: string[];
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  type: "corriente" | "ahorro";
  balance: number;
  color: string;
  isDefault?: boolean;
  lastUpdate?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  brand: string;
  lastDigits?: string;
  limit: number;
  used: number;
  closingDay: number;
  dueDay: number;
  color: string;
  account?: string;
  holder?: string;
}

// Funciones helper para calcular totales
export function calculateTotals(transactionList: Transaction[]) {
  const ingresos = transactionList.filter(t => t.type === "ingreso");
  const gastos = transactionList.filter(t => t.type === "gasto");

  const totalIngresos = ingresos.reduce((sum, t) => sum + t.amount, 0);
  const ingresosCobrados = ingresos.filter(t => t.status === "cobrado").reduce((sum, t) => sum + t.amount, 0);
  const ingresosPorCobrar = ingresos.filter(t => t.status === "por_cobrar").reduce((sum, t) => sum + t.amount, 0);

  const totalGastos = gastos.reduce((sum, t) => sum + t.amount, 0);
  const gastosPagados = gastos.filter(t => t.status === "pagado").reduce((sum, t) => sum + t.amount, 0);
  const gastosPendientes = gastos.filter(t => t.status === "pendiente").reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIngresos,
    ingresosCobrados,
    ingresosPorCobrar,
    totalGastos,
    gastosPagados,
    gastosPendientes,
    saldoPrevisto: totalIngresos - totalGastos,
    saldoDisponible: ingresosCobrados - gastosPagados,
  };
}

export function getExpensesByCategory(transactionList: Transaction[]) {
  const gastos = transactionList.filter(t => t.type === "gasto");
  const categoryMap = new Map<string, { name: string; value: number; color: string }>();

  gastos.forEach(t => {
    const existing = categoryMap.get(t.category);
    if (existing) {
      existing.value += t.amount;
    } else {
      categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
}

export function getIncomeByCategory(transactionList: Transaction[]) {
  const ingresos = transactionList.filter(t => t.type === "ingreso");
  const categoryMap = new Map<string, { name: string; value: number; color: string }>();

  ingresos.forEach(t => {
    const existing = categoryMap.get(t.category);
    if (existing) {
      existing.value += t.amount;
    } else {
      categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
}
