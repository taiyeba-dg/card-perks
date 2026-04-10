import { useState, useMemo } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cards } from "@/data/cards";
import { cn } from "@/lib/utils";

interface ReportChangeSheetProps {
  open: boolean;
  onClose: () => void;
}

export function ReportChangeSheet({ open, onClose }: ReportChangeSheetProps) {
  const dragControls = useDragControls();
  const [step, setStep] = useState(0);
  const [bank, setBank] = useState("");
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [whatChanged, setWhatChanged] = useState("");
  const [prevValue, setPrevValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [changeType, setChangeType] = useState<
    "devaluation" | "improvement" | "modification"
  >("devaluation");
  const [source, setSource] = useState("");

  const banks = useMemo(() => [...new Set(cards.map((c) => c.issuer))], []);
  const bankCards = bank ? cards.filter((c) => c.issuer === bank) : [];
  const toggleCard = (id: string) =>
    setCardIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const reset = () => {
    setBank("");
    setCardIds([]);
    setWhatChanged("");
    setPrevValue("");
    setNewValue("");
    setChangeType("devaluation");
    setSource("");
    setStep(0);
  };

  const handleSubmit = () => {
    const report = {
      bank,
      cardIds,
      whatChanged,
      prevValue,
      newValue,
      changeType,
      source,
      date: new Date().toISOString(),
    };
    const existing = JSON.parse(
      localStorage.getItem("cardperks-deval-reports") || "[]",
    );
    existing.push(report);
    localStorage.setItem("cardperks-deval-reports", JSON.stringify(existing));
    reset();
    onClose();
    import("sonner").then(({ toast }) =>
      toast.success("Thanks! Your report has been submitted."),
    );
  };

  const steps = ["Bank", "Cards", "Change", "Review"];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl border-t border-border/30 shadow-xl max-h-[85vh] flex flex-col"
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-base">Report a Change</h4>
                <p className="text-[10px] text-muted-foreground">
                  Step {step + 1} of 4
                </p>
              </div>
              <button onClick={onClose} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex gap-1 px-5 mb-3">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= step ? "bg-primary" : "bg-secondary/30",
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
              {step === 0 && (
                <div>
                  <label className="text-xs font-medium mb-2 block">Select Bank</label>
                  <div className="flex flex-wrap gap-2">
                    {banks.map((b) => (
                      <button
                        key={b}
                        onClick={() => { setBank(b); setCardIds([]); }}
                        className={cn(
                          "text-xs px-3 py-2 rounded-lg font-medium border min-h-[44px] transition-colors",
                          bank === b
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border/40 text-muted-foreground",
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <label className="text-xs font-medium mb-2 block">Affected Cards</label>
                  <div className="flex flex-wrap gap-1.5">
                    {bankCards.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleCard(c.id)}
                        className={cn(
                          "text-[10px] px-2.5 py-2 rounded-lg font-medium border min-h-[44px] transition-colors",
                          cardIds.includes(c.id)
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border/40 text-muted-foreground",
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                    {bankCards.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Go back and select a bank
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">What changed?</label>
                    <Textarea
                      value={whatChanged}
                      onChange={(e) => setWhatChanged(e.target.value)}
                      placeholder="e.g., Lounge access reduced"
                      className="text-sm min-h-[50px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Previous</label>
                      <Input
                        value={prevValue}
                        onChange={(e) => setPrevValue(e.target.value)}
                        placeholder="Old value"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">New</label>
                      <Input
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="New value"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Change type</label>
                    <div className="flex gap-1.5">
                      {(
                        [
                          { v: "devaluation", l: "Deval", c: "text-red-400 border-red-500/30" },
                          { v: "improvement", l: "Improv", c: "text-emerald-400 border-emerald-500/30" },
                          { v: "modification", l: "Mod", c: "text-amber-400 border-amber-500/30" },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.v}
                          onClick={() => setChangeType(t.v)}
                          className={cn(
                            "text-[10px] px-3 py-2 rounded-lg font-medium border min-h-[44px] transition-colors",
                            changeType === t.v ? t.c : "border-border/40 text-muted-foreground",
                          )}
                        >
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Source (optional)</label>
                    <Input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="URL or description"
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Review</p>
                  <div className="glass-card rounded-xl p-3 space-y-1.5 text-[10px]">
                    <p><span className="text-muted-foreground">Bank:</span> {bank || "\u2014"}</p>
                    <p>
                      <span className="text-muted-foreground">Cards:</span>{" "}
                      {cardIds.length > 0
                        ? cardIds.map((id) => cards.find((c) => c.id === id)?.name).filter(Boolean).join(", ")
                        : "\u2014"}
                    </p>
                    <p><span className="text-muted-foreground">Change:</span> {whatChanged || "\u2014"}</p>
                    <p><span className="text-muted-foreground">Before \u2192 After:</span> {prevValue || "\u2014"} \u2192 {newValue || "\u2014"}</p>
                    <p><span className="text-muted-foreground">Type:</span> <span className="capitalize">{changeType}</span></p>
                  </div>
                  <p className="text-[9px] text-muted-foreground">Reports are reviewed before publishing.</p>
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="px-5 py-4 border-t border-border/20 flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="text-xs text-muted-foreground font-medium"
                >
                  Back
                </button>
              )}
              <div className="flex-1" />
              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="gold-btn px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="gold-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 min-h-[44px]"
                >
                  <Send className="w-4 h-4" /> Submit
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
