import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowButtonProps {
  children: ReactNode;
  glowColor?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function GlowButton({ children, className, glowColor = 'hsl(173 100% 50%)', onClick, disabled, type = 'button' }: GlowButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative px-8 py-4 bg-primary text-primary-foreground font-black uppercase overflow-hidden group",
        "shadow-glow hover:shadow-neon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-vibrant"
        variants={{
          hover: { x: '100%' },
          tap: { scale: 0.95 }
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}30, transparent)`,
          filter: 'blur(20px)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
