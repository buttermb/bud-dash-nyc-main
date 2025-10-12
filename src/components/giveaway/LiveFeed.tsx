import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Ticket } from 'lucide-react';

interface LiveFeedProps {
  entries: Array<{
    name: string;
    borough: string;
    entries: number;
    timestamp: string;
  }>;
}

export default function LiveFeed({ entries }: LiveFeedProps) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-16">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
          <span className="font-bold text-green-400">LIVE</span>
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
          Recent Entries 🔥
        </h2>
        <p className="text-gray-400">New Yorkers are entering now</p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => (
              <motion.div
                key={`${entry.name}-${entry.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-4 px-4 hover:bg-white/5 rounded-xl transition-colors group border-b border-white/5 last:border-0"
              >
                {/* Left: User Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {entry.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-bold text-white group-hover:text-green-400 transition-colors">
                      {entry.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{entry.borough}</span>
                      <span className="text-gray-600">•</span>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Entries Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl group-hover:bg-green-500/20 transition-colors">
                  <Ticket className="w-4 h-4 text-green-400" />
                  <span className="font-bold text-green-400">
                    {entry.entries} {entry.entries === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Live feed updates every 15 seconds
        </p>
      </div>
    </div>
  );
}
