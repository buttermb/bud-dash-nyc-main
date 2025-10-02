import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Check, Star, Flame, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ProductDetailModal } from "./ProductDetailModal";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface ProductCardProps {
  product: any;
  onAuthRequired?: () => void;
}

const ProductCard = ({ product, onAuthRequired }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch inventory to check stock levels
  const { data: inventory } = useQuery({
    queryKey: ["inventory", product.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("stock")
        .eq("product_id", product.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const stockLevel = inventory?.stock || 0;
  const isLowStock = stockLevel > 0 && stockLevel <= 5;

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
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast.error("Please sign in to add items to cart");
      }
      return;
    }

    if (!product.in_stock) {
      toast.error("This product is out of stock");
      return;
    }

    setLoading(true);
    try {
      // Get default weight for products with weight options
      const defaultWeight = product.prices && typeof product.prices === 'object' 
        ? Object.keys(product.prices)[0] 
        : "unit";

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

      toast.success("Added to cart!");
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
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

  return (
    <>
      <Card 
        className="group overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-300 cursor-pointer relative bg-card"
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

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-20">
          <Badge className={`${getCategoryColor()} uppercase text-xs font-bold`}>
            {product.category}
          </Badge>
        </div>

        {/* Product Badge */}
        {badge && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className={`${badge.className} flex items-center gap-1`}>
              <badge.icon className="w-3 h-3" />
              {badge.text}
            </Badge>
          </div>
        )}

        <div className="relative h-64 overflow-hidden">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
            {product.strain_type && (
              <p className="text-sm text-muted-foreground capitalize">{product.strain_type}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            {product.thca_percentage && (
              <span className="text-sm font-semibold text-primary">
                {product.thca_percentage}% THCa
              </span>
            )}
            {product.prices && typeof product.prices === 'object' && Object.keys(product.prices).length > 1 ? (
              <div className="text-right">
                <span className="text-xl font-bold">
                  From ${Number(Math.min(...Object.values(product.prices).map(p => Number(p)))).toFixed(2)}
                </span>
                {/* Show bundle savings for weight-based products */}
                {Object.keys(product.prices).length >= 2 && (
                  <p className="text-xs text-primary font-medium mt-1">
                    Save up to ${(
                      (Number(Object.values(product.prices)[0]) * 8) - 
                      Number(Object.values(product.prices)[Object.keys(product.prices).length - 1])
                    ).toFixed(2)} with bulk!
                  </p>
                )}
              </div>
            ) : (
              <span className="text-xl font-bold">${Number(product.price).toFixed(2)}</span>
            )}
          </div>

          {/* Low Stock Alert */}
          {isLowStock && (
            <div className="flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="h-3 w-3" />
              Only {stockLevel} left in stock!
            </div>
          )}

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 p-6 pt-0">
          <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 1 || loading || !product.in_stock}
              className="h-9 w-9 shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center font-semibold">{quantity}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={loading || !product.in_stock}
              className="h-9 w-9 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={loading || !product.in_stock || added}
              className="flex-1"
              variant={added ? "secondary" : "default"}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : added ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            View Details
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
