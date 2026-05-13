import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

async function requireAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Authentication service is not configured");
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await requireAuthenticatedUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sanitize = (v: unknown, max = 200) =>
      typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";
    const soilType = sanitize((body as any).soilType, 100);
    const climate = sanitize((body as any).climate, 100);
    const location = sanitize((body as any).location, 200);
    const waterAvailability = sanitize((body as any).waterAvailability, 100);
    const farmSize = sanitize((body as any).farmSize, 50);
    const weather = (body as any).weather && typeof (body as any).weather === "object" ? (body as any).weather : null;
    const coordinates = (body as any).coordinates && typeof (body as any).coordinates === "object" ? (body as any).coordinates : null;
    const rawLang = sanitize((body as any).language, 5) || "en";
    const allowedLangs = ["en", "te", "hi", "ta", "kn", "mr"];
    const language = allowedLangs.includes(rawLang) ? rawLang : "en";

    if (!soilType || !location) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      const w = weather as any;
      weatherContext = `
Weather Data:
- Temperature: ${sanitize(w.temperature, 20)} °C
- Humidity: ${sanitize(w.humidity, 20)} %
- Rainfall: ${sanitize(w.rainfall, 50)}
- Weather Forecast: ${sanitize(w.forecast, 200)}`;
    }

    let coordContext = "";
    if (coordinates) {
      const c = coordinates as any;
      coordContext = `
- Latitude: ${sanitize(String(c.latitude), 30)}
- Longitude: ${sanitize(String(c.longitude), 30)}`;
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
    return new Response(JSON.stringify({ error: "An error occurred processing your request. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
