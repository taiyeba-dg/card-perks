import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Heart, Wallet, Shield, Clock } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import SpendingStep from "@/components/card-finder/SpendingStep";
import PrioritiesStep from "@/components/card-finder/PrioritiesStep";
import EligibilityStep from "@/components/card-finder/EligibilityStep";
import FinderResultsView from "@/components/card-finder/FinderResultsView";
import { calculateResults } from "@/components/card-finder/finderScoring";
import { defaultAnswers, type FinderAnswers } from "@/components/card-finder/finderTypes";

const TOTAL_STEPS = 3;

const STEP_INFO = [
  { icon: Heart, label: "Priorities" },
  { icon: Wallet, label: "Spending" },
  { icon: Shield, label: "Eligibility" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function FindMyCard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<FinderAnswers>(defaultAnswers);
  const [done, setDone] = useState(false);

  const totalSpend = useMemo(
    () => Object.values(answers.spending).reduce((a, b) => a + b, 0),
    [answers.spending]
  );

  const canProceed = useMemo(() => {
    if (step === 0) return answers.priorities.length >= 1;
    if (step === 1) return totalSpend >= 5000;
    if (step === 2) return answers.income !== "";
    return true;
  }, [step, answers.priorities.length, totalSpend, answers.income]);

  const handleNext = () => {
    setDirection(1);
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else setDone(true);
  };

  const handleBack = () => {
    setDirection(-1);
    if (step > 0) setStep((s) => s - 1);
  };

  const handleRetake = () => {
    setAnswers(defaultAnswers);
    setStep(0);
    setDirection(0);
    setDone(false);
  };

  const updateAnswers = (patch: Partial<FinderAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  };

  const togglePriority = (id: string) => {
    setAnswers((prev) => {
      const has = prev.priorities.includes(id);
      const next = has
        ? prev.priorities.filter((p) => p !== id)
        : [...prev.priorities, id];
      const prefersCashback = next.includes("cashback") ? true : prev.prefersCashback;
      return { ...prev, priorities: next.length <= 3 ? next : prev.priorities, prefersCashback };
    });
  };

  const results = useMemo(() => {
    if (!done) return null;
    return calculateResults(answers);
  }, [done, answers]);

  return (
    <PageLayout>
      <SEO
        fullTitle="Find Your Perfect Credit Card | CardPerks Card Finder"
        description="Answer 3 questions about your priorities and spending to get personalized credit card recommendations ranked by real annual value."
        path="/find-my-card"
      />
      <section className="py-12 min-h-screen">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          {!done ? (
            <>
              {/* Progress indicator */}
              <div className="flex items-center gap-0 mb-8">
                {STEP_INFO.map((info, i) => {
                  const Icon = info.icon;
                  const isComplete = i < step;
                  const isCurrent = i === step;
                  return (
                    <div key={i} className="flex items-center flex-1 last:flex-initial">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                            isComplete
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                                ? "bg-primary/20 text-primary border-2 border-primary/40"
                                : "bg-secondary text-muted-foreground border border-border/30"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-medium transition-colors ${isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                          {info.label}
                        </span>
                      </div>
                      {i < STEP_INFO.length - 1 && (
                        <div className="flex-1 h-0.5 mx-3 rounded-full overflow-hidden bg-border/30 mt-[-18px]">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            animate={{ width: i < step ? "100%" : "0%" }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {step === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3 h-3" /> Takes about 2 minutes
                </motion.div>
              )}

              <div className="glass-card rounded-3xl p-5 sm:p-8 border border-border/30 relative overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent pointer-events-none rounded-3xl" />
                <div className="relative">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      {step === 0 && <PrioritiesStep selected={answers.priorities} onToggle={togglePriority} />}
                      {step === 1 && <SpendingStep spending={answers.spending} onChange={(spending) => updateAnswers({ spending })} priorities={answers.priorities} />}
                      {step === 2 && <EligibilityStep answers={answers} onChange={updateAnswers} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="gold-btn flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {step === TOTAL_STEPS - 1 ? (
                    <><Sparkles className="w-4 h-4" /> Find My Cards</>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </>
          ) : results ? (
            <FinderResultsView eligible={results.eligible} aspirational={results.aspirational} onRetake={handleRetake} />
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}
