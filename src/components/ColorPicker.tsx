import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  colors: { bg: string; text: string; accent: string; ctaBg: string };
  onChange: (colors: Props["colors"]) => void;
}

const fields: { key: keyof Props["colors"]; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "text", label: "Text" },
  { key: "accent", label: "Accent" },
  { key: "ctaBg", label: "CTA Button" },
];

const ColorPicker = ({ colors, onChange }: Props) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-secondary">
        <Palette className="h-4 w-4" /> Colors
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-56 space-y-3">
      {fields.map((f) => (
        <div key={f.key} className="flex items-center gap-2">
          <input
            type="color"
            value={colors[f.key]}
            onChange={(e) => onChange({ ...colors, [f.key]: e.target.value })}
            className="h-7 w-7 cursor-pointer rounded border-none p-0"
          />
          <span className="text-xs text-muted-foreground flex-1">{f.label}</span>
          <Input
            value={colors[f.key]}
            onChange={(e) => onChange({ ...colors, [f.key]: e.target.value })}
            className="h-7 w-20 text-xs font-mono"
          />
        </div>
      ))}
    </PopoverContent>
  </Popover>
);

export default ColorPicker;
