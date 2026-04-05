import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { BankAccount } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface AccountsContextType {
  accounts: BankAccount[];
  loading: boolean;
  addAccount: (account: Omit<BankAccount, "id">) => Promise<void>;
  updateAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getAccountById: (id: string) => BankAccount | undefined;
  getAccountByName: (name: string) => BankAccount | undefined;
  adjustBalance: (id: string, amount: number, operation: "add" | "subtract" | "set") => Promise<void>;
  transfer: (fromId: string, toId: string, amount: number) => Promise<void>;
  refetchAccounts: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
    }
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const transformed: BankAccount[] = data.map((a) => ({
        id: a.id,
        name: a.name,
        bank: a.bank,
        type: "corriente" as const,
        balance: Number(a.balance),
        color: a.color,
        lastUpdate: a.created_at,
      }));
      setAccounts(transformed);
    }
    setLoading(false);
  };

  const addAccount = useCallback(async (account: Omit<BankAccount, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: user.id,
        name: account.name,
        bank: account.bank,
        balance: account.balance,
        color: account.color,
      })
      .select()
      .single();

    if (!error && data) {
      setAccounts((prev) => [...prev, {
        id: data.id,
        name: data.name,
        bank: data.bank,
        type: "corriente" as const,
        balance: Number(data.balance),
        color: data.color,
      }]);
    }
  }, [user]);

  const updateAccount = useCallback(async (id: string, updates: Partial<BankAccount>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.bank !== undefined) dbUpdates.bank = updates.bank;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { error } = await supabase
      .from("bank_accounts")
      .update(dbUpdates)
      .eq("id", id);

    if (!error) {
      setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    }
  }, [user]);

  const deleteAccount = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", id);

    if (!error) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  }, [user]);

  const getAccountById = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts]
  );

  const getAccountByName = useCallback(
    (name: string) => accounts.find((a) => a.name === name),
    [accounts]
  );

  const adjustBalance = useCallback(async (id: string, amount: number, operation: "add" | "subtract" | "set") => {
    if (!user) return;
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    let newBalance: number;
    switch (operation) {
      case "add": newBalance = account.balance + amount; break;
      case "subtract": newBalance = account.balance - amount; break;
      case "set": newBalance = amount; break;
      default: newBalance = account.balance;
    }

    const { error } = await supabase
      .from("bank_accounts")
      .update({ balance: newBalance })
      .eq("id", id);

    if (!error) {
      setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, balance: newBalance } : a)));
    }
  }, [user, accounts]);

  const transfer = useCallback(async (fromId: string, toId: string, amount: number) => {
    if (!user) return;
    const fromAcc = accounts.find((a) => a.id === fromId);
    const toAcc = accounts.find((a) => a.id === toId);
    if (!fromAcc || !toAcc) return;

    const { error: e1 } = await supabase
      .from("bank_accounts")
      .update({ balance: fromAcc.balance - amount })
      .eq("id", fromId);

    const { error: e2 } = await supabase
      .from("bank_accounts")
      .update({ balance: toAcc.balance + amount })
      .eq("id", toId);

    if (!e1 && !e2) {
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === fromId) return { ...a, balance: a.balance - amount };
          if (a.id === toId) return { ...a, balance: a.balance + amount };
          return a;
        })
      );
    }
  }, [user, accounts]);

  const refetchAccounts = useCallback(async () => {
    await fetchAccounts();
  }, [user]);

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        loading,
        addAccount,
        updateAccount,
        deleteAccount,
        getAccountById,
        getAccountByName,
        adjustBalance,
        transfer,
        refetchAccounts,
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
