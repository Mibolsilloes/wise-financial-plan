import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MonthlyPlanItem {
  id: string;
  categoryId: string;
  amount: number;
}

export interface MonthlyPlan {
  id: string;
  month: number; // 1-12
  year: number;
  income: number;
  savingsPercent: number;
  items: MonthlyPlanItem[];
}

export function useMonthlyPlan(month: number, year: number) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPlan = useCallback(async () => {
    if (!user) {
      setPlan(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("monthly_plans")
      .select("id, month, year, income, savings_percent, monthly_plan_items(id, category_id, amount)")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (error) {
      console.error("fetchMonthlyPlan error:", error);
      setPlan(null);
    } else if (!data) {
      setPlan(null);
    } else {
      setPlan({
        id: data.id,
        month: data.month,
        year: data.year,
        income: Number(data.income),
        savingsPercent: Number(data.savings_percent),
        items: (data.monthly_plan_items ?? []).map((i: { id: string; category_id: string; amount: number }) => ({
          id: i.id,
          categoryId: i.category_id,
          amount: Number(i.amount),
        })),
      });
    }
    setLoading(false);
  }, [user, month, year]);

  useEffect(() => {
    void fetchPlan();
  }, [fetchPlan]);

  const ensurePlan = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    if (plan) return plan.id;
    const { data, error } = await supabase
      .from("monthly_plans")
      .insert({ user_id: user.id, month, year, income: 0, savings_percent: 0 })
      .select("id")
      .single();
    if (error || !data) {
      console.error("createMonthlyPlan error:", error);
      return null;
    }
    setPlan({ id: data.id, month, year, income: 0, savingsPercent: 0, items: [] });
    return data.id;
  }, [user, plan, month, year]);

  const saveBasics = useCallback(
    async (income: number, savingsPercent: number) => {
      const id = await ensurePlan();
      if (!id) return { error: new Error("No se pudo crear el plan") };
      setSaving(true);
      const { error } = await supabase
        .from("monthly_plans")
        .update({ income, savings_percent: savingsPercent })
        .eq("id", id);
      setSaving(false);
      if (error) {
        console.error("saveBasics error:", error);
        return { error: error as Error };
      }
      setPlan((prev) => (prev ? { ...prev, income, savingsPercent } : prev));
      return { error: null };
    },
    [ensurePlan]
  );

  const upsertItem = useCallback(
    async (categoryId: string, amount: number) => {
      const id = await ensurePlan();
      if (!id) return { error: new Error("No se pudo crear el plan") };
      const { data, error } = await supabase
        .from("monthly_plan_items")
        .upsert({ plan_id: id, category_id: categoryId, amount }, { onConflict: "plan_id,category_id" })
        .select("id, category_id, amount")
        .single();
      if (error || !data) {
        console.error("upsertItem error:", error);
        return { error: (error as Error) ?? new Error("Error al guardar") };
      }
      setPlan((prev) => {
        if (!prev) return prev;
        const item = { id: data.id, categoryId: data.category_id, amount: Number(data.amount) };
        const exists = prev.items.some((i) => i.categoryId === categoryId);
        return {
          ...prev,
          items: exists
            ? prev.items.map((i) => (i.categoryId === categoryId ? item : i))
            : [...prev.items, item],
        };
      });
      return { error: null };
    },
    [ensurePlan]
  );

  const removeItem = useCallback(
    async (categoryId: string) => {
      if (!plan) return { error: null };
      const { error } = await supabase
        .from("monthly_plan_items")
        .delete()
        .eq("plan_id", plan.id)
        .eq("category_id", categoryId);
      if (error) {
        console.error("removeItem error:", error);
        return { error: error as Error };
      }
      setPlan((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.categoryId !== categoryId) } : prev
      );
      return { error: null };
    },
    [plan]
  );

  return { plan, loading, saving, saveBasics, upsertItem, removeItem, refetch: fetchPlan };
}
