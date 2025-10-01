import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Check, Star, Flame, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
      const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      flower: "bg-primary/10 text-primary",
      edibles: "bg-secondary/10 text-secondary",
      vapes: "bg-accent/10 text-accent",
      concentrates: "bg-primary/10 text-primary",
    };
    return colors[category] || colors.flower;
  };

  return (
    <>
      <Card 
        className="hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-4">
          <div className="relative aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
          {badge && (
            <Badge className={`absolute top-2 left-2 z-10 ${badge.className} flex items-center gap-1`}>
              <badge.icon className="w-3 h-3" />
              {badge.text}
            </Badge>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <span className="text-lg font-semibold text-muted-foreground">Out of Stock</span>
            </div>
          )}
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-muted-foreground text-6xl">🌿</span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
            <Badge className={getCategoryColor(product.category)}>
              {product.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground">THCA</div>
            <div className="text-lg font-bold">{product.thca_percentage}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setQuantity(Math.max(1, quantity - 1));
            }}
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="flex-1 text-center font-medium">{quantity}</div>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setQuantity(quantity + 1);
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          variant="hero" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={loading || !product.in_stock || added}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added ✓
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              {loading ? "Adding..." : product.in_stock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
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
