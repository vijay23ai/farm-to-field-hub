import { useState, useEffect } from "react";
import { Leaf, ArrowLeft, Loader2, MapPin, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crop-advisor`;

const soilTypes = [
  "Alluvial Soil",
  "Black Soil (Regur)",
  "Red Soil",
  "Laterite Soil",
  "Desert Soil",
  "Mountain Soil",
  "Clay Soil",
  "Sandy Soil",
  "Loamy Soil",
];

const climateTypes = [
  "Tropical",
  "Subtropical",
  "Temperate",
  "Arid/Semi-Arid",
  "Humid",
  "Monsoon",
];

const waterOptions = [
  "Abundant (Canal/River)",
  "Moderate (Well/Borewell)",
  "Limited (Rainfed)",
  "Drip Irrigation Available",
];

const CropAdvisor = () => {
  const { toast } = useToast();
  const { location, getLocation } = useGeolocation();
  const { weather, fetchWeather } = useWeather();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [formData, setFormData] = useState({
    soilType: "",
    climate: "",
    location: "",
    waterAvailability: "",
    farmSize: "",
  });

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
        title: "Missing Information",
        description: "Please fill in soil type, climate, and location.",
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
          ...formData,
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
        title: "Error",
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
            Back to Home
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">Smart Crop Selection</h1>
                <p className="text-muted-foreground">LLaMA-powered recommendations based on your farm conditions</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Farm Details</h2>
                
                {/* Location & Weather Status */}
                <div className="mb-4 p-3 bg-accent/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {location.city ? `${location.city}, ${location.state}` : "Location not detected"}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={getLocation}
                      disabled={location.loading}
                    >
                      {location.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Detect"}
                    </Button>
                  </div>
                  {weather.temperature > 0 && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Cloud className="w-3 h-3" />
                        {weather.temperature}°C
                      </span>
                      <span>Humidity: {weather.humidity}%</span>
                      <span>Rainfall: {weather.rainfall}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type *</Label>
                    <Select value={formData.soilType} onValueChange={(v) => setFormData({ ...formData, soilType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypes.map((soil) => (
                          <SelectItem key={soil} value={soil}>{soil}</SelectItem>
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
                          <SelectItem key={climate} value={climate}>{climate}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location/State *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Maharashtra, Punjab"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waterAvailability">Water Availability</Label>
                    <Select value={formData.waterAvailability} onValueChange={(v) => setFormData({ ...formData, waterAvailability: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select water source" />
                      </SelectTrigger>
                      <SelectContent>
                        {waterOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size</Label>
                    <Input
                      id="farmSize"
                      placeholder="e.g., 5 acres, 2 hectares"
                      value={formData.farmSize}
                      onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Get Recommendations"
                    )}
                  </Button>
                </form>
              </div>

              {/* Results */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
                {response ? (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Leaf className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Fill in your farm details and click "Get Recommendations" to receive LLaMA-powered crop suggestions.</p>
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
