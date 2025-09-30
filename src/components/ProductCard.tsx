import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface ProductCardProps {
  product: any;
  onAuthRequired?: () => void;
}

const ProductCard = ({ product, onAuthRequired }: ProductCardProps) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const queryClient = useQueryClient();

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
    <Card className="hover:shadow-strong transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
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
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="flex-1 text-center font-medium">{quantity}</div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          variant="hero" 
          className="w-full"
          onClick={handleAddToCart}
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
  );
};

export default ProductCard;
