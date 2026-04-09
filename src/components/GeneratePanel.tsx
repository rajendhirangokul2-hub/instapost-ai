import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialFormat, Template } from "@/types/post";
import { Shop } from "@/hooks/useShops";
import ShopSwitcher from "@/components/ShopSwitcher";
import ThemePicker from "@/components/ThemePicker";
import { PostTheme } from "@/lib/themes";

interface Props {
  template: Template | null;
  keywords: string;
  onKeywordsChange: (v: string) => void;
  format: SocialFormat;
  onFormatChange: (f: SocialFormat) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasGenerated: boolean;
  shops: Shop[];
  activeShop: Shop | null;
  onShopSelect: (shop: Shop) => void;
  selectedTheme: string | null;
  onThemeSelect: (theme: PostTheme) => void;
}

const formats: { value: SocialFormat; label: string; size: string }[] = [
  { value: "instagram", label: "Instagram", size: "1080×1080" },
  { value: "linkedin", label: "LinkedIn", size: "1200×627" },
  { value: "twitter", label: "Twitter/X", size: "1200×675" },
];

const GeneratePanel = ({
  template, keywords, onKeywordsChange, format, onFormatChange,
  onGenerate, isGenerating, hasGenerated,
  shops, activeShop, onShopSelect,
  selectedTheme, onThemeSelect,
}: Props) => (
  <div className="space-y-5">
    <h2 className="font-display text-lg font-semibold text-foreground">Configure</h2>

    {/* Shop Switcher */}
    {shops.length > 0 && (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Business Profile</label>
        <ShopSwitcher shops={shops} activeShop={activeShop} onSelect={onShopSelect} />
        {activeShop && (
          <p className="text-xs text-muted-foreground">
            📍 {activeShop.address || "No address"} · 📞 {activeShop.phone || "No phone"}
          </p>
        )}
      </div>
    )}

    {/* Keywords */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Keywords / Offer Details</label>
      <Input
        placeholder="e.g. 50% off summer sale, New menu..."
        value={keywords}
        onChange={(e) => onKeywordsChange(e.target.value)}
        className="bg-secondary border-border"
      />
    </div>

    {/* Theme */}
    <ThemePicker selected={selectedTheme} onSelect={onThemeSelect} />

    {/* Format */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Social Format</label>
      <div className="grid grid-cols-3 gap-2">
        {formats.map((f) => (
          <button
            key={f.value}
            onClick={() => onFormatChange(f.value)}
            className={`rounded-lg px-3 py-2 text-center text-sm transition-all ${
              format === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <div className="font-medium">{f.label}</div>
            <div className="text-xs opacity-70">{f.size}</div>
          </button>
        ))}
      </div>
    </div>

    {/* Generate Button */}
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={onGenerate}
        disabled={!template || isGenerating}
        className="w-full gap-2 bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 glow-primary"
      >
        {isGenerating ? (
          <><RefreshCw className="h-5 w-5 animate-spin" /> Generating...</>
        ) : hasGenerated ? (
          <><RefreshCw className="h-5 w-5" /> Regenerate Post</>
        ) : (
          <><Sparkles className="h-5 w-5" /> Generate Post</>
        )}
      </Button>
    </motion.div>

    {!template && (
      <p className="text-center text-sm text-muted-foreground">Select a template to get started</p>
    )}
  </div>
);

export default GeneratePanel;
