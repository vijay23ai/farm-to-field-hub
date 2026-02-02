import { Sprout, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border/50">
      <div className="container mx-auto px-4">
        {/* Development Notice */}
        <div className="mb-8 p-4 rounded-xl bg-accent/30 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Note:</strong> Some features such as WhatsApp integration and certain buttons are currently under development and may not work at this stage. These will be enabled in future updates.
          </p>
        </div>

        {/* Website Insights */}
        <div className="mb-8 p-6 rounded-xl bg-primary/5 border border-border">
          <h3 className="font-semibold text-foreground mb-2">Website Insights</h3>
          <p className="text-sm text-muted-foreground">
            AgriPath AI is a prototype LLaMA-based smart farming platform designed to demonstrate AI-driven decision support for agriculture. The system integrates real-time APIs, disease detection models, and Large Language Models to provide farmer-friendly guidance. Some features are in development and will be enhanced in future versions.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">
              <span className="text-foreground">Agri</span>
              <span className="text-primary">Path</span>
              <span className="text-foreground"> AI</span>
            </span>
          </Link>
          
          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/ask-ai" className="hover:text-foreground transition-colors">Ask AI</Link>
            <Link to="/crop-advisor" className="hover:text-foreground transition-colors">Crop Advisor</Link>
            <Link to="/disease-detection" className="hover:text-foreground transition-colors">Disease Detection</Link>
            <Link to="/market-insights" className="hover:text-foreground transition-colors">Market Insights</Link>
          </nav>
          
          {/* Developer Credits */}
          <div className="text-center md:text-right">
            <p className="text-sm font-medium text-foreground">
              Developed by: K. Vijay
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-end gap-1">
              <Phone className="w-3 h-3" />
              9154521135
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Project: AgriPath AI – Smart Farming Using LLaMA
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 AgriPath AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
