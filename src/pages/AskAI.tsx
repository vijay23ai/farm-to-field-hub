import { useState, useEffect } from "react";
import { MessageCircle, ArrowLeft, Loader2, MapPin, Cloud, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-ai`;

const AskAI = () => {
  const { toast } = useToast();
  const { location, getLocation } = useGeolocation();
  const { weather, fetchWeather } = useWeather();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [formData, setFormData] = useState({
    crop: "",
    season: "",
  });

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
        title: "Missing Question",
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
        title: "Error",
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
            Back to Home
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">Ask AI</h1>
                <p className="text-muted-foreground">Get instant answers to your farming questions powered by LLaMA</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Context Panel */}
              <div className="lg:col-span-1 space-y-4">
                {/* Location Card */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Location</h3>
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
                      Detect Location
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
                      <h3 className="font-semibold text-sm">Weather</h3>
                      <Cloud className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Temp</p>
                        <p className="font-medium">{weather.temperature}°C</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Humidity</p>
                        <p className="font-medium">{weather.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rainfall</p>
                        <p className="font-medium">{weather.rainfall}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Forecast</p>
                        <p className="font-medium text-xs">{weather.forecast}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Context Inputs */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3">
                  <h3 className="font-semibold text-sm">Context (Optional)</h3>
                  <div>
                    <Label htmlFor="crop" className="text-xs">Current Crop</Label>
                    <Input
                      id="crop"
                      placeholder="e.g., Wheat, Rice"
                      value={formData.crop}
                      onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="season" className="text-xs">Season</Label>
                    <Input
                      id="season"
                      placeholder="e.g., Kharif, Rabi"
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
                      <Label htmlFor="question">Your Farming Question</Label>
                      <Textarea
                        id="question"
                        placeholder="Ask anything about farming, crops, pests, weather, soil, irrigation, government schemes..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Ask AI
                        </>
                      )}
                    </Button>
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
                        <p className="text-sm">Your AI response will appear here.</p>
                        <p className="text-xs mt-1">Enable location for personalized answers!</p>
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
