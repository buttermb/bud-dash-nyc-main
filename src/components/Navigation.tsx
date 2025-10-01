import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Leaf, Menu, ShoppingCart, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import CartDrawer from "./CartDrawer";
import ThemeToggle from "./ThemeToggle";

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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold hidden sm:inline">THCA NYC</span>
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
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => user ? setShowCart(true) : openAuth("signin")}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
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
