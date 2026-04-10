import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plane, Hotel, ArrowRight } from "lucide-react";
import type { CardV3Data, TransferPartner } from "@/data/card-v3-types";
import { getProgram, LOYALTY_PROGRAMS, type LoyaltyProgram } from "@/data/transfer-partners";
import { getCurrencyByName } from "@/data/reward-currencies";

const AIRLINE_MILE_VALUE = 1.5; // ₹ per mile (fallback)
const HOTEL_POINT_VALUE = 0.7; // ₹ per point (fallback)

/** Build a reverse lookup from program display name → program */
const NAME_TO_PROGRAM: Record<string, LoyaltyProgram> = {};
for (const prog of Object.values(LOYALTY_PROGRAMS)) {
  NAME_TO_PROGRAM[prog.name.toLowerCase()] = prog;
}

function findProgram(partnerName: string): LoyaltyProgram | undefined {
  // Try exact match on ID first, then name match
  const byId = getProgram(partnerName.toLowerCase().replace(/\s+/g, "-"));
  if (byId) return byId;
  return NAME_TO_PROGRAM[partnerName.toLowerCase()];
}

interface Props {
  v3: CardV3Data;
}

export default function TransferPartnersSection({ v3 }: Props) {
  const [open, setOpen] = useState(false);
  const partners = v3.redemption.transferPartners;

  if (partners.length === 0) return null;

  const airlines = partners.filter((p) => p.type === "airline");
  const hotels = partners.filter((p) => p.type === "hotel");
  const baseValue = v3.redemption.baseValue;

  function getEstValue(p: TransferPartner): number {
    const program = findProgram(p.name);
    const mileValue = program?.approxValueInr ?? (p.type === "airline" ? AIRLINE_MILE_VALUE : HOTEL_POINT_VALUE);
    return (1 / p.ratioNumeric) * mileValue;
  }

  function getValueColor(estValue: number): string {
    if (estValue > baseValue) return "text-green-400";
    if (estValue >= baseValue * 0.8) return "text-amber-400";
    return "text-red-400";
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
          <Plane className="w-4 h-4 text-gold" />
        </div>
        <span className="font-serif font-semibold text-base flex-1">Transfer to Airlines & Hotels</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 border-t border-border/20 space-y-4 mt-4">
              {/* Airlines */}
              {airlines.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Plane className="w-3 h-3" /> Airlines
                  </p>
                  <div className="space-y-2">
                    {airlines.map((p, i) => {
                      const estValue = getEstValue(p);
                      return (
                        <PartnerCard key={p.name} partner={p} estValue={estValue} valueColor={getValueColor(estValue)} delay={i * 0.06} pointCurrency={v3.redemption.pointCurrency} />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {hotels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Hotel className="w-3 h-3" /> Hotels
                  </p>
                  <div className="space-y-2">
                    {hotels.map((p, i) => {
                      const estValue = getEstValue(p);
                      return (
                        <PartnerCard key={p.name} partner={p} estValue={estValue} valueColor={getValueColor(estValue)} delay={(airlines.length + i) * 0.06} pointCurrency={v3.redemption.pointCurrency} />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PartnerCard({ partner, estValue, valueColor, delay, pointCurrency }: { partner: TransferPartner; estValue: number; valueColor: string; delay: number; pointCurrency: string }) {
  const program = findProgram(partner.name);
  const currency = getCurrencyByName(pointCurrency);
  const abbreviation = currency?.abbreviation ?? pointCurrency.split(" ").pop();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-border/30 p-3.5 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{partner.type === "airline" ? "✈️" : "🏨"} {partner.name}</span>
          {program?.alliance && program.alliance !== "None" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/50 text-muted-foreground font-medium">{program.alliance}</span>
          )}
        </div>
        <span className={`text-xs font-semibold ${valueColor}`}>₹{estValue.toFixed(2)}/{abbreviation}</span>
      </div>

      {/* Transfer visual */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded-lg bg-secondary/40 font-medium">{partner.ratio.split(":")[0]} {abbreviation}</span>
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ArrowRight className="w-3.5 h-3.5 text-gold" />
        </motion.div>
        <span className="px-2 py-1 rounded-lg bg-secondary/40 font-medium">{partner.ratio.split(":")[1]} {partner.type === "airline" ? "Mile" : "Point"}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
        <div><span className="block text-muted-foreground/50">Min</span>{partner.minPoints.toLocaleString("en-IN")} {abbreviation}</div>
        <div><span className="block text-muted-foreground/50">Time</span>{partner.transferTime}</div>
        <div><span className="block text-muted-foreground/50">Fee</span>{partner.fee}</div>
      </div>

      {/* Sweet spots from program registry */}
      {program?.sweetSpots && program.sweetSpots.length > 0 && (
        <div className="pt-1 border-t border-border/15">
          <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1">Sweet Spots</p>
          <div className="space-y-0.5">
            {program.sweetSpots.slice(0, 2).map((tip, i) => (
              <p key={i} className="text-[10px] text-muted-foreground/70">💡 {tip}</p>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
