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
    const imageBase64Raw = (body as any).imageBase64;
    const imageBase64 = typeof imageBase64Raw === "string" ? imageBase64Raw : "";
    const cropType = sanitize((body as any).cropType, 100);
    const symptoms = sanitize((body as any).symptoms, 1000);
    const location = sanitize((body as any).location, 200);
    const severity = sanitize((body as any).severity, 50);
    const rawLang = sanitize((body as any).language, 5) || "en";
    const allowedLangs = ["en", "te", "hi", "ta", "kn", "mr"];
    const language = allowedLangs.includes(rawLang) ? rawLang : "en";

    // Limit base64 image size (~7MB raw -> ~10MB base64)
    if (imageBase64 && imageBase64.length > 10_000_000) {
      return new Response(JSON.stringify({ error: "Image too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (imageBase64 && !/^[A-Za-z0-9+/=\s]+$/.test(imageBase64.slice(0, 200))) {
      return new Response(JSON.stringify({ error: "Invalid image format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!imageBase64 && !symptoms) {
      return new Response(JSON.stringify({ error: "Provide an image or symptoms" }), {
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

    const systemPrompt = `You are AgriPath AI, an agricultural disease expert powered by LLaMA.

CRITICAL INSTRUCTION:
The entire response must be in ${languageName} language ONLY.
Do NOT mix languages under any condition.
Use simple, farmer-friendly words suitable for rural users.

Input Context:
- Crop Name: ${cropType || 'Unknown'}
- Detected Disease: To be identified from image/symptoms
- Severity Level: ${severity || 'To be assessed'}
- Location: ${location || 'India'}

Your Tasks:
1. Identify the disease with confidence level
2. Explain the disease symptoms simply
3. Describe causes and contributing factors
4. Recommend suitable pesticide or organic treatment
5. Provide dosage and application method
6. Mention safety precautions
7. Suggest preventive measures for future
8. Indicate Urgency Level (Low/Medium/High/Critical)

Guidelines:
- Use simple, farmer-friendly language
- Provide both organic and chemical treatment options
- Include safety warnings for pesticides
- Be thorough but easy to understand
- RESPOND ONLY IN ${languageName.toUpperCase()} LANGUAGE.`;

    console.log("Disease detection request:", { cropType, hasImage: !!imageBase64, symptoms: symptoms?.substring(0, 50), language });

    const userContent = imageBase64 
      ? [
          { type: "text", text: `Analyze this plant image for diseases.\n\nCrop type: ${cropType || 'Unknown'}\nLocation: ${location || 'India'}\nAdditional symptoms reported: ${symptoms || 'None specified'}\n\nPlease provide a detailed diagnosis and complete treatment plan in ${languageName} language ONLY.` },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      : `I need help diagnosing a plant disease.\n\nCrop type: ${cropType || 'Unknown'}\nLocation: ${location || 'India'}\nSymptoms: ${symptoms}\n\nPlease provide possible diagnoses and complete treatment recommendations in ${languageName} language ONLY.`;

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
          { role: "user", content: userContent },
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
    console.error("Disease detection error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
