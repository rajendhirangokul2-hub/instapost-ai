import { GeneratedPost, Template } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { BrandKit } from "@/hooks/useBrandKit";

export async function generatePost(
  template: Template,
  keywords: string,
  brandKit?: BrandKit
): Promise<GeneratedPost> {
  const { data, error } = await supabase.functions.invoke("generate-post", {
    body: {
      category: template.category,
      keywords,
      templateName: template.name,
      brandKit: brandKit
        ? {
            name: brandKit.name,
            primaryColor: brandKit.primary_color,
            secondaryColor: brandKit.secondary_color,
            accentColor: brandKit.accent_color,
            backgroundColor: brandKit.background_color,
            textColor: brandKit.text_color,
            fontStyle: brandKit.font_style,
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
