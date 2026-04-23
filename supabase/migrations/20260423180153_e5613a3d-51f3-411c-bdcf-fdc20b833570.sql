
CREATE TABLE public.responsibles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#26805D',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.responsibles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own responsibles"
  ON public.responsibles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responsibles"
  ON public.responsibles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responsibles"
  ON public.responsibles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own responsibles"
  ON public.responsibles FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_responsibles_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.responsibles WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Solo se permiten hasta 3 responsables por usuario';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER responsibles_limit_trigger
  BEFORE INSERT ON public.responsibles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_responsibles_limit();
