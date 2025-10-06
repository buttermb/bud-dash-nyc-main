import { useEffect, useState } from 'react';
import { useCourier } from '@/contexts/CourierContext';
import { useCourierPin } from '@/contexts/CourierPinContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, MapPin, Phone, Navigation, Clock, CheckCircle, 
  DollarSign, Package, User, Camera, AlertCircle, Circle, Star 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PinSetupModal from '@/components/courier/PinSetupModal';
import PinUnlockModal from '@/components/courier/PinUnlockModal';

interface OrderItem {
  product_name: string;
  quantity: number;
  products?: {
    name: string;
    thca_percentage?: number;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_borough: string;
  tip_amount?: number;
  special_instructions?: string;
  customer_name?: string;
  customer_phone?: string;
  accepted_at?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  delivered_at?: string;
  addresses?: {
    street: string;
    apartment?: string;
    zip_code: string;
  };
  merchants?: {
    business_name: string;
    address: string;
  };
  order_items?: OrderItem[];
}

interface TodayStats {
  deliveries_completed: number;
  total_earned: string;
  tips_earned?: string;
}

export default function CourierDashboard() {
  const { courier, loading: courierLoading, isOnline } = useCourier();
  const { hasPinSetup, isUnlocked, setupPin, verifyPin } = useCourierPin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [currentView, setCurrentView] = useState<'active' | 'available' | 'completed' | 'earnings'>('active');
  const [orderStatus, setOrderStatus] = useState<'pickup' | 'delivering' | 'arrived' | 'verifying'>('pickup');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
    refetchInterval: 15000,
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

  // Fetch completed orders
  const { data: completedOrdersData } = useQuery({
    queryKey: ['courier-completed-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'my-orders', status: 'delivered' }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!courier && currentView === 'completed'
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
      toast.success('Order accepted!');
      queryClient.invalidateQueries({ queryKey: ['courier-my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['courier-available-orders'] });
      setCurrentView('active');
    },
    onError: () => {
      toast.error("Order no longer available");
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() })
        })
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      const messages: Record<string, string> = {
        'out_for_delivery': '🚗 Order picked up - en route!',
        'delivered': '🎉 Delivery completed!',
      };
      
      toast.success(messages[variables.newStatus] || "Status updated");
      
      queryClient.invalidateQueries({ queryKey: ['courier-my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['courier-today-stats'] });
      
      if (variables.newStatus === 'delivered') {
        setOrderStatus('pickup');
        setCurrentView('completed');
      }
    },
    onError: () => {
      toast.error("Error updating status");
    }
  });

  // Open navigation
  const openNavigation = (order: Order, destination: 'pickup' | 'delivery') => {
    const lat = destination === 'pickup' ? order.pickup_lat : order.dropoff_lat;
    const lng = destination === 'pickup' ? order.pickup_lng : order.dropoff_lng;
    
    if (!lat || !lng) {
      toast.error('Location not available');
      return;
    }
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    
    window.open(url, '_blank');
  };

  if (courierLoading || !courier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPinSetup) {
    return (
      <div className="min-h-screen bg-background">
        <PinSetupModal open={true} onPinSet={setupPin} />
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <PinUnlockModal open={true} onUnlock={verifyPin} />
      </div>
    );
  }

  const myOrders = myOrdersData?.orders || [];
  const availableOrders = availableOrdersData?.orders || [];
  const completedOrders = completedOrdersData?.orders || [];
  const activeOrder = myOrders[0];

  const todayEarnings = parseFloat(stats?.total_earned || '0');
  const todayTips = parseFloat(stats?.tips_earned || '0');
  const todayDeliveries = stats?.deliveries_completed || 0;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-slate-900 font-black text-sm">NYM</span>
            </div>
            <div>
              <div className="font-black text-sm">DRIVER PANEL</div>
              <div className="text-xs text-slate-400">
                {isOnline ? 'Online • Ready' : 'Offline'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-2xl font-black text-teal-400">${todayEarnings.toFixed(0)}</div>
              <div className="text-xs text-slate-400">Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800 border-b border-slate-700 px-2 py-2 flex space-x-2 overflow-x-auto">
        {[
          { id: 'active' as const, label: 'Active', icon: Package },
          { id: 'available' as const, label: 'Available', icon: Circle },
          { id: 'completed' as const, label: 'Completed', icon: CheckCircle },
          { id: 'earnings' as const, label: 'Earnings', icon: DollarSign }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 font-bold text-sm transition whitespace-nowrap ${
                currentView === tab.id 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Order View */}
      {currentView === 'active' && (
        <div className="p-4 space-y-4">
          {!activeOrder ? (
            <div className="text-center text-slate-400 py-12">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <div>No active orders</div>
              <div className="text-sm mt-2">Check "Available" tab for new orders</div>
            </div>
          ) : (
            <>
              {/* Status Progress */}
              <div className="bg-slate-800 border border-slate-700 p-6">
                <div className="flex justify-between mb-4">
                  {[
                    { label: 'Pickup', status: 'pickup' as const, done: orderStatus !== 'pickup' },
                    { label: 'Delivering', status: 'delivering' as const, done: ['arrived', 'verifying'].includes(orderStatus) },
                    { label: 'Arrived', status: 'arrived' as const, done: orderStatus === 'verifying' },
                    { label: 'Verify ID', status: 'verifying' as const, done: false }
                  ].map((step, idx) => (
                    <div key={step.status} className="flex-1 text-center">
                      <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2 ${
                        orderStatus === step.status ? 'bg-teal-500' : 
                        step.done ? 'bg-teal-600' : 'bg-slate-700'
                      }`}>
                        {step.done ? <CheckCircle size={20} /> : idx + 1}
                      </div>
                      <div className="text-xs font-bold">{step.label}</div>
                    </div>
                  ))}
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-500"
                    style={{ 
                      width: orderStatus === 'pickup' ? '25%' : 
                             orderStatus === 'delivering' ? '50%' : 
                             orderStatus === 'arrived' ? '75%' : '100%' 
                    }}
                  ></div>
                </div>
              </div>

              {/* Order Info Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-teal-500/30 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-teal-400 font-bold mb-1">ORDER ID</div>
                    <div className="text-2xl font-black">{activeOrder.order_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black">${activeOrder.total_amount}</div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-slate-900/50 border border-slate-700 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold">{activeOrder.customer_name || 'Customer'}</div>
                        <div className="text-sm text-slate-400">Customer</div>
                      </div>
                    </div>
                    {activeOrder.customer_phone && (
                      <a 
                        href={`tel:${activeOrder.customer_phone}`}
                        className="bg-slate-800 hover:bg-slate-700 w-10 h-10 flex items-center justify-center transition border border-slate-600"
                      >
                        <Phone size={18} />
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="text-teal-400 flex-shrink-0 mt-1" size={16} />
                      <div>
                        <div className="font-bold text-sm">{activeOrder.delivery_address}</div>
                        {activeOrder.addresses?.apartment && (
                          <div className="text-xs text-slate-400">{activeOrder.addresses.apartment}</div>
                        )}
                      </div>
                    </div>
                    {activeOrder.special_instructions && (
                      <div className="bg-slate-800 border border-slate-700 p-3 text-sm">
                        <div className="text-xs text-teal-400 font-bold mb-1">INSTRUCTIONS</div>
                        {activeOrder.special_instructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-slate-900/50 border border-slate-700 p-4 mb-4">
                  <div className="text-xs text-teal-400 font-bold mb-3">ORDER ITEMS</div>
                  {activeOrder.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <div>
                        <div className="font-bold text-sm">{item.products?.name || item.product_name}</div>
                        {item.products?.thca_percentage && (
                          <div className="text-xs text-slate-400">{item.products.thca_percentage}% THCA</div>
                        )}
                      </div>
                      <div className="text-sm font-bold">x{item.quantity}</div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {orderStatus === 'pickup' && (
                    <>
                      <button 
                        onClick={() => openNavigation(activeOrder, 'pickup')}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 py-4 font-black text-lg transition flex items-center justify-center space-x-2"
                      >
                        <Navigation size={20} />
                        <span>NAVIGATE TO STORE</span>
                      </button>
                      <button 
                        onClick={() => setOrderStatus('delivering')}
                        className="w-full bg-slate-700 hover:bg-slate-600 py-3 font-bold transition"
                      >
                        Picked Up Order
                      </button>
                    </>
                  )}

                  {orderStatus === 'delivering' && (
                    <>
                      <button 
                        onClick={() => openNavigation(activeOrder, 'delivery')}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 py-4 font-black text-lg transition flex items-center justify-center space-x-2"
                      >
                        <Navigation size={20} />
                        <span>NAVIGATE TO CUSTOMER</span>
                      </button>
                      <button 
                        onClick={() => setOrderStatus('arrived')}
                        className="w-full bg-slate-700 hover:bg-slate-600 py-3 font-bold transition"
                      >
                        I've Arrived
                      </button>
                    </>
                  )}

                  {orderStatus === 'arrived' && (
                    <>
                      <button 
                        onClick={() => setOrderStatus('verifying')}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 py-4 font-black text-lg transition flex items-center justify-center space-x-2"
                      >
                        <AlertCircle size={20} />
                        <span>VERIFY CUSTOMER ID (21+)</span>
                      </button>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-center">
                        <div className="font-bold text-yellow-500 mb-1">⚠️ REQUIRED BY LAW</div>
                        Must verify customer is 21+ before delivery
                      </div>
                    </>
                  )}

                  {orderStatus === 'verifying' && (
                    <div className="space-y-4">
                      <div className="bg-slate-900 border-2 border-yellow-500 p-6 text-center">
                        <AlertCircle className="mx-auto mb-3 text-yellow-500" size={48} />
                        <div className="text-xl font-black mb-2">VERIFY AGE (21+)</div>
                        <div className="text-sm text-slate-400 mb-4">Check customer's valid ID</div>
                        
                        <div className="space-y-3">
                          <button className="w-full bg-slate-800 hover:bg-slate-700 py-3 font-bold transition flex items-center justify-center space-x-2">
                            <Camera size={18} />
                            <span>Scan ID</span>
                          </button>
                          <input 
                            type="date" 
                            className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-center focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => updateStatusMutation.mutate({ orderId: activeOrder.id, newStatus: 'delivered' })}
                        disabled={updateStatusMutation.isPending}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 py-4 font-black text-lg transition flex items-center justify-center space-x-2"
                      >
                        <CheckCircle size={20} />
                        <span>COMPLETE DELIVERY</span>
                      </button>

                      <button className="w-full bg-red-600 hover:bg-red-700 py-3 font-bold transition">
                        Customer Under 21 - Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Available Orders View */}
      {currentView === 'available' && (
        <div className="p-4 space-y-4">
          <div className="text-sm text-slate-400 mb-4">
            {availableOrders.length} orders available nearby
          </div>
          {availableOrders.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <Circle size={48} className="mx-auto mb-4 opacity-50" />
              <div>No available orders</div>
            </div>
          ) : (
            availableOrders.map((order: Order) => (
              <div key={order.id} className="bg-slate-800 border border-slate-700 hover:border-teal-500 p-6 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xl font-black mb-1">{order.order_number}</div>
                    <div className="text-sm text-slate-400">
                      {order.delivery_borough}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-teal-400">${order.total_amount}</div>
                    <div className="text-xs text-slate-400">{order.order_items?.length || 0} items</div>
                  </div>
                </div>
                <button 
                  onClick={() => acceptOrderMutation.mutate(order.id)}
                  disabled={acceptOrderMutation.isPending}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 py-3 font-black transition"
                >
                  ACCEPT ORDER
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completed Orders View */}
      {currentView === 'completed' && (
        <div className="p-4 space-y-3">
          <div className="text-sm text-slate-400 mb-4">
            {completedOrders.length} deliveries completed today
          </div>
          {completedOrders.map((order: Order) => (
            <div key={order.id} className="bg-slate-800 border border-slate-700 p-4 flex items-center justify-between">
              <div>
                <div className="font-bold">{order.order_number}</div>
                <div className="text-sm text-slate-400">{order.delivery_borough}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-teal-400">${order.total_amount}</div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs">5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Earnings View */}
      {currentView === 'earnings' && (
        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-br from-teal-900/30 to-slate-900 border-2 border-teal-500/30 p-6">
            <div className="text-center mb-6">
              <div className="text-sm text-teal-400 font-bold mb-2">TODAY'S EARNINGS</div>
              <div className="text-6xl font-black mb-2">${todayEarnings.toFixed(0)}</div>
              <div className="text-slate-400">+ ${todayTips.toFixed(0)} tips</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 p-4 text-center">
                <div className="text-3xl font-black mb-1">{todayDeliveries}</div>
                <div className="text-xs text-slate-400">Deliveries</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 text-center">
                <div className="text-3xl font-black mb-1 flex items-center justify-center">
                  4.9
                  <Star size={20} fill="#fbbf24" className="text-yellow-500 ml-1" />
                </div>
                <div className="text-xs text-slate-400">Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6">
            <div className="text-sm font-bold text-teal-400 mb-4">EARNINGS BREAKDOWN</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Base Pay</span>
                <span className="font-bold">${(todayEarnings - todayTips).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tips</span>
                <span className="font-bold text-teal-400">${todayTips.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700">
                <span className="font-bold">Total</span>
                <span className="font-black text-xl">${todayEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 py-4 font-black text-lg transition">
            CASH OUT NOW
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button 
            onClick={() => setCurrentView('active')}
            className="flex flex-col items-center space-y-1"
          >
            <Package size={20} className={currentView === 'active' ? 'text-teal-400' : 'text-slate-400'} />
            <span className={`text-xs font-bold ${currentView === 'active' ? 'text-teal-400' : 'text-slate-400'}`}>Orders</span>
          </button>
          <button 
            onClick={() => setCurrentView('earnings')}
            className="flex flex-col items-center space-y-1"
          >
            <DollarSign size={20} className={currentView === 'earnings' ? 'text-teal-400' : 'text-slate-400'} />
            <span className={`text-xs font-bold ${currentView === 'earnings' ? 'text-teal-400' : 'text-slate-400'}`}>Earnings</span>
          </button>
          <button 
            onClick={() => navigate('/courier/profile')}
            className="flex flex-col items-center space-y-1"
          >
            <User size={20} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
