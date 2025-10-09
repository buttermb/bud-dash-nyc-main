import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useGuestCart } from "@/hooks/useGuestCart";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const [user, setUser] = useState<any>(null);
  const { guestCart, updateGuestCartItem, removeFromGuestCart } = useGuestCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const { data: dbCartItems = [] } = useQuery({
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

  // Fetch product details for guest cart items
  const { data: guestProducts = [] } = useQuery({
    queryKey: ["guest-cart-products", guestCart.map(i => i.product_id).join(",")],
    queryFn: async () => {
      if (guestCart.length === 0) return [];
      const productIds = guestCart.map(item => item.product_id);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);
      if (error) throw error;
      return data;
    },
    enabled: !user && guestCart.length > 0,
  });

  // Combine guest cart items with product data
  const guestCartItems = user ? [] : guestCart.map(item => ({
    ...item,
    id: `${item.product_id}-${item.selected_weight}`,
    products: guestProducts.find(p => p.id === item.product_id)
  })).filter(item => item.products);

  const cartItems = user ? dbCartItems : guestCartItems;

  const getItemPrice = (item: any) => {
    const product = item.products;
    const selectedWeight = item.selected_weight || "unit";
    
    if (product?.prices && typeof product.prices === 'object') {
      return product.prices[selectedWeight] || product.price || 0;
    }
    return product?.price || 0;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  const updateQuantity = async (itemId: string, productId: string, selectedWeight: string, newQuantity: number) => {
    if (!user) {
      // Guest cart - update localStorage
      updateGuestCartItem(productId, selectedWeight, newQuantity);
      queryClient.invalidateQueries({ queryKey: ["guest-cart-products"] });
      return;
    }

    // Authenticated user - update database
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeItem = async (itemId: string, productId: string, selectedWeight: string) => {
    if (!user) {
      // Guest cart - remove from localStorage
      removeFromGuestCart(productId, selectedWeight);
      toast.success("Item removed from cart");
      queryClient.invalidateQueries({ queryKey: ["guest-cart-products"] });
      return;
    }

    // Authenticated user - remove from database
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Item removed from cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/cart");
  };

  const handleViewCart = () => {
    onOpenChange(false);
    navigate("/cart");
  };

  const freeShippingThreshold = 100;
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">Shopping Cart</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground">
                Add some products to get started
              </p>
            </div>
            <Button variant="hero" onClick={() => onOpenChange(false)}>
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cartItems.map((item) => {
                const itemPrice = getItemPrice(item);
                const selectedWeight = item.selected_weight || "unit";
                
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.products?.image_url ? (
                        <img 
                          src={item.products.image_url} 
                          alt={item.products.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-3xl">🌿</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {item.products?.name}
                      </h4>
                      {selectedWeight !== "unit" && (
                        <p className="text-xs text-muted-foreground">
                          Weight: {selectedWeight}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        ${itemPrice.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.id, item.product_id, selectedWeight, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.product_id, selectedWeight, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto"
                          onClick={() => removeItem(item.id, item.product_id, selectedWeight)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 border-t pt-4">
              {/* Free Shipping Progress */}
              {subtotal < freeShippingThreshold ? (
                <div className="space-y-2 p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Free Shipping Progress
                    </span>
                    <span className="font-semibold">${amountToFreeShipping.toFixed(2)} to go</span>
                  </div>
                  <Progress value={shippingProgress} className="h-2" />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-primary">
                  <Truck className="h-5 w-5" />
                  <span className="font-semibold">You've unlocked FREE SHIPPING! 🎉</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Delivery fees calculated at checkout
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={handleViewCart}
                >
                  View Cart
                </Button>
                <Button 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Valid ID required at delivery • Must be 21+
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
