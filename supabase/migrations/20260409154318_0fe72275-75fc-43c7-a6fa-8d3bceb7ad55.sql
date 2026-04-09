
-- Create shops table for multiple business profiles
CREATE TABLE public.shops (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'My Business',
  category text NOT NULL DEFAULT 'general',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  logo_url text,
  primary_color text NOT NULL DEFAULT '#3B82F6',
  secondary_color text NOT NULL DEFAULT '#10B981',
  accent_color text NOT NULL DEFAULT '#8B5CF6',
  background_color text NOT NULL DEFAULT '#1a1a2e',
  text_color text NOT NULL DEFAULT '#FFFFFF',
  font_style text NOT NULL DEFAULT 'bold',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own shops" ON public.shops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own shops" ON public.shops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shops" ON public.shops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shops" ON public.shops FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
