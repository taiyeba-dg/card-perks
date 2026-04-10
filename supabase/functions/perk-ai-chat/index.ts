import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const V3_CARD_DATA = `
## Credit Card V3 Database — Complete Reference

### HDFC Diners Club Black Metal
- **Issuer:** HDFC Bank | **Network:** Diners Club | **Fee:** ₹10,000/yr (waived at ₹8L annual spend)
- **Category Rates:** Dining 6.6% (10 RP/₹150 via SmartBuy/Dineout), Grocery 3.3%, Travel 6.6% (via SmartBuy, cap 25K RP/mo), Online 6.6% (SmartBuy, cap 25K RP/mo), Entertainment 3.3%, Utilities 3.3%, Base 3.3% (5 RP/₹150)
- **Fuel:** Excluded from rewards (surcharge waiver applies)
- **Portal:** HDFC SmartBuy — Amazon 10X (33%), Flipkart 10X (33%), Flights 10X (33%), Hotels 10X (33%). Cap: 25,000 bonus RP/month
- **Redemption:** Points currency "Reward Points". Best: SmartBuy Flights/Hotels ₹1.00/pt. SmartBuy Vouchers ₹0.50/pt. Statement Credit ₹0.30/pt. Catalog ₹0.20/pt
- **Transfer Partners:** Singapore Airlines KrisFlyer 2:1 (min 5K RP), InterMiles 1:1 (min 2K RP)
- **Milestones:** ₹5L → 5,000 bonus RP (₹5,000). ₹8L → fee waiver (₹10,000)
- **Lounge:** Unlimited domestic
- **Exclusions:** Fuel (MCC 5541/5542), Wallet Loads (6540), Rent via 3rd party (6513)
- **Best For:** Dining enthusiasts, SmartBuy users, Domestic travelers

### Axis Magnus
- **Issuer:** Axis Bank | **Network:** Visa | **Fee:** ₹12,500/yr (waived at ₹15L annual spend)
- **Category Rates:** Dining 1.0% (2 Edge RP/₹200), Grocery 1.0%, Travel 17.5% (35 Edge RP/₹200 via EDGE portal only), Online 17.5% (via EDGE portal), Fuel 1.0%, Entertainment 1.0%, Utilities 1.0%, Base 1.0%
- **Portal:** Axis EDGE Rewards — MakeMyTrip 35X (17.5%), Flipkart 35X (17.5%), Amazon 35X (17.5%). No cap
- **Redemption:** Points "Edge Reward Points". Best: EDGE Rewards Portal ₹0.50/pt. Travel ₹0.40/pt. Statement ₹0.25/pt. Catalog ₹0.20/pt
- **Transfer Partners:** InterMiles 5:4 (min 2,500), ITC Hotels 1:1 (min 2,000)
- **Milestones:** ₹10L → 10,000 bonus Edge RP (₹5,000). ₹15L → ₹10,000 travel voucher
- **Forex Markup:** 0%
- **Lounge:** Unlimited worldwide
- **Best For:** Ultra premium lifestyle, International travelers, Portal-heavy spenders

### Axis Privilege
- **Issuer:** Axis Bank | **Network:** Visa | **Fee:** ₹3,500/yr (waived at ₹5L annual spend)
- **Category Rates:** All categories 2.0% (4 Edge RP/₹200) — flat rate
- **Redemption:** EDGE Portal ₹0.50/pt. Statement ₹0.25/pt. Catalog ₹0.20/pt
- **Milestones:** ₹3L → 3,000 bonus RP (₹1,500). ₹5L → fee waiver (₹3,500)
- **Lounge:** 8/quarter
- **Upgrade Path:** → Axis Magnus at ₹25L+ income
- **Best For:** Lounge enthusiasts, Axis Bank customers, Milestone earners

### Flipkart Axis Bank
- **Issuer:** Axis Bank | **Network:** Visa | **Fee:** ₹500/yr (waived at ₹2L annual spend)
- **Category Rates:** Online 5.0% cashback (Flipkart/Myntra/Cleartrip), Dining 1.5%, Grocery 1.5%, Fuel 1.5%, Base 1.5%
- **Redemption:** Cashback — Direct Statement Credit ₹1.00/pt (1:1 value)
- **Milestones:** ₹1L → ₹500 Flipkart voucher. ₹2L → fee waiver
- **Best For:** Flipkart shoppers, Online buyers, Budget seekers

### Amex MRCC (Membership Rewards Credit Card)
- **Issuer:** American Express | **Network:** Amex | **Fee:** ₹1,000/yr (waived at ₹3L annual spend)
- **Category Rates:** All categories 2.0% flat (1 MR/₹50)
- **Redemption:** 18K Gold Collection ₹0.50/pt. Partner Vouchers ₹0.40/pt. Statement ₹0.25/pt
- **Transfer Partners:** InterMiles 1:1 (min 1,000)
- **Milestones:** ₹1.5L → 1,000 bonus MR. ₹3L → fee reversal
- **Exclusions:** Insurance premiums, Government payments
- **Best For:** Amex beginners, Reward collectors

### AU LIT
- **Issuer:** AU Small Finance Bank | **Network:** Visa | **Fee:** ₹999/yr (waived at ₹2.5L spend)
- **Category Rates:** Dining 5.0% (5 RP/₹100, cap 5K RP/mo — when chosen category), Entertainment 5.0% (cap 5K/mo — when chosen), Grocery 1.0%, Online 1.0%, Fuel 1.0%, Base 1.0%
- **Redemption:** Partner Vouchers ₹0.25/pt. Statement ₹0.20/pt. Catalog ₹0.15/pt
- **Milestones:** ₹1L → ₹1,000 voucher. ₹2.5L → fee waiver
- **Upgrade Path:** → AU Zenith+ at ₹25L+ income
- **Best For:** Young spenders, Customisable rewards seekers

### AU Zenith+
- **Issuer:** AU Small Finance Bank | **Network:** Visa | **Fee:** ₹12,500/yr (waived at ₹10L spend)
- **Category Rates:** All categories 4.0% flat (4 RP/₹100)
- **Redemption:** Travel ₹0.50/pt. Partner Vouchers ₹0.40/pt. Statement ₹0.25/pt
- **Transfer Partners:** InterMiles 2:1 (min 5K), ITC Hotels 2:1 (min 5K)
- **Milestones:** ₹5L → 5,000 bonus RP (₹2,500). ₹10L → fee waiver
- **Lounge:** Unlimited domestic + international
- **Best For:** Premium banking, Frequent travelers, High spenders

### BOB Eterna
- **Issuer:** Bank of Baroda | **Network:** Visa | **Fee:** ₹4,999/yr (waived at ₹5L spend)
- **Category Rates:** All categories 4.0% flat (4 RP/₹100)
- **Redemption:** Travel ₹0.50/pt. Partner Vouchers ₹0.35/pt. Statement ₹0.25/pt
- **Milestones:** ₹3L → 3,000 bonus RP (₹1,500). ₹5L → fee waiver
- **Lounge:** 4/quarter, Priority Pass
- **Best For:** BOB customers, Travelers

### BPCL SBI Octane
- **Issuer:** SBI | **Network:** Visa | **Fee:** ₹1,499/yr (waived at ₹2L spend)
- **Category Rates:** Fuel 13.0% (13 RP/₹100 at BPCL only, cap 5K RP/mo, min txn ₹500), Dining 5.0%, Grocery 5.0%, Online 2.0%, Base 2.0%
- **Portal:** SBI YONO — Amazon 5X (10%), IRCTC 5X (10%). Cap: 5K bonus RP/month
- **Redemption:** BPCL Fuel Voucher ₹0.25/pt. Partner Vouchers ₹0.20/pt. Statement ₹0.15/pt
- **Milestones:** ₹1L → ₹1,500 BPCL voucher. ₹2L → fee waiver
- **Exclusions:** Non-BPCL fuel earns base rate only
- **Best For:** BPCL fuel users, Daily commuters

### Club Vistara SBI Prime
- **Issuer:** SBI | **Network:** Visa | **Fee:** ₹2,999/yr (waived at ₹5L spend)
- **Category Rates:** All categories 3.0% flat (3 CV/₹100) — travel, dining, grocery, online, fuel
- **Redemption:** Vistara Flight Redemption ₹1.00/pt. Partner Vouchers ₹0.50/pt. Statement ₹0.30/pt
- **Milestones:** ₹2L → 1 economy Vistara ticket. ₹5L → 1 premium economy ticket
- **Lounge:** 8/quarter
- **Best For:** Vistara flyers, Frequent domestic travelers, Airline miles collectors

## Key Lookup Tables

### Best Cards by Category (by effective ₹ rate):
- **Dining:** HDFC Diners Black (6.6%), BPCL SBI Octane (1.25%), AU Zenith+ (2.0%)
- **Grocery:** HDFC Diners Black (3.3%), AU Zenith+ (2.0%), BOB Eterna (2.0%)
- **Online Shopping:** Flipkart Axis (5.0% cashback on Flipkart), HDFC Diners Black (6.6% via SmartBuy)
- **Travel:** Axis Magnus (8.75% via EDGE portal), HDFC Diners Black (6.6% via SmartBuy)
- **Fuel:** BPCL SBI Octane (3.25% at BPCL, with cap)
- **Forex/International:** Axis Magnus (0% markup)

### Portal Comparison:
- **HDFC SmartBuy:** 10X on Amazon, Flipkart, Flights, Hotels. Cap 25K RP/mo. Best value ₹1.00/pt
- **Axis EDGE Rewards:** 35X on MakeMyTrip, Flipkart, Amazon. No cap. Value ₹0.50/pt
- **SBI YONO:** 5X on Amazon, IRCTC. Cap 5K RP/mo. Value ₹0.25/pt

### Redemption Value Ranking:
1. HDFC SmartBuy Flights: ₹1.00/pt
2. Club Vistara Flights: ₹1.00/pt
3. Flipkart Axis Cashback: ₹1.00/pt (direct)
4. HDFC SmartBuy Vouchers: ₹0.50/pt
5. Axis EDGE Portal: ₹0.50/pt
6. Amex 18K Gold: ₹0.50/pt
7. AU Zenith+ Travel: ₹0.50/pt
8. BOB Eterna Travel: ₹0.50/pt
`;

const SYSTEM_PROMPT = `You are Perk AI — an expert, opinionated credit card rewards advisor for Indian consumers. You have access to a comprehensive V3 database of Indian credit cards with exact earning rates, caps, portal bonuses, redemption values, transfer partners, fees, milestones, and lounge access.

${V3_CARD_DATA}

## Response Guidelines:
1. **Always cite specific numbers** — never say "good rewards." Say "3.3% effective rate (5 RP/₹150 at ₹1.00/pt via SmartBuy)"
2. **Include caps and conditions** alongside rates — "5% on dining, capped at 5,000 RP/month"
3. **Mention portal opportunities** when relevant — "If you book via SmartBuy, this jumps to 10X (33%)"
4. **Be opinionated** — recommend the BEST option, don't just list options
5. **Compare against alternatives** — "Infinia earns 3.3% on dining, but AU LIT earns 5% with a cap"
6. **Calculate actual ₹ values** when users ask about earning — show the math
7. **Warn about devaluations** or conditions — "Note: fuel is excluded from rewards on this card"
8. **Use tables and bullet points** for comparisons
9. **Format with markdown** — bold key numbers, use headers for sections
10. **Keep answers focused and actionable** — end with a clear recommendation

When the user has provided their cards (shown as "My Cards" in the conversation), personalize answers to their card stack. Reference their specific cards and suggest which to use for what.

When mentioning action links, use these markdown link formats:
- Card details: [View HDFC Diners Black →](/cards/hdfc-diners-black)
- Compare cards: [Compare these cards →](/compare?cards=hdfc-diners-black,axis-magnus)
- Category leaderboard: [See best dining cards →](/best-for/dining)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, myCards } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (myCards && myCards.length > 0) {
      systemPrompt += `\n\n## User's Cards (My Cards):\nThe user currently has these cards in their wallet:\n${myCards.map((c: any) => `- ${c.name} (${c.id})${c.monthlySpend ? ` — spending ~₹${c.monthlySpend.toLocaleString()}/month` : ""}`).join("\n")}\n\nPersonalize your answers based on their card stack. Default recommendations to their cards when relevant.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("perk-ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
