import { themes, PostTheme } from "@/lib/themes";

interface Props {
  selected: string | null;
  onSelect: (theme: PostTheme) => void;
}

const ThemePicker = ({ selected, onSelect }: Props) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-muted-foreground">Theme</label>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {themes.map(t => (
        <button key={t.id} onClick={() => onSelect(t)}
          className={`flex flex-col items-center gap-1 rounded-lg p-3 text-center transition-all ${
            selected === t.id ? "bg-primary/10 ring-2 ring-primary/40" : "bg-secondary hover:bg-secondary/80"
          }`}>
          <span className="text-lg">{t.preview}</span>
          <span className="text-xs font-medium text-foreground">{t.name}</span>
        </button>
      ))}
    </div>
  </div>
);

export default ThemePicker;
