import { motion } from "framer-motion";
import { Building2, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LifestyleSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-hero relative overflow-hidden">
      {/* NYC Skyline Background Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className="bg-accent/10 text-accent border-accent/30 mb-4">
              <Building2 className="w-4 h-4 mr-2" />
              Born in NYC
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
              Elevated Living.<br />
              <span className="text-primary">NYC Style.</span>
            </h2>
            
            <p className="text-lg text-white/80 leading-relaxed">
              Designed for the modern New Yorker. Premium products delivered in packaging 
              as sophisticated as the city itself. From Tribeca to Astoria, we bring 
              elevated experiences to your doorstep.
            </p>

            {/* NYC Neighborhoods */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Manhattan</p>
                  <p className="text-xs text-white/60">UWS, UES, Midtown, Downtown</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Brooklyn</p>
                  <p className="text-xs text-white/60">Williamsburg, Park Slope, DUMBO</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Queens</p>
                  <p className="text-xs text-white/60">Astoria, LIC, Forest Hills</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Bronx & SI</p>
                  <p className="text-xs text-white/60">Full borough coverage</p>
                </div>
              </div>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold">Premium Packaging</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Discreet Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold">NYC Licensed</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Visual Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Packaging Visual Placeholder */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-elegant bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm">
              <div className="aspect-square flex items-center justify-center p-12">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black text-white uppercase tracking-wide">
                      Premium Packaging
                    </p>
                    <p className="text-sm text-white/70 max-w-xs mx-auto">
                      Sophisticated, discreet delivery designed for NYC living
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-4">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <div className="w-3 h-3 rounded-full bg-primary-glow" />
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 bg-card border-2 border-primary rounded-xl p-4 shadow-elegant">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">NYC Delivery</p>
              <p className="text-2xl font-black text-primary">&lt;60min</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
