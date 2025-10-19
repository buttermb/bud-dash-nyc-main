import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Package, Clock, Truck, Phone, DollarSign, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminLiveOrders = () => {
  const { session } = useAdmin();
  const { toast } = useToast();
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchLiveOrders();
      
      // Set up real-time subscription (no polling needed)
      const channel = supabase
        .channel("live-orders-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          (payload) => {
            const newRecord = payload.new as any;
            if (newRecord && ['accepted', 'confirmed', 'preparing', 'out_for_delivery'].includes(newRecord.status)) {
              fetchLiveOrders();
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  const fetchLiveOrders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-dashboard", {
        body: { 
          endpoint: "orders",
          status: "accepted,confirmed,preparing,out_for_delivery",
          limit: 100
        }
      });

      if (error) throw error;
      setLiveOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch live orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load live orders",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.functions.invoke("update-order-status", {
        body: { orderId, status: newStatus },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (error) throw error;

      toast({
        title: "✓ Success",
        description: `Order status updated to ${newStatus}`,
      });

      // Immediate refetch to show changes
      await fetchLiveOrders();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        variant: "destructive",
        title: "Failed to update",
        description: "Failed to update order status",
      });
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return { variant: "secondary", label: "Unknown", color: "bg-gray-500" };
    }
    const variants: Record<string, { variant: any; label: string; color: string }> = {
      accepted: { variant: "default", label: "Accepted", color: "bg-blue-500" },
      confirmed: { variant: "default", label: "Confirmed", color: "bg-purple-500" },
      preparing: { variant: "default", label: "Preparing", color: "bg-orange-500" },
      out_for_delivery: { variant: "default", label: "Out for Delivery", color: "bg-green-500" },
    };
    return variants[status] || { variant: "secondary", label: status, color: "bg-gray-500" };
  };

  const getNextStatus = (currentStatus: string | undefined) => {
    if (!currentStatus) return null;
    const statusFlow: Record<string, string> = {
      accepted: "confirmed",
      confirmed: "preparing",
      preparing: "out_for_delivery",
      out_for_delivery: "delivered",
    };
    return statusFlow[currentStatus] || null;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Orders</h1>
          <p className="text-muted-foreground">
            Active orders ({liveOrders.length})
          </p>
        </div>
        <Button onClick={fetchLiveOrders} variant="outline">
          Refresh
        </Button>
      </div>

      {liveOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">No active orders</p>
            <p className="text-sm text-muted-foreground">
              All accepted orders will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {liveOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const nextStatus = getNextStatus(order.status);
            
            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        Order #{order.order_number || order.id.substring(0, 8).toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      {order.payment_method === "cash" && (
                        <Badge variant="outline">Cash</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Delivery Address */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="h-4 w-4 text-primary" />
                        Delivery Address
                      </div>
                      <div className="text-sm pl-6">
                        <p>{order.delivery_address || 'No address provided'}</p>
                        <p className="text-muted-foreground capitalize">{order.delivery_borough || 'Unknown borough'}</p>
                      </div>
                      {order.delivery_notes && (
                        <p className="text-sm text-muted-foreground pl-6 italic">
                          Note: {order.delivery_notes}
                        </p>
                      )}
                    </div>

                    {/* Courier Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Truck className="h-4 w-4 text-primary" />
                        Courier Info
                      </div>
                      {order.courier ? (
                        <div className="text-sm pl-6">
                          <p className="font-medium">{order.courier.full_name || 'Unknown courier'}</p>
                          <p className="text-muted-foreground">{order.courier.phone || 'No phone'}</p>
                          <p className="text-muted-foreground">
                            {order.courier.vehicle_type || 'Vehicle'} - {order.courier.vehicle_plate || 'N/A'}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {order.courier.is_online ? "Online" : "Offline"}
                          </Badge>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground pl-6">
                          No courier assigned yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Package className="h-4 w-4 text-primary" />
                      Items ({order.items?.length || 0})
                    </div>
                    <div className="pl-6 space-y-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.product_name || item.products?.name} x{item.quantity}
                          </span>
                          <span className="text-muted-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold text-sm pt-2 border-t">
                        <span>Total</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {nextStatus && (
                    <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as {nextStatus?.replace('_', ' ') || 'Next Status'}
                        </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminLiveOrders;
