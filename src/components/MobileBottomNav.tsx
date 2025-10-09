import { Home, Search, ShoppingCart, User, LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { haptics } from '@/utils/haptics';
import { useGuestCart } from '@/hooks/useGuestCart';

interface MobileBottomNavProps {
  onCartClick: () => void;
  onAuthClick: () => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  onClick: ((e: React.MouseEvent) => void) | null;
  badge?: number;
}

const MobileBottomNav = ({ onCartClick, onAuthClick }: MobileBottomNavProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { getGuestCartCount } = useGuestCart();
  const isMobile = useIsMobile();
  const scrollDirection = useScrollDirection();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const dbCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const guestCartCount = user ? 0 : getGuestCartCount();
  const cartCount = user ? dbCartCount : guestCartCount;

  const handleProductsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#products';
    }
  };

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/', onClick: null },
    { icon: Search, label: 'Menu', path: '/#products', onClick: handleProductsClick },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', onClick: null, badge: cartCount }, // Allow guests to access cart
    { icon: User, label: 'Account', path: user ? '/my-orders' : '#', onClick: user ? null : onAuthClick },
  ];

  // Only show on mobile devices
  if (!isMobile) return null;

  // Hide on scroll down, show on scroll up (at top always show)
  const isVisible = scrollDirection !== 'down' || window.scrollY < 100;

  return (
    <nav 
      className={cn(
        "fixed left-0 right-0 z-50 md:hidden",
        "bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80",
        "border-t border-border/40 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]",
        "rounded-t-2xl safe-area-bottom",
        "transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0 bottom-0" : "translate-y-full bottom-0"
      )}
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path === '/#products' && location.pathname === '/' && location.hash === '#products');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={(e) => {
                haptics.light(); // Haptic feedback on tap
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick(e);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 relative",
                "px-3 py-2 rounded-xl transition-all duration-200",
                "min-w-[56px] min-h-[56px]", // 56px touch target
                "active:scale-95",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive && "stroke-[2.5] scale-105"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <div 
                    className={cn(
                      "absolute -top-2 -right-2",
                      "bg-destructive text-destructive-foreground",
                      "text-[10px] font-bold leading-none",
                      "rounded-full min-w-[18px] h-[18px]",
                      "flex items-center justify-center px-1",
                      "shadow-lg border-2 border-background",
                      "animate-in zoom-in-50 duration-200"
                    )}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </div>
              <span 
                className={cn(
                  "text-[11px] font-medium transition-all duration-200",
                  isActive ? "font-semibold text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
