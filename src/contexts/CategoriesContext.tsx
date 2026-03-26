import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Category } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
  refetchCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("*, subcategories(name)")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (!error && data) {
      const transformed: Category[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type as "ingreso" | "gasto",
        color: c.color,
        icon: c.icon,
        subcategories: (c.subcategories as { name: string }[])?.map((s) => s.name) || [],
        totalAmount: 0,
        position: c.position ?? undefined,
        keywords: c.keywords ?? undefined,
      }));
      setCategories(transformed);
    }
    setLoading(false);
  };

  const addCategory = useCallback(async (category: Omit<Category, "id">) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        keywords: category.keywords || [],
        position: category.position ?? 0,
      })
      .select()
      .single();

    if (!error && data) {
      setCategories((prev) => [...prev, {
        id: data.id,
        name: data.name,
        type: data.type as "ingreso" | "gasto",
        color: data.color,
        icon: data.icon,
        subcategories: [],
        totalAmount: 0,
        position: data.position ?? undefined,
        keywords: data.keywords ?? undefined,
      }]);
    }
  }, [user]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
    if (updates.position !== undefined) dbUpdates.position = updates.position;

    const { error } = await supabase
      .from("categories")
      .update(dbUpdates)
      .eq("id", id);

    if (!error) {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  }, [user]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }, [user]);

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  const getCategoryByName = useCallback(
    (name: string) => categories.find((c) => c.name === name),
    [categories]
  );

  const refetchCategories = useCallback(async () => {
    await fetchCategories();
  }, [user]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        getCategoryByName,
        refetchCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
