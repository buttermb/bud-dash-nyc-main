import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FloatingBadgeProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FloatingBadge({ children, delay = 0, className }: FloatingBadgeProps) {
  return (
    <motion.div
      className={cn(
        "inline-block bg-card text-primary px-4 py-2 font-black uppercase text-sm",
        "border-2 border-primary shadow-glow",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { delay },
        y: {
          repeat: Infinity,
          duration: 2,
          delay,
          ease: "easeInOut"
        }
      }}
    >
      {children}
    </motion.div>
  );
}
