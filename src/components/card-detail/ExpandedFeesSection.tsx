import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Receipt } from "lucide-react";
import type { CardV3 } from "@/data/card-v3-unified-types";
import { formatForex } from "@/data/card-v3-format";
import { formatCur } from "@/lib/fee-utils";

interface Props {
  card: CardV3;
}

export default function ExpandedFeesSection({ card }: Props) {
  const [open, setOpen] = useState(false);
  const fees = card.fees;
  const fuel = card.features.fuel;
  const forex = card.features.forex;

  const rows: { label: string; value: string; highlight?: string }[] = [
    { label: "Joining Fee", value: fees.joining === 0 ? "₹0 (Free)" : formatCur(fees.joining) },
    { label: "Annual Fee", value: fees.annual === 0 ? "₹0 (Free)" : formatCur(fees.annual) },
  ];

  if (fees.waiverText) {
    rows.push({ label: "Fee Waiver", value: fees.waiverText, highlight: "green" });
  } else if (fees.waivedOn) {
    rows.push({ label: "Fee Waiver", value: `Waived on ${formatCur(fees.waivedOn)} annual spend`, highlight: "green" });
  }

  if (fees.renewalBenefitText) {
    rows.push({ label: "Renewal Benefit", value: fees.renewalBenefitText });
  }

  if (fuel) {
    const fuelText = fuel.surchargeWaiverText
      || `${typeof fuel.surchargeWaiver === "number" ? (fuel.surchargeWaiver * 100).toFixed(0) + "%" : fuel.surchargeWaiver} waiver`;
    rows.push({ label: "Fuel Surcharge", value: fuelText });
  }

  if (forex) {
    rows.push({ label: "Forex Markup", value: formatForex(forex), highlight: forex.zeroMarkup ? "green" : undefined });
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gold" />
          <h3 className="font-serif text-base font-semibold">Fees & Charges</h3>
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
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between items-center border-b border-border/15 pb-2">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className={`text-sm font-medium text-right max-w-[55%] ${
                    row.highlight === "green" ? "text-green-400" : ""
                  }`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
