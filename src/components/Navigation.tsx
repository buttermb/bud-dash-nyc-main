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
      <div className="bg-gradient-primary relative overflow-hidden py-3" role="banner" aria-label="Promotional banner">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_6s_ease-in-out_infinite]" />
        <div className="container mx-auto px-4 text-center text-sm font-black text-white tracking-widest uppercase relative z-10">
          <span>Licensed & Lab Tested • Same-Day Delivery • 100% Discreet Packaging</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-card/95 backdrop-blur-xl shadow-elegant relative overflow-hidden" role="navigation" aria-label="Main navigation">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container flex h-20 items-center px-6 relative z-10">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <NYMLogo size={50} />
            <div className="flex flex-col gap-0.5">
              <span className="font-black text-xl tracking-wider text-foreground group-hover:text-primary transition-all duration-300">NYM NYC</span>
              <span className="text-[10px] text-primary/80 tracking-[0.15em] uppercase font-black">Premium Delivery</span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center justify-center gap-10 flex-1" aria-label="Primary navigation">
            {navLinks.map((link) => (
              link.scroll ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={handleNavClick(link.href, link.scroll)}
                  className="relative text-sm font-black uppercase tracking-widest text-foreground/90 hover:text-primary transition-all duration-300 cursor-pointer whitespace-nowrap group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => {
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
                  }}
                  className="relative text-sm font-black uppercase tracking-widest text-foreground/90 hover:text-primary transition-all duration-300 cursor-pointer whitespace-nowrap group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
                </Link>
              )
            ))}
          </nav>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <SearchBar variant="icon" />
            
            {/* Auth Buttons or User Menu */}
            {!user ? (
              <div className="hidden md:flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="default" 
                  onClick={() => openAuth("signin")} 
                  className="h-12 text-xs font-black uppercase tracking-widest hover:text-primary transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button 
                  variant="default" 
                  size="default" 
                  onClick={() => openAuth("signup")} 
                  className="h-12 text-xs font-black uppercase tracking-widest px-8 bg-gradient-primary border-2 border-primary/30 text-white shadow-glow hover:shadow-elegant hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-12 w-12 border-2 border-primary/20 hover:border-primary/40 hover:shadow-glow transition-all duration-300" aria-label="User account menu">
                      <User className="w-5 h-5 text-primary" />
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
            )}
            
            {/* Cart Preview */}
            <Button
              variant="outline"
              className="relative gap-3 hidden sm:flex h-12 px-5 border-2 border-primary/20 hover:border-primary/40 hover:shadow-glow transition-all duration-300 hover:scale-105"
              onClick={() => {
                haptics.light();
                setShowCart(true);
              }}
              aria-label={`Shopping cart with ${cartCount} items and total $${cartTotal.toFixed(2)}`}
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-black leading-none">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
                {cartTotal > 0 && (
                  <span className="text-[10px] text-primary/80 font-bold leading-none">
                    ${cartTotal.toFixed(2)}
                  </span>
                )}
              </div>
              {cartCount > 0 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-black bg-gradient-primary border-2 border-card shadow-glow">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Cart Icon */}
            <Button
              variant="outline"
              size="icon"
              className="relative sm:hidden h-12 w-12 border-2 border-primary/20 hover:border-primary/40 hover:shadow-glow transition-all duration-300 touch-manipulation active:scale-95"
              onClick={() => {
                haptics.light();
                setShowCart(true);
              }}
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-6 h-6 text-primary" />
              {cartCount > 0 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-black bg-gradient-primary border-2 border-card shadow-glow">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            {!user && (
              <div className="hidden sm:flex">
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
