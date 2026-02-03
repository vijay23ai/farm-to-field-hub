import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-display">
          {t("cta.title")}
        </h2>
        <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          {t("cta.subtitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/auth">
            <Button 
              size="lg" 
              className="rounded-full px-8 gap-2 bg-background text-foreground hover:bg-background/90"
            >
              {t("cta.startFree")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/community">
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              {t("cta.contactSales")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
