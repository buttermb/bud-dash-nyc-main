import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
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
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
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
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
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
    if (!product.in_stock || product.stock === 0) return { text: "Out of Stock", color: "destructive" };
    if (product.stock <= 5) return { text: "Low Stock", color: "warning" };
    return { text: "In Stock", color: "default" };
  };

  const stockStatus = getStockStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1605313448639-eb6f5b70f7fd"}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
            />
            <div className="flex items-center gap-2">
              <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
              {product.strain_type && (
                <Badge variant="outline" className="capitalize">{product.strain_type}</Badge>
              )}
            </div>

            {/* Lab Results & COA */}
            <div className="space-y-2">
              {product.coa_url && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(product.coa_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Certificate of Analysis
                </Button>
              )}
              {product.lab_results_url && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(product.lab_results_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Lab Results
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <p className="text-3xl font-bold">${Number(product.price).toFixed(2)}</p>
              {product.vendor_name && (
                <p className="text-sm text-muted-foreground mt-1">By {product.vendor_name}</p>
              )}
            </div>

            {/* Potency */}
            <div className="space-y-2">
              <h4 className="font-semibold">THCA Content</h4>
              <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all"
                  style={{ width: `${Math.min((product.thca_percentage / 30) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{product.thca_percentage}% THCA</p>
            </div>

            {/* Effects */}
            {product.effects && product.effects.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Effects</h4>
                <div className="flex flex-wrap gap-2">
                  {product.effects.map((effect: string) => (
                    <Badge key={effect} variant="secondary" className="capitalize">
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Terpenes */}
            {product.terpenes && Object.keys(product.terpenes).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Terpene Profile</h4>
                <div className="space-y-1">
                  {Object.entries(product.terpenes).map(([name, value]: [string, any]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="capitalize">{name}</span>
                      <span className="text-muted-foreground">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Strain Lineage */}
            {product.strain_lineage && (
              <div>
                <h4 className="font-semibold mb-2">Strain Lineage</h4>
                <p className="text-sm text-muted-foreground">{product.strain_lineage}</p>
              </div>
            )}

            {/* Usage Tips */}
            {product.usage_tips && (
              <div>
                <h4 className="font-semibold mb-2">Usage Tips</h4>
                <p className="text-sm text-muted-foreground">{product.usage_tips}</p>
              </div>
            )}

            {/* Strain Info */}
            {product.strain_info && (
              <div>
                <h4 className="font-semibold mb-2">Strain Information</h4>
                <p className="text-sm text-muted-foreground">{product.strain_info}</p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.in_stock || loading}
              >
                {loading ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
