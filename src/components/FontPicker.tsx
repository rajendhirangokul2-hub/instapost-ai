import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";

const fonts = [
  { value: "bold", label: "Bold", preview: "font-bold" },
  { value: "elegant", label: "Elegant", preview: "font-light tracking-tight" },
  { value: "playful", label: "Playful", preview: "font-semibold" },
  { value: "mono", label: "Mono", preview: "font-mono font-medium" },
  { value: "serif", label: "Serif", preview: "font-serif font-semibold" },
] as const;

export type FontStyle = (typeof fonts)[number]["value"];

interface Props {
  value: string;
  onChange: (value: FontStyle) => void;
}

const FontPicker = ({ value, onChange }: Props) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-secondary">
        <Type className="h-4 w-4" /> Font
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-44 p-2 space-y-1">
      {fonts.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            value === f.value ? "bg-primary/20 text-primary" : "hover:bg-secondary text-foreground"
          } ${f.preview}`}
          style={f.value === "serif" ? { fontFamily: "Georgia, serif" } : f.value === "mono" ? { fontFamily: "monospace" } : undefined}
        >
          {f.label}
        </button>
      ))}
    </PopoverContent>
  </Popover>
);

export default FontPicker;
