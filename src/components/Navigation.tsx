import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ShoppingCart, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import CartDrawer from "./CartDrawer";
import ThemeToggle from "./ThemeToggle";
import NYMLogo from "./NYMLogo";
import MobileBottomNav from "./MobileBottomNav";
import { useGuestCart } from "@/hooks/useGuestCart";
import { SearchBar } from "./SearchBar";
import { haptics } from "@/utils/haptics";
import { EnhancedMobileMenu } from "./premium/EnhancedMobileMenu";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { getGuestCartCount } = useGuestCart();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showCart, setShowCart] = useState(false);
  const [cartUpdateKey, setCartUpdateKey] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Force re-render when cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartUpdateKey(prev => prev + 1);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const dbCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const guestCartCount = user ? 0 : getGuestCartCount();
  const cartCount = user ? dbCartCount : guestCartCount;
  
  const getItemPrice = (item: any) => {
    const product = item.products;
    const selectedWeight = item.selected_weight || "unit";
    if (product?.prices && typeof product.prices === 'object') {
      return product.prices[selectedWeight] || product.price || 0;
    }
    return product?.price || 0;
  };

  // Cart total only for authenticated users (guest total not shown in nav to simplify)
  const cartTotal = user ? cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  ) : 0;


  const openAuth = (mode: "signin" | "signup") => {
    haptics.light(); // Light tap feedback
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleNavClick = (href: string, scroll: boolean, closeSheet?: () => void) => {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      haptics.selection(); // Selection feedback for navigation
      if (scroll && href.includes('#')) {
        e.preventDefault();
        const id = href.split('#')[1];
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          closeSheet?.();
        } else {
          // If element not found, navigate to home page first
          navigate('/');
          setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } else {
        closeSheet?.();
      }
    };
  };

  const navLinks = [
    { label: "Products", href: "#products", scroll: true },
    { label: "Track Order", href: "/track-order", scroll: false },
    { label: "Support", href: "/support", scroll: false },
  ];

  return (
    <>
      {/* Premium Banner */}
      <div className="bg-primary py-3" role="banner" aria-label="Promotional banner">
        <div className="container mx-auto px-4 text-center text-base font-bold text-white tracking-wide">
          <span>Licensed & Lab Tested • Same-Day Delivery • 100% Discreet Packaging</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card backdrop-blur-lg shadow-md" role="navigation" aria-label="Main navigation">
        <div className="container flex h-20 items-center justify-between px-6">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3 min-w-fit group">
            <NYMLogo size={48} />
            <div className="flex flex-col gap-0.5">
              <span className="font-black text-lg tracking-wider text-foreground group-hover:text-primary transition-colors">NYM NYC</span>
              <span className="text-xs text-muted-foreground tracking-widest uppercase font-semibold">Premium Delivery</span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {navLinks.map((link) => (
              link.scroll ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={handleNavClick(link.href, link.scroll)}
                  className="text-base font-bold uppercase tracking-wide text-foreground hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => {
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
                  }}
                  className="text-base font-bold uppercase tracking-wide text-foreground hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
          
          {/* Right: Search & Auth */}
          <div className="flex items-center gap-4">
            <SearchBar variant="icon" />
            
            {!user ? (
              <div className="hidden md:flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="default" 
                  onClick={() => openAuth("signin")} 
                  className="text-sm font-bold uppercase tracking-wide hover:text-primary"
                >
                  Sign In
                </Button>
                <Button 
                  variant="default" 
                  size="default" 
                  onClick={() => openAuth("signup")} 
                  className="text-sm font-bold uppercase tracking-wide px-6 bg-primary hover:bg-primary-dark text-white shadow-glow hover:shadow-elegant transition-all"
                >
                  Sign Up
                </Button>
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 min-w-fit">
            {/* Search Icon */}
            <SearchBar variant="icon" />
            
            {/* Sticky Cart Preview */}
            <Button
              variant="outline"
              className="relative gap-3 hidden sm:flex h-11 px-4"
              onClick={() => {
                haptics.light();
                setShowCart(true);
              }}
              aria-label={`Shopping cart with ${cartCount} items and total $${cartTotal.toFixed(2)}`}
            >
              <ShoppingCart className="w-4 h-4" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-semibold leading-none">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
                {cartTotal > 0 && (
                  <span className="text-[10px] text-muted-foreground leading-none">
                    ${cartTotal.toFixed(2)}
                  </span>
                )}
              </div>
              {cartCount > 0 && (
                <Badge variant="default" className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Cart Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="relative sm:hidden h-12 w-12 touch-manipulation active:scale-95 transition-transform"
              onClick={() => {
                haptics.light();
                setShowCart(true);
              }}
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="User account menu">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">My Account</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account/giveaway-entries")}>
                      My Entries
                    </DropdownMenuItem>
                    <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ThemeToggle />
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <ThemeToggle />
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-12 touch-manipulation active:scale-95 transition-transform md:hidden"
              aria-label="Open mobile menu"
              onClick={() => {
                haptics.medium();
                setShowMobileMenu(true);
              }}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      <EnhancedMobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <CartDrawer open={showCart} onOpenChange={setShowCart} />
      
      <MobileBottomNav 
        onCartClick={() => {
          haptics.light();
          setShowCart(true);
        }}
        onAuthClick={() => openAuth("signin")}
      />
    </>
  );
};

export default Navigation;
