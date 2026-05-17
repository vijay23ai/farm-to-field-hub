import { Leaf, Bug, TrendingUp, Users, ArrowUpRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    { icon: MessageCircle, title: t("features.askAi"), description: t("features.askAiDesc"), href: "/ask-ai" },
    { icon: Leaf, title: t("features.cropSelection"), description: t("features.cropSelectionDesc"), href: "/crop-advisor" },
    { icon: Bug, title: t("features.diseaseDetection"), description: t("features.diseaseDetectionDesc"), href: "/disease-detection" },
    { icon: TrendingUp, title: t("features.marketPrices"), description: t("features.marketPricesDesc"), href: "/market-insights" },
    { icon: Users, title: t("features.community"), description: t("features.communityDesc"), href: "/community" },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-16">
          <div className="eyebrow mb-4">
            <span className="w-8 h-px bg-accent/60" />
            <span>The platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display mb-5 text-balance">
            Every tool a modern <span className="gradient-text-gold">farmer needs</span>
          </h2>
          <p className="text-lg text-foreground/65 text-pretty">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link
              key={f.href}
              to={f.href}
              className={`prestige-card group animate-fade-up delay-${((i % 5) + 1) * 100}`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <f.icon className="w-5 h-5 text-accent" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:rotate-45 transition-all duration-500" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {f.title}
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed flex-1">
                  {f.description}
                </p>
                <div className="mt-6 pt-5 border-t border-border/50 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent/80 font-medium">
                  {t("features.explore")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
