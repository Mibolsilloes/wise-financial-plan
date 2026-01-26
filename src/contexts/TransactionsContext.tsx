import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { transactions as initialTransactions, Transaction, categories } from "@/data/mockData";

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByCategory: (categoryName: string) => Transaction[];
  getTransactionsByAccount: (accountName: string) => Transaction[];
  getTransactionsByCreditCard: (cardName: string) => Transaction[];
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = useCallback((transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `t${Date.now()}`,
    };
    setTransactions((prev) => [...prev, newTransaction]);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
