import { useState } from "react";
import type { CompareCard } from "../CompareUtils";
import { findWinner } from "../CompareUtils";
import { CompareRow, CompareColumnHeaders, CompareTableWrapper, CompareRowsContainer } from "../CompareTabShell";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_ICONS, V3_TO_SPEND_KEY } from "@/data/category-config";
import { getCardExclusionNames } from "@/data/exclusions-registry";
import { SPENDING_PRESETS, COMPARE_SPEND_TO_V3 } from "@/data/spending-presets";

const PRESETS = SPENDING_PRESETS.map(p => ({
  id: p.id,
  label: p.label,
  emoji: p.emoji,
  values: Object.fromEntries(
    Object.entries(COMPARE_SPEND_TO_V3).map(([compareKey, v3Key]) => [
      compareKey,
      p.values[v3Key] ?? 0,
    ])
  ) as Record<string, number>,
}));


interface Props { compareCards: CompareCard[]; }

export default function RewardsTab({ compareCards }: Props) {
  const [showSpending, setShowSpending] = useState(false);
  const [presetIdx, setPresetIdx] = useState(1); // Professional default
  const preset = PRESETS[presetIdx];

  // Gather all categories across all cards
  const allCats = new Set<string>();
  compareCards.forEach(({ v3 }) => {
    if (v3) Object.keys(v3.categories).forEach((k) => allCats.add(k));
  });
  const categories = Array.from(allCats);

  // Categories won count
  const winsCount: Record<string, number> = {};
  compareCards.forEach((cc) => (winsCount[cc.card.id] = 0));
  categories.forEach((cat) => {
    const vals = compareCards.map((cc) => ({
      cardId: cc.card.id,
      value: cc.v3?.categories[cat]?.rate ?? 0,
    }));
    const w = findWinner(vals, "highest");
    if (w) winsCount[w]++;
  });

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 flex-wrap px-1">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground font-medium">Categories won:</span>
          {compareCards.map((cc) => (
            <span key={cc.card.id} className="px-2 py-1 rounded-lg bg-secondary/30 font-semibold">
              {cc.card.name.split(" ").slice(-2).join(" ")}: <span className="text-gold">{winsCount[cc.card.id]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Spending toggle */}
      <div className="flex items-center gap-3 px-1">
        <Switch checked={showSpending} onCheckedChange={setShowSpending} />
        <span className="text-xs text-muted-foreground">Apply spending profile</span>
        {showSpending && (
          <div className="flex gap-1.5 ml-2">
            {PRESETS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setPresetIdx(i)}
                className={`px-2 py-1 rounded-full text-[10px] font-medium border transition-all ${
                  presetIdx === i ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <CompareTableWrapper>
        <CompareColumnHeaders compareCards={compareCards} />
        <CompareRowsContainer>

        {categories.map((cat) => {
          const vals = compareCards.map((cc) => {
            const catData = cc.v3?.categories[cat];
            return { cardId: cc.card.id, rate: catData?.rate ?? 0, label: catData?.label ?? "—", cap: catData?.cap, capPeriod: catData?.capPeriod };
          });
          const winnerId = findWinner(vals.map((v) => ({ cardId: v.cardId, value: v.rate })), "highest");
          const catName = cat.charAt(0).toUpperCase() + cat.slice(1);

          return (
            <div key={cat}>
              <CompareRow
                label={catName}
                icon={CATEGORY_ICONS[cat] || "💳"}
                values={vals.map((v) => ({
                  cardId: v.cardId,
                  display: (
                    <div>
                      <span className={winnerId === v.cardId ? "text-gold font-semibold" : ""}>{v.label} ({v.rate}%)</span>
                      {v.cap && <p className="text-[9px] text-amber-400 mt-0.5">Cap: ₹{v.cap.toLocaleString("en-IN")}/{v.capPeriod || "mo"}</p>}
                    </div>
                  ),
                  isWinner: winnerId === v.cardId,
                }))}
              />
              {showSpending && (() => {
                const spendKey = V3_TO_SPEND_KEY[cat];
                const monthlySpend = spendKey ? (preset.values[spendKey] || 0) : 0;
                if (monthlySpend === 0) return null;
                const spendVals = compareCards.map((cc) => {
                  const rate = cc.v3?.categories[cat]?.rate ?? 0;
                  const baseValue = cc.v3?.redemption.baseValue ?? 0.25;
                  const annualValue = Math.round(monthlySpend * (rate / 100) * 12 * baseValue);
                  return { cardId: cc.card.id, value: annualValue };
                });
                const spendWinner = findWinner(spendVals, "highest");
                return (
                  <CompareRow
                    label={`  ₹${monthlySpend.toLocaleString("en-IN")}/mo`}
                    values={spendVals.map((v) => ({
                      cardId: v.cardId,
                      display: <span className={`text-[10px] ${spendWinner === v.cardId ? "text-gold font-semibold" : "text-muted-foreground"}`}>₹{v.value.toLocaleString("en-IN")}/yr</span>,
                      isWinner: spendWinner === v.cardId,
                    }))}
                    className="bg-secondary/5"
                  />
                );
              })()}
            </div>
          );
        })}

        {/* Exclusions row */}
        <CompareRow
          label="Exclusions"
          icon="❌"
          values={compareCards.map((cc) => ({
            cardId: cc.card.id,
            display: (
              <span className="text-[10px] text-muted-foreground">
                {getCardExclusionNames(cc.card.id).join(", ") || cc.v3?.exclusions.map((e) => e.category).join(", ") || "—"}
              </span>
            ),
            isWinner: false,
          }))}
        />

        {/* Total value row if spending enabled */}
        {showSpending && (
          <CompareRow
            label="Total Annual Value"
            icon="💰"
            values={(() => {
              const totals = compareCards.map((cc) => {
                let total = 0;
                categories.forEach((cat) => {
                  const spendKey = V3_TO_SPEND_KEY[cat];
                  const monthlySpend = spendKey ? (preset.values[spendKey] || 0) : 0;
                  const rate = cc.v3?.categories[cat]?.rate ?? 0;
                  const baseValue = cc.v3?.redemption.baseValue ?? 0.25;
                  total += monthlySpend * (rate / 100) * 12 * baseValue;
                });
                return { cardId: cc.card.id, value: Math.round(total) };
              });
              const w = findWinner(totals, "highest");
              return totals.map((t) => ({
                cardId: t.cardId,
                display: <span className={`font-semibold ${w === t.cardId ? "text-gold" : ""}`}>₹{t.value.toLocaleString("en-IN")}/yr</span>,
                isWinner: w === t.cardId,
              }));
            })()}
            className="bg-gold/[0.03] border-t-2 border-gold/20"
          />
        )}
        </CompareRowsContainer>
      </CompareTableWrapper>
    </div>
  );
}
