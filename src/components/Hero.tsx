import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Leaf, MapPin } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Solid gradient background - no image */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background z-0" />
      
      {/* Additional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero z-0" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="px-4 py-2 text-sm border-primary/50 bg-primary/10">
              <Leaf className="w-4 h-4 mr-2" />
              Licensed NY Hemp Retailer
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black tracking-wider uppercase">
            Premium THCA{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Delivery
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Hemp-derived THCA products. Lab-tested. NYC licensed.
          </p>

          {/* Coordinates Info Box */}
          <div className="border-2 border-primary/30 bg-card/50 backdrop-blur p-6 rounded-lg max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-black text-lg tracking-wider">NYC</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coordinates:</span>
                <span className="font-semibold">40°42'45"N 74°00'21"W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area:</span>
                <span className="font-semibold">468.19 sq mi | 1,212.60 km²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Zones:</span>
                <span className="font-semibold">All 5 Boroughs</span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">21+ Age Verified</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Under 45 Min Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Licensed Vendors Only</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6"
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
              className="text-lg px-8 py-6"
              onClick={() => {
                const howItWorksSection = document.getElementById('how-it-works');
                howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Check Delivery
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
