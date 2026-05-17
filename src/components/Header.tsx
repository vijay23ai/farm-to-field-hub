import { Sprout, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: "Robo", href: "/robo" },
    { name: t("nav.cropAdvisor"), href: "/crop-advisor" },
    { name: t("nav.diseaseDetection"), href: "/disease-detection" },
    { name: t("nav.marketInsights"), href: "/market-insights" },
    { name: t("nav.community"), href: "/community" },
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="neon-border rounded-2xl px-4 md:px-6">
        <div className="relative z-10 flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 pr-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 border border-accent/30 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-accent" />
            </div>
            <span className="text-lg font-display font-bold tracking-tight gradient-text-gold whitespace-nowrap">
              AgriPath AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="neon-border neon-border-thin rounded-full"
              >
                <span className="relative z-10 block px-4 py-1.5 text-xs font-medium text-foreground/85 hover:text-primary transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="relative z-10 flex items-center gap-3">
            <LanguageSelector />
            
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-32">
                  {user.email}
                </span>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.login")}
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="rounded-full">
                    {t("nav.signup")}
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="relative z-10 md:hidden py-4 border-t border-border/60">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
