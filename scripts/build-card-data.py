#!/usr/bin/env python3
"""
Build script: Transform V3 batch JSON data → Lovable calculator format.

Reads:  ../new data/batches/*.json  (180 cards, V3 format)
Writes: src/data/cards-generated.ts  (CreditCard[] for card search/display)
        src/data/card-v3-data-generated.ts  (Record<string, CardV3Data> for calculator)

Run from project root: python3 scripts/build-card-data.py
"""

import json
import os
import glob
import re
from collections import defaultdict

# ── Paths ──
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
BATCH_DIR = os.path.join(os.path.dirname(PROJECT_DIR), "new data", "batches")
CARDS_DIR = os.path.join(os.path.dirname(PROJECT_DIR), "new data", "cards")
OUT_DIR = os.path.join(PROJECT_DIR, "src", "data")
ASSETS_DIR = os.path.join(PROJECT_DIR, "src", "assets", "cards")

# ── Category mapping: batch keys → Lovable v3Keys ──
# The Lovable calculator expects: grocery, dining, fuel, online, travel, utilities, entertainment, base
CATEGORY_MAP = {
    # Grocery
    "grocery": "grocery", "groceries": "grocery", "grocery_partners": "grocery",
    "departmental": "grocery", "departmental_stores": "grocery", "grocery_utility": "grocery",
    "groceries_utilities": "grocery",

    # Dining
    "dining": "dining", "dining_shopping": "dining", "dining_grocery": "dining",
    "dining_grocery_travel": "dining", "food_delivery": "dining",
    "swiggy": "dining", "swiggy_zomato_ola": "dining",
    "smartbuy_zomato_swiggy": "dining", "entertainment_dining": "dining",
    "travel_dining": "dining",

    # Fuel
    "fuel": "fuel", "bpcl_fuel": "fuel", "hpcl_fuel": "fuel", "fuel_hpcl": "fuel",
    "fuel_indiamoil": "fuel", "iocl_fuel": "fuel", "fastag": "fuel",

    # Online Shopping
    "online": "online", "online_shopping": "online", "shopping": "online",
    "flipkart": "online", "amazon_prime": "online", "amazon_non_prime": "online",
    "myntra": "online", "flipkart_cleartrip": "online",
    "select_online": "online", "shopping_partners": "online",
    "smartbuy": "online", "smartbuy_vouchers": "online",
    "partner_merchants": "online", "partner_brands": "online",
    "select_merchants": "online", "select_partners": "online",
    "preferred_partners": "online", "partners": "online",
    "retail": "online", "premium_brands": "online", "select_brands": "online",
    "slice_partners": "online",

    # Travel
    "travel": "travel", "flights": "travel", "hotels": "travel",
    "flights_hotels_bonus": "travel", "smartbuy_flights": "travel",
    "smartbuy_hotels": "travel", "flights_portal": "travel", "hotels_portal": "travel",
    "travel_airlines": "travel", "travel_hotels": "travel", "travel_portal": "travel",
    "travel_forex": "travel", "international": "travel", "domestic": "travel",
    "cleartrip": "travel", "easemytrip": "travel", "ixigo": "travel",
    "mmt_flights_hotels": "travel", "mmt_bus_holidays": "travel",
    "irctc": "travel", "irctc_ac": "travel", "irctc_air": "travel",
    "irctc_ecatering": "travel",
    "vistara": "travel", "vistara_flights": "travel",
    "indigo": "travel", "indigo_flights": "travel", "indigo_app_web": "travel",
    "flights_indigo": "travel",
    "air_india": "travel", "etihad": "travel", "qatar_ba": "travel",
    "hotel_travel_mcc": "travel", "marriott_hotels": "travel",
    "paytm_travel": "travel",

    # Utilities
    "utilities": "utilities", "utility": "utilities", "utilities_bills": "utilities",
    "utilities_essential": "utilities", "utilities_food": "utilities",
    "utilities_insurance": "utilities", "utilities_tax_grocery": "utilities",
    "insurance": "utilities", "insurance_general": "utilities",
    "education": "utilities", "healthcare": "utilities",
    "rent": "utilities", "gpay_bills": "utilities",
    "tata_bill_payments": "utilities", "lic_premium": "utilities",
    "airtel_bills": "utilities", "phone": "utilities",

    # Entertainment
    "entertainment": "entertainment", "movies": "entertainment",
    "pvr_movies": "entertainment", "popcorn": "entertainment",

    # Base / catch-all
    "all": "base", "base": "base", "all_other": "base", "other": "base",
    "others": "base", "spends": "base", "all_incl_upi": "base",
    "offline": "base", "upi": "base", "instore_upi": "base",
    "weekdays": "base", "weekend": "base", "weekends": "base",
    "accelerated": "base", "category_accelerated": "base",
    "chosen_3": "base", "chosen_categories": "base", "chosen_ecom": "base",
    "top_category": "base",
}

# Brand-specific → keep as portal data, map to online/travel for base category
PORTAL_CATEGORIES = {
    "smartbuy", "smartbuy_vouchers", "smartbuy_flights", "smartbuy_hotels",
    "smartbuy_zomato_swiggy", "flights_portal", "hotels_portal", "travel_portal",
}

# Card type mapping
def get_card_type(card):
    tier = card.get("rewards", {}).get("calculator", {}).get("tier", "")
    type_map = {
        "super-premium": "Super Premium",
        "ultra-premium": "Ultra Premium",
        "premium": "Premium",
        "entry": "Entry",
        "co-branded": "Co-branded",
        "entry-premium": "Entry Premium",
    }
    return type_map.get(tier, "Premium")


def best_rate_for_bucket(categories, bucket_keys):
    """Among batch category keys that map to a Lovable bucket, pick the best general-purpose one."""
    rates = []
    for k, v in categories.items():
        mapped = CATEGORY_MAP.get(k)
        if mapped in bucket_keys:
            rate = v.get("rate", 0)
            if isinstance(rate, str):
                try:
                    rate = float(rate)
                except:
                    rate = 0
            rates.append((k, rate, v))
    if not rates:
        return None
    # Prefer non-portal, non-partner keys; then highest rate
    def sort_key(item):
        k, r, v = item
        is_portal = k in PORTAL_CATEGORIES
        is_generic = k in ("grocery", "dining", "fuel", "online", "travel", "utilities", "entertainment", "base", "all")
        return (not is_generic, is_portal, -r)
    rates.sort(key=sort_key)
    return rates[0]


def build_v3_categories(card):
    """Build the 8-key category record the Lovable calculator expects."""
    calc = card.get("rewards", {}).get("calculator", {})
    raw_cats = calc.get("categories", {})
    base_rate_num = card.get("rewards", {}).get("baseRate", 0)

    # Convert baseRate from decimal (0.033) to percentage (3.3) if needed
    if isinstance(base_rate_num, (int, float)) and base_rate_num < 1:
        base_rate_pct = round(base_rate_num * 100, 2)
    else:
        base_rate_pct = float(base_rate_num) if base_rate_num else 0

    lovable_cats = {}
    target_buckets = ["grocery", "dining", "fuel", "online", "travel", "utilities", "entertainment", "base"]

    for bucket in target_buckets:
        # Find all batch keys mapping to this bucket
        matching = {}
        for k, v in raw_cats.items():
            mapped = CATEGORY_MAP.get(k, None)
            if mapped == bucket:
                matching[k] = v

        if matching:
            # Pick the best one (most generic, highest rate)
            best_key = None
            best_val = None
            for k, v in matching.items():
                r = v.get("rate", 0)
                if isinstance(r, str):
                    try: r = float(r)
                    except: r = 0
                # Convert decimal rates to percentage
                if 0 < r < 1:
                    r = round(r * 100, 2)
                    v = {**v, "rate": r}
                is_generic = k in (bucket, "all", "base", "all_other", "spends")
                if best_val is None or (is_generic and best_key not in (bucket,)) or r > best_val.get("rate", 0):
                    best_key = k
                    best_val = v

            rate = best_val.get("rate", 0)
            if isinstance(rate, str):
                try: rate = float(rate)
                except: rate = 0
            # Final decimal→pct conversion
            if 0 < rate < 1:
                rate = round(rate * 100, 2)

            cap = best_val.get("cap", None)
            cap_period = None
            if cap:
                # Determine period — batch data doesn't always have capPeriod
                cap_period = "Monthly"  # default assumption

            lovable_cats[bucket] = {
                "label": best_val.get("label", f"{rate}%"),
                "rate": rate,
                "cap": cap,
                "capPeriod": cap_period if cap else None,
                "minTxn": best_val.get("minTxn", None),
                "note": best_val.get("note", None),
            }
        elif bucket == "base":
            # Always have a base category
            lovable_cats["base"] = {
                "label": f"{base_rate_pct}%",
                "rate": base_rate_pct,
                "cap": None,
                "capPeriod": None,
                "minTxn": None,
                "note": "All other categories",
            }
        else:
            # Use base rate for missing categories
            lovable_cats[bucket] = {
                "label": f"{base_rate_pct}% (base rate)",
                "rate": base_rate_pct,
                "cap": None,
                "capPeriod": None,
                "minTxn": None,
                "note": None,
            }

    return lovable_cats


def build_exclusions(card):
    """Extract exclusion categories."""
    calc = card.get("rewards", {}).get("calculator", {})
    raw_cats = calc.get("categories", {})
    exclusion_text = card.get("rewards", {}).get("exclusions", "")
    exclusions = []

    # Check for zero-rate categories
    for k, v in raw_cats.items():
        rate = v.get("rate", 0)
        if isinstance(rate, str):
            try: rate = float(rate)
            except: rate = 1
        if rate == 0:
            mapped = CATEGORY_MAP.get(k, k)
            note = v.get("note", "") or f"{k} excluded from rewards"
            exclusions.append({
                "category": mapped.capitalize(),
                "note": note,
            })

    # Parse exclusion text for common patterns
    if exclusion_text:
        excl_lower = exclusion_text.lower()
        if "fuel" in excl_lower and not any(e["category"].lower() == "fuel" for e in exclusions):
            exclusions.append({"category": "Fuel", "note": "Fuel excluded from rewards"})
        if "rent" in excl_lower and not any("rent" in e["category"].lower() for e in exclusions):
            exclusions.append({"category": "Rent", "note": "Rent payments excluded"})
        if "wallet" in excl_lower:
            exclusions.append({"category": "Wallet Loads", "note": "Wallet loads excluded"})

    # Deduplicate
    seen = set()
    unique = []
    for e in exclusions:
        key = e["category"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(e)

    return unique


def build_portals(card):
    """Extract portal data from batch card."""
    calc = card.get("rewards", {}).get("calculator", {})
    raw_portals = calc.get("portals", [])
    portals = []

    for p in raw_portals:
        merchants = []
        for m in p.get("merchants", []):
            eff_rate = m.get("effectiveRate", 0)
            if isinstance(eff_rate, (int, float)) and 0 < eff_rate < 1:
                eff_rate = round(eff_rate * 100, 1)
            merchants.append({
                "name": m.get("name", ""),
                "multiplier": m.get("multiplier", ""),
                "effectiveRate": eff_rate,
            })

        portals.append({
            "name": p.get("name", ""),
            "url": p.get("url", ""),
            "merchants": merchants,
            "cap": p.get("monthlyCap") or p.get("cap") or None,
            "pointValueLabel": p.get("pointValueLabel", ""),
            "note": p.get("note", None),
        })

    return portals


def build_redemption(card):
    """Build redemption data."""
    rewards = card.get("rewards", {})
    redemption = rewards.get("redemption", {})

    options = []
    for opt in redemption.get("options", []):
        options.append({
            "type": opt.get("type", ""),
            "value": opt.get("value", 0),
            "processingTime": opt.get("processingTime", ""),
            "fee": str(opt.get("fee", "None")) if opt.get("fee") else "None",
            "minPoints": opt.get("minPoints", None),
        })

    transfer_partners = []
    for tp in redemption.get("transferPartners", []):
        transfer_partners.append({
            "name": tp.get("name", ""),
            "type": tp.get("type", "airline"),
            "ratio": tp.get("ratio", "1:1"),
            "ratioNumeric": tp.get("ratioNumeric", 1),
            "minPoints": tp.get("minTransfer") or tp.get("minPoints") or 0,
            "transferTime": tp.get("transferTime", ""),
            "fee": str(tp.get("fee", "None")) if tp.get("fee") else "None",
        })

    return {
        "type": rewards.get("type", "points"),
        "pointCurrency": rewards.get("pointCurrency") or rewards.get("name", "Reward Points"),
        "baseValue": redemption.get("baseValue", 0.25),
        "bestOption": redemption.get("bestOption", ""),
        "options": options,
        "transferPartners": transfer_partners,
    }


def build_milestones(card):
    """Build milestones from features."""
    features = card.get("features", {})
    milestones = features.get("milestones", [])
    result = []
    for m in milestones:
        spend = m.get("spend", 0)
        benefit = m.get("benefit", "")
        value = m.get("benefitValue") or m.get("value", 0)
        if spend and benefit:
            result.append({
                "spend": spend,
                "benefit": benefit,
                "benefitValue": value,
            })
    return result


def fmt_fee(amount):
    """Format fee amount to string."""
    if not amount or amount == 0:
        return "₹0 (Lifetime Free)"
    if amount >= 100000:
        return f"₹{amount:,.0f}"
    return f"₹{amount:,.0f}"


def build_credit_card(card):
    """Build the CreditCard interface object for cards.ts."""
    fees = card.get("fees", {})
    rewards = card.get("rewards", {})
    eligibility = card.get("eligibility", {})
    features = card.get("features", {})
    metadata = card.get("metadata", {})

    # Lounge info
    lounge = features.get("lounge", {})
    if not isinstance(lounge, dict):
        lounge = {}
    domestic = lounge.get("domestic", {})
    intl = lounge.get("international", {})
    # Handle string values (e.g., "Unlimited + 8 guest visits")
    if isinstance(domestic, str):
        dom_count = -1 if "unlimited" in domestic.lower() else 0
    elif isinstance(domestic, dict):
        dom_count = domestic.get("count", 0) if domestic else 0
    else:
        dom_count = 0
    if isinstance(intl, str):
        intl_count = -1 if "unlimited" in intl.lower() else 0
    elif isinstance(intl, dict):
        intl_count = intl.get("count", 0) if intl else 0
    else:
        intl_count = 0
    if dom_count == -1 and intl_count == -1:
        lounge_str = "Unlimited"
    elif dom_count == -1:
        lounge_str = f"Unlimited domestic, {intl_count}/year intl"
    elif dom_count > 0 or intl_count > 0:
        lounge_str = f"{dom_count}/year domestic, {intl_count}/year intl"
    else:
        lounge_str = "None"

    # Best for / perks
    best_for = metadata.get("bestFor", []) if metadata else []
    if isinstance(best_for, str):
        best_for = [best_for]

    base_rate = rewards.get("baseRate", 0)
    if isinstance(base_rate, (int, float)) and 0 < base_rate < 1:
        base_rate_pct = round(base_rate * 100, 1)
    else:
        base_rate_pct = float(base_rate) if base_rate else 0

    annual_fee = fees.get("annual", 0)
    joining_fee = fees.get("joining", 0)

    # Forex
    forex = features.get("forex", {})
    forex_markup = f"{forex.get('markup', 'N/A')}%" if forex and forex.get("markup") else "3.5%"

    # Fuel surcharge
    fuel = features.get("fuel", {})
    fuel_surcharge = "1% waiver" if fuel and fuel.get("surchargeWaiver") else "No waiver"

    # Income
    income = eligibility.get("income", 0)
    if income >= 10000000:
        income_str = f"₹{income // 10000000}Cr+/year"
    elif income >= 100000:
        income_str = f"₹{income // 100000}L+/year"
    else:
        income_str = f"₹{income:,}/year" if income else "Not specified"

    return {
        "id": card["id"],
        "name": card.get("name", ""),
        "network": card.get("network", "Visa"),
        "fee": fmt_fee(annual_fee),
        "rating": metadata.get("rating", 4.0) if metadata else 4.0,
        "rewards": f"{base_rate_pct}% value",
        "lounge": lounge_str,
        "vouchers": [],
        "color": "#0D0D0D",
        "perks": metadata.get("pros", [])[:4] if metadata else [],
        "issuer": card.get("bank", ""),
        "type": get_card_type(card),
        "minIncome": income_str,
        "welcomeBonus": rewards.get("joiningBonus", ""),
        "fuelSurcharge": fuel_surcharge,
        "forexMarkup": forex_markup,
        "rewardRate": rewards.get("baseRateLabel") or rewards.get("earningText", "")[:50],
        "milestones": [m.get("benefit", "") for m in build_milestones(card)][:3],
        "insurance": [],
        "bestFor": best_for[:3] if best_for else [],
    }


def build_v3_data_entry(card):
    """Build the CardV3Data object for card-v3-data.ts."""
    fees = card.get("fees", {})
    rewards = card.get("rewards", {})
    features = card.get("features", {})

    base_rate = rewards.get("baseRate", 0)
    if isinstance(base_rate, (int, float)) and 0 < base_rate < 1:
        base_rate_pct = round(base_rate * 100, 2)
    else:
        base_rate_pct = float(base_rate) if base_rate else 0

    return {
        "categories": build_v3_categories(card),
        "exclusions": build_exclusions(card),
        "portals": build_portals(card),
        "redemption": build_redemption(card),
        "fees": {
            "annual": fees.get("annual", 0),
            "renewal": fees.get("annual", 0),
            "waivedOn": fees.get("waivedOn", None),
            "renewalBenefitValue": fees.get("renewalBenefitValue", 0),
        },
        "milestones": build_milestones(card),
        "baseRate": base_rate_pct,
        "upgradePath": [],
        "upgradeFromId": None,
        "upgradeToId": None,
        "applyLink": card.get("link", None),
        "specialOffers": [],
        "relatedCardIds": card.get("relatedCardIds", []) or [],
    }


def check_images(cards):
    """Check which card images exist in the new data/cards folder."""
    available = set()
    if os.path.isdir(CARDS_DIR):
        for f in os.listdir(CARDS_DIR):
            if f.endswith(".png"):
                available.add(f.replace(".png", ""))
    return available


def ts_string(s):
    """Escape a string for TypeScript."""
    if s is None:
        return "null"
    return json.dumps(s)


def main():
    # Load all batch files
    all_cards = []
    for batch_file in sorted(glob.glob(os.path.join(BATCH_DIR, "*.json"))):
        with open(batch_file) as f:
            cards = json.load(f)
            all_cards.extend(cards)
            print(f"  Loaded {len(cards)} cards from {os.path.basename(batch_file)}")

    print(f"\nTotal: {len(all_cards)} cards")

    # Check images
    available_images = check_images(all_cards)
    print(f"Available card images: {len(available_images)}")

    # Build outputs
    credit_cards = []
    v3_data = {}
    skipped = []
    image_imports = []

    for card in all_cards:
        card_id = card.get("id", "")
        if not card_id:
            continue

        # Skip cards without calculator data
        calc = card.get("rewards", {}).get("calculator", {})
        if not calc or not calc.get("categories"):
            skipped.append(card_id)
            continue

        cc = build_credit_card(card)
        v3 = build_v3_data_entry(card)

        # Check if image exists
        slug = card.get("slug", card_id)
        has_image = slug in available_images or card_id in available_images
        image_slug = slug if slug in available_images else (card_id if card_id in available_images else None)

        if image_slug:
            safe_var = re.sub(r'[^a-zA-Z0-9]', '_', image_slug) + "Img"
            image_imports.append((safe_var, image_slug))
            cc["_imageVar"] = safe_var
        else:
            cc["_imageVar"] = None

        credit_cards.append(cc)
        v3_data[card_id] = v3

    print(f"Built: {len(credit_cards)} cards with calculator data")
    print(f"Skipped (no calculator): {len(skipped)}")
    if skipped:
        print(f"  Skipped IDs: {', '.join(skipped[:10])}{'...' if len(skipped) > 10 else ''}")

    # ── Write cards-generated.ts ──
    cards_ts_path = os.path.join(OUT_DIR, "cards-generated.ts")
    with open(cards_ts_path, "w") as f:
        f.write('// AUTO-GENERATED by scripts/build-card-data.py — DO NOT EDIT\n')
        f.write('// Source: new data/batches/*.json\n\n')
        f.write('export interface CreditCard {\n')
        f.write('  id: string;\n  name: string;\n  network: string;\n  fee: string;\n')
        f.write('  rating: number;\n  rewards: string;\n  lounge: string;\n  vouchers: string[];\n')
        f.write('  color: string;\n  image?: string;\n  perks: string[];\n  issuer: string;\n')
        f.write('  type: string;\n  minIncome: string;\n  welcomeBonus: string;\n')
        f.write('  fuelSurcharge: string;\n  forexMarkup: string;\n  rewardRate: string;\n')
        f.write('  milestones: string[];\n  insurance: string[];\n  bestFor: string[];\n')
        f.write('}\n\n')

        # Image imports
        f.write('// Card images\n')
        for var_name, slug in image_imports:
            f.write(f'import {var_name} from "@/assets/cards/{slug}.png";\n')
        f.write('\n')

        # Card image map
        f.write('export const cardImages: Record<string, string> = {\n')
        for var_name, slug in image_imports:
            card_id_for_slug = slug  # slug usually matches card_id
            f.write(f'  "{card_id_for_slug}": {var_name},\n')
        f.write('};\n\n')

        # Cards array
        f.write('export const cards: CreditCard[] = [\n')
        for cc in credit_cards:
            img_var = cc.pop("_imageVar", None)
            f.write('  {\n')
            for key, val in cc.items():
                if isinstance(val, str):
                    f.write(f'    {key}: {json.dumps(val)},\n')
                elif isinstance(val, list):
                    f.write(f'    {key}: {json.dumps(val)},\n')
                elif isinstance(val, (int, float)):
                    f.write(f'    {key}: {val},\n')
            if img_var:
                f.write(f'    image: {img_var},\n')
            f.write('  },\n')
        f.write('];\n\n')

        f.write('export function getCardById(id: string) {\n')
        f.write('  return cards.find((c) => c.id === id);\n')
        f.write('}\n')

    print(f"\nWrote: {cards_ts_path}")

    # ── Write card-v3-data-generated.ts ──
    v3_ts_path = os.path.join(OUT_DIR, "card-v3-data-generated.ts")
    with open(v3_ts_path, "w") as f:
        f.write('// AUTO-GENERATED by scripts/build-card-data.py — DO NOT EDIT\n')
        f.write('// Source: new data/batches/*.json\n\n')
        f.write('import type { CardV3Data } from "./card-v3-types";\n\n')
        f.write('export const cardV3Data: Record<string, CardV3Data> = ')
        f.write(json.dumps(v3_data, indent=2, ensure_ascii=False))
        f.write(';\n')

    print(f"Wrote: {v3_ts_path}")

    # ── Report ──
    print(f"\n{'='*60}")
    print(f"DONE! Generated data for {len(credit_cards)} cards.")
    print(f"\nNext steps:")
    print(f"  1. Copy card images: cp '../new data/cards/'*.png src/assets/cards/")
    print(f"  2. Update imports in RewardsCalculator.tsx:")
    print(f'     - import {{ cards }} from "@/data/cards-generated";')
    print(f'     - import {{ cardV3Data }} from "@/data/card-v3-data-generated";')
    print(f"  3. Run dev server and test!")


if __name__ == "__main__":
    main()
