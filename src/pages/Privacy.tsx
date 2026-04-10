import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide directly, such as your name and email when creating an account. We also collect usage data like browsing patterns and card preferences to improve recommendations." },
  { title: "How We Use Your Information", content: "Your data is used to personalize card recommendations, improve our platform, and send relevant updates. We never sell your personal data to third parties." },
  { title: "Data Storage & Security", content: "Your data is stored locally on your device using browser storage. We use industry-standard encryption for any server-side data. Card preference and favorite data stays on your device." },
  { title: "Cookies & Tracking", content: "We use essential cookies for site functionality and analytics cookies to understand usage patterns. You can disable non-essential cookies in your browser settings." },
  { title: "Third-Party Services", content: "We may link to bank and financial product websites. These sites have their own privacy policies. We are not responsible for their data practices." },
  { title: "Your Rights", content: "You can access, modify, or delete your personal data at any time. Contact us at privacy@cardperks.in for any data-related requests." },
  { title: "Changes to This Policy", content: "We may update this policy periodically. Significant changes will be communicated via email or site notification." },
];

export default function Privacy() {
  return (
    <PageLayout>
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-gold/30 text-gold">
              <Shield className="w-3 h-3 mr-1" /> Legal
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy <span className="gold-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground">Last updated: February 2026</p>
          </div>
        </ScrollReveal>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.03}>
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
