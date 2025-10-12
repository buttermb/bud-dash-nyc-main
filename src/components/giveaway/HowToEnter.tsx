import { motion } from 'framer-motion';
import { UserPlus, Instagram, Mail, Users, Trophy, CheckCircle } from 'lucide-react';

interface HowToEnterProps {
  giveaway: any;
}

export default function HowToEnter({ giveaway }: HowToEnterProps) {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Account',
      description: 'Sign up with email & create your Bud Dash account',
      entries: giveaway.base_entries,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Instagram,
      title: 'Follow & Tag',
      description: 'Follow @buddashnyc on Instagram & tag 2+ friends',
      entries: 0,
      color: 'from-pink-400 to-purple-500',
      required: true
    },
    {
      icon: Mail,
      title: 'Newsletter (Optional)',
      description: 'Subscribe for exclusive deals & early access',
      entries: giveaway.newsletter_bonus_entries,
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Refer Friends',
      description: 'Share your link & earn entries for each signup',
      entries: giveaway.referral_bonus_entries,
      color: 'from-yellow-400 to-orange-500',
      perReferral: true
    }
  ];

  return (
    <div className="mb-16">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
          How to Enter 📝
        </h2>
        <p className="text-gray-400 text-lg">
          Multiple ways to boost your chances of winning
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
              
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                  {step.title}
                  {step.required && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                      Required
                    </span>
                  )}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">{step.description}</p>

                {/* Entries */}
                {step.entries > 0 && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${step.color} bg-opacity-20 rounded-xl font-bold text-sm`}>
                    <CheckCircle className="w-4 h-4" />
                    +{step.entries} {step.perReferral ? 'per friend' : step.entries === 1 ? 'entry' : 'entries'}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 max-w-3xl mx-auto"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black mb-3">Maximum Entries</h3>
          <p className="text-gray-400 mb-4">
            Stack all methods to maximize your chances! No limit on referral bonuses.
          </p>
          <div className="inline-flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-green-400 to-blue-400 text-transparent bg-clip-text">
            <span>Base: {giveaway.base_entries + giveaway.newsletter_bonus_entries}</span>
            <span className="text-white">+</span>
            <span>∞ Referrals</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
