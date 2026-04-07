import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Transaction } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

// Tipo local para o resultado do JOIN
type TransactionRow = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  category_id: string | null;
  subcategory: string | null;
  account_id: string | null;
  credit_card_id: string | null;
  due_date: string;
  payment_date: string | null;
  categories: { id: string; name: string; color: string } | null;
  bank_accounts: { id: string; name: string } | null;
  credit_cards: { id: string; name: string } | null;
};

interface TransactionsContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<{ error: Error | null }>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByCategory: (categoryName: string) => Transaction[];
  getTransactionsByAccount: (accountName: string) => Transaction[];
  getTransactionsByCreditCard: (cardName: string) => Transaction[];
  refetchTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categories(id, name, color),
        bank_accounts(id, name),
        credit_cards(id, name)
      `)
      .eq("user_id", user.id)
      .order("due_date", { ascending: false });

    if (!error && data) {
      const rows = data as unknown as TransactionRow[];
      const transformedData: Transaction[] = rows.map((t) => {
        const cat  = t.categories;
        const acc  = t.bank_accounts;
        const card = t.credit_cards;
        const isIncome = t.type === "income";

        return {
          id:            t.id,
          type:          isIncome ? "ingreso" : "gasto",
          description:   t.description,
          amount:        Number(t.amount),
          // Categoria: usa o nome da FK; cai no subcategory (legado) ou "Sin categoría"
          category:      cat?.name  || t.subcategory || "Sin categoría",
          categoryId:    t.category_id  || undefined,
          subcategory:   t.subcategory  || undefined,
          account:       acc?.name  || "",
          accountId:     t.account_id   || undefined,
          creditCard:    card?.name || undefined,
          creditCardId:  t.credit_card_id || undefined,
          responsible:   "Usuario",
          // Adiciona T12:00:00 para evitar off-by-one de timezone
          dueDate:         new Date(t.due_date + "T12:00:00"),
          paymentDate:     t.payment_date ? new Date(t.payment_date + "T12:00:00") : undefined,
          competenceDate:  new Date(t.due_date + "T12:00:00"),
          status: t.status === "paid"
            ? (isIncome ? "cobrado"    : "pagado")
            : (isIncome ? "por_cobrar" : "pendiente"),
          isFixed: false,
          color: cat?.color || (isIncome ? "hsl(142, 76%, 36%)" : "hsl(340, 82%, 52%)"),
        };
      });
      setTransactions(transformedData);
    }
    setLoading(false);
  };

  const addTransaction = useCallback(async (transaction: Omit<Transaction, "id">): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("Usuário não autenticado") };
    }

    try {
      const isPaid = ["pagado", "cobrado"].includes(transaction.status);

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id:        user.id,
          description:    transaction.description,
          amount:         transaction.amount,
          type:           transaction.type === "ingreso" ? "income" : "expense",
          status:         isPaid ? "paid" : "pending",
          category_id:    transaction.categoryId    || null,
          subcategory:    transaction.subcategory   || null,
          account_id:     transaction.accountId     || null,
          credit_card_id: transaction.creditCardId  || null,
          due_date:       transaction.dueDate.toISOString().split("T")[0],
          payment_date:   transaction.paymentDate
            ? transaction.paymentDate.toISOString().split("T")[0]
            : null,
        })
        .select()
        .single();

      if (error) {
        console.error("addTransaction error:", error);
        return { error: new Error(error.message) };
      }

      if (data) {
        const newTransaction: Transaction = { ...transaction, id: data.id };
        setTransactions((prev) => [newTransaction, ...prev]);
      }

      return { error: null };
    } catch (error) {
      console.error("addTransaction exception:", error);
      return { error: error instanceof Error ? error : new Error("Error al crear transacción") };
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};

    if (updates.description  !== undefined) dbUpdates.description    = updates.description;
    if (updates.amount       !== undefined) dbUpdates.amount         = updates.amount;
    if (updates.categoryId   !== undefined) dbUpdates.category_id    = updates.categoryId   || null;
    if (updates.subcategory  !== undefined) dbUpdates.subcategory    = updates.subcategory  || null;
    if (updates.accountId    !== undefined) dbUpdates.account_id     = updates.accountId    || null;
    if (updates.creditCardId !== undefined) dbUpdates.credit_card_id = updates.creditCardId || null;
    if (updates.dueDate      !== undefined) dbUpdates.due_date       = updates.dueDate.toISOString().split("T")[0];

    // paymentDate explícita tem prioridade
    if (updates.paymentDate !== undefined) {
      dbUpdates.payment_date = updates.paymentDate.toISOString().split("T")[0];
    }

    if (updates.status !== undefined) {
      const isPaid = ["pagado", "cobrado"].includes(updates.status);
      dbUpdates.status = isPaid ? "paid" : "pending";

      if (!isPaid) {
        // Ao desmarcar pago, limpa a data de pagamento
        dbUpdates.payment_date = null;
      } else if (updates.paymentDate === undefined) {
        // Marcando pago sem data explícita → usa hoje
        dbUpdates.payment_date = new Date().toISOString().split("T")[0];
      }
    }

    const { error } = await supabase
      .from("transactions")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user.id); // segurança extra além do RLS

    if (!error) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  }, [user]);

  const getTransactionsByCategory = useCallback(
    (categoryName: string) => transactions.filter((t) => t.category === categoryName),
    [transactions]
  );

  const getTransactionsByAccount = useCallback(
    (accountName: string) => transactions.filter((t) => t.account === accountName),
    [transactions]
  );

  const getTransactionsByCreditCard = useCallback(
    (cardName: string) => transactions.filter((t) => t.creditCard === cardName),
    [transactions]
  );

  const refetchTransactions = useCallback(async () => {
    await fetchTransactions();
  }, [user]);

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
        refetchTransactions,
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
