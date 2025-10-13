import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Gift } from 'lucide-react';

export default function GiveawayBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const dismissed = localStorage.getItem('giveaway-banner-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
    
    // Show banner again after 24 hours
    if (dismissed && hoursSinceDismissed < 24) {
      setIsVisible(false);
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('giveaway-banner-dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary via-emerald-500 to-blue-500 text-white py-3">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/giveaway/nyc-biggest-flower" 
          className="flex-1 flex flex-wrap items-center justify-center gap-3 sm:gap-4 hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <span className="font-bold text-sm sm:text-base">WIN $4,000 IN PREMIUM FLOWER</span>
          </div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
          <span className="text-xs sm:text-sm font-semibold">Enter FREE →</span>
        </Link>
        <button
          onClick={handleDismiss}
          className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function calculateTimeLeft() {
  const endDate = new Date('2025-12-31T23:59:59');
  const difference = +endDate - +new Date();
  
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60)
    };
  }
  
  return { days: 0, hours: 0, minutes: 0 };
}