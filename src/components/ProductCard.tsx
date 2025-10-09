import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Check, Star, Flame, Sparkles, Loader2, AlertCircle, Award, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ProductDetailModal } from "./ProductDetailModal";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getDefaultWeight } from "@/utils/productHelpers";
import { useProductViewCount } from "@/hooks/useProductViewCount";
import { useGuestCart } from "@/hooks/useGuestCart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductCardProps {
  product: any;
  onAuthRequired?: () => void;
  stockLevel?: number;
}

const ProductCard = ({ product, onAuthRequired, stockLevel }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToGuestCart } = useGuestCart();
  const viewCount = useProductViewCount(product.id);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const queryClient = useQueryClient();

  // Use provided stockLevel instead of making individual API call
  const actualStockLevel = stockLevel !== undefined ? stockLevel : 0;
  const isLowStock = actualStockLevel > 0 && actualStockLevel <= 5;

  const handleCardClick = () => {
    addToRecentlyViewed(product.id);
    setShowDetailModal(true);
  };

  const getProductBadge = () => {
    if (product.thca_percentage >= 25) {
      return { icon: Flame, text: "High Potency", className: "bg-destructive/10 text-destructive" };
    }
    if (product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return { icon: Sparkles, text: "New", className: "bg-accent/10 text-accent" };
    }
    if (product.thca_percentage >= 20) {
      return { icon: Star, text: "Staff Pick", className: "bg-primary/10 text-primary" };
    }
    return null;
  };

  const badge = getProductBadge();

  const handleAddToCart = async () => {
    console.log('🛒 ===== ADD TO CART CLICKED =====');
    console.log('Product name:', product.name);
    console.log('Product ID:', product.id);
    console.log('Product in_stock:', product.in_stock);
    console.log('Quantity:', quantity);
    console.log('User status:', user ? 'authenticated' : 'guest');
    console.log('Loading state:', loading);
    console.log('Added state:', added);
    
    if (!product.in_stock) {
      console.error('❌ Product not in stock');
      toast.error("This product is out of stock");
      return;
    }

    console.log('✓ Product in stock, proceeding...');
    setLoading(true);
    
    try {
      // Get default weight for products with weight options (always starts at 3.5g)
      const defaultWeight = getDefaultWeight(product.prices);
      console.log('Default weight selected:', defaultWeight);

      if (!user) {
        // Guest cart - use localStorage
        console.log('🔓 Guest user detected, adding to guest cart');
        console.log('Calling addToGuestCart with:', { productId: product.id, quantity, defaultWeight });
        
        addToGuestCart(product.id, quantity, defaultWeight);
        
        console.log('✅ addToGuestCart called successfully');
        
        // Success feedback
        toast.success("🎉 Added to cart!", {
          description: `${quantity}x ${product.name} (${defaultWeight})`,
          duration: 3000,
        });
        
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["guest-cart-products"] });
        setLoading(false);
        
        console.log('🎉 Guest cart add complete!');
        return;
      }

      // Authenticated user - use database
      const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .eq("selected_weight", defaultWeight)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            selected_weight: defaultWeight,
          });
        
        if (error) throw error;
      }

      // Success feedback with confetti effect
      toast.success("🎉 Added to cart!", {
        description: `${quantity}x ${product.name}`,
        duration: 2000,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      flower: "bg-primary/10 text-primary border-primary/20",
      edibles: "bg-secondary/10 text-secondary border-secondary/20",
      vapes: "bg-accent/10 text-accent border-accent/20",
      concentrates: "bg-primary/10 text-primary border-primary/20",
      "pre-rolls": "bg-primary/10 text-primary border-primary/20",
    };
    return colors[product.category] || colors.flower;
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(Math.max(1, quantity - 1));
  };


  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url || "/placeholder.svg"];

  return (
    <>
      <Card 
        className="group overflow-hidden hover:ring-2 hover:ring-primary/50 hover:shadow-2xl transition-all duration-500 cursor-pointer relative bg-card hover:-translate-y-3 hover:brightness-105"
        onClick={handleCardClick}
      >
        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-destructive">Out of Stock</p>
              <p className="text-sm text-muted-foreground">Check back soon</p>
            </div>
          </div>
        )}

        {/* Badge Stack - Consistent & Color Coded */}
        <div className="absolute top-2 md:top-3 left-2 md:left-3 z-20 flex flex-col gap-1.5 md:gap-2 max-w-[45%]">
          <Badge className={`${getCategoryColor()} uppercase text-xs font-bold shadow-lg truncate`}>
            {product.category}
          </Badge>
          {/* Lab Test Badge - Always Visible */}
          <Badge className="bg-primary text-primary-foreground flex items-center gap-1 shadow-lg text-xs truncate">
            <Award className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Lab Tested</span>
          </Badge>
        </div>

        {/* Product Badge - High Potency Color Coded */}
        {badge && (
          <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20 max-w-[45%]">
            <Badge className={`${badge.className} flex items-center gap-1 shadow-lg font-bold text-xs truncate`}>
              <badge.icon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{badge.text}</span>
            </Badge>
          </div>
        )}

        <div className="relative h-72 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <Carousel className="w-full h-full">
            <CarouselContent>
              {productImages.map((image, index) => (
                <CarouselItem key={index}>
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    loading="lazy"
                    width="330"
                    height="288"
                    className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {productImages.length > 1 && (
              <>
                <CarouselPrevious className="left-2" onClick={(e) => e.stopPropagation()} />
                <CarouselNext className="right-2" onClick={(e) => e.stopPropagation()} />
              </>
            )}
          </Carousel>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <h3 className="text-xl font-bold mb-1 line-clamp-1">{product.name}</h3>
            {product.strain_type && (
              <p className="text-sm text-muted-foreground capitalize">{product.strain_type}</p>
            )}
          </div>
          
          {/* PRICE FIRST - Largest Element */}
          <div className="flex items-end justify-between">
            {product.prices && typeof product.prices === 'object' && Object.keys(product.prices).length > 1 ? (
              <div>
                <div className="text-4xl font-black text-primary">
                  ${Number(Math.min(...Object.values(product.prices).map(p => Number(p)))).toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Starting price</p>
              </div>
            ) : (
              <div className="text-4xl font-black text-primary">
                ${Number(product.price).toFixed(0)}
              </div>
            )}
            {product.thca_percentage && (
              <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-sm px-3 py-1">
                {product.thca_percentage}% THCA
              </Badge>
            )}
          </div>

          {/* Rating + Reviews - Social Proof */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.average_rating || 4.8}</span>
            </div>
            <span className="text-muted-foreground">({product.review_count || 127} reviews)</span>
          </div>

          {/* Stock + Social Proof Alerts */}
          <div className="flex flex-wrap gap-2">
            {isLowStock && (
              <Badge variant="destructive" className="text-xs font-semibold">
                <AlertCircle className="h-3 w-3 mr-1" />
                Only {actualStockLevel} left
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {Math.floor(Math.random() * 30) + 15} sold this week
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex flex-col gap-3">
          {/* ONE BIG ADD TO CART BUTTON - Primary CTA */}
          <Button
            onClick={(e) => {
              console.log('🖱️ Add to Cart button clicked!');
              console.log('Button disabled?', loading || !product.in_stock || added);
              console.log('Loading:', loading, 'In stock:', product.in_stock, 'Added:', added);
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={loading || !product.in_stock || added}
            className={`w-full h-12 text-base font-bold relative overflow-hidden ${
              added ? 'animate-pulse bg-green-600 hover:bg-green-600' : ''
            }`}
            size="lg"
            variant={added ? "secondary" : "hero"}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span className="truncate">Adding...</span>
              </>
            ) : added ? (
              <>
                <Check className="h-5 w-5 mr-2 animate-bounce" />
                <span className="truncate animate-fade-in">✓ Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full hover:bg-primary/10 hover:border-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            <span className="truncate">View Details</span>
          </Button>
        </CardFooter>
      </Card>

      <ProductDetailModal
        product={product}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onAuthRequired={onAuthRequired}
      />
    </>
  );
};

export default ProductCard;
