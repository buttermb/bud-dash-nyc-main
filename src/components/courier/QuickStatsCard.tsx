import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Package, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickStatsCardProps {
  todayDeliveries: number;
  todayEarnings: number;
  avgDeliveryTime: number;
  completionRate: number;
}

export default function QuickStatsCard({
  todayDeliveries,
  todayEarnings,
  avgDeliveryTime,
  completionRate
}: QuickStatsCardProps) {
  const stats = [
    {
      label: 'Deliveries Today',
      value: todayDeliveries,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Today\'s Earnings',
      value: `$${todayEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Avg Time',
      value: `${avgDeliveryTime}min`,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
