import { motion } from "framer-motion";
import { Users, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const familyBankPrograms = [
  { bank: "HDFC Bank", color: "#003D8F", requirement: "Combined AMB of ₹30L for Imperia benefits", available: true },
  { bank: "ICICI Bank", color: "#F58220", requirement: "Pooled NRV of ₹25L for Wealth tier", available: true },
  { bank: "Axis Bank", color: "#97144D", requirement: "Combined balance of ₹30L for Burgundy", available: true },
  { bank: "Kotak Mahindra", color: "#ED1C24", requirement: "Family pooling for Privy League Signature", available: true },
  { bank: "SBI", color: "#0033A0", requirement: "Limited family banking features", available: false },
];

export default function FamilyBankingContent() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12">
      <div className="glass-card rounded-3xl p-10 text-center border border-border/20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold/10">
          <Users className="w-9 h-9 text-gold" />
        </div>
        <h3 className="font-serif text-3xl font-bold mb-4">Family Banking Programs</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto leading-relaxed">
          Pool balances across family members to qualify for higher wealth tiers with shared benefits.
        </p>
      </div>

      <div>
        <h4 className="font-serif text-xl font-bold text-center mb-6">How Family Banking Works</h4>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { step: 1, icon: Wallet, label: "Pool Balances", desc: "Add family members' savings, FDs, and current accounts into a single relationship value" },
            { step: 2, icon: TrendingUp, label: "Qualify Higher Tier", desc: "Combined balances often cross thresholds for premium tiers like Imperia or Burgundy" },
            { step: 3, icon: Users, label: "Share Benefits", desc: "All family members enjoy lounge access, RM support, and exclusive perks together" },
          ].map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.step * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-border/15 hover:border-gold/20 transition-all duration-300 group relative"
            >
              <div className="absolute top-4 right-4 text-[40px] font-serif font-bold text-gold/10">{item.step}</div>
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/15 transition-colors">
                <item.icon className="w-5 h-5 text-gold" />
              </div>
              <p className="text-sm font-bold text-gold mb-1.5">{item.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-serif text-xl font-bold text-center mb-6">Banks with Family Programs</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyBankPrograms.map((prog) => (
            <div key={prog.bank} className="glass-card rounded-xl p-5 border border-border/15 hover:border-border/30 transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: prog.color }} />
                <span className="text-sm font-bold">{prog.bank}</span>
                {!prog.available && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground">Limited</Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{prog.requirement}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link to="/perk-ai" className="gold-btn px-8 py-3.5 rounded-xl text-sm inline-flex items-center gap-2 shadow-lg shadow-gold/15 font-semibold">
          Ask Perk AI about Family Banking <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
