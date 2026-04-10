import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim() || !EMAIL_REGEX.test(email)) e.email = "Please enter a valid email";
    if (password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((p) => ({ ...p, [field]: true }));
    const e: typeof errors = { ...errors };
    if (field === "email" && (!email.trim() || !EMAIL_REGEX.test(email))) e.email = "Please enter a valid email";
    else if (field === "email") delete e.email;
    if (field === "password" && password.length < 8) e.password = "Password must be at least 8 characters";
    else if (field === "password") delete e.password;
    setErrors(e);
  };

  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setErrors({ email: error.message });
      return;
    }
    navigate(from, { replace: true });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSent(true);
  };

  const exitForgotMode = () => {
    setForgotMode(false);
    setResetEmail("");
    setResetSent(false);
  };

  return (
    <PageLayout>
      <SEO title="Sign In" description="Sign in to CardPerks to access your dashboard, track cards, and manage rewards." path="/login" />
      <section className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[70vh]">
        <ScrollReveal>
          <div className="glass-card rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <img src={logo} alt="CardPerks" className="h-12 w-auto mx-auto mb-4 rounded-lg" />
              <AnimatePresence mode="wait">
                {forgotMode ? (
                  <motion.div key="forgot-header" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
                    <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
                  </motion.div>
                ) : (
                  <motion.div key="login-header" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to access your card perks dashboard</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {forgotMode ? (
                <motion.div key="forgot-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  {resetSent ? (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-7 h-7 text-green-400" />
                      </div>
                      <h2 className="font-serif text-lg font-semibold mb-2">Check Your Inbox</h2>
                      <p className="text-sm text-muted-foreground mb-1">Password reset link sent to</p>
                      <p className="text-sm font-medium text-gold">{resetEmail}</p>
                      <p className="text-xs text-muted-foreground mt-4">Didn't receive it? Check your spam folder or try again.</p>
                      <button onClick={exitForgotMode} className="gold-btn w-full rounded-lg py-2.5 text-sm mt-6">
                        Back to Sign In
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={handleResetSubmit}>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-10 bg-secondary/80 border-border"
                          autoFocus
                          required
                        />
                      </div>
                      <button type="submit" className="w-full gold-btn rounded-lg py-2.5 text-sm">
                        Send Reset Link
                      </button>
                      <button type="button" onClick={exitForgotMode} className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                      </button>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div key="login-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <form className="space-y-4" onSubmit={handleSubmit}>
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
                          className={`pl-10 bg-secondary/80 border-border ${touched.email && errors.email ? "border-destructive" : ""}`}
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
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => handleBlur("password")}
                          className={`pl-10 pr-10 bg-secondary/80 border-border ${touched.password && errors.password ? "border-destructive" : ""}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <FieldError message={touched.password ? errors.password || null : null} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                        <span className="relative flex-shrink-0">
                          <input
                            type="checkbox"
                            id="remember-me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="sr-only peer"
                          />
                          <span className="w-4 h-4 rounded border border-border bg-secondary/80 flex items-center justify-center transition-all peer-checked:bg-gold peer-checked:border-gold peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-1">
                            {rememberMe && (
                              <svg className="w-2.5 h-2.5 text-background" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                                <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                      </label>
                      <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-gold hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full gold-btn rounded-lg py-2.5 text-sm disabled:opacity-60">{submitting ? "Signing in…" : "Sign In"}</button>
                  </form>

                  <SocialLoginButtons />

                  <p className="text-center text-sm text-muted-foreground mt-6 relative z-10">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-gold hover:underline font-medium inline-block cursor-pointer">
                      Sign Up
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </section>
    </PageLayout>
  );
}
