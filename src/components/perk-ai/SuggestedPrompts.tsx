import { motion } from "framer-motion";

const prompts = [
  { emoji: "🍽️", text: "Best card for dining out?" },
  { emoji: "✈️", text: "How to maximize travel rewards?" },
  { emoji: "💳", text: "Is my card's annual fee worth it?" },
  { emoji: "🔄", text: "Compare HDFC Black Metal vs Axis Magnus" },
  { emoji: "💰", text: "Best cashback card under ₹1,000 fee?" },
  { emoji: "🛒", text: "Which card for online shopping?" },
];

interface SuggestedPromptsProps {
  onSend: (text: string) => void;
  myCardsContext?: string;
}

export default function SuggestedPrompts({ onSend, myCardsContext }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto px-2">
      {myCardsContext && (
        <p className="text-xs text-white/40 text-center mb-1">{myCardsContext}</p>
      )}
      {prompts.map((p, i) => (
        <motion.button
          key={p.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          onClick={() => onSend(p.text)}
          className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/10 active:scale-[0.98] transition-all text-left"
        >
          <span className="text-base">{p.emoji}</span>
          <span>{p.text}</span>
        </motion.button>
      ))}
    </div>
  );
}
