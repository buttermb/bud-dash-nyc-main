import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Bold gradient background - TBD Pink Style */}
      <div className="absolute inset-0 bg-gradient-mega z-0" />
      
      {/* Animated glow effect - Hot Pink */}
      <div className="absolute inset-0 z-0 animate-glow-pulse opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary-glow/40 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-hot/30 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-16 md:py-32 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-12">
          {/* Badge */}
          <div className="flex justify-center animate-fade-in">
            <Badge variant="outline" className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base border-primary/50 bg-primary/10 backdrop-blur-sm">
              <Leaf className="w-4 md:w-5 h-4 md:h-5 mr-2" />
              Licensed & Lab Tested
            </Badge>
          </div>

          {/* Main Heading - BOLD & IMPACTFUL */}
          <h1 className="heading-massive animate-fade-in drop-shadow-[0_0_50px_rgba(255,20,147,0.6)]">
            <span className="text-white">NYC'S</span>{" "}
            <span className="bg-gradient-vibrant bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(255,20,147,0.8)]">
              FASTEST
            </span>
            <br />
            <span className="text-white">DELIVERY</span>
          </h1>

          {/* Subheading - Bold & Clear */}
          <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 max-w-3xl mx-auto font-black animate-fade-in tracking-wide">
            Premium Quality • Same-Day • NYC Wide
          </p>

          {/* Trust Indicators - Simplified for Mobile */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-8 pt-4 md:pt-8">
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <span className="text-sm md:text-base font-semibold">Same-Day Delivery</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <span className="text-sm md:text-base font-semibold">Licensed & Lab Tested</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <span className="text-sm md:text-base font-semibold">21+ Verification</span>
            </div>
          </div>

          {/* CTA Buttons - Premium & Bold */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-6 md:pt-8">
            <Button 
              variant="premium" 
              size="lg" 
              className="text-lg md:text-2xl px-10 md:px-16 py-7 md:py-10 min-h-[60px]"
              onClick={() => {
                const productsSection = document.getElementById('products');
                productsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              SHOP NOW →
            </Button>
            <Button 
              variant="bold" 
              size="lg" 
              className="text-lg md:text-2xl px-10 md:px-16 py-7 md:py-10 min-h-[60px]"
              onClick={() => navigate('/track-order')}
            >
              TRACK ORDER
            </Button>
          </div>

          {/* Legal Notice - Hidden on Mobile, visible on desktop */}
          <div className="hidden md:block text-xs text-muted-foreground/70 pt-8 space-y-1 max-w-3xl mx-auto">
            <p>Licensed NY Cannabinoid Hemp Retailer | All products lab-tested for quality</p>
            <p>Must be 21+ with valid ID | Professional, discreet delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
