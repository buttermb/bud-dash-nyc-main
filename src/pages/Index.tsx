import Hero from "@/components/Hero";
import ProductCatalog from "@/components/ProductCatalog";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import TrustBanner from "@/components/TrustBanner";
import SubtleTopBar from "@/components/SubtleTopBar";
import { SEOHead } from "@/components/SEOHead";
import GiveawayBanner from "@/components/sections/GiveawayBanner";
import InstagramFeed from "@/components/sections/InstagramFeed";
import { useState, useEffect } from "react";
import AgeVerificationModal from "@/components/AgeVerificationModal";

const Index = () => {
  const [showAgeVerification, setShowAgeVerification] = useState(false);

  useEffect(() => {
    const ageVerified = localStorage.getItem("ageVerified");
    if (!ageVerified) {
      setShowAgeVerification(true);
    }
  }, []);

  const handleAgeVerified = () => {
    localStorage.setItem("ageVerified", "true");
    setShowAgeVerification(false);
  };

  return (
    <>
      <SEOHead 
        title="BUDDASH NYC - Premium Cannabis Delivery | Order Weed Online"
        description="NYC's premier cannabis delivery service. Order premium THC products online and get same-day delivery in Manhattan. Lab-tested, licensed, and discreet."
        keywords="cannabis delivery NYC, weed delivery Manhattan, THC delivery, order weed online, premium cannabis NYC"
      />
      
      <AgeVerificationModal />
      
      <div className="min-h-screen bg-black">
        <SubtleTopBar />
        <Hero />
        <TrustBanner />
        <ProductCatalog />
        <Features />
        <HowItWorks />
        <GiveawayBanner />
        <InstagramFeed />
        <CTA />
      </div>
    </>
  );
};

export default Index;
