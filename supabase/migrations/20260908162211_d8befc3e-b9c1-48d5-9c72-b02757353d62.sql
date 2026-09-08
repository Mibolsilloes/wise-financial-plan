CREATE TABLE public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  debt_type text NOT NULL DEFAULT 'otra',
  principal numeric NOT NULL DEFAULT 0,
  annual_rate numeric NOT NULL DEFAULT 0,
  installments integer NOT NULL DEFAULT 0,
  installment_amount numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  initial_paid numeric NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#26805D',
  icon text NOT NULL DEFAULT 'Landmark',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO authenticated;
GRANT ALL ON public.debts TO service_role;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debts" ON public.debts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own debts" ON public.debts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own debts" ON public.debts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own debts" ON public.debts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.debt_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id uuid NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL DEFAULT 0,
  principal_part numeric NOT NULL DEFAULT 0,
  interest_part numeric NOT NULL DEFAULT 0,
  installment_number integer,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debt_payments TO authenticated;
GRANT ALL ON public.debt_payments TO service_role;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debt payments" ON public.debt_payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.debts d WHERE d.id = debt_payments.debt_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can insert own debt payments" ON public.debt_payments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.debts d WHERE d.id = debt_payments.debt_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can update own debt payments" ON public.debt_payments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.debts d WHERE d.id = debt_payments.debt_id AND d.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.debts d WHERE d.id = debt_payments.debt_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can delete own debt payments" ON public.debt_payments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.debts d WHERE d.id = debt_payments.debt_id AND d.user_id = auth.uid()));

CREATE INDEX idx_debts_user ON public.debts(user_id);
CREATE INDEX idx_debt_payments_debt ON public.debt_payments(debt_id);