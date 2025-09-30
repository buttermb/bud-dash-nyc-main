import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, ChefHat, Truck, Package, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const statusSteps = [
  { key: "pending", label: "Pending", icon: Clock, color: "yellow" },
  { key: "accepted", label: "Accepted by Shop", icon: CheckCircle, color: "blue" },
  { key: "preparing", label: "Preparing", icon: ChefHat, color: "blue" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck, color: "purple" },
  { key: "delivered", label: "Delivered", icon: Package, color: "green" },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    fetchOrderDetails();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      setOrder(orderData);
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error loading order",
        description: "Could not load order details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (order.status !== "pending") {
      toast({
        title: "Cannot cancel order",
        description: "Order can only be cancelled while pending.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });

      setOrder({ ...order, status: "cancelled" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Failed to cancel order",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === order?.status) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-4">We couldn't find this order.</p>
              <Button onClick={() => navigate("/")}>Return to Shop</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="relative flex items-center gap-4">
                      <div
                        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 ${
                          isCompleted
                            ? "bg-primary border-primary"
                            : "bg-background border-border"
                        } ${isCurrent ? "animate-pulse" : ""}`}
                      >
                        <Icon className={`h-6 w-6 ${isCompleted ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-muted-foreground">Current status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge>{order.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-semibold">{order.delivery_address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold capitalize">{order.payment_method}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Items Ordered</h4>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${Number(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${Number(order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
            Continue Shopping
          </Button>
          {order.status === "pending" && (
            <Button onClick={handleCancelOrder} variant="destructive" className="flex-1">
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
