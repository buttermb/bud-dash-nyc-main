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
    <div className="max-w-2xl mx-auto mb-20">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-primary/20 to-transparent blur-3xl" />

        <div className="relative text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-2 text-white">
            You're Entered!
          </h2>
          <p className="text-slate-500 font-light text-sm">
            Entry #{entry.entryId?.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Entry summary */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="text-center mb-6"
          >
            <div className="text-6xl sm:text-7xl font-display font-bold bg-gradient-to-br from-primary via-emerald-400 to-blue-400 text-transparent bg-clip-text mb-2">
              {entry.totalEntries}
            </div>
            <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">Total Entries</div>
          </motion.div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-4 py-3 bg-slate-700/30 rounded-xl">
              <span className="text-slate-400 text-sm">Base entry</span>
              <span className="font-bold text-white">{entry.breakdown.base}</span>
            </div>
            {entry.breakdown.newsletter > 0 && (
              <div className="flex justify-between items-center px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
                <span className="text-slate-400 text-sm">Newsletter bonus</span>
                <span className="font-bold text-primary">+{entry.breakdown.newsletter}</span>
              </div>
            )}
            {entry.breakdown.referrals > 0 && (
              <div className="flex justify-between items-center px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <span className="text-slate-400 text-sm">Referral bonus</span>
                <span className="font-bold text-blue-400">+{entry.breakdown.referrals}</span>
              </div>
            )}
          </div>
        </div>

        {/* Referral section */}
        <div className="relative bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-6 mb-6">
          <div className="mb-5">
            <h3 className="font-display font-bold text-xl mb-2 flex items-center gap-2 text-white">
              <Share2 className="w-5 h-5 text-primary" />
              Refer Friends
            </h3>
            <p className="text-slate-400 text-sm font-light">
              Earn <span className="text-primary font-semibold">+3 entries</span> for each friend who signs up • Unlimited
            </p>
          </div>

          {/* Referral link */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={entry.referralLink}
              readOnly
              className="flex-1 bg-slate-800/70 backdrop-blur-sm px-4 py-3 rounded-xl text-sm border border-slate-700 focus:border-primary focus:outline-none transition-all text-slate-300 font-mono"
              onClick={(e) => e.currentTarget.select()}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyReferralLink}
              className="bg-slate-800/70 hover:bg-slate-700/70 px-5 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-700 hover:border-primary/50 transition-all text-white"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-primary">Copied</span>
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
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                copyReferralLink();
                setTimeout(() => {
                  window.open('https://www.instagram.com/', '_blank');
                }, 300);
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-3 rounded-xl font-bold text-sm transition-all text-white shadow-lg"
            >
              <Instagram className="w-4 h-4" />
              Share on Instagram
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const text = `Join me in Bud Dash NYC's giveaway! 🎉 Win premium flower: ${entry.referralLink}`;
                window.open(`sms:?&body=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3 rounded-xl font-bold text-sm transition-all text-white shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              Share via SMS
            </motion.button>
          </div>

          {/* Referral stats */}
          {entry.referralStats.successfulReferrals > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
            >
              <div className="text-sm text-slate-400 font-light text-center">
                You've referred <span className="text-primary font-bold">{entry.referralStats.successfulReferrals} {entry.referralStats.successfulReferrals === 1 ? 'friend' : 'friends'}</span>
                {' • '}
                <span className="text-blue-400 font-bold">+{entry.referralStats.totalBonusEntries} bonus entries</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Motivation banner */}
        <div className="text-center p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-sm text-slate-300 font-light">
            Keep sharing to maximize your chances of winning! 🚀
          </p>
        </div>
      </motion.div>
    </div>
  );
}
