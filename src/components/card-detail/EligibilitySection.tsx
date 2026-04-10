import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, UserCheck } from "lucide-react";
import type { CardV3 } from "@/data/card-v3-unified-types";
import { formatIncome } from "@/data/card-v3-format";

interface Props {
  card: CardV3;
}

export default function EligibilitySection({ card }: Props) {
  const [open, setOpen] = useState(false);
  const elig = card.eligibility;
  if (!elig) return null;

  const incomeLabel = elig.incomeLabel || formatIncome(elig.income);
  const isInviteOnly = elig.type?.toLowerCase().includes("invite");

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-gold" />
          <h3 className="font-serif text-base font-semibold">Eligibility</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
              {isInviteOnly && (
                <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-400 font-semibold">Invite Only</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">This card is not available for direct application</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {incomeLabel && incomeLabel !== "N/A" && (
                  <div className="bg-secondary/20 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase">Min. Annual Income</p>
                    <p className="text-sm font-semibold mt-1">{incomeLabel}</p>
                  </div>
                )}
                {elig.creditScore && (
                  <div className="bg-secondary/20 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase">Credit Score</p>
                    <p className="text-sm font-semibold mt-1">{elig.creditScore}+</p>
                  </div>
                )}
                {elig.age && (
                  <div className="bg-secondary/20 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase">Age Range</p>
                    <p className="text-sm font-semibold mt-1">{elig.age.min} – {elig.age.max} years</p>
                  </div>
                )}
                {elig.type && (
                  <div className="bg-secondary/20 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase">Application Type</p>
                    <p className="text-sm font-semibold mt-1">{elig.type}</p>
                  </div>
                )}
              </div>

              {elig.ntbEligible != null && (
                <p className="text-xs text-muted-foreground">
                  New-to-Bank: <span className={elig.ntbEligible ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {elig.ntbEligible ? "Eligible" : "Existing customers only"}
                  </span>
                </p>
              )}

              {elig.note && (
                <p className="text-[11px] text-muted-foreground italic">{elig.note}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
