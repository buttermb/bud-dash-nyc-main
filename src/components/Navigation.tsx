import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import CartDrawer from "./CartDrawer";
import ThemeToggle from "./ThemeToggle";
import NYMLogo from "./NYMLogo";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showCart, setShowCart] = useState(false);

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
  
  const getItemPrice = (item: any) => {
    const product = item.products;
    const selectedWeight = item.selected_weight || "unit";
    if (product?.prices && typeof product.prices === 'object') {
      return product.prices[selectedWeight] || product.price || 0;
    }
    return product?.price || 0;
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );


  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleNavClick = (href: string, scroll: boolean, closeSheet?: () => void) => {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    { label: "How It Works", href: "#how-it-works", scroll: true },
    { label: "Track Order", href: "/track-order", scroll: false },
    { label: "Support", href: "/support", scroll: false },
  ];

  return (
    <>
      {/* Free Shipping Banner */}
      <div className="bg-card border-b border-border py-2">
        <div className="container mx-auto px-4 text-center text-sm font-medium">
          <span>Licensed NY Hemp Retailer | THCA Products | Same-Day Delivery | Free Shipping $100+</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/98 backdrop-blur-lg supports-[backdrop-filter]:bg-background/95 shadow-soft">
        <div className="container flex h-20 items-center justify-between px-4">
          <a href="/" className="flex items-center gap-3">
            <NYMLogo size={60} />
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider">NEW YORK MINUTE</span>
              <span className="text-xs text-muted-foreground tracking-widest">THCA DELIVERY. ELEVATED.</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={handleNavClick(link.href, link.scroll)}
                className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sticky Cart Preview */}
            <Button
              variant="outline"
              className="relative gap-2 hidden sm:flex"
              onClick={() => user ? setShowCart(true) : openAuth("signin")}
            >
              <ShoppingCart className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
                {cartTotal > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ${cartTotal.toFixed(2)}
                  </span>
                )}
              </div>
              {cartCount > 0 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Cart Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="relative sm:hidden"
              onClick={() => user ? setShowCart(true) : openAuth("signin")}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
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
                    <DropdownMenuItem onClick={() => navigate("/orders")}>
                      My Orders
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
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openAuth("signin")}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={() => openAuth("signup")}>
                  Sign Up
                </Button>
                <ThemeToggle />
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={handleNavClick(link.href, link.scroll, () => {
                        const closeButton = document.querySelector('[aria-label="Close"]') as HTMLButtonElement;
                        closeButton?.click();
                      })}
                      className="text-lg font-medium transition-colors hover:text-primary cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ))}
                  {user ? (
                    <Button variant="outline" onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}>
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => openAuth("signin")}>
                        Sign In
                      </Button>
                      <Button variant="hero" onClick={() => openAuth("signup")}>
                        Sign Up
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <CartDrawer open={showCart} onOpenChange={setShowCart} />
    </>
  );
};

export default Navigation;
