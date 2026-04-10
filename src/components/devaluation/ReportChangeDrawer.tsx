import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cards } from "@/data/cards";
import { cn } from "@/lib/utils";

interface ReportChangeDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ReportChangeDrawer({ open, onClose }: ReportChangeDrawerProps) {
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
      toast.success("Thanks! Your report has been submitted for review."),
    );
  };

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

  const steps = ["Bank", "Cards", "Change", "Review"];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[420px] z-50 bg-background border-l border-border/30 shadow-2xl shadow-black/20 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-border/20 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg">Report a Change</h3>
                <p className="text-xs text-muted-foreground">Step {step + 1} of 4</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex gap-1 px-5 pt-3">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= step ? "bg-primary" : "bg-secondary/30",
                  )}
                />
              ))}
            </div>

            {/* Steps */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {step === 0 && (
                <div>
                  <label className="text-xs font-medium mb-2 block">Select Bank</label>
                  <Select value={bank} onValueChange={(v) => { setBank(v); setCardIds([]); }}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Choose bank..." />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          "text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors",
                          cardIds.includes(c.id)
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border/40 text-muted-foreground hover:border-border",
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                    {bankCards.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Go back and select a bank first
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">What changed?</label>
                    <Textarea
                      value={whatChanged}
                      onChange={(e) => setWhatChanged(e.target.value)}
                      placeholder="e.g., Lounge access reduced from unlimited to 8/quarter"
                      className="text-sm min-h-[60px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Previous value</label>
                      <Input
                        value={prevValue}
                        onChange={(e) => setPrevValue(e.target.value)}
                        placeholder="e.g., ₹0.50/pt"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">New value</label>
                      <Input
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="e.g., ₹0.33/pt"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Change type</label>
                    <div className="flex gap-2">
                      {(
                        [
                          { v: "devaluation", l: "Devaluation", c: "text-red-400 border-red-500/30" },
                          { v: "improvement", l: "Improvement", c: "text-emerald-400 border-emerald-500/30" },
                          { v: "modification", l: "Modification", c: "text-amber-400 border-amber-500/30" },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.v}
                          onClick={() => setChangeType(t.v)}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors",
                            changeType === t.v ? t.c : "border-border/40 text-muted-foreground",
                          )}
                        >
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Source (optional)</label>
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
                <div className="space-y-3">
                  <p className="text-xs font-medium mb-2">Review your report</p>
                  <div className="glass-card rounded-xl p-4 space-y-2 text-xs">
                    <p>
                      <span className="text-muted-foreground">Bank:</span>{" "}
                      <span className="font-medium">{bank || "\u2014"}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Cards:</span>{" "}
                      <span className="font-medium">
                        {cardIds.length > 0
                          ? cardIds
                              .map((id) => cards.find((c) => c.id === id)?.name)
                              .filter(Boolean)
                              .join(", ")
                          : "\u2014"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Change:</span>{" "}
                      <span className="font-medium">{whatChanged || "\u2014"}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Before \u2192 After:</span>{" "}
                      <span className="font-medium">
                        {prevValue || "\u2014"} \u2192 {newValue || "\u2014"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span className="font-medium capitalize">{changeType}</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Reports are reviewed before publishing. Verified changes get a badge.
                  </p>
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="p-5 border-t border-border/20 flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Back
                </button>
              )}
              <div className="flex-1" />
              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="gold-btn px-5 py-2 rounded-xl text-sm font-semibold"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="gold-btn px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
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
