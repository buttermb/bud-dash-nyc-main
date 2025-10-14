import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAlerts } from "@/components/admin/AdminAlerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck, Package, Clock, DollarSign, Users, Navigation, UserPlus, CheckCircle2, Shield, Bell, BellOff, Maximize, Search, Activity, TrendingUp, Zap, RefreshCw, Filter, Eye, Layers, Route, AlertTriangle, MapIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignCourierDialog } from "@/components/admin/AssignCourierDialog";
import { useToast } from "@/hooks/use-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { OrderMap } from "@/components/admin/OrderMap";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface RealtimeStats {
  ordersLastHour: number;
  revenueLastHour: number;
  activeCouriers: number;
  avgDeliveryTime: number;
  activeUsers: number;
  ordersInProgress: number;
  completionRate: number;
  avgOrderValue: number;
  peakHours: string;
  topBorough: string;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'delivery' | 'courier' | 'alert';
  message: string;
  timestamp: Date;
  severity?: 'info' | 'warning' | 'success' | 'error';
}

const AdminLiveMap = () => {
  const { session } = useAdmin();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [boroughFilter, setBoroughFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // Add activity to feed
  const addActivity = (type: ActivityItem['type'], message: string, severity: ActivityItem['severity'] = 'info') => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      severity
    };
    setActivityFeed(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50
  };

  // Fetch live deliveries
  const fetchLiveDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          order:orders (
            *,
            items:order_items (*)
          ),
          courier:couriers (*)
        `)
        .in('order.status', ['confirmed', 'preparing', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const previousCount = deliveries.length;
      setDeliveries(data || []);
      
      // Detect new orders
      if (data && data.length > previousCount) {
        playNotificationSound();
        addActivity('order', `New order received! Total active: ${data.length}`, 'success');
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      addActivity('alert', 'Failed to fetch deliveries', 'error');
    }
  };

  // Fetch realtime stats
  const fetchRealtimeStats = async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const [ordersResult, revenueResult, couriersResult, completedResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneHourAgo),
        supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', oneHourAgo)
          .eq('status', 'delivered'),
        supabase
          .from('couriers')
          .select('*', { count: 'exact', head: true })
          .eq('is_online', true)
          .eq('is_active', true),
        supabase
          .from('orders')
          .select('delivered_at, created_at')
          .eq('status', 'delivered')
          .gte('created_at', oneHourAgo)
      ]);

      const inProgressResult = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'preparing', 'out_for_delivery']);

      const totalOrdersToday = await supabase
        .from('orders')
        .select('status', { count: 'exact', head: true })
        .gte('created_at', new Date().toDateString());

      const deliveredToday = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered')
        .gte('created_at', new Date().toDateString());

      const avgDeliveryTime = completedResult.data
        ?.map((order: any) => {
          const created = new Date(order.created_at);
          const delivered = new Date(order.delivered_at);
          return (delivered.getTime() - created.getTime()) / 1000 / 60; // minutes
        })
        .reduce((a: number, b: number) => a + b, 0) / (completedResult.data?.length || 1);

      const revenue = revenueResult.data?.reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0) || 0;
      const avgOrderValue = revenueResult.data?.length ? revenue / revenueResult.data.length : 0;

      const completionRate = totalOrdersToday.count && deliveredToday.count 
        ? (deliveredToday.count / totalOrdersToday.count) * 100 
        : 0;

      setStats({
        ordersLastHour: ordersResult.count || 0,
        revenueLastHour: revenue,
        activeCouriers: couriersResult.count || 0,
        avgDeliveryTime: Math.round(avgDeliveryTime) || 0,
        activeUsers: 0,
        ordersInProgress: inProgressResult.count || 0,
        completionRate: Math.round(completionRate),
        avgOrderValue,
        peakHours: '12PM-2PM, 6PM-9PM',
        topBorough: 'Manhattan'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Setup realtime subscriptions
  useEffect(() => {
    if (!session) return;

    fetchLiveDeliveries();
    fetchRealtimeStats();

    // Auto-refresh
    const interval = autoRefresh ? setInterval(() => {
      fetchLiveDeliveries();
      fetchRealtimeStats();
    }, 5000) : null;

    // Realtime subscriptions
    const channel = supabase
      .channel("live-map-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;

          if (payload.eventType === 'INSERT') {
            addActivity('order', `New order: ${newRecord.order_number}`, 'success');
            playNotificationSound();
          } else if (payload.eventType === 'UPDATE' && newRecord.status !== oldRecord?.status) {
            addActivity('order', `Order ${newRecord.order_number} → ${newRecord.status}`, 'info');
          }
          
          fetchLiveDeliveries();
          fetchRealtimeStats();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "couriers" },
        (payload) => {
          const courier = payload.new as any;
          if (courier.is_online && !payload.old?.is_online) {
            addActivity('courier', `${courier.full_name} is now online`, 'success');
          }
          fetchLiveDeliveries();
        }
      )
      .subscribe();

    return () => {
      if (interval) clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [session, autoRefresh, soundEnabled]);

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((delivery) => {
    const statusMatch = statusFilter === "all" || delivery.order?.status === statusFilter;
    const boroughMatch = boroughFilter === "all" || delivery.order?.delivery_borough === boroughFilter;
    const searchMatch = !searchQuery || 
      delivery.order?.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.order?.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.courier?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && boroughMatch && searchMatch;
  });

  // Map orders for OrderMap component
  const mapOrders = filteredDeliveries.map(d => ({
    id: d.order?.id || d.id,
    tracking_code: d.order?.tracking_code || '',
    status: d.order?.status || 'pending',
    delivery_address: d.order?.delivery_address || '',
    dropoff_lat: d.order?.dropoff_lat || d.dropoff_lat,
    dropoff_lng: d.order?.dropoff_lng || d.dropoff_lng,
    eta_minutes: d.order?.eta_minutes,
    courier_id: d.courier?.id,
    courier: d.courier ? {
      full_name: d.courier.full_name,
      current_lat: d.courier.current_lat,
      current_lng: d.courier.current_lng,
      vehicle_type: d.courier.vehicle_type
    } : undefined
  }));

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-gray-500",
      confirmed: "bg-purple-500",
      preparing: "bg-yellow-500",
      out_for_delivery: "bg-blue-500",
      delivered: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order': return <Package className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'courier': return <Users className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!session) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Please log in to access the live map.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-background overflow-hidden">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      <AdminAlerts />

      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Live Operations Center</h1>
              <p className="text-sm text-muted-foreground">Real-time delivery tracking & management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            <Button
              variant={soundEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-6 bg-muted/30">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Active Now</p>
            </div>
            <p className="text-2xl font-bold">{stats?.ordersInProgress || 0}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">Last Hour</p>
            </div>
            <p className="text-2xl font-bold">{stats?.ordersLastHour || 0}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Revenue/Hr</p>
            </div>
            <p className="text-2xl font-bold">${stats?.revenueLastHour?.toFixed(0) || 0}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">Couriers</p>
            </div>
            <p className="text-2xl font-bold">{stats?.activeCouriers || 0}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-cyan-500" />
              <p className="text-xs text-muted-foreground">Avg Time</p>
            </div>
            <p className="text-2xl font-bold">{stats?.avgDeliveryTime || 0}m</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
            <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Avg Order</p>
            </div>
            <p className="text-2xl font-bold">${stats?.avgOrderValue?.toFixed(0) || 0}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Peak Hours</p>
            </div>
            <p className="text-xs font-semibold">{stats?.peakHours || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Panel - Map & Controls */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders, customers, couriers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={boroughFilter} onValueChange={setBoroughFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by borough" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Boroughs</SelectItem>
                    <SelectItem value="Manhattan">Manhattan</SelectItem>
                    <SelectItem value="Brooklyn">Brooklyn</SelectItem>
                    <SelectItem value="Queens">Queens</SelectItem>
                    <SelectItem value="Bronx">Bronx</SelectItem>
                    <SelectItem value="Staten Island">Staten Island</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <div className="flex-1 rounded-lg overflow-hidden border shadow-lg">
            <OrderMap
              orders={mapOrders}
              selectedOrderId={selectedDelivery?.order?.id}
              onOrderSelect={(orderId) => {
                const delivery = filteredDeliveries.find(d => d.order?.id === orderId);
                setSelectedDelivery(delivery);
              }}
            />
          </div>
        </div>

        {/* Right Panel - Orders & Activity */}
        <div className="w-[400px] flex flex-col gap-4">
          <Tabs defaultValue="orders" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">
                Orders ({filteredDeliveries.length})
              </TabsTrigger>
              <TabsTrigger value="activity">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="flex-1 mt-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Active Orders</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-2 p-4">
                      {filteredDeliveries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No active deliveries</p>
                        </div>
                      ) : (
                        filteredDeliveries.map((delivery) => (
                          <Card
                            key={delivery.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedDelivery?.id === delivery.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedDelivery(delivery)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold">{delivery.order?.order_number}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {delivery.order?.customer_name || 'Customer'}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(delivery.order?.status)}>
                                  {delivery.order?.status?.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground truncate">
                                    {delivery.order?.delivery_borough}
                                  </span>
                                </div>
                                {delivery.courier && (
                                  <div className="flex items-center gap-2">
                                    <Truck className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      {delivery.courier.full_name}
                                    </span>
                                  </div>
                                )}
                                {delivery.order?.eta_minutes && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      ETA: {delivery.order.eta_minutes} min
                                    </span>
                                  </div>
                                )}
                              </div>
                              {!delivery.courier && delivery.order?.status === 'pending' && (
                                <Button
                                  size="sm"
                                  className="w-full mt-3"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(delivery.order);
                                    setAssignDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="h-3 w-3 mr-2" />
                                  Assign Courier
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 mt-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Live Activity Feed</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-2 p-4">
                      {activityFeed.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No recent activity</p>
                        </div>
                      ) : (
                        activityFeed.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className={`p-2 rounded-full ${
                              item.severity === 'success' ? 'bg-green-500/10 text-green-500' :
                              item.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                              item.severity === 'error' ? 'bg-red-500/10 text-red-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {getActivityIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{item.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Assign Courier Dialog */}
      {selectedOrder && (
        <AssignCourierDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          orderId={selectedOrder.id}
          orderAddress={selectedOrder.delivery_address || ''}
          onSuccess={() => {
            setAssignDialogOpen(false);
            fetchLiveDeliveries();
            addActivity('courier', `Courier assigned to ${selectedOrder.order_number}`, 'success');
            toast({
              title: "Courier Assigned",
              description: "The courier has been successfully assigned to this order.",
            });
          }}
        />
      )}
    </div>
  );
};

export default AdminLiveMap;
