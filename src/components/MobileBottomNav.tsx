import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileBottomNavProps {
  onCartClick: () => void;
  onAuthClick: () => void;
}

const MobileBottomNav = ({ onCartClick, onAuthClick }: MobileBottomNavProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleProductsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#products';
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/', onClick: null },
    { icon: Search, label: 'Products', path: '/#products', onClick: handleProductsClick },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', onClick: user ? onCartClick : onAuthClick, badge: cartCount },
    { icon: User, label: 'Account', path: user ? '/my-orders' : '#', onClick: user ? null : onAuthClick },
  ];

  // Only show on mobile devices
  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden safe-area-bottom">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick(e);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 relative min-h-[44px]",
                "transition-colors duration-200 active:bg-accent",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 rounded-full flex items-center justify-center p-0 text-[10px]"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-bold"
              )}>
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
