import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Store, Plus, Trash2, ArrowLeft, Save, MapPin, Phone, Upload, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";

interface ShopForm {
  id?: string;
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

const emptyForm: ShopForm = {
  name: "", category: "general", address: "", phone: "", logo_url: null,
  primary_color: "#3B82F6", secondary_color: "#10B981", accent_color: "#8B5CF6",
  background_color: "#1a1a2e", text_color: "#FFFFFF", font_style: "bold", is_default: false,
};

const categories = [
  "general", "clothing", "food", "gym", "tech", "beauty", "education", "real-estate",
];

const fontOptions = [
  { value: "bold", label: "Bold" }, { value: "elegant", label: "Elegant" },
  { value: "playful", label: "Playful" }, { value: "mono", label: "Mono" }, { value: "serif", label: "Serif" },
];

const ShopsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<ShopForm[]>([]);
  const [active, setActive] = useState<ShopForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);
  useEffect(() => { if (user) fetchShops(); }, [user]);

  const fetchShops = async () => {
    const { data } = await supabase.from("shops").select("*").order("created_at");
    if (data) {
      const s = data as unknown as ShopForm[];
      setShops(s);
      if (s.length > 0 && !active.id) setActive(s[0]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("brand-logos").upload(path, file);
    if (!error) {
      const { data: u } = supabase.storage.from("brand-logos").getPublicUrl(path);
      setActive(a => ({ ...a, logo_url: u.publicUrl }));
      toast.success("Logo uploaded!");
    } else toast.error("Upload failed");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user || !active.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const payload = { ...active, user_id: user.id };
    delete (payload as any).id;

    if (active.id) {
      const { error } = await supabase.from("shops").update(payload as any).eq("id", active.id);
      if (error) toast.error("Failed to save"); else toast.success("Shop updated!");
    } else {
      const { error } = await supabase.from("shops").insert(payload as any);
      if (error) toast.error("Failed to create"); else toast.success("Shop created!");
    }
    await fetchShops();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("shops").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Shop deleted");
      if (active.id === id) setActive(emptyForm);
      fetchShops();
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">My Shops</h1>
            <p className="text-sm text-muted-foreground">Manage your business profiles</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full gap-2 border-border" onClick={() => setActive(emptyForm)}>
              <Plus className="h-4 w-4" /> New Shop
            </Button>
            {shops.map(s => (
              <div key={s.id} onClick={() => setActive(s)}
                className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors ${
                  active.id === s.id ? "bg-primary/10 border border-primary/30" : "glass hover:bg-secondary"
                }`}>
                <div className="flex items-center gap-3">
                  {s.logo_url ? <img src={s.logo_url} className="h-8 w-8 rounded object-contain" /> : <Store className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                    {s.is_default && <span className="ml-2 text-xs text-primary">Default</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={e => { e.stopPropagation(); handleDelete(s.id!); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" /> Business Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Shop Name *</Label>
                  <Input value={active.name} onChange={e => setActive(a => ({ ...a, name: e.target.value }))} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Category</Label>
                  <select value={active.category} onChange={e => setActive(a => ({ ...a, category: e.target.value }))}
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Address</Label>
                  <Input value={active.address} onChange={e => setActive(a => ({ ...a, address: e.target.value }))} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                  <Input value={active.phone} onChange={e => setActive(a => ({ ...a, phone: e.target.value }))} className="bg-secondary border-border" />
                </div>
              </div>
              {/* Logo */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Logo</Label>
                <div className="flex items-center gap-4">
                  {active.logo_url ? (
                    <img src={active.logo_url} className="h-14 w-14 rounded-lg border border-border object-contain p-1" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary border border-dashed border-border">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" disabled={uploading} asChild><span>{uploading ? "Uploading..." : "Upload"}</span></Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {active.logo_url && <Button variant="ghost" size="sm" onClick={() => setActive(a => ({ ...a, logo_url: null }))}>Remove</Button>}
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Palette className="h-5 w-5 text-accent" /> Brand Colors
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Primary", key: "primary_color" as const },
                  { label: "Secondary", key: "secondary_color" as const },
                  { label: "Accent", key: "accent_color" as const },
                  { label: "Background", key: "background_color" as const },
                  { label: "Text", key: "text_color" as const },
                ].map(c => (
                  <div key={c.key} className="space-y-2">
                    <Label className="text-muted-foreground">{c.label}</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={(active as any)[c.key]} onChange={e => setActive(a => ({ ...a, [c.key]: e.target.value }))}
                        className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent" />
                      <Input value={(active as any)[c.key]} onChange={e => setActive(a => ({ ...a, [c.key]: e.target.value }))}
                        className="bg-secondary border-border font-mono text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Font */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" /> Font Style
              </h2>
              <div className="flex flex-wrap gap-2">
                {fontOptions.map(f => (
                  <button key={f.value} onClick={() => setActive(a => ({ ...a, font_style: f.value }))}
                    className={`rounded-lg px-4 py-2 text-sm transition-all ${
                      active.font_style === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}>{f.label}</button>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving}
              className="w-full gap-2 bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 glow-primary">
              <Save className="h-5 w-5" /> {saving ? "Saving..." : active.id ? "Update Shop" : "Create Shop"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopsPage;
