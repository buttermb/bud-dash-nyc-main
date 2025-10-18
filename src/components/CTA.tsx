import { Card } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlowButton } from "@/components/premium/GlowButton";
import { ParallaxSection } from "@/components/premium/ParallaxSection";

const CTA = () => {
  const navigate = useNavigate();
  
  return (
    <ParallaxSection>
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <Card className="max-w-4xl mx-auto border-2 border-primary/30 bg-gradient-hero 
                           overflow-hidden shadow-glow hover:shadow-neon transition-all
                           duration-500 hover:scale-[1.02]">
            <div className="p-12 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center 
                            justify-center shadow-glow animate-float">
                <Smartphone className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
                Ready to Order?
              </h2>
              
              <p className="text-lg md:text-2xl text-foreground/80 max-w-2xl mx-auto font-bold">
                Premium products delivered to your door in under 45 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <GlowButton
                  className="text-lg px-8 py-6 rounded-lg shadow-glow hover:shadow-neon"
                  onClick={() => {
                    const productsSection = document.getElementById('products');
                    productsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Shop Now
                </GlowButton>
                <GlowButton
                  className="text-lg px-8 py-6 rounded-lg bg-white/10 backdrop-blur-md border-2 border-white/40"
                  glowColor="hsl(0 0% 100%)"
                  onClick={() => navigate('/support')}
                >
                  Get Help
                </GlowButton>
              </div>

              <p className="text-xs text-muted-foreground/70 pt-4 font-semibold">
                Available in Brooklyn, Queens, and Manhattan • 21+ Only
              </p>
            </div>
          </Card>
        </div>
      </section>
    </ParallaxSection>
  );
};

export default CTA;
