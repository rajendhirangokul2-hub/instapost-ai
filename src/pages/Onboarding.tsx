import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = [
  { value: "clothing", label: "👗 Clothing" },
  { value: "food", label: "🍕 Food & Restaurant" },
  { value: "gym", label: "💪 Gym & Fitness" },
  { value: "tech", label: "💻 Tech & Software" },
  { value: "beauty", label: "💅 Beauty & Salon" },
  { value: "education", label: "📚 Education" },
  { value: "real-estate", label: "🏠 Real Estate" },
  { value: "general", label: "🏢 General Business" },
];

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [accentColor, setAccentColor] = useState("#8B5CF6");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleFinish = async () => {
    if (!user || !name.trim()) { toast.error("Enter a business name"); return; }
    setSaving(true);
    const { error } = await supabase.from("shops").insert({
      user_id: user.id,
      name: name.trim(),
      category,
      address: address.trim(),
      phone: phone.trim(),
      logo_url: logoUrl,
      primary_color: primaryColor,
      accent_color: accentColor,
      is_default: true,
    } as any);
    if (error) {
      toast.error("Failed to create business profile");
    } else {
      toast.success("Business profile created!");
      navigate("/");
    }
    setSaving(false);
  };

  const steps = [
    // Step 0: Business basics
    <div key="basics" className="space-y-5">
      <h2 className="font-display text-xl font-semibold text-foreground">Tell us about your business</h2>
      <div className="space-y-2">
        <Label className="text-muted-foreground">Business / Shop Name *</Label>
        <div className="relative">
          <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunrise Café" className="bg-secondary border-border pl-10" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground">Category</Label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`rounded-lg px-3 py-2.5 text-sm text-left transition-all ${
                category === c.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 1: Contact
    <div key="contact" className="space-y-5">
      <h2 className="font-display text-xl font-semibold text-foreground">Contact & Location</h2>
      <div className="space-y-2">
        <Label className="text-muted-foreground">Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street, City" className="bg-secondary border-border pl-10" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="bg-secondary border-border pl-10" />
        </div>
      </div>
    </div>,

    // Step 2: Branding
    <div key="branding" className="space-y-5">
      <h2 className="font-display text-xl font-semibold text-foreground">Brand Identity (Optional)</h2>
      <div className="space-y-2">
        <Label className="text-muted-foreground">Logo</Label>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden border border-border">
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary border border-dashed border-border">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <span>{uploading ? "Uploading..." : "Upload Logo"}</span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Primary Color</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent" />
            <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="bg-secondary border-border font-mono text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Accent Color</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent" />
            <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="bg-secondary border-border font-mono text-sm" />
          </div>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome to Post<span className="text-primary">AI</span> 🎉</h1>
          <p className="mt-2 text-sm text-muted-foreground">Set up your first business in 3 quick steps</p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {steps[step]}
          </motion.div>

          <div className="mt-6 flex justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-muted-foreground">Back</Button>
            ) : (
              <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">Skip</Button>
            )}
            {step < 2 ? (
              <Button onClick={() => { if (step === 0 && !name.trim()) { toast.error("Enter a name"); return; } setStep(s => s + 1); }} className="gap-2 bg-primary text-primary-foreground">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
                {saving ? "Creating..." : "Finish Setup"} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
