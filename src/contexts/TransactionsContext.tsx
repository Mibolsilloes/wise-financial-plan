import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { transactions as initialTransactions, Transaction } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface TransactionsContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByCategory: (categoryName: string) => Transaction[];
  getTransactionsByAccount: (accountName: string) => Transaction[];
  getTransactionsByCreditCard: (cardName: string) => Transaction[];
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);

  // Fetch transactions from database when user logs in
  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      // Use mock data when not logged in
      setTransactions(initialTransactions);
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: false });

    if (!error && data) {
      // Transform database transactions to app format
      const transformedData: Transaction[] = data.map((t) => ({
        id: t.id,
        type: t.type === "income" ? "ingreso" : "gasto",
        description: t.description,
        amount: Number(t.amount),
        category: t.subcategory || "Sin categoría",
        subcategory: t.subcategory,
        account: "Cuenta Principal", // TODO: Join with accounts table
        creditCard: undefined,
        responsible: "Usuario",
        dueDate: new Date(t.due_date),
        paymentDate: t.payment_date ? new Date(t.payment_date) : undefined,
        competenceDate: new Date(t.due_date),
        status: t.status === "paid" 
          ? (t.type === "income" ? "cobrado" : "pagado")
          : (t.type === "income" ? "por_cobrar" : "pendiente"),
        isFixed: false,
        color: t.type === "income" ? "hsl(142, 76%, 36%)" : "hsl(340, 82%, 52%)",
      }));

      // If user has no transactions in DB, keep showing demo data
      if (transformedData.length > 0) {
        setTransactions(transformedData);
      }
    }
    setLoading(false);
  };

  const addTransaction = useCallback(async (transaction: Omit<Transaction, "id">) => {
    if (!user) {
      // Fallback to local state for demo
      const newTransaction: Transaction = {
        ...transaction,
        id: `t${Date.now()}`,
      };
      setTransactions((prev) => [...prev, newTransaction]);
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type === "ingreso" ? "income" : "expense",
        status: ["pagado", "cobrado"].includes(transaction.status) ? "paid" : "pending",
        subcategory: transaction.subcategory || transaction.category,
        due_date: transaction.dueDate.toISOString().split("T")[0],
        payment_date: transaction.paymentDate?.toISOString().split("T")[0],
      })
      .select()
      .single();

    if (!error && data) {
      const newTransaction: Transaction = {
        ...transaction,
        id: data.id,
      };
      setTransactions((prev) => [...prev, newTransaction]);
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!user) {
      // Fallback to local state for demo
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      return;
    }

    const dbUpdates: Record<string, unknown> = {};
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.amount) dbUpdates.amount = updates.amount;
    if (updates.status) {
      dbUpdates.status = ["pagado", "cobrado"].includes(updates.status) ? "paid" : "pending";
      if (["pagado", "cobrado"].includes(updates.status)) {
        dbUpdates.payment_date = new Date().toISOString().split("T")[0];
      }
    }
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate.toISOString().split("T")[0];

    const { error } = await supabase
      .from("transactions")
      .update(dbUpdates)
      .eq("id", id);

    if (!error) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) {
      // Fallback to local state for demo
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  }, [user]);

  const getTransactionsByCategory = useCallback(
    (categoryName: string) => {
      return transactions.filter((t) => t.category === categoryName);
    },
    [transactions]
  );

  const getTransactionsByAccount = useCallback(
    (accountName: string) => {
      return transactions.filter((t) => t.account === accountName);
    },
    [transactions]
  );

  const getTransactionsByCreditCard = useCallback(
    (cardName: string) => {
      return transactions.filter((t) => t.creditCard === cardName);
    },
    [transactions]
  );

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionsByCategory,
        getTransactionsByAccount,
        getTransactionsByCreditCard,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionsProvider");
  }
  return context;
}
