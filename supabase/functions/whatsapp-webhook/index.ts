import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Twilio sends application/x-www-form-urlencoded webhooks.
// Configure the Twilio WhatsApp sandbox/sender "WHEN A MESSAGE COMES IN" to:
//   https://<your-project-ref>.supabase.co/functions/v1/whatsapp-webhook

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `You are AgriPath AI, a friendly LLaMA-powered farming assistant on WhatsApp.
- Reply in the same language the farmer used (English, Telugu, Hindi, Tamil, Kannada, or Marathi).
- Use very simple, farmer-friendly words.
- Keep replies SHORT (under 6 lines) and use bullet points or numbered steps.
- Use emojis sparingly (🌱 💧 🌾 ⚠️).
- For disease photos: name the disease + 2 organic + 1 chemical treatment with dosage.
- For mandi/price questions: give realistic ₹ ranges for India + sell-now-or-wait advice.
- For crop advice: give practical, low-cost steps.
- Never say "I am an AI". Speak like a helpful farmer friend.`;

// Validate Twilio webhook signature: HMAC-SHA1 of (url + sorted k+v pairs), base64.
// https://www.twilio.com/docs/usage/webhooks/webhooks-security
async function isValidTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>,
): Promise<boolean> {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const k of sortedKeys) data += k + params[k];

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  // constant-time compare
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

async function callAI(messages: any[]) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch(AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("AI gateway error", res.status, text);
    return "⚠️ Sorry, I'm having trouble right now. Please try again in a moment.";
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "🌱 I didn't catch that — please rephrase.";
}

async function fetchTwilioMediaAsBase64(mediaUrl: string): Promise<string | null> {
  // Twilio media URLs require the same Twilio auth — we proxy via the gateway is not
  // possible for raw media downloads, so we fetch with Basic Auth using TWILIO env vars
  // if the user provided them; otherwise we ask the AI to handle text-only.
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!sid || !token) return null;

  const res = await fetch(mediaUrl, {
    headers: { Authorization: "Basic " + btoa(`${sid}:${token}`) },
  });
  if (!res.ok) {
    console.error("Failed to fetch Twilio media", res.status);
    return null;
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  return btoa(binary);
}

async function sendWhatsAppReply(to: string, from: string, body: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  if (!LOVABLE_API_KEY || !TWILIO_API_KEY) {
    console.error("Missing Twilio connector secrets — connect Twilio in Lovable Cloud.");
    return;
  }

  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TWILIO_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Twilio send failed", res.status, text);
  }
}

function twiml(text?: string) {
  // Twilio will accept an empty 200 response too. Returning TwiML lets it reply
  // even before the Twilio connector is linked.
  const safe = (text || "").replace(/[<&>]/g, (c) =>
    ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" }[c]!)
  );
  const xml = text
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response/>`;
  return new Response(xml, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/xml" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const contentType = req.headers.get("content-type") || "";
    let payload: Record<string, string> = {};
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      form.forEach((v, k) => (payload[k] = String(v)));
    } else if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      params.forEach((v, k) => (payload[k] = v));
    }

    const from = payload.From || ""; // e.g. "whatsapp:+9198..."
    const to = payload.To || "";
    const body = (payload.Body || "").trim();
    const numMedia = parseInt(payload.NumMedia || "0", 10);

    console.log("WhatsApp inbound", { from, to, hasBody: !!body, numMedia });

    if (!from) {
      return new Response(JSON.stringify({ ok: true, note: "no From field" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build AI request — handle image (disease detection) or text
    let aiReply: string;

    if (numMedia > 0 && payload.MediaContentType0?.startsWith("image/")) {
      const mediaUrl = payload.MediaUrl0;
      const base64 = await fetchTwilioMediaAsBase64(mediaUrl);
      if (!base64) {
        aiReply =
          "📷 I see your photo, but I can't open it right now. Please describe the symptoms in a message and I'll help.";
      } else {
        const mime = payload.MediaContentType0 || "image/jpeg";
        aiReply = await callAI([
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Farmer sent a photo of a plant. Question: ${body || "What disease is this and how do I treat it?"}`,
              },
              { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
            ],
          },
        ]);
      }
    } else if (body) {
      aiReply = await callAI([{ role: "user", content: body }]);
    } else {
      aiReply =
        "👋 Namaste! I'm AgriPath AI 🌱\nAsk me about:\n• Crop advice\n• Disease (send a leaf photo)\n• Mandi prices\n• Govt schemes";
    }

    // Try sending via Twilio connector. If not connected yet, fall back to TwiML.
    const haveTwilio = !!Deno.env.get("TWILIO_API_KEY") && !!Deno.env.get("LOVABLE_API_KEY");
    if (haveTwilio && from && to) {
      await sendWhatsAppReply(from, to, aiReply);
      return twiml(); // empty 200 to Twilio
    }
    return twiml(aiReply);
  } catch (err) {
    console.error("whatsapp-webhook error", err);
    return twiml("⚠️ Something went wrong. Please try again.");
  }
});