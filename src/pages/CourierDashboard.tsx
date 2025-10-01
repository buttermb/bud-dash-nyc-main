import { useState, useEffect } from "react";
import { useCourier } from "@/contexts/CourierContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Package, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Navigation, 
  Power, 
  LogOut,
  CheckCircle,
  Truck
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderCard } from "@/components/courier/OrderCard";
import { StatsCard } from "@/components/courier/StatsCard";
import { StatusToggle } from "@/components/courier/StatusToggle";

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

  // Fetch orders with optimized query
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
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
      return data || [];
    },
    enabled: !!courier,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch today's stats
  const { data: todayStats } = useQuery({
    queryKey: ["courier-stats", courier?.id],
    queryFn: async () => {
      if (!courier) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, status")
        .eq("courier_id", courier.id)
        .gte("created_at", today.toISOString());

      if (error) throw error;

      const completed = data?.filter(o => o.status === "delivered").length || 0;
      const earnings = data
        ?.filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      return { completed, earnings, total: data?.length || 0 };
    },
    enabled: !!courier,
    refetchInterval: 60000, // Refresh every minute
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, courierId }: { orderId: string; status: string; courierId?: string }) => {
      const updates: any = { status };
      if (courierId) {
        updates.courier_id = courierId;
      }

      const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
      if (error) throw error;

      // Log tracking update with location if available
      const trackingData: any = {
        order_id: orderId,
        status,
        message: `Order ${status.replace("_", " ")}`,
      };

      if (courier?.current_lat && courier?.current_lng) {
        trackingData.lat = courier.current_lat;
        trackingData.lng = courier.current_lng;
      }

      await supabase.from("order_tracking").insert(trackingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courier-orders"] });
      queryClient.invalidateQueries({ queryKey: ["courier-stats"] });
      toast({ 
        title: "Success", 
        description: "Order status updated successfully"
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update order", 
        variant: "destructive" 
      });
    },
  });

  if (!courier) {
    return null;
  }

  const pendingOrders = orders.filter(o => o.status === "pending");
  const activeOrders = orders.filter(o => ["confirmed", "out_for_delivery"].includes(o.status));

  // Loading skeleton
  if (ordersLoading && !orders.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Driver Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, <span className="font-semibold">{courier.full_name}</span>
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 animate-fade-in">
          <StatsCard
            title="Today's Deliveries"
            value={todayStats?.completed || 0}
            icon={CheckCircle}
            description="Completed orders"
            colorClass="text-green-600"
          />
          <StatsCard
            title="Today's Earnings"
            value={`$${(todayStats?.earnings || 0).toFixed(2)}`}
            icon={DollarSign}
            description="Total earned today"
            colorClass="text-green-600"
          />
          <StatsCard
            title="Active Orders"
            value={activeOrders.length}
            icon={Truck}
            description="Currently delivering"
            colorClass="text-blue-600"
          />
          <StatsCard
            title="Available Orders"
            value={pendingOrders.length}
            icon={Package}
            description="Ready to accept"
            colorClass="text-purple-600"
          />
        </div>

        {/* Status Controls */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          <StatusToggle
            id="online-status"
            label="Online Status"
            description="Toggle your availability for new orders"
            checked={courier.is_online}
            onCheckedChange={toggleOnlineStatus}
            icon={Power}
            activeText="Available for Orders"
            inactiveText="Offline"
          />
          <StatusToggle
            id="location-tracking"
            label="Location Tracking"
            description="Share your real-time location with customers"
            checked={trackingLocation}
            onCheckedChange={setTrackingLocation}
            icon={Navigation}
            activeText="Sharing Location"
            inactiveText="Not Sharing"
          />
        </div>

        {/* Orders Section */}
        <div className="space-y-6 animate-fade-in">
          {/* Available Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-purple-600" />
                <h2 className="text-2xl font-bold">Available Orders</h2>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {pendingOrders.length}
                </span>
              </div>
              <div className="grid gap-4">
                {pendingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    courierId={courier.id}
                    onStatusUpdate={(orderId, status, courierId) =>
                      updateOrderStatus.mutate({ orderId, status, courierId })
                    }
                    isUpdating={updateOrderStatus.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Deliveries */}
          {activeOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-bold">Active Deliveries</h2>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {activeOrders.length}
                </span>
              </div>
              <div className="grid gap-4">
                {activeOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    courierId={courier.id}
                    onStatusUpdate={(orderId, status) =>
                      updateOrderStatus.mutate({ orderId, status })
                    }
                    isUpdating={updateOrderStatus.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {orders.length === 0 && (
            <Card className="border-dashed">
              <div className="py-16 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-muted rounded-full">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No Orders Available</h3>
                  <p className="text-muted-foreground">
                    {courier.is_online 
                      ? "New orders will appear here when they're available"
                      : "Go online to start receiving orders"}
                  </p>
                </div>
                {!courier.is_online && (
                  <Button onClick={toggleOnlineStatus} size="lg">
                    <Power className="mr-2 h-5 w-5" />
                    Go Online
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierDashboard;
