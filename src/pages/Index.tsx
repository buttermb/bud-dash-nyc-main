import { useState } from "react";
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
import AddressCheck from "@/components/AddressCheck";
import FirstVisitorPopup from "@/components/FirstVisitorPopup";

const Index = () => {
  const [addressValidated, setAddressValidated] = useState(false);
  const [deliveryBorough, setDeliveryBorough] = useState("");

  const handleAddressValidated = (isValid: boolean, borough?: string) => {
    setAddressValidated(isValid);
    if (borough) setDeliveryBorough(borough);
  };

  return (
    <div className="min-h-screen">
      <AgeVerificationModal />
      <RecentPurchaseNotification />
      <FirstVisitorPopup />
      <Navigation />
      <Hero />
      
      {/* Address Check Section - CRITICAL: Before Products */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container px-4 mx-auto">
          <AddressCheck onAddressValidated={handleAddressValidated} />
        </div>
      </section>
      
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
