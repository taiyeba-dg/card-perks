import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import StepView from "@/components/quiz/StepView";
import ResultsView from "@/components/quiz/ResultsView";
import { STEPS, type Answers } from "@/components/quiz/quizData";

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  const stepKey = STEPS[currentStep]?.id as keyof Answers;
  const currentAnswer = answers[stepKey];
  const progress = ((currentStep) / STEPS.length) * 100;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [stepKey]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setDone(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentStep(0);
    setDone(false);
  };

  return (
    <PageLayout>
      <SEO
        fullTitle="Find Your Perfect Credit Card | CardPerks Quiz"
        description="Answer 5 quick questions and get personalized credit card recommendations with match percentages."
        path="/quiz"
      />
      <section className="py-12 min-h-screen">
        <div className="container mx-auto px-4 max-w-2xl">

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          {!done ? (
            <>
              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold transition-all duration-300 flex-shrink-0 ${
                      i < currentStep
                        ? "bg-gold text-background"
                        : i === currentStep
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "bg-foreground/5 text-muted-foreground border border-border/30"
                    }`}>
                      {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-px transition-all duration-500" style={{ background: i < currentStep ? "hsl(var(--gold))" : "hsl(var(--border) / 0.4)" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-border/30 mb-8 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-gold/70 to-gold"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              {/* Glass card shell */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border/30 relative overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.04] to-transparent pointer-events-none rounded-3xl" />
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <StepView
                      key={STEPS[currentStep].id}
                      step={STEPS[currentStep]}
                      stepIndex={currentStep}
                      selected={currentAnswer}
                      onSelect={handleSelect}
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-gold/30 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="gold-btn flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {currentStep === STEPS.length - 1 ? (
                    <><Sparkles className="w-4 h-4" /> See My Cards</>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </>
          ) : (
            <ResultsView answers={answers} onRetake={handleRetake} />
          )}
        </div>
      </section>
    </PageLayout>
  );
}
