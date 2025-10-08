import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LimitedTimeOfferBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check cookie instead of sessionStorage - Premium approach: show once per 7 days
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
    // Set cookie for 7 days
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `offer_banner_dismissed=true; expires=${expires}; path=/; SameSite=Lax`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20"
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Sparkles className="w-4 h-4 text-primary hidden sm:block" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
                  <span className="font-semibold text-sm">
                    Member Exclusive: Free shipping on all orders
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block w-fit">
                    Join now
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Dismiss banner"
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
