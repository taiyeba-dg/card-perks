import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import { MyCardsBanner } from "@/components/MyCardsBanner";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:rounded-lg gold-btn"
      >
        Skip to main content
      </a>
      <Navbar />
      <div className="pt-16">
        <MyCardsBanner />
      </div>
      <PageTransition>
        <main id="main-content" className="pb-16 lg:pb-0">{children}</main>
      </PageTransition>
      <Footer />
      <BackToTop />
    </div>
  );
}
