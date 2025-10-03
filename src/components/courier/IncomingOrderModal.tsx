import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Package, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IncomingOrderModalProps {
  order: any;
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingOrderModal({ order, open, onAccept, onReject }: IncomingOrderModalProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!open) return;
    
    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onReject]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await onAccept();
      toast.success('Order accepted!');
    } catch (error) {
      toast.error('Failed to accept order');
      setAccepting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0" onInteractOutside={(e) => e.preventDefault()}>
        {/* Map Preview */}
        <div className="h-48 bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Navigation className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">New Delivery Request</h2>
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>
          </div>

          {/* ETA */}
          {order.eta_minutes && (
            <div className="bg-primary/10 rounded-lg p-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Time</p>
                <p className="text-xl font-bold">{order.eta_minutes} minutes</p>
              </div>
            </div>
          )}

          {/* Pickup Location */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pickup</p>
                <p className="font-medium">{order.merchant_name || 'Merchant Location'}</p>
                <p className="text-sm text-muted-foreground">{order.pickup_address || 'Address loading...'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery</p>
                <p className="font-medium">{order.customer_name || 'Customer'}</p>
                <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                <p className="text-sm text-muted-foreground">{order.delivery_borough}</p>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Order Total</p>
              <p className="text-lg font-bold">${order.total_amount?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-lg font-bold">{order.distance_miles || '—'} mi</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onReject}
              disabled={accepting}
            >
              Decline
            </Button>
            <Button
              size="lg"
              onClick={handleAccept}
              disabled={accepting}
              className="bg-green-600 hover:bg-green-700"
            >
              {accepting ? 'Accepting...' : 'Accept Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}