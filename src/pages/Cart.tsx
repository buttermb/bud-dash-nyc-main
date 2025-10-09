import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Minus, Plus, Trash2, ShoppingBag, Truck, ArrowRight } from "lucide-react";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useAuth } from "@/contexts/AuthContext";

const Cart = () => {
  const { user } = useAuth();
  const { guestCart, updateGuestCartItem, removeFromGuestCart } = useGuestCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch authenticated user's cart
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
    id: `${item.product_id}-${item.selected_weight}`, // Unique key for rendering
    products: guestProducts.find(p => p.id === item.product_id)
  })).filter(item => item.products); // Only show items with loaded products

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
    if (newQuantity < 1) return;
    
    try {
      if (!user) {
        // Guest cart
        updateGuestCartItem(productId, selectedWeight, newQuantity);
        queryClient.invalidateQueries({ queryKey: ["guest-cart-products"] });
        toast.success("Cart updated");
        return;
      }

      // Authenticated user
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeItem = async (itemId: string, productId: string, selectedWeight: string) => {
    try {
      if (!user) {
        // Guest cart
        removeFromGuestCart(productId, selectedWeight);
        queryClient.invalidateQueries({ queryKey: ["guest-cart-products"] });
        toast.success("Item removed");
        return;
      }

      // Authenticated user
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
    navigate("/checkout");
  };

  const freeShippingThreshold = 100;
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                  <p className="text-muted-foreground">
                    Add some products to get started
                  </p>
                </div>
                <Button variant="hero" size="lg" onClick={() => navigate("/")}>
                  Browse Products
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const itemPrice = getItemPrice(item);
                  const selectedWeight = item.selected_weight || "unit";
                  
                  return (
                    <Card key={item.id} className="p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.products?.image_url ? (
                            <img 
                              src={item.products.image_url} 
                              alt={item.products.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-5xl">🌿</span>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-xl font-bold">
                              {item.products?.name}
                            </h3>
                            {selectedWeight !== "unit" && (
                              <Badge variant="outline" className="mt-2">
                                Weight: {selectedWeight}
                              </Badge>
                            )}
                            <p className="text-lg text-muted-foreground mt-1">
                              ${itemPrice.toFixed(2)} each
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 md:h-11 md:w-11"
                                onClick={() =>
                                  updateQuantity(item.id, item.product_id, selectedWeight, Math.max(1, item.quantity - 1))
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-lg font-semibold w-12 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 md:h-11 md:w-11"
                                onClick={() => updateQuantity(item.id, item.product_id, selectedWeight, item.quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <p className="text-2xl font-bold">
                                ${(itemPrice * item.quantity).toFixed(2)}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id, item.product_id, selectedWeight)}
                              >
                                <Trash2 className="w-5 h-5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-24 space-y-6">
                  <h2 className="text-2xl font-bold">Order Summary</h2>
                  
                  <Separator />

                  {/* Free Shipping Progress */}
                  {subtotal < freeShippingThreshold ? (
                    <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Free Shipping Progress
                        </span>
                        <span className="font-semibold">
                          ${amountToFreeShipping.toFixed(2)} to go
                        </span>
                      </div>
                      <Progress value={shippingProgress} className="h-2" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg text-primary">
                      <Truck className="h-5 w-5" />
                      <span className="font-semibold">You've unlocked FREE SHIPPING! 🎉</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="font-semibold">
                        {subtotal >= freeShippingThreshold ? (
                          <span className="text-primary">FREE</span>
                        ) : (
                          "Calculated at checkout"
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <Button 
                    variant="hero" 
                    className="w-full text-lg h-14" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <div className="space-y-2 text-sm text-muted-foreground text-center">
                    <p>✓ Valid ID required at delivery</p>
                    <p>✓ Must be 21+ years old</p>
                    <p>✓ Secure payment at checkout</p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
