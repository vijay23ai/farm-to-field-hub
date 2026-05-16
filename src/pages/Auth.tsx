import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const COMMON_WEAK_PASSWORDS = new Set([
  "password", "password1", "password123", "passw0rd", "12345678", "123456789",
  "qwerty123", "qwertyuiop", "1q2w3e4r", "abc12345", "iloveyou", "admin123",
  "welcome1", "letmein1", "monkey123", "dragon123", "sunshine", "princess1",
  "football1", "baseball1",
]);

type PwChecks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
  notCommon: boolean;
};

const evaluatePassword = (pw: string): PwChecks => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
  notCommon: pw.length > 0 && !COMMON_WEAK_PASSWORDS.has(pw.toLowerCase()),
});

const passwordScore = (c: PwChecks) =>
  Object.values(c).filter(Boolean).length;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const pwChecks = evaluatePassword(formData.password);
  const pwScore = passwordScore(pwChecks);
  const pwValid = pwScore === 6;
  const strengthLabel =
    pwScore <= 2 ? "Weak" : pwScore <= 4 ? "Fair" : pwScore === 5 ? "Good" : "Strong";
  const strengthColor =
    pwScore <= 2
      ? "bg-destructive"
      : pwScore <= 4
      ? "bg-yellow-500"
      : pwScore === 5
      ? "bg-blue-500"
      : "bg-green-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !pwValid) {
      toast({
        title: "Weak Password",
        description:
          "Please meet all password requirements: 8+ characters, uppercase, lowercase, number, special character, and avoid common passwords.",
        variant: "destructive",
      });
      return;
    }

    if (isLogin && formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error("Login error:", error);
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const passwordDiagnostics = {
          length: formData.password.length,
          meetsLocalRequirements: pwValid,
          hasLeadingOrTrailingSpace: formData.password !== formData.password.trim(),
          hasZeroWidthCharacters: /[\u200B-\u200D\uFEFF]/.test(formData.password),
        };
        console.debug("Signup password diagnostics:", passwordDiagnostics);
        
        const { error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName.trim(),
            },
          },
        });

        if (error) {
          console.error("Signup error:", {
            name: error.name,
            message: error.message,
            status: error.status,
            code: error.code,
            weakPasswordReasons: (error as { reasons?: string[] }).reasons,
            passwordDiagnostics,
          });
          toast({
            title: "Signup Failed",
            description: error.message || "We couldn't complete your signup. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Check Your Email",
          description: "We've sent you a confirmation link. Please verify your email to continue.",
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">
              <span className="text-foreground">Agri</span>
              <span className="text-primary">Path</span>
              <span className="text-foreground"> AI</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-2 font-display">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            {isLogin ? "Login to access your farm dashboard" : "Join the smart farming revolution"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && formData.password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all ${strengthColor}`}
                        style={{ width: `${(pwScore / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {strengthLabel}
                    </span>
                  </div>
                </div>
              )}
              {!isLogin && (
                <ul className="text-xs space-y-1 pt-1">
                  {[
                    { ok: pwChecks.length, label: "Minimum 8 characters" },
                    { ok: pwChecks.upper, label: "At least 1 uppercase letter" },
                    { ok: pwChecks.lower, label: "At least 1 lowercase letter" },
                    { ok: pwChecks.number, label: "At least 1 number" },
                    { ok: pwChecks.special, label: "At least 1 special character" },
                    { ok: pwChecks.notCommon, label: "Avoid common or weak passwords" },
                  ].map((r) => (
                    <li
                      key={r.label}
                      className={r.ok ? "text-green-500" : "text-muted-foreground"}
                    >
                      {r.ok ? "✓" : "○"} {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                {formData.confirmPassword.length > 0 &&
                  formData.confirmPassword !== formData.password && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLogin ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                isLogin ? "Login" : "Sign Up"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
