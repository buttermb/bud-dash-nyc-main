import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import ProductCategories from "@/components/ProductCategories";
import ProductCatalog from "@/components/ProductCatalog";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AgeVerificationModal from "@/components/AgeVerificationModal";

const Index = () => {
  return (
    <div className="min-h-screen">
      <AgeVerificationModal />
      <Navigation />
      <Hero />
      <HowItWorks />
      <ProductCatalog />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
