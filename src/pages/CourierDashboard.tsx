import { useState, useEffect } from "react";
import { useCourier } from "@/contexts/CourierContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package, MapPin, Clock, Navigation, Power, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const CourierDashboard = () => {
  const { courier, signOut, toggleOnlineStatus, updateLocation } = useCourier();
  const queryClient = useQueryClient();
  const [trackingLocation, setTrackingLocation] = useState(false);

  useEffect(() => {
    let watchId: number;

    if (trackingLocation && courier) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Location error:", error);
          toast({ title: "Location Error", description: "Failed to get location", variant: "destructive" });
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [trackingLocation, courier, updateLocation]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["courier-orders", courier?.id],
    queryFn: async () => {
      if (!courier) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .or(`courier_id.eq.${courier.id},status.in.(pending)`)
        .in("status", ["pending", "confirmed", "out_for_delivery"])
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courier,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, courierId }: { orderId: string; status: string; courierId?: string }) => {
      const updates: any = { status };
      if (courierId) {
        updates.courier_id = courierId;
      }

      const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
      if (error) throw error;

      // Log tracking update
      await supabase.from("order_tracking").insert({
        order_id: orderId,
        status,
        message: `Order ${status.replace("_", " ")}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courier-orders"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "out_for_delivery":
        return "default";
      case "delivered":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "confirmed":
        return "text-blue-600";
      case "out_for_delivery":
        return "text-purple-600";
      case "delivered":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (!courier) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Driver Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {courier.full_name}</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Status Controls */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="online-status">Online Status</Label>
                <p className="text-sm text-muted-foreground">
                  {courier.is_online ? "Available for orders" : "Offline"}
                </p>
              </div>
              <Switch
                id="online-status"
                checked={courier.is_online}
                onCheckedChange={toggleOnlineStatus}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="location-tracking">Location Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  {trackingLocation ? "Sharing location" : "Not sharing"}
                </p>
              </div>
              <Switch
                id="location-tracking"
                checked={trackingLocation}
                onCheckedChange={setTrackingLocation}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <Label>Active Orders</Label>
              <p className="text-2xl font-bold">{orders?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {ordersLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)} className={getStatusColor(order.status)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Delivery Address</p>
                          <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                          <p className="text-sm text-muted-foreground">{order.delivery_borough}</p>
                        </div>
                      </div>


                      {order.scheduled_delivery_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            Scheduled: {new Date(order.scheduled_delivery_time).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Items</p>
                          {order.order_items.map((item: any) => (
                            <p key={item.id} className="text-sm text-muted-foreground">
                              {item.product_name} x{item.quantity}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">
                          Total: <span className="text-lg">${order.total_amount}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">Payment: {order.payment_method}</p>
                      </div>
                    </div>
                  </div>

                  {order.delivery_notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Delivery Notes</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t flex gap-2">
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateOrderStatus.mutate({
                            orderId: order.id,
                            status: "confirmed",
                            courierId: courier.id,
                          })
                        }
                      >
                        Accept Delivery
                      </Button>
                    )}

                    {order.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: "out_for_delivery" })}
                      >
                        Start Delivery
                      </Button>
                    )}

                    {order.status === "out_for_delivery" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: "delivered" })}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {orders?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No active orders at the moment</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CourierDashboard;
