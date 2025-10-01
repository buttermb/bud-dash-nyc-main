import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Loader2, Package, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface ProductDetailModalProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired?: () => void;
}

export const ProductDetailModal = ({ product, open, onOpenChange, onAuthRequired }: ProductDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Initialize selected weight when modal opens or product changes
  useEffect(() => {
    if (product?.prices && typeof product.prices === 'object') {
      const weights = Object.keys(product.prices);
      if (weights.length > 0) {
        setSelectedWeight(weights[0]);
      }
    }
  }, [product, open]);

  const handleAddToCart = async () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (!product.in_stock || product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently unavailable.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check for existing item with same weight
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .eq("selected_weight", selectedWeight || "unit")
        .maybeSingle();

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            selected_weight: selectedWeight || "unit",
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      
      toast({
        title: "Added to cart!",
        description: `${product.name} (${selectedWeight || "unit"}) has been added to your cart.`,
      });

      onOpenChange(false);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Failed to add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = () => {
    if (!product.in_stock || product.stock === 0) return { text: "Out of Stock", color: "bg-destructive/10 text-destructive" };
    if (product.stock <= 5) return { text: "Low Stock", color: "bg-warning/10 text-warning" };
    return { text: "In Stock", color: "bg-success/10 text-success" };
  };

  // Get current price based on selected weight
  const getCurrentPrice = () => {
    if (product.prices && typeof product.prices === 'object') {
      return product.prices[selectedWeight] || product.price;
    }
    return product.price;
  };

  // Get available weights
  const getWeights = () => {
    if (product.prices && typeof product.prices === 'object') {
      return Object.keys(product.prices);
    }
    return [];
  };

  const weights = getWeights();
  const currentPrice = getCurrentPrice();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="grid lg:grid-cols-2 gap-8 p-2">
          {/* Product Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3 uppercase text-xs">
                {product.category}
              </Badge>
              <h2 className="text-4xl font-bold mb-4">{product.name}</h2>
            </div>

            {/* Specifications */}
            <div className="space-y-3 mb-6">
              {product.thca_percentage && (
                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold text-muted-foreground">THCa:</span>
                  <span className="font-medium">{product.thca_percentage}%</span>
                </div>
              )}
              {product.strain_type && (
                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{product.strain_type}</span>
                </div>
              )}
              {product.effects && product.effects.length > 0 && (
                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold text-muted-foreground">Effects:</span>
                  <span className="font-medium text-right capitalize">{product.effects.join(", ")}</span>
                </div>
              )}
              {product.strain_lineage && (
                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold text-muted-foreground">Genetics:</span>
                  <span className="font-medium text-right">{product.strain_lineage}</span>
                </div>
              )}
            </div>

            {/* Weight Selection - Only for products with multiple weights */}
            {weights.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                  Select Weight:
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {weights.map((weight) => (
                    <Button
                      key={weight}
                      variant={selectedWeight === weight ? "default" : "outline"}
                      onClick={() => setSelectedWeight(weight)}
                      className="font-semibold"
                    >
                      {weight}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStockStatus().color}`}>
                <Package className="w-4 h-4" />
                {getStockStatus().text}
              </div>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-primary mb-6">
              ${Number(currentPrice).toFixed(2)}
            </div>

            {/* Quantity Control */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={loading}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!product.in_stock || loading}
              className="w-full mb-4"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            {/* Additional Links */}
            {(product.coa_url || product.lab_results_url) && (
              <div className="pt-4 border-t space-y-2">
                {product.coa_url && (
                  <a
                    href={product.coa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    Certificate of Analysis
                  </a>
                )}
                {product.lab_results_url && (
                  <a
                    href={product.lab_results_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    Lab Results
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description and Details Section */}
        <div className="p-6 border-t space-y-8">
          {product.description && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.usage_tips && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Why You'll Love {product.name}</h3>
              <div className="space-y-3">
                {product.usage_tips.split('\n').filter((tip: string) => tip.trim()).map((tip: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.terpenes && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Terpene Profile</h3>
              <div className="grid gap-4">
                {(Array.isArray(product.terpenes) ? product.terpenes : Object.entries(product.terpenes)).map((terpene: any, index: number) => {
                  const name = Array.isArray(product.terpenes) ? terpene.name || terpene : terpene[0];
                  const description = Array.isArray(product.terpenes) ? terpene.description : `${terpene[1]}%`;
                  
                  return (
                    <div key={index} className="bg-muted rounded-lg p-4">
                      <h4 className="font-bold text-primary mb-1 capitalize">
                        {name}
                      </h4>
                      {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
