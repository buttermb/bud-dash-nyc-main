import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Truck,
  Store,
  Shield,
  Clock
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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchDashboardMetrics();
    }
  }, [session]);

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Real-time metrics and key performance indicators
        </p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View detailed analytics in the Analytics section
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Navigate using the sidebar to:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>Monitor live deliveries</li>
              <li>Manage orders and users</li>
              <li>Review compliance issues</li>
              <li>View analytics and reports</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
