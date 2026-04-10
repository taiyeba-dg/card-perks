/**
 * Returns a short display name for a credit card.
 * Strips "Credit Card" suffix and avoids repeating the bank name.
 * Example: "HDFC Bank Infinia Credit Card" → "HDFC Infinia"
 */
export function getDisplayName(card: { name: string; issuer?: string }): string {
  let name = card.name
    .replace(/\s+Credit\s+Card$/i, "")
    .replace(/\s+Debit\s+Card$/i, "")
    .trim();

  // If the name starts with a bank name like "HDFC Bank", simplify
  const issuer = card.issuer ?? "";
  const bankWords = issuer.split(/\s+/);
  if (bankWords.length > 0) {
    // Check if name starts with "HDFC Bank" or just "HDFC"
    if (name.toLowerCase().startsWith(issuer.toLowerCase() + " ")) {
      // Name starts with full issuer - strip bank suffix like "Bank"
      name = name.slice(issuer.length).trim();
      // Prepend just the first word of issuer (e.g., "HDFC" not "HDFC Bank")
      name = bankWords[0] + " " + name;
    } else if (bankWords.length > 1 && name.toLowerCase().startsWith(bankWords[0].toLowerCase() + " " + bankWords[1].toLowerCase())) {
      // Name starts with "HDFC Bank ..." - strip "Bank" part
      name = bankWords[0] + " " + name.slice((bankWords[0] + " " + bankWords[1]).length).trim();
    }
  }

  return name.trim();
}
