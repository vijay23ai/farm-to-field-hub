import { useState } from "react";
import { MessageCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const WhatsAppCTA = () => {
  const [phone, setPhone] = useState("");

  const sanitize = (raw: string) => raw.replace(/[^\d+]/g, "");

  const handleChat = () => {
    const cleaned = sanitize(phone);
    // Accept formats like +919876543210 or 919876543210; require 10-15 digits
    const digits = cleaned.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      toast({
        title: "Invalid number",
        description: "Enter your WhatsApp number with country code (e.g. +91 9876543210).",
        variant: "destructive",
      });
      return;
    }
    const waNumber = digits.length === 10 ? `91${digits}` : digits;
    const text = encodeURIComponent("Hi AgriPath AI 🌱 — I need farming help.");
    window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto p-8 md:p-12 border-2 border-primary/20 shadow-xl">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Bot className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Chat with AgriPath AI on WhatsApp 💬
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Send a message, photo of a sick plant, or a voice note. Our robot farmer replies
                instantly with crop advice, disease treatment, and mandi prices — right inside WhatsApp.
              </p>
            </div>

            <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
              <Input
                type="tel"
                inputMode="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                className="flex-1 h-12 text-base"
                aria-label="Your WhatsApp number"
                maxLength={20}
              />
              <Button
                onClick={handleChat}
                size="lg"
                className="h-12 bg-green-600 hover:bg-green-700 text-primary-foreground gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Open WhatsApp
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Enter your WhatsApp number with country code. We open a chat directly — no signup needed.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default WhatsAppCTA;