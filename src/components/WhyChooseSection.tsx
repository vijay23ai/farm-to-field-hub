import { Zap, Shield, Languages, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyChooseSection = () => {
  const { t } = useLanguage();

  const benefits = [
    { icon: Zap, title: t("why.realtime"), description: t("why.realtimeDesc") },
    { icon: Shield, title: t("why.trusted"), description: t("why.trustedDesc") },
    { icon: Languages, title: t("why.multilingual"), description: t("why.multilingualDesc") },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-deep/10 to-transparent pointer-events-none" />

      <div className="container relative mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="eyebrow mb-4">
              <span className="w-8 h-px bg-accent/60" />
              <span>Why AgriPath AI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display mb-6 text-balance leading-[1.05]">
              Built for the land. <span className="gradient-text-gold">Tuned for India.</span>
            </h2>
            <p className="text-lg text-foreground/65 mb-12 text-pretty">
              {t("why.subtitle")}
            </p>

            <div className="space-y-5">
              {benefits.map((b, i) => (
                <div
                  key={b.title}
                  className={`gold-border p-5 flex gap-5 items-start animate-fade-up delay-${(i + 1) * 100}`}
                >
                  <div className="relative z-10 flex gap-5 items-start w-full">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <b.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-foreground mb-1.5">{b.title}</h4>
                      <p className="text-sm text-foreground/60 leading-relaxed">{b.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stat panel */}
          <div className="relative animate-scale-in delay-200">
            <div className="absolute -inset-8 bg-gradient-to-br from-accent/15 to-primary/20 blur-3xl rounded-full pointer-events-none" />
            <div className="glass-panel relative p-10 space-y-8">
              <div>
                <div className="eyebrow mb-2"><span>Field intelligence</span></div>
                <div className="text-5xl md:text-6xl font-display font-bold gradient-text-gold">
                  +38%
                </div>
                <p className="text-sm text-foreground/65 mt-2">
                  Avg. yield improvement reported by farmers using AgriPath's AI recommendations.
                </p>
              </div>

              <div className="border-t border-border/60 pt-8 space-y-4">
                {[
                  "Real-time weather & soil-aware crop plans",
                  "Disease detection from a single leaf photo",
                  "Live mandi prices across 100+ markets",
                  "Conversational AI in 6 Indian languages",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground/80">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
