import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BrandKit {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_style: string;
}

export const useBrandKit = () => {
  const { user } = useAuth();
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("brand_kits")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setBrandKit(data[0] as BrandKit);
        setLoading(false);
      });
  }, [user]);

  return { brandKit, loading };
};
