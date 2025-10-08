import { useState, useEffect } from "react";
import { X, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LimitedTimeOfferBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };

    const bannerDismissed = getCookie("offer_banner_dismissed");
    if (bannerDismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `offer_banner_dismissed=true; expires=${expires}; path=/; SameSite=Lax`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10"
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center gap-2 relative">
              <Truck className="w-3.5 h-3.5 text-primary hidden sm:block" />
              <span className="text-sm font-medium text-center">
                Free shipping for members
              </span>
              <button
                onClick={handleDismiss}
                className="absolute right-0 w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LimitedTimeOfferBanner;
