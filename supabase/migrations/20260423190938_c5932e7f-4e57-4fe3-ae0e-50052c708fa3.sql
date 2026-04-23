-- 1. Add plan column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free'
CHECK (plan IN ('free', 'premium'));

-- 2. Helper function to get a user's plan
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT plan FROM public.profiles WHERE user_id = _user_id LIMIT 1), 'free');
$$;

-- 3. Enforce bank_accounts limit (free = 2)
CREATE OR REPLACE FUNCTION public.enforce_bank_accounts_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_user_plan(NEW.user_id) = 'free' THEN
    IF (SELECT COUNT(*) FROM public.bank_accounts WHERE user_id = NEW.user_id) >= 2 THEN
      RAISE EXCEPTION 'PLAN_LIMIT_BANK_ACCOUNTS: El plan Gratuito permite máximo 2 cuentas bancarias. Mejora a Premium para cuentas ilimitadas.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_bank_accounts_limit ON public.bank_accounts;
CREATE TRIGGER trg_enforce_bank_accounts_limit
BEFORE INSERT ON public.bank_accounts
FOR EACH ROW EXECUTE FUNCTION public.enforce_bank_accounts_limit();

-- 4. Enforce credit_cards limit (free = 1)
CREATE OR REPLACE FUNCTION public.enforce_credit_cards_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_user_plan(NEW.user_id) = 'free' THEN
    IF (SELECT COUNT(*) FROM public.credit_cards WHERE user_id = NEW.user_id) >= 1 THEN
      RAISE EXCEPTION 'PLAN_LIMIT_CREDIT_CARDS: El plan Gratuito permite máximo 1 tarjeta de crédito. Mejora a Premium para tarjetas ilimitadas.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_credit_cards_limit ON public.credit_cards;
CREATE TRIGGER trg_enforce_credit_cards_limit
BEFORE INSERT ON public.credit_cards
FOR EACH ROW EXECUTE FUNCTION public.enforce_credit_cards_limit();

-- 5. Enforce transactions limit (free = 50/mes calendario, basado en created_at)
CREATE OR REPLACE FUNCTION public.enforce_transactions_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_user_plan(NEW.user_id) = 'free' THEN
    IF (
      SELECT COUNT(*) FROM public.transactions
      WHERE user_id = NEW.user_id
        AND created_at >= date_trunc('month', now())
        AND created_at <  date_trunc('month', now()) + interval '1 month'
    ) >= 50 THEN
      RAISE EXCEPTION 'PLAN_LIMIT_TRANSACTIONS: El plan Gratuito permite máximo 50 transacciones por mes. Mejora a Premium para transacciones ilimitadas.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_transactions_limit ON public.transactions;
CREATE TRIGGER trg_enforce_transactions_limit
BEFORE INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_transactions_limit();