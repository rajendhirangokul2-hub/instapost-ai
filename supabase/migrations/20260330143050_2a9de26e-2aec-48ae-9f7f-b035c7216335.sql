
-- Brand kits table
CREATE TABLE public.brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Brand',
  logo_url text,
  primary_color text NOT NULL DEFAULT '#3B82F6',
  secondary_color text NOT NULL DEFAULT '#10B981',
  accent_color text NOT NULL DEFAULT '#8B5CF6',
  background_color text NOT NULL DEFAULT '#1a1a2e',
  text_color text NOT NULL DEFAULT '#FFFFFF',
  font_style text NOT NULL DEFAULT 'bold',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand kits" ON public.brand_kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own brand kits" ON public.brand_kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand kits" ON public.brand_kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand kits" ON public.brand_kits FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON public.brand_kits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);

CREATE POLICY "Users can upload own logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own logos" ON storage.objects FOR SELECT USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own logos" ON storage.objects FOR DELETE USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view brand logos" ON storage.objects FOR SELECT USING (bucket_id = 'brand-logos');
