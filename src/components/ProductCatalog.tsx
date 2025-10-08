import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import AuthModal from "./AuthModal";
import { Loader2, Search, Leaf, Cookie, Droplets, Cigarette, Wind, ChevronRight, ChevronLeft } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const ProductCatalog = () => {
  const queryClient = useQueryClient();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [searchQuery, setSearchQuery] = useState("");

  // Realtime subscription for product updates
  useEffect(() => {
    const channel = supabase
      .channel('product-catalog-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("in_stock", true);
      if (error) throw error;
      return data;
    },
  });

  // Filter products by search
  const filteredProducts = searchQuery
    ? allProducts.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.vendor_name?.toLowerCase().includes(query)
        );
      })
    : allProducts;

  // Group products by category
  const productsByCategory = {
    flower: filteredProducts.filter((p) => p.category === "flower"),
    edibles: filteredProducts.filter((p) => p.category === "edibles"),
    "pre-rolls": filteredProducts.filter((p) => p.category === "pre-rolls"),
    concentrates: filteredProducts.filter((p) => p.category === "concentrates"),
    vapes: filteredProducts.filter((p) => p.category === "vapes"),
  };

  const categories = [
    { key: "flower", label: "Flower", icon: Leaf, desc: "Premium cannabis flower" },
    { key: "edibles", label: "Edibles", icon: Cookie, desc: "Delicious infused treats" },
    { key: "pre-rolls", label: "Pre-Rolls", icon: Cigarette, desc: "Convenient & ready" },
    { key: "concentrates", label: "Concentrates", icon: Droplets, desc: "High-potency extracts" },
    { key: "vapes", label: "Vapes", icon: Wind, desc: "Smooth vapor experience" },
  ];

  // Scroll helper
  const scrollContainerRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scroll = (categoryKey: string, direction: 'left' | 'right') => {
    const container = scrollContainerRef.current[categoryKey];
    if (!container) return;
    
    const scrollAmount = direction === 'left' ? -400 : 400;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section id="products" className="py-16 md:py-32 bg-gradient-subtle">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-20">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider">Shop THCA Products</h2>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Premium hemp-derived THCA products from licensed NYC vendors
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-muted/30 rounded-lg p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Loader2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-center">Sign In Required</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You must be signed in with an age-verified account to view our THCA product catalog.
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                size="lg"
                onClick={() => {
                  setAuthMode("signin");
                  setShowAuthModal(true);
                }}
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setAuthMode("signup");
                  setShowAuthModal(true);
                }}
              >
                Create Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {categories.map((category) => {
              const products = productsByCategory[category.key as keyof typeof productsByCategory];
              if (products.length === 0) return null;

              const Icon = category.icon;

              return (
                <div key={category.key} id={category.key} className="space-y-4 md:space-y-6 scroll-mt-24">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold">{category.label}</h3>
                        <p className="text-sm text-muted-foreground">{category.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hidden md:flex"
                        onClick={() => scroll(category.key, 'left')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hidden md:flex"
                        onClick={() => scroll(category.key, 'right')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Product Row */}
                  <div className="relative group">
                    {/* Desktop scroll buttons */}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
                      onClick={() => scroll(category.key, 'left')}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
                      onClick={() => scroll(category.key, 'right')}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>

                    <div 
                      ref={(el) => scrollContainerRef.current[category.key] = el}
                      className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
                      style={{ 
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      {products.map((product) => (
                        <div 
                          key={product.id} 
                          className="w-[280px] md:w-[320px] flex-shrink-0 snap-start snap-always"
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </section>
  );
};

export default ProductCatalog;
