import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, Send, Volume2, VolumeX, Loader2, Leaf, Bug, TrendingUp, Upload, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/hooks/useVoice";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoboAvatar from "@/components/robo/RoboAvatar";

type Flow = "idle" | "crop" | "disease" | "market";
type Role = "robo" | "user";

interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string;
}

// Per-language localized prompts the robo uses to ask questions
const PROMPTS: Record<string, Record<string, string>> = {
  en: {
    greet: "Namaste! I'm AgriRobo, your farming assistant. I can help with crop selection, disease detection, or market prices. Tap a button below or just tell me what you need.",
    cropStart: "Great! Tell me your soil type (e.g., black, red, sandy, clay, alluvial).",
    cropWater: "Got it. What's your water source? (canal, borewell, rainfed, drip)",
    cropSize: "How big is your farm? (e.g., 2 acres)",
    cropDone: "Thank you! Let me find the best crops for you...",
    diseaseStart: "Please upload a clear photo of the affected leaf, or describe the symptoms in words.",
    diseaseCrop: "Which crop is this? (e.g., tomato, rice, cotton)",
    diseaseDone: "Analyzing the plant now...",
    marketStart: "Which crop's price do you want to check? (e.g., wheat, onion, cotton)",
    marketLoc: "Which market or district should I check?",
    marketDone: "Looking up current market prices...",
    anythingElse: "Anything else I can help you with? Tap Crop, Disease, or Market — or just ask.",
    crop: "Crop Advice",
    disease: "Disease Check",
    market: "Market Prices",
    listening: "Listening... speak now",
    typeHere: "Type or speak your answer...",
  },
  hi: {
    greet: "नमस्ते! मैं AgriRobo हूं, आपका कृषि सहायक। मैं फसल चयन, रोग पहचान, या बाज़ार भाव में मदद कर सकता हूं। नीचे बटन दबाएं या मुझे बताएं आपको क्या चाहिए।",
    cropStart: "बढ़िया! अपनी मिट्टी का प्रकार बताएं (जैसे काली, लाल, बलुई, चिकनी, जलोढ़)।",
    cropWater: "ठीक है। पानी का स्रोत क्या है? (नहर, बोरवेल, बारिश, ड्रिप)",
    cropSize: "खेत कितना बड़ा है? (जैसे 2 एकड़)",
    cropDone: "धन्यवाद! आपके लिए सबसे अच्छी फसल ढूंढ रहा हूं...",
    diseaseStart: "कृपया प्रभावित पत्ती की साफ फोटो अपलोड करें, या लक्षण शब्दों में बताएं।",
    diseaseCrop: "यह कौन सी फसल है? (जैसे टमाटर, चावल, कपास)",
    diseaseDone: "अब पौधे का विश्लेषण कर रहा हूं...",
    marketStart: "किस फसल का भाव देखना है? (जैसे गेहूं, प्याज, कपास)",
    marketLoc: "कौन सा बाज़ार या ज़िला देखूं?",
    marketDone: "बाज़ार के भाव देख रहा हूं...",
    anythingElse: "और कुछ चाहिए? फसल, रोग, या बाज़ार पर टैप करें — या बस पूछें।",
    crop: "फसल सलाह",
    disease: "रोग जाँच",
    market: "बाज़ार भाव",
    listening: "सुन रहा हूं... अब बोलें",
    typeHere: "अपना जवाब लिखें या बोलें...",
  },
  te: {
    greet: "నమస్తే! నేను AgriRobo, మీ వ్యవసాయ సహాయకుడిని. పంట ఎంపిక, వ్యాధి గుర్తింపు, లేదా మార్కెట్ ధరలలో సహాయం చేస్తాను. క్రింద బటన్ నొక్కండి లేదా మీకు ఏమి కావాలో చెప్పండి.",
    cropStart: "మీ నేల రకం చెప్పండి (నల్ల, ఎర్ర, ఇసుక, బంక, ఒండ్రు).",
    cropWater: "మీ నీటి వనరు? (కాలువ, బోర్‌వెల్, వర్షాధార, డ్రిప్)",
    cropSize: "మీ పొలం ఎంత పెద్దది? (ఉదా: 2 ఎకరాలు)",
    cropDone: "ధన్యవాదాలు! మీకు ఉత్తమమైన పంటలను కనుగొంటున్నాను...",
    diseaseStart: "ప్రభావిత ఆకు ఫోటోను అప్‌లోడ్ చేయండి, లేదా లక్షణాలను వివరించండి.",
    diseaseCrop: "ఇది ఏ పంట? (టమాటో, వరి, పత్తి)",
    diseaseDone: "మొక్కను విశ్లేషిస్తున్నాను...",
    marketStart: "ఏ పంట ధర చూడాలి? (గోధుమ, ఉల్లి, పత్తి)",
    marketLoc: "ఏ మార్కెట్ లేదా జిల్లా చూడాలి?",
    marketDone: "ప్రస్తుత మార్కెట్ ధరలను చూస్తున్నాను...",
    anythingElse: "ఇంకా ఏదైనా కావాలా? పంట, వ్యాధి, లేదా మార్కెట్ నొక్కండి — లేదా అడగండి.",
    crop: "పంట సలహా",
    disease: "వ్యాధి తనిఖీ",
    market: "మార్కెట్ ధర",
    listening: "వింటున్నాను... ఇప్పుడు మాట్లాడండి",
    typeHere: "మీ జవాబు టైప్ చేయండి లేదా మాట్లాడండి...",
  },
  ta: {
    greet: "வணக்கம்! நான் AgriRobo, உங்கள் விவசாய உதவியாளர். பயிர் தேர்வு, நோய் கண்டறிதல், அல்லது சந்தை விலைகளில் உதவுவேன். கீழே ஒரு பட்டனை அழுத்துங்கள் அல்லது என்ன வேண்டும் என்று சொல்லுங்கள்.",
    cropStart: "உங்கள் மண் வகையைச் சொல்லுங்கள் (கருப்பு, சிவப்பு, மணல், களிமண், வண்டல்).",
    cropWater: "உங்கள் நீர் ஆதாரம்? (கால்வாய், போர்வெல், மழை, சொட்டுநீர்)",
    cropSize: "உங்கள் பண்ணை எவ்வளவு பெரியது? (எ.கா. 2 ஏக்கர்)",
    cropDone: "நன்றி! உங்களுக்கான சிறந்த பயிர்களைக் கண்டறிகிறேன்...",
    diseaseStart: "பாதிக்கப்பட்ட இலையின் தெளிவான புகைப்படத்தை பதிவேற்றவும், அல்லது அறிகுறிகளை விவரிக்கவும்.",
    diseaseCrop: "இது எந்த பயிர்? (தக்காளி, அரிசி, பருத்தி)",
    diseaseDone: "தாவரத்தை பகுப்பாய்வு செய்கிறேன்...",
    marketStart: "எந்த பயிரின் விலை தெரிய வேண்டும்? (கோதுமை, வெங்காயம், பருத்தி)",
    marketLoc: "எந்த சந்தை அல்லது மாவட்டம்?",
    marketDone: "தற்போதைய சந்தை விலைகளைப் பார்க்கிறேன்...",
    anythingElse: "வேறு ஏதாவது வேண்டுமா? பயிர், நோய், அல்லது சந்தை அழுத்துங்கள் — அல்லது கேளுங்கள்.",
    crop: "பயிர் ஆலோசனை",
    disease: "நோய் சோதனை",
    market: "சந்தை விலை",
    listening: "கேட்கிறேன்... இப்போது பேசுங்கள்",
    typeHere: "உங்கள் பதிலை தட்டச்சு செய்யவும் அல்லது பேசவும்...",
  },
  kn: {
    greet: "ನಮಸ್ಕಾರ! ನಾನು AgriRobo, ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆ ಆಯ್ಕೆ, ರೋಗ ಪತ್ತೆ, ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಅಥವಾ ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ಹೇಳಿ.",
    cropStart: "ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ ಹೇಳಿ (ಕಪ್ಪು, ಕೆಂಪು, ಮರಳು, ಜೇಡಿ, ಮೆಕ್ಕಲು).",
    cropWater: "ನಿಮ್ಮ ನೀರಿನ ಮೂಲ? (ಕಾಲುವೆ, ಬೋರ್‌ವೆಲ್, ಮಳೆ, ಡ್ರಿಪ್)",
    cropSize: "ನಿಮ್ಮ ಹೊಲ ಎಷ್ಟು ದೊಡ್ಡದು? (ಉದಾ: 2 ಎಕರೆ)",
    cropDone: "ಧನ್ಯವಾದಗಳು! ನಿಮಗಾಗಿ ಉತ್ತಮ ಬೆಳೆಗಳನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇನೆ...",
    diseaseStart: "ಪ್ರಭಾವಿತ ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಅಥವಾ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ.",
    diseaseCrop: "ಇದು ಯಾವ ಬೆಳೆ? (ಟೊಮೇಟೊ, ಅಕ್ಕಿ, ಹತ್ತಿ)",
    diseaseDone: "ಸಸ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇನೆ...",
    marketStart: "ಯಾವ ಬೆಳೆಯ ಬೆಲೆ ತಿಳಿಯಬೇಕು? (ಗೋಧಿ, ಈರುಳ್ಳಿ, ಹತ್ತಿ)",
    marketLoc: "ಯಾವ ಮಾರುಕಟ್ಟೆ ಅಥವಾ ಜಿಲ್ಲೆ?",
    marketDone: "ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ನೋಡುತ್ತಿದ್ದೇನೆ...",
    anythingElse: "ಮತ್ತೇನಾದರೂ ಬೇಕೇ? ಬೆಳೆ, ರೋಗ, ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಒತ್ತಿ — ಅಥವಾ ಕೇಳಿ.",
    crop: "ಬೆಳೆ ಸಲಹೆ",
    disease: "ರೋಗ ಪರೀಕ್ಷೆ",
    market: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
    listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ... ಈಗ ಮಾತನಾಡಿ",
    typeHere: "ಉತ್ತರ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ...",
  },
  mr: {
    greet: "नमस्कार! मी AgriRobo, तुमचा शेती सहाय्यक. पीक निवड, रोग ओळख, किंवा बाजार भावात मदत करू शकतो. खालील बटण दाबा किंवा तुम्हाला काय हवे ते सांगा.",
    cropStart: "तुमच्या मातीचा प्रकार सांगा (काळी, लाल, वालुकामय, चिकणमाती, गाळाची).",
    cropWater: "पाण्याचा स्रोत? (कालवा, बोअरवेल, पावसावर, ठिबक)",
    cropSize: "शेत किती मोठे आहे? (उदा. 2 एकर)",
    cropDone: "धन्यवाद! तुमच्यासाठी सर्वोत्तम पिके शोधत आहे...",
    diseaseStart: "प्रभावित पानाचा स्पष्ट फोटो अपलोड करा, किंवा लक्षणे वर्णन करा.",
    diseaseCrop: "हे कोणते पीक आहे? (टोमॅटो, तांदूळ, कापूस)",
    diseaseDone: "वनस्पतीचे विश्लेषण करत आहे...",
    marketStart: "कोणत्या पिकाचा भाव हवा? (गहू, कांदा, कापूस)",
    marketLoc: "कोणता बाजार किंवा जिल्हा?",
    marketDone: "सध्याचे बाजार भाव पाहत आहे...",
    anythingElse: "आणखी काही हवे? पीक, रोग, किंवा बाजार दाबा — किंवा विचारा.",
    crop: "पीक सल्ला",
    disease: "रोग तपासणी",
    market: "बाजार भाव",
    listening: "ऐकत आहे... आता बोला",
    typeHere: "तुमचे उत्तर टाइप करा किंवा बोला...",
  },
};

const ASK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-ai`;
const CROP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crop-advisor`;
const DISEASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disease-detection`;
const MARKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-insights`;

const stripMd = (s: string) => s.replace(/[#*_`>\[\]\(\)]/g, "").replace(/\n+/g, " ").trim();

const Robo = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const voice = useVoice({ language });
  const { location, getLocation } = useGeolocation();
  const { weather, fetchWeather } = useWeather();

  const p = PROMPTS[language] || PROMPTS.en;

  const [messages, setMessages] = useState<Message[]>([]);
  const [flow, setFlow] = useState<Flow>("idle");
  const [step, setStep] = useState(0);
  const [collected, setCollected] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string>(""); // base64
  const [pendingPreview, setPendingPreview] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const greetedRef = useRef(false);
  const lastTranscript = useRef("");

  // Push voice transcript into input
  useEffect(() => {
    if (voice.transcript && voice.transcript !== lastTranscript.current) {
      const newPart = voice.transcript.slice(lastTranscript.current.length);
      setInput((prev) => (prev ? prev + " " : "") + newPart);
      lastTranscript.current = voice.transcript;
    }
    if (!voice.transcript) lastTranscript.current = "";
  }, [voice.transcript]);

  // Get location once
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (location.latitude && !weather.temperature && !weather.loading) {
      fetchWeather(location.latitude, location.longitude);
    }
  }, [location, weather, fetchWeather]);

  // Auto-scroll
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sayRobo = useCallback(
    (text: string) => {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "robo", text }]);
      if (autoSpeak) voice.speak(stripMd(text));
    },
    [autoSpeak, voice]
  );

  // Initial greeting (re-greet on language change)
  useEffect(() => {
    if (greetedRef.current) {
      // language changed → reset
      setMessages([]);
      setFlow("idle");
      setStep(0);
      setCollected({});
    }
    greetedRef.current = true;
    setMessages([{ id: "greet", role: "robo", text: p.greet }]);
    if (autoSpeak) voice.speak(stripMd(p.greet));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const ensureSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({ title: "Login Required", description: "Please log in to chat with Robo.", variant: "destructive" });
      navigate("/auth");
      return null;
    }
    return session.access_token;
  };

  const streamResponse = async (url: string, body: Record<string, unknown>) => {
    const token = await ensureSession();
    if (!token) return;
    setIsProcessing(true);
    const id = crypto.randomUUID();
    setMessages((m) => [...m, { id, role: "robo", text: "" }]);
    let full = "";
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 401) { navigate("/auth"); return; }
        if (resp.status === 429) { toast({ title: "Rate Limited", description: "Please try again later.", variant: "destructive" }); return; }
        if (resp.status === 402) { toast({ title: "Credits Required", description: "Please add credits.", variant: "destructive" }); return; }
        throw new Error("Request failed");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              full += c;
              setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: full } : msg)));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      if (autoSpeak && full) voice.speak(stripMd(full).slice(0, 600));
      // After result, ask anything else
      setTimeout(() => {
        setFlow("idle");
        setStep(0);
        setCollected({});
        sayRobo(p.anythingElse);
      }, 800);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const startFlow = (f: Flow) => {
    setFlow(f);
    setStep(0);
    setCollected({});
    setPendingImage("");
    setPendingPreview("");
    if (f === "crop") sayRobo(p.cropStart);
    if (f === "disease") sayRobo(p.diseaseStart);
    if (f === "market") sayRobo(p.marketStart);
  };

  const submitUser = (text: string) => {
    const trimmed = text.trim();
    const hasImage = !!pendingImage;
    if (!trimmed && !hasImage) return;
    if (voice.isListening) voice.stopListening();
    voice.clearTranscript?.();
    lastTranscript.current = "";

    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", text: trimmed || (hasImage ? "📷 Image uploaded" : ""), image: pendingPreview || undefined },
    ]);
    setInput("");

    // Decide based on current flow
    if (flow === "idle") {
      // Free-form: send to ask-ai
      streamResponse(ASK_URL, {
        question: trimmed,
        language,
        location: location.city ? `${location.city}, ${location.state}` : "",
        weather: weather.temperature ? {
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          forecast: weather.forecast,
        } : null,
      });
      return;
    }

    if (flow === "crop") {
      const next = { ...collected };
      if (step === 0) { next.soilType = trimmed; setCollected(next); setStep(1); sayRobo(p.cropWater); return; }
      if (step === 1) { next.water = trimmed; setCollected(next); setStep(2); sayRobo(p.cropSize); return; }
      if (step === 2) {
        next.farmSize = trimmed;
        setCollected(next);
        sayRobo(p.cropDone);
        streamResponse(CROP_URL, {
          soilType: next.soilType,
          climate: weather.forecast || "Tropical",
          location: location.city ? `${location.city}, ${location.state}` : "India",
          waterAvailability: next.water,
          farmSize: next.farmSize,
          language,
          weather: weather.temperature ? {
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainfall: weather.rainfall,
            forecast: weather.forecast,
          } : null,
          coordinates: location.latitude ? { latitude: location.latitude, longitude: location.longitude } : null,
        });
        return;
      }
    }

    if (flow === "disease") {
      const next = { ...collected };
      if (step === 0) {
        // expect image OR symptoms text
        next.symptoms = trimmed;
        next.imageBase64 = pendingImage;
        setCollected(next);
        setStep(1);
        sayRobo(p.diseaseCrop);
        setPendingImage("");
        setPendingPreview("");
        return;
      }
      if (step === 1) {
        next.cropType = trimmed;
        setCollected(next);
        sayRobo(p.diseaseDone);
        streamResponse(DISEASE_URL, {
          imageBase64: next.imageBase64 || "",
          cropType: next.cropType,
          symptoms: next.symptoms || "",
          language,
        });
        return;
      }
    }

    if (flow === "market") {
      const next = { ...collected };
      if (step === 0) { next.crop = trimmed; setCollected(next); setStep(1); sayRobo(p.marketLoc); return; }
      if (step === 1) {
        next.location = trimmed;
        setCollected(next);
        sayRobo(p.marketDone);
        streamResponse(MARKET_URL, {
          crop: next.crop,
          location: next.location,
          timeframe: "current",
          language,
        });
        return;
      }
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPendingPreview(result);
      setPendingImage(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const isSpeaking = voice.isSpeaking || isProcessing;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
            {/* 3D Robo */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 rounded-3xl border border-border shadow-lg overflow-hidden h-[500px] lg:h-[600px] relative">
                <RoboAvatar speaking={isSpeaking} listening={voice.isListening} />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border flex items-center gap-2 text-sm">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="font-medium">AgriRobo</span>
                    <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-yellow-400 animate-pulse" : voice.isListening ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                  </div>
                </div>
              </div>

              {/* Quick action chips */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button
                  variant={flow === "crop" ? "default" : "outline"}
                  size="sm"
                  className="flex-col h-auto py-3 gap-1"
                  onClick={() => startFlow("crop")}
                  disabled={isProcessing}
                >
                  <Leaf className="w-5 h-5" />
                  <span className="text-xs">{p.crop}</span>
                </Button>
                <Button
                  variant={flow === "disease" ? "default" : "outline"}
                  size="sm"
                  className="flex-col h-auto py-3 gap-1"
                  onClick={() => startFlow("disease")}
                  disabled={isProcessing}
                >
                  <Bug className="w-5 h-5" />
                  <span className="text-xs">{p.disease}</span>
                </Button>
                <Button
                  variant={flow === "market" ? "default" : "outline"}
                  size="sm"
                  className="flex-col h-auto py-3 gap-1"
                  onClick={() => startFlow("market")}
                  disabled={isProcessing}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xs">{p.market}</span>
                </Button>
              </div>
            </div>

            {/* Chat */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-3xl border border-border shadow-lg flex flex-col h-[500px] lg:h-[600px]">
                {/* Transcript */}
                <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2"
                            : "text-foreground"
                        }`}
                      >
                        {msg.image && (
                          <img src={msg.image} alt="" className="rounded-lg mb-2 max-h-40 object-cover" />
                        )}
                        {msg.role === "robo" ? (
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="prose prose-sm max-w-none text-foreground bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2">
                              {msg.text ? (
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                              ) : (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Listening banner */}
                {voice.isListening && (
                  <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/30 text-destructive text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    {p.listening}
                  </div>
                )}

                {/* Image preview chip */}
                {pendingPreview && (
                  <div className="px-4 pt-2 flex items-center gap-2">
                    <div className="relative">
                      <img src={pendingPreview} alt="" className="h-16 w-16 object-cover rounded-lg border border-border" />
                      <button
                        onClick={() => { setPendingImage(""); setPendingPreview(""); }}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input bar */}
                <div className="p-3 border-t border-border flex items-center gap-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
                  {flow === "disease" && step === 0 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                      disabled={isProcessing}
                      title="Upload image"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  )}
                  {voice.isSupported && (
                    <Button
                      type="button"
                      size="icon"
                      variant={voice.isListening ? "destructive" : "outline"}
                      onClick={voice.isListening ? voice.stopListening : voice.startListening}
                      disabled={isProcessing}
                      title="Voice input"
                    >
                      {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant={autoSpeak ? "default" : "outline"}
                    onClick={() => {
                      if (voice.isSpeaking) voice.stopSpeaking();
                      setAutoSpeak((s) => !s);
                    }}
                    title="Auto-speak"
                  >
                    {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitUser(input);
                      }
                    }}
                    placeholder={p.typeHere}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => submitUser(input)}
                    disabled={isProcessing || (!input.trim() && !pendingImage)}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Robo;