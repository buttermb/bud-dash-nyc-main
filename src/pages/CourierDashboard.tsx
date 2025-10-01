import { useEffect, useState, useRef } from 'react';
import { useCourier } from '@/contexts/CourierContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Phone, Store, Home, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  delivery_address: string;
  delivery_borough: string;
  tip_amount?: number;
  special_instructions?: string;
  requires_id_check?: boolean;
  customer_name?: string;
  customer_phone?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
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
  
  const courierCommissionRate = courier?.commission_rate || 30;

  const markPickedUp = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'out_for_delivery' });
  };

  const markDelivered = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'delivered' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Fixed Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-50 shadow-lg">
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
                const earnings = (parseFloat(order.total_amount.toString()) * (courierCommissionRate / 100)).toFixed(2);
                
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm opacity-90">Order #{order.order_number}</p>
                          {order.tracking_code && (
                            <p className="text-xs opacity-75">{order.tracking_code}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">${earnings}</div>
                          {order.tip_amount && order.tip_amount > 0 && (
                            <div className="text-xs opacity-90">+ ${order.tip_amount.toFixed(2)} tip</div>
                          )}
                        </div>
                      </div>
                      
                      <span className={`
                        inline-block px-3 py-1 rounded-full text-sm font-bold
                        ${order.status === 'preparing' ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-400 text-blue-900'}
                      `}>
                        {order.status === 'preparing' ? '👨‍🍳 Being Prepared' : '🚗 Out for Delivery'}
                      </span>
                    </div>

                    {/* Locations */}
                    <div className="p-4 space-y-4">
                      {/* Pickup */}
                      <div className="bg-orange-50 rounded-xl p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-orange-600 mb-1">📦 PICKUP FROM</p>
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
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>

                      {/* Delivery */}
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-green-600 mb-1">📍 DELIVER TO</p>
                            <p className="font-bold text-gray-900">{order.customer_name || 'Customer'}</p>
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
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-gray-50 border-t space-y-2">
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => markPickedUp(order.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition transform active:scale-95 text-lg"
                        >
                          ✅ Confirm Pickup
                        </button>
                      )}
                      
                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => markDelivered(order.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition transform active:scale-95 text-lg"
                        >
                          🎉 Complete Delivery
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowMap(true);
                        }}
                        className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
                      >
                        🗺️ View Map
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Orders */}
        {isOnline && availableOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">📦 Available Orders Nearby</h2>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                {availableOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {availableOrders.map(order => {
                const earnings = (parseFloat(order.total_amount.toString()) * (courierCommissionRate / 100)).toFixed(2);
                const distance = (order as any).distance || '?';
                const estimatedTime = distance !== '?' ? Math.ceil(parseFloat(distance) * 3) : '?';
                
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                          <p className="font-bold text-lg text-gray-900">{order.merchants?.business_name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <span>📍 {distance} mi</span>
                            <span>•</span>
                            <span>💰 ${order.total_amount}</span>
                            <span>•</span>
                            <span>⏱️ ~{estimatedTime} min</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">${earnings}</div>
                          <div className="text-xs text-gray-500">You earn</div>
                        </div>
                      </div>

                      <button
                        onClick={() => acceptOrderMutation.mutate(order.id)}
                        disabled={acceptOrderMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  </div>
                );
              })}
            </div>
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
          
          <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">History</span>
          </button>
          
          <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700">
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
