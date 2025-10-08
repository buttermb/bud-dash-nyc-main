import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Solid gradient background - no image */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background z-0" />
      
      {/* Additional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero z-0" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-32 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Badge */}
          <div className="flex justify-center animate-fade-in">
            <Badge variant="outline" className="px-6 py-3 text-base border-primary/50 bg-primary/10 backdrop-blur-sm">
              <Leaf className="w-5 h-5 mr-2" />
              Licensed NY Hemp Retailer
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black tracking-wider uppercase leading-tight animate-fade-in">
            Premium THCA{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Delivery
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-2xl md:text-3xl text-muted-foreground max-w-2xl mx-auto font-medium animate-fade-in">
            Hemp-derived THCA products. Lab-tested. NYC licensed.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <span className="text-base font-semibold">21+ Age Verified</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <span className="text-base font-semibold">Under 45 Min Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <span className="text-base font-semibold">Licensed Vendors Only</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-xl px-12 py-8 hover:scale-105 transition-all duration-300"
              onClick={() => {
                const productsSection = document.getElementById('products');
                productsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop THCA
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-xl px-12 py-8 hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/track-order')}
            >
              Track Order
            </Button>
          </div>

          {/* Legal Notice */}
          <div className="text-xs text-muted-foreground pt-8 space-y-1 max-w-3xl mx-auto">
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
