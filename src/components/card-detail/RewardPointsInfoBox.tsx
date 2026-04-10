import { Coins } from "lucide-react";
import type { CardV3 } from "@/data/card-v3-unified-types";
import { getCurrencyByName } from "@/data/reward-currencies";

interface Props {
  card: CardV3;
}

export default function RewardPointsInfoBox({ card }: Props) {
  const rewards = card.rewards;
  const rawName = rewards.pointCurrency || rewards.name || rewards.pointName;
  const currency = rawName ? getCurrencyByName(rawName) : undefined;
  const pointCurrency = currency?.displayName ?? rawName;
  const expiry = rewards.expiry;
  const baseRateLabel = rewards.baseRateLabel;
  const bestOption = rewards.redemption?.bestOption;
  const baseValue = rewards.redemption?.baseValue;

  if (!pointCurrency && !expiry) return null;

  const isNoExpiry = expiry?.toLowerCase() === "never" || expiry?.toLowerCase() === "no expiry";
  const isAutoCredited = expiry?.toLowerCase() === "auto-credited";

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Coins className="w-4 h-4 text-gold" />
        <h3 className="font-serif text-base font-semibold">Reward Points</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pointCurrency && (
          <div className="bg-secondary/20 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Currency</p>
            <p className="text-sm font-semibold mt-1">{pointCurrency}</p>
          </div>
        )}
        {expiry && (
          <div className="bg-secondary/20 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Expiry</p>
            <p className={`text-sm font-semibold mt-1 ${isNoExpiry || isAutoCredited ? "text-green-400" : ""}`}>
              {isNoExpiry ? "Never" : isAutoCredited ? "Auto-credited" : expiry}
            </p>
          </div>
        )}
        {baseRateLabel && (
          <div className="bg-secondary/20 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Earning Rate</p>
            <p className="text-sm font-semibold mt-1">{baseRateLabel}</p>
          </div>
        )}
        {bestOption && (
          <div className="bg-secondary/20 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Best Redemption</p>
            <p className="text-sm font-semibold mt-1 line-clamp-2">{bestOption}</p>
            {baseValue != null && (
              <p className="text-[10px] text-gold mt-0.5">₹{baseValue} per point</p>
            )}
          </div>
        )}
      </div>

      {rewards.devaluationNote && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-[11px] text-amber-400">⚠️ {rewards.devaluationNote}</p>
        </div>
      )}
    </div>
  );
}
