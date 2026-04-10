import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default ThemeToggle;
