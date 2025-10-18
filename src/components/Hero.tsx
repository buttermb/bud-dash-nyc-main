import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Sophisticated gradient background - Charcoal to Purple/Pink */}
      <div className="absolute inset-0 bg-gradient-hero z-0" />
      
      {/* Subtle animated glow effect */}
      <div className="absolute inset-0 z-0 animate-glow-pulse opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[130px]" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-16 md:py-32 mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-10">
          {/* Badge */}
          <div className="flex justify-center animate-fade-in">
            <Badge variant="outline" className="px-5 md:px-7 py-2.5 md:py-3.5 text-sm md:text-base border-primary/40 bg-primary/5 backdrop-blur-md">
              <Leaf className="w-4 md:w-5 h-4 md:h-5 mr-2 text-primary" />
              <span className="font-semibold">Licensed & Lab Tested</span>
            </Badge>
          </div>

          {/* Main Heading - Premium & Sophisticated */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight animate-fade-in leading-none">
            <span className="text-white">Premium.</span>{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Discreet.
            </span>
            <br />
            <span className="text-white">NYC-Fast.</span>
          </h1>

          {/* Subheading - Elegant & Clear */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-medium animate-fade-in leading-relaxed">
            Your elevated experience, delivered in under an hour.
          </p>

          {/* Trust Indicators - Clean & Professional */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-5 md:gap-10 pt-6 md:pt-10">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                <Clock className="w-5 md:w-7 h-5 md:h-7 text-accent" />
              </div>
              <span className="text-sm md:text-base font-semibold tracking-wide">Under 60 Mins</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                <ShieldCheck className="w-5 md:w-7 h-5 md:h-7 text-primary" />
              </div>
              <span className="text-sm md:text-base font-semibold tracking-wide">100% Discreet</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                <Leaf className="w-5 md:w-7 h-5 md:h-7 text-primary-glow" />
              </div>
              <span className="text-sm md:text-base font-semibold tracking-wide">Lab Tested</span>
            </div>
          </div>

          {/* CTA Buttons - Premium & Elegant */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center pt-8 md:pt-12">
            <Button 
              size="lg" 
              className="text-base md:text-xl px-10 md:px-14 py-6 md:py-8 min-h-[56px] md:min-h-[64px] bg-accent hover:bg-accent-dark text-white font-bold uppercase tracking-wider shadow-accent transition-all hover:scale-105"
              onClick={() => {
                const productsSection = document.getElementById('products');
                productsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Browse Products
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="text-base md:text-xl px-10 md:px-14 py-6 md:py-8 min-h-[56px] md:min-h-[64px] border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105"
              onClick={() => navigate('/track-order')}
            >
              Track Order
            </Button>
          </div>

          {/* Legal Notice - Subtle & Professional */}
          <div className="hidden md:block text-xs text-white/50 pt-10 space-y-1 max-w-3xl mx-auto font-light">
            <p>Licensed NY Cannabinoid Hemp Retailer | All products third-party lab tested</p>
            <p>Must be 21+ with valid government ID | Professional, discreet packaging</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
