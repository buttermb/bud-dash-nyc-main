import { useState, useEffect } from "react";
import { X, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LimitedTimeOfferBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const bannerDismissed = sessionStorage.getItem("offer_banner_dismissed");
    if (bannerDismissed) {
      setIsVisible(false);
      return;
    }

    // Calculate end of day
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("offer_banner_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-destructive via-primary to-destructive text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Flame className="w-5 h-5 animate-pulse" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                  <span className="font-bold text-sm sm:text-base">
                    🔥 FLASH SALE: 20% OFF ALL ORDERS TODAY!
                  </span>
                  <span className="text-xs sm:text-sm bg-white/20 px-3 py-1 rounded-full inline-block">
                    Use code: <span className="font-bold">TODAY20</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-sm font-semibold bg-white/20 px-4 py-2 rounded-lg">
                  Ends in: {timeLeft}
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="sm:hidden text-center text-xs mt-2 font-semibold">
              Ends in: {timeLeft}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LimitedTimeOfferBanner;
