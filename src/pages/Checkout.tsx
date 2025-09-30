import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bitcoin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState("");
  const [borough, setBorough] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { data: cartItems = [] } = useQuery({
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );

  const calculateDeliveryFee = () => {
    if (!borough) return 0;
    let fee = 5; // Base fee
    if (borough === "manhattan") {
      fee += 5; // Manhattan surcharge
    }
    return fee;
  };

  const deliveryFee = calculateDeliveryFee();
  const total = subtotal + deliveryFee - promoDiscount;

  const handleApplyPromo = () => {
    const validCodes: Record<string, number> = {
      FIRST10: subtotal * 0.1,
      SAVE5: 5,
      WELCOME15: subtotal * 0.15,
    };

    const discount = validCodes[promoCode.toUpperCase()] || 0;
    if (discount > 0) {
      setPromoDiscount(discount);
      toast.success(`Promo code applied! You saved $${discount.toFixed(2)}`);
    } else {
      toast.error("Invalid promo code");
    }
  };

  const handlePlaceOrder = async () => {
    if (!address || !borough) {
      toast.error("Please enter a delivery address");
      return;
    }

    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          delivery_address: address,
          delivery_borough: borough,
          payment_method: paymentMethod,
          delivery_fee: deliveryFee,
          subtotal: subtotal,
          total_amount: total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products?.price || 0,
        product_name: item.products?.name || "",
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearError) throw clearError;

      toast.success("Order placed successfully!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate(`/order-confirmation?orderId=${order.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    1
                  </span>
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borough">Borough</Label>
                  <RadioGroup value={borough} onValueChange={setBorough}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="brooklyn" id="brooklyn" />
                      <Label htmlFor="brooklyn" className="cursor-pointer">Brooklyn</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="queens" id="queens" />
                      <Label htmlFor="queens" className="cursor-pointer">Queens</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manhattan" id="manhattan" />
                      <Label htmlFor="manhattan" className="cursor-pointer">Manhattan (+$5 surcharge)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    2
                  </span>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">Pay the courier when you receive your order</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="bitcoin" id="bitcoin" />
                    <Label htmlFor="bitcoin" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bitcoin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Bitcoin / USDC</div>
                        <div className="text-sm text-muted-foreground">We'll send payment instructions after order</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "bitcoin" && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-sm font-medium">Cryptocurrency Payment Instructions:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>After placing your order, you'll receive payment details</li>
                      <li>We accept Bitcoin (BTC) and USDC</li>
                      <li>Your order will be prepared once payment is confirmed</li>
                      <li>Confirmation typically takes 10-30 minutes</li>
                    </ul>
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 Please have exact change ready. Our couriers will verify your ID (must be 21+) before accepting payment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.products?.name} x{item.quantity}
                      </span>
                      <span>
                        ${((item.products?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  {borough === "manhattan" && (
                    <div className="text-xs text-muted-foreground">
                      Includes $5 Manhattan surcharge
                    </div>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Promo Discount</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyPromo}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!address || !borough || loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  ID verification required at delivery • Must be 21+
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
