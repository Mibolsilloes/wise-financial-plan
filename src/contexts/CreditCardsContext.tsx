import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { CreditCard } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface CreditCardsContextType {
  creditCards: CreditCard[];
  loading: boolean;
  addCreditCard: (card: Omit<CreditCard, "id">) => Promise<void>;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  getCreditCardById: (id: string) => CreditCard | undefined;
  getCreditCardByName: (name: string) => CreditCard | undefined;
  refetchCreditCards: () => Promise<void>;
}

const CreditCardsContext = createContext<CreditCardsContextType | undefined>(undefined);

export function CreditCardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCreditCards();
    } else {
      setCreditCards([]);
    }
  }, [user]);

  const fetchCreditCards = async () => {
    if (!user) return;
    setLoading(true);

    // Busca cartões e saldo utilizado (despesas pendentes vinculadas) em paralelo
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

    if (!error && cardData) {
      // Soma os valores de despesas pendentes por cartão
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
        id:         c.id,
        name:       c.name,
        bank:       c.brand,
        brand:      c.brand,
        limit:      Number(c.credit_limit),
        used:       usedByCard[c.id] || 0,
        closingDay: c.closing_day,
        dueDay:     c.due_day,
        color:      c.color,
      }));
      setCreditCards(transformed);
    }
    setLoading(false);
  };

  const addCreditCard = useCallback(async (card: Omit<CreditCard, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("credit_cards")
      .insert({
        user_id:      user.id,
        name:         card.name,
        brand:        card.brand,
        last_digits:  card.name.slice(-4) || "0000",
        credit_limit: card.limit,
        closing_day:  card.closingDay,
        due_day:      card.dueDay,
        color:        card.color,
      })
      .select()
      .single();

    if (!error && data) {
      setCreditCards((prev) => [...prev, {
        id:         data.id,
        name:       data.name,
        bank:       data.brand,
        brand:      data.brand,
        limit:      Number(data.credit_limit),
        used:       0,
        closingDay: data.closing_day,
        dueDay:     data.due_day,
        color:      data.color,
      }]);
    }
  }, [user]);

  const updateCreditCard = useCallback(async (id: string, updates: Partial<CreditCard>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name       !== undefined) dbUpdates.name         = updates.name;
    if (updates.brand      !== undefined) dbUpdates.brand        = updates.brand;
    if (updates.limit      !== undefined) dbUpdates.credit_limit = updates.limit;
    if (updates.closingDay !== undefined) dbUpdates.closing_day  = updates.closingDay;
    if (updates.dueDay     !== undefined) dbUpdates.due_day      = updates.dueDay;
    if (updates.color      !== undefined) dbUpdates.color        = updates.color;

    const { error } = await supabase
      .from("credit_cards")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setCreditCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  }, [user]);

  const deleteCreditCard = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("credit_cards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setCreditCards((prev) => prev.filter((c) => c.id !== id));
    }
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
  }, [user]);

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
