import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Package, Clock, CheckCircle, Navigation as NavigationIcon, RefreshCw, Star } from "lucide-react";
import { CustomerLocationSharing } from "@/components/CustomerLocationSharing";
import { toast } from "sonner";
import { formatDistance } from "@/utils/geofenceHelper";

interface OrderTracking {
  id: string;
  order_number: string;
  tracking_code: string;
  status: string;
  created_at: string;
  estimated_delivery: string | null;
  delivered_at: string | null;
  delivery_address: string;
  delivery_borough: string;
  total_amount: number;
  eta_minutes: number | null;
  eta_updated_at: string | null;
  merchant: {
    business_name: string;
    address: string;
  };
  courier: {
    full_name: string;
    phone: string;
    vehicle_type: string;
    vehicle_make: string;
    vehicle_model: string;
    current_lat: number;
    current_lng: number;
    rating: number;
  } | null;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image_url: string;
    };
  }>;
}

const STATUS_STEPS = [
  { key: "pending", label: "Confirmed", icon: "✓", color: "bg-green-500" },
  { key: "accepted", label: "Driver Assigned", icon: "🚗", color: "bg-blue-500" },
  { key: "preparing", label: "Preparing", icon: "📦", color: "bg-yellow-500" },
  { key: "out_for_delivery", label: "On The Way", icon: "🚚", color: "bg-purple-500" },
  { key: "delivered", label: "Delivered", icon: "✅", color: "bg-teal-500" },
];

export default function CustomerTrackingPage() {
  const { code } = useParams();
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase.rpc("get_order_by_tracking_code", {
        code: code,
      });

      if (error) throw error;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setOrder(data as unknown as OrderTracking);
        
        // Calculate distance if courier location available
        const courierData = (data as any).courier;
        if (courierData?.current_lat && courierData?.current_lng) {
          // This would normally use customer location, but for now just showing courier is moving
          // In production, you'd get customer's lat/lng from the order or their shared location
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Order not found");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchOrder();
      
      // Set up auto-refresh every 10 seconds
      const interval = setInterval(fetchOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [code]);

  // Real-time subscription
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  const getCurrentStepIndex = () => {
    return STATUS_STEPS.findIndex((step) => step.key === order?.status);
  };

  const getEstimatedTime = () => {
    if (!order) return null;
    
    if (order.eta_minutes) {
      return `${order.eta_minutes} minutes`;
    }
    
    if (order.estimated_delivery) {
      const eta = new Date(order.estimated_delivery);
      const now = new Date();
      const diff = Math.floor((eta.getTime() - now.getTime()) / 60000);
      if (diff > 0) {
        return `${diff} minutes`;
      }
    }
    
    return "Calculating...";
  };

  const getStatusMessage = () => {
    if (!order) return "";
    
    switch (order.status) {
      case "pending":
        return "We're finding you a driver...";
      case "accepted":
        return order.courier 
          ? `${order.courier.full_name} is preparing to pick up your order`
          : "Driver assigned";
      case "preparing":
        return "Your order is being prepared";
      case "out_for_delivery":
        return order.courier
          ? `${order.courier.full_name} is heading to you!`
          : "Your order is on the way";
      case "delivered":
        return "Delivered! Enjoy your order.";
      case "cancelled":
        return "This order was cancelled";
      default:
        return "Processing your order...";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground">
            We couldn't find an order with tracking code: {code}
          </p>
        </Card>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order Tracking</h1>
              <p className="text-sm opacity-90">#{order.order_number}</p>
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
        {/* Status Progress */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">
                  {STATUS_STEPS[currentStep]?.icon} {STATUS_STEPS[currentStep]?.label}
                </h2>
                {!isDelivered && !isCancelled && order.eta_minutes && (
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    <Clock className="h-4 w-4 mr-2" />
                    ETA: {order.eta_minutes} min
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{getStatusMessage()}</p>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="flex justify-between mb-2">
                {STATUS_STEPS.map((step, idx) => (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1 transition-all ${
                        idx <= currentStep
                          ? step.color + " text-white shadow-lg scale-110"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-xs text-center hidden sm:block">{step.label}</span>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Courier Info */}
        {order.courier && !isDelivered && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <NavigationIcon className="h-5 w-5 mr-2" />
              Your Driver
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <p className="font-semibold">{order.courier.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.courier.vehicle_make} {order.courier.vehicle_model}
                  </p>
                  <div className="flex items-center text-sm text-yellow-600">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    {order.courier.rating.toFixed(1)}
                  </div>
                </div>
              </div>
              <Button asChild>
                <a href={`tel:${order.courier.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Driver
                </a>
              </Button>
            </div>
          </Card>
        )}

        {/* Delivery Address */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Delivery Address
          </h3>
          <p className="text-sm">{order.delivery_address}</p>
          <p className="text-sm text-muted-foreground">{order.delivery_borough}</p>
        </Card>

        {/* Order Details */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Order Details
          </h3>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Customer Location Sharing */}
        {!isDelivered && !isCancelled && order.status === "out_for_delivery" && (
          <CustomerLocationSharing orderId={order.id} />
        )}

        {/* Rate Driver (after delivery) */}
        {isDelivered && order.courier && (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <h3 className="font-semibold mb-4 text-center">How was your experience?</h3>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className="w-12 h-12 rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                >
                  <Star className="h-6 w-6" />
                </button>
              ))}
            </div>
            <Button className="w-full">Submit Rating</Button>
          </Card>
        )}

        {/* Help */}
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">Need help with your order?</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline">Contact Support</Button>
            {order.courier && (
              <Button asChild>
                <a href={`tel:${order.courier.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Driver
                </a>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}