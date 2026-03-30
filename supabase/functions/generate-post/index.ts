import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, keywords, templateName, brandKit } = await req.json();

    if (!category || !templateName) {
      return new Response(
        JSON.stringify({ error: "category and templateName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional social media copywriter and designer. Generate social media post content based on the given template category and keywords. You must respond using the generate_post tool.`;

    const userPrompt = `Generate a social media post for:
- Category: ${category}
- Template style: ${templateName}
- Keywords/Business: ${keywords || "general"}

Create compelling, professional content with:
1. A catchy headline (2-4 words per line, max 2 lines, use \\n for line break)
2. Supporting description text (1-2 sentences, engaging and action-oriented)
3. A clear call-to-action button text (short, compelling)
4. A color palette that matches the ${category} theme
5. Layout choice: "centered", "left-aligned", or "split"
6. Font style: "bold" (strong/impactful), "elegant" (refined/classy), or "playful" (fun/casual)

Make the content unique, professional, and ready to post. Colors should be hex codes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_post",
              description: "Generate a complete social media post with content and design",
              parameters: {
                type: "object",
                properties: {
                  headline: {
                    type: "string",
                    description: "Catchy headline, use \\n for line breaks",
                  },
                  subtext: {
                    type: "string",
                    description: "Supporting description, 1-2 sentences",
                  },
                  cta: {
                    type: "string",
                    description: "Call-to-action button text",
                  },
                  colors: {
                    type: "object",
                    properties: {
                      bg: { type: "string", description: "Background color hex" },
                      text: { type: "string", description: "Text color hex" },
                      accent: { type: "string", description: "Accent color hex" },
                      ctaBg: { type: "string", description: "CTA button background hex" },
                    },
                    required: ["bg", "text", "accent", "ctaBg"],
                  },
                  layout: {
                    type: "string",
                    enum: ["centered", "left-aligned", "split"],
                  },
                  fontStyle: {
                    type: "string",
                    enum: ["bold", "elegant", "playful"],
                  },
                },
                required: ["headline", "subtext", "cta", "colors", "layout", "fontStyle"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_post" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call in AI response");
    }

    const post = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(post), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-post error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
