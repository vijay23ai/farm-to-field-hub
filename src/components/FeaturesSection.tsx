import { Leaf, Bug, TrendingUp, Users, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageCircle,
      title: t("features.askAi"),
      description: t("features.askAiDesc"),
      href: "/ask-ai",
      color: "bg-primary text-primary-foreground",
    },
    {
      icon: Leaf,
      title: t("features.cropSelection"),
      description: t("features.cropSelectionDesc"),
      href: "/crop-advisor",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Bug,
      title: t("features.diseaseDetection"),
      description: t("features.diseaseDetectionDesc"),
      href: "/disease-detection",
      color: "bg-secondary/20 text-secondary-foreground",
    },
    {
      icon: TrendingUp,
      title: t("features.marketPrices"),
      description: t("features.marketPricesDesc"),
      href: "/market-insights",
      color: "bg-accent text-accent-foreground",
    },
    {
      icon: Users,
      title: t("features.community"),
      description: t("features.communityDesc"),
      href: "/community",
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.href}
              to={feature.href}
              className="group p-6 rounded-2xl bg-card border border-border/50 shadow-sm feature-card-hover"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {feature.description}
              </p>
              <div className="flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                {t("features.explore")}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
