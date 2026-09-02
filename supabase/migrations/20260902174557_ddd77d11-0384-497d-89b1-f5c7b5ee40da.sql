ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'corriente';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  INSERT INTO public.categories (user_id, name, type, color, icon, position)
  VALUES
    (NEW.id, 'Salario', 'income', '#22C55E', 'Wallet', 0),
    (NEW.id, 'Vivienda', 'expense', '#3B82F6', 'Home', 1),
    (NEW.id, 'Alimentación', 'expense', '#F59E0B', 'ShoppingCart', 2),
    (NEW.id, 'Transporte', 'expense', '#8B5CF6', 'Car', 3),
    (NEW.id, 'Salud y bienestar', 'expense', '#EC4899', 'Heart', 4),
    (NEW.id, 'Ocio y cultura', 'expense', '#06B6D4', 'Music', 5),
    (NEW.id, 'Compras', 'expense', '#F97316', 'ShoppingBag', 6);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;