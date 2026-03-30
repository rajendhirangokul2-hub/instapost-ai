import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Palette, Type, Upload, Save, Trash2, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";

interface BrandKit {
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

const fontOptions = [
  { value: "bold", label: "Bold", desc: "Strong & impactful" },
  { value: "elegant", label: "Elegant", desc: "Refined & classy" },
  { value: "playful", label: "Playful", desc: "Fun & casual" },
];

const BrandKitPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [activeKit, setActiveKit] = useState<BrandKit | null>(null);
  const [name, setName] = useState("My Brand");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");
  const [accentColor, setAccentColor] = useState("#8B5CF6");
  const [bgColor, setBgColor] = useState("#1a1a2e");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontStyle, setFontStyle] = useState("bold");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchKits();
  }, [user]);

  const fetchKits = async () => {
    const { data } = await supabase
      .from("brand_kits")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setKits(data as BrandKit[]);
      if (data.length > 0 && !activeKit) loadKit(data[0] as BrandKit);
    }
  };

  const loadKit = (kit: BrandKit) => {
    setActiveKit(kit);
    setName(kit.name);
    setPrimaryColor(kit.primary_color);
    setSecondaryColor(kit.secondary_color);
    setAccentColor(kit.accent_color);
    setBgColor(kit.background_color);
    setTextColor(kit.text_color);
    setFontStyle(kit.font_style);
    setLogoUrl(kit.logo_url);
  };

  const resetForm = () => {
    setActiveKit(null);
    setName("My Brand");
    setPrimaryColor("#3B82F6");
    setSecondaryColor("#10B981");
    setAccentColor("#8B5CF6");
    setBgColor("#1a1a2e");
    setTextColor("#FFFFFF");
    setFontStyle("bold");
    setLogoUrl(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("brand-logos").upload(path, file);
    if (error) {
      toast.error("Failed to upload logo");
    } else {
      const { data: urlData } = supabase.storage.from("brand-logos").getPublicUrl(path);
      setLogoUrl(urlData.publicUrl);
      toast.success("Logo uploaded!");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      name,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      background_color: bgColor,
      text_color: textColor,
      font_style: fontStyle,
    };

    if (activeKit) {
      const { error } = await supabase
        .from("brand_kits")
        .update(payload)
        .eq("id", activeKit.id);
      if (error) toast.error("Failed to save");
      else toast.success("Brand kit updated!");
    } else {
      const { error } = await supabase.from("brand_kits").insert(payload);
      if (error) toast.error("Failed to create brand kit");
      else toast.success("Brand kit created!");
    }
    await fetchKits();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("brand_kits").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Brand kit deleted");
      if (activeKit?.id === id) resetForm();
      fetchKits();
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Brand Kit
            </h1>
            <p className="text-sm text-muted-foreground">
              Save your brand identity for consistent post generation
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar: Kit list */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full gap-2 border-border text-foreground"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4" /> New Brand Kit
            </Button>
            {kits.map((kit) => (
              <motion.div
                key={kit.id}
                whileHover={{ scale: 1.02 }}
                className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors ${
                  activeKit?.id === kit.id
                    ? "bg-primary/10 border border-primary/30"
                    : "glass hover:bg-secondary"
                }`}
                onClick={() => loadKit(kit)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: kit.primary_color }} />
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: kit.secondary_color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{kit.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); handleDelete(kit.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Main editor */}
          <div className="space-y-8">
            {/* Brand name */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" /> Brand Identity
              </h2>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Brand Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" />
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Logo</Label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative h-16 w-16 rounded-lg bg-secondary overflow-hidden border border-border">
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary border border-dashed border-border">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" disabled={uploading} asChild>
                        <span>{uploading ? "Uploading..." : "Upload Logo"}</span>
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    {logoUrl && (
                      <Button variant="ghost" size="sm" className="ml-2 text-muted-foreground" onClick={() => setLogoUrl(null)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Palette className="h-5 w-5 text-accent" /> Brand Colors
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Primary", value: primaryColor, set: setPrimaryColor },
                  { label: "Secondary", value: secondaryColor, set: setSecondaryColor },
                  { label: "Accent", value: accentColor, set: setAccentColor },
                  { label: "Background", value: bgColor, set: setBgColor },
                  { label: "Text", value: textColor, set: setTextColor },
                ].map((c) => (
                  <div key={c.label} className="space-y-2">
                    <Label className="text-muted-foreground">{c.label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => c.set(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent"
                      />
                      <Input
                        value={c.value}
                        onChange={(e) => c.set(e.target.value)}
                        className="bg-secondary border-border font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Font style */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" /> Font Style
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {fontOptions.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFontStyle(f.value)}
                    className={`rounded-xl p-4 text-center transition-all ${
                      fontStyle === f.value
                        ? "bg-primary/10 border-2 border-primary/40"
                        : "bg-secondary border-2 border-transparent hover:border-border"
                    }`}
                  >
                    <div className="font-display text-sm font-semibold text-foreground">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Preview</h2>
              <div
                className="relative overflow-hidden rounded-xl p-8 flex flex-col items-center justify-center gap-3 aspect-square max-w-sm mx-auto"
                style={{ backgroundColor: bgColor }}
              >
                <div className="absolute top-0 left-0 h-1.5 w-full" style={{ backgroundColor: accentColor }} />
                {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 w-12 object-contain" />}
                <h3
                  className={`text-xl text-center ${
                    fontStyle === "bold" ? "font-bold" : fontStyle === "elegant" ? "font-light tracking-tight" : "font-semibold"
                  }`}
                  style={{ color: textColor, fontFamily: fontStyle === "elegant" ? "'Space Grotesk'" : "inherit" }}
                >
                  {name || "Your Brand"}
                </h3>
                <p className="text-sm opacity-70 text-center" style={{ color: textColor }}>
                  Your tagline goes here
                </p>
                <button
                  className="mt-2 rounded-lg px-5 py-2 text-sm font-bold uppercase tracking-wide"
                  style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
                >
                  Learn More
                </button>
                <div className="absolute bottom-2 flex gap-2">
                  {[primaryColor, secondaryColor, accentColor].map((c, i) => (
                    <div key={i} className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Save */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full gap-2 bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 glow-primary"
              >
                <Save className="h-5 w-5" />
                {saving ? "Saving..." : activeKit ? "Update Brand Kit" : "Save Brand Kit"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandKitPage;
