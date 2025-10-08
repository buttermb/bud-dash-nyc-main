import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Solid gradient background - no image */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background z-0" />
      
      {/* Additional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero z-0" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-16 md:py-32 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-12">
          {/* Badge */}
          <div className="flex justify-center animate-fade-in">
            <Badge variant="outline" className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base border-primary/50 bg-primary/10 backdrop-blur-sm">
              <Leaf className="w-4 md:w-5 h-4 md:h-5 mr-2" />
              Licensed NY Hemp Retailer
            </Badge>
          </div>

          {/* Main Heading - Condensed for Mobile */}
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-wider uppercase leading-tight animate-fade-in">
            NYC's Trusted{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              THCA Delivery
            </span>
          </h1>

          {/* Subheading - Brief on Mobile */}
          <p className="text-lg sm:text-xl md:text-3xl text-muted-foreground max-w-2xl mx-auto font-medium animate-fade-in">
            Fast Delivery & Lab-Tested Products
          </p>

          {/* Trust Indicators - Simplified for Mobile */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-8 pt-4 md:pt-8">
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <span className="text-sm md:text-base font-semibold">21+ Age Verified</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <span className="text-sm md:text-base font-semibold">Under 45 Min</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <span className="text-sm md:text-base font-semibold">Licensed Vendors</span>
            </div>
          </div>

          {/* CTA Buttons - Touch-Friendly */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-6 md:pt-8">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 min-h-[56px] hover:scale-105 transition-all duration-300"
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
              className="text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 min-h-[56px] hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/track-order')}
            >
              Track Order
            </Button>
          </div>

          {/* Legal Notice - Hidden on Mobile, Accordion on Tablet+ */}
          <div className="hidden md:block text-xs text-muted-foreground pt-8 space-y-1 max-w-3xl mx-auto">
            <p className="font-semibold">Hemp-derived THCA products | All products contain ≤0.3% Delta-9 THC</p>
            <p>THCA is non-psychoactive in its raw form | Licensed NY Cannabinoid Hemp Retailer</p>
            <p>Must be 21+ with valid ID | Lab-tested for potency and purity</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
