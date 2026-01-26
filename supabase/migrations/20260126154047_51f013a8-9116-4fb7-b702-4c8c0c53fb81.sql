-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  language TEXT DEFAULT 'es-ES',
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL DEFAULT '#26805D',
  icon TEXT NOT NULL DEFAULT 'Tag',
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#26805D',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_cards table
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  last_digits TEXT NOT NULL,
  credit_limit DECIMAL(15,2) NOT NULL DEFAULT 0,
  closing_day INTEGER NOT NULL DEFAULT 1,
  due_day INTEGER NOT NULL DEFAULT 10,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for categories
CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for subcategories (via category ownership)
CREATE POLICY "Users can view subcategories of own categories" ON public.subcategories FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.categories WHERE id = subcategories.category_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert subcategories to own categories" ON public.subcategories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.categories WHERE id = subcategories.category_id AND user_id = auth.uid()));
CREATE POLICY "Users can update subcategories of own categories" ON public.subcategories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.categories WHERE id = subcategories.category_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete subcategories of own categories" ON public.subcategories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.categories WHERE id = subcategories.category_id AND user_id = auth.uid()));

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view own accounts" ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for credit_cards
CREATE POLICY "Users can view own cards" ON public.credit_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cards" ON public.credit_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON public.credit_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cards" ON public.credit_cards FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();