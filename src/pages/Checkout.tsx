import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Bitcoin, DollarSign, Calendar as CalendarIcon, Clock, Zap, AlertTriangle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import MapboxAddressAutocomplete from "@/components/MapboxAddressAutocomplete";
import CheckoutUpsells from "@/components/CheckoutUpsells";
import CheckoutProgress from "@/components/CheckoutProgress";
import GuestCheckoutOption from "@/components/GuestCheckoutOption";
import HighValueCartNotice from "@/components/HighValueCartNotice";
import ExpressCheckoutButtons from "@/components/ExpressCheckoutButtons";
import SignUpIncentivePopup from "@/components/SignUpIncentivePopup";
import CheckoutReminderBanner from "@/components/CheckoutReminderBanner";
import LowCartValueUpsell from "@/components/LowCartValueUpsell";
import { useCartValueTrigger } from "@/hooks/useCartValueTrigger";
import { getNeighborhoodFromZip, getRiskColor, getRiskLabel, getRiskTextColor } from "@/utils/neighborhoods";
import { analytics } from "@/utils/analytics";

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
  const [deliveryType, setDeliveryType] = useState<"express" | "standard" | "economy">("standard");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [detectedZipcode, setDetectedZipcode] = useState("");
  
  // Guest checkout fields
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showSignUpPopup, setShowSignUpPopup] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const timeSlots = [
    { value: "09:00-12:00", label: "Morning", time: "9:00 AM - 12:00 PM", icon: "🌅" },
    { value: "12:00-15:00", label: "Lunch", time: "12:00 PM - 3:00 PM", icon: "☀️" },
    { value: "15:00-18:00", label: "Afternoon", time: "3:00 PM - 6:00 PM", icon: "🌤️" },
    { value: "18:00-21:00", label: "Evening", time: "6:00 PM - 9:00 PM", icon: "🌆" },
  ];

  const getScheduledDateTime = () => {
    if (deliveryType !== "economy" || !selectedDate || !selectedTimeSlot) {
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

  // Check if user should see signup popup (must be after subtotal calculation)
  useEffect(() => {
    const popupSeen = localStorage.getItem('signup_popup_seen');
    const popupDeclined = localStorage.getItem('signup_popup_declined');
    
    if (!user && !popupSeen && !popupDeclined && subtotal >= 25) {
      // Show popup after a short delay to not be intrusive
      const timer = setTimeout(() => {
        if (isCheckingOut) {
          setShowSignUpPopup(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, subtotal, isCheckingOut]);

  // Fetch courier availability for dynamic pricing
  const { data: courierAvailability } = useQuery({
    queryKey: ["courier-availability"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couriers")
        .select("id")
        .eq("is_online", true)
        .eq("is_active", true);
      
      if (error) throw error;
      return data?.length || 0;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const calculateDeliveryFee = () => {
    if (!borough) return 0;
    
    // Free delivery (including express) for orders over $500
    if (subtotal >= 500) return 0;
    
    // Free standard/economy delivery for orders over $100 (but NOT express)
    if (subtotal >= 100 && deliveryType !== "express") return 0;
    
    let baseFee = 5;
    
    // Dynamic pricing based on courier availability
    const totalCouriers = courierAvailability || 0;
    let demandMultiplier = 1;
    
    if (totalCouriers < 3) {
      demandMultiplier = 2; // High demand - double the fee
    } else if (totalCouriers < 5) {
      demandMultiplier = 1.5; // Medium demand - 50% increase
    }
    
    // Borough-specific pricing
    if (borough === "manhattan") {
      baseFee += 5; // Manhattan surcharge
    } else if (borough === "queens") {
      baseFee += 2; // Queens slight surcharge
    }
    
    // Delivery speed multiplier
    if (deliveryType === "express") {
      baseFee = baseFee * 1.3; // +30% for express (45 min or under)
    }
    // standard and economy use base fee
    
    return Math.round(baseFee * demandMultiplier);
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
    
    // Auto-extract ZIP code from address
    const zipMatch = newAddress.match(/\b\d{5}\b/);
    if (zipMatch) {
      setDetectedZipcode(zipMatch[0]);
    }
    
    if (detectedBorough) {
      setBorough(detectedBorough);
      const boroughNames: Record<string, string> = {
        brooklyn: "Brooklyn",
        queens: "Queens",
        manhattan: "Manhattan"
      };
      toast.success(`✓ ${boroughNames[detectedBorough]} detected - Delivery fee updated`);
    }
  };

  const handleSignUpFromPopup = async (email: string) => {
    setGuestEmail(email);
    localStorage.setItem('signup_popup_seen', 'true');
    setShowSignUpPopup(false);
    setHasSeenPopup(true);
    
    // Apply discount
    const discount = subtotal * 0.1;
    setPromoCode('SIGNUP10');
    setPromoDiscount(discount);
    
    // Track signup event
    analytics.trackPopupSignup(email, subtotal, discount + (subtotal >= 100 ? 0 : 5.99));
    
    toast.success(`✓ Discount applied! You're saving $${discount.toFixed(2)}`);
  };

  const handleContinueAsGuest = () => {
    localStorage.setItem('signup_popup_declined', 'true');
    setShowSignUpPopup(false);
    setHasSeenPopup(true);
    
    // Track guest checkout decision
    const savings = subtotal * 0.1 + (subtotal >= 100 ? 0 : 5.99);
    analytics.trackPopupGuestCheckout(subtotal, savings);
  };

  const handlePlaceOrder = async () => {
    // Track checkout started
    analytics.trackCheckoutStarted(subtotal, cartItems.length, !user);
    
    // Show popup on first checkout attempt if not seen
    if (!user && !hasSeenPopup && subtotal >= 25) {
      const popupSeen = localStorage.getItem('signup_popup_seen');
      const popupDeclined = localStorage.getItem('signup_popup_declined');
      
      if (!popupSeen && !popupDeclined) {
        setIsCheckingOut(true);
        setShowSignUpPopup(true);
        return;
      }
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/");
      return;
    }

    if (!address || !borough) {
      toast.error("Please enter a delivery address and select borough");
      return;
    }

    // Guest checkout validation
    if (!user) {
      if (!guestName.trim()) {
        toast.error("Please enter your name");
        return;
      }
      if (!guestPhone.trim()) {
        toast.error("Please enter your phone number");
        return;
      }
      if (!guestEmail.trim() || !guestEmail.includes('@')) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    if (deliveryType === "economy" && (!selectedDate || !selectedTimeSlot)) {
      toast.error("Please select a delivery date and time slot");
      return;
    }

    setLoading(true);

    try {
      // First create/update address record if we have coordinates (only for logged-in users)
      let addressId = null;
      let dropoffLat = addressLat;
      let dropoffLng = addressLng;
      
      if (user && addressLat && addressLng) {
        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            street: address,
            borough: borough,
            city: "New York",
            state: "NY",
            zip_code: "00000",
            latitude: addressLat,
            longitude: addressLng,
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

      // Get merchant data for pickup location (use first product's merchant)
      const firstItem = cartItems[0];
      const { data: product } = await supabase
        .from("products")
        .select("merchant_id, merchants(id, business_name, address, latitude, longitude)")
        .eq("id", firstItem.product_id)
        .single();

      const merchant = product?.merchants;
      const pickupLat = merchant?.latitude;
      const pickupLng = merchant?.longitude;

      // Extract ZIP code from address or use a placeholder
      const zipMatch = address.match(/\b\d{5}\b/);
      const zipcode = zipMatch ? zipMatch[0] : "00000";

      // Create order with all location data and guest info if applicable
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          merchant_id: merchant?.id,
          delivery_address: address,
          delivery_borough: borough,
          address_id: addressId,
          payment_method: paymentMethod,
          delivery_fee: deliveryFee,
          subtotal: subtotal,
          total_amount: total,
          scheduled_delivery_time: getScheduledDateTime(),
          delivery_notes: notes || null,
          status: 'pending',
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          dropoff_lat: dropoffLat,
          dropoff_lng: dropoffLng,
          customer_name: user ? null : guestName,
          customer_phone: user ? null : guestPhone,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: getItemPrice(item),
        product_name: item.products?.name || "",
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart (only if user is authenticated)
      if (user) {
        const { error: clearError } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id);

        if (clearError) throw clearError;
      }

      toast.success("Order placed successfully!");
      
      // Track order completion
      analytics.trackOrderCompleted(total, promoDiscount, !user);
      
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
      <SignUpIncentivePopup
        cartTotal={subtotal}
        onSignUp={handleSignUpFromPopup}
        onContinueAsGuest={handleContinueAsGuest}
        onClose={() => setShowSignUpPopup(false)}
        isVisible={showSignUpPopup}
      />
      <div className="min-h-screen bg-background py-4 md:py-8 pb-24 md:pb-8">
        <div className="container max-w-4xl mx-auto px-4 md:px-6 w-full overflow-x-hidden">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Checkout</h1>
        
        <CheckoutProgress currentStep={2} />

        {/* Low cart value upsell - encourage adding more for signup benefits */}
        {!user && subtotal < 25 && (
          <LowCartValueUpsell currentTotal={subtotal} targetAmount={25} />
        )}

        {/* Checkout reminder banner - subtle reminder if guest hasn't signed up */}
        {!user && subtotal >= 25 && !hasSeenPopup && !promoDiscount && (
          <CheckoutReminderBanner 
            savings={subtotal * 0.1 + (subtotal >= 100 ? 0 : 5.99)}
            onSignUpClick={() => setShowSignUpPopup(true)}
          />
        )}

        {/* Subtle discount reminder if user got discount from popup */}
        {!user && promoDiscount > 0 && hasSeenPopup && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background mb-4 md:mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  🎉
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base md:text-lg">You're saving ${promoDiscount.toFixed(2)}!</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Your 10% discount has been applied
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full">
          <div className="lg:col-span-2 space-y-4 md:space-y-6 w-full min-w-0">
            {/* Guest Checkout Info */}
            {!user && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm">
                      ℹ️
                    </span>
                    <span className="text-sm md:text-base">Your Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="space-y-2 w-full">
                    <Label htmlFor="guest-name" className="text-sm">Full Name *</Label>
                    <Input
                      id="guest-name"
                      name="name"
                      autoComplete="name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-12 md:h-14 text-base touch-target"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-phone" className="text-sm">Phone Number *</Label>
                    <Input
                      id="guest-phone"
                      name="tel"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="h-12 md:h-14 text-base touch-target"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      For delivery updates
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-email" className="text-sm">Email Address *</Label>
                    <Input
                      id="guest-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="h-12 md:h-14 text-base touch-target"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Order confirmation sent here
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1: Delivery Address */}
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm">
                    1
                  </span>
                  <span className="text-sm md:text-base">Delivery Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <MapboxAddressAutocomplete
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Start typing your NYC address..."
                  className="mb-4"
                />
                
                <div className="space-y-3">
                  <Label htmlFor="borough">
                    Select Borough {borough && <span className="text-primary font-semibold">• {borough.charAt(0).toUpperCase() + borough.slice(1)}</span>}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => !addressLat ? setBorough("brooklyn") : null}
                      disabled={addressLat && borough !== "brooklyn"}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        borough === "brooklyn"
                          ? "border-primary bg-primary/10 shadow-lg"
                          : addressLat && borough !== "brooklyn"
                          ? "border-border/30 opacity-40 cursor-not-allowed"
                          : "border-border hover:border-primary/50 hover:scale-[1.02]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🌉</span>
                        {borough === "brooklyn" && (
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</span>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1">Brooklyn</h4>
                      <p className="text-xs text-muted-foreground">Base delivery fee</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => !addressLat ? setBorough("queens") : null}
                      disabled={addressLat && borough !== "queens"}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        borough === "queens"
                          ? "border-primary bg-primary/10 shadow-lg"
                          : addressLat && borough !== "queens"
                          ? "border-border/30 opacity-40 cursor-not-allowed"
                          : "border-border hover:border-primary/50 hover:scale-[1.02]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">👑</span>
                        {borough === "queens" && (
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</span>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1">Queens</h4>
                      <p className="text-xs text-muted-foreground">+$2 delivery fee</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => !addressLat ? setBorough("manhattan") : null}
                      disabled={addressLat && borough !== "manhattan"}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        borough === "manhattan"
                          ? "border-primary bg-primary/10 shadow-lg"
                          : addressLat && borough !== "manhattan"
                          ? "border-border/30 opacity-40 cursor-not-allowed"
                          : "border-border hover:border-primary/50 hover:scale-[1.02]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🏙️</span>
                        {borough === "manhattan" && (
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</span>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1">Manhattan</h4>
                      <p className="text-xs text-muted-foreground">+$5 delivery fee</p>
                    </button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      💡 Address auto-detection available above
                    </p>
                    {courierAvailability !== undefined && courierAvailability < 5 && (
                      <p className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                        ⚡ High demand: {courierAvailability} courier{courierAvailability !== 1 ? 's' : ''} available • Delivery fees adjusted
                      </p>
                    )}
                  </div>
                </div>

                {/* Free Delivery Progress */}
                {subtotal < 100 && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-primary">🎉 Free Delivery Progress</span>
                      <span className="font-semibold text-primary">${(100 - subtotal).toFixed(2)} away!</span>
                    </div>
                    <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add ${(100 - subtotal).toFixed(2)} more to qualify for free standard delivery!
                    </p>
                  </div>
                )}

                {subtotal >= 100 && subtotal < 500 && (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-primary flex items-center gap-2">
                      ✓ Free standard delivery unlocked! 🎉
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add ${(500 - subtotal).toFixed(2)} more for FREE express delivery too!
                    </p>
                  </div>
                )}

                {subtotal >= 500 && (
                  <div className="p-4 bg-gradient-to-r from-primary to-primary/80 border border-primary rounded-lg">
                    <p className="text-sm font-bold text-primary-foreground flex items-center gap-2">
                      ⚡ FREE EXPRESS DELIVERY! 🎉
                    </p>
                    <p className="text-xs text-primary-foreground/80">
                      All delivery speeds are free on your order!
                    </p>
                  </div>
                )}

                {/* Delivery Timing */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Delivery Speed</Label>
                    {deliveryType && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {deliveryType === "express" && "~25-45 min"}
                        {deliveryType === "standard" && "~45-90 min"}
                        {deliveryType === "economy" && "Scheduled"}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("express")}
                      className={cn(
                        "w-full flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all",
                        deliveryType === "express" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold flex items-center gap-2">
                            Express
                            <span className="text-xs font-normal text-primary">~25-45 min</span>
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {subtotal >= 500 ? 'FREE!' : subtotal >= 100 ? '+30% delivery fee' : '+30% delivery fee'}
                          </p>
                        </div>
                      </div>
                      {deliveryType === "express" && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("standard")}
                      className={cn(
                        "w-full flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all",
                        deliveryType === "standard" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold flex items-center gap-2">
                            Standard
                            <span className="text-xs font-normal text-primary">~45-90 min</span>
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {subtotal >= 100 ? 'FREE!' : 'Normal delivery fee'}
                          </p>
                        </div>
                      </div>
                      {deliveryType === "standard" && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("economy")}
                      className={cn(
                        "w-full flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all",
                        deliveryType === "economy" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CalendarIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold flex items-center gap-2">
                            Schedule for Later
                            <span className="text-xs font-normal text-primary">Pick time</span>
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {subtotal >= 100 ? 'FREE!' : 'Choose date & time'}
                          </p>
                        </div>
                      </div>
                      {deliveryType === "economy" && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</span>
                      )}
                    </button>
                  </div>

                  {deliveryType === "economy" && (
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="Apt #, building instructions, buzzer code"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {detectedZipcode.length === 5 && (() => {
                  const neighborhood = getNeighborhoodFromZip(detectedZipcode);
                  if (!neighborhood) return null;
                  
                  return (
                    <Card className="border-2 animate-in fade-in-50 duration-300">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 ${getRiskColor(neighborhood.risk)} rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0`}>
                            <div className="text-2xl font-bold">{neighborhood.risk}</div>
                            <div className="text-xs">/10</div>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-lg">{neighborhood.name}</div>
                            <div className="text-sm text-muted-foreground">{neighborhood.borough}</div>
                            <div className={`text-sm font-semibold mt-1 flex items-center gap-2 ${getRiskTextColor(neighborhood.risk)}`}>
                              <AlertTriangle className="w-4 h-4" />
                              {getRiskLabel(neighborhood.risk)} Delivery Zone
                            </div>
                          </div>
                          {neighborhood.risk >= 7 && (
                            <div className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg">
                              <div className="font-bold">High Risk Area</div>
                              <div>Extra verification required</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
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
              <CardContent className="space-y-6">
                {/* Express Checkout Options */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Express Checkout</p>
                  <ExpressCheckoutButtons />
                </div>

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
                      💡 Please have exact change ready. Our couriers will verify your ID (must be 21+) before completing delivery.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upsells - Frequently Bought Together */}
            <CheckoutUpsells cartItems={cartItems} />
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const itemPrice = getItemPrice(item);
                    const selectedWeight = item.selected_weight || "unit";
                    const coaUrl = item.products?.coa_url || item.products?.coa_pdf_url || item.products?.lab_results_url;
                    
                    return (
                      <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">
                            {item.products?.name} x{item.quantity}
                            {selectedWeight !== "unit" && (
                              <span className="text-muted-foreground ml-1">
                                ({selectedWeight})
                              </span>
                            )}
                          </span>
                          <span className="font-semibold">
                            ${(itemPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        {coaUrl && (
                          <a 
                            href={coaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            View COA
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      Delivery Fee
                      {subtotal >= 100 ? (
                        <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded font-semibold">
                          FREE
                        </span>
                      ) : courierAvailability !== undefined && courierAvailability < 5 ? (
                        <span className="text-xs px-1.5 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded">
                          High Demand
                        </span>
                      ) : null}
                    </span>
                    <span className={cn(
                      "font-semibold",
                      subtotal >= 100 && "text-primary line-through"
                    )}>
                      ${deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  {borough && subtotal < 100 && (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {deliveryType === "express" && (
                        <p className="text-primary">• Express delivery: +30% fee</p>
                      )}
                      {borough === "manhattan" && (
                        <p>• Manhattan: +$5 base surcharge</p>
                      )}
                      {borough === "queens" && (
                        <p>• Queens: +$2 base surcharge</p>
                      )}
                      {borough === "brooklyn" && (
                        <p>• Brooklyn: Base delivery fee</p>
                      )}
                      {courierAvailability !== undefined && courierAvailability < 5 && (
                        <p className="text-orange-600 dark:text-orange-400">
                          • High demand: {courierAvailability < 3 ? '2x' : '1.5x'} multiplier ({courierAvailability} courier{courierAvailability !== 1 ? 's' : ''} available)
                        </p>
                      )}
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
                  className="w-full h-14 text-lg"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!address || !borough || loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>

                {/* Prominent 21+ Age Verification Notice */}
                <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <p className="text-sm text-center font-semibold mb-1">
                    🔞 Age Verification Required
                  </p>
                  <p className="text-xs text-center text-muted-foreground">
                    Must be 21+ • Valid ID required at delivery
                  </p>
                </div>
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
