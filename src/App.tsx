import { lazy, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import NavigationProgress from "@/components/NavigationProgress";
import MobileBottomNav from "@/components/MobileBottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";

// Lazy-load non-critical shell components — catch import errors so they don't crash the app
const CookieBanner = lazy(() => import("@/components/CookieBanner").catch(() => ({ default: () => null })));
const OnboardingTour = lazy(() => import("@/components/OnboardingTour").catch(() => ({ default: () => null })));
const KeyboardShortcutsModal = lazy(() => import("@/components/KeyboardShortcutsModal").catch(() => ({ default: () => null })));

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const KnowYourCards = lazy(() => import("./pages/KnowYourCards"));
const CardDetail = lazy(() => import("./pages/CardDetail"));
const CompareCards = lazy(() => import("./pages/CompareCards"));
const Vouchers = lazy(() => import("./pages/Vouchers"));
const Banking = lazy(() => import("./pages/BankingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PerkAI = lazy(() => import("./pages/PerkAI"));
const GuidesHub = lazy(() => import("./pages/GuidesHub"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const Favorites = lazy(() => import("./components/favorites/FavoritesRouter"));
const MyCards = lazy(() => import("./pages/MyCardsPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const SupportUs = lazy(() => import("./pages/SupportUs"));
const QRScanner = lazy(() => import("./pages/QRScanner"));
const Terms = lazy(() => import("./pages/Terms"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Settings = lazy(() => import("./pages/Settings"));
const CardQuiz = lazy(() => import("./pages/Quiz"));
const FindMyCard = lazy(() => import("./pages/FindMyCard"));
const OptimizeStack = lazy(() => import("./pages/OptimizeStack"));
const BestFor = lazy(() => import("./pages/BestFor"));
const BestForCategory = lazy(() => import("./pages/BestForCategory"));
const DevaluationTracker = lazy(() => import("./pages/DevaluationTracker"));
const RewardsCalculator = lazy(() => import("./pages/RewardsCalculator"));
const RedemptionCalculator = lazy(() => import("./pages/RedemptionCalculator"));
const FeeWorthCalculator = lazy(() => import("./pages/FeeWorthCalculator"));

const queryClient = new QueryClient();

function PageFallback() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 max-w-4xl space-y-4">
        {/* Skeleton breadcrumb */}
        <div className="h-4 w-40 rounded bg-white/5 animate-pulse" />
        {/* Skeleton title */}
        <div className="h-8 w-64 rounded bg-white/5 animate-pulse" />
        {/* Skeleton subtitle */}
        <div className="h-4 w-48 rounded bg-white/5 animate-pulse mb-6" />
        {/* Skeleton search bar */}
        <div className="h-12 rounded-lg bg-white/5 animate-pulse" />
        {/* Skeleton filter chips */}
        <div className="flex gap-2">
          {[80, 72, 88, 64].map((w, i) => (
            <div key={i} className="h-8 rounded-full bg-white/5 animate-pulse" style={{ width: w }} />
          ))}
        </div>
        {/* Skeleton content rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useKeyboardShortcuts({ onOpenHelp: () => setShortcutsOpen(true) });

  return (
    <>
      <Suspense fallback={null}>
        <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </Suspense>
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/cards" element={<KnowYourCards />} />
          <Route path="/cards/:id" element={<CardDetail />} />
          <Route path="/compare" element={<CompareCards />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/banking" element={<Banking />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/perk-ai" element={<PerkAI />} />
          <Route path="/guides" element={<GuidesHub />} />
          <Route path="/guides/:slug" element={<GuideDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/my-cards" element={<MyCards />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/support" element={<SupportUs />} />
          <Route path="/support-us" element={<SupportUs />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/card-quiz" element={<CardQuiz />} />
          <Route path="/find-my-card" element={<FindMyCard />} />
          <Route path="/optimize-stack" element={<OptimizeStack />} />
          <Route path="/best-for" element={<BestFor />} />
           <Route path="/best-for/:category" element={<BestForCategory />} />
           <Route path="/devaluation-tracker" element={<DevaluationTracker />} />
           <Route path="/tools/rewards-calculator" element={<RewardsCalculator />} />
           <Route path="/tools/redemption-calculator" element={<RedemptionCalculator />} />
           <Route path="/tools/fee-worth-calculator" element={<FeeWorthCalculator />} />
           <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <NavigationProgress />
                <AnimatedRoutes />
                <MobileBottomNav />
                <Suspense fallback={null}>
                  <CookieBanner />
                  <OnboardingTour />
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
