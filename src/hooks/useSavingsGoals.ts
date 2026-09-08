import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GoalMovement {
  id: string;
  goalId: string;
  type: "deposit" | "withdrawal";
  amount: number;
  date: string;
  note?: string | null;
}

export interface SavingsGoal {
  id: string;
  goalType: string;
  name: string;
  targetAmount: number;
  initialAmount: number;
  targetDate: string | null;
  color: string;
  icon: string;
  createdAt: string;
  movements: GoalMovement[];
}

export function goalSaved(goal: SavingsGoal) {
  return goal.movements.reduce(
    (sum, m) => sum + (m.type === "deposit" ? m.amount : -m.amount),
    goal.initialAmount
  );
}

export function goalProgress(goal: SavingsGoal) {
  if (goal.targetAmount <= 0) return 0;
  return Math.max(0, Math.min(100, (goalSaved(goal) / goal.targetAmount) * 100));
}

export function useSavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*, savings_goal_movements(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGoals(
        (data as any[]).map((g) => ({
          id: g.id,
          goalType: g.goal_type,
          name: g.name,
          targetAmount: Number(g.target_amount),
          initialAmount: Number(g.initial_amount),
          targetDate: g.target_date,
          color: g.color,
          icon: g.icon,
          createdAt: g.created_at,
          movements: (g.savings_goal_movements ?? [])
            .map((m: any) => ({
              id: m.id,
              goalId: m.goal_id,
              type: m.type === "withdrawal" ? "withdrawal" : "deposit",
              amount: Number(m.amount),
              date: m.movement_date,
              note: m.note,
            }))
            .sort((a: GoalMovement, b: GoalMovement) => (a.date < b.date ? 1 : -1)),
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(
    async (goal: {
      goalType: string;
      name: string;
      targetAmount: number;
      initialAmount: number;
      targetDate: string | null;
      color: string;
      icon: string;
    }) => {
      if (!user) return { error: new Error("No autenticado") };
      const { error } = await supabase.from("savings_goals").insert({
        user_id: user.id,
        goal_type: goal.goalType,
        name: goal.name,
        target_amount: goal.targetAmount,
        initial_amount: goal.initialAmount,
        target_date: goal.targetDate,
        color: goal.color,
        icon: goal.icon,
      });
      if (!error) await fetchGoals();
      return { error: error ? new Error(error.message) : null };
    },
    [user, fetchGoals]
  );

  const updateGoal = useCallback(
    async (
      id: string,
      updates: Partial<{
        goalType: string;
        name: string;
        targetAmount: number;
        targetDate: string | null;
        color: string;
        icon: string;
      }>
    ) => {
      if (!user) return { error: new Error("No autenticado") };
      const payload: Record<string, unknown> = {};
      if (updates.goalType !== undefined) payload.goal_type = updates.goalType;
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
      if (updates.targetDate !== undefined) payload.target_date = updates.targetDate;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.icon !== undefined) payload.icon = updates.icon;

      const { error } = await supabase
        .from("savings_goals")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id);
      if (!error) await fetchGoals();
      return { error: error ? new Error(error.message) : null };
    },
    [user, fetchGoals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!user) return { error: new Error("No autenticado") };
      const { error } = await supabase
        .from("savings_goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (!error) await fetchGoals();
      return { error: error ? new Error(error.message) : null };
    },
    [user, fetchGoals]
  );

  const addMovement = useCallback(
    async (movement: {
      goalId: string;
      type: "deposit" | "withdrawal";
      amount: number;
      date: string;
      note?: string;
    }) => {
      const { error } = await supabase.from("savings_goal_movements").insert({
        goal_id: movement.goalId,
        type: movement.type,
        amount: movement.amount,
        movement_date: movement.date,
        note: movement.note || null,
      });
      if (!error) await fetchGoals();
      return { error: error ? new Error(error.message) : null };
    },
    [fetchGoals]
  );

  const deleteMovement = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("savings_goal_movements").delete().eq("id", id);
      if (!error) await fetchGoals();
      return { error: error ? new Error(error.message) : null };
    },
    [fetchGoals]
  );

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    addMovement,
    deleteMovement,
    refetch: fetchGoals,
  };
}
