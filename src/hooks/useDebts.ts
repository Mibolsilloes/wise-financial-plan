import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addMonths, frenchInstallment } from "@/lib/debts";

export interface DebtPayment {
  id: string;
  debtId: string;
  date: string;
  amount: number;
  principalPart: number;
  interestPart: number;
  installmentNumber: number | null;
  note?: string | null;
}

export interface Debt {
  id: string;
  name: string;
  debtType: string;
  principal: number;
  annualRate: number;
  installments: number;
  installmentAmount: number;
  startDate: string;
  endDate: string | null;
  initialPaid: number;
  color: string;
  icon: string;
  note: string | null;
  createdAt: string;
  payments: DebtPayment[];
}

export interface DebtInput {
  name: string;
  debtType: string;
  principal: number;
  annualRate: number;
  installments: number;
  installmentAmount: number;
  startDate: string;
  endDate: string | null;
  initialPaid: number;
  color: string;
  icon: string;
  note?: string | null;
}

export interface DebtStats {
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  remaining: number;
  progress: number;
  monthlyPayment: number;
  paymentsMade: number;
  remainingInstallments: number;
  estimatedEnd: string | null;
  totalInterestEstimated: number;
  remainingInterest: number;
  totalCost: number;
  isPaid: boolean;
  nextPaymentDate: string | null;
  upcomingPayments: { date: string; amount: number; number: number }[];
  hasRateData: boolean;
}

export function debtStats(debt: Debt): DebtStats {
  const paymentsPrincipal = debt.payments.reduce((s, p) => s + p.principalPart, 0);
  const paymentsInterest = debt.payments.reduce((s, p) => s + p.interestPart, 0);
  const paymentsTotal = debt.payments.reduce((s, p) => s + p.amount, 0);

  const principalPaid = Math.min(debt.principal, debt.initialPaid + paymentsPrincipal);
  const totalPaid = debt.initialPaid + paymentsTotal;
  const remaining = Math.max(0, debt.principal - principalPaid);
  const progress = debt.principal > 0 ? Math.min(100, (principalPaid / debt.principal) * 100) : 0;

  const monthlyPayment =
    debt.installmentAmount > 0
      ? debt.installmentAmount
      : frenchInstallment(debt.principal, debt.annualRate, debt.installments);

  const paymentsMade = debt.payments.length;
  let remainingInstallments = 0;
  if (monthlyPayment > 0) {
    remainingInstallments =
      debt.installments > 0
        ? Math.max(0, debt.installments - paymentsMade)
        : Math.ceil(remaining / monthlyPayment);
    if (remaining <= 0) remainingInstallments = 0;
    else remainingInstallments = Math.max(
      1,
      Math.min(remainingInstallments || Math.ceil(remaining / monthlyPayment), Math.ceil(remaining / monthlyPayment) + 12)
    );
  }

  const hasRateData = debt.annualRate > 0 && debt.installments > 0;
  const totalInterestEstimated = hasRateData
    ? Math.max(0, monthlyPayment * debt.installments - debt.principal)
    : 0;
  const remainingInterest = Math.max(0, totalInterestEstimated - paymentsInterest);

  const isPaid = debt.principal > 0 && remaining <= 0.009;

  const lastDate = debt.payments.length
    ? debt.payments.map((p) => p.date).sort().slice(-1)[0]
    : null;
  const anchor = lastDate ?? debt.startDate;
  const nextPaymentDate = isPaid ? null : addMonths(anchor, 1);

  const upcomingPayments: { date: string; amount: number; number: number }[] = [];
  if (!isPaid && monthlyPayment > 0) {
    let balance = remaining;
    for (let k = 1; k <= Math.min(3, remainingInstallments || 3); k++) {
      const amount = Math.min(monthlyPayment, balance + (balance * debt.annualRate) / 100 / 12);
      upcomingPayments.push({
        date: addMonths(anchor, k),
        amount,
        number: paymentsMade + k,
      });
      balance = Math.max(0, balance - amount);
      if (balance <= 0) break;
    }
  }

  const estimatedEnd = isPaid
    ? lastDate
    : remainingInstallments > 0
    ? addMonths(anchor, remainingInstallments)
    : debt.endDate;

  return {
    totalPaid,
    principalPaid,
    interestPaid: paymentsInterest,
    remaining,
    progress,
    monthlyPayment,
    paymentsMade,
    remainingInstallments,
    estimatedEnd,
    totalInterestEstimated,
    remainingInterest,
    totalCost: debt.principal + totalInterestEstimated,
    isPaid,
    nextPaymentDate,
    upcomingPayments,
    hasRateData,
  };
}

const mapDebt = (d: any): Debt => ({
  id: d.id,
  name: d.name,
  debtType: d.debt_type,
  principal: Number(d.principal),
  annualRate: Number(d.annual_rate),
  installments: Number(d.installments),
  installmentAmount: Number(d.installment_amount),
  startDate: d.start_date,
  endDate: d.end_date,
  initialPaid: Number(d.initial_paid),
  color: d.color,
  icon: d.icon,
  note: d.note,
  createdAt: d.created_at,
  payments: (d.debt_payments ?? [])
    .map((p: any) => ({
      id: p.id,
      debtId: p.debt_id,
      date: p.payment_date,
      amount: Number(p.amount),
      principalPart: Number(p.principal_part),
      interestPart: Number(p.interest_part),
      installmentNumber: p.installment_number,
      note: p.note,
    }))
    .sort((a: DebtPayment, b: DebtPayment) => (a.date < b.date ? 1 : -1)),
});

const toRow = (input: Partial<DebtInput>) => {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.debtType !== undefined) row.debt_type = input.debtType;
  if (input.principal !== undefined) row.principal = input.principal;
  if (input.annualRate !== undefined) row.annual_rate = input.annualRate;
  if (input.installments !== undefined) row.installments = input.installments;
  if (input.installmentAmount !== undefined) row.installment_amount = input.installmentAmount;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.endDate !== undefined) row.end_date = input.endDate;
  if (input.initialPaid !== undefined) row.initial_paid = input.initialPaid;
  if (input.color !== undefined) row.color = input.color;
  if (input.icon !== undefined) row.icon = input.icon;
  if (input.note !== undefined) row.note = input.note ?? null;
  return row;
};

export function useDebts() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDebts = useCallback(async () => {
    if (!user) {
      setDebts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("debts")
      .select("*, debt_payments(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setDebts((data as any[]).map(mapDebt));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const createDebt = useCallback(
    async (input: DebtInput) => {
      if (!user) return { error: new Error("No autenticado") };
      const { error } = await supabase.from("debts").insert({ user_id: user.id, ...toRow(input) } as any);
      if (!error) await fetchDebts();
      return { error: error ? new Error(error.message) : null };
    },
    [user, fetchDebts]
  );

  const updateDebt = useCallback(
    async (id: string, updates: Partial<DebtInput>) => {
      if (!user) return { error: new Error("No autenticado") };
      const { error } = await supabase
        .from("debts")
        .update(toRow(updates) as any)
        .eq("id", id)
        .eq("user_id", user.id);
      if (!error) await fetchDebts();
      return { error: error ? new Error(error.message) : null };
    },
    [user, fetchDebts]
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      if (!user) return { error: new Error("No autenticado") };
      const { error } = await supabase.from("debts").delete().eq("id", id).eq("user_id", user.id);
      if (!error) await fetchDebts();
      return { error: error ? new Error(error.message) : null };
    },
    [user, fetchDebts]
  );

  const addPayment = useCallback(
    async (payment: {
      debtId: string;
      amount: number;
      date: string;
      principalPart: number;
      interestPart: number;
      installmentNumber?: number | null;
      note?: string;
    }) => {
      const { error } = await supabase.from("debt_payments").insert({
        debt_id: payment.debtId,
        amount: payment.amount,
        payment_date: payment.date,
        principal_part: payment.principalPart,
        interest_part: payment.interestPart,
        installment_number: payment.installmentNumber ?? null,
        note: payment.note || null,
      } as any);
      if (!error) await fetchDebts();
      return { error: error ? new Error(error.message) : null };
    },
    [fetchDebts]
  );

  const deletePayment = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("debt_payments").delete().eq("id", id);
      if (!error) await fetchDebts();
      return { error: error ? new Error(error.message) : null };
    },
    [fetchDebts]
  );

  return { debts, loading, createDebt, updateDebt, deleteDebt, addPayment, deletePayment, refetch: fetchDebts };
}
