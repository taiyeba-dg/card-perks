import type { Voucher, PlatformRate } from "@/data/vouchers";

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiPlatform {
  name: string;
  cap: string;
  fee: string;
  denominations: (number | string)[];
  link: string;
  color: string;
  out_of_stock_at: string | null;
}

interface ApiVoucher {
  id: string;
  slug: string;
  brand: string;
  logo: string;
  category: string;
  site: string;
  platforms: ApiPlatform[];
  lastUpdated: string;
  expiry_date: string;
}

// ── Category normalization ────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  "Fashion & Accessories": "Shopping",
  Fashion: "Shopping",
  Jewellery: "Shopping",
  Jewelry: "Shopping",
  Shopping: "Shopping",
  "Home & Living": "Shopping",
  "Home & Lifestyle": "Shopping",
  "Home & Decor": "Shopping",
  "Kids & Baby": "Shopping",
  Gifting: "Shopping",
  "Books & Stationery": "Shopping",
  Online: "Shopping",
  New: "Shopping",

  "Dining & Food": "Food & Dining",
  "F&B": "Food & Dining",
  Food: "Food & Dining",
  "Grocery and F&B": "Food & Dining",

  Travel: "Travel",
  "Travel & Leisure": "Travel",
  "Travel & Hospitality": "Travel",
  Experiences: "Travel",

  Grocery: "Groceries",
  "Groceries & Essentials": "Groceries",

  Fuel: "Fuel",

  Entertainment: "Entertainment",
  "Entertainment & OTT": "Entertainment",
  Gaming: "Entertainment",

  Fitness: "Fitness",
  "Health & Wellness": "Fitness",
  "Sports & Fitness": "Fitness",
  Beauty: "Fitness",
  "Beauty & Health": "Fitness",
  "Beauty & Personal Care": "Fitness",
  "Health & Beauty": "Fitness",

  Education: "Education",

  Electronics: "Electronics",
  "Digital Electronics": "Electronics",
  "E-commerce & Technology": "Electronics",
};

function normalizeCategory(raw: string): string {
  return CATEGORY_MAP[raw] ?? "Shopping";
}

// ── Fee parsing ───────────────────────────────────────────────────────────────

function parseFeeNumber(fee: string): number {
  const match = fee.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) : 0;
}

function parseFeeType(fee: string): PlatformRate["type"] {
  const lower = fee.toLowerCase();
  if (lower.includes("icash") || lower.includes("cashback")) return "Cashback";
  if (lower.includes("fee")) return "Fees";
  return "Savings";
}

// ── Color generation ──────────────────────────────────────────────────────────

const BRAND_COLORS: Record<string, string> = {
  amazon: "#FF9900", flipkart: "#F8C534", zomato: "#E23744", swiggy: "#FC8019",
  uber: "#276EF1", bigbasket: "#84C225", makemytrip: "#EE2E24", bookmyshow: "#C4242B",
  myntra: "#FF3F6C", nykaa: "#FC2779", ajio: "#2D2D2D", croma: "#00A651",
  tanishq: "#832729", titan: "#1B2845", starbucks: "#00704A",
};

function brandColor(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [brand, color] of Object.entries(BRAND_COLORS)) {
    if (key.includes(brand)) return color;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 50%)`;
}

// ── Adapter ───────────────────────────────────────────────────────────────────

function cleanBrandName(brand: string): string {
  return brand
    .replace(/\s*E-Gift Card$/i, "")
    .replace(/\s*Gift Card$/i, "")
    .replace(/\s*Gift Voucher$/i, "")
    .trim();
}

function adaptPlatformRates(platforms: ApiPlatform[]): PlatformRate[] {
  const rates = platforms.map((p): PlatformRate => ({
    platform: p.name,
    savings: p.fee.replace(" OFF", ""),
    type: parseFeeType(p.fee),
    live: p.out_of_stock_at === null,
    link: p.link || undefined,
    highlight: false,
  }));

  // Mark the best live rate as highlighted
  let bestIdx = -1;
  let bestVal = -1;
  rates.forEach((r, i) => {
    if (!r.live) return;
    const val = parseFeeNumber(r.savings);
    if (val > bestVal) { bestVal = val; bestIdx = i; }
  });
  if (bestIdx >= 0) rates[bestIdx].highlight = true;

  return rates;
}

function adaptVoucher(api: ApiVoucher): Voucher {
  const name = cleanBrandName(api.brand);
  const category = normalizeCategory(api.category);
  const platformRates = adaptPlatformRates(api.platforms);

  const bestRateNum = Math.max(0, ...api.platforms.map((p) => parseFeeNumber(p.fee)));
  const bestRate = bestRateNum > 0 ? `${bestRateNum}%` : "N/A";

  const denoms = api.platforms
    .flatMap((p) => p.denominations)
    .filter((d): d is number => typeof d === "number" && d > 0);

  const expiryDays = parseInt(api.expiry_date, 10);
  const validity = !isNaN(expiryDays)
    ? expiryDays >= 365 ? "12 months from issue"
      : expiryDays >= 180 ? "6 months from issue"
      : `${expiryDays} days from issue`
    : "Check terms";

  return {
    id: api.slug,
    name,
    logo: api.logo || undefined,
    category,
    discount: bestRateNum > 0 ? `Up to ${bestRateNum}%` : "",
    description: `${name} gift voucher. Compare rates across ${api.platforms.length} platform${api.platforms.length !== 1 ? "s" : ""}.`,
    cards: [],
    bestRate,
    color: brandColor(name),
    longDescription: `${name} vouchers available across ${api.platforms.length} platforms. Best rate: ${bestRate}.`,
    denominations: [...new Set(denoms)].sort((a, b) => a - b),
    platforms: api.platforms.map((p) => p.name),
    platformRates,
    validity,
    rateHistory: [],
    lastUpdated: api.lastUpdated || undefined,
  };
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

const API_URL = "/api/vouchers/";

export async function fetchVouchers(): Promise<Voucher[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Voucher API ${res.status}`);
  const data: ApiVoucher[] = await res.json();
  return data.map(adaptVoucher);
}
