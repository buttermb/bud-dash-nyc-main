import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Truck,
  Store,
  Shield,
  Clock,
  Activity,
  Bell,
  Zap,
  Package,
  DollarSign,
  CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetrics {
  totalOrders: number;
  todayOrders: number;
  activeOrders: number;
  totalUsers: number;
  totalMerchants: number;
  activeCouriers: number;
  pendingVerifications: number;
  flaggedOrders: number;
  todayRevenue: number;
}

const AdminDashboard = () => {
  const { session } = useAdmin();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeActivity, setRealtimeActivity] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState({ status: "healthy", unresolvedFlags: 0, activeUsers: 0, ordersLastHour: 0 });

  useEffect(() => {
    if (session) {
      fetchDashboardMetrics();
      fetchSystemHealth();
      setupRealtimeSubscription();
    }
  }, [session]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setRealtimeActivity(prev => [{
          type: 'new_order',
          message: `New order #${payload.new.order_number}`,
          timestamp: new Date(),
          data: payload.new
        }, ...prev].slice(0, 10));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fraud_flags' }, (payload) => {
        setSystemAlerts(prev => [{
          type: 'fraud_alert',
          severity: 'high',
          message: `Fraud detected: ${payload.new.flag_type}`,
          timestamp: new Date()
        }, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const fetchSystemHealth = async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [unresolvedFlags, activeOrders] = await Promise.all([
        supabase.from("fraud_flags").select("id", { count: "exact", head: true }).is("resolved_at", null),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", oneHourAgo.toISOString()),
      ]);

      setSystemHealth({
        status: (unresolvedFlags.count || 0) > 10 ? "warning" : "healthy",
        unresolvedFlags: unresolvedFlags.count || 0,
        activeUsers: 0,
        ordersLastHour: activeOrders.count || 0
      });
    } catch (error) {
      console.error("Failed to fetch system health:", error);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      // Use optimized RPC function for instant metrics
      const { data, error } = await supabase.rpc('get_admin_dashboard_metrics');

      if (error) throw error;
      setMetrics(data as unknown as DashboardMetrics);
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Real-time metrics and key performance indicators
          </p>
        </div>
        <Badge variant={systemHealth.status === "healthy" ? "default" : "destructive"} className="gap-1">
          <Activity className="h-3 w-3" />
          {systemHealth.status === "healthy" ? "System Healthy" : "Attention Required"}
        </Badge>
      </div>

      {/* System Health Snapshot */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders (Last Hour)</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.ordersLastHour}</div>
            <p className="text-xs text-muted-foreground">Real-time tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved Flags</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{systemHealth.unresolvedFlags}</div>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
              onClick={() => navigate("/admin/users")}
            >
              Review now →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Active notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(metrics?.todayRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {metrics?.todayOrders || 0} orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          icon={ShoppingCart}
          trend="All time"
        />
        <MetricCard
          title="Today's Orders"
          value={metrics?.todayOrders || 0}
          icon={Clock}
          trend={`$${(metrics?.todayRevenue || 0).toFixed(2)} revenue`}
        />
        <MetricCard
          title="Active Orders"
          value={metrics?.activeOrders || 0}
          icon={Truck}
          trend="In progress"
        />
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={Users}
          trend="Registered"
        />
        <MetricCard
          title="Active Merchants"
          value={metrics?.totalMerchants || 0}
          icon={Store}
          trend="Verified"
        />
        <MetricCard
          title="Online Couriers"
          value={metrics?.activeCouriers || 0}
          icon={Truck}
          trend="Available now"
        />
        <MetricCard
          title="Pending Verifications"
          value={metrics?.pendingVerifications || 0}
          icon={Shield}
          trend="Awaiting review"
        />
        <MetricCard
          title="Flagged Orders"
          value={metrics?.flaggedOrders || 0}
          icon={AlertTriangle}
          trend="Requires attention"
        />
      </div>

      {/* Real-time Activity & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realtimeActivity.length > 0 ? (
                realtimeActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{activity.type.replace('_', ' ')}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Waiting for activity...</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.length > 0 ? (
                systemAlerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-2 border-b pb-2 last:border-0">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs flex-shrink-0">
                      {alert.severity}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-4">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No active alerts
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" onClick={() => navigate("/admin/products")} className="justify-start">
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/users")} className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              View Users
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/live-orders")} className="justify-start">
              <Truck className="mr-2 h-4 w-4" />
              Live Deliveries
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/analytics")} className="justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
