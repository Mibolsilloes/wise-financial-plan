import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { CreditCard } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type ActionResult = { error: Error | null };

interface CreditCardsContextType {
  creditCards: CreditCard[];
  loading: boolean;
  addCreditCard: (card: Omit<CreditCard, "id">) => Promise<ActionResult>;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<ActionResult>;
  deleteCreditCard: (id: string) => Promise<ActionResult>;
  getCreditCardById: (id: string) => CreditCard | undefined;
  getCreditCardByName: (name: string) => CreditCard | undefined;
  refetchCreditCards: () => Promise<void>;
}

const CreditCardsContext = createContext<CreditCardsContextType | undefined>(undefined);

export function CreditCardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCreditCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: cardData, error }, { data: usedData }] = await Promise.all([
      supabase
        .from("credit_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("transactions")
        .select("credit_card_id, amount")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .eq("status", "pending")
        .not("credit_card_id", "is", null),
    ]);

    if (error) {
      console.error("fetchCreditCards error:", error);
      setCreditCards([]);
    } else if (cardData) {
      const usedByCard: Record<string, number> = {};
      if (usedData) {
        usedData.forEach((t) => {
          if (t.credit_card_id) {
            usedByCard[t.credit_card_id] =
              (usedByCard[t.credit_card_id] || 0) + Number(t.amount);
          }
        });
      }

      const transformed: CreditCard[] = cardData.map((c) => ({
        id: c.id,
        name: c.name,
        bank: c.brand,
        brand: c.brand,
        lastDigits: c.last_digits,
        limit: Number(c.credit_limit),
        used: usedByCard[c.id] || 0,
        closingDay: c.closing_day,
        dueDay: c.due_day,
        color: c.color,
      }));
      setCreditCards(transformed);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchCreditCards();
    } else {
      setCreditCards([]);
    }
  }, [user, fetchCreditCards]);

  const addCreditCard = useCallback(async (card: Omit<CreditCard, "id">): Promise<ActionResult> => {
    if (!user) return { error: new Error("Usuario no autenticado") };

    const cleanedDigits = (card.lastDigits ?? "").replace(/\D/g, "").slice(-4);
    if (cleanedDigits.length !== 4) {
      return { error: new Error("Introduce los últimos 4 dígitos de la tarjeta") };
    }
    if (card.closingDay < 1 || card.closingDay > 31) {
      return { error: new Error("El día de cierre debe estar entre 1 y 31") };
    }
    if (card.dueDay < 1 || card.dueDay > 31) {
      return { error: new Error("El día de vencimiento debe estar entre 1 y 31") };
    }
    if (card.limit <= 0) {
      return { error: new Error("El límite debe ser mayor a cero") };
    }

    const { data, error } = await supabase
      .from("credit_cards")
      .insert({
        user_id: user.id,
        name: card.name,
        brand: card.brand,
        last_digits: cleanedDigits,
        credit_limit: card.limit,
        closing_day: card.closingDay,
        due_day: card.dueDay,
        color: card.color,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("addCreditCard error:", error);
      return { error: (error as Error) ?? new Error("No se pudo crear la tarjeta") };
    }

    setCreditCards((prev) => [...prev, {
      id: data.id,
      name: data.name,
      bank: data.brand,
      brand: data.brand,
      lastDigits: data.last_digits,
      limit: Number(data.credit_limit),
      used: 0,
      closingDay: data.closing_day,
      dueDay: data.due_day,
      color: data.color,
    }]);
    return { error: null };
  }, [user]);

  const updateCreditCard = useCallback(async (id: string, updates: Partial<CreditCard>): Promise<ActionResult> => {
    if (!user) return { error: new Error("Usuario no autenticado") };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.lastDigits !== undefined) {
      const cleaned = updates.lastDigits.replace(/\D/g, "").slice(-4);
      if (cleaned.length !== 4) return { error: new Error("Los últimos 4 dígitos no son válidos") };
      dbUpdates.last_digits = cleaned;
    }
    if (updates.limit !== undefined) {
      if (updates.limit <= 0) return { error: new Error("El límite debe ser mayor a cero") };
      dbUpdates.credit_limit = updates.limit;
    }
    if (updates.closingDay !== undefined) {
      if (updates.closingDay < 1 || updates.closingDay > 31) {
        return { error: new Error("El día de cierre debe estar entre 1 y 31") };
      }
      dbUpdates.closing_day = updates.closingDay;
    }
    if (updates.dueDay !== undefined) {
      if (updates.dueDay < 1 || updates.dueDay > 31) {
        return { error: new Error("El día de vencimiento debe estar entre 1 y 31") };
      }
      dbUpdates.due_day = updates.dueDay;
    }
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { error } = await supabase
      .from("credit_cards")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("updateCreditCard error:", error);
      return { error: error as Error };
    }
    setCreditCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    return { error: null };
  }, [user]);

  const deleteCreditCard = useCallback(async (id: string): Promise<ActionResult> => {
    if (!user) return { error: new Error("Usuario no autenticado") };
    const { error } = await supabase
      .from("credit_cards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("deleteCreditCard error:", error);
      return { error: error as Error };
    }
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
    return { error: null };
  }, [user]);

  const getCreditCardById = useCallback(
    (id: string) => creditCards.find((c) => c.id === id),
    [creditCards]
  );

  const getCreditCardByName = useCallback(
    (name: string) => creditCards.find((c) => c.name === name),
    [creditCards]
  );

  const refetchCreditCards = useCallback(async () => {
    await fetchCreditCards();
  }, [fetchCreditCards]);

  return (
    <CreditCardsContext.Provider
      value={{
        creditCards,
        loading,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        getCreditCardById,
        getCreditCardByName,
        refetchCreditCards,
      }}
    >
      {children}
    </CreditCardsContext.Provider>
  );
}

export function useCreditCards() {
  const context = useContext(CreditCardsContext);
  if (context === undefined) {
    throw new Error("useCreditCards must be used within a CreditCardsProvider");
  }
  return context;
}
