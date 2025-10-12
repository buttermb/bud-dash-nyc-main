import { Check, Copy, Share2, Instagram, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface EntryStatusProps {
  entry: any;
  giveaway: any;
  onUpdate: () => void;
}

export default function EntryStatus({ entry, giveaway, onUpdate }: EntryStatusProps) {
  const [copied, setCopied] = useState(false);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(entry.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto mb-16">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        {/* Success glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-gradient-to-b from-green-400/20 to-transparent blur-3xl" />

        <div className="relative text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
            You're Entered! 🎉
          </h2>
          <p className="text-gray-400">Entry #{entry.entryId?.slice(0, 8)}</p>
        </div>

        {/* Entry summary */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 mb-6 border border-white/10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-center mb-6"
          >
            <div className="text-7xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 text-transparent bg-clip-text mb-2">
              {entry.totalEntries}
            </div>
            <div className="text-gray-400 font-semibold">Total Entries</div>
          </motion.div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Base entry:</span>
              <span className="font-bold">{entry.breakdown.base}</span>
            </div>
            {entry.breakdown.newsletter > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <span className="text-gray-300">Newsletter bonus:</span>
                <span className="font-bold text-green-400">+{entry.breakdown.newsletter}</span>
              </div>
            )}
            {entry.breakdown.referrals > 0 && (
              <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <span className="text-gray-300">Referral bonus:</span>
                <span className="font-bold text-blue-400">+{entry.breakdown.referrals}</span>
              </div>
            )}
          </div>
        </div>

        {/* Referral section */}
        <div className="relative overflow-hidden rounded-2xl p-6 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20" />
          <div className="absolute inset-0 border-2 border-gradient-to-r from-green-400 to-blue-400" />
          
          <div className="relative">
            <h3 className="font-black text-2xl mb-2 flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              Refer Friends (Unlimited!)
            </h3>
            <p className="text-gray-300 mb-4">+3 entries for each friend who enters</p>

            {/* Referral link */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={entry.referralLink}
                readOnly
                className="flex-1 bg-black/40 backdrop-blur-sm px-4 py-3 rounded-xl text-sm border border-white/10 focus:border-green-400 focus:outline-none transition-all"
                onClick={(e) => e.currentTarget.select()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyReferralLink}
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-white/10 hover:border-green-400/50 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </motion.button>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const text = `I just entered to win 1 LB of premium flower from Bud Dash NYC! 🎉 Join me: ${entry.referralLink}`;
                  window.open(`https://www.instagram.com/`, '_blank');
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-3 rounded-xl font-bold text-sm transition-all"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const text = `I just entered to win 1 LB of premium flower from Bud Dash NYC! Join me: ${entry.referralLink}`;
                  window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-3 rounded-xl font-bold text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                SMS
              </motion.button>
            </div>

            {/* Stats */}
            {entry.referralStats.successfulReferrals > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10"
              >
                <div className="text-sm text-gray-400">
                  You've referred: <span className="text-green-400 font-bold">{entry.referralStats.successfulReferrals} friends</span>
                  <span className="text-blue-400 font-bold"> (+{entry.referralStats.totalBonusEntries} entries)</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Motivational message */}
        <div className="text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-sm text-gray-300">
            🔥 Keep sharing to increase your chances! The more friends you refer, the better your odds!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
