import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlowButton } from "@/components/premium/GlowButton";
import { FloatingBadge } from "@/components/premium/FloatingBadge";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Subtle animated glow effect */}
      <div className="absolute inset-0 z-0 animate-glow-pulse opacity-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary-glow/20 rounded-full blur-[130px]" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-16 md:py-32 mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-10">
          {/* Badge */}
          <div className="flex justify-center animate-fade-in">
            <Badge variant="outline" className="px-5 md:px-7 py-2.5 md:py-3.5 text-sm md:text-base border-primary/50 bg-primary/10 backdrop-blur-md text-primary">
              <Leaf className="w-4 md:w-5 h-4 md:h-5 mr-2" />
              <span className="font-semibold">Licensed & Lab Tested</span>
            </Badge>
          </div>

          {/* Main Heading - Premium & Sophisticated */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight animate-fade-in leading-none text-white">
            <span>Premium.</span>{" "}
            <span className="text-primary-glow">
              Discreet.
            </span>
            <br />
            <span>NYC-Fast.</span>
          </h1>

          {/* Subheading - Elegant & Clear */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-medium animate-fade-in leading-relaxed">
            Your elevated experience, delivered across all five boroughs in under an hour.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-5 md:gap-10 pt-6 md:pt-10">
            <div className="flex items-center gap-3 text-white/95">
              <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30">
                <Clock className="w-5 md:w-7 h-5 md:h-7 text-primary-glow" />
              </div>
              <div className="text-left">
                <span className="text-sm md:text-base font-bold tracking-wide block">Under 60 Mins</span>
                <span className="text-xs text-white/70">All NYC Boroughs</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/95">
              <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30">
                <ShieldCheck className="w-5 md:w-7 h-5 md:h-7 text-primary-glow" />
              </div>
              <div className="text-left">
                <span className="text-sm md:text-base font-bold tracking-wide block">100% Discreet</span>
                <span className="text-xs text-white/70">Premium Packaging</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/95">
              <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30">
                <Leaf className="w-5 md:w-7 h-5 md:h-7 text-primary-glow" />
              </div>
              <div className="text-left">
                <span className="text-sm md:text-base font-bold tracking-wide block">Lab Tested</span>
                <span className="text-xs text-white/70">Quality Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Floating Badge for promotions */}
          <FloatingBadge className="fixed top-24 right-4 z-50">
            🎉 First Order 15% OFF
          </FloatingBadge>

          {/* CTA Buttons - Premium & Elegant */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center pt-8 md:pt-12">
            <GlowButton
              className="text-base md:text-xl px-10 md:px-14 py-6 md:py-8 min-h-[56px] md:min-h-[64px] rounded-lg"
              onClick={() => {
                const productsSection = document.getElementById('products');
                productsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Browse Products
            </GlowButton>
            <GlowButton
              className="text-base md:text-xl px-10 md:px-14 py-6 md:py-8 min-h-[56px] md:min-h-[64px] bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-lg"
              glowColor="hsl(0 0% 100%)"
              onClick={() => navigate('/track-order')}
            >
              Track Order
            </GlowButton>
          </div>

          {/* Legal Notice - Subtle & Professional */}
          <div className="hidden md:block text-xs text-white/50 pt-10 space-y-1 max-w-3xl mx-auto font-light">
            <p>Licensed NY Cannabinoid Hemp Retailer | All products third-party lab tested</p>
            <p>Must be 21+ with valid government ID | Serving Manhattan, Brooklyn, Queens, Bronx & Staten Island</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
