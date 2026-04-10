import { useState } from "react";
import { Star, CreditCard, Globe, Shield, Trophy, Gift, Fuel, Heart, Check, ChevronDown, ChevronUp } from "lucide-react";
import { type CreditCard as CardType } from "@/data/cards";
import { getWinner, getWinnerLabel } from "./CompareWinnerUtils";

const fieldSections = [
  { label: "Basics", fields: [
    { key: "fee" as const, label: "Annual Fee", icon: CreditCard },
    { key: "network" as const, label: "Network", icon: Globe },
    { key: "type" as const, label: "Card Type", icon: Shield },
    { key: "issuer" as const, label: "Issuer", icon: CreditCard },
  ]},
  { label: "Income & Rewards", fields: [
    { key: "minIncome" as const, label: "Min Income", icon: Trophy },
    { key: "rewardRate" as const, label: "Reward Rate", icon: Gift },
    { key: "rewards" as const, label: "Reward Value", icon: Star },
    { key: "welcomeBonus" as const, label: "Welcome Bonus", icon: Gift },
  ]},
  { label: "Travel & Forex", fields: [
    { key: "lounge" as const, label: "Lounge Access", icon: Shield },
    { key: "fuelSurcharge" as const, label: "Fuel Surcharge", icon: Fuel },
    { key: "forexMarkup" as const, label: "Forex Markup", icon: Globe },
  ]},
];

const listSections = [
  { key: "perks" as const, label: "Key Perks", icon: Star },
  { key: "milestones" as const, label: "Milestone Benefits", icon: Trophy },
  { key: "insurance" as const, label: "Insurance", icon: Shield },
  { key: "bestFor" as const, label: "Best For", icon: Heart },
  { key: "vouchers" as const, label: "Top Vouchers", icon: Gift },
];

const COLLAPSE_THRESHOLD = 3;

function CollapsibleList({ items }: { items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const shouldCollapse = items.length > COLLAPSE_THRESHOLD;
  const visible = shouldCollapse && !expanded ? items.slice(0, COLLAPSE_THRESHOLD) : items;
  return (
    <>
      <ul className="space-y-1.5">
        {visible.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground leading-tight">
            <Check className="w-2.5 h-2.5 text-primary mt-0.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      {shouldCollapse && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-primary mt-1.5 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> +{items.length - COLLAPSE_THRESHOLD} more</>}
        </button>
      )}
    </>
  );
}

interface MobileCompareTableProps { selected: CardType[]; }

export default function MobileCompareTable({ selected }: MobileCompareTableProps) {
  const cardColW = "w-[140px] min-w-[140px]";
  return (
    <div className="mt-6 space-y-8">
      {/* Field sections — stacked cards per field instead of horizontal scroll */}
      {fieldSections.map((section) => (
        <div key={section.label}>
          <h3 className="text-sm font-serif font-bold text-primary mb-3 px-1">{section.label}</h3>
          <div className="space-y-2">
            {section.fields.map((field, fi) => {
              const winnerId = getWinner(field.key, selected);
              return (
                <div
                  key={field.key}
                  className={`glass-card rounded-xl p-3.5 ${fi % 2 === 0 ? "bg-secondary/5" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <field.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">{field.label}</span>
                  </div>
                  <div className="space-y-1.5">
                    {selected.map((card) => {
                      const isWinner = winnerId === card.id;
                      return (
                        <div
                          key={card.id}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg ${isWinner ? "bg-primary/10 border border-primary/20" : "bg-secondary/10"}`}
                        >
                          <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[80px]">{card.name.split(" ").slice(-2).join(" ")}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-medium ${isWinner ? "text-primary font-semibold" : ""}`}>
                              {String(card[field.key as keyof CardType])}
                            </span>
                            {isWinner && <span className="text-[9px] text-primary">🏆</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* List sections */}
      {listSections.map((section) => (
        <div key={section.key}>
          <h3 className="text-sm font-serif font-bold mb-3 px-1 flex items-center gap-1.5">
            <section.icon className="w-3.5 h-3.5 text-primary" /> {section.label}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {selected.map((card) => (
              <div key={card.id} className="glass-card rounded-xl p-3.5 flex flex-col">
                <p className="text-[10px] font-semibold text-primary mb-2 truncate">{card.name.split(" ").slice(-2).join(" ")}</p>
                <CollapsibleList items={card[section.key] as string[]} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
