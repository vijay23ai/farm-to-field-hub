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
    const { question, location, crop, season, weather, language = "en" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageName = languageNames[language] || "English";

    const systemPrompt = `You are AgriPath AI, a LLaMA-powered smart farming assistant.

CRITICAL RULE:
The entire response must be in ${languageName} language ONLY.
Do NOT mix languages under any condition.
Use simple, farmer-friendly words suitable for rural users.

Your task:
- Answer the farmer's question clearly and accurately.
- Use simple, easy-to-understand language.
- Provide practical, step-by-step guidance.
- Avoid technical jargon.
- Focus on sustainable and cost-effective farming practices.
- Consider local conditions and practices in India.

If the question is unclear:
- Ask a short clarifying question before answering.

Always keep the response farmer-friendly and actionable.

Guidelines:
- Be encouraging and supportive
- Provide specific recommendations when possible
- Include safety precautions where relevant
- Mention government schemes if applicable
- Keep responses concise but complete
- RESPOND ONLY IN ${languageName.toUpperCase()} LANGUAGE.`;

    let contextInfo = "";
    if (location) contextInfo += `\n- Location: ${location}`;
    if (crop) contextInfo += `\n- Current Crop: ${crop}`;
    if (season) contextInfo += `\n- Season: ${season}`;
    if (weather) {
      contextInfo += `\n- Current Weather: ${weather.temperature}°C, ${weather.humidity}% humidity, ${weather.rainfall} rainfall, ${weather.forecast}`;
    }

    const userPrompt = `User Question:
${question}

Context (if available):${contextInfo || "\n- No additional context provided"}

Please provide a helpful, farmer-friendly response in ${languageName} language ONLY.`;

    console.log("Ask AI request:", { question, location, crop, season, hasWeather: !!weather, language });

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
    console.error("Ask AI error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
