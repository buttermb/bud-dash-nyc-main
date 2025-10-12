import { motion } from 'framer-motion';
import { Copy, Share2, Trophy, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EntryStatusProps {
  entry: any;
  giveaway: any;
  onUpdate: () => void;
}

export default function EntryStatus({ entry, giveaway, onUpdate }: EntryStatusProps) {
  const { toast } = useToast();

  const copyReferralLink = () => {
    navigator.clipboard.writeText(entry.referralLink);
    toast({
      title: "Link Copied! 📋",
      description: "Share it to earn +3 entries per friend",
    });
  };

  const shareOnSocial = () => {
    const text = `I just entered to win 1 LB of premium flower from Bud Dash NYC! 🎉 Join me: ${entry.referralLink}`;
    if (navigator.share) {
      navigator.share({ text, url: entry.referralLink });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-4xl mx-auto mb-16"
    >
      <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-3xl opacity-20 blur animate-pulse" />
        
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50"
            >
              <Trophy className="w-10 h-10" />
            </motion.div>
            <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
              You're Entered! 🎉
            </h2>
            <p className="text-gray-400">Entry #{entry.entryNumbers?.start?.toLocaleString()}</p>
          </div>

          {/* Entry Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text mb-2">
                {entry.totalEntries}
              </div>
              <div className="text-sm text-gray-400">Your Total Entries</div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text mb-2">
                {entry.referralStats.successfulReferrals}
              </div>
              <div className="text-sm text-gray-400">Friends Referred</div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
                {giveaway.total_participants.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Participants</div>
            </div>
          </div>

          {/* Entry Breakdown */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Entry Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Base entry:</span>
                <span className="font-bold">{entry.breakdown.base}</span>
              </div>
              {entry.breakdown.newsletter > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Newsletter bonus:</span>
                  <span className="font-bold text-green-400">+{entry.breakdown.newsletter}</span>
                </div>
              )}
              {entry.breakdown.referrals > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Referral bonus:</span>
                  <span className="font-bold text-green-400">+{entry.breakdown.referrals}</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-xl text-green-400">{entry.totalEntries}</span>
              </div>
            </div>
          </div>

          {/* Referral Section */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Earn More Entries!
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Share your referral link and get <span className="text-green-400 font-bold">+3 entries</span> for each friend who signs up!
            </p>

            <div className="bg-black/30 rounded-xl p-4 mb-4 break-all text-sm font-mono">
              {entry.referralLink}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyReferralLink}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareOnSocial}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
