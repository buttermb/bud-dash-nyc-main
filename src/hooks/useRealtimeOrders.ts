import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Order {
  id: string;
  status: string;
  tracking_code: string;
  total_amount: number;
  created_at: string;
  delivery_address: string;
  delivery_borough: string;
  eta_minutes?: number;
  eta_updated_at?: string;
  courier_id?: string;
  dropoff_lat?: number;
  dropoff_lng?: number;
  [key: string]: any;
}

interface UseRealtimeOrdersOptions {
  statusFilter?: string[];
  autoRefetch?: boolean;
  onUpdate?: (order: Order) => void;
}

export const useRealtimeOrders = (options: UseRealtimeOrdersOptions = {}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          merchants (business_name, address, phone),
          addresses (street, city, state, zip_code),
          couriers (full_name, phone, email, vehicle_type, current_lat, current_lng),
          order_items (
            quantity,
            price,
            product_name,
            products (name, image_url)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (options.statusFilter && options.statusFilter.length > 0) {
        query = query.in('status', options.statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [options.statusFilter]);

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const newChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new as Order;
          const oldOrder = payload.old as Order;

          if (payload.eventType === 'INSERT') {
            if (!options.statusFilter || options.statusFilter.includes(newOrder.status)) {
              fetchOrders();
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => 
              prev.map(order => 
                order.id === newOrder.id ? { ...order, ...newOrder } : order
              )
            );
            options.onUpdate?.(newOrder);
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== oldOrder.id));
          }
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [fetchOrders, options.onUpdate]);

  return {
    orders,
    loading,
    refetch: fetchOrders,
    channel
  };
};
