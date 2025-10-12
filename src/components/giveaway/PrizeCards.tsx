import { motion } from 'framer-motion';
import { Award, DollarSign, Gift } from 'lucide-react';

interface PrizeCardsProps {
  giveaway: any;
}

export default function PrizeCards({ giveaway }: PrizeCardsProps) {
  const prizes = [
    {
      rank: '1st',
      icon: Award,
      title: giveaway.grand_prize_title,
      description: giveaway.grand_prize_description,
      value: `$${giveaway.grand_prize_value.toLocaleString()}`,
      gradient: 'from-yellow-400 via-amber-500 to-orange-500',
      shadow: 'shadow-yellow-500/50',
      iconColor: 'text-yellow-400'
    },
    {
      rank: '2nd',
      icon: DollarSign,
      title: giveaway.second_prize_title,
      description: 'Store credit for your next order',
      value: `$${giveaway.second_prize_value}`,
      gradient: 'from-gray-300 via-gray-400 to-gray-500',
      shadow: 'shadow-gray-500/50',
      iconColor: 'text-gray-300'
    },
    {
      rank: '3rd',
      icon: Gift,
      title: giveaway.third_prize_title,
      description: 'Store credit for any product',
      value: `$${giveaway.third_prize_value}`,
      gradient: 'from-orange-400 via-amber-600 to-orange-700',
      shadow: 'shadow-orange-500/50',
      iconColor: 'text-orange-400'
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
          3 Winners. $4,250+ in Prizes 🏆
        </h2>
        <p className="text-gray-400 text-lg">
          Drawing happens {new Date(giveaway.end_date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {prizes.map((prize, index) => {
          const Icon = prize.icon;
          return (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${prize.gradient} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity ${prize.shadow}`} />
              
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
                {/* Rank Badge */}
                <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r ${prize.gradient} rounded-full flex items-center justify-center font-black text-lg shadow-lg ${prize.shadow}`}>
                  {prize.rank}
                </div>

                {/* Icon */}
                <div className={`w-20 h-20 bg-gradient-to-r ${prize.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${prize.shadow}`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black mb-2">{prize.title}</h3>
                
                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">{prize.description}</p>

                {/* Value */}
                <div className={`text-4xl font-black bg-gradient-to-r ${prize.gradient} text-transparent bg-clip-text`}>
                  {prize.value}
                </div>
                
                <div className="text-xs text-gray-500 mt-2">VALUE</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
