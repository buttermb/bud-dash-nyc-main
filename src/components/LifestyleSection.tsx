import { motion } from "framer-motion";
import { Building2, MapPin, Sparkles, Package, Clock, Shield } from "lucide-react";
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
            {/* Premium Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Package, title: "Premium", desc: "Packaging", color: "from-primary to-primary-dark" },
                { icon: Clock, title: "<60min", desc: "Delivery", color: "from-accent to-accent-dark" },
                { icon: Shield, title: "100%", desc: "Discreet", color: "from-primary-glow to-primary" },
                { icon: Building2, title: "NYC", desc: "Licensed", color: "from-accent to-primary" }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur-sm p-8 hover:border-primary/40 transition-all duration-300">
                    {/* Animated background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    
                    {/* Content */}
                    <div className="relative z-10 text-center space-y-3">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground font-semibold">{feature.desc}</p>
                      </div>
                    </div>
                    
                    {/* Decorative glow */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating Badge - moved to better position */}
            <div className="mt-6 bg-card/80 backdrop-blur-md border-2 border-primary/30 rounded-xl p-6 shadow-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Average Delivery Time</p>
                  <p className="text-3xl font-black text-primary">45 Minutes</p>
                </div>
                <Clock className="w-12 h-12 text-primary/40" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
