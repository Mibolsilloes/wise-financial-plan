import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { BankAccount } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type ActionResult = { error: Error | null };

interface AccountsContextType {
  accounts: BankAccount[];
  loading: boolean;
  addAccount: (account: Omit<BankAccount, "id">) => Promise<ActionResult>;
  updateAccount: (id: string, updates: Partial<BankAccount>) => Promise<ActionResult>;
  deleteAccount: (id: string) => Promise<ActionResult>;
  getAccountById: (id: string) => BankAccount | undefined;
  getAccountByName: (name: string) => BankAccount | undefined;
  adjustBalance: (id: string, amount: number, operation: "add" | "subtract" | "set") => Promise<ActionResult>;
  transfer: (fromId: string, toId: string, amount: number) => Promise<ActionResult>;
  refetchAccounts: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("fetchAccounts error:", error);
      setAccounts([]);
    } else if (data) {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchAccounts();
    } else {
      setAccounts([]);
    }
  }, [user, fetchAccounts]);

  const addAccount = useCallback(async (account: Omit<BankAccount, "id">): Promise<ActionResult> => {
    if (!user) return { error: new Error("Usuario no autenticado") };
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

    if (error || !data) {
      console.error("addAccount error:", error);
      return { error: (error as Error) ?? new Error("No se pudo crear la cuenta") };
    }

    setAccounts((prev) => [...prev, {
      id: data.id,
      name: data.name,
      bank: data.bank,
      type: "corriente" as const,
      balance: Number(data.balance),
      color: data.color,
    }]);
    return { error: null };
  }, [user]);

  const updateAccount = useCallback(async (id: string, updates: Partial<BankAccount>): Promise<ActionResult> => {
    if (!user) return { error: new Error("Usuario no autenticado") };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.bank !== undefined) dbUpdates.bank = updates.bank;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { error } = await supabase
      .from("bank_accounts")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("updateAccount error:", error);
      return { error: error as Error };
    }
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    return { error: null };
  }, [user]);

  const deleteAccount = useCallback(async (id: string): Promise<ActionResult> => {
    if (!user) return { error: new Error("Usuario no autenticado") };
    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("deleteAccount error:", error);
      return { error: error as Error };
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    return { error: null };
  }, [user]);

  const getAccountById = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts]
  );

  const getAccountByName = useCallback(
    (name: string) => accounts.find((a) => a.name === name),
    [accounts]
  );

  const adjustBalance = useCallback(async (id: string, amount: number, operation: "add" | "subtract" | "set"): Promise<ActionResult> => {
    if (!user) return { error: new Error("Usuario no autenticado") };
    const account = accounts.find((a) => a.id === id);
    if (!account) return { error: new Error("Cuenta no encontrada") };

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
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("adjustBalance error:", error);
      return { error: error as Error };
    }
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, balance: newBalance } : a)));
    return { error: null };
  }, [user, accounts]);

  const transfer = useCallback(async (fromId: string, toId: string, amount: number): Promise<ActionResult> => {
    if (!user) return { error: new Error("Usuario no autenticado") };
    if (fromId === toId) return { error: new Error("La cuenta origen y destino no pueden ser la misma") };
    if (amount <= 0) return { error: new Error("El importe debe ser mayor a cero") };

    const fromAcc = accounts.find((a) => a.id === fromId);
    const toAcc = accounts.find((a) => a.id === toId);
    if (!fromAcc || !toAcc) return { error: new Error("Cuenta no encontrada") };

    const newFromBalance = fromAcc.balance - amount;
    const newToBalance = toAcc.balance + amount;

    // Debit origin first
    const { error: debitError } = await supabase
      .from("bank_accounts")
      .update({ balance: newFromBalance })
      .eq("id", fromId)
      .eq("user_id", user.id);

    if (debitError) {
      console.error("transfer debit error:", debitError);
      return { error: debitError as Error };
    }

    // Credit destination
    const { error: creditError } = await supabase
      .from("bank_accounts")
      .update({ balance: newToBalance })
      .eq("id", toId)
      .eq("user_id", user.id);

    if (creditError) {
      // Rollback the debit
      console.error("transfer credit error, rolling back:", creditError);
      await supabase
        .from("bank_accounts")
        .update({ balance: fromAcc.balance })
        .eq("id", fromId)
        .eq("user_id", user.id);
      return { error: new Error("La transferencia falló al acreditar el destino. Se revirtió el débito.") };
    }

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromId) return { ...a, balance: newFromBalance };
        if (a.id === toId) return { ...a, balance: newToBalance };
        return a;
      })
    );
    return { error: null };
  }, [user, accounts]);

  const refetchAccounts = useCallback(async () => {
    await fetchAccounts();
  }, [fetchAccounts]);

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
