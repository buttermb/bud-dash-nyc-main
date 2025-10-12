import { useState } from 'react';
import { submitGiveawayEntry } from '@/lib/api/giveaway';
import { Instagram, Loader2, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface EntryFormProps {
  giveaway: any;
  referralCode?: string;
  onSuccess: () => void;
}

export default function EntryForm({ giveaway, referralCode, onSuccess }: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [entryResult, setEntryResult] = useState<any>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    borough: '',
    instagramHandle: '',
    instagramTagUrl: '',
    newsletterSubscribe: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await submitGiveawayEntry(giveaway.id, {
        ...formData,
        referralCode
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setEntryResult(result);
      setShowSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 5000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess && entryResult) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl mx-auto mb-16"
      >
        <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse" />
          
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"
            >
              <Check className="w-12 h-12" />
            </motion.div>

            <h2 className="text-4xl font-black mb-4">You're In! 🎉</h2>
            <p className="text-gray-300 mb-8">
              Entry #{entryResult.entryNumbers.start.toLocaleString()}
            </p>

            <div className="bg-white/5 rounded-2xl p-6 mb-6">
              <div className="text-6xl font-black bg-gradient-to-r from-green-400 to-blue-400 text-transparent bg-clip-text mb-2">
                {entryResult.totalEntries}
              </div>
              <div className="text-gray-400">Your Total Entries</div>
            </div>

            <div className="text-sm text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>Base entry:</span>
                <span className="font-bold">{entryResult.breakdown.base}</span>
              </div>
              {entryResult.breakdown.newsletter > 0 && (
                <div className="flex justify-between">
                  <span>Newsletter:</span>
                  <span className="font-bold text-green-400">+{entryResult.breakdown.newsletter}</span>
                </div>
              )}
            </div>

            <p className="text-gray-400 text-sm mt-8">
              Check your email for next steps! Redirecting...
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="max-w-2xl mx-auto mb-16"
    >
      <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl opacity-20 blur" />
        
        <div className="relative">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
              Enter to Win 🎉
            </h2>
            <p className="text-gray-400">Takes 2 minutes • FREE to enter</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder:text-gray-500"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder:text-gray-500"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder:text-gray-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder="Create Password (min 8 characters)"
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder:text-gray-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />

            <input
              type="tel"
              placeholder="Phone (for delivery)"
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all placeholder:text-gray-500"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <input
              type="date"
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all text-white"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />

            <select
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all cursor-pointer text-white"
              value={formData.borough}
              onChange={(e) => setFormData({ ...formData, borough: e.target.value })}
              required
            >
              <option value="" className="bg-gray-900">Select Borough</option>
              <option value="Manhattan" className="bg-gray-900">Manhattan</option>
              <option value="Brooklyn" className="bg-gray-900">Brooklyn</option>
              <option value="Queens" className="bg-gray-900">Queens</option>
              <option value="Bronx" className="bg-gray-900">Bronx</option>
              <option value="Staten Island" className="bg-gray-900">Staten Island</option>
            </select>

            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Instagram className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-pink-400">Instagram Required</h3>
              </div>
              
              <input
                type="text"
                placeholder="Your Instagram handle (@username)"
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all mb-3 placeholder:text-gray-500"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                required
              />

              <input
                type="url"
                placeholder="Instagram post URL where you tagged @buddashnyc"
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all placeholder:text-gray-500"
                value={formData.instagramTagUrl}
                onChange={(e) => setFormData({ ...formData, instagramTagUrl: e.target.value })}
                required
              />

              <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" /> Follow @buddashnyc
                <Check className="w-4 h-4 text-green-400" /> Tag 2+ friends
              </p>
            </div>

            <motion.label
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 cursor-pointer p-5 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl hover:border-green-400/40 transition-all group"
            >
              <input
                type="checkbox"
                checked={formData.newsletterSubscribe}
                onChange={(e) => setFormData({ ...formData, newsletterSubscribe: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-green-500 checked:border-green-500 cursor-pointer"
              />
              <span className="flex-1">
                📧 Subscribe to newsletter 
                <span className="text-green-400 font-bold ml-2">(+1 entry)</span>
              </span>
            </motion.label>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden py-5 rounded-xl font-black text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 group-hover:from-green-600 group-hover:via-emerald-600 group-hover:to-blue-600 transition-all" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: loading ? ['-100%', '200%'] : '0%' }}
                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Entering...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Enter Giveaway FREE
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </span>
            </motion.button>

            <p className="text-xs text-gray-400 text-center">
              By entering, you agree to our terms. Must be 21+ and in NYC area.
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
