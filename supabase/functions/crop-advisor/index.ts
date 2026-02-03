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
    const { soilType, climate, location, waterAvailability, farmSize, weather, coordinates, language = "en" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageName = languageNames[language] || "English";

    const systemPrompt = `You are AgriPath AI, a LLaMA-powered smart farming assistant.

CRITICAL INSTRUCTION:
The entire response must be in ${languageName} language ONLY.
Do NOT mix languages under any condition.
Use simple, farmer-friendly words suitable for rural users.

Your tasks:
1. Analyze the farm and weather conditions.
2. Recommend the top 2–3 most suitable crops.
3. Explain clearly why each crop is suitable.
4. Select the best crop and recommend it.

For the selected crop, provide complete guidance covering:
- Seed variety and quality
- Land preparation
- Sowing method and timing
- Irrigation schedule
- Fertilizer plan
- Pest and disease prevention
- Harvesting time
- Storage practices
- Market selling strategy

Guidelines:
- Use simple, farmer-friendly language.
- Avoid technical jargon.
- Focus on cost-effective and sustainable practices.
- Consider local farming practices in India.
- Be encouraging and supportive of farmers.
- RESPOND ONLY IN ${languageName.toUpperCase()} LANGUAGE.`;

    let weatherContext = "";
    if (weather) {
      weatherContext = `
Weather Data:
- Temperature: ${weather.temperature} °C
- Humidity: ${weather.humidity} %
- Rainfall: ${weather.rainfall}
- Weather Forecast: ${weather.forecast}`;
    }

    let coordContext = "";
    if (coordinates) {
      coordContext = `
- Latitude: ${coordinates.latitude}
- Longitude: ${coordinates.longitude}`;
    }

    const userPrompt = `Farmer Context:
- Location: ${location}${coordContext}
- Soil Type: ${soilType}
- Land Size: ${farmSize}
- Season: Current season
- Water Source: ${waterAvailability}
${weatherContext}

Your tasks:
1. Analyze the farm and weather conditions.
2. Recommend the top 2–3 most suitable crops.
3. Explain clearly why each crop is suitable.
4. Select the best crop and recommend it.

For the selected crop, provide complete guidance.

IMPORTANT: Respond ONLY in ${languageName} language.`;

    console.log("Crop advisor request:", { soilType, climate, location, farmSize, hasWeather: !!weather, language });

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
    console.error("Crop advisor error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
