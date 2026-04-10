import { Helmet } from "react-helmet-async";

interface SEOProps {
  /** Overrides the entire <title> verbatim — use when you want full control. */
  fullTitle?: string;
  /** Appended as "[title] | CardPerks" when provided; ignored when fullTitle is set. */
  title?: string;
  description?: string;
  path?: string;
}

const SITE = "CardPerks";
const BASE_URL = "https://glowing-dream-orb.lovable.app";
const DEFAULT_DESC = "India's premier credit card perks platform. Compare voucher rates, track rewards, and maximize your credit card savings.";

export default function SEO({ fullTitle, title, description, path = "/" }: SEOProps) {
  const resolvedTitle = fullTitle ?? (title ? `${title} | ${SITE}` : `${SITE} — Track Voucher Rates & Maximize Credit Card Rewards`);
  const desc = description || DEFAULT_DESC;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
