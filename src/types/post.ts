export type TemplateCategory = "business" | "sale" | "event" | "education" | "food" | "fitness" | "offer" | "opening" | "festival";
export type SocialFormat = "instagram" | "linkedin" | "twitter";

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  preview: string;
  description: string;
}

export interface GeneratedPost {
  headline: string;
  subtext: string;
  cta: string;
  colors: {
    bg: string;
    text: string;
    accent: string;
    ctaBg: string;
  };
  layout: "centered" | "left-aligned" | "split";
  fontStyle: "bold" | "elegant" | "playful" | "mono" | "serif";
}

export interface PostState {
  template: Template | null;
  format: SocialFormat;
  keywords: string;
  businessType: string;
  generated: GeneratedPost | null;
  isGenerating: boolean;
}
