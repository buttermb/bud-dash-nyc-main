import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, TrendingUp, Zap, Users } from 'lucide-react';

interface SocialProofIndicatorsProps {
  totalEntries: number;
}

export function SocialProofIndicators({ totalEntries }: SocialProofIndicatorsProps) {
  const [currentViewers, setCurrentViewers] = useState(0);
  const [recentEntries, setRecentEntries] = useState(0);

  useEffect(() => {
    // Generate realistic viewer count (3-8% of total entries, min 15, max 200)
    const baseViewers = Math.floor(totalEntries * 0.05);
    const viewers = Math.max(15, Math.min(200, baseViewers + Math.floor(Math.random() * 20)));
    setCurrentViewers(viewers);

    // Generate recent entries (1-3% of total, min 5)
    const recent = Math.max(5, Math.floor(totalEntries * 0.02) + Math.floor(Math.random() * 10));
    setRecentEntries(recent);

    // Update viewers every 8-15 seconds
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 7) - 3; // -3 to +3
      setCurrentViewers(prev => Math.max(15, Math.min(200, prev + variation)));
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, [totalEntries]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentViewers}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full"
        >
          <div className="relative">
            <Eye className="w-4 h-4 text-emerald-400" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"
            />
          </div>
          <span className="text-sm font-medium text-white/90">
            <span className="text-emerald-400 font-bold">{currentViewers}</span> viewing now
          </span>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full"
      >
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-white/90">
          <span className="text-yellow-400 font-bold">{recentEntries}</span> entries in last hour
        </span>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full"
      >
        <TrendingUp className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-white/90">
          <span className="text-blue-400 font-bold">Trending</span> #1 in NYC
        </span>
      </motion.div>
    </div>
  );
}
