import { motion } from "framer-motion";
import { TrendingUp, Zap, CreditCard, Plane, Gift, DollarSign, ShoppingCart, HelpCircle } from "lucide-react";

const quickActionGroups = {
  earning: [
    { icon: TrendingUp, label: "Which card earns the most on dining?", short: "Best for Dining" },
    { icon: ShoppingCart, label: "How do I maximize SmartBuy rewards?", short: "SmartBuy Tips" },
  ],
  redeeming: [
    { icon: Gift, label: "Best way to use 50K HDFC reward points?", short: "Redeem 50K RP" },
    { icon: Plane, label: "Should I transfer points to airlines?", short: "Transfer to Airlines" },
  ],
  selection: [
    { icon: CreditCard, label: "Which card should I get for ₹50K/month spending?", short: "Card for ₹50K/mo" },
    { icon: DollarSign, label: "Is HDFC Infinia worth the ₹12,500 fee?", short: "Is Infinia Worth It?" },
  ],
  optimization: [
    { icon: Zap, label: "Which card should I use for Swiggy orders?", short: "Best for Swiggy" },
    { icon: HelpCircle, label: "How do I waive my annual fee?", short: "Fee Waiver Tips" },
  ],
};

// Pick 2 from each group = 8 total
const allQuickActions = [
  ...quickActionGroups.earning,
  ...quickActionGroups.redeeming,
  ...quickActionGroups.selection,
  ...quickActionGroups.optimization,
];

export function MobileQuickActions({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {allQuickActions.map((a, i) => (
        <motion.button
          key={a.short}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 + i * 0.04, type: "spring" }}
          onClick={() => onSend(a.label)}
          className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl glass-card border border-border text-xs font-medium text-foreground/70 hover:text-gold hover:border-gold/30 active:scale-95 transition-all duration-200"
        >
          <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
            <a.icon className="w-3.5 h-3.5 text-gold" />
          </div>
          <span className="text-left leading-tight">{a.short}</span>
        </motion.button>
      ))}
    </div>
  );
}

export function DesktopQuickActions({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="flex justify-center gap-2 flex-wrap max-w-2xl mx-auto">
      {allQuickActions.map((a, i) => (
        <motion.button
          key={a.short}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.04, type: "spring" }}
          onClick={() => onSend(a.label)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-card border border-border text-xs font-medium text-foreground/70 hover:text-gold hover:border-gold/30 hover:scale-105 transition-all duration-300 hover:shadow-md hover:shadow-gold/5"
        >
          <a.icon className="w-3 h-3" />
          {a.short}
        </motion.button>
      ))}
    </div>
  );
}
