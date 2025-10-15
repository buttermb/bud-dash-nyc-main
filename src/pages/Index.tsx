import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import GiveawayBanner from "@/components/GiveawayBanner";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { EnhancedLoadingState } from "@/components/EnhancedLoadingState";
import { ParallaxHero } from "@/components/home/ParallaxHero";
import { motion } from "framer-motion";

// Lazy load non-critical components for better initial page load
const ProductCatalog = lazy(() => import("@/components/ProductCatalog"));
const Footer = lazy(() => import("@/components/Footer"));
const RecentPurchaseNotification = lazy(() => import("@/components/RecentPurchaseNotification"));
const ProductTrustElements = lazy(() => import("@/components/ProductTrustElements"));
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const TrendingProducts = lazy(() => import("@/components/TrendingProducts"));
const InstallPWA = lazy(() => import("@/components/InstallPWA"));


const Index = () => {
  return (
    <>
      <SEOHead 
        title="New York Minute NYC - Premium Cannabis Delivery | Manhattan, Brooklyn, Queens"
        description="Fast, discreet premium cannabis delivery across NYC. Lab-tested flower, edibles, concentrates from licensed vendors. Same-day delivery to Manhattan, Brooklyn & Queens."
      />
      <div className="min-h-screen pb-20 md:pb-0">
      <AgeVerificationModal />
      <Suspense fallback={null}>
        <RecentPurchaseNotification />
      </Suspense>
      <GiveawayBanner />
      <Navigation />
      
      {/* Enhanced Parallax Hero */}
      <ParallaxHero />
      
      {/* First-Time Buyer Banner with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30 shadow-inner"
      >
        <div className="container px-4 py-5 mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <span className="text-3xl">🎁</span>
            <p className="text-lg font-semibold">
              New customer? Get <span className="text-primary font-black text-xl">10% off</span> your first order
            </p>
            <Badge variant="outline" className="bg-primary/10 border-primary/50">+ Free Delivery</Badge>
          </div>
        </div>
      </motion.div>

      {/* Trending Products Carousel */}
      <Suspense fallback={<EnhancedLoadingState variant="grid" count={4} />}>
        <TrendingProducts />
      </Suspense>

      {/* PRODUCTS */}
      <section id="products" className="bg-background" aria-label="Product catalog">
        <Suspense fallback={<EnhancedLoadingState variant="grid" count={8} />}>
          <ProductCatalog />
        </Suspense>
      </section>

      {/* How It Works */}
      <section id="how-it-works" aria-label="How it works">
        <Suspense fallback={<EnhancedLoadingState variant="card" count={3} />}>
          <HowItWorks />
        </Suspense>
      </section>

      {/* Trust Elements */}
      <Suspense fallback={null}>
        <ProductTrustElements />
      </Suspense>
      
      {/* PWA Install Prompt */}
      <Suspense fallback={null}>
        <InstallPWA />
      </Suspense>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      </div>
    </>
  );
};

export default Index;
