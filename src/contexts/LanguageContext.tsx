import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "te" | "hi" | "ta" | "kn" | "mr";

export const languageNames: Record<Language, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिंदी",
  ta: "தமிழ்",
  kn: "ಕನ್ನಡ",
  mr: "मराठी",
};

export const languageLabels: Record<Language, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  kn: "Kannada",
  mr: "Marathi",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("agripath-language");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("agripath-language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key] || translations.en[key] || key;
    return translation;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t, 
        languageName: languageLabels[language] 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Translations object
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.cropAdvisor": "Crop Advisor",
    "nav.diseaseDetection": "Disease Detection",
    "nav.marketInsights": "Market Insights",
    "nav.community": "Community",
    "nav.askAi": "Ask AI",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.logout": "Logout",
    
    // Hero Section
    "hero.badge": "AI-Powered Agriculture Platform",
    "hero.title": "Smart Farming with AI",
    "hero.description": "Empowering farmers with intelligent crop selection, disease detection, and market insights",
    "hero.getStarted": "Get Started",
    "hero.learnMore": "Learn More",
    "hero.activeFarmers": "Active Farmers",
    "hero.accuracyRate": "Accuracy Rate",
    "hero.cropTypes": "Crop Types",
    "hero.languages": "Languages",
    
    // Features Section
    "features.title": "Everything You Need for Smart Farming",
    "features.subtitle": "Harness the power of AI to make better decisions for your farm",
    "features.askAi": "Ask AI",
    "features.askAiDesc": "Ask any farming question and get instant LLaMA-powered answers",
    "features.cropSelection": "Smart Crop Selection",
    "features.cropSelectionDesc": "AI-powered recommendations based on your soil, climate, and market demand",
    "features.diseaseDetection": "Disease Detection",
    "features.diseaseDetectionDesc": "Upload leaf images for instant AI diagnosis and treatment advice",
    "features.marketPrices": "Market Prices",
    "features.marketPricesDesc": "Live mandi rates and price predictions to maximize your profits",
    "features.community": "Farmer Community",
    "features.communityDesc": "Connect with experts and access government schemes",
    "features.explore": "Explore",
    
    // Why Choose Section
    "why.title": "Why Choose AgriPath AI?",
    "why.subtitle": "We combine cutting-edge AI technology with deep agricultural expertise to bring you the most accurate and actionable insights.",
    "why.realtime": "Real-time Analysis",
    "why.realtimeDesc": "Get instant recommendations based on current conditions",
    "why.trusted": "Trusted by Farmers",
    "why.trustedDesc": "Backed by agricultural research and farmer feedback",
    "why.multilingual": "Multilingual Support",
    "why.multilingualDesc": "Available in 6 regional languages for easy access",
    "why.phoneTitle": "Your Digital Krushi Mitra",
    "why.phoneDesc": "AI-powered farming assistant in your pocket",
    
    // CTA Section
    "cta.title": "Ready to Transform Your Farm?",
    "cta.subtitle": "Join thousands of farmers who are already using AI to grow smarter.",
    "cta.startFree": "Start Free Today",
    "cta.contactSales": "Contact Sales",
    
    // Footer
    "footer.devNote": "Note: Some features such as WhatsApp integration and certain buttons are currently under development and may not work at this stage. These will be enabled in future updates.",
    "footer.insights": "Website Insights",
    "footer.insightsText": "AgriPath AI is a prototype LLaMA-based smart farming platform designed to demonstrate AI-driven decision support for agriculture. The system integrates real-time APIs, disease detection models, and Large Language Models to provide farmer-friendly guidance. Some features are in development and will be enhanced in future versions.",
    "footer.developedBy": "Developed by: K. Vijay",
    "footer.project": "Project: AgriPath AI – Smart Farming Using LLaMA",
    "footer.copyright": "© 2025 AgriPath AI. All rights reserved.",
    
    // Common
    "common.submit": "Submit",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.detectLocation": "Detect Location",
    "common.analyzing": "Analyzing...",
    "common.getRecommendations": "Get Recommendations",
    "common.askQuestion": "Ask a Question",
    "common.uploadImage": "Upload Image",
    "common.selectCrop": "Select Crop",
    "common.selectSoilType": "Select Soil Type",
    "common.selectSeason": "Select Season",
    "common.location": "Location",
    "common.soilType": "Soil Type",
    "common.season": "Season",
    "common.waterAvailability": "Water Availability",
    "common.farmSize": "Farm Size",
    
    // Crop Advisor
    "cropAdvisor.title": "Crop Advisor",
    "cropAdvisor.subtitle": "Get AI-powered crop recommendations based on your farm conditions",
    "cropAdvisor.formTitle": "Enter Your Farm Details",
    "cropAdvisor.locationPlaceholder": "Enter your location or detect automatically",
    "cropAdvisor.detecting": "Detecting location...",
    "cropAdvisor.farmSizePlaceholder": "e.g., 5 acres",
    "cropAdvisor.soilTypes.alluvial": "Alluvial",
    "cropAdvisor.soilTypes.black": "Black (Cotton) Soil",
    "cropAdvisor.soilTypes.red": "Red Soil",
    "cropAdvisor.soilTypes.laterite": "Laterite",
    "cropAdvisor.soilTypes.sandy": "Sandy",
    "cropAdvisor.soilTypes.clay": "Clay",
    "cropAdvisor.waterOptions.canal": "Canal Irrigation",
    "cropAdvisor.waterOptions.borewell": "Borewell",
    "cropAdvisor.waterOptions.rainfed": "Rainfed",
    "cropAdvisor.waterOptions.drip": "Drip Irrigation",
    "cropAdvisor.waterOptions.river": "River/Pond",
    "cropAdvisor.weatherInfo": "Weather Information",
    "cropAdvisor.temperature": "Temperature",
    "cropAdvisor.humidity": "Humidity",
    "cropAdvisor.rainfall": "Rainfall",
    "cropAdvisor.forecast": "Forecast",
    
    // Disease Detection
    "diseaseDetection.title": "Disease Detection",
    "diseaseDetection.subtitle": "Upload a leaf image or describe symptoms for AI diagnosis",
    "diseaseDetection.uploadTitle": "Upload Plant Image",
    "diseaseDetection.uploadDesc": "Take a clear photo of the affected leaf or plant",
    "diseaseDetection.cropType": "Crop Type",
    "diseaseDetection.cropTypePlaceholder": "e.g., Tomato, Rice, Cotton",
    "diseaseDetection.symptoms": "Describe Symptoms",
    "diseaseDetection.symptomsPlaceholder": "Describe the symptoms you observe (yellowing, spots, wilting, etc.)",
    "diseaseDetection.analyze": "Analyze Disease",
    
    // Market Insights
    "marketInsights.title": "Market Insights",
    "marketInsights.subtitle": "Get real-time market prices and selling strategies",
    "marketInsights.cropName": "Crop Name",
    "marketInsights.cropPlaceholder": "e.g., Wheat, Rice, Cotton",
    "marketInsights.timeframe": "Timeframe",
    "marketInsights.timeframePlaceholder": "e.g., This week, Next month",
    "marketInsights.getInsights": "Get Market Insights",
    
    // Ask AI
    "askAi.title": "Ask AI",
    "askAi.subtitle": "Ask any farming question and get instant LLaMA-powered answers",
    "askAi.placeholder": "Ask any farming question... (e.g., How to increase wheat yield?)",
    "askAi.contextTitle": "Optional Context",
    "askAi.cropPlaceholder": "Current crop (optional)",
    "askAi.seasonPlaceholder": "Current season (optional)",
    
    // Voice
    "voice.speak": "Speak",
    "voice.listening": "Listening... Speak now",
    "voice.autoSpeak": "Auto-speak",
    "voice.speakResponse": "Speak Response",
    
    // Auth
    "auth.loginTitle": "Welcome Back",
    "auth.signupTitle": "Create Account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.loginButton": "Login",
    "auth.signupButton": "Sign Up",
    "auth.switchToSignup": "Don't have an account? Sign up",
    "auth.switchToLogin": "Already have an account? Login",
  },
  
  te: {
    // Navigation
    "nav.home": "హోమ్",
    "nav.cropAdvisor": "పంట సలహాదారు",
    "nav.diseaseDetection": "వ్యాధి గుర్తింపు",
    "nav.marketInsights": "మార్కెట్ విశ్లేషణలు",
    "nav.community": "సమాజం",
    "nav.askAi": "AI ను అడగండి",
    "nav.login": "లాగిన్",
    "nav.signup": "సైన్ అప్",
    "nav.logout": "లాగ్ అవుట్",
    
    // Hero Section
    "hero.badge": "AI-ఆధారిత వ్యవసాయ వేదిక",
    "hero.title": "AI తో స్మార్ట్ వ్యవసాయం",
    "hero.description": "తెలివైన పంట ఎంపిక, వ్యాధి గుర్తింపు మరియు మార్కెట్ అంతర్దృష్టులతో రైతులను శక్తివంతం చేయడం",
    "hero.getStarted": "ప్రారంభించండి",
    "hero.learnMore": "మరింత తెలుసుకోండి",
    "hero.activeFarmers": "చురుకైన రైతులు",
    "hero.accuracyRate": "ఖచ్చితత్వ రేటు",
    "hero.cropTypes": "పంట రకాలు",
    "hero.languages": "భాషలు",
    
    // Features Section
    "features.title": "స్మార్ట్ వ్యవసాయానికి మీకు కావలసినదంతా",
    "features.subtitle": "మీ వ్యవసాయం కోసం మెరుగైన నిర్ణయాలు తీసుకోవడానికి AI శక్తిని ఉపయోగించుకోండి",
    "features.askAi": "AI ను అడగండి",
    "features.askAiDesc": "ఏదైనా వ్యవసాయ ప్రశ్న అడగండి మరియు తక్షణ సమాధానాలు పొందండి",
    "features.cropSelection": "స్మార్ట్ పంట ఎంపిక",
    "features.cropSelectionDesc": "మీ నేల, వాతావరణం మరియు మార్కెట్ డిమాండ్ ఆధారంగా AI సిఫార్సులు",
    "features.diseaseDetection": "వ్యాధి గుర్తింపు",
    "features.diseaseDetectionDesc": "తక్షణ AI నిర్ధారణ మరియు చికిత్స సలహా కోసం ఆకు చిత్రాలను అప్‌లోడ్ చేయండి",
    "features.marketPrices": "మార్కెట్ ధరలు",
    "features.marketPricesDesc": "మీ లాభాలను గరిష్టంగా పెంచడానికి లైవ్ మండి రేట్లు",
    "features.community": "రైతు సమాజం",
    "features.communityDesc": "నిపుణులతో కనెక్ట్ అవ్వండి మరియు ప్రభుత్వ పథకాలను యాక్సెస్ చేయండి",
    "features.explore": "అన్వేషించండి",
    
    // Why Choose Section
    "why.title": "AgriPath AI ను ఎందుకు ఎంచుకోవాలి?",
    "why.subtitle": "మీకు అత్యంత ఖచ్చితమైన మరియు చర్య తీసుకోదగిన అంతర్దృష్టులను అందించడానికి మేము అత్యాధునిక AI సాంకేతికతను లోతైన వ్యవసాయ నైపుణ్యంతో కలుపుతాము.",
    "why.realtime": "నిజ-సమయ విశ్లేషణ",
    "why.realtimeDesc": "ప్రస్తుత పరిస్థితుల ఆధారంగా తక్షణ సిఫార్సులు పొందండి",
    "why.trusted": "రైతులచే నమ్మదగినది",
    "why.trustedDesc": "వ్యవసాయ పరిశోధన మరియు రైతు అభిప్రాయం ద్వారా మద్దతు",
    "why.multilingual": "బహుభాషా మద్దతు",
    "why.multilingualDesc": "సులభ ప్రాప్యత కోసం 6 ప్రాంతీయ భాషలలో అందుబాటులో ఉంది",
    "why.phoneTitle": "మీ డిజిటల్ కృషి మిత్ర",
    "why.phoneDesc": "మీ జేబులో AI-ఆధారిత వ్యవసాయ సహాయకుడు",
    
    // CTA Section
    "cta.title": "మీ వ్యవసాయాన్ని మార్చడానికి సిద్ధంగా ఉన్నారా?",
    "cta.subtitle": "తెలివిగా వ్యవసాయం చేయడానికి AI ఉపయోగిస్తున్న వేలాది రైతులలో చేరండి.",
    "cta.startFree": "ఈ రోజు ఉచితంగా ప్రారంభించండి",
    "cta.contactSales": "సేల్స్‌ని సంప్రదించండి",
    
    // Footer
    "footer.devNote": "గమనిక: WhatsApp ఇంటిగ్రేషన్ మరియు కొన్ని బటన్లు వంటి కొన్ని ఫీచర్లు ప్రస్తుతం అభివృద్ధిలో ఉన్నాయి. ఇవి భవిష్యత్ అప్‌డేట్‌లలో ప్రారంభించబడతాయి.",
    "footer.insights": "వెబ్‌సైట్ అంతర్దృష్టులు",
    "footer.insightsText": "AgriPath AI వ్యవసాయం కోసం AI-ఆధారిత నిర్ణయ మద్దతును ప్రదర్శించడానికి రూపొందించబడిన ప్రోటోటైప్ LLaMA-ఆధారిత స్మార్ట్ ఫార్మింగ్ ప్లాట్‌ఫారమ్.",
    "footer.developedBy": "అభివృద్ధి చేసినవారు: కె. విజయ్",
    "footer.project": "ప్రాజెక్ట్: AgriPath AI – LLaMA ఉపయోగించి స్మార్ట్ ఫార్మింగ్",
    "footer.copyright": "© 2025 AgriPath AI. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",
    
    // Common
    "common.submit": "సబ్మిట్ చేయండి",
    "common.loading": "లోడ్ అవుతోంది...",
    "common.error": "లోపం సంభవించింది",
    "common.success": "విజయం",
    "common.cancel": "రద్దు చేయండి",
    "common.save": "సేవ్ చేయండి",
    "common.detectLocation": "స్థానాన్ని గుర్తించండి",
    "common.analyzing": "విశ్లేషిస్తోంది...",
    "common.getRecommendations": "సిఫార్సులు పొందండి",
    "common.askQuestion": "ప్రశ్న అడగండి",
    "common.uploadImage": "చిత్రాన్ని అప్‌లోడ్ చేయండి",
    "common.selectCrop": "పంటను ఎంచుకోండి",
    "common.selectSoilType": "నేల రకాన్ని ఎంచుకోండి",
    "common.selectSeason": "సీజన్ ఎంచుకోండి",
    "common.location": "స్థానం",
    "common.soilType": "నేల రకం",
    "common.season": "సీజన్",
    "common.waterAvailability": "నీటి లభ్యత",
    "common.farmSize": "వ్యవసాయ భూమి పరిమాణం",
    
    // Crop Advisor
    "cropAdvisor.title": "పంట సలహాదారు",
    "cropAdvisor.subtitle": "మీ వ్యవసాయ పరిస్థితుల ఆధారంగా AI-ఆధారిత పంట సిఫార్సులు పొందండి",
    "cropAdvisor.formTitle": "మీ వ్యవసాయ వివరాలను నమోదు చేయండి",
    "cropAdvisor.locationPlaceholder": "మీ స్థానాన్ని నమోదు చేయండి లేదా స్వయంచాలకంగా గుర్తించండి",
    "cropAdvisor.detecting": "స్థానాన్ని గుర్తిస్తోంది...",
    "cropAdvisor.farmSizePlaceholder": "ఉదా., 5 ఎకరాలు",
    "cropAdvisor.soilTypes.alluvial": "ఒండ్రు మట్టి",
    "cropAdvisor.soilTypes.black": "నల్ల (పత్తి) మట్టి",
    "cropAdvisor.soilTypes.red": "ఎర్ర మట్టి",
    "cropAdvisor.soilTypes.laterite": "లేటరైట్",
    "cropAdvisor.soilTypes.sandy": "ఇసుక మట్టి",
    "cropAdvisor.soilTypes.clay": "జిగట మట్టి",
    "cropAdvisor.waterOptions.canal": "కాలువ నీటిపారుదల",
    "cropAdvisor.waterOptions.borewell": "బోర్‌వెల్",
    "cropAdvisor.waterOptions.rainfed": "వర్షాధారం",
    "cropAdvisor.waterOptions.drip": "బిందు సేద్యం",
    "cropAdvisor.waterOptions.river": "నది/చెరువు",
    "cropAdvisor.weatherInfo": "వాతావరణ సమాచారం",
    "cropAdvisor.temperature": "ఉష్ణోగ్రత",
    "cropAdvisor.humidity": "తేమ",
    "cropAdvisor.rainfall": "వర్షపాతం",
    "cropAdvisor.forecast": "వాతావరణ అంచనా",
    
    // Disease Detection
    "diseaseDetection.title": "వ్యాధి గుర్తింపు",
    "diseaseDetection.subtitle": "AI నిర్ధారణ కోసం ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా లక్షణాలను వివరించండి",
    "diseaseDetection.uploadTitle": "మొక్క చిత్రాన్ని అప్‌లోడ్ చేయండి",
    "diseaseDetection.uploadDesc": "ప్రభావిత ఆకు లేదా మొక్క యొక్క స్పష్టమైన ఫోటో తీయండి",
    "diseaseDetection.cropType": "పంట రకం",
    "diseaseDetection.cropTypePlaceholder": "ఉదా., టమాటో, వరి, పత్తి",
    "diseaseDetection.symptoms": "లక్షణాలను వివరించండి",
    "diseaseDetection.symptomsPlaceholder": "మీరు గమనించిన లక్షణాలను వివరించండి (పసుపు రంగు, మచ్చలు, వాడిపోవడం మొదలైనవి)",
    "diseaseDetection.analyze": "వ్యాధిని విశ్లేషించండి",
    
    // Market Insights
    "marketInsights.title": "మార్కెట్ విశ్లేషణలు",
    "marketInsights.subtitle": "నిజ-సమయ మార్కెట్ ధరలు మరియు అమ్మకపు వ్యూహాలు పొందండి",
    "marketInsights.cropName": "పంట పేరు",
    "marketInsights.cropPlaceholder": "ఉదా., గోధుమ, వరి, పత్తి",
    "marketInsights.timeframe": "సమయ వ్యవధి",
    "marketInsights.timeframePlaceholder": "ఉదా., ఈ వారం, వచ్చే నెల",
    "marketInsights.getInsights": "మార్కెట్ విశ్లేషణలు పొందండి",
    
    // Ask AI
    "askAi.title": "AI ను అడగండి",
    "askAi.subtitle": "ఏదైనా వ్యవసాయ ప్రశ్న అడగండి మరియు తక్షణ LLaMA-ఆధారిత సమాధానాలు పొందండి",
    "askAi.placeholder": "ఏదైనా వ్యవసాయ ప్రశ్న అడగండి... (ఉదా., గోధుమ దిగుబడిని ఎలా పెంచాలి?)",
    "askAi.contextTitle": "ఐచ్ఛిక సందర్భం",
    "askAi.cropPlaceholder": "ప్రస్తుత పంట (ఐచ్ఛికం)",
    "askAi.seasonPlaceholder": "ప్రస్తుత సీజన్ (ఐచ్ఛికం)",
    
    // Voice
    "voice.speak": "మాట్లాడండి",
    "voice.listening": "వింటోంది... ఇప్పుడు మాట్లాడండి",
    "voice.autoSpeak": "ఆటో-మాట్లాడు",
    "voice.speakResponse": "సమాధానం చదవండి",
    
    // Auth
    "auth.loginTitle": "తిరిగి స్వాగతం",
    "auth.signupTitle": "ఖాతాను సృష్టించండి",
    "auth.email": "ఇమెయిల్",
    "auth.password": "పాస్‌వర్డ్",
    "auth.loginButton": "లాగిన్",
    "auth.signupButton": "సైన్ అప్",
    "auth.switchToSignup": "ఖాతా లేదా? సైన్ అప్ చేయండి",
    "auth.switchToLogin": "ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి",
  },
  
  hi: {
    // Navigation
    "nav.home": "होम",
    "nav.cropAdvisor": "फसल सलाहकार",
    "nav.diseaseDetection": "रोग पहचान",
    "nav.marketInsights": "बाज़ार जानकारी",
    "nav.community": "समुदाय",
    "nav.askAi": "AI से पूछें",
    "nav.login": "लॉगिन",
    "nav.signup": "साइन अप",
    "nav.logout": "लॉग आउट",
    
    // Hero Section
    "hero.badge": "AI-संचालित कृषि मंच",
    "hero.title": "AI के साथ स्मार्ट खेती",
    "hero.description": "बुद्धिमान फसल चयन, रोग पहचान और बाज़ार अंतर्दृष्टि के साथ किसानों को सशक्त बनाना",
    "hero.getStarted": "शुरू करें",
    "hero.learnMore": "और जानें",
    "hero.activeFarmers": "सक्रिय किसान",
    "hero.accuracyRate": "सटीकता दर",
    "hero.cropTypes": "फसल प्रकार",
    "hero.languages": "भाषाएं",
    
    // Features Section
    "features.title": "स्मार्ट खेती के लिए सब कुछ",
    "features.subtitle": "अपने खेत के लिए बेहतर निर्णय लेने के लिए AI की शक्ति का उपयोग करें",
    "features.askAi": "AI से पूछें",
    "features.askAiDesc": "कोई भी खेती का सवाल पूछें और तुरंत जवाब पाएं",
    "features.cropSelection": "स्मार्ट फसल चयन",
    "features.cropSelectionDesc": "आपकी मिट्टी, जलवायु और बाज़ार मांग के आधार पर AI सिफारिशें",
    "features.diseaseDetection": "रोग पहचान",
    "features.diseaseDetectionDesc": "तुरंत AI निदान के लिए पत्ती की तस्वीरें अपलोड करें",
    "features.marketPrices": "बाज़ार भाव",
    "features.marketPricesDesc": "अपने मुनाफे को अधिकतम करने के लिए लाइव मंडी रेट",
    "features.community": "किसान समुदाय",
    "features.communityDesc": "विशेषज्ञों से जुड़ें और सरकारी योजनाओं तक पहुंचें",
    "features.explore": "खोजें",
    
    // Why Choose Section
    "why.title": "AgriPath AI क्यों चुनें?",
    "why.subtitle": "हम आपको सबसे सटीक और कार्रवाई योग्य अंतर्दृष्टि प्रदान करने के लिए अत्याधुनिक AI तकनीक को गहरी कृषि विशेषज्ञता के साथ जोड़ते हैं।",
    "why.realtime": "रीयल-टाइम विश्लेषण",
    "why.realtimeDesc": "वर्तमान परिस्थितियों के आधार पर तुरंत सिफारिशें प्राप्त करें",
    "why.trusted": "किसानों द्वारा विश्वसनीय",
    "why.trustedDesc": "कृषि अनुसंधान और किसान प्रतिक्रिया द्वारा समर्थित",
    "why.multilingual": "बहुभाषी समर्थन",
    "why.multilingualDesc": "आसान पहुंच के लिए 6 क्षेत्रीय भाषाओं में उपलब्ध",
    "why.phoneTitle": "आपका डिजिटल कृषि मित्र",
    "why.phoneDesc": "आपकी जेब में AI-संचालित खेती सहायक",
    
    // CTA Section
    "cta.title": "अपने खेत को बदलने के लिए तैयार हैं?",
    "cta.subtitle": "हजारों किसानों में शामिल हों जो पहले से ही स्मार्ट खेती के लिए AI का उपयोग कर रहे हैं।",
    "cta.startFree": "आज ही मुफ्त शुरू करें",
    "cta.contactSales": "सेल्स से संपर्क करें",
    
    // Footer
    "footer.devNote": "नोट: WhatsApp एकीकरण और कुछ बटन जैसी कुछ सुविधाएं वर्तमान में विकास में हैं। ये भविष्य के अपडेट में सक्षम की जाएंगी।",
    "footer.insights": "वेबसाइट अंतर्दृष्टि",
    "footer.insightsText": "AgriPath AI कृषि के लिए AI-संचालित निर्णय समर्थन प्रदर्शित करने के लिए डिज़ाइन किया गया एक प्रोटोटाइप LLaMA-आधारित स्मार्ट फार्मिंग प्लेटफ़ॉर्म है।",
    "footer.developedBy": "डेवलप्ड बाय: के. विजय",
    "footer.project": "प्रोजेक्ट: AgriPath AI – LLaMA का उपयोग करके स्मार्ट फार्मिंग",
    "footer.copyright": "© 2025 AgriPath AI. सर्वाधिकार सुरक्षित।",
    
    // Common
    "common.submit": "सबमिट करें",
    "common.loading": "लोड हो रहा है...",
    "common.error": "एक त्रुटि हुई",
    "common.success": "सफलता",
    "common.cancel": "रद्द करें",
    "common.save": "सेव करें",
    "common.detectLocation": "स्थान पता करें",
    "common.analyzing": "विश्लेषण हो रहा है...",
    "common.getRecommendations": "सिफारिशें प्राप्त करें",
    "common.askQuestion": "सवाल पूछें",
    "common.uploadImage": "छवि अपलोड करें",
    "common.selectCrop": "फसल चुनें",
    "common.selectSoilType": "मिट्टी का प्रकार चुनें",
    "common.selectSeason": "मौसम चुनें",
    "common.location": "स्थान",
    "common.soilType": "मिट्टी का प्रकार",
    "common.season": "मौसम",
    "common.waterAvailability": "पानी की उपलब्धता",
    "common.farmSize": "खेत का आकार",
    
    // Crop Advisor
    "cropAdvisor.title": "फसल सलाहकार",
    "cropAdvisor.subtitle": "अपने खेत की स्थितियों के आधार पर AI-संचालित फसल सिफारिशें प्राप्त करें",
    "cropAdvisor.formTitle": "अपने खेत का विवरण दर्ज करें",
    "cropAdvisor.locationPlaceholder": "अपना स्थान दर्ज करें या स्वचालित रूप से पता करें",
    "cropAdvisor.detecting": "स्थान पता कर रहे हैं...",
    "cropAdvisor.farmSizePlaceholder": "उदा., 5 एकड़",
    "cropAdvisor.soilTypes.alluvial": "जलोढ़ मिट्टी",
    "cropAdvisor.soilTypes.black": "काली (कपास) मिट्टी",
    "cropAdvisor.soilTypes.red": "लाल मिट्टी",
    "cropAdvisor.soilTypes.laterite": "लेटराइट",
    "cropAdvisor.soilTypes.sandy": "रेतीली मिट्टी",
    "cropAdvisor.soilTypes.clay": "चिकनी मिट्टी",
    "cropAdvisor.waterOptions.canal": "नहर सिंचाई",
    "cropAdvisor.waterOptions.borewell": "बोरवेल",
    "cropAdvisor.waterOptions.rainfed": "वर्षा आधारित",
    "cropAdvisor.waterOptions.drip": "ड्रिप सिंचाई",
    "cropAdvisor.waterOptions.river": "नदी/तालाब",
    "cropAdvisor.weatherInfo": "मौसम जानकारी",
    "cropAdvisor.temperature": "तापमान",
    "cropAdvisor.humidity": "आर्द्रता",
    "cropAdvisor.rainfall": "वर्षा",
    "cropAdvisor.forecast": "मौसम पूर्वानुमान",
    
    // Disease Detection
    "diseaseDetection.title": "रोग पहचान",
    "diseaseDetection.subtitle": "AI निदान के लिए पत्ती की छवि अपलोड करें या लक्षण बताएं",
    "diseaseDetection.uploadTitle": "पौधे की छवि अपलोड करें",
    "diseaseDetection.uploadDesc": "प्रभावित पत्ती या पौधे की स्पष्ट तस्वीर लें",
    "diseaseDetection.cropType": "फसल का प्रकार",
    "diseaseDetection.cropTypePlaceholder": "उदा., टमाटर, चावल, कपास",
    "diseaseDetection.symptoms": "लक्षण बताएं",
    "diseaseDetection.symptomsPlaceholder": "आपके द्वारा देखे गए लक्षणों का वर्णन करें (पीलापन, धब्बे, मुरझाना आदि)",
    "diseaseDetection.analyze": "रोग का विश्लेषण करें",
    
    // Market Insights
    "marketInsights.title": "बाज़ार जानकारी",
    "marketInsights.subtitle": "रीयल-टाइम बाज़ार भाव और बिक्री रणनीतियां प्राप्त करें",
    "marketInsights.cropName": "फसल का नाम",
    "marketInsights.cropPlaceholder": "उदा., गेहूं, चावल, कपास",
    "marketInsights.timeframe": "समय सीमा",
    "marketInsights.timeframePlaceholder": "उदा., इस सप्ताह, अगले महीने",
    "marketInsights.getInsights": "बाज़ार जानकारी प्राप्त करें",
    
    // Ask AI
    "askAi.title": "AI से पूछें",
    "askAi.subtitle": "कोई भी खेती का सवाल पूछें और तुरंत LLaMA-संचालित जवाब पाएं",
    "askAi.placeholder": "कोई भी खेती का सवाल पूछें... (उदा., गेहूं की पैदावार कैसे बढ़ाएं?)",
    "askAi.contextTitle": "वैकल्पिक संदर्भ",
    "askAi.cropPlaceholder": "वर्तमान फसल (वैकल्पिक)",
    "askAi.seasonPlaceholder": "वर्तमान मौसम (वैकल्पिक)",
    
    // Voice
    "voice.speak": "बोलें",
    "voice.listening": "सुन रहे हैं... अब बोलें",
    "voice.autoSpeak": "ऑटो-बोलें",
    "voice.speakResponse": "जवाब सुनें",
    
    // Auth
    "auth.loginTitle": "वापसी पर स्वागत है",
    "auth.signupTitle": "खाता बनाएं",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.loginButton": "लॉगिन",
    "auth.signupButton": "साइन अप",
    "auth.switchToSignup": "खाता नहीं है? साइन अप करें",
    "auth.switchToLogin": "पहले से खाता है? लॉगिन करें",
  },
  
  ta: {
    // Navigation
    "nav.home": "முகப்பு",
    "nav.cropAdvisor": "பயிர் ஆலோசகர்",
    "nav.diseaseDetection": "நோய் கண்டறிதல்",
    "nav.marketInsights": "சந்தை நுண்ணறிவு",
    "nav.community": "சமூகம்",
    "nav.askAi": "AI-யிடம் கேளுங்கள்",
    "nav.login": "உள்நுழைவு",
    "nav.signup": "பதிவு செய்க",
    "nav.logout": "வெளியேறு",
    
    // Hero Section
    "hero.badge": "AI-இயங்கும் விவசாய தளம்",
    "hero.title": "AI உடன் ஸ்மார்ட் விவசாயம்",
    "hero.description": "புத்திசாலி பயிர் தேர்வு, நோய் கண்டறிதல் மற்றும் சந்தை நுண்ணறிவுகளுடன் விவசாயிகளை மேம்படுத்துதல்",
    "hero.getStarted": "தொடங்குங்கள்",
    "hero.learnMore": "மேலும் அறிக",
    "hero.activeFarmers": "செயலில் உள்ள விவசாயிகள்",
    "hero.accuracyRate": "துல்லியத்தன்மை",
    "hero.cropTypes": "பயிர் வகைகள்",
    "hero.languages": "மொழிகள்",
    
    // Features Section
    "features.title": "ஸ்மார்ட் விவசாயத்திற்கு தேவையான அனைத்தும்",
    "features.subtitle": "உங்கள் பண்ணைக்கு சிறந்த முடிவுகள் எடுக்க AI சக்தியைப் பயன்படுத்துங்கள்",
    "features.askAi": "AI-யிடம் கேளுங்கள்",
    "features.askAiDesc": "எந்த விவசாய கேள்வியையும் கேட்டு உடனடி பதில்களைப் பெறுங்கள்",
    "features.cropSelection": "ஸ்மார்ட் பயிர் தேர்வு",
    "features.cropSelectionDesc": "உங்கள் மண், காலநிலை மற்றும் சந்தை தேவையின் அடிப்படையில் AI பரிந்துரைகள்",
    "features.diseaseDetection": "நோய் கண்டறிதல்",
    "features.diseaseDetectionDesc": "உடனடி AI கண்டறிதலுக்கு இலை படங்களை பதிவேற்றுங்கள்",
    "features.marketPrices": "சந்தை விலைகள்",
    "features.marketPricesDesc": "உங்கள் லாபத்தை அதிகரிக்க நேரடி மண்டி விலைகள்",
    "features.community": "விவசாயி சமூகம்",
    "features.communityDesc": "நிபுணர்களுடன் இணைந்து அரசு திட்டங்களை அணுகுங்கள்",
    "features.explore": "ஆராயுங்கள்",
    
    // Common
    "common.submit": "சமர்ப்பிக்கவும்",
    "common.loading": "ஏற்றுகிறது...",
    "common.detectLocation": "இருப்பிடத்தைக் கண்டறியவும்",
    "common.analyzing": "பகுப்பாய்வு செய்கிறது...",
    "common.getRecommendations": "பரிந்துரைகளைப் பெறுங்கள்",
    
    // Why Choose Section
    "why.title": "AgriPath AI-ஐ ஏன் தேர்வு செய்ய வேண்டும்?",
    "why.phoneTitle": "உங்கள் டிஜிட்டல் கிருஷி மித்ரா",
    "why.phoneDesc": "உங்கள் பாக்கெட்டில் AI-இயங்கும் விவசாய உதவியாளர்",
    
    // CTA
    "cta.title": "உங்கள் பண்ணையை மாற்ற தயாரா?",
    "cta.subtitle": "ஏற்கனவே AI பயன்படுத்தும் ஆயிரக்கணக்கான விவசாயிகளுடன் சேருங்கள்.",
    "cta.startFree": "இன்றே இலவசமாக தொடங்குங்கள்",
    "cta.contactSales": "விற்பனையைத் தொடர்பு கொள்ளுங்கள்",
    
    // Footer
    "footer.developedBy": "உருவாக்கியவர்: கே. விஜய்",
    "footer.copyright": "© 2025 AgriPath AI. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
  },
  
  kn: {
    // Navigation
    "nav.home": "ಮುಖಪುಟ",
    "nav.cropAdvisor": "ಬೆಳೆ ಸಲಹೆಗಾರ",
    "nav.diseaseDetection": "ರೋಗ ಪತ್ತೆ",
    "nav.marketInsights": "ಮಾರುಕಟ್ಟೆ ಒಳನೋಟಗಳು",
    "nav.community": "ಸಮುದಾಯ",
    "nav.askAi": "AI ಅನ್ನು ಕೇಳಿ",
    "nav.login": "ಲಾಗಿನ್",
    "nav.signup": "ಸೈನ್ ಅಪ್",
    "nav.logout": "ಲಾಗ್ ಔಟ್",
    
    // Hero Section
    "hero.badge": "AI-ಚಾಲಿತ ಕೃಷಿ ವೇದಿಕೆ",
    "hero.title": "AI ಜೊತೆ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ",
    "hero.description": "ಬುದ್ಧಿವಂತ ಬೆಳೆ ಆಯ್ಕೆ, ರೋಗ ಪತ್ತೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಒಳನೋಟಗಳೊಂದಿಗೆ ರೈತರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು",
    "hero.getStarted": "ಪ್ರಾರಂಭಿಸಿ",
    "hero.learnMore": "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
    "hero.activeFarmers": "ಸಕ್ರಿಯ ರೈತರು",
    "hero.accuracyRate": "ನಿಖರತೆ ದರ",
    "hero.cropTypes": "ಬೆಳೆ ವಿಧಗಳು",
    "hero.languages": "ಭಾಷೆಗಳು",
    
    // Features Section
    "features.title": "ಸ್ಮಾರ್ಟ್ ಕೃಷಿಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ",
    "features.subtitle": "ನಿಮ್ಮ ಕೃಷಿಗೆ ಉತ್ತಮ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು AI ಶಕ್ತಿಯನ್ನು ಬಳಸಿ",
    "features.askAi": "AI ಅನ್ನು ಕೇಳಿ",
    "features.askAiDesc": "ಯಾವುದೇ ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ ಮತ್ತು ತಕ್ಷಣ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ",
    "features.explore": "ಅನ್ವೇಷಿಸಿ",
    
    // Common
    "common.submit": "ಸಲ್ಲಿಸಿ",
    "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "common.detectLocation": "ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ",
    "common.analyzing": "ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    "common.getRecommendations": "ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
    
    // Why Choose
    "why.title": "AgriPath AI ಅನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು?",
    "why.phoneTitle": "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಕೃಷಿ ಮಿತ್ರ",
    "why.phoneDesc": "ನಿಮ್ಮ ಜೇಬಿನಲ್ಲಿ AI-ಚಾಲಿತ ಕೃಷಿ ಸಹಾಯಕ",
    
    // CTA
    "cta.title": "ನಿಮ್ಮ ಕೃಷಿಯನ್ನು ಪರಿವರ್ತಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
    "cta.startFree": "ಇಂದೇ ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
    
    // Footer
    "footer.developedBy": "ಅಭಿವೃದ್ಧಿಪಡಿಸಿದವರು: ಕೆ. ವಿಜಯ್",
    "footer.copyright": "© 2025 AgriPath AI. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
  },
  
  mr: {
    // Navigation
    "nav.home": "मुख्यपृष्ठ",
    "nav.cropAdvisor": "पीक सल्लागार",
    "nav.diseaseDetection": "रोग ओळख",
    "nav.marketInsights": "बाजार माहिती",
    "nav.community": "समुदाय",
    "nav.askAi": "AI ला विचारा",
    "nav.login": "लॉगिन",
    "nav.signup": "साइन अप",
    "nav.logout": "लॉग आउट",
    
    // Hero Section
    "hero.badge": "AI-चालित कृषी व्यासपीठ",
    "hero.title": "AI सह स्मार्ट शेती",
    "hero.description": "हुशार पीक निवड, रोग ओळख आणि बाजार अंतर्दृष्टी सह शेतकऱ्यांना सक्षम करणे",
    "hero.getStarted": "सुरू करा",
    "hero.learnMore": "अधिक जाणून घ्या",
    "hero.activeFarmers": "सक्रिय शेतकरी",
    "hero.accuracyRate": "अचूकता दर",
    "hero.cropTypes": "पीक प्रकार",
    "hero.languages": "भाषा",
    
    // Features Section
    "features.title": "स्मार्ट शेतीसाठी सर्व काही",
    "features.subtitle": "तुमच्या शेतासाठी चांगले निर्णय घेण्यासाठी AI शक्ती वापरा",
    "features.askAi": "AI ला विचारा",
    "features.askAiDesc": "कोणताही शेती प्रश्न विचारा आणि त्वरित उत्तरे मिळवा",
    "features.explore": "शोधा",
    
    // Common
    "common.submit": "सबमिट करा",
    "common.loading": "लोड होत आहे...",
    "common.detectLocation": "स्थान शोधा",
    "common.analyzing": "विश्लेषण करत आहे...",
    "common.getRecommendations": "शिफारसी मिळवा",
    
    // Why Choose
    "why.title": "AgriPath AI का निवडावे?",
    "why.phoneTitle": "तुमचा डिजिटल कृषी मित्र",
    "why.phoneDesc": "तुमच्या खिशात AI-चालित शेती सहाय्यक",
    
    // CTA
    "cta.title": "तुमचे शेत बदलण्यासाठी तयार आहात?",
    "cta.startFree": "आजच मोफत सुरू करा",
    
    // Footer
    "footer.developedBy": "विकसित: के. विजय",
    "footer.copyright": "© 2025 AgriPath AI. सर्व हक्क राखीव.",
  },
};

export default LanguageProvider;
