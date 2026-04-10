import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { banks } from "@/data/banking";

function extractLoungeAccess(benefits: string[]): string {
  const lounge = benefits.find(b => /lounge/i.test(b));
  if (!lounge) return "—";
  if (/unlimited/i.test(lounge)) return "Unlimited";
  const match = lounge.match(/(\d+)\/year/);
  return match ? `${match[1]}/yr` : "Yes";
}

function extractMinAMB(eligibility: string): string {
  const match = eligibility.match(/₹[\d,.]+\s*(?:Lakhs?|Lakh|Crores?|Cr)?/i);
  return match ? match[0] : "—";
}

export default function CrossBankComparison() {
  const rows = banks.flatMap(bank =>
    bank.tiers.map(tier => ({
      bank: bank.name,
      bankColor: bank.color,
      tierName: tier.name,
      tierColor: tier.color,
      minAMB: extractMinAMB(tier.eligibility),
      hasRM: tier.hasRM,
      lounge: extractLoungeAccess(tier.benefits),
      benefitCount: tier.benefits.length,
    }))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-16">
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-center mb-2">
        Compare <span className="gold-gradient">All Tiers</span>
      </h2>
      <p className="text-xs text-muted-foreground text-center mb-8">Side-by-side comparison across all banks</p>

      <div className="relative">
        {/* Scroll fade indicator on right */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 sm:hidden" />
        <div className="glass-card rounded-2xl border border-border/20 overflow-hidden overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-[11px] font-bold text-foreground">Bank</TableHead>
              <TableHead className="text-[11px] font-bold text-foreground">Tier</TableHead>
              <TableHead className="text-[11px] font-bold text-foreground">Min. AMB</TableHead>
              <TableHead className="text-[11px] font-bold text-foreground text-center">RM</TableHead>
              <TableHead className="text-[11px] font-bold text-foreground">Lounge</TableHead>
              <TableHead className="text-[11px] font-bold text-foreground text-center">Benefits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className={`border-border/10 hover:bg-secondary/20 ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                <TableCell className="text-[11px] font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.bankColor }} />
                    {row.bank}
                  </span>
                </TableCell>
                <TableCell className="text-[11px] font-semibold" style={{ color: row.tierColor }}>{row.tierName}</TableCell>
                <TableCell className="text-[11px] text-gold font-medium">{row.minAMB}</TableCell>
                <TableCell className="text-center">
                  {row.hasRM ? <Check className="w-3.5 h-3.5 text-gold mx-auto" /> : <X className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />}
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground">{row.lounge}</TableCell>
                <TableCell className="text-[11px] text-muted-foreground text-center">{row.benefitCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </div>
    </motion.div>
  );
}
