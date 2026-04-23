import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useAccounts } from "@/contexts/AccountsContext";
import { useCreditCards } from "@/contexts/CreditCardsContext";

export const PLAN_LIMITS = {
  free: {
    transactionsPerMonth: 50,
    bankAccounts: 2,
    creditCards: 1,
  },
  premium: {
    transactionsPerMonth: Infinity,
    bankAccounts: Infinity,
    creditCards: Infinity,
  },
} as const;

export type PlanType = "free" | "premium";

/**
 * Maps a Postgres trigger error message to a user-friendly Spanish toast.
 * Returns null if the error is not a plan-limit error.
 */
export function parsePlanLimitError(error: unknown): string | null {
  const msg = (error as { message?: string })?.message || "";
  if (msg.includes("PLAN_LIMIT_BANK_ACCOUNTS"))
    return "Has alcanzado el límite de 2 cuentas del plan Gratuito. Mejora a Premium para crear cuentas ilimitadas.";
  if (msg.includes("PLAN_LIMIT_CREDIT_CARDS"))
    return "Has alcanzado el límite de 1 tarjeta del plan Gratuito. Mejora a Premium para tarjetas ilimitadas.";
  if (msg.includes("PLAN_LIMIT_TRANSACTIONS"))
    return "Has alcanzado el límite de 50 transacciones/mes del plan Gratuito. Mejora a Premium para transacciones ilimitadas.";
  return null;
}

export function usePlan() {
  const { profile } = useAuth();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();

  const plan: PlanType = ((profile as { plan?: string } | null)?.plan === "premium"
    ? "premium"
    : "free");

  const limits = PLAN_LIMITS[plan];
  const isPremium = plan === "premium";

  const usage = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const txThisMonth = transactions.filter((t) => {
      const created = (t as { createdAt?: Date }).createdAt ?? t.dueDate;
      const d = created instanceof Date ? created : new Date(created);
      return d >= monthStart && d < monthEnd;
    }).length;

    return {
      transactionsThisMonth: txThisMonth,
      bankAccounts: accounts.length,
      creditCards: creditCards.length,
    };
  }, [transactions, accounts, creditCards]);

  return {
    plan,
    isPremium,
    limits,
    usage,
    canAddBankAccount: isPremium || usage.bankAccounts < limits.bankAccounts,
    canAddCreditCard: isPremium || usage.creditCards < limits.creditCards,
    canAddTransaction:
      isPremium || usage.transactionsThisMonth < limits.transactionsPerMonth,
  };
}
