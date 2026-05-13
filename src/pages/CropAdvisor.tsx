import { useState, useEffect } from "react";
import { Leaf, ArrowLeft, Loader2, MapPin, Cloud, Volume2, VolumeX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useVoice } from "@/hooks/useVoice";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crop-advisor`;

const CropAdvisor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { location, getLocation } = useGeolocation();
  const { weather, fetchWeather } = useWeather();
  const { t, language } = useLanguage();
  const voice = useVoice({ language });
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [formData, setFormData] = useState({
    soilType: "",
    climate: "",
    location: "",
    waterAvailability: "",
    farmSize: "",
  });

  const soilTypes = [
    { value: "Alluvial Soil", label: t("cropAdvisor.soilTypes.alluvial") },
    { value: "Black Soil (Regur)", label: t("cropAdvisor.soilTypes.black") },
    { value: "Red Soil", label: t("cropAdvisor.soilTypes.red") },
    { value: "Laterite Soil", label: t("cropAdvisor.soilTypes.laterite") },
    { value: "Sandy Soil", label: t("cropAdvisor.soilTypes.sandy") },
    { value: "Clay Soil", label: t("cropAdvisor.soilTypes.clay") },
  ];

  const climateTypes = [
    { value: "Tropical", label: "Tropical" },
    { value: "Subtropical", label: "Subtropical" },
    { value: "Temperate", label: "Temperate" },
    { value: "Arid/Semi-Arid", label: "Arid/Semi-Arid" },
    { value: "Humid", label: "Humid" },
    { value: "Monsoon", label: "Monsoon" },
  ];

  const waterOptions = [
    { value: "Canal Irrigation", label: t("cropAdvisor.waterOptions.canal") },
    { value: "Borewell", label: t("cropAdvisor.waterOptions.borewell") },
    { value: "Rainfed", label: t("cropAdvisor.waterOptions.rainfed") },
    { value: "Drip Irrigation", label: t("cropAdvisor.waterOptions.drip") },
    { value: "River/Pond", label: t("cropAdvisor.waterOptions.river") },
  ];

  // Auto-fill location when detected
  useEffect(() => {
    if (location.city && location.state && !formData.location) {
      setFormData(prev => ({
        ...prev,
        location: `${location.city}, ${location.state}`,
      }));
    }
  }, [location.city, location.state, formData.location]);

  // Fetch weather when location is available
  useEffect(() => {
    if (location.latitude && location.longitude && !weather.loading && !weather.temperature) {
      fetchWeather(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude, fetchWeather, weather.loading, weather.temperature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.soilType || !formData.climate || !formData.location) {
      toast({
        title: t("common.error"),
        description: "Please fill in soil type, climate, and location.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        toast({
          title: "Login Required",
          description: "Please log in to get crop recommendations securely.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          language,
          weather: weather.temperature ? {
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainfall: weather.rainfall,
            forecast: weather.forecast,
          } : null,
          coordinates: location.latitude ? {
            latitude: location.latitude,
            longitude: location.longitude,
          } : null,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 401) {
          toast({ title: "Login Required", description: "Please log in and try again.", variant: "destructive" });
          navigate("/auth");
          return;
        }
        if (resp.status === 429) {
          toast({ title: "Rate Limited", description: "Please try again later.", variant: "destructive" });
          return;
        }
        if (resp.status === 402) {
          toast({ title: "Credits Required", description: "Please add credits to continue.", variant: "destructive" });
          return;
        }
        throw new Error("Failed to get recommendations");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: t("common.error"),
        description: "Failed to get crop recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("nav.home")}
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">{t("cropAdvisor.title")}</h1>
                <p className="text-muted-foreground">{t("cropAdvisor.subtitle")}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">{t("cropAdvisor.formTitle")}</h2>
                
                {/* Location & Weather Status */}
                <div className="mb-4 p-3 bg-accent/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {location.city ? `${location.city}, ${location.state}` : t("cropAdvisor.locationPlaceholder")}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={getLocation}
                      disabled={location.loading}
                    >
                      {location.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : t("common.detectLocation")}
                    </Button>
                  </div>
                  {weather.temperature > 0 && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Cloud className="w-3 h-3" />
                        {weather.temperature}°C
                      </span>
                      <span>{t("cropAdvisor.humidity")}: {weather.humidity}%</span>
                      <span>{t("cropAdvisor.rainfall")}: {weather.rainfall}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="soilType">{t("common.soilType")} *</Label>
                    <Select value={formData.soilType} onValueChange={(v) => setFormData({ ...formData, soilType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.selectSoilType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypes.map((soil) => (
                          <SelectItem key={soil.value} value={soil.value}>{soil.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="climate">Climate *</Label>
                    <Select value={formData.climate} onValueChange={(v) => setFormData({ ...formData, climate: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select climate" />
                      </SelectTrigger>
                      <SelectContent>
                        {climateTypes.map((climate) => (
                          <SelectItem key={climate.value} value={climate.value}>{climate.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t("common.location")} *</Label>
                    <Input
                      id="location"
                      placeholder={t("cropAdvisor.locationPlaceholder")}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waterAvailability">{t("common.waterAvailability")}</Label>
                    <Select value={formData.waterAvailability} onValueChange={(v) => setFormData({ ...formData, waterAvailability: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select water source" />
                      </SelectTrigger>
                      <SelectContent>
                        {waterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmSize">{t("common.farmSize")}</Label>
                    <Input
                      id="farmSize"
                      placeholder={t("cropAdvisor.farmSizePlaceholder")}
                      value={formData.farmSize}
                      onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("common.analyzing")}
                      </>
                    ) : (
                      t("common.getRecommendations")
                    )}
                  </Button>
                </form>
              </div>

              {/* Results */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">AI {t("common.getRecommendations")}</h2>
                  {response && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (voice.isSpeaking) {
                          voice.stopSpeaking();
                        } else {
                          const plainText = response.replace(/[#*_`\[\]]/g, "").substring(0, 500);
                          voice.speak(plainText);
                        }
                      }}
                    >
                      {voice.isSpeaking ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      <span className="ml-2 text-xs">{t("voice.speakResponse")}</span>
                    </Button>
                  )}
                </div>
                {response ? (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Leaf className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>{t("cropAdvisor.subtitle")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CropAdvisor;
