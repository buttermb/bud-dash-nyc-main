import { useEffect, useState, useRef } from 'react';
import { useCourier } from '@/contexts/CourierContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Phone, Store, Home, Navigation, Clock, Star, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { playNotificationSound, playSuccessSound } from '@/utils/notificationSound';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Order {
  id: string;
  order_number: string;
  tracking_code?: string;
  status: string;
  total_amount: number;
  subtotal?: number;
  delivery_address: string;
  delivery_borough: string;
  tip_amount?: number;
  special_instructions?: string;
  requires_id_check?: boolean;
  customer_name?: string;
  customer_phone?: string;
  customer_id?: string;
  user_id?: string;
  accepted_at?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  customer_order_count?: number;
  distance?: string;
  addresses?: {
    street: string;
    city: string;
    borough: string;
    zip_code: string;
    state: string;
  };
  merchants?: {
    business_name: string;
    address: string;
  };
  order_items?: Array<{
    quantity: number;
    products?: {
      name: string;
    };
  }>;
}

// Countdown Timer Component
const CountdownTimer = ({ startTime }: { startTime: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startTime);
      const deadline = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setIsOverdue(true);
        const overdue = Math.abs(diff);
        const minutes = Math.floor(overdue / 60000);
        setTimeLeft(`${minutes} min OVERDUE`);
      } else {
        setIsOverdue(false);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-white'}`}>
      <Clock className="w-5 h-5" />
      <span className={`font-bold text-lg ${isOverdue ? 'animate-pulse' : ''}`}>
        {timeLeft}
      </span>
      {isOverdue && <span className="text-xs">(URGENT!)</span>}
    </div>
  );
};

// Customer Badge Component
const CustomerBadge = ({ orderCount }: { orderCount: number }) => {
  if (orderCount === 0) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
        <User className="w-3 h-3 mr-1" />
        New Customer
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
      <Star className="w-3 h-3 mr-1" />
      Returning ({orderCount})
    </Badge>
  );
};

interface TodayStats {
  deliveries_completed: number;
  total_earned: string;
  hours_online: string;
  active_orders: number;
  tips_earned?: string;
  bonuses_earned?: string;
}

interface CourierLocation {
  latitude: number;
  longitude: number;
}

export default function CourierDashboard() {
  const { courier, loading: courierLoading, isOnline, toggleOnlineStatus } = useCourier();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<CourierLocation | null>(null);
  const locationWatchId = useRef<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [acceptedOrder, setAcceptedOrder] = useState<Order | null>(null);
  const [autoOpenMaps, setAutoOpenMaps] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
    // Create audio element for notifications
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyByPLaiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUsgcjy2ok3CBlou+3nn00QDFCS');
  }, []);

  // Start location tracking
  useEffect(() => {
    if ('geolocation' in navigator && isOnline) {
      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          // Update location in database every 15 seconds
          updateLocationInDB(latitude, longitude, accuracy, speed, heading);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to track location. Please enable GPS.');
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, [isOnline]);

  const updateLocationInDB = async (lat: number, lng: number, accuracy?: number, speed?: number | null, heading?: number | null) => {
    try {
      await supabase.functions.invoke('courier-app', {
        body: {
          endpoint: 'update-location',
          lat,
          lng,
          accuracy,
          speed: speed || 0,
          heading: heading || 0
        }
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Open navigation in device's map app
  const openNavigation = (order: Order, destination: 'pickup' | 'delivery') => {
    const lat = destination === 'pickup' ? order.pickup_lat : order.dropoff_lat;
    const lng = destination === 'pickup' ? order.pickup_lng : order.dropoff_lng;
    
    if (!lat || !lng) {
      toast.error('Location not available');
      return;
    }
    
    // Detect device and open appropriate map app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    
    window.open(url, '_blank');
  };

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

  // Fetch active orders with customer info
  const { data: myOrdersData } = useQuery({
    queryKey: ['courier-my-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'my-orders', status: 'active' }
      });
      if (error) throw error;
      
      // Fetch customer order counts
      if (data?.orders) {
        const ordersWithCounts = await Promise.all(
          data.orders.map(async (order: Order) => {
            if (order.user_id) {
              const { count } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', order.user_id)
                .eq('status', 'delivered');
              
              return { ...order, customer_order_count: count || 0 };
            }
            return { ...order, customer_order_count: 0 };
          })
        );
        return { ...data, orders: ordersWithCounts };
      }
      
      return data;
    },
    refetchInterval: 15000,
    enabled: !!courier
  });

  // Fetch available orders with customer info
  const { data: availableOrdersData } = useQuery({
    queryKey: ['courier-available-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'available-orders' }
      });
      if (error) throw error;
      
      // Fetch customer order counts
      if (data?.orders) {
        const ordersWithCounts = await Promise.all(
          data.orders.map(async (order: Order) => {
            if (order.user_id) {
              const { count } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', order.user_id)
                .eq('status', 'delivered');
              
              return { ...order, customer_order_count: count || 0 };
            }
            return { ...order, customer_order_count: 0 };
          })
        );
        return { ...data, orders: ordersWithCounts };
      }
      
      return data;
    },
    refetchInterval: 15000,
    enabled: !!courier && isOnline
  });

  // Accept order mutation
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('🚀 Accepting order:', orderId);
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'accept-order', order_id: orderId }
      });
      console.log('📦 Accept order response:', { data, error });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      console.log('✅ Accept order SUCCESS, data:', data);
      
      // Play notification sound
      playNotificationSound();
      
      const fullOrder = data?.order;
      console.log('🔍 Extracted fullOrder:', fullOrder);
      
      if (fullOrder) {
        console.log('🎉 Setting modal states...');
        console.log('  - acceptedOrder:', fullOrder);
        console.log('  - showAcceptedModal: true');
        console.log('  - expandedOrderId:', fullOrder.id);
        
        setAcceptedOrder(fullOrder);
        setShowAcceptedModal(true);
        setExpandedOrderId(fullOrder.id);
        
        console.log('✅ Modal states set! Modal should appear now.');
        
        // Auto-open maps if enabled
        if (autoOpenMaps && fullOrder.pickup_lat && fullOrder.pickup_lng) {
          console.log('🗺️ Auto-opening maps in 1.5s...');
          setTimeout(() => {
            openNavigation(fullOrder, 'pickup');
          }, 1500);
        }
      } else {
        console.error('❌ No order found in response data:', data);
      }
      
      // Delay query refresh to ensure database update completes
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['courier-my-orders'] });
        queryClient.invalidateQueries({ queryKey: ['courier-available-orders'] });
        queryClient.invalidateQueries({ queryKey: ['courier-today-stats'] });
      }, 800);
    },
    onError: (error) => {
      console.error('❌ Accept order ERROR:', error);
      toast.error("Order no longer available - someone else accepted it!");
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      console.log('🔄 updateStatusMutation called with:', { orderId, newStatus });
      
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
      console.log('✅ Order status updated successfully');
      const statusMessages: Record<string, string> = {
        'out_for_delivery': '🚗 Order marked as picked up - en route to customer!',
        'delivered': '🎉 Delivery completed! Earnings added to your account.',
        'preparing': '👨‍🍳 Order moved back to preparing status'
      };
      
      toast.success(statusMessages[variables.newStatus] || "Status updated successfully");
      
      // Play success sound for delivery completion
      if (variables.newStatus === 'delivered') {
        playSuccessSound();
      }
      
      // Delay the refresh slightly for delivered orders to let user see the success message
      if (variables.newStatus === 'delivered') {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['courier-my-orders'] });
          queryClient.invalidateQueries({ queryKey: ['courier-today-stats'] });
          queryClient.invalidateQueries({ queryKey: ['courier-available-orders'] });
        }, 1500);
      } else {
        queryClient.invalidateQueries({ queryKey: ['courier-my-orders'] });
        queryClient.invalidateQueries({ queryKey: ['courier-today-stats'] });
      }
    },
    onError: (error: Error) => {
      console.error('❌ updateStatusMutation error:', error);
      toast.error("Error updating status: " + error.message);
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
  let availableOrders = (availableOrdersData?.orders || []) as Order[];
  
  // Add distance to available orders and sort by proximity
  if (currentLocation && availableOrders.length > 0) {
    availableOrders = availableOrders
      .map(order => ({
        ...order,
        distance: order.pickup_lat && order.pickup_lng
          ? calculateDistance(currentLocation.latitude, currentLocation.longitude, order.pickup_lat, order.pickup_lng)
          : '?'
      }))
      .sort((a, b) => {
        const distA = typeof a.distance === 'string' && a.distance !== '?' ? parseFloat(a.distance) : 999;
        const distB = typeof b.distance === 'string' && b.distance !== '?' ? parseFloat(b.distance) : 999;
        return distA - distB;
      });
  }

  // Show notification if there are active deliveries
  useEffect(() => {
    if (activeOrders.length > 0 && notificationPermission === 'granted') {
      new Notification('Active Delivery', {
        body: `You have ${activeOrders.length} active ${activeOrders.length === 1 ? 'delivery' : 'deliveries'}`,
        tag: 'active-delivery'
      });
    }
  }, [activeOrders.length, notificationPermission]);
  
  const courierCommissionRate = courier?.commission_rate || 30;

  const markPickedUp = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, newStatus: 'out_for_delivery' });
  };

  const markDelivered = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, newStatus: 'delivered' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Active Delivery Notification Banner */}
      {activeOrders.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 text-center font-bold animate-pulse sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl animate-bounce">🚨</span>
            <span>{activeOrders.length} ACTIVE {activeOrders.length === 1 ? 'DELIVERY' : 'DELIVERIES'} IN PROGRESS</span>
          </div>
        </div>
      )}

      {/* Fixed Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-40 shadow-lg">
        <div className="px-4 py-4">
          {/* Online Toggle - Prominent */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">
                {isOnline ? '🟢' : '⚪'} Hi, {courier?.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-sm text-blue-100">
                {isOnline ? 'Online & Ready' : 'Offline'}
              </p>
            </div>
            
            {/* Large Toggle Switch */}
            <button
              onClick={toggleOnlineStatus}
              className={`
                relative inline-flex h-14 w-28 items-center rounded-full transition-colors shadow-lg
                ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
              `}
            >
              <span className={`
                inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center text-2xl
                ${isOnline ? 'translate-x-14' : 'translate-x-1'}
              `}>
                {isOnline ? '🟢' : '⚪'}
              </span>
            </button>
          </div>

          {/* Today's Earnings Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold">{stats?.deliveries_completed || 0}</div>
                <div className="text-xs text-blue-100">Deliveries</div>
              </div>
              <div>
                <div className="text-2xl font-bold">${stats?.total_earned || '0.00'}</div>
                <div className="text-xs text-blue-100">Total Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold">${stats?.tips_earned || '0.00'}</div>
                <div className="text-xs text-blue-100">Tips</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Active Orders - Priority Section */}
        {activeOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">🚗 Active Deliveries</h2>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                {activeOrders.length}
              </span>
            </div>

            <div className="space-y-4">
              {activeOrders.map(order => {
                // Calculate commission on subtotal only (excludes delivery fee)
                const earnings = (parseFloat(order.subtotal?.toString() || '0') * (courierCommissionRate / 100)).toFixed(2);
                const isExpanded = expandedOrderId === order.id;
                
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200">
                    {/* Order Header - Clickable */}
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 cursor-pointer"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      {/* Countdown Timer - Prominent */}
                      {order.accepted_at && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
                          <CountdownTimer startTime={order.accepted_at} />
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-lg">Order #{order.tracking_code || order.order_number}</p>
                          <p className="text-sm opacity-90">{order.order_items?.length || 0} items</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">${earnings}</div>
                          {order.tip_amount && order.tip_amount > 0 && (
                            <div className="text-xs opacity-90">+ ${order.tip_amount.toFixed(2)} tip</div>
                          )}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-75">Customer:</p>
                            <p className="font-bold text-lg">{order.customer_name || 'Customer'}</p>
                            <p className="text-sm opacity-90">📞 {order.customer_phone || 'N/A'}</p>
                          </div>
                          <CustomerBadge orderCount={order.customer_order_count || 0} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`
                          inline-block px-4 py-2 rounded-full text-sm font-bold
                          ${order.status === 'preparing' ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-400 text-blue-900'}
                        `}>
                          {order.status === 'preparing' ? '👨‍🍳 Preparing' : '🚗 Out for Delivery'}
                        </span>
                        
                        <div className="text-white flex items-center gap-2">
                          {isExpanded ? '▼ Collapse' : '▶ Expand Details'}
                        </div>
                      </div>
                    </div>

                    {/* Locations - Expandable */}
                    {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* Pickup */}
                      <div className="bg-orange-50 rounded-xl p-3 border-2 border-orange-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-orange-600">📦 PICKUP FROM</p>
                              {order.status === 'preparing' && (
                                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-bold animate-pulse">
                                  GO HERE FIRST
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-gray-900">{order.merchants?.business_name}</p>
                            <p className="text-sm text-gray-600">{order.merchants?.address}</p>
                            {order.special_instructions && (
                              <p className="text-xs text-orange-700 mt-2 bg-orange-100 p-2 rounded">
                                📝 {order.special_instructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openNavigation(order, 'pickup')}
                            className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg font-semibold text-sm hover:bg-orange-700 transition"
                          >
                            🧭 Navigate
                          </button>
                          <a
                            href={`tel:`}
                            className="bg-white border-2 border-orange-600 text-orange-600 py-2 px-3 rounded-lg font-semibold text-sm hover:bg-orange-50 transition"
                          >
                            📞 Call
                          </a>
                        </div>
                      </div>

                      {/* Arrow Down */}
                      <div className="flex justify-center">
                        <svg className="w-8 h-8 text-gray-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>

                      {/* Delivery */}
                      <div className="bg-green-50 rounded-xl p-3 border-2 border-green-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-bold text-green-600">📍 DELIVER TO</p>
                              {order.status === 'out_for_delivery' && (
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                  🎯 DELIVER HERE
                                </span>
                              )}
                            </div>
                            
                            {/* Customer Name Prominent */}
                            <div className="bg-green-100 rounded-lg p-3 mb-3">
                              <p className="text-xs text-green-600">Delivering to:</p>
                              <p className="font-bold text-2xl text-green-900">{order.customer_name || 'Customer'}</p>
                              <p className="text-sm text-green-700">📞 {order.customer_phone || 'N/A'}</p>
                            </div>
                            
                            <p className="text-sm text-gray-600">{order.addresses?.street}</p>
                            <p className="text-sm text-gray-600">
                              {order.addresses?.city}, {order.addresses?.state} {order.addresses?.zip_code}
                            </p>
                            {order.requires_id_check && (
                              <p className="text-xs text-red-700 mt-2 bg-red-100 p-2 rounded font-bold">
                                ⚠️ ID VERIFICATION REQUIRED (21+)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openNavigation(order, 'delivery')}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg font-semibold text-sm hover:bg-green-700 transition"
                          >
                            🧭 Navigate
                          </button>
                          <a
                            href={`tel:${order.customer_phone || ''}`}
                            className="bg-white border-2 border-green-600 text-green-600 py-2 px-3 rounded-lg font-semibold text-sm hover:bg-green-50 transition"
                          >
                            📞 Call
                          </a>
                        </div>
                      </div>

                      {/* Items Preview */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-gray-600 mb-2">📋 ORDER ITEMS ({order.order_items.length})</p>
                          <div className="space-y-1">
                            {order.order_items.slice(0, 3).map((item, idx) => (
                              <p key={idx} className="text-sm text-gray-700">
                                {item.quantity}x {item.products?.name}
                              </p>
                            ))}
                            {order.order_items.length > 3 && (
                              <p className="text-xs text-gray-500">+ {order.order_items.length - 3} more items</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {order.status === 'preparing' && (
                          <>
                            <Button
                              onClick={() => markPickedUp(order.id)}
                              disabled={updateStatusMutation.isPending}
                              className="w-full bg-blue-600 hover:bg-blue-700 py-5 text-lg font-bold shadow-lg"
                            >
                              ✅ Mark as Picked Up - En Route
                            </Button>
                            <p className="text-xs text-center text-gray-500">
                              Click after picking up from restaurant
                            </p>
                          </>
                        )}
                        
                        {order.status === 'out_for_delivery' && (
                          <>
                            <Button
                              onClick={() => markDelivered(order.id)}
                              disabled={updateStatusMutation.isPending}
                              className="w-full bg-green-600 hover:bg-green-700 py-5 text-lg font-bold shadow-lg"
                            >
                              🎉 Confirm Delivery Complete
                            </Button>
                            <Button
                              onClick={() => updateStatusMutation.mutate({ orderId: order.id, newStatus: 'preparing' })}
                              disabled={updateStatusMutation.isPending}
                              variant="outline"
                              className="w-full py-3 font-semibold text-gray-600"
                            >
                              ← Back to Preparing (if mistake)
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Orders - ALWAYS VISIBLE IF ONLINE */}
        {isOnline && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📦 Available Orders Nearby
              {availableOrders.length > 0 ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  {availableOrders.length} Available
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm">
                  None Available
                </span>
              )}
            </h2>

            {availableOrders.length > 0 ? (
              <div className="space-y-3">
                {availableOrders.map(order => {
                  // Calculate commission on subtotal (excludes delivery fee)
                  const earnings = (parseFloat(order.subtotal?.toString() || '0') * (courierCommissionRate / 100)).toFixed(2);
                  const distance = (order as any).distance || '?';
                  const estimatedTime = distance !== '?' ? Math.ceil(parseFloat(distance) * 3) : '?';
                  
                  return (
                    <div key={order.id} className="bg-white rounded-2xl shadow-lg mb-3 p-4 border-2 border-gray-200 hover:border-green-400 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-xl mb-1">{order.merchants?.business_name}</p>
                          <p className="text-sm text-gray-600 mb-2">{order.merchants?.address}</p>
                          
                          {/* Customer Info Preview */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">
                              For: <span className="font-semibold">{order.customer_name || 'Customer'}</span>
                            </span>
                            <CustomerBadge orderCount={order.customer_order_count || 0} />
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {distance} mi
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              ~{estimatedTime} min
                            </span>
                            <span>•</span>
                            <span>💰 ${order.total_amount}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-green-600">${earnings}</div>
                          <div className="text-xs text-gray-500">You earn</div>
                        </div>
                      </div>

                      <button
                        onClick={() => acceptOrderMutation.mutate(order.id)}
                        disabled={acceptOrderMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl shadow-lg text-lg transform hover:scale-105 transition"
                      >
                        {acceptOrderMutation.isPending ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Accepting...
                          </span>
                        ) : (
                          'Accept Order →'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-100 rounded-xl">
                <p className="text-gray-500">No orders available right now</p>
                <p className="text-sm text-gray-400 mt-1">Keep checking back!</p>
              </div>
            )}
          </div>
        )}

        {/* Empty States */}
        {activeOrders.length === 0 && (!isOnline || availableOrders.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{isOnline ? '🔍' : '😴'}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isOnline ? 'Looking for orders...' : "You're Offline"}
            </h3>
            <p className="text-gray-600 mb-4">
              {isOnline 
                ? 'New orders will appear here automatically'
                : 'Toggle online to start receiving orders'
              }
            </p>
            {!isOnline && (
              <button
                onClick={toggleOnlineStatus}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition"
              >
                Go Online
              </button>
            )}
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMap && selectedOrder && currentLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Order Route</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="h-96">
              <MapContainer
                center={[currentLocation.latitude, currentLocation.longitude]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* Current Location */}
                <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
                  <Popup>📍 Your Location</Popup>
                </Marker>
                
                {/* Pickup Location */}
                {selectedOrder.pickup_lat && selectedOrder.pickup_lng && (
                  <Marker position={[selectedOrder.pickup_lat, selectedOrder.pickup_lng]}>
                    <Popup>📦 Pickup: {selectedOrder.merchants?.business_name}</Popup>
                  </Marker>
                )}
                
                {/* Dropoff Location */}
                {selectedOrder.dropoff_lat && selectedOrder.dropoff_lng && (
                  <Marker position={[selectedOrder.dropoff_lat, selectedOrder.dropoff_lng]}>
                    <Popup>🏠 Delivery: {selectedOrder.addresses?.street}</Popup>
                  </Marker>
                )}
                
                {/* Route Line */}
                {selectedOrder.pickup_lat && selectedOrder.pickup_lng && selectedOrder.dropoff_lat && selectedOrder.dropoff_lng && (
                  <Polyline
                    positions={[
                      [currentLocation.latitude, currentLocation.longitude],
                      [selectedOrder.pickup_lat, selectedOrder.pickup_lng],
                      [selectedOrder.dropoff_lat, selectedOrder.dropoff_lng]
                    ]}
                    pathOptions={{ color: 'blue', weight: 4, opacity: 0.7 }}
                  />
                )}
              </MapContainer>
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={() => openNavigation(selectedOrder, selectedOrder.status === 'preparing' ? 'pickup' : 'delivery')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Open in Maps App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Accepted Modal */}
      {showAcceptedModal && acceptedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center">
              <div className="text-6xl mb-3 animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Order Accepted!</h2>
              <p className="text-green-100">Great job! Here's where to go:</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Earnings Highlight */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                <p className="text-sm text-green-700 mb-1">You'll earn</p>
                <p className="text-4xl font-bold text-green-600 mb-1">
                  ${(parseFloat(acceptedOrder.subtotal?.toString() || '0') * (courierCommissionRate / 100)).toFixed(2)}
                </p>
                <p className="text-xs text-green-600">
                  (${acceptedOrder.subtotal} × {courierCommissionRate}%)
                </p>
              </div>

              {/* Step 1: Pickup */}
              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                  <p className="font-bold text-orange-900">PICKUP FROM</p>
                </div>
                <p className="font-bold text-lg mb-1">{acceptedOrder.merchants?.business_name}</p>
                <p className="text-sm text-gray-600 mb-3">{acceptedOrder.merchants?.address}</p>
                
                <Button
                  onClick={() => {
                    openNavigation(acceptedOrder, 'pickup');
                    setShowAcceptedModal(false);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 py-4 text-lg font-bold shadow-lg"
                >
                  <span className="text-2xl mr-2">🧭</span>
                  Open Maps - Go to Pickup
                </Button>
              </div>

              {/* Step 2: Deliver */}
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                  <p className="font-bold text-green-900">THEN DELIVER TO</p>
                </div>
                <p className="font-bold text-lg mb-1">{acceptedOrder.addresses?.street}</p>
                <p className="text-sm text-gray-600">
                  {acceptedOrder.addresses?.city}, {acceptedOrder.addresses?.state} {acceptedOrder.addresses?.zip_code}
                </p>
              </div>

              {/* Order Items Summary */}
              {acceptedOrder.order_items && acceptedOrder.order_items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    📋 {acceptedOrder.order_items.length} item{acceptedOrder.order_items.length !== 1 ? 's' : ''} to deliver:
                  </p>
                  <div className="space-y-1">
                    {acceptedOrder.order_items.slice(0, 3).map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        • {item.quantity}x {item.products?.name}
                      </p>
                    ))}
                    {acceptedOrder.order_items.length > 3 && (
                      <p className="text-xs text-gray-500">
                        + {acceptedOrder.order_items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-open Maps Setting */}
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <label className="text-sm text-gray-700">
                  Auto-open Maps when accepting orders
                </label>
                <input
                  type="checkbox"
                  checked={autoOpenMaps}
                  onChange={(e) => setAutoOpenMaps(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setShowAcceptedModal(false)}
                variant="secondary"
                className="w-full py-4 font-bold"
              >
                Got It! Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button className="flex flex-col items-center py-2 text-blue-600">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button
            onClick={() => navigate('/courier/earnings')}
            className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Earnings</span>
          </button>
          
          <button
            onClick={() => navigate('/courier/history')}
            className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">History</span>
          </button>
          
          <button
            onClick={() => navigate('/courier/profile')}
            className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
