import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Shop {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_style: string;
  is_default: boolean;
}

export const useShops = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShops = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("shops")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });
    if (data) {
      const typed = data as unknown as Shop[];
      setShops(typed);
      if (!activeShop && typed.length > 0) {
        setActiveShop(typed.find(s => s.is_default) || typed[0]);
      }
    }
    setLoading(false);
  }, [user, activeShop]);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const selectShop = (shop: Shop) => setActiveShop(shop);

  return { shops, activeShop, selectShop, loading, refetch: fetchShops };
};
