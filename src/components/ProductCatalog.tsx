import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ProductCard from "./ProductCard";
import AuthModal from "./AuthModal";
import QuickFilters, { type QuickFilter } from "./QuickFilters";
import { Loader2, Search, ShoppingBag, Leaf, Cookie, Droplets, Cigarette, Wind, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const ProductCatalog = () => {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("all");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [strainType, setStrainType] = useState<string>("all");
  const [potencyRange, setPotencyRange] = useState([0, 100]);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>();

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

  const products = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Filter by strain type
    if (strainType !== "all") {
      filtered = filtered.filter((p) => p.strain_type === strainType);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.vendor_name?.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by potency range
    filtered = filtered.filter(
      (p) => p.thca_percentage >= potencyRange[0] && p.thca_percentage <= potencyRange[1]
    );

    // Filter by effects
    if (selectedEffects.length > 0) {
      filtered = filtered.filter((p) =>
        p.effects?.some((effect: string) => selectedEffects.includes(effect))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "potency":
          return b.thca_percentage - a.thca_percentage;
        case "rating":
          return b.average_rating - a.average_rating;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [allProducts, category, searchQuery, priceRange, sortBy, strainType, potencyRange, selectedEffects]);

  const categories = [
    { value: "all", label: "All Products", icon: ShoppingBag, desc: "Browse everything" },
    { value: "flower", label: "Flower", icon: Leaf, desc: "Premium cannabis flower" },
    { value: "edibles", label: "Edibles", icon: Cookie, desc: "Delicious infused treats" },
    { value: "concentrates", label: "Concentrates", icon: Droplets, desc: "High-potency extracts" },
    { value: "pre-rolls", label: "Pre-Rolls", icon: Cigarette, desc: "Convenient & ready" },
    { value: "vapes", label: "Vapes", icon: Wind, desc: "Smooth vapor experience" },
  ];

  return (
    <section id="products" className="py-16 md:py-32 bg-gradient-subtle">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-20">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider">Shop THCA Products</h2>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Premium hemp-derived THCA products from licensed NYC vendors
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-6xl mx-auto mb-6 md:mb-8 space-y-4 md:space-y-6">
          
          {/* Search Bar + Mobile Filter Button */}
          <div className="flex gap-2 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden flex-shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  {/* Strain Type */}
                  <div>
                    <Label className="mb-2 block">Strain Type</Label>
                    <Select value={strainType} onValueChange={setStrainType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="indica">Indica</SelectItem>
                        <SelectItem value="sativa">Sativa</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="cbd">CBD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="mb-2 block">
                      Price: ${priceRange[0]} - ${priceRange[1]}
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Potency Range */}
                  <div>
                    <Label className="mb-2 block">
                      THCA: {potencyRange[0]}% - {potencyRange[1]}%
                    </Label>
                    <Slider
                      value={potencyRange}
                      onValueChange={setPotencyRange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Effects */}
                  <div>
                    <Label className="mb-3 block">Effects</Label>
                    <div className="flex flex-wrap gap-2">
                      {['relaxing', 'uplifting', 'creative', 'focused'].map((effect) => (
                        <Button
                          key={effect}
                          variant={selectedEffects.includes(effect) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedEffects(prev =>
                              prev.includes(effect)
                                ? prev.filter(e => e !== effect)
                                : [...prev, effect]
                            );
                          }}
                          className="capitalize"
                        >
                          {effect}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Sort */}
            <div className="hidden md:block">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="potency">Potency (High to Low)</SelectItem>
                  <SelectItem value="rating">Rating (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filters - Horizontal Scroll on Mobile */}
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <QuickFilters 
              onFilterSelect={(filter: QuickFilter) => {
                setActiveQuickFilter(filter.id);
                if (filter.priceRange) {
                  setPriceRange(filter.priceRange);
                }
                if (filter.potencyRange) {
                  setPotencyRange(filter.potencyRange);
                }
                if (filter.category) {
                  setCategory(filter.category);
                }
                if (filter.id === "top-rated") {
                  setSortBy("rating");
                }
              }}
              activeFilter={activeQuickFilter}
            />
          </div>

          {/* Desktop Advanced Filters - Hidden on Mobile */}
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="hidden md:block">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  isFiltersOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Strain Type Filter */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <Label className="text-sm font-medium mb-2 block">Strain Type</Label>
                  <Select value={strainType} onValueChange={setStrainType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="indica">Indica</SelectItem>
                      <SelectItem value="sativa">Sativa</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="cbd">CBD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Potency Range Filter */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <Label className="text-sm font-medium mb-2 block">
                    THCA Potency: {potencyRange[0]}% - {potencyRange[1]}%
                  </Label>
                  <Slider
                    value={potencyRange}
                    onValueChange={setPotencyRange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Effects Filter - Hidden on Mobile */}
          <div className="hidden md:block bg-muted/50 rounded-lg p-4">
            <Label className="text-sm font-medium mb-3 block">Effects</Label>
            <div className="flex flex-wrap gap-2">
              {['relaxing', 'uplifting', 'creative', 'focused', 'energizing', 'sleepy', 'happy', 'euphoric'].map((effect) => (
                <Button
                  key={effect}
                  variant={selectedEffects.includes(effect) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedEffects(prev =>
                      prev.includes(effect)
                        ? prev.filter(e => e !== effect)
                        : [...prev, effect]
                    );
                  }}
                  className="capitalize"
                >
                  {effect}
                </Button>
              ))}
            </div>
            {selectedEffects.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEffects([])}
                className="mt-2"
              >
                Clear Effects
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Buttons - Horizontal Scroll on Mobile */}
        <div className="mb-8 md:mb-12">
          <div className="flex md:justify-center gap-3 md:gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold transition-all flex items-center gap-2 flex-shrink-0 min-h-[44px]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-card text-muted-foreground hover:bg-muted border border-border"
                  )}
                >
                  <Icon className="w-4 md:w-5 h-4 md:h-5" />
                  <span className="text-sm md:text-base">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="hidden">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

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
                  Sign Up
                </Button>
              </div>
            </div>
          ) : (
            <TabsContent value={category} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAuthRequired={() => {
                      setAuthMode("signin");
                      setShowAuthModal(true);
                    }}
                  />
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    No products available in this category
                  </p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          mode={authMode}
          onModeChange={setAuthMode}
        />
      </div>
    </section>
  );
};

export default ProductCatalog;
