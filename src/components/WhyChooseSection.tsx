import { Zap, Shield, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyChooseSection = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Zap,
      title: t("why.realtime"),
      description: t("why.realtimeDesc"),
    },
    {
      icon: Shield,
      title: t("why.trusted"),
      description: t("why.trustedDesc"),
    },
    {
      icon: Languages,
      title: t("why.multilingual"),
      description: t("why.multilingualDesc"),
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-display">
              {t("why.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              {t("why.subtitle")}
            </p>
            
            {/* Benefits List */}
            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Content - Phone Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-72 h-[500px] bg-gradient-to-br from-primary to-primary/80 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-card rounded-[2.5rem] flex flex-col items-center justify-center p-6 overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground text-center mb-2 font-display">
                    {t("why.phoneTitle")}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    {t("why.phoneDesc")}
                  </p>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary/30 rounded-full blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
