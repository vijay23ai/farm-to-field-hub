import { useState } from "react";
import { TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-insights`;

const popularCrops = [
  "Wheat",
  "Rice",
  "Cotton",
  "Sugarcane",
  "Soybean",
  "Onion",
  "Potato",
  "Tomato",
  "Maize",
  "Groundnut",
  "Mustard",
  "Pulses",
];

const MarketInsights = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [formData, setFormData] = useState({
    crop: "",
    location: "",
    timeframe: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.crop || !formData.location) {
      toast({
        title: t("common.error"),
        description: "Please select a crop and enter your location.",
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
          description: "Please log in to get market insights securely.",
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
        throw new Error("Failed to get insights");
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
        description: "Failed to get market insights. Please try again.",
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
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">{t("marketInsights.title")}</h1>
                <p className="text-muted-foreground">{t("marketInsights.subtitle")}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">{t("common.selectCrop")} & {t("common.location")}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crop">{t("marketInsights.cropName")} *</Label>
                    <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.selectCrop")} />
                      </SelectTrigger>
                      <SelectContent>
                        {popularCrops.map((crop) => (
                          <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t("common.location")} *</Label>
                    <Input
                      id="location"
                      placeholder={t("marketInsights.cropPlaceholder")}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeframe">{t("marketInsights.timeframe")}</Label>
                    <Select value={formData.timeframe} onValueChange={(v) => setFormData({ ...formData, timeframe: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("marketInsights.timeframePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Week</SelectItem>
                        <SelectItem value="monthly">This Month</SelectItem>
                        <SelectItem value="quarterly">This Quarter</SelectItem>
                        <SelectItem value="yearly">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("common.analyzing")}
                      </>
                    ) : (
                      t("marketInsights.getInsights")
                    )}
                  </Button>
                </form>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3">Quick Market Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-accent/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">₹2,450</p>
                      <p className="text-xs text-muted-foreground">Wheat (per quintal)</p>
                    </div>
                    <div className="bg-accent/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">₹3,800</p>
                      <p className="text-xs text-muted-foreground">Rice (per quintal)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">AI Market Analysis</h2>
                {response ? (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>{t("marketInsights.subtitle")}</p>
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

export default MarketInsights;
