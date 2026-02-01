import { Zap, Shield, Languages } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Real-time Analysis",
    description: "Get instant recommendations based on current conditions",
  },
  {
    icon: Shield,
    title: "Trusted by Farmers",
    description: "Backed by agricultural research and farmer feedback",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description: "Available in 6 regional languages for easy access",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-display">
              Why Choose AgriPath AI?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              We combine cutting-edge AI technology with deep agricultural expertise to bring you the most accurate and actionable insights.
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
                    Your Digital Krushi Mitra
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    AI-powered farming assistant in your pocket
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
