import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Zap, Clock, Flame } from 'lucide-react';

interface SocialProofIndicatorsProps {
  totalEntries: number;
}

export function SocialProofIndicators({ totalEntries }: SocialProofIndicatorsProps) {
  const [currentViewers, setCurrentViewers] = useState(0);
  const [recentEntries, setRecentEntries] = useState(0);
  const [entriesPerMinute, setEntriesPerMinute] = useState(0);

  useEffect(() => {
    // Generate stable initial values based on total entries
    const baseViewers = Math.floor(totalEntries * 0.05);
    const viewers = Math.max(18, Math.min(200, baseViewers + 15));
    setCurrentViewers(viewers);

    // Generate stable recent entries
    const recent = Math.max(8, Math.floor(totalEntries * 0.02) + 8);
    setRecentEntries(recent);

    // Calculate stable entries per minute
    const perMinute = Math.max(2, Math.min(8, Math.floor(totalEntries / 1000) + 4));
    setEntriesPerMinute(perMinute);

    // Update viewers every 10 seconds with small stable variations
    let viewerDelta = 1;
    const interval = setInterval(() => {
      setCurrentViewers(prev => {
        const newVal = prev + viewerDelta;
        // Reverse direction at boundaries
        if (newVal >= 200 || newVal <= 18) viewerDelta *= -1;
        return Math.max(18, Math.min(200, newVal));
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [totalEntries]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
      {/* Viewing Now - Primary Indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentViewers}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 backdrop-blur-xl border border-emerald-500/20 rounded-full shadow-lg shadow-emerald-500/5"
        >
          <div className="relative">
            <Eye className="w-4 h-4 text-emerald-400" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
            />
          </div>
          <span className="text-sm font-semibold text-white/95">
            <span className="text-emerald-400 font-bold">{currentViewers}</span> viewing now
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Entry Rate - Shows Activity */}
      <AnimatePresence mode="wait">
        <motion.div
          key={entriesPerMinute}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-full shadow-lg shadow-orange-500/5"
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-white/95">
            <span className="text-orange-400 font-bold">{entriesPerMinute}</span> entries/min
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Recent Activity */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full shadow-lg shadow-blue-500/5"
      >
        <Clock className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-semibold text-white/95">
          <span className="text-blue-400 font-bold">{recentEntries}</span> entries in last hour
        </span>
      </motion.div>

      {/* Urgency Indicator */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-full shadow-lg shadow-yellow-500/5"
      >
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold text-white/95">
          <span className="text-yellow-400 font-bold">Hot</span> giveaway
        </span>
      </motion.div>
    </div>
  );
}
