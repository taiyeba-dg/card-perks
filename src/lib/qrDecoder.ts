import { getCategoryForMCC, type MCCInfo } from "./mccMapping";

export interface QRDecodeResult {
  isValid: boolean;
  mcc: string;
  merchantName: string;
  merchantCity: string;
  upiId: string;
  transactionId: string;
  amount: string;
  currency: string;
  category: string;
  description: string;
  emoji: string;
  v3Key: string;
  format: "UPI URI" | "EMV TLV" | "Unknown";
  rawTags: Record<string, string>;
}

/**
 * Main entry: detect format and decode accordingly.
 * Supports:
 *   1. UPI URI  –  upi://pay?pa=...&mc=5262&pn=Amazon+India
 *   2. EMV TLV  –  00020101021126...
 */
export function decodeEMVQR(qrString: string): QRDecodeResult {
  const trimmed = qrString.trim();

  if (trimmed.toLowerCase().startsWith("upi://")) {
    return decodeUpiUri(trimmed);
  }

  return decodeEMVTLV(trimmed);
}

/* ────────────────────────────────────────────
 * UPI URI decoder
 * Example: upi://pay?pa=amazon%40rapl&pn=Amazon+India&mc=5262&tid=RBA...
 * ──────────────────────────────────────────── */
function decodeUpiUri(uri: string): QRDecodeResult {
  try {
    const url = new URL(uri);
    const params = url.searchParams;

    const mcc = params.get("mc") || "";
    const merchantName = params.get("pn") || "";
    const upiId = params.get("pa") || "";
    const transactionId = params.get("tid") || params.get("tr") || "";
    const amount = params.get("am") || "";
    const currency = params.get("cu") || "INR";

    const info = getCategoryForMCC(mcc);

    return {
      isValid: !!(mcc || merchantName || upiId),
      mcc: mcc || "N/A",
      merchantName: merchantName || "Unknown Merchant",
      merchantCity: "",
      upiId,
      transactionId,
      amount,
      currency,
      category: info.category,
      description: info.description,
      emoji: info.emoji,
      v3Key: info.v3Key,
      format: "UPI URI",
      rawTags: Object.fromEntries(params.entries()),
    };
  } catch {
    return emptyResult("UPI URI");
  }
}

/* ────────────────────────────────────────────
 * EMV TLV decoder
 * Tag (2 chars) + Length (2 chars) + Value (Length chars)
 * ──────────────────────────────────────────── */
function decodeEMVTLV(qrString: string): QRDecodeResult {
  let index = 0;
  const tags: Record<string, string> = {};

  while (index < qrString.length) {
    if (index + 4 > qrString.length) break;

    const tag = qrString.substring(index, index + 2);
    const lengthStr = qrString.substring(index + 2, index + 4);
    const length = parseInt(lengthStr, 10);

    if (isNaN(length) || length < 0) break;
    if (index + 4 + length > qrString.length) break;

    const value = qrString.substring(index + 4, index + 4 + length);
    tags[tag] = value;
    index += 4 + length;
  }

  // If we parsed zero tags, it's not valid EMV
  if (Object.keys(tags).length === 0) {
    return emptyResult("Unknown");
  }

  const mcc = tags["52"];
  const merchantName = tags["59"];
  const merchantCity = tags["60"];

  // Try to find UPI ID in sub-TLVs (tags 26-51)
  let upiId = "";
  for (let i = 26; i <= 51; i++) {
    const tagKey = String(i).padStart(2, "0");
    if (tags[tagKey]) {
      const val = tags[tagKey];
      if (val.includes("@") || val.includes("upi")) {
        upiId = extractUpiFromSubTLV(val);
        break;
      }
    }
  }

  const info = getCategoryForMCC(mcc);

  return {
    isValid: !!mcc || !!merchantName || !!upiId,
    mcc: mcc || "N/A",
    merchantName: merchantName || "Unknown Merchant",
    merchantCity: merchantCity || "",
    upiId,
    transactionId: "",
    amount: tags["54"] || "",
    currency: tags["53"] === "356" ? "INR" : tags["53"] || "",
    category: info.category,
    description: info.description,
    emoji: info.emoji,
    v3Key: info.v3Key,
    format: "EMV TLV",
    rawTags: tags,
  };
}

function extractUpiFromSubTLV(val: string): string {
  const upiRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z]+/;
  const match = val.match(upiRegex);
  return match ? match[0] : val;
}

function emptyResult(format: QRDecodeResult["format"]): QRDecodeResult {
  return {
    isValid: false,
    mcc: "N/A",
    merchantName: "Unknown Merchant",
    merchantCity: "",
    upiId: "",
    transactionId: "",
    amount: "",
    currency: "",
    category: "Unknown",
    description: "Could not parse QR data",
    emoji: "❓",
    v3Key: "base",
    format,
    rawTags: {},
  };
}
