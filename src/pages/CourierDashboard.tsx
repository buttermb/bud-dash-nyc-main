import { useEffect, useState } from 'react';
import { useCourier } from '@/contexts/CourierContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, DollarSign, Package, Clock, Percent, MapPin, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_borough: string;
  courier_commission?: string;
  addresses?: {
    street: string;
    city: string;
    borough: string;
  };
  merchants?: {
    business_name: string;
    address: string;
  };
}

interface TodayStats {
  deliveries_completed: number;
  total_earned: string;
  hours_online: string;
  active_orders: number;
}

export default function CourierDashboard() {
  const { courier, loading: courierLoading, isOnline, toggleOnlineStatus } = useCourier();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch today's stats
  const { data: stats } = useQuery<TodayStats>({
    queryKey: ['courier-today-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'today-stats' }
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
    enabled: !!courier
  });

  // Fetch my orders
  const { data: myOrdersData } = useQuery({
    queryKey: ['courier-my-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'my-orders', status: 'active' }
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
    enabled: !!courier
  });

  // Fetch available orders
  const { data: availableOrdersData } = useQuery({
    queryKey: ['courier-available-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'available-orders' }
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
    enabled: !!courier && isOnline
  });

  // Accept order mutation
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'accept-order', order_id: orderId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['courier-available-orders'] });
      toast({ title: "Order accepted!", description: "Order added to your active deliveries" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to accept order", description: error.message, variant: "destructive" });
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'update-order-status', order_id: orderId, status }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['courier-today-stats'] });
      toast({ title: "Status updated" });
    }
  });

  if (courierLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!courier) {
    navigate('/courier/login');
    return null;
  }

  const myOrders: Order[] = myOrdersData?.orders || [];
  const availableOrders: Order[] = availableOrdersData?.orders || [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {courier.full_name}!</h1>
            <p className="text-muted-foreground">Manage your deliveries and track earnings</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isOnline ? "default" : "secondary"} className="gap-1">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <Switch checked={isOnline} onCheckedChange={toggleOnlineStatus} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Today's Deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.deliveries_completed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Today's Earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats?.total_earned || '0.00'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hours Online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.hours_online || '0.0'}h</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Commission Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courier.commission_rate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Active Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Your current deliveries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active orders</p>
                  <p className="text-sm">Go online to receive orders!</p>
                </div>
              ) : (
                myOrders.map((order) => (
                  <Card key={order.id} className="border-2">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">#{order.order_number}</p>
                          <Badge variant="secondary">{order.status}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.total_amount}</p>
                          <p className="text-sm text-green-600 font-medium">
                            +${order.courier_commission} commission
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Pickup</p>
                            <p className="text-muted-foreground">{order.merchants?.business_name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-green-600" />
                          <div>
                            <p className="font-medium">Delivery</p>
                            <p className="text-muted-foreground">{order.delivery_address}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'out_for_delivery' })}
                          >
                            Mark Picked Up
                          </Button>
                        )}
                        {order.status === 'out_for_delivery' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'delivered' })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Delivered
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => navigate(`/courier/orders/${order.id}`)}>
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Available Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Available Orders</CardTitle>
              <CardDescription>
                {isOnline ? 'Accept orders for delivery' : 'Go online to see available orders'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isOnline ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>You're currently offline</p>
                  <p className="text-sm">Toggle online to receive orders</p>
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No orders available</p>
                  <p className="text-sm">Check back soon!</p>
                </div>
              ) : (
                availableOrders.map((order) => (
                  <Card key={order.id} className="border-2 border-green-200">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">#{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">{order.delivery_borough}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.total_amount}</p>
                          <p className="text-sm text-green-600 font-medium">
                            Earn ${(parseFloat(order.total_amount.toString()) * courier.commission_rate / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium">From:</span> {order.merchants?.address}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">To:</span> {order.delivery_address}
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => acceptOrderMutation.mutate(order.id)}
                        disabled={acceptOrderMutation.isPending}
                      >
                        {acceptOrderMutation.isPending ? 'Accepting...' : 'Accept Order'}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
