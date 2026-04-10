export interface CategoryTips {
  categorySlug: string;
  editorialVerdict: string;       // One-line verdict for the winner showcase
  proTips: string[];               // 3-4 actionable tips
  commonMistakes: string[];        // 2-3 mistakes to avoid
  switchSignals: string[];         // When to consider switching cards
  lastUpdated: string;             // ISO date
}

export const CATEGORY_TIPS: CategoryTips[] = [
  {
    categorySlug: "dining",
    editorialVerdict: "HSBC Live+ delivers a flat 10% cashback on all dining — the highest available — capped at \u20B91,000/month. Swiggy HDFC matches at 10% but only on Swiggy orders.",
    proTips: [
      "HSBC Live+ gives 10% on ALL dining (restaurants, Swiggy, Zomato) capped at \u20B91,000/month — best if you spend up to \u20B910K/month on food",
      "Swiggy HDFC is lifetime free and gives 10% on Swiggy food orders + Instamart, but requires min \u20B9249 transaction (new rule from April 2026)",
      "YES Bank Paisasave gives 6% on all dining with a \u20B93,000/month cap — better for high spenders who exceed HSBC's \u20B91,000 cap",
      "IndusInd EazyDiner gives 25-50% discount at 2,000+ premium restaurants — worth it if you dine out at upscale places regularly",
    ],
    commonMistakes: [
      "Assuming all food delivery counts as 'dining' — some cards classify Swiggy as 'online shopping' not 'dining' depending on MCC code",
      "Ignoring monthly caps — HSBC Live+ caps at \u20B91,000/month, so spending over \u20B910K on dining earns nothing extra",
      "Paying via UPI linked to credit card — some cards don't count UPI-routed transactions for bonus dining categories",
    ],
    switchSignals: [
      "If you spend over \u20B910K/month on dining, switch from HSBC Live+ to YES Paisasave for its higher \u20B93,000 cap at 6%",
      "If your dining is primarily Swiggy, the lifetime-free Swiggy HDFC card makes a dedicated second card worthwhile",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "grocery",
    editorialVerdict: "HSBC Live+ gives 10% on all grocery platforms (capped at \u20B91,000/month). Swiggy HDFC matches at 10% but only on Instamart. SBI Cashback covers the widest range of platforms at 5%.",
    proTips: [
      "HSBC Live+ earns 10% at Zepto, DMart, BigBasket, Blinkit, and all supermarkets — the widest coverage at the highest rate",
      "Swiggy HDFC (lifetime free) gives 10% on Instamart specifically — stack with Swiggy One membership for free delivery + cashback",
      "SBI Cashback gives 5% on Zepto, Instamart, Flipkart Minutes, and more — but from April 1, 2026 the total cap drops to \u20B94,000/month (\u20B92,000 online + \u20B92,000 offline), down from \u20B95,000. New exclusions: gaming platforms, tolls, and government transactions",
      "Tata Neu Infinity HDFC gives 5% as NeuCoins on BigBasket — good if you're in the Tata ecosystem (Croma, 1mg, BigBasket)",
    ],
    commonMistakes: [
      "Thinking all grocery apps earn at the 'grocery' rate — Zepto and Blinkit may fall under 'online' or 'other' on some cards depending on MCC mapping",
      "Not noticing the SBI Cashback cap reduction — from April 1, 2026, total cap drops to \u20B94,000 (\u20B92,000 online + \u20B92,000 offline, was \u20B95,000 combined) with new exclusions on gaming and government MCCs",
    ],
    switchSignals: [
      "If SBI Cashback's new \u20B94,000/month total cap (\u20B92,000 online + \u20B92,000 offline) affects you, switch grocery spend to HSBC Live+ for the higher 10% rate",
      "If you primarily use Instamart, the free Swiggy HDFC card beats paying \u20B9999/year for HSBC Live+. Also consider the new Swiggy Ornge at \u20B9500 for 5% across Swiggy + online categories",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "online-shopping",
    editorialVerdict: "Amazon Pay ICICI is unbeatable for Amazon at 5% (Prime) with no cap and lifetime free. Flipkart Axis Bank gives 5% Flipkart + 7.5% Myntra. Use the right co-branded card for each platform.",
    proTips: [
      "Amazon Pay ICICI gives 5% unlimited cashback on Amazon for Prime members with zero annual fee — the single best card for Amazon shoppers",
      "Flipkart Axis Bank gives 5% on Flipkart + 7.5% on Myntra, but caps at \u20B94,000/quarter per platform — plan big purchases around quarter resets",
      "SBI Cashback gives 5% across ALL platforms (Amazon, Flipkart, Myntra, etc.) but online cap drops to \u20B92,000/cycle from April 1, 2026 (total \u20B94,000 with offline). Also consider PhonePe HDFC Ultimo at 5% on Amazon/Flipkart/Myntra/Ajio",
      "During sale events (Great Indian Sale, Big Billion Days), stack co-branded card rewards + bank offers + coupon codes for triple savings",
    ],
    commonMistakes: [
      "Using a general rewards card for Amazon when Amazon Pay ICICI gives 5% uncapped for free — opportunity cost of 3-4% per purchase",
      "Not tracking quarterly caps on Flipkart Axis (\u20B94,000/quarter) — front-load big purchases early in the quarter",
      "Forgetting to initiate purchases FROM the bank portal (SmartBuy/EDGE) — going directly to the site misses portal bonuses entirely",
    ],
    switchSignals: [
      "If you shop primarily on Flipkart/Myntra, get the Flipkart Axis Bank card as a dedicated shopping card alongside your main card",
      "If Flipkart Axis quarterly caps limit you, SBI Cashback covers all platforms at 5% with monthly caps instead",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "travel",
    editorialVerdict: "HDFC Infinia remains the gold standard — 10X on SmartBuy hotels, \u20B91/pt flights, and 21 transfer partners. For budget travelers, MakeMyTrip ICICI gives 6% on hotels with 0.99% forex markup.",
    proTips: [
      "HDFC Infinia's SmartBuy flights redeem at \u20B91.00/pt — far better than the \u20B90.33/pt for vouchers after the January 2026 devaluation",
      "Transfer Infinia/Diners Black points to airline miles (Singapore Airlines KrisFlyer, Air India) for premium cabin redemptions at 3-5\u20B9/point",
      "MakeMyTrip ICICI gives 6% on hotels + 3% on flights + complimentary MMT Black Gold membership — best co-branded travel card",
      "Standard Chartered EaseMyTrip gives flat 10% off domestic flights (max \u20B91,000) and 20% off hotels (max \u20B95,000) — good for budget trips",
    ],
    commonMistakes: [
      "Redeeming HDFC points for SmartBuy vouchers at \u20B90.33/pt instead of flights at \u20B91.00/pt — 3X value difference",
      "Booking directly on airline websites without checking SmartBuy/EDGE — the portal bonus can 2-5X your earnings",
      "Ignoring that Axis Atlas is discontinued for new applicants — don't plan around getting one",
    ],
    switchSignals: [
      "If your SmartBuy voucher redemption value drops further, prioritize flight/hotel bookings or transfer partners",
      "If HDFC tightens Infinia requirements (spend \u20B918L or hold \u20B950L from April 2027), evaluate if you qualify",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "fuel",
    editorialVerdict: "IndianOil RBL XTRA leads with 8.5% total value-back (7.5% fuel points + 1% surcharge waiver). BPCL SBI OCTANE follows at 7.25% and is more widely available.",
    proTips: [
      "IndianOil RBL XTRA gives 15 fuel points per \u20B9100 at IOCL stations = 7.5% + 1% surcharge waiver = 8.5% total (max \u20B92,000/month spend benefits)",
      "BPCL SBI OCTANE gives 25 reward points per \u20B9100 at BPCL = 6.25% + 1% surcharge waiver = 7.25% total (2,500 RP/month cap = \u20B9625 value)",
      "HPCL Energie BOB gives 4% base + 1% surcharge waiver + 1.5% bonus via HP Pay app = 6.5% — cheapest annual fee at \u20B9499",
      "Fuel surcharge waiver only applies between \u20B9400-4,000 per transaction — fill up in this range for maximum benefit",
    ],
    commonMistakes: [
      "Filling up beyond \u20B94,000 in a single transaction — surcharge waiver typically doesn't apply above this threshold",
      "Using a premium travel card at fuel pumps where it earns only 0.5-1% base rate instead of a dedicated fuel card earning 6-8%",
      "Ignoring that fuel surcharge waiver saves 1% separately from reward points — both stack for total savings",
    ],
    switchSignals: [
      "If you spend \u20B95K+/month on fuel, a dedicated fuel card saves \u20B94,000-5,000/year vs using a general rewards card",
      "If you've switched to an EV, your fuel card benefits no longer apply — switch to a general rewards card",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "entertainment",
    editorialVerdict: "SBI Aurum gives 4 free BookMyShow tickets monthly (\u20B912,000/year value) — the best for movie lovers. IndusInd Legend offers 3 free tickets with zero annual fee. Kotak PVR INOX Gold delivers up to 24 free PVR tickets/year.",
    proTips: [
      "SBI Aurum gives 4 free BookMyShow tickets every month (max \u20B9250 each, 2 per booking, 24hr cooling) = \u20B912,000/year — requires \u20B940L+ income",
      "IndusInd Legend gives 3 free BookMyShow tickets monthly + BOGO (max \u20B9200 per free ticket) — lifetime free card, best budget option",
      "Kotak PVR INOX Gold gives 1 free PVR ticket per \u20B910K monthly spend + BOGO on Saturdays — up to 24 free tickets + 5% off + 20% off F&B",
      "HDFC Diners Club Privilege offers weekend BOGO on BookMyShow + complimentary Swiggy One & Times Prime on \u20B975K spend within 90 days",
    ],
    commonMistakes: [
      "Getting SBI Aurum just for movie tickets without meeting the \u20B940L+ income requirement or \u20B910L+ spend to waive the high annual fee",
      "Not checking that ICICI BOGO on BookMyShow now requires \u20B925K quarterly spend (changed January 2026) — and Instant Platinum lost BookMyShow benefits entirely from February 2026",
      "Assuming ICICI Rubyx/Sapphiro still have uncapped entertainment rewards — the Jan 2026 overhaul added a \u20B940K/month cap on accelerated categories",
    ],
    switchSignals: [
      "If you held ICICI Instant Platinum for BookMyShow BOGO, it's gone — switch to IndusInd Legend (3 free tickets/month, lifetime free) or SBI Aurum (4 free tickets/month)",
      "If ICICI's new BookMyShow BOGO spend requirement (\u20B925K/quarter) is too high, switch to IndusInd Legend for free tickets with no spend condition",
      "If you primarily watch at PVR, Kotak PVR INOX Gold's 24 free tickets/year may beat BookMyShow-focused cards",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "pharmacy",
    editorialVerdict: "Apollo SBI Card SELECT gives 10% rewards at Apollo pharmacy and hospitals — the only dedicated healthcare card worth having. SBI PULSE offers 10% on pharmacy + fitness + dining.",
    proTips: [
      "Apollo SBI Card SELECT gives 10% at all Apollo pharmacies and hospitals — essential if you regularly buy medicines at Apollo",
      "SBI Card PULSE gives 10% on pharmacy, fitness, and dining — broader coverage but requires annual fee waiver through spend",
      "Route online medicine orders through 1mg or PharmEasy via bank portals for additional portal bonuses on top of card rewards",
      "Health insurance premium payments on some cards earn milestone bonuses — check if your card counts insurance MCC codes",
    ],
    commonMistakes: [
      "Assuming hospital payments earn rewards on general cards — many premium cards explicitly exclude hospital and insurance MCC codes",
      "Not checking if your online pharmacy order codes as 'pharmacy' or 'online shopping' — MCC classification varies by platform",
    ],
    switchSignals: [
      "If you spend \u20B95K+/month at Apollo pharmacies, the Apollo SBI Card SELECT saves \u20B96,000+/year vs a general card",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "telecom",
    editorialVerdict: "Airtel Axis was the king at 25% via Airtel Thanks app — but the April 12, 2026 devaluation gutted it: cashback is now capped at 2x your base earnings (not a flat \u20B9250), lounge access removed entirely, and Swiggy/BigBasket 10% withdrawn. Axis ACE at 5% via Google Pay is now the clear winner.",
    proTips: [
      "Axis ACE gives 5% cashback on utility/telecom bills paid through Google Pay — consistent, no surprises, zero annual fee",
      "Airtel Axis post-April 12, 2026: cashback now capped at 2x base earnings per cycle (if you earn \u20B9100 base, max Airtel cashback = \u20B9200). Lounge access removed. Swiggy/BigBasket 10% gone. Zomato/Blinkit 10% requires \u20B9499 min order and credits via partner wallet, not bank cashback",
      "PhonePe HDFC Ultimo gives 10% on recharges and bill payments via PhonePe — a strong Airtel Axis replacement for telecom spends",
      "Annual recharge plans earn more rewards in one transaction than 12 monthly top-ups and usually cost less overall",
    ],
    commonMistakes: [
      "Still relying on Airtel Axis for 25% cashback without checking the April 12, 2026 overhaul — the new 2x-base cap means you need significant non-Airtel card spend just to unlock any Airtel cashback at all",
      "Recharging via UPI instead of card payment — you miss card rewards entirely on UPI transactions (exception: RuPay credit cards like PhonePe Ultimo earn on UPI)",
    ],
    switchSignals: [
      "If you held Airtel Axis for the 25% benefit, switch telecom spend to Axis ACE (5% via Google Pay) or PhonePe HDFC Ultimo (10% via PhonePe). The Airtel Axis card is no longer competitive for telecom rewards after April 2026",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "education",
    editorialVerdict: "Education rewards are heavily devalued industry-wide. Banks charge 1-2% processing fees on third-party education payments that negate most rewards. Direct college payments via card are better but rare.",
    proTips: [
      "Most banks now charge 1% + GST processing fee on education payments over \u20B945K/billing cycle via third-party apps (CRED, Cheq, MobiKwik)",
      "Standard Chartered Smart has the best education reward cap at \u20B91,000/month — modest but the best available",
      "If your school accepts direct credit card payment without convenience fee, use your highest-earning card to maximize rewards",
      "Tata Neu HDFC cards removed education payment earning on third-party apps (September 2024) — don't route education fees through these",
    ],
    commonMistakes: [
      "Paying education fees through CRED/Cheq expecting full rewards — the 1-2% processing fee often exceeds any reward points earned",
      "Not checking if your school's payment gateway supports credit cards directly (avoiding third-party apps and their fees)",
    ],
    switchSignals: [
      "If your card removes education MCC from rewards eligibility, consider a simple high-cashback card for the rare direct education payment",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "utilities",
    editorialVerdict: "Axis ACE gives 5% cashback on utility bills via Google Pay with zero annual fee — the clear winner. Most premium cards explicitly exclude utilities from bonus categories.",
    proTips: [
      "Axis ACE gives 5% on utilities paid through Google Pay — electricity, gas, water, broadband all qualify (cashback recently reduced from 2% base to 1.5% but Google Pay route stays at 5%)",
      "PhonePe HDFC Ultimo offers 10% rewards on utility payments via PhonePe app — higher rate but requires the card",
      "Many premium cards (HDFC Infinia, Diners Black) cap utility/telecom reward points at \u20B92,000/month or exclude entirely — check your T&C",
      "Summer months with high AC bills are the time to ensure your utility card is optimized — \u20B95K electricity bill at 5% = \u20B9250/month saved",
    ],
    commonMistakes: [
      "Assuming your premium card earns full rewards on utility payments — HDFC, Axis, and SBI premium cards often cap or exclude these",
      "Not using Axis ACE through Google Pay for utilities — the 5% rate only applies through the Google Pay channel, not direct bill pay",
    ],
    switchSignals: [
      "If your card adds utility payments to its exclusion list, get an Axis ACE as a dedicated utility payment card (zero annual fee)",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "forex",
    editorialVerdict: "Scapia Federal offers 0% forex markup + 10% rewards + zero annual fee — the best forex card in India, period. Niyo Global also charges 0% markup but is FD-backed.",
    proTips: [
      "Scapia Federal charges 0% forex markup with 10% rewards and zero annual fee — unmatched for international spending",
      "Niyo Global also charges 0% forex markup (backed by an FD) — good if you prefer a debit-card-like approach",
      "HDFC Infinia charges 2% forex markup but earns 3.33% — net positive of 1.33% but still worse than 0% markup cards",
      "ALWAYS choose to pay in local currency abroad (decline DCC) — Dynamic Currency Conversion adds 3-5% extra on top of markup",
    ],
    commonMistakes: [
      "Accepting DCC (Dynamic Currency Conversion) at international terminals — always pay in local currency, never INR",
      "Using your regular 3.5% markup card abroad when 0% markup options exist — on a \u20B91L international trip, that's \u20B93,500 saved",
      "Forgetting to enable international transactions on your card before traveling — many banks disable this by default",
    ],
    switchSignals: [
      "If you travel internationally even once a year, a 0% forex card like Scapia Federal saves \u20B93,500 per \u20B91L spent vs standard 3.5% markup",
      "If your current card increases its forex markup, the free Scapia Federal makes switching a no-brainer",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "lounge",
    editorialVerdict: "Lounge access is under siege — HDFC, SBI, Axis, and IndusInd all restricted access in 2024-2025. HDFC Infinia (unlimited, invitation-only) and Scapia Federal (unlimited domestic on \u20B920K/month spend, free) are the safest bets.",
    proTips: [
      "HDFC Infinia gives unlimited domestic + international lounge access (1000+ lounges via Priority Pass) — but now requires \u20B918L annual spend or \u20B950L relationship value from April 2027",
      "Scapia Federal gives unlimited domestic lounge on \u20B920K/month spend — lifetime free card, best value proposition for frequent domestic travelers",
      "YES Bank Marquee offers 24 domestic visits/year + unlimited international — \u20B910K annual fee waivable on spend",
      "Check the DreamFolks app for real-time domestic lounge availability — coverage varies significantly by airport",
    ],
    commonMistakes: [
      "Assuming your card still has unlimited lounge access — HDFC Regalia now requires \u20B91L/quarter, SBI restructured in January 2026, IndusInd Legend removed access entirely in March 2025",
      "Not checking if new spend conditions were added since you got the card — banks are retroactively adding requirements to existing cardholders",
      "Forgetting that guest charges apply separately — most cards charge \u20B9500-2,000 per guest per visit even when your access is free",
    ],
    switchSignals: [
      "If IndusInd Legend removed your lounge access (March 2025), switch to Scapia Federal for free unlimited domestic access",
      "If HDFC Regalia's \u20B91L/quarter spend requirement is too high, downgrade to a card with conditional access you can actually meet",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "rent",
    editorialVerdict: "Rent via credit card is no longer a rewards play \u2014 it's a spend-threshold strategy. Use it to meet annual fee waivers on premium cards, not to earn cashback.",
    proTips: [
      "Rent payments count toward annual spend thresholds \u2014 HDFC Infinia needs \u20B918L, Regalia needs \u20B94L, Magnus needs \u20B912.5L. Rent can bridge the gap.",
      "RedGiraffe charges the lowest fee at 0.39%+GST vs CRED at 1-1.5% and NoBroker at 1-2% \u2014 the platform you choose matters as much as the card",
      "Most cards no longer earn rewards on rent payments \u2014 don't expect cashback, use rent purely for spend threshold qualification",
      "If your rent is \u20B925K+/month, that's \u20B93L/year toward your Infinia/Regalia spend requirement \u2014 could save \u20B910K+ in annual fees",
    ],
    commonMistakes: [
      "Expecting cashback on rent payments \u2014 nearly all banks have excluded rent from reward-earning categories in 2025-2026",
      "Not comparing platform fees \u2014 the difference between RedGiraffe (0.39%) and CRED (1.5%) on \u20B930K rent is \u20B9333/month",
    ],
    switchSignals: [
      "If you're paying rent via bank transfer but struggling to meet your premium card's annual spend threshold, switching to card-based rent can save your fee waiver",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "insurance",
    editorialVerdict: "Apollo SBI Card SELECT is the only card with meaningful insurance category rewards (10% at Apollo). ICICI now caps insurance at \u20B940K/month (Jan 2026), HDFC caps at \u20B95-10K/month. Most banks are aggressively excluding insurance from rewards.",
    proTips: [
      "Apollo SBI Card SELECT gives 10% rewards at all Apollo pharmacies AND hospitals \u2014 the only dedicated healthcare card worth having for insurance-adjacent spending",
      "HDFC Infinia now caps insurance reward points at \u20B910,000/month; Diners Black at \u20B95,000/month \u2014 split large premiums across months if possible",
      "ICICI Bank (Jan 2026 overhaul): insurance transactions earn rewards only up to \u20B940,000/month across all ICICI cards. Emeralde Metal lost insurance rewards entirely",
      "Large annual premiums (\u20B91L+) still count toward annual spend thresholds even if they don't earn bonus rewards \u2014 valuable for fee waivers. Scapia Federal removed insurance from rewards entirely (February 2026)",
    ],
    commonMistakes: [
      "Assuming your premium card earns full rewards on insurance \u2014 HDFC, ICICI, Scapia, and others have capped or excluded insurance in 2025-2026",
      "Paying insurance via third-party apps (CRED, Cheq) \u2014 some banks charge additional processing fees on top of removing rewards",
    ],
    switchSignals: [
      "If your card recently capped insurance points, evaluate splitting the premium payment across multiple cards to stay under individual caps",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "cashback",
    editorialVerdict: "Amazon Pay ICICI (5% Amazon, unlimited, lifetime free) is the king of simple cashback. SBI Cashback gives 5% online but cap dropped to \u20B92K/cycle. IDFC First Select offers the best flat-rate at 1.5% unlimited on everything.",
    proTips: [
      "Amazon Pay ICICI is the simplest high-value card: 5% unlimited on Amazon for Prime members, 3% non-Prime, 2% partner merchants, 1% everything else \u2014 zero annual fee",
      "IDFC First Select gives a true flat 1.5% on ALL spending with no category restrictions or caps \u2014 the best 'set and forget' card",
      "SBI Cashback gives 5% online but the April 2026 cap reduction to \u20B92K/cycle means it maxes at \u20B924K/year \u2014 pair with co-branded cards for overflow",
      "YES Paisasave gives 6% on dining and travel with a \u20B93,000/month cap \u2014 higher than most flat cards on these categories",
    ],
    commonMistakes: [
      "Using a flat 1-1.5% card for categories where co-branded cards give 5-10% \u2014 the opportunity cost is huge on Amazon, Flipkart, dining, etc.",
      "Not having a flat cashback card as a backup for spending categories not covered by your co-branded cards \u2014 every \u20B9100 spent without rewards is money left on the table",
      "Loading wallets (Paytm, Amazon Pay, etc.) on ICICI cards after Jan 2026 without knowing the 1% surcharge on loads above \u20B95,000 and 2% on gaming/fantasy loads \u2014 this can wipe out your cashback entirely",
    ],
    switchSignals: [
      "If you're juggling 5+ cards for different categories and finding it exhausting, simplifying to one or two flat cashback cards trades a small amount of value for significant convenience",
      "If you were loading wallets via ICICI cards for cashback arbitrage, the new 1-2% surcharge makes this strategy negative-EV \u2014 switch wallet loads to HDFC or Axis cards",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "beginner",
    editorialVerdict: "Amazon Pay ICICI is the best first card: lifetime free, 5% Amazon for Prime, no income requirement beyond basic eligibility. For zero credit history, start with an FD-backed secured card from ICICI, SBI, or Kotak.",
    proTips: [
      "Amazon Pay ICICI is lifetime free with 5% Amazon cashback \u2014 the single best first card if you shop on Amazon regularly (most people do)",
      "If you have no credit history, apply for an FD-backed secured card: ICICI Platinum Chip, SBI Unnati, or Kotak 811 \u2014 deposit \u20B920-50K FD and get a card with that limit",
      "Your first card's primary purpose is building credit history \u2014 use it for 6-12 months with on-time payments before applying for premium cards",
      "Start with ONE card, learn the billing cycle and statement dates, then add specialized cards later once you understand your spending patterns",
    ],
    commonMistakes: [
      "Applying for multiple cards simultaneously as a first-time applicant \u2014 each rejection hurts your credit score and makes the next application harder",
      "Choosing a card with annual fee as your first card when lifetime-free options (Amazon Pay ICICI, Axis ACE) exist with better rewards",
      "Not paying the full statement balance \u2014 carrying a balance at 36-42% APR destroys any reward value instantly",
    ],
    switchSignals: [
      "After 6-12 months of clean credit history with your first card, you'll qualify for better cards \u2014 that's when to apply for HDFC Millennia, Axis ACE, or category-specific cards",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "upi",
    editorialVerdict: "UPI credit card spending only works with RuPay cards \u2014 Visa and Mastercard cannot be linked to UPI. Kiwi RuPay (1.5% base, 5% with Neon) and SuperMoney Axis RuPay (3% capped \u20B9500/cycle) lead this fast-growing segment.",
    proTips: [
      "Only RuPay network cards work on UPI \u2014 if your card is Visa or Mastercard, it cannot be linked to Google Pay/PhonePe for UPI payments",
      "Kiwi RuPay gives 1.5% cashback on offline UPI (up to 5% with \u20B9999/year Neon subscription) \u2014 best for everyday kirana/caf\u00E9/auto payments",
      "SuperMoney Axis RuPay gives 3% cashback on UPI but caps at \u20B9500 per billing cycle \u2014 best for moderate UPI spenders",
      "Tata Neu HDFC RuPay variant earns full NeuCoins on UPI via Tata Neu app \u2014 if you're in the Tata ecosystem, this is the UPI card to get",
    ],
    commonMistakes: [
      "Trying to link your Visa/Mastercard to UPI for credit card payments \u2014 this is not supported, only RuPay works",
      "Not checking UPI transaction limits \u2014 RBI caps UPI credit card transactions, and some merchants don't accept UPI credit",
    ],
    switchSignals: [
      "If you make frequent small UPI payments (auto, chai, kirana), getting a RuPay credit card as a secondary card earns rewards on spend that would otherwise earn nothing",
    ],
    lastUpdated: "2026-03-29",
  },
  {
    categorySlug: "gold-jewellery",
    editorialVerdict: "SBI Titan gives 5% rewards at Tanishq with FlexiPay EMI for splitting large purchases. HDFC Tata Neu Infinity matches at 5% NeuCoins on all Tata brands including Tanishq. For unbranded jewellers, use your highest base-rate card.",
    proTips: [
      "SBI Titan earns 5% at Tanishq + FlexiPay EMI on purchases above Rs 2,500 \u2014 ideal for wedding jewellery",
      "HDFC Tata Neu Infinity gives 5% NeuCoins at Tanishq, Titan, and all Tata brands \u2014 broader than SBI Titan",
      "YES Bank Reserve offers 1.5% on offline gold (4.5% with 3X subscription) \u2014 best for unbranded jewellers",
      "For purchases above Rs 1L, convert to no-cost EMI BEFORE swiping \u2014 post-purchase EMI conversion often carries 12-18% interest",
    ],
    commonMistakes: [
      "Not converting large jewellery purchases to EMI at POS \u2014 post-purchase EMI conversion is significantly more expensive",
      "Assuming all jewellery stores earn bonus rates \u2014 only specific branded partners (Tanishq, Kalyan) trigger accelerated rewards",
    ],
    switchSignals: [
      "If you're planning a wedding with Rs 5L+ jewellery spend, get SBI Titan or Tata Neu Infinity 3-6 months before to build credit limit",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "government-tax",
    editorialVerdict: "SBI Cashback is one of the very few cards that doesn't exclude government MCC codes \u2014 earning up to 5% on select tax gateways. Most other cards explicitly exclude income tax, GST, and property tax payments.",
    proTips: [
      "SBI Cashback earns up to 5% on tax payments via authorized gateways \u2014 verify the specific portal before paying",
      "HDFC Diners BizBlack earns rewards on certain government/tax payments \u2014 good for business tax payments",
      "Even if rewards don't apply, large tax payments still count toward annual spend thresholds for fee waivers on premium cards",
      "Advance tax paid quarterly (Mar 15, Jun 15, Sep 15, Dec 15) can be routed through reward-earning cards if the gateway supports it",
    ],
    commonMistakes: [
      "Assuming any card earns rewards on government payments \u2014 MCC 9311/9399 is excluded by nearly every bank",
      "Paying income tax via third-party apps expecting rewards \u2014 most banks have excluded these routes",
    ],
    switchSignals: [
      "If you pay Rs 2L+ in annual taxes, having one dedicated card that earns on government MCCs (like SBI Cashback) can save Rs 10K/year",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "subscriptions",
    editorialVerdict: "SBI Aurum bundles Amazon Prime + Swiggy One (Rs 3,000+/year value) as complimentary memberships. HDFC Diners Club Privilege includes Swiggy One + Times Prime on Rs 75K spend within 90 days. The bundled membership value far exceeds any subscription cashback rate.",
    proTips: [
      "SBI Aurum includes Amazon Prime + Swiggy One + other memberships \u2014 Rs 3,000-5,000/year in subscription savings alone",
      "HDFC Diners Privilege gives Swiggy One + Times Prime when you spend Rs 75K within 90 days of issuance",
      "Set recurring subscription payments on your highest base-rate card \u2014 Rs 2,000/month in subscriptions at 3.3% base = Rs 800/year in rewards",
      "Times Prime bundles (via HDFC) include Disney+Hotstar, Sony LIV, Zee5 \u2014 check your card's milestone benefits before paying separately",
    ],
    commonMistakes: [
      "Paying for memberships your card already includes for free \u2014 check your card's bundled benefits before subscribing to Prime, Swiggy One, etc.",
      "Using a low-base-rate card for small recurring subscription payments when a higher-base card earns more passively",
    ],
    switchSignals: [
      "If your total subscription spend exceeds Rs 2,000/month and your card bundles zero memberships, evaluate if SBI Aurum's included memberships offset its annual fee",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "hotels",
    editorialVerdict: "Axis Marriott's free night stay (worth Rs 5,000-15,000) at just Rs 3,500/year is one of the best value cards in India. HDFC Infinia earns 10X on SmartBuy hotels. For OTA bookings, MakeMyTrip ICICI gives 6% on hotels.",
    proTips: [
      "Axis Marriott gives 1 free night at Marriott Bonvoy hotels annually + Silver Elite status \u2014 the free night alone justifies the Rs 3,500 fee",
      "HDFC Infinia earns 10X reward points on SmartBuy hotel bookings \u2014 at Rs 1/pt, that's 33%+ effective return on hotel spend",
      "MakeMyTrip ICICI gives 6% on hotel bookings + 3% on flights + complimentary MMT Black Gold \u2014 best co-branded travel card",
      "Tata Neu HDFC cards earn 5% NeuCoins at Taj/IHCL properties \u2014 valuable for luxury hotel stays in India",
    ],
    commonMistakes: [
      "Booking hotels directly without checking SmartBuy/EDGE portal rates \u2014 the portal bonus can 2-5X your standard earning",
      "Not claiming Marriott/IHG status benefits that come with your credit card \u2014 free upgrades, late checkout, and breakfast are worth hundreds per stay",
    ],
    switchSignals: [
      "If you stay at hotels 4+ nights/year, the Axis Marriott card pays for itself with just the free night \u2014 even as a secondary card",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "premium",
    editorialVerdict: "HDFC Infinia remains the undisputed premium card king \u2014 3.3% base, SmartBuy 10X, unlimited lounge, 21 transfer partners. ICICI Emeralde Private Metal matches at 3% value-back with concierge. Axis Magnus offers 35 EDGE Miles/Rs 200 with strong milestone benefits.",
    proTips: [
      "HDFC Infinia (Rs 12,500/yr, waived at Rs 18L) \u2014 3.3% base + 10X SmartBuy + unlimited lounge + 21 airline/hotel transfer partners = the complete package",
      "ICICI Emeralde Private Metal \u2014 3% value-back + 2 international + 4 domestic lounge visits/quarter + concierge",
      "Axis Magnus \u2014 35 EDGE Miles/Rs 200 = 2.6% base + milestone benefits (75K = Rs 7,500, 1.5L = Rs 12,500 in vouchers)",
      "SBI Aurum \u2014 4 free BMS tickets/month + lounge access + bundled memberships \u2014 best for entertainment-focused premium users",
    ],
    commonMistakes: [
      "Getting a premium card without meeting spend thresholds \u2014 HDFC Infinia requires Rs 18L/yr spend to waive the fee",
      "Not utilizing transfer partners \u2014 Infinia/Diners points transferred to airlines are worth 3-5X more than SmartBuy voucher redemption",
    ],
    switchSignals: [
      "If your annual card spend exceeds Rs 15L and you're on a mid-tier card, the upgrade to Infinia/Emeralde typically saves Rs 30,000+/year",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "lifestyle",
    editorialVerdict: "HDFC Millennia earns 5% cashback at offline partner brands and 2.5% on all other offline purchases \u2014 the strongest offline retail card.",
    proTips: [
      "HDFC Millennia gives 5% at partner brands + 2.5% on all other offline and online purchases",
      "Co-branded retail cards (HDFC Shoppers Stop, HDFC Lifestyle) give 10-15% in-store discount",
      "Sale season (EOSS Jan/Jul) + card offers stack \u2014 plan large offline purchases around end-of-season sales",
      "Check if your card has specific mall/brand partnerships \u2014 SBI, HDFC, and Axis often run location-specific 5-10% offers",
    ],
    commonMistakes: [
      "Using your online shopping card for offline purchases where it earns only base rate",
      "Not checking bank-specific mall offers \u2014 these are temporary but can give 5-10% additional cashback",
    ],
    switchSignals: [
      "If your offline spending exceeds your online spending, prioritize an offline-optimized card (HDFC Millennia) over online-focused cards",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "emi",
    editorialVerdict: "Bajaj Finserv has the widest no-cost EMI merchant network in India. HDFC SmartEMI works on purchases above Rs 2,500 at most merchants. Amazon Pay ICICI offers no-cost EMI on Amazon.",
    proTips: [
      "Bajaj Finserv cards have the widest no-cost EMI network \u2014 1.5L+ partner stores",
      "HDFC SmartEMI converts purchases above Rs 2,500 into EMI at POS \u2014 always check the processing fee",
      "Amazon Pay ICICI offers no-cost EMI on Amazon for most electronics \u2014 stack with exchange offers",
      "No-cost EMI often has a processing fee of 1-2% hidden \u2014 compare with cash price before choosing EMI",
    ],
    commonMistakes: [
      "Converting to EMI post-purchase at 12-18% interest when you could have done 0% EMI at POS",
      "Assuming no-cost EMI is truly free \u2014 some merchants inflate the MRP to cover the bank's cost",
    ],
    switchSignals: [
      "If you make 2+ purchases above Rs 10K per quarter, a card with easy EMI conversion saves significant interest",
    ],
    lastUpdated: "2026-03-30",
  },
  {
    categorySlug: "wallets",
    editorialVerdict: "Wallet loads are a dying reward category. HDFC, Axis, SBI, and ICICI have all excluded or capped wallet load rewards in 2025-2026.",
    proTips: [
      "Most major banks exclude wallet loads (Paytm, PhonePe wallet, Amazon Pay balance) from rewards",
      "If you must load wallets, use a flat cashback card like IDFC First Select (1.5% on everything)",
      "Direct card payments earn rewards but wallet-routed payments may not \u2014 pay merchants directly",
      "Check your card's latest T&C for wallet MCC exclusions \u2014 banks update these quarterly",
    ],
    commonMistakes: [
      "Loading Paytm/PhonePe wallet expecting card rewards \u2014 this route has been blocked by most issuers",
      "Not reading updated T&C after receiving a terms updated SMS",
    ],
    switchSignals: [
      "If your rewards strategy depended on wallet loads, restructure \u2014 shift to direct card payments or UPI via RuPay credit cards",
    ],
    lastUpdated: "2026-03-30",
  },
];

export function getTipsForCategory(slug: string): CategoryTips | undefined {
  return CATEGORY_TIPS.find((t) => t.categorySlug === slug);
}
