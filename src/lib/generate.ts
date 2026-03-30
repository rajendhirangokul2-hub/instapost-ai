import { GeneratedPost, Template } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";

export async function generatePost(template: Template, keywords: string): Promise<GeneratedPost> {
  const { data, error } = await supabase.functions.invoke("generate-post", {
    body: {
      category: template.category,
      keywords,
      templateName: template.name,
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
