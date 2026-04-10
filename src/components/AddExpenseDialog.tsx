import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, Receipt, Tag, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, type Expense } from "@/hooks/use-expenses";

interface AddExpenseDialogProps {
  cardId: string;
  cardName: string;
  cardColor: string;
  onAdd: (expense: Omit<Expense, "id">) => void;
  trigger?: React.ReactNode;
}

export default function AddExpenseDialog({ cardId, cardName, cardColor, onAdd, trigger }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("shopping");
  const [note, setNote] = useState("");

  const reset = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setMerchant("");
    setAmount("");
    setCategory("shopping");
    setNote("");
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!merchant.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
    onAdd({
      cardId,
      date,
      merchant: merchant.trim().slice(0, 100),
      amount: parsedAmount,
      category,
      note: note.trim().slice(0, 200),
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-xs py-2 px-3 rounded-xl border border-border/30 hover:border-gold/30 hover:bg-gold/5 transition-all flex items-center gap-1.5 text-muted-foreground hover:text-gold font-medium">
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg glass-card border-border/30 p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/15">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cardColor}20` }}>
                <Plus className="w-4 h-4" style={{ color: cardColor }} />
              </div>
              New Expense
            </DialogTitle>
          </DialogHeader>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">{cardName}</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary/30 border-border/20 text-sm h-11" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Platform / Merchant</label>
              <Input placeholder="e.g. Amazon, Swiggy" value={merchant} onChange={(e) => setMerchant(e.target.value)} maxLength={100} className="bg-secondary/30 border-border/20 text-sm h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Amount (₹)</label>
              <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" className="bg-secondary/30 border-border/20 text-sm h-11" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary/30 border-border/20 text-sm h-11"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  {CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Reason / Note</label>
            <Textarea placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} rows={2} className="bg-secondary/30 border-border/20 text-sm resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { reset(); setOpen(false); }} className="px-5 py-2.5 rounded-xl text-sm border border-border/30 hover:bg-secondary/30 transition-colors font-medium">Cancel</button>
            <button onClick={handleSubmit} disabled={!merchant.trim() || !amount || parseFloat(amount) <= 0} className="px-5 py-2.5 rounded-xl text-sm gold-btn font-semibold shadow-md shadow-gold/10 disabled:opacity-40 disabled:cursor-not-allowed">Add Expense</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
