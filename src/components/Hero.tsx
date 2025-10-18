import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 30% 40%, rgba(214,88,118,0.15) 0%, transparent 60%)',
              'radial-gradient(circle at 70% 60%, rgba(214,88,118,0.15) 0%, transparent 60%)',
              'radial-gradient(circle at 30% 40%, rgba(214,88,118,0.15) 0%, transparent 60%)',
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-10">
          {/* Refined Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/10 border border-primary/30 backdrop-blur-sm rounded-full"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">NYC's Fastest Service</span>
          </motion.div>

          {/* Refined Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="heading-massive text-foreground mb-4">
              PREMIUM
              <br />
              <span className="text-primary text-glow-subtle">
                DELIVERY
              </span>
            </h1>
          </motion.div>

          {/* Refined Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            NYC's most trusted same-day service
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-medium">45 Min Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-medium">Licensed & Tested</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-medium">Discreet Service</span>
            </div>
          </motion.div>

          {/* Refined CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Button 
              size="xl" 
              variant="default"
              onClick={scrollToProducts}
              className="text-lg px-12 py-6 font-bold"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              asChild
              className="text-lg px-12 py-6 font-bold"
            >
              <Link to="/track-order">
                Track Order
              </Link>
            </Button>
          </motion.div>

          {/* Legal Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-xs text-muted-foreground/60 max-w-2xl mx-auto hidden md:block pt-4"
          >
            Licensed NY Retailer • Must be 21+ with valid ID • All products lab-tested
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
