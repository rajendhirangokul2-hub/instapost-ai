import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialFormat, Template } from "@/types/post";
import { Shop } from "@/hooks/useShops";
import ShopSwitcher from "@/components/ShopSwitcher";
import ThemePicker from "@/components/ThemePicker";
import { PostTheme } from "@/lib/themes";
import VoiceInput from "@/components/VoiceInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  language: string;
  onLanguageChange: (lang: string) => void;
  showQr: boolean;
  onShowQrChange: (v: boolean) => void;
}

const languages = [
  { value: "english", label: "🇬🇧 English" },
  { value: "tamil", label: "🇮🇳 Tamil" },
  { value: "hindi", label: "🇮🇳 Hindi" },
  { value: "spanish", label: "🇪🇸 Spanish" },
  { value: "french", label: "🇫🇷 French" },
  { value: "arabic", label: "🇸🇦 Arabic" },
  { value: "telugu", label: "🇮🇳 Telugu" },
  { value: "kannada", label: "🇮🇳 Kannada" },
];

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
  language, onLanguageChange,
  showQr, onShowQrChange,
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
      <div className="flex gap-2">
        <Input
          placeholder="e.g. 50% off summer sale, New menu..."
          value={keywords}
          onChange={(e) => onKeywordsChange(e.target.value)}
          className="bg-secondary border-border"
        />
        <VoiceInput onTranscript={(t) => onKeywordsChange(keywords ? `${keywords}, ${t}` : t)} />
      </div>
    </div>

    {/* Language */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Language</label>
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="bg-secondary border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((l) => (
            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* QR Code toggle */}
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={showQr}
        onChange={(e) => onShowQrChange(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      <span className="text-sm font-medium text-muted-foreground">Include QR code in post</span>
    </label>
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
