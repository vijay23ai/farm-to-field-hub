import { useState, useEffect } from "react";
import { MessageCircle, ArrowLeft, Loader2, MapPin, Cloud, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/hooks/useVoice";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-ai`;

const AskAI = () => {
  const { toast } = useToast();
  const { location, getLocation } = useGeolocation();
  const { weather, fetchWeather } = useWeather();
  const { t, language } = useLanguage();
  const voice = useVoice({ language });
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [formData, setFormData] = useState({
    crop: "",
    season: "",
  });

  // Update question when voice transcript changes
  useEffect(() => {
    if (voice.transcript) {
      setQuestion(prev => prev + " " + voice.transcript);
    }
  }, [voice.transcript]);

  // Auto-speak response when complete
  useEffect(() => {
    if (autoSpeak && response && !isLoading) {
      // Extract plain text from markdown for speaking
      const plainText = response.replace(/[#*_`\[\]]/g, "").substring(0, 500);
      voice.speak(plainText);
    }
  }, [response, isLoading, autoSpeak]);

  // Fetch weather when location is available
  useEffect(() => {
    if (location.latitude && location.longitude && !weather.loading && !weather.temperature) {
      fetchWeather(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude, fetchWeather, weather.loading, weather.temperature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: t("common.error"),
        description: "Please enter your farming question.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          question,
          language,
          location: location.city && location.state ? `${location.city}, ${location.state}` : "",
          crop: formData.crop,
          season: formData.season,
          weather: weather.temperature ? {
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainfall: weather.rainfall,
            forecast: weather.forecast,
          } : null,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast({ title: "Rate Limited", description: "Please try again later.", variant: "destructive" });
          return;
        }
        if (resp.status === 402) {
          toast({ title: "Credits Required", description: "Please add credits to continue.", variant: "destructive" });
          return;
        }
        throw new Error("Failed to get response");
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
        description: "Failed to get AI response. Please try again.",
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
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">{t("askAi.title")}</h1>
                <p className="text-muted-foreground">{t("askAi.subtitle")}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Context Panel */}
              <div className="lg:col-span-1 space-y-4">
                {/* Location Card */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{t("common.location")}</h3>
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {location.city ? (
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{location.city}</p>
                      <p className="text-muted-foreground">{location.state}, {location.country}</p>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={getLocation}
                      disabled={location.loading}
                      className="w-full"
                    >
                      {location.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-2" />
                      )}
                      {t("common.detectLocation")}
                    </Button>
                  )}
                  {location.error && (
                    <p className="text-xs text-destructive mt-2">{location.error}</p>
                  )}
                </div>

                {/* Weather Card */}
                {weather.temperature > 0 && (
                  <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{t("cropAdvisor.weatherInfo")}</h3>
                      <Cloud className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("cropAdvisor.temperature")}</p>
                        <p className="font-medium">{weather.temperature}°C</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("cropAdvisor.humidity")}</p>
                        <p className="font-medium">{weather.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("cropAdvisor.rainfall")}</p>
                        <p className="font-medium">{weather.rainfall}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("cropAdvisor.forecast")}</p>
                        <p className="font-medium text-xs">{weather.forecast}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Context Inputs */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3">
                  <h3 className="font-semibold text-sm">{t("askAi.contextTitle")}</h3>
                  <div>
                    <Label htmlFor="crop" className="text-xs">{t("askAi.cropPlaceholder")}</Label>
                    <Input
                      id="crop"
                      placeholder={t("askAi.cropPlaceholder")}
                      value={formData.crop}
                      onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="season" className="text-xs">{t("askAi.seasonPlaceholder")}</Label>
                    <Input
                      id="season"
                      placeholder={t("askAi.seasonPlaceholder")}
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Chat Panel */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="question">{t("common.askQuestion")}</Label>
                        <div className="flex items-center gap-2">
                          {/* Voice Input Button */}
                          {voice.isSupported && (
                            <Button
                              type="button"
                              size="sm"
                              variant={voice.isListening ? "destructive" : "outline"}
                              onClick={voice.isListening ? voice.stopListening : voice.startListening}
                              className="gap-1"
                            >
                              {voice.isListening ? (
                                <>
                                  <MicOff className="w-4 h-4" />
                                  <span className="text-xs">Stop</span>
                                </>
                              ) : (
                                <>
                                  <Mic className="w-4 h-4" />
                                  <span className="text-xs">{t("voice.speak")}</span>
                                </>
                              )}
                            </Button>
                          )}
                          {/* Auto-Speak Toggle */}
                          <Button
                            type="button"
                            size="sm"
                            variant={autoSpeak ? "default" : "outline"}
                            onClick={() => setAutoSpeak(!autoSpeak)}
                            className="gap-1"
                          >
                            {autoSpeak ? (
                              <Volume2 className="w-4 h-4" />
                            ) : (
                              <VolumeX className="w-4 h-4" />
                            )}
                            <span className="text-xs">{t("voice.autoSpeak")}</span>
                          </Button>
                        </div>
                      </div>
                      
                      {voice.isListening && (
                        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg text-sm text-destructive">
                          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                          {t("voice.listening")}
                        </div>
                      )}
                      
                      {voice.error && (
                        <p className="text-xs text-destructive">{voice.error}</p>
                      )}
                      
                      <Textarea
                        id="question"
                        placeholder={t("askAi.placeholder")}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t("common.analyzing")}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {t("nav.askAi")}
                          </>
                        )}
                      </Button>
                      {response && (
                        <Button
                          type="button"
                          variant="outline"
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
                        </Button>
                      )}
                    </div>
                  </form>

                  {/* Response */}
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">AI Response</h3>
                    {response ? (
                      <div className="prose prose-sm max-w-none text-foreground bg-accent/30 rounded-xl p-4">
                        <ReactMarkdown>{response}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8 bg-accent/20 rounded-xl">
                        <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">{t("askAi.subtitle")}</p>
                      </div>
                    )}
                  </div>
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

export default AskAI;
