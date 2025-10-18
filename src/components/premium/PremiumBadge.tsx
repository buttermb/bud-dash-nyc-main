import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  icon?: LucideIcon;
  text: string;
  variant?: 'glow' | 'bold' | 'neon';
  className?: string;
}

export function PremiumBadge({ icon: Icon, text, variant = 'glow', className }: PremiumBadgeProps) {
  const variantClasses = {
    glow: 'bg-primary/10 text-primary border-2 border-primary shadow-glow animate-glow-pulse',
    bold: 'bg-primary text-primary-foreground font-black uppercase border-2 border-primary shadow-strong',
    neon: 'bg-card text-primary border-2 border-primary shadow-neon font-black uppercase',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <Badge className={cn(variantClasses[variant], 'flex items-center gap-2', className)}>
        {Icon && <Icon className="w-4 h-4" />}
        <span>{text}</span>
      </Badge>
    </motion.div>
  );
}
