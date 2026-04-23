import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Category } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type CategoryInput = Omit<Category, "id">;
type CategoryActionResult = { error: Error | null };

// Funções de mapeamento entre valores da interface (espanhol) e banco de dados (inglês)
const mapCategoryTypeToDb = (uiType: "ingreso" | "gasto"): "income" | "expense" => {
  return uiType === "ingreso" ? "income" : "expense";
};

const mapCategoryTypeFromDb = (dbType: "income" | "expense"): "ingreso" | "gasto" => {
  return dbType === "income" ? "ingreso" : "gasto";
};

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  addCategory: (category: CategoryInput) => Promise<CategoryActionResult>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, name: string) => Promise<CategoryActionResult>;
  removeSubcategory: (categoryId: string, name: string) => Promise<CategoryActionResult>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
  refetchCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data: categoryRows, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      if (categoriesError) {
        console.error("fetchCategories error:", categoriesError);
        setCategories([]);
        return;
      }

      const categoryIds = (categoryRows ?? []).map((category) => category.id);
      const subcategoriesByCategory = new Map<string, string[]>();

      if (categoryIds.length > 0) {
        const { data: subcategoryRows, error: subcategoriesError } = await supabase
          .from("subcategories")
          .select("category_id, name")
          .in("category_id", categoryIds)
          .order("created_at", { ascending: true });

        if (subcategoriesError) {
          console.error("fetchSubcategories error:", subcategoriesError);
        } else {
          subcategoryRows.forEach((subcategory) => {
            const items = subcategoriesByCategory.get(subcategory.category_id) ?? [];
            items.push(subcategory.name);
            subcategoriesByCategory.set(subcategory.category_id, items);
          });
        }
      }

      const transformed: Category[] = (categoryRows ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        type: mapCategoryTypeFromDb(category.type as "income" | "expense"),
        color: category.color,
        icon: category.icon,
        subcategories: subcategoriesByCategory.get(category.id) ?? [],
        totalAmount: 0,
        position: category.position ?? undefined,
        keywords: category.keywords ?? undefined,
      }));

      setCategories(transformed);
    } catch (error) {
      console.error("Unexpected fetchCategories error:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchCategories();
    } else {
      setCategories([]);
    }
  }, [user, fetchCategories]);

  const addCategory = useCallback(async (category: CategoryInput): Promise<CategoryActionResult> => {
    if (!user) {
      const error = new Error("Usuario no autenticado");
      console.error("addCategory error:", error);
      return { error };
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: category.name,
        type: mapCategoryTypeToDb(category.type),
        color: category.color,
        icon: category.icon,
        keywords: category.keywords || [],
        position: category.position ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error("addCategory error:", error);
      return { error: error as Error };
    }

    if (!data) {
      const missingDataError = new Error("No se pudo recuperar la categoría creada");
      console.error("addCategory error:", missingDataError);
      return { error: missingDataError };
    }

    const createdCategory: Category = {
      id: data.id,
      name: data.name,
      type: mapCategoryTypeFromDb(data.type as "income" | "expense"),
      color: data.color,
      icon: data.icon,
      subcategories: [],
      totalAmount: 0,
      position: data.position ?? undefined,
      keywords: data.keywords ?? undefined,
    };

    setCategories((prev) =>
      [...prev, createdCategory].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    );

    return { error: null };
  }, [user]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = mapCategoryTypeToDb(updates.type);
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
    if (updates.position !== undefined) dbUpdates.position = updates.position;

    const { error } = await supabase
      .from("categories")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  }, [user]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }, [user]);

  const addSubcategory = useCallback(
    async (categoryId: string, name: string): Promise<CategoryActionResult> => {
      if (!user) return { error: new Error("Usuario no autenticado") };
      const trimmed = name.trim().replace(/\s+/g, " ");
      if (!trimmed) return { error: new Error("El nombre es obligatorio") };

      // Check for duplicates case-insensitively within the same category
      const parent = categories.find((c) => c.id === categoryId);
      const exists = parent?.subcategories.some(
        (s) => s.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) {
        return { error: new Error("Ya existe una subcategoría con ese nombre") };
      }

      const { error } = await supabase
        .from("subcategories")
        .insert({ category_id: categoryId, name: trimmed });

      if (error) {
        console.error("addSubcategory error:", error);
        return { error: error as Error };
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, subcategories: [...c.subcategories, trimmed] }
            : c
        )
      );

      return { error: null };
    },
    [user, categories]
  );

  const removeSubcategory = useCallback(
    async (categoryId: string, name: string): Promise<CategoryActionResult> => {
      if (!user) return { error: new Error("Usuario no autenticado") };

      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("category_id", categoryId)
        .eq("name", name);

      if (error) {
        console.error("removeSubcategory error:", error);
        return { error: error as Error };
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, subcategories: c.subcategories.filter((s) => s !== name) }
            : c
        )
      );

      return { error: null };
    },
    [user]
  );

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
  }, [fetchCategories]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        removeSubcategory,
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
