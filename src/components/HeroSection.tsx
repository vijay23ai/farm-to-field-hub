import { ArrowRight, Sparkles, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-smart-farm.jpg";
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
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16">
      {/* Ambient gold glow */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT — text */}
          <div className="lg:col-span-7 animate-fade-up">
            <div className="eyebrow mb-6">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 font-display leading-[1.02] text-balance">
              <span className="text-foreground">Cultivate</span>{" "}
              <span className="gradient-text">intelligence.</span>
              <br />
              <span className="text-foreground/90">Harvest </span>
              <span className="gradient-text-gold">prosperity.</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-xl leading-relaxed text-pretty">
              {t("hero.description")}
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <Link to="/robo" className="btn-gold group">
                Meet AgriRobo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/crop-advisor" className="btn-ghost-gold">
                {t("hero.getStarted")}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`gold-border px-4 py-4 animate-fade-up delay-${(i + 2) * 100}`}
                >
                  <div className="relative z-10">
                    <div className="text-2xl md:text-3xl font-display font-bold gradient-text-gold mb-1">
                      {s.value}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — image */}
          <div className="lg:col-span-5 animate-scale-in delay-200">
            <div className="relative">
              {/* Decorative gold ring */}
              <div className="absolute -inset-6 rounded-[2rem] border border-accent/20 pointer-events-none" />
              <div className="absolute -inset-2 rounded-[1.75rem] bg-gradient-to-br from-accent/30 via-transparent to-primary/30 blur-2xl opacity-60 pointer-events-none" />

              <div className="relative rounded-[1.5rem] overflow-hidden glass-panel p-1.5">
                <img
                  src={heroImg}
                  alt="Smart farming — seedling with data overlay"
                  width={1536}
                  height={1024}
                  className="rounded-[1.25rem] w-full h-auto object-cover"
                />
                {/* Floating badge */}
                <div className="absolute top-6 left-6 glass-panel px-4 py-2.5 flex items-center gap-2 animate-float-slow">
                  <div className="w-2 h-2 rounded-full bg-primary-glow shadow-[0_0_12px_hsl(var(--primary-glow))]" />
                  <span className="text-xs font-medium tracking-wide text-cream">Live AI Insights</span>
                </div>
                <div className="absolute bottom-6 right-6 glass-panel px-4 py-3 animate-float-slow" style={{ animationDelay: "1.5s" }}>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Soil Health</div>
                      <div className="text-sm font-semibold text-foreground">Optimal · 92%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
