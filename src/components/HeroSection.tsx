import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  const stats = [
    { value: "50K+", label: t("hero.activeFarmers") },
    { value: "95%", label: t("hero.accuracyRate") },
    { value: "100+", label: t("hero.cropTypes") },
    { value: "6", label: t("hero.languages") },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-start overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24">
        <div className="max-w-2xl animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground/90">{t("hero.badge")}</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 font-display">
            {t("hero.title")}
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl">
            {t("hero.description")}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link to="/crop-advisor">
              <Button size="lg" className="rounded-full px-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                {t("hero.getStarted")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/ask-ai">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 bg-background/10 border-primary-foreground/30 text-primary-foreground hover:bg-background/20 hover:text-primary-foreground backdrop-blur-sm"
              >
                {t("hero.learnMore")}
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="mt-16 md:mt-24">
          <div className="inline-flex flex-wrap gap-8 md:gap-12 px-8 py-6 rounded-2xl bg-card/95 backdrop-blur-md border border-border/50 shadow-xl">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
