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
        "relative px-8 py-4 bg-primary text-primary-foreground font-bold overflow-hidden group",
        "shadow-elegant hover:shadow-glow transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-1000",
        className
      )}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-90" />
      
      {/* Soft glow on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}20, transparent)`,
          filter: 'blur(30px)'
        }}
      />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
