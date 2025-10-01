import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Bitcoin, DollarSign, Calendar as CalendarIcon, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import MapboxAddressAutocomplete from "@/components/MapboxAddressAutocomplete";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState("");
  const [addressLat, setAddressLat] = useState<number>();
  const [addressLng, setAddressLng] = useState<number>();
  const [borough, setBorough] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"asap" | "scheduled">("asap");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [notes, setNotes] = useState("");

  const timeSlots = [
    { value: "09:00-12:00", label: "Morning", time: "9:00 AM - 12:00 PM", icon: "🌅" },
    { value: "12:00-15:00", label: "Lunch", time: "12:00 PM - 3:00 PM", icon: "☀️" },
    { value: "15:00-18:00", label: "Afternoon", time: "3:00 PM - 6:00 PM", icon: "🌤️" },
    { value: "18:00-21:00", label: "Evening", time: "6:00 PM - 9:00 PM", icon: "🌆" },
  ];

  const getScheduledDateTime = () => {
    if (deliveryType === "asap" || !selectedDate || !selectedTimeSlot) {
      return null;
    }
    const [startTime] = selectedTimeSlot.split("-");
    const [hours, minutes] = startTime.split(":");
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dateTime.toISOString();
  };

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

  const handleAddressChange = (newAddress: string, lat?: number, lng?: number, detectedBorough?: string) => {
    setAddress(newAddress);
    if (lat) setAddressLat(lat);
    if (lng) setAddressLng(lng);
    if (detectedBorough) setBorough(detectedBorough);
  };

  const handlePlaceOrder = async () => {
    if (!address || !borough) {
      toast.error("Please enter a delivery address and select borough");
      return;
    }

    setLoading(true);

    try {
      // First create/update address record if we have coordinates
      let addressId = null;
      if (addressLat && addressLng) {
        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            street: address,
            borough: borough,
            city: "New York",
            state: "NY",
            zip_code: "00000", // Will be updated later
            lat: addressLat,
            lng: addressLng,
            is_default: false,
          })
          .select()
          .single();

        if (addressError) {
          console.error("Address creation error:", addressError);
        } else {
          addressId = addressData.id;
        }
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          delivery_address: address,
          delivery_borough: borough,
          address_id: addressId,
          payment_method: paymentMethod,
          delivery_fee: deliveryFee,
          subtotal: subtotal,
          total_amount: total,
          scheduled_delivery_time: getScheduledDateTime(),
          delivery_notes: notes || null,
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
                <MapboxAddressAutocomplete
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Start typing your NYC address..."
                  className="mb-4"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="borough">
                    Borough {borough && <span className="text-primary">({borough})</span>}
                  </Label>
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
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bronx" id="bronx" />
                      <Label htmlFor="bronx" className="cursor-pointer">Bronx</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="staten_island" id="staten_island" />
                      <Label htmlFor="staten_island" className="cursor-pointer">Staten Island</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    💡 Select your address above to auto-detect borough
                  </p>
                </div>

                {/* Delivery Timing */}
                <div className="space-y-4">
                  <Label>Delivery Time</Label>
                  <RadioGroup value={deliveryType} onValueChange={(v: any) => setDeliveryType(v)}>
                    <div 
                      className={cn(
                        "flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                        deliveryType === "asap" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setDeliveryType("asap")}
                    >
                      <RadioGroupItem value="asap" id="asap" />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Label htmlFor="asap" className="font-semibold cursor-pointer">
                            ASAP Delivery
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            We'll deliver within 2 hours
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={cn(
                        "flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                        deliveryType === "scheduled" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setDeliveryType("scheduled")}
                    >
                      <RadioGroupItem value="scheduled" id="scheduled" />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Label htmlFor="scheduled" className="font-semibold cursor-pointer">
                            Schedule for Later
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Choose your preferred date and time
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {deliveryType === "scheduled" && (
                    <div className="space-y-4 pt-2 animate-in fade-in-50 duration-300">
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <Label>Select Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date() || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                          Available up to 7 days in advance
                        </p>
                      </div>

                      {/* Time Slot Selection */}
                      {selectedDate && (
                        <div className="space-y-2 animate-in fade-in-50 duration-300">
                          <Label>Select Time Slot</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((slot) => (
                              <Button
                                key={slot.value}
                                type="button"
                                variant={selectedTimeSlot === slot.value ? "default" : "outline"}
                                className={cn(
                                  "h-auto py-3 flex-col items-start gap-1 transition-all",
                                  selectedTimeSlot === slot.value && "ring-2 ring-primary ring-offset-2"
                                )}
                                onClick={() => setSelectedTimeSlot(slot.value)}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <span className="text-lg">{slot.icon}</span>
                                  <span className="font-semibold">{slot.label}</span>
                                </div>
                                <span className="text-xs opacity-80">{slot.time}</span>
                              </Button>
                            ))}
                          </div>
                          {selectedTimeSlot && (
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <p className="text-sm font-medium text-primary">
                                📅 Scheduled for {format(selectedDate, "EEEE, MMMM d")} • {timeSlots.find(s => s.value === selectedTimeSlot)?.time}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Apartment number, building instructions, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
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
