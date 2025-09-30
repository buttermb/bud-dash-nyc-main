import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading orders",
        description: "Could not load your order history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "yellow",
      accepted: "blue",
      preparing: "blue",
      out_for_delivery: "purple",
      delivered: "green",
      cancelled: "red",
    };
    return colors[status] || "default";
  };

  const filterOrders = (status?: string) => {
    if (!status || status === "all") return orders;
    if (status === "active") {
      return orders.filter(order => 
        ["pending", "accepted", "preparing", "out_for_delivery"].includes(order.status)
      );
    }
    if (status === "completed") {
      return orders.filter(order => order.status === "delivered");
    }
    if (status === "cancelled") {
      return orders.filter(order => order.status === "cancelled");
    }
    return orders;
  };

  const filteredOrders = filterOrders(filter);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        <Tabs defaultValue="all" onValueChange={setFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
                  <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
                  <Button onClick={() => navigate("/")}>Start Shopping</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </CardTitle>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-semibold">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-semibold">${Number(order.total_amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Delivery</p>
                          <p className="font-semibold">{order.delivery_borough}</p>
                        </div>
                        <div className="flex items-end justify-end">
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
