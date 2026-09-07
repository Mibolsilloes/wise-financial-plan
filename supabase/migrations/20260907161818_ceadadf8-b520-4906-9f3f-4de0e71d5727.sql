CREATE TABLE public.monthly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month smallint NOT NULL CHECK (month BETWEEN 1 AND 12),
  year smallint NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  income numeric NOT NULL DEFAULT 0 CHECK (income >= 0),
  savings_percent numeric NOT NULL DEFAULT 0 CHECK (savings_percent >= 0 AND savings_percent <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year, month)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_plans TO authenticated;
GRANT ALL ON public.monthly_plans TO service_role;

ALTER TABLE public.monthly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own monthly plans" ON public.monthly_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own monthly plans" ON public.monthly_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monthly plans" ON public.monthly_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own monthly plans" ON public.monthly_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_plans_updated_at
BEFORE UPDATE ON public.monthly_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.monthly_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.monthly_plans(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0 CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, category_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_plan_items TO authenticated;
GRANT ALL ON public.monthly_plan_items TO service_role;

ALTER TABLE public.monthly_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan items" ON public.monthly_plan_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.monthly_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert own plan items" ON public.monthly_plan_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.monthly_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update own plan items" ON public.monthly_plan_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.monthly_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.monthly_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete own plan items" ON public.monthly_plan_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.monthly_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()));

CREATE TRIGGER update_monthly_plan_items_updated_at
BEFORE UPDATE ON public.monthly_plan_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_monthly_plan_items_plan ON public.monthly_plan_items(plan_id);