import { useEffect, useState } from 'react';
import { useCourier } from '@/contexts/CourierContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, DollarSign, Package, Clock, MapPin, Phone, User, Store, Home, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Order {
  id: string;
  order_number: string;
  tracking_code?: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_borough: string;
  addresses?: {
    street: string;
    city: string;
    borough: string;
    zip_code: string;
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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'home' | 'earnings' | 'profile'>('home');

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

  // Fetch active orders
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
      toast.success("Order accepted!");
    },
    onError: () => {
      toast.error("Failed to accept order");
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
      toast.success("Status updated!");
    },
    onError: () => {
      toast.error("Failed to update status");
    }
  });

  if (courierLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!courier) {
    navigate('/courier/login');
    return null;
  }

  const activeOrders = (myOrdersData?.orders || []) as Order[];
  const availableOrders = (availableOrdersData?.orders || []) as Order[];
  const courierCommissionRate = courier.commission_rate || 30;

  const markPickedUp = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'out_for_delivery' });
  };

  const markDelivered = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'delivered' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Fixed Top Bar */}
      <div className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3">
          {/* Online Toggle - Prominent */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold">Hi, {courier.full_name?.split(' ')[0]}! 👋</h1>
              <p className="text-sm text-muted-foreground">
                {isOnline ? (
                  <span className="flex items-center text-green-600">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    You're online and accepting orders
                  </span>
                ) : (
                  <span className="text-muted-foreground">You're offline</span>
                )}
              </p>
            </div>
            
            {/* Large Toggle Switch */}
            <button
              onClick={toggleOnlineStatus}
              className={`
                relative inline-flex h-14 w-28 items-center rounded-full transition-colors
                ${isOnline ? 'bg-green-500' : 'bg-muted'}
              `}
            >
              <span className={`
                inline-block h-12 w-12 transform rounded-full bg-card shadow-lg transition-transform flex items-center justify-center text-2xl
                ${isOnline ? 'translate-x-14' : 'translate-x-1'}
              `}>
                {isOnline ? '🟢' : '⚪'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Scrollable */}
      <div className="px-4 py-4 overflow-x-auto">
        <div className="flex space-x-4 min-w-max">
          {/* Today's Deliveries */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg min-w-[160px] border-0">
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">{stats?.deliveries_completed || 0}</div>
              <div className="text-blue-100 text-sm">Deliveries Today</div>
              <div className="mt-2 text-xs opacity-75">🎯 Keep it up!</div>
            </div>
          </Card>

          {/* Today's Earnings */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg min-w-[160px] border-0">
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">${stats?.total_earned || '0.00'}</div>
              <div className="text-green-100 text-sm">Earned Today</div>
              <div className="mt-2 text-xs opacity-75">💰 {courierCommissionRate}% per order</div>
            </div>
          </Card>

          {/* Hours Online */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg min-w-[160px] border-0">
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">{stats?.hours_online || '0.0'}h</div>
              <div className="text-purple-100 text-sm">Hours Online</div>
              <div className="mt-2 text-xs opacity-75">⏱️ Active time</div>
            </div>
          </Card>

          {/* Active Orders */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg min-w-[160px] border-0">
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">{activeOrders.length}</div>
              <div className="text-orange-100 text-sm">Active Orders</div>
              <div className="mt-2 text-xs opacity-75">📦 In progress</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        {/* Active Orders - Priority Section */}
        {activeOrders.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🚗 Active Deliveries</h2>
              <span className="px-3 py-1 bg-orange-500/10 text-orange-700 text-sm font-semibold rounded-full">
                {activeOrders.length} Active
              </span>
            </div>

            <div className="space-y-4">
              {activeOrders.map(order => (
                <Card key={order.id} className="border-2 border-orange-200">
                  {/* Order Header */}
                  <div className="p-4 bg-orange-50 border-b border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
                        {order.tracking_code && (
                          <p className="text-xs text-muted-foreground">{order.tracking_code}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${(parseFloat(order.total_amount.toString()) * (courierCommissionRate / 100)).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Your earnings</div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="inline-block">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' : ''}
                      `}>
                        {order.status === 'preparing' && '👨‍🍳 Being Prepared'}
                        {order.status === 'out_for_delivery' && '🚗 Out for Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="p-4 space-y-3">
                    {/* Pickup */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Store className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-medium">PICKUP</p>
                        <p className="text-sm font-bold">{order.merchants?.business_name}</p>
                        <p className="text-sm text-muted-foreground">{order.merchants?.address}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </Button>
                    </div>

                    <div className="flex justify-center">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>

                    {/* Dropoff */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-medium">DELIVER TO</p>
                        <p className="text-sm font-bold">{order.addresses?.street}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.addresses?.city}, {order.addresses?.zip_code}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-muted/50 border-t space-y-2">
                    {order.status === 'preparing' && (
                      <>
                        <Button
                          onClick={() => markPickedUp(order.id)}
                          className="w-full h-14 bg-blue-600 hover:bg-blue-700"
                          size="lg"
                        >
                          ✅ Mark as Picked Up
                        </Button>
                        <Button variant="outline" className="w-full h-12" size="lg">
                          <Phone className="w-5 h-5 mr-2" />
                          Call Restaurant
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'out_for_delivery' && (
                      <>
                        <Button
                          onClick={() => markDelivered(order.id)}
                          className="w-full h-14 bg-green-600 hover:bg-green-700"
                          size="lg"
                        >
                          🎉 Mark as Delivered
                        </Button>
                        <Button variant="outline" className="w-full h-12" size="lg">
                          <Phone className="w-5 h-5 mr-2" />
                          Call Customer
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Orders */}
        {isOnline && availableOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📦 Available Orders</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                {availableOrders.length} Available
              </span>
            </div>

            <div className="space-y-4">
              {availableOrders.map(order => (
                <Card key={order.id} className="border">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
                        <p className="text-lg font-bold">{order.merchants?.business_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">
                          ${(parseFloat(order.total_amount.toString()) * (courierCommissionRate / 100)).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">You'll earn</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                      <span>📍 {order.delivery_borough}</span>
                      <span>•</span>
                      <span>💰 ${order.total_amount}</span>
                    </div>

                    <Button
                      onClick={() => acceptOrderMutation.mutate(order.id)}
                      disabled={acceptOrderMutation.isPending}
                      className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      size="lg"
                    >
                      {acceptOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        'Accept Order →'
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {activeOrders.length === 0 && availableOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{isOnline ? '🔍' : '😴'}</div>
            <h3 className="text-xl font-bold mb-2">
              {isOnline ? 'No orders right now' : "You're offline"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isOnline 
                ? 'New orders will appear here automatically'
                : 'Toggle online to start receiving orders'
              }
            </p>
            {!isOnline && (
              <Button
                onClick={toggleOnlineStatus}
                size="lg"
                className="h-14 px-8"
              >
                Go Online
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-2 px-4 ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('earnings')}
            className={`flex flex-col items-center py-2 px-4 ${activeTab === 'earnings' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <DollarSign className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Earnings</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-2 px-4 ${activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
