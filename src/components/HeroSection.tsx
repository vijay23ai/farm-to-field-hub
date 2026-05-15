import { ArrowRight, Sparkles } from "lucide-react";
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
          <div className="neon-border neon-border-thin inline-flex rounded-full mb-6">
            <span className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground/90 tracking-wide uppercase">{t("hero.badge")}</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-display gradient-text">
            {t("hero.title")}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-foreground/75 mb-8 max-w-xl">
            {t("hero.description")}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link to="/crop-advisor" className="neon-border rounded-full">
              <span className="relative z-10 inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-foreground">
                {t("hero.getStarted")} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link to="/ask-ai" className="neon-border neon-border-thin rounded-full">
              <span className="relative z-10 inline-flex items-center px-8 py-3 text-sm font-medium text-foreground/85">
                {t("hero.learnMore")}
              </span>
            </Link>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="mt-16 md:mt-24">
          <div className="neon-border inline-flex rounded-2xl">
            <div className="relative z-10 flex flex-wrap gap-8 md:gap-12 px-8 py-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
