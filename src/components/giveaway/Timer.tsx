import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Zap } from 'lucide-react';

interface TimerProps {
  endDate: string;
}

export default function Timer({ endDate }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const getUrgencyConfig = () => {
    const hoursLeft = timeLeft.days * 24 + timeLeft.hours;
    if (hoursLeft < 1) return {
      message: 'FINAL HOUR! Enter NOW!',
      icon: Zap,
      gradient: 'from-red-500 via-orange-500 to-red-500',
      shadow: 'shadow-red-500/50'
    };
    if (hoursLeft < 24) return {
      message: 'Only 24 Hours Left!',
      icon: Flame,
      gradient: 'from-orange-500 via-yellow-500 to-orange-500',
      shadow: 'shadow-orange-500/50'
    };
    if (hoursLeft < 72) return {
      message: 'Final 3 Days - Don\'t Miss Out!',
      icon: Clock,
      gradient: 'from-yellow-500 via-amber-500 to-yellow-500',
      shadow: 'shadow-yellow-500/50'
    };
    return {
      message: 'Giveaway is Live!',
      icon: Clock,
      gradient: 'from-green-500 via-emerald-500 to-green-500',
      shadow: 'shadow-green-500/50'
    };
  };

  const urgency = getUrgencyConfig();
  const Icon = urgency.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-4xl mx-auto mb-16"
    >
      {/* Urgency Banner */}
      <motion.div
        animate={urgency.message.includes('FINAL') ? {
          scale: [1, 1.02, 1],
        } : {}}
        transition={{ duration: 0.5, repeat: urgency.message.includes('FINAL') ? Infinity : 0 }}
        className={`relative text-center py-4 rounded-t-2xl font-black text-lg md:text-xl overflow-hidden ${urgency.shadow}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${urgency.gradient} opacity-90`} />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex items-center justify-center gap-3">
          <Icon className="w-6 h-6 animate-pulse" />
          <span>{urgency.message}</span>
          <Icon className="w-6 h-6 animate-pulse" />
        </div>
      </motion.div>

      {/* Timer Display */}
      <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-b-2xl p-8 shadow-2xl">
        <div className="flex justify-center gap-4 md:gap-8">
          {Object.entries(timeLeft).map(([unit, value], index) => (
            <div key={unit} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 min-w-[90px] md:min-w-[120px] hover:border-green-400/50 transition-all"
              >
                <motion.div
                  key={value}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl md:text-6xl font-black bg-gradient-to-br from-white to-gray-300 text-transparent bg-clip-text mb-2"
                >
                  {String(value).padStart(2, '0')}
                </motion.div>
                <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider font-bold">
                  {unit}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
      </div>
    </motion.div>
  );
}

function calculateTimeLeft(endDate: string) {
  const difference = +new Date(endDate) - +new Date();
  
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }
  
  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
}
