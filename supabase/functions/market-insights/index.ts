import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const languageNames: Record<string, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  kn: "Kannada",
  mr: "Marathi",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crop, location, timeframe, language = "en" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageName = languageNames[language] || "English";

    const systemPrompt = `You are AgriPath AI, an agricultural market advisor powered by LLaMA.

CRITICAL INSTRUCTION:
The entire response must be in ${languageName} language ONLY.
Do NOT mix languages under any condition.
Use simple, farmer-friendly words suitable for rural users.

Input Context:
- Crop Name: ${crop}
- Location: ${location}
- Timeframe: ${timeframe || 'Current season'}

Your Tasks:
1. Analyze current market trends
2. Provide price ranges in Indian Rupees (₹)
3. Advise whether to sell now or wait
4. Suggest the best nearby mandis/markets
5. Give simple tips to maximize profit
6. Include storage recommendations
7. Mention transportation considerations

Guidelines:
- Use realistic price ranges based on typical Indian mandi rates
- Be helpful and practical
- Consider seasonal variations
- Include government MSP (Minimum Support Price) when applicable
- Suggest ways to get better prices
- RESPOND ONLY IN ${languageName.toUpperCase()} LANGUAGE.`;

    console.log("Market insights request:", { crop, location, timeframe, language });

    const userPrompt = `Provide market insights for:
- Crop Name: ${crop}
- Location/State: ${location}
- Timeframe: ${timeframe || 'Current season'}

Tasks:
1. Analyze current market trends
2. Advise whether to sell now or wait
3. Suggest the best nearby market/mandi
4. Give simple tips to maximize profit
5. Include storage and transportation recommendations

IMPORTANT: Respond ONLY in ${languageName} language.`;

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
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Market insights error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
