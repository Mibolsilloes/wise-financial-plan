CREATE TABLE public.savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL DEFAULT 'otro',
  name text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  initial_amount numeric NOT NULL DEFAULT 0,
  target_date date,
  color text NOT NULL DEFAULT '#26805D',
  icon text NOT NULL DEFAULT 'Target',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_goals TO authenticated;
GRANT ALL ON public.savings_goals TO service_role;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings goals" ON public.savings_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings goals" ON public.savings_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings goals" ON public.savings_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings goals" ON public.savings_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.savings_goal_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'deposit',
  amount numeric NOT NULL DEFAULT 0,
  movement_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_goal_movements TO authenticated;
GRANT ALL ON public.savings_goal_movements TO service_role;
ALTER TABLE public.savings_goal_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal movements" ON public.savings_goal_movements FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.savings_goals g WHERE g.id = savings_goal_movements.goal_id AND g.user_id = auth.uid()));
CREATE POLICY "Users can insert own goal movements" ON public.savings_goal_movements FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.savings_goals g WHERE g.id = savings_goal_movements.goal_id AND g.user_id = auth.uid()));
CREATE POLICY "Users can update own goal movements" ON public.savings_goal_movements FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.savings_goals g WHERE g.id = savings_goal_movements.goal_id AND g.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.savings_goals g WHERE g.id = savings_goal_movements.goal_id AND g.user_id = auth.uid()));
CREATE POLICY "Users can delete own goal movements" ON public.savings_goal_movements FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.savings_goals g WHERE g.id = savings_goal_movements.goal_id AND g.user_id = auth.uid()));

CREATE INDEX idx_savings_goal_movements_goal ON public.savings_goal_movements(goal_id);