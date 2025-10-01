import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Phone, MessageCircle, MapPin, Store, User, Clock } from 'lucide-react';

interface OrderTracking {
  id: string;
  tracking_code: string;
  order_number: string;
  status: string;
  created_at: string;
  delivered_at: string | null;
  estimated_delivery: string | null;
  delivery_address: string;
  delivery_borough: string;
  total_amount: number;
  merchant_name: string;
  merchant_address: string;
  courier_name: string | null;
  courier_vehicle: string | null;
  courier_lat: number | null;
  courier_lng: number | null;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📝', color: 'bg-gray-500' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', color: 'bg-blue-500' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: 'bg-orange-500' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗', color: 'bg-purple-500' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', color: 'bg-green-500' },
];

export default function TrackOrderLive() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (code) {
      fetchOrderTracking();
      
      const interval = setInterval(() => {
        fetchOrderTracking(true);
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [code]);

  const fetchOrderTracking = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(!silent);

    try {
      const { data, error } = await supabase
        .from('public_order_tracking')
        .select('*')
        .eq('tracking_code', code)
        .maybeSingle();

      if (error || !data) {
        toast.error('Order not found');
        setLoading(false);
        return;
      }

      setOrder(data);
    } catch (err) {
      toast.error('Failed to load tracking information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const index = STATUS_STEPS.findIndex(step => step.key === order.status);
    return index >= 0 ? index : 0;
  };

  const getEstimatedTime = () => {
    if (!order) return null;
    
    switch (order.status) {
      case 'confirmed':
        return '15-20 minutes until preparing';
      case 'preparing':
        return '20-30 minutes until pickup';
      case 'out_for_delivery':
        return '10-15 minutes until delivery';
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find an order with that tracking code
          </p>
          <Button onClick={() => navigate('/track')}>
            Try Another Code
          </Button>
        </Card>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Order #{order.order_number}</h1>
              <p className="text-sm text-muted-foreground">Tracking: {order.tracking_code}</p>
            </div>
            <Button
              onClick={() => fetchOrderTracking()}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Progress */}
        <Card className="p-6 mb-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => (
                <div key={step.key} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    {/* Icon */}
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-all
                      ${index <= currentStep 
                        ? `${step.color} scale-110 shadow-lg` 
                        : 'bg-muted'
                      }
                    `}>
                      {step.icon}
                    </div>
                    
                    {/* Label */}
                    <p className={`
                      text-sm font-medium text-center
                      ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}
                    `}>
                      {step.label}
                    </p>
                    
                    {/* Active indicator */}
                    {index === currentStep && (
                      <div className="mt-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Connecting line */}
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`
                      absolute top-8 left-1/2 w-full h-1 -translate-y-1/2
                      ${index < currentStep ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          {getEstimatedTime() && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-sm font-medium flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                {getEstimatedTime()}
              </p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Info */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Delivery Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">From</p>
                  <p className="text-base font-semibold">{order.merchant_name}</p>
                  <p className="text-sm text-muted-foreground">{order.merchant_address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Delivering to</p>
                  <p className="text-base font-semibold">{order.delivery_address}</p>
                  <p className="text-sm text-muted-foreground">{order.delivery_borough}</p>
                </div>
              </div>

              {order.courier_name && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Your Driver</p>
                    <p className="text-base font-semibold">{order.courier_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{order.courier_vehicle}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Order Details */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Order Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-semibold">${order.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold capitalize">{order.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Placed At</span>
                <span className="font-semibold">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              {order.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered At</span>
                  <span className="font-semibold">{new Date(order.delivered_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 p-6 text-center">
          <p className="text-muted-foreground mb-4">Need help with your order?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="default">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
            {order.courier_name && (
              <Button variant="outline">
                <Phone className="w-5 h-5 mr-2" />
                Call Driver
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
