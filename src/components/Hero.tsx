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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* BOLD Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-magenta/20 to-black opacity-60" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255,20,147,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255,0,255,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255,20,147,0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* BOLD Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary/20 border-2 border-primary backdrop-blur-sm"
          >
            <Sparkles className="w-5 h-5 text-primary animate-float" />
            <span className="text-sm md:text-base font-black text-primary uppercase tracking-wider">🔥 NYC's Fastest Delivery</span>
          </motion.div>

          {/* MASSIVE Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="heading-massive">
              <motion.div
                className="text-white"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                PREMIUM
              </motion.div>
              <motion.div
                className="text-primary neon-glow"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                CANNABIS
              </motion.div>
            </h1>
          </motion.div>

          {/* BOLD Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto font-bold"
          >
            Delivered in 45 minutes or less
          </motion.p>

          {/* Trust Indicators - BOLD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-wrap items-center justify-center gap-8 text-base md:text-lg"
          >
            <div className="flex items-center gap-3 text-white font-bold">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow" />
              <span>Same-Day Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-white font-bold">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow" />
              <span>Licensed & Lab Tested</span>
            </div>
            <div className="flex items-center gap-3 text-white font-bold">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow" />
              <span>Discreet Packaging</span>
            </div>
          </motion.div>

          {/* BOLD CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6"
          >
            <Button 
              size="xl" 
              variant="premium"
              onClick={scrollToProducts}
              className="text-xl px-14 py-7 font-black shadow-glow hover:shadow-neon animate-glow-pulse"
            >
              SHOP NOW →
            </Button>
            <Button 
              size="xl" 
              variant="bold"
              asChild
              className="text-xl px-14 py-7"
            >
              <Link to="/track-order">
                TRACK ORDER
              </Link>
            </Button>
          </motion.div>

          {/* Legal Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-sm text-white/40 max-w-2xl mx-auto hidden md:block pt-6"
          >
            Must be 21+ with valid ID. Products contain THC. For adult use only. 
            Not for sale to minors. Keep out of reach of children.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
