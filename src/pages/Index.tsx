import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import RecentPurchaseNotification from "@/components/RecentPurchaseNotification";
import ProductTrustElements from "@/components/ProductTrustElements";
import ProductCategories from "@/components/ProductCategories";
import HowItWorks from "@/components/HowItWorks";
import FeaturedReviews from "@/components/FeaturedReviews";
import TrendingProducts from "@/components/TrendingProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Truck, Award } from "lucide-react";


const Index = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <AgeVerificationModal />
      <RecentPurchaseNotification />
      <Navigation />
      
      {/* Hero Section with Professional Gradient Design */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent z-0" />
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] z-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Content */}
        <div className="container relative z-10 px-4 py-24 mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Licensed Badge */}
            <div className="flex justify-center animate-fade-in">
              <Badge variant="outline" className="px-6 py-3 text-base border-primary/50 bg-primary/10 backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Licensed NY Hemp Retailer
              </Badge>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight animate-fade-in">
              Trusted THCA Delivery <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                in NYC
              </span>
            </h1>
            
            {/* Trust Indicators Row */}
            <div className="flex flex-wrap justify-center gap-6 text-base animate-fade-in">
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                <Truck className="w-5 h-5 text-primary" />
                <span className="font-medium">Fast NYC Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                <Award className="w-5 h-5 text-primary" />
                <span className="font-medium">Lab-Tested Products</span>
              </div>
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-medium">21+ Age Verified</span>
              </div>
            </div>
            
            {/* Value Proposition */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Premium hemp-derived THCA products from licensed NYC vendors
            </p>
            
            {/* Free Shipping Callout */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full border border-primary/30 animate-fade-in">
              <span className="text-2xl">🎉</span>
              <span className="font-bold">Free delivery on orders over $100</span>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-xl px-12 py-8 hover:scale-105 transition-all duration-300"
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
                className="text-xl px-12 py-8 hover:scale-105 transition-all duration-300"
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
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30 shadow-inner">
        <div className="container px-4 py-5 mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <span className="text-3xl">🎁</span>
            <p className="text-lg font-semibold">
              New customer? Get <span className="text-primary font-black text-xl">10% off</span> your first order
            </p>
            <Badge variant="outline" className="bg-primary/10 border-primary/50">+ Free Delivery</Badge>
          </div>
        </div>
      </div>

      {/* Trending Products Carousel */}
      <TrendingProducts />

      {/* PRODUCTS */}
      <div id="products" className="bg-background">
        <ProductCatalog />
      </div>

      {/* How It Works */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Trust Elements */}
      <ProductTrustElements />
      
      <Footer />
    </div>
  );
};

export default Index;
