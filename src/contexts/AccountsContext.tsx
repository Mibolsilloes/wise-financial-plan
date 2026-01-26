import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { bankAccounts as initialAccounts, BankAccount } from "@/data/mockData";

interface AccountsContextType {
  accounts: BankAccount[];
  addAccount: (account: Omit<BankAccount, "id">) => void;
  updateAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteAccount: (id: string) => void;
  getAccountById: (id: string) => BankAccount | undefined;
  getAccountByName: (name: string) => BankAccount | undefined;
  adjustBalance: (id: string, amount: number, operation: "add" | "subtract" | "set") => void;
  transfer: (fromId: string, toId: string, amount: number) => void;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);

  const addAccount = useCallback((account: Omit<BankAccount, "id">) => {
    const newAccount: BankAccount = {
      ...account,
      id: `acc${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAccount]);
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<BankAccount>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getAccountById = useCallback(
    (id: string) => {
      return accounts.find((a) => a.id === id);
    },
    [accounts]
  );

  const getAccountByName = useCallback(
    (name: string) => {
      return accounts.find((a) => a.name === name);
    },
    [accounts]
  );

  const adjustBalance = useCallback(
    (id: string, amount: number, operation: "add" | "subtract" | "set") => {
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          let newBalance: number;
          switch (operation) {
            case "add":
              newBalance = a.balance + amount;
              break;
            case "subtract":
              newBalance = a.balance - amount;
              break;
            case "set":
              newBalance = amount;
              break;
            default:
              newBalance = a.balance;
          }
          return { ...a, balance: newBalance };
        })
      );
    },
    []
  );

  const transfer = useCallback((fromId: string, toId: string, amount: number) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromId) return { ...a, balance: a.balance - amount };
        if (a.id === toId) return { ...a, balance: a.balance + amount };
        return a;
      })
    );
  }, []);

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        getAccountById,
        getAccountByName,
        adjustBalance,
        transfer,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountsProvider");
  }
  return context;
}
