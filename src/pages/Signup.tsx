import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Eye, EyeOff, User, Check } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/cardperks-logo.png";
import SocialLoginButtons from "@/components/SocialLoginButtons";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1.5 pl-1">{message}</p>;
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs text-muted-foreground mb-1.5 block">
      {children} <span className="text-destructive">*</span>
    </label>
  );
}

function getPasswordStrength(pw: string): { level: "weak" | "medium" | "strong"; score: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { level: "weak", score: 1 };
  if (score <= 3) return { level: "medium", score: 2 };
  return { level: "strong", score: 3 };
}

const strengthConfig = {
  weak: { label: "Weak", color: "bg-destructive", textColor: "text-destructive" },
  medium: { label: "Medium", color: "bg-amber-500", textColor: "text-amber-500" },
  strong: { label: "Strong", color: "bg-green-500", textColor: "text-green-500" },
};

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const strength = useMemo(() => (password.length > 0 ? getPasswordStrength(password) : null), [password]);

  const handleBlur = (field: "name" | "email" | "password") => {
    setTouched((p) => ({ ...p, [field]: true }));
    const e = { ...errors };
    if (field === "name") {
      if (!name.trim()) e.name = "Name is required"; else delete e.name;
    }
    if (field === "email") {
      if (!email.trim() || !EMAIL_REGEX.test(email)) e.email = "Please enter a valid email"; else delete e.email;
    }
    if (field === "password") {
      if (password.length < 8) e.password = "Password must be at least 8 characters"; else delete e.password;
    }
    setErrors(e);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim() || !EMAIL_REGEX.test(email)) e.email = "Please enter a valid email";
    if (password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    setSubmitting(false);
    if (error) {
      setErrors({ email: error.message });
      return;
    }
    navigate("/dashboard");
  };

  return (
    <PageLayout>
      <SEO title="Sign Up" description="Create a CardPerks account to track your cards, save favorites, and get personalized recommendations." path="/signup" />
      <section className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[70vh]">
        <ScrollReveal>
          <div className="glass-card rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <img src={logo} alt="CardPerks" className="h-12 w-auto mx-auto mb-4 rounded-lg" />
              <h1 className="text-2xl font-bold mb-1">Create Account</h1>
              <p className="text-sm text-muted-foreground">Join CardPerks and start maximizing your rewards</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <RequiredLabel>Full Name</RequiredLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur("name")}
                    maxLength={100}
                    className={`pl-10 bg-secondary/50 border-border/50 ${touched.name && errors.name ? "border-destructive" : ""}`}
                  />
                </div>
                <FieldError message={touched.name ? errors.name || null : null} />
              </div>

              <div>
                <RequiredLabel>Email</RequiredLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    maxLength={255}
                    className={`pl-10 bg-secondary/50 border-border/50 ${touched.email && errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                <FieldError message={touched.email ? errors.email || null : null} />
              </div>

              <div>
                <RequiredLabel>Password</RequiredLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`pl-10 pr-10 bg-secondary/50 border-border/50 ${touched.password && errors.password ? "border-destructive" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError message={touched.password ? errors.password || null : null} />

                {/* Password strength indicator */}
                {strength && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i <= strength.score
                              ? strengthConfig[strength.level].color
                              : "bg-secondary/50"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-medium ${strengthConfig[strength.level].textColor}`}>
                      {strengthConfig[strength.level].label} password
                    </p>
                  </div>
                )}
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreedToTerms}
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    agreedToTerms
                      ? "bg-gold border-gold"
                      : "border-border/50 group-hover:border-gold/50"
                  }`}
                >
                  {agreedToTerms && <Check className="w-3 h-3 text-background" />}
                </button>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-gold hover:underline" target="_blank">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-gold hover:underline" target="_blank">Privacy Policy</Link>
                  {" "}<span className="text-destructive">*</span>
                </span>
              </label>

              <button type="submit" disabled={!agreedToTerms || submitting} className="w-full gold-btn rounded-lg py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">{submitting ? "Creating account…" : "Create Account"}</button>
            </form>

            <SocialLoginButtons />

            <p className="text-center text-sm text-muted-foreground mt-6 relative z-10">
              Already have an account?{" "}
              <Link to="/login" className="text-gold hover:underline font-medium inline-block cursor-pointer">
                Sign In
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </section>
    </PageLayout>
  );
}
