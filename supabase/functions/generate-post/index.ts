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
    const { category, keywords, templateName, shop, theme, brandKit, language, tone } = await req.json();

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

    const systemPrompt = `You are a professional social media copywriter and designer. Generate social media post content based on the given template category, business details, and keywords. You must respond using the generate_post tool.`;

    // Build context from shop details (smart placeholders)
    let shopContext = "";
    if (shop) {
      shopContext = `\n\nBUSINESS DETAILS (MUST incorporate into the post):\n- Business Name: ${shop.name}\n- Category: ${shop.category}\n- Address: ${shop.address || "N/A"}\n- Phone: ${shop.phone || "N/A"}\n\nIMPORTANT: Include the business name prominently in the headline or subtext. If address and phone are provided, include them in the subtext naturally.\n\nBRAND COLORS:\n- Primary: ${shop.primaryColor}\n- Secondary: ${shop.secondaryColor}\n- Accent: ${shop.accentColor}\n- Background: ${shop.backgroundColor}\n- Text: ${shop.textColor}\n- Font Style: ${shop.fontStyle}\n\nUse these exact brand colors. bg = background color, text = text color, accent = accent color, ctaBg = primary color.`;
    }

    // Legacy brand kit support
    let brandContext = "";
    if (!shop && brandKit) {
      brandContext = `\n\nBRAND KIT COLORS:\n- Primary: ${brandKit.primaryColor}\n- Secondary: ${brandKit.secondaryColor}\n- Accent: ${brandKit.accentColor}\n- Background: ${brandKit.backgroundColor}\n- Text: ${brandKit.textColor}\n- Font Style: ${brandKit.fontStyle}\n- Brand Name: ${brandKit.name}\n\nUse these exact colors.`;
    }

    // Theme context
    let themeContext = "";
    if (theme) {
      themeContext = `\n\nTHEME: "${theme.name}"\n- Suggested colors: bg=${theme.colors.bg}, text=${theme.colors.text}, accent=${theme.colors.accent}, ctaBg=${theme.colors.ctaBg}\n- Suggested font: ${theme.fontStyle}\n- Suggested layout: ${theme.layout}\n${shop ? "Blend the theme style with the brand colors — brand colors take priority but use the theme's aesthetic." : "Use these theme colors and style."}`;
    }

    const langInstruction = language && language !== "english"
      ? `\n\nIMPORTANT: Generate ALL text content (headline, subtext, CTA) in ${language.toUpperCase()}. The post must be written entirely in ${language}.`
      : "";

    const toneInstruction = tone
      ? `\n\nTONE: Write in a "${tone}" tone. ${tone === "formal" ? "Professional, corporate, trustworthy language." : tone === "fun" ? "Playful, energetic, casual and exciting language with emojis where appropriate." : tone === "premium" ? "Luxurious, exclusive, sophisticated language." : "Friendly, neighbourhood-style, relatable everyday language."}`
      : "";

    const userPrompt = `Generate a social media post for:
- Category: ${category}
- Template style: ${templateName}
- Keywords/Details: ${keywords || "general"}
${shopContext}${brandContext}${themeContext}${langInstruction}${toneInstruction}

Create compelling, professional content with:
1. A catchy headline (2-4 words per line, max 2 lines, use actual newline characters for line breaks)
2. Supporting description text (1-2 sentences, engaging and action-oriented)${shop?.address || shop?.phone ? " Include business contact info naturally." : ""}
3. A clear call-to-action button text (short, compelling)
4. A color palette${shop ? " using the brand colors" : theme ? " using the theme colors" : ` matching the ${category} theme`}
5. Layout choice: "centered", "left-aligned", or "split"
6. Font style: ${shop ? `"${shop.fontStyle}" (brand preference)` : theme ? `"${theme.fontStyle}" (theme preference)` : '"bold", "elegant", "playful", "mono", or "serif"'}

IMPORTANT: For the headline, use actual newline characters (not the literal text "\\n") if you want line breaks.

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
                  headline: { type: "string", description: "Catchy headline. Use actual newline characters for line breaks, not literal backslash-n." },
                  subtext: { type: "string", description: "Supporting description, 1-2 sentences. Include business address/phone if provided." },
                  cta: { type: "string", description: "Call-to-action button text" },
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
                  layout: { type: "string", enum: ["centered", "left-aligned", "split"] },
                  fontStyle: { type: "string", enum: ["bold", "elegant", "playful", "mono", "serif"] },
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

    // Fix literal \n in headline
    if (post.headline) {
      post.headline = post.headline.replace(/\\n/g, "\n");
    }

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
