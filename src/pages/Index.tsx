import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import GiveawayBanner from "@/components/GiveawayBanner";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { EnhancedLoadingState } from "@/components/EnhancedLoadingState";
import { ParallaxHero } from "@/components/home/ParallaxHero";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

// Lazy load non-critical components for better initial page load
const ProductCatalog = lazy(() => import("@/components/ProductCatalog"));
const Footer = lazy(() => import("@/components/Footer"));
const RecentPurchaseNotification = lazy(() => import("@/components/RecentPurchaseNotification"));
const ProductTrustElements = lazy(() => import("@/components/ProductTrustElements"));
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const TrendingProducts = lazy(() => import("@/components/TrendingProducts"));
const InstallPWA = lazy(() => import("@/components/InstallPWA"));
const Testimonials = lazy(() => import("@/components/Testimonials"));


const Index = () => {
  return (
    <>
      <SEOHead 
        title="New York Minute NYC - Premium Delivery | Manhattan, Brooklyn, Queens"
        description="Fast, discreet premium delivery across NYC. Lab-tested products from licensed vendors. Same-day delivery to Manhattan, Brooklyn & Queens."
      />
      <div className="min-h-screen pb-20 md:pb-0">
      <AgeVerificationModal />
      <Suspense fallback={null}>
        <RecentPurchaseNotification />
      </Suspense>
      <Navigation />
      
      {/* Hero Section */}
      <Hero />

      {/* Benefits/Trust Section */}
      <Features />
      
      {/* First-Time Buyer Banner with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-accent border-y border-accent/30 shadow-inner"
      >
        <div className="container px-4 py-6 mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <span className="text-3xl">🎁</span>
            <p className="text-lg font-bold text-white">
              New customer? Get <span className="text-white font-black text-xl">10% off</span> your first order
            </p>
            <Badge className="bg-white/10 border-white/30 text-white">+ Free Delivery</Badge>
          </div>
        </div>
      </motion.div>

      {/* PRODUCTS */}
      <motion.section 
        id="products" 
        className="bg-background" 
        aria-label="Product catalog"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Suspense fallback={<EnhancedLoadingState variant="grid" count={8} />}>
          <ProductCatalog />
        </Suspense>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        id="how-it-works" 
        aria-label="How it works"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Suspense fallback={<EnhancedLoadingState variant="card" count={3} />}>
          <HowItWorks />
        </Suspense>
      </motion.section>

      {/* Testimonials / Social Proof */}
      <motion.section
        aria-label="Customer testimonials"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Suspense fallback={<EnhancedLoadingState variant="card" count={4} />}>
          <Testimonials />
        </Suspense>
      </motion.section>

      {/* Trust Elements */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Suspense fallback={null}>
          <ProductTrustElements />
        </Suspense>
      </motion.div>
      
      {/* PWA Install Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Suspense fallback={null}>
          <InstallPWA />
        </Suspense>
      </motion.div>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      </div>
    </>
  );
};

export default Index;
