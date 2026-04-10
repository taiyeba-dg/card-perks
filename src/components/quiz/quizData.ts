export interface QuizStep {
  id: string;
  question: string;
  emoji: string;
  options: { label: string; value: string; icon: string }[];
}

export const STEPS: QuizStep[] = [
  {
    id: "spend",
    question: "What do you spend most on?",
    emoji: "🛒",
    options: [
      { label: "Shopping", value: "shopping", icon: "🛍️" },
      { label: "Dining", value: "dining", icon: "🍽️" },
      { label: "Travel", value: "travel", icon: "✈️" },
      { label: "Fuel", value: "fuel", icon: "⛽" },
      { label: "Online", value: "online", icon: "💻" },
    ],
  },
  {
    id: "fee",
    question: "Preferred annual fee range?",
    emoji: "💰",
    options: [
      { label: "₹0 – 500", value: "0-500", icon: "🆓" },
      { label: "₹500 – 2,000", value: "500-2000", icon: "💵" },
      { label: "₹2,000 – 5,000", value: "2000-5000", icon: "💴" },
      { label: "₹5,000+", value: "5000+", icon: "👑" },
    ],
  },
  {
    id: "perk",
    question: "Most important perk?",
    emoji: "🎁",
    options: [
      { label: "Cashback", value: "cashback", icon: "💸" },
      { label: "Lounge Access", value: "lounge", icon: "🛋️" },
      { label: "Reward Points", value: "rewards", icon: "⭐" },
      { label: "Travel Benefits", value: "travel", icon: "🌍" },
    ],
  },
  {
    id: "bank",
    question: "Preferred bank?",
    emoji: "🏦",
    options: [
      { label: "Any", value: "any", icon: "🔀" },
      { label: "HDFC", value: "hdfc", icon: "🔵" },
      { label: "Axis", value: "axis", icon: "🟣" },
      { label: "SBI", value: "sbi", icon: "🔴" },
      { label: "Kotak", value: "kotak", icon: "🟠" },
    ],
  },
  {
    id: "spend_amount",
    question: "Monthly credit card spend?",
    emoji: "📊",
    options: [
      { label: "< ₹20K", value: "low", icon: "🌱" },
      { label: "₹20K – 50K", value: "mid", icon: "📈" },
      { label: "₹50K – 1L", value: "high", icon: "🚀" },
      { label: "₹1L+", value: "ultra", icon: "💎" },
    ],
  },
];

export interface Answers {
  spend?: string;
  fee?: string;
  perk?: string;
  bank?: string;
  spend_amount?: string;
}
