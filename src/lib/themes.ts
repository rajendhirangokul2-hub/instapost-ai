export interface PostTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    bg: string;
    text: string;
    accent: string;
    ctaBg: string;
  };
  fontStyle: string;
  layout: string;
}

export const themes: PostTheme[] = [
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    description: "Vibrant gradients with clean typography",
    preview: "🌈",
    colors: { bg: "#1a1a2e", text: "#FFFFFF", accent: "#e94560", ctaBg: "#e94560" },
    fontStyle: "bold",
    layout: "centered",
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "White space, thin fonts, subtle palette",
    preview: "🤍",
    colors: { bg: "#FAFAFA", text: "#1a1a1a", accent: "#2563EB", ctaBg: "#1a1a1a" },
    fontStyle: "elegant",
    layout: "left-aligned",
  },
  {
    id: "bold-marketing",
    name: "Bold Marketing",
    description: "High contrast, large text, strong CTAs",
    preview: "🔥",
    colors: { bg: "#FF6B00", text: "#FFFFFF", accent: "#FFD600", ctaBg: "#1a1a1a" },
    fontStyle: "bold",
    layout: "centered",
  },
  {
    id: "luxury-dark",
    name: "Luxury Dark",
    description: "Dark elegance with gold accents",
    preview: "✨",
    colors: { bg: "#0D0D0D", text: "#F5E6CC", accent: "#C9A84C", ctaBg: "#C9A84C" },
    fontStyle: "serif",
    layout: "centered",
  },
  {
    id: "festival",
    name: "Festival Theme",
    description: "Bright colors, playful and festive",
    preview: "🎉",
    colors: { bg: "#FFF1F2", text: "#1a1a1a", accent: "#E11D48", ctaBg: "#7C3AED" },
    fontStyle: "playful",
    layout: "centered",
  },
];
