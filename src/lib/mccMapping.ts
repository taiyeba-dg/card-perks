/**
 * MCC (Merchant Category Code) → spending category mapping
 * Used by the QR scanner to identify what kind of merchant a QR code belongs to,
 * and which credit card category rewards apply.
 */

interface MCCInfo {
  category: string;
  description: string;
  emoji: string;
  /** The v3 reward category key used by the card data system */
  v3Key: string;
}

const MCC_RANGES: { start: number; end: number; info: MCCInfo }[] = [
  // Airlines
  { start: 3000, end: 3350, info: { category: "Travel", description: "Airlines", emoji: "✈️", v3Key: "travel" } },
  { start: 4511, end: 4511, info: { category: "Travel", description: "Airlines & Air Carriers", emoji: "✈️", v3Key: "travel" } },
  // Hotels
  { start: 3501, end: 3999, info: { category: "Travel", description: "Hotels & Lodging", emoji: "🏨", v3Key: "travel" } },
  { start: 7011, end: 7011, info: { category: "Travel", description: "Hotels & Resorts", emoji: "🏨", v3Key: "travel" } },
  // Railways
  { start: 4112, end: 4112, info: { category: "Travel", description: "Railways (IRCTC)", emoji: "🚂", v3Key: "travel" } },
  // Car Rental
  { start: 7512, end: 7512, info: { category: "Travel", description: "Car Rentals", emoji: "🚗", v3Key: "travel" } },
  { start: 3351, end: 3500, info: { category: "Travel", description: "Car Rental Agencies", emoji: "🚗", v3Key: "travel" } },
];

const MCC_MAP: Record<string, MCCInfo> = {
  // ── Groceries ──
  "5411": { category: "Groceries", description: "Grocery Stores & Supermarkets", emoji: "🛒", v3Key: "grocery" },
  "5422": { category: "Groceries", description: "Meat & Fish Markets", emoji: "🛒", v3Key: "grocery" },
  "5441": { category: "Groceries", description: "Candy & Confectionery", emoji: "🛒", v3Key: "grocery" },
  "5451": { category: "Groceries", description: "Dairy Products", emoji: "🛒", v3Key: "grocery" },
  "5462": { category: "Groceries", description: "Bakeries", emoji: "🛒", v3Key: "grocery" },
  "5499": { category: "Groceries", description: "Misc Food Stores", emoji: "🛒", v3Key: "grocery" },

  // ── Dining ──
  "5812": { category: "Dining", description: "Restaurants", emoji: "🍽️", v3Key: "dining" },
  "5813": { category: "Dining", description: "Bars & Lounges", emoji: "🍽️", v3Key: "dining" },
  "5814": { category: "Dining", description: "Fast Food & Quick Service", emoji: "🍽️", v3Key: "dining" },

  // ── Fuel ──
  "5541": { category: "Fuel", description: "Fuel / Petrol Pump", emoji: "⛽", v3Key: "fuel" },
  "5542": { category: "Fuel", description: "Fuel (Automated)", emoji: "⛽", v3Key: "fuel" },
  "5983": { category: "Fuel", description: "EV Charging Stations", emoji: "⚡", v3Key: "fuel" },

  // ── Online Shopping / E-commerce ──
  "5399": { category: "Online Shopping", description: "General Merchandise (E-commerce)", emoji: "🛍️", v3Key: "online" },
  "5999": { category: "Online Shopping", description: "Miscellaneous Retail", emoji: "🛍️", v3Key: "online" },
  "5964": { category: "Online Shopping", description: "Catalog / Online Retail", emoji: "🛍️", v3Key: "online" },
  "5262": { category: "Online Shopping", description: "Online Marketplaces", emoji: "🛍️", v3Key: "online" },
  "5311": { category: "Online Shopping", description: "Department Stores", emoji: "🏬", v3Key: "online" },
  "5331": { category: "Online Shopping", description: "Variety Stores", emoji: "🏬", v3Key: "online" },
  "5691": { category: "Online Shopping", description: "Clothing Stores", emoji: "👗", v3Key: "online" },
  "5699": { category: "Online Shopping", description: "Apparel & Accessories", emoji: "👗", v3Key: "online" },

  // ── Utilities ──
  "4900": { category: "Utilities", description: "Electricity, Gas & Water", emoji: "💡", v3Key: "utilities" },
  "4814": { category: "Utilities", description: "Telecom & Mobile Recharge", emoji: "📱", v3Key: "utilities" },
  "4899": { category: "Utilities", description: "Cable, DTH & Broadband", emoji: "📡", v3Key: "utilities" },
  "4816": { category: "Utilities", description: "Internet Services", emoji: "🌐", v3Key: "utilities" },

  // ── Entertainment ──
  "7832": { category: "Entertainment", description: "Cinema / Movie Theatres", emoji: "🎬", v3Key: "entertainment" },
  "7841": { category: "Entertainment", description: "DVD / Video Rental (Streaming)", emoji: "🎬", v3Key: "entertainment" },
  "5815": { category: "Entertainment", description: "Digital Media / OTT", emoji: "📺", v3Key: "entertainment" },
  "5816": { category: "Entertainment", description: "Digital Games", emoji: "🎮", v3Key: "entertainment" },
  "7922": { category: "Entertainment", description: "Events & Tickets", emoji: "🎫", v3Key: "entertainment" },
  "7941": { category: "Entertainment", description: "Sports Events", emoji: "🏟️", v3Key: "entertainment" },
  "7933": { category: "Entertainment", description: "Bowling Alleys", emoji: "🎳", v3Key: "entertainment" },
  "7911": { category: "Entertainment", description: "Dance & Entertainment", emoji: "💃", v3Key: "entertainment" },

  // ── Education ──
  "8211": { category: "Education", description: "Schools", emoji: "🎓", v3Key: "base" },
  "8220": { category: "Education", description: "Colleges & Universities", emoji: "🎓", v3Key: "base" },
  "8241": { category: "Education", description: "Correspondence Schools", emoji: "🎓", v3Key: "base" },
  "8244": { category: "Education", description: "Business & Secretarial Schools", emoji: "🎓", v3Key: "base" },
  "8249": { category: "Education", description: "Trade & Vocational Schools", emoji: "🎓", v3Key: "base" },
  "8299": { category: "Education", description: "Educational Services", emoji: "🎓", v3Key: "base" },

  // ── Medical / Pharmacy ──
  "5912": { category: "Medical", description: "Pharmacies & Drug Stores", emoji: "💊", v3Key: "base" },
  "8011": { category: "Medical", description: "Doctors", emoji: "🏥", v3Key: "base" },
  "8021": { category: "Medical", description: "Dentists", emoji: "🦷", v3Key: "base" },
  "8042": { category: "Medical", description: "Opticians & Eyeglasses", emoji: "👓", v3Key: "base" },
  "8062": { category: "Medical", description: "Hospitals", emoji: "🏥", v3Key: "base" },
  "8099": { category: "Medical", description: "Health Services", emoji: "🏥", v3Key: "base" },

  // ── Insurance ──
  "6300": { category: "Insurance", description: "Insurance Premiums", emoji: "🛡️", v3Key: "base" },

  // ── Rent ──
  "6513": { category: "Rent", description: "Rent Payment", emoji: "🏠", v3Key: "base" },

  // ── Wallet Loads (usually excluded) ──
  "6540": { category: "Wallet Load", description: "Wallet / Prepaid Load", emoji: "📲", v3Key: "base" },

  // ── Government ──
  "9211": { category: "Government", description: "Court Costs & Fines", emoji: "🏛️", v3Key: "base" },
  "9222": { category: "Government", description: "Government Fines", emoji: "🏛️", v3Key: "base" },
  "9311": { category: "Government", description: "Tax Payments", emoji: "🏛️", v3Key: "base" },
  "9399": { category: "Government", description: "Government Services", emoji: "🏛️", v3Key: "base" },
  "9402": { category: "Government", description: "Postal Services", emoji: "📮", v3Key: "base" },

  // ── Transport ──
  "4121": { category: "Transport", description: "Taxi / Ride-hailing (Uber, Ola)", emoji: "🚕", v3Key: "base" },
  "4111": { category: "Transport", description: "Local Transport", emoji: "🚌", v3Key: "base" },
  "4131": { category: "Transport", description: "Bus Lines", emoji: "🚌", v3Key: "base" },
  "4789": { category: "Transport", description: "Transportation Services", emoji: "🚗", v3Key: "base" },
  "7523": { category: "Transport", description: "Parking Lots & Garages", emoji: "🅿️", v3Key: "base" },
  "5013": { category: "Transport", description: "Auto Parts", emoji: "🔧", v3Key: "base" },
  "5511": { category: "Transport", description: "Auto Dealers", emoji: "🚗", v3Key: "base" },
  "5571": { category: "Transport", description: "Motorcycle Dealers", emoji: "🏍️", v3Key: "base" },
  "7531": { category: "Transport", description: "Auto Body Repair", emoji: "🔧", v3Key: "base" },
  "7538": { category: "Transport", description: "Auto Service Shops", emoji: "🔧", v3Key: "base" },

  // ── Jewellery ──
  "5944": { category: "Jewellery", description: "Jewellery Stores", emoji: "💎", v3Key: "base" },
  "5094": { category: "Jewellery", description: "Precious Stones & Metals", emoji: "💎", v3Key: "base" },

  // ── Electronics ──
  "5732": { category: "Electronics", description: "Electronics Stores", emoji: "🖥️", v3Key: "online" },
  "5734": { category: "Electronics", description: "Computer Software", emoji: "💻", v3Key: "online" },
  "5045": { category: "Electronics", description: "Computer Hardware", emoji: "💻", v3Key: "online" },
};

export function getCategoryForMCC(mcc: string | undefined | null): MCCInfo {
  if (!mcc) return { category: "Unknown", description: "No MCC code found", emoji: "❓", v3Key: "base" };

  const code = mcc.trim();

  // Direct lookup
  if (MCC_MAP[code]) return MCC_MAP[code];

  // Range lookup (airlines, hotels, car rentals)
  const num = parseInt(code, 10);
  if (!isNaN(num)) {
    for (const range of MCC_RANGES) {
      if (num >= range.start && num <= range.end) return range.info;
    }
  }

  return { category: "Other", description: `MCC ${code}`, emoji: "🏷️", v3Key: "base" };
}

export type { MCCInfo };
