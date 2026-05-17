import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="glass-panel relative overflow-hidden p-12 md:p-20 text-center">
          {/* glow accents */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="eyebrow justify-center mb-5 flex">
              <span className="w-6 h-px bg-accent/60" />
              <span>Get started</span>
              <span className="w-6 h-px bg-accent/60" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display mb-5 text-balance">
              {t("cta.title")}
            </h2>
            <p className="text-lg text-foreground/65 mb-10 text-pretty">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth" className="btn-gold">
                {t("cta.startFree")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/community" className="btn-ghost-gold">
                {t("cta.contactSales")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
