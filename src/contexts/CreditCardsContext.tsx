import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { creditCards as initialCards, CreditCard } from "@/data/mockData";

interface CreditCardsContextType {
  creditCards: CreditCard[];
  addCreditCard: (card: Omit<CreditCard, "id">) => void;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  getCreditCardById: (id: string) => CreditCard | undefined;
  getCreditCardByName: (name: string) => CreditCard | undefined;
  updateUsedLimit: (id: string, amount: number) => void;
  refetchCreditCards: () => Promise<void>;
}

const CreditCardsContext = createContext<CreditCardsContextType | undefined>(undefined);

export function CreditCardsProvider({ children }: { children: ReactNode }) {
  const [creditCards, setCreditCards] = useState<CreditCard[]>(initialCards);

  const addCreditCard = useCallback((card: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = {
      ...card,
      id: `card${Date.now()}`,
    };
    setCreditCards((prev) => [...prev, newCard]);
  }, []);

  const updateCreditCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCreditCard = useCallback((id: string) => {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCreditCardById = useCallback(
    (id: string) => {
      return creditCards.find((c) => c.id === id);
    },
    [creditCards]
  );

  const getCreditCardByName = useCallback(
    (name: string) => {
      return creditCards.find((c) => c.name === name);
    },
    [creditCards]
  );

  const updateUsedLimit = useCallback((id: string, amount: number) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, used: c.used + amount } : c))
    );
  }, []);

  const refetchCreditCards = useCallback(async () => {
    // For now, reset to initial cards
    // When Supabase integration is complete, this will fetch from DB
    setCreditCards([...initialCards]);
  }, []);

  return (
    <CreditCardsContext.Provider
      value={{
        creditCards,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        getCreditCardById,
        getCreditCardByName,
        updateUsedLimit,
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
