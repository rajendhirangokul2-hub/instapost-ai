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

    const systemPrompt = `You are a professional social media copywriter and designer. Generate social media post content with a CLEAN, WELL-STRUCTURED layout. Each section must be clearly separated — never mix content into one paragraph. You must respond using the generate_post tool.`;

    let shopContext = "";
    if (shop) {
      shopContext = `\n\nBUSINESS DETAILS (MUST incorporate into the post):\n- Business Name: ${shop.name}\n- Category: ${shop.category}\n- Address: ${shop.address || "N/A"}\n- Phone: ${shop.phone || "N/A"}\n\nIMPORTANT: Include the business name prominently. Put address and phone in the dedicated fields.\n\nBRAND COLORS:\n- Primary: ${shop.primaryColor}\n- Secondary: ${shop.secondaryColor}\n- Accent: ${shop.accentColor}\n- Background: ${shop.backgroundColor}\n- Text: ${shop.textColor}\n- Font Style: ${shop.fontStyle}\n\nUse these exact brand colors. bg = background color, text = text color, accent = accent color, ctaBg = primary color.`;
    }

    let brandContext = "";
    if (!shop && brandKit) {
      brandContext = `\n\nBRAND KIT COLORS:\n- Primary: ${brandKit.primaryColor}\n- Secondary: ${brandKit.secondaryColor}\n- Accent: ${brandKit.accentColor}\n- Background: ${brandKit.backgroundColor}\n- Text: ${brandKit.textColor}\n- Font Style: ${brandKit.fontStyle}\n- Brand Name: ${brandKit.name}\n\nUse these exact colors.`;
    }

    let themeContext = "";
    if (theme) {
      themeContext = `\n\nTHEME: "${theme.name}"\n- Suggested colors: bg=${theme.colors.bg}, text=${theme.colors.text}, accent=${theme.colors.accent}, ctaBg=${theme.colors.ctaBg}\n- Suggested font: ${theme.fontStyle}\n- Suggested layout: ${theme.layout}\n${shop ? "Blend the theme style with the brand colors — brand colors take priority but use the theme's aesthetic." : "Use these theme colors and style."}`;
    }

    const langInstruction = language && language !== "english"
      ? `\n\nIMPORTANT: Generate ALL text content (headline, subheadline, description, offer, CTA) in ${language.toUpperCase()}. The post must be written entirely in ${language}.`
      : "";

    const toneInstruction = tone
      ? `\n\nTONE: Write in a "${tone}" tone. ${tone === "formal" ? "Professional, corporate, trustworthy language." : tone === "fun" ? "Playful, energetic, casual and exciting language with emojis where appropriate." : tone === "premium" ? "Luxurious, exclusive, sophisticated language." : "Friendly, neighbourhood-style, relatable everyday language."}`
      : "";

    const userPrompt = `Generate a social media post for:
- Category: ${category}
- Template style: ${templateName}
- Keywords/Details: ${keywords || "general"}
${shopContext}${brandContext}${themeContext}${langInstruction}${toneInstruction}

STRICT FORMAT RULES:
1. HEADLINE: Big & catchy, maximum 6-8 words. Use newline characters for line breaks.
2. SUBHEADLINE: Short supporting line (1 short sentence). Optional but recommended.
3. DESCRIPTION: 1-2 short lines ONLY. Focus on value. Do NOT mix address/phone here.
4. OFFER: Clearly state discount or benefit if applicable (e.g. "Get Flat 50% OFF"). Leave empty string if no offer.
5. CTA: Short and strong call-to-action (e.g. "Register Now", "Order Today").
6. BUSINESS NAME: The shop/business name.${shop ? ` Use "${shop.name}".` : ""}
7. ADDRESS: Business address on its own.${shop?.address ? ` Use "${shop.address}".` : " Leave empty if unknown."}
8. PHONE: Business phone on its own.${shop?.phone ? ` Use "${shop.phone}".` : " Leave empty if unknown."}
9. QR_TEXT: A short line like "Scan QR to Register" or "Scan QR for Details". Always provide this.
10. Colors: hex codes for bg, text, accent, ctaBg.
11. Layout: "centered", "left-aligned", or "split".
12. Font style: ${shop ? `"${shop.fontStyle}"` : theme ? `"${theme.fontStyle}"` : '"bold", "elegant", "playful", "mono", or "serif"'}

CRITICAL: Keep each field separate. Do NOT merge address/phone into description. Keep it clean and poster-ready.`;

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
              description: "Generate a complete social media post with clearly separated content sections",
              parameters: {
                type: "object",
                properties: {
                  headline: { type: "string", description: "Big catchy headline, 6-8 words max. Use actual newline chars for line breaks." },
                  subheadline: { type: "string", description: "Short supporting line under the headline. 1 sentence max." },
                  subtext: { type: "string", description: "1-2 short description lines. Value-focused. Do NOT include address or phone here." },
                  offer: { type: "string", description: "Discount or benefit highlight, e.g. 'Get Flat 50% OFF'. Empty string if none." },
                  cta: { type: "string", description: "Short call-to-action button text" },
                  businessName: { type: "string", description: "The business/shop name" },
                  address: { type: "string", description: "Business address, standalone" },
                  phone: { type: "string", description: "Business phone number, standalone" },
                  qrText: { type: "string", description: "QR code instruction text, e.g. 'Scan QR to Register'" },
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
                required: ["headline", "subtext", "cta", "colors", "layout", "fontStyle", "subheadline", "offer", "businessName", "address", "phone", "qrText"],
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
