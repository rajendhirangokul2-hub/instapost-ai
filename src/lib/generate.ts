import { GeneratedPost, Template } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { Shop } from "@/hooks/useShops";
import { PostTheme } from "@/lib/themes";

export async function generatePost(
  template: Template,
  keywords: string,
  shop?: Shop,
  theme?: PostTheme,
  language: string = "english",
  tone: string = "formal",
): Promise<GeneratedPost> {
  const { data, error } = await supabase.functions.invoke("generate-post", {
    body: {
      category: template.category,
      keywords,
      templateName: template.name,
      language,
      tone,
      shop: shop
        ? {
            name: shop.name,
            category: shop.category,
            address: shop.address,
            phone: shop.phone,
            primaryColor: shop.primary_color,
            secondaryColor: shop.secondary_color,
            accentColor: shop.accent_color,
            backgroundColor: shop.background_color,
            textColor: shop.text_color,
            fontStyle: shop.font_style,
          }
        : undefined,
      theme: theme
        ? {
            name: theme.name,
            colors: theme.colors,
            fontStyle: theme.fontStyle,
            layout: theme.layout,
          }
        : undefined,
    },
  });

  if (error) {
    console.error("Generation error:", error);
    throw new Error(error.message || "Failed to generate post");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as GeneratedPost;
}
