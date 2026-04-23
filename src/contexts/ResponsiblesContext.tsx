import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Responsible {
  id: string;
  name: string;
  color: string;
}

interface ResponsiblesContextType {
  responsibles: Responsible[];
  loading: boolean;
  addResponsible: (name: string, color?: string) => Promise<{ error: Error | null }>;
  updateResponsible: (id: string, updates: Partial<Pick<Responsible, "name" | "color">>) => Promise<{ error: Error | null }>;
  deleteResponsible: (id: string) => Promise<{ error: Error | null }>;
  refetch: () => Promise<void>;
}

const ResponsiblesContext = createContext<ResponsiblesContextType | undefined>(undefined);

const MAX_RESPONSIBLES = 3;

export function ResponsiblesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResponsibles = useCallback(async () => {
    if (!user) {
      setResponsibles([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("responsibles")
      .select("id, name, color")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setResponsibles(data as Responsible[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchResponsibles();
  }, [fetchResponsibles]);

  const addResponsible = useCallback(
    async (name: string, color = "#26805D"): Promise<{ error: Error | null }> => {
      if (!user) return { error: new Error("Usuario no autenticado") };
      const trimmed = name.trim().replace(/\s+/g, " ");
      if (!trimmed) return { error: new Error("El nombre es obligatorio") };
      if (responsibles.length >= MAX_RESPONSIBLES) {
        return { error: new Error(`Solo se permiten hasta ${MAX_RESPONSIBLES} responsables`) };
      }
      const exists = responsibles.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) return { error: new Error("Ya existe un responsable con ese nombre") };

      const { data, error } = await supabase
        .from("responsibles")
        .insert({ user_id: user.id, name: trimmed, color })
        .select("id, name, color")
        .single();

      if (error) return { error: new Error(error.message) };
      if (data) setResponsibles((prev) => [...prev, data as Responsible]);
      return { error: null };
    },
    [user, responsibles]
  );

  const updateResponsible = useCallback(
    async (id: string, updates: Partial<Pick<Responsible, "name" | "color">>) => {
      if (!user) return { error: new Error("Usuario no autenticado") };
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name.trim().replace(/\s+/g, " ");
      if (updates.color !== undefined) payload.color = updates.color;

      const { error } = await supabase
        .from("responsibles")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) return { error: new Error(error.message) };
      setResponsibles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } as Responsible : r)));
      return { error: null };
    },
    [user]
  );

  const deleteResponsible = useCallback(
    async (id: string) => {
      if (!user) return { error: new Error("Usuario no autenticado") };
      const { error } = await supabase
        .from("responsibles")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) return { error: new Error(error.message) };
      setResponsibles((prev) => prev.filter((r) => r.id !== id));
      return { error: null };
    },
    [user]
  );

  return (
    <ResponsiblesContext.Provider
      value={{ responsibles, loading, addResponsible, updateResponsible, deleteResponsible, refetch: fetchResponsibles }}
    >
      {children}
    </ResponsiblesContext.Provider>
  );
}

export function useResponsibles() {
  const ctx = useContext(ResponsiblesContext);
  if (!ctx) throw new Error("useResponsibles must be used within a ResponsiblesProvider");
  return ctx;
}
