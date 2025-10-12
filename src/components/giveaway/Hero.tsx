import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  title: string;
  tagline: string;
  totalEntries: number;
  totalParticipants: number;
}

export default function Hero({ title, tagline, totalEntries, totalParticipants }: HeroProps) {
  return (
    <div className="text-center mb-16 relative">
      {/* Animated background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Live badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-sm font-bold mb-6 shadow-lg shadow-red-500/50"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 bg-white rounded-full"
        />
        <span>LIVE NOW - LIMITED TIME</span>
        <Sparkles className="w-4 h-4" />
      </motion.div>

      {/* Main title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-7xl font-black mb-6 relative"
      >
        <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500 text-transparent bg-clip-text drop-shadow-lg">
          {title}
        </span>
      </motion.h1>
      
      {/* Tagline */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl md:text-3xl text-gray-200 mb-12 font-semibold"
      >
        {tagline} <span className="text-2xl md:text-4xl">⚡</span>
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-8 md:gap-12"
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-6 hover:border-green-400/50 transition-all">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text mb-2"
            >
              {totalEntries.toLocaleString()}
            </motion.div>
            <div className="text-sm md:text-base text-gray-400 font-semibold">Total Entries</div>
          </div>
        </div>

        <div className="w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-6 hover:border-blue-400/50 transition-all">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text mb-2"
            >
              {totalParticipants.toLocaleString()}
            </motion.div>
            <div className="text-sm md:text-base text-gray-400 font-semibold">New Yorkers</div>
          </div>
        </div>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
