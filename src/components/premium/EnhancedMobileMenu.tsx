import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import NYMLogo from '@/components/NYMLogo';

interface EnhancedMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'SHOP', href: '/#products' },
  { label: 'TRACK', href: '/track-order' },
  { label: 'ABOUT', href: '/about' },
  { label: 'SUPPORT', href: '/support' },
  { label: 'GIVEAWAY', href: '/giveaway/nyc-biggest-flower' },
];

export function EnhancedMobileMenu({ isOpen, onClose }: EnhancedMobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-background z-50 flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b-2 border-primary/20">
            <NYMLogo size={40} />
            <motion.button
              onClick={onClose}
              className="p-3 hover:bg-primary/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Menu items */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
            {menuItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={item.href}
                  onClick={onClose}
                  className="group relative"
                >
                  <motion.span
                    className="text-5xl font-black text-foreground hover:text-primary 
                             transition-colors block"
                    whileHover={{ scale: 1.1, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.span>
                  
                  {/* Animated underline */}
                  <motion.div
                    className="h-1 bg-gradient-vibrant mt-2"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Footer text */}
          <div className="p-6 text-center border-t-2 border-primary/20">
            <p className="text-sm text-muted-foreground font-bold">
              NYC'S PREMIUM DELIVERY • 21+ ONLY
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
