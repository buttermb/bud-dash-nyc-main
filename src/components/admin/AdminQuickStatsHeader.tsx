import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickStats {
  activeOrders: number;
  todayRevenue: number;
  onlineCouriers: number;
}

export const AdminQuickStatsHeader = () => {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchQuickStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuickStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersRes, couriersRes] = await Promise.all([
        supabase
          .from('orders')
          .select('total_amount, status')
          .gte('created_at', today.toISOString()),
        supabase
          .from('couriers')
          .select('is_online')
          .eq('is_online', true)
      ]);

      const activeOrders = ordersRes.data?.filter(o => 
        ['pending', 'accepted', 'picked_up'].includes(o.status)
      ).length || 0;

      const todayRevenue = ordersRes.data?.reduce((sum, o) => 
        sum + Number(o.total_amount || 0), 0
      ) || 0;

      setStats({
        activeOrders,
        todayRevenue,
        onlineCouriers: couriersRes.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 pb-3 border-b">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-3 border-b">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Quick Stats</span>
        <TrendingUp className="h-3 w-3 text-green-500" />
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Active Orders</span>
          <span className="font-semibold">{stats?.activeOrders || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Today Revenue</span>
          <span className="font-semibold text-green-600">${(stats?.todayRevenue || 0).toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Online Couriers</span>
          <span className="font-semibold">{stats?.onlineCouriers || 0}</span>
        </div>
      </div>
    </div>
  );
};
