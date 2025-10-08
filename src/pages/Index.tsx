import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import RecentPurchaseNotification from "@/components/RecentPurchaseNotification";
import ProductTrustElements from "@/components/ProductTrustElements";
import ProductCategories from "@/components/ProductCategories";
import HowItWorks from "@/components/HowItWorks";
import FeaturedReviews from "@/components/FeaturedReviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Truck, Award } from "lucide-react";


const Index = () => {
  return (
    <div className="min-h-screen">
      <AgeVerificationModal />
      <RecentPurchaseNotification />
      <Navigation />
      
      {/* Hero Section with CTA */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/src/assets/hero-bg.jpg')",
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-0" />
        
        {/* Content */}
        <div className="container relative z-10 px-4 py-24 mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="px-6 py-3 text-base border-white/50 bg-white/10 backdrop-blur-sm text-white">
              <ShieldCheck className="w-5 h-5 mr-2" />
              Licensed NY Hemp Retailer
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white">
              Trusted THCA Delivery in NYC
            </h1>
            
            <div className="flex flex-wrap justify-center gap-6 text-white/90 text-lg">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span>Fast NYC Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Lab-Tested Products</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span>21+ Age Verified</span>
              </div>
            </div>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Premium hemp-derived THCA products from licensed NYC vendors
            </p>
            
            <p className="text-sm text-white/70">
              🎉 Free delivery on orders over $100
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-xl px-12 py-8 text-white hover:scale-105 transition-all duration-300"
                onClick={() => {
                  const productsSection = document.getElementById('products');
                  productsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Shop Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-xl px-12 py-8 border-white/50 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                onClick={() => {
                  const howItWorksSection = document.getElementById('how-it-works');
                  howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* First-Time Buyer Banner */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30">
        <div className="container px-4 py-4 mx-auto">
          <p className="text-center text-lg font-semibold">
            🎁 New customer? Get <span className="text-primary font-bold">10% off</span> your first order + free delivery
          </p>
        </div>
      </div>

      {/* Product Categories */}
      <ProductCategories />

      {/* PRODUCTS */}
      <div id="products" className="bg-background">
        <ProductCatalog />
      </div>

      {/* How It Works */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Customer Reviews */}
      <FeaturedReviews />

      {/* Trust Elements */}
      <ProductTrustElements />
      
      <Footer />
    </div>
  );
};

export default Index;
