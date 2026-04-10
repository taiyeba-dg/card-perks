import { useRef } from "react";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, User, Lightbulb, AlertTriangle, Scale, Mail, ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  content: string[];
}

const SECTIONS: Section[] = [
  {
    id: "acceptance",
    icon: FileText,
    title: "Acceptance of Terms",
    content: [
      "By accessing or using CardPerks, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.",
      "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the platform. Your continued use of CardPerks after any changes constitutes your acceptance of the new terms.",
      "These terms apply to all visitors, users, and others who access or use the service.",
    ],
  },
  {
    id: "accounts",
    icon: User,
    title: "User Accounts",
    content: [
      "When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.",
      "You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.",
      "You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. We will not be liable for any loss or damage arising from your failure to comply with this section.",
    ],
  },
  {
    id: "ip",
    icon: Lightbulb,
    title: "Intellectual Property",
    content: [
      "The service and its original content, features, and functionality are and will remain the exclusive property of CardPerks and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of CardPerks.",
      "All credit card information, reward rate data, and voucher comparisons presented on this platform are compiled for informational purposes. Data sourced from third parties remains the property of their respective owners.",
      "You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit any of our content without prior written consent.",
    ],
  },
  {
    id: "warranties",
    icon: AlertTriangle,
    title: "Disclaimer of Warranties",
    content: [
      "CardPerks is provided on an \"as is\" and \"as available\" basis without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.",
      "We do not warrant that the service will be uninterrupted, timely, secure, or error-free. Credit card terms, reward rates, and voucher values are subject to change at the discretion of issuing banks and partner platforms.",
      "Any information on this platform does not constitute financial, investment, or legal advice. Always consult with a qualified professional before making financial decisions.",
    ],
  },
  {
    id: "liability",
    icon: Scale,
    title: "Limitation of Liability",
    content: [
      "In no event shall CardPerks, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.",
      "Our total liability to you for all claims arising from or relating to the service shall not exceed the amount you have paid us, if any, in the twelve months preceding the claim.",
      "Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for consequential or incidental damages, so the above limitations may not apply to you.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact Information",
    content: [
      "If you have any questions about these Terms of Service, please contact our legal team at legal@cardperks.in. We aim to respond to all inquiries within 48 business hours.",
      "For general support, visit our support page or reach out at support@cardperks.in. Our team is available Monday through Friday, 9 AM – 6 PM IST.",
      "CardPerks is operated from Bengaluru, Karnataka, India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru.",
    ],
  },
];

const NAV_ITEMS = SECTIONS.map((s) => ({ id: s.id, label: s.title }));

export default function Terms() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <PageLayout>
      <SEO
        fullTitle="Terms of Service | CardPerks"
        description="Read the CardPerks Terms of Service — covering user accounts, intellectual property, disclaimers, and more."
        path="/terms"
      />

      <section className="py-14 min-h-screen" ref={containerRef}>
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative rounded-3xl p-8 sm:p-12 mb-12 overflow-hidden border border-border/30 text-center"
            style={{ background: "hsl(var(--glass) / 0.5)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.06] via-transparent to-gold/[0.03] pointer-events-none rounded-3xl" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/20 flex items-center justify-center mx-auto mb-5"
              >
                <FileText className="w-6 h-6 text-gold" />
              </motion.div>

              <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-3">
                Legal
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Terms of <span className="gold-gradient">Service</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Please read these terms carefully before using CardPerks. They govern your access to and use of our platform.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-4">
                Last updated: <span className="text-muted-foreground">March 2026</span>
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">

            {/* Sticky sidebar nav */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="hidden lg:block sticky top-24"
            >
              <div className="glass-card rounded-2xl p-4 border border-border/30">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gold mb-3 px-2">
                  Contents
                </p>
                <nav className="flex flex-col gap-0.5">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className="group flex items-center gap-2 text-left px-2 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-all duration-150"
                    >
                      <ChevronRight className="w-3 h-3 text-gold/40 group-hover:text-gold transition-colors flex-shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Sections */}
            <div className="space-y-6">
              {SECTIONS.map((section, i) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.45 }}
                    className="glass-card rounded-2xl overflow-hidden border border-border/30"
                  >
                    {/* Gold top accent on first section */}
                    {i === 0 && (
                      <div className="h-[2px] w-full bg-gradient-to-r from-gold/60 via-gold to-gold/60" />
                    )}
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-gold" />
                        </div>
                        <h2 className="font-serif text-lg sm:text-xl font-semibold">
                          {section.title}
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {section.content.map((para, j) => (
                          <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Footer note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="flex items-start gap-3 px-4 py-4 rounded-2xl bg-gold/[0.05] border border-gold/15"
              >
                <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  CardPerks is committed to transparency and user trust. These terms are written in plain language to ensure clarity. If anything is unclear, please{" "}
                  <a href="mailto:legal@cardperks.in" className="text-gold hover:underline">contact us</a>.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
