import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import ProductCategories from "@/components/ProductCategories";
import ProductCatalog from "@/components/ProductCatalog";
import TrustBadges from "@/components/TrustBadges";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import RecentPurchaseNotification from "@/components/RecentPurchaseNotification";

const Index = () => {
  return (
    <div className="min-h-screen">
      <AgeVerificationModal />
      <RecentPurchaseNotification />
      <Navigation />
      <Hero />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <TrustBadges />
      <div id="products">
        <ProductCatalog />
      </div>
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
