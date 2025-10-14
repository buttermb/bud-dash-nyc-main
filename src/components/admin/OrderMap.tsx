import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface OrderMapProps {
  orders: Array<{
    id: string;
    tracking_code: string;
    status: string;
    delivery_address: string;
    dropoff_lat?: number;
    dropoff_lng?: number;
    courier?: {
      full_name: string;
      current_lat?: number;
      current_lng?: number;
    };
  }>;
  selectedOrderId?: string;
  onOrderSelect?: (orderId: string) => void;
}

export const OrderMap = ({ orders, selectedOrderId, onOrderSelect }: OrderMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-73.935242, 40.730610], // NYC
      zoom: 11
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !orders.length) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;

    orders.forEach(order => {
      // Add delivery location marker
      if (order.dropoff_lat && order.dropoff_lng && 
          !isNaN(order.dropoff_lat) && !isNaN(order.dropoff_lng)) {
        const el = document.createElement('div');
        el.className = 'map-marker-delivery';
        el.style.cssText = `
          width: 32px;
          height: 32px;
          background-color: ${order.id === selectedOrderId ? '#10b981' : '#3b82f6'};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        `;
        el.textContent = '📦';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([order.dropoff_lng, order.dropoff_lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <strong>${order.tracking_code}</strong><br/>
                  <span style="font-size: 12px;">${order.delivery_address}</span><br/>
                  <span style="font-size: 11px; color: #666;">${order.status}</span>
                </div>
              `)
          )
          .addTo(map.current!);

        el.addEventListener('click', () => onOrderSelect?.(order.id));
        
        bounds.extend([order.dropoff_lng, order.dropoff_lat]);
        hasValidCoordinates = true;
      }

      // Add courier location marker
      if (order.courier?.current_lat && order.courier?.current_lng &&
          !isNaN(order.courier.current_lat) && !isNaN(order.courier.current_lng)) {
        const courierEl = document.createElement('div');
        courierEl.className = 'map-marker-courier';
        courierEl.style.cssText = `
          width: 40px;
          height: 40px;
          background-color: #8b5cf6;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        `;
        courierEl.textContent = '🚗';

        new mapboxgl.Marker(courierEl)
          .setLngLat([order.courier.current_lng, order.courier.current_lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <strong>${order.courier.full_name}</strong><br/>
                  <span style="font-size: 12px;">Courier for ${order.tracking_code}</span>
                </div>
              `)
          )
          .addTo(map.current!);

        bounds.extend([order.courier.current_lng, order.courier.current_lat]);
        hasValidCoordinates = true;
      }
    });

    // Fit map to show all markers, or default to NYC
    if (hasValidCoordinates && !bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14
      });
    } else {
      // Default to NYC view if no valid coordinates
      map.current.flyTo({
        center: [-73.935242, 40.730610],
        zoom: 11
      });
    }
  }, [orders, mapLoaded, selectedOrderId, onOrderSelect]);

  if (!MAPBOX_TOKEN) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your environment variables.
              <br />
              <a 
                href="https://mapbox.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-destructive-foreground mt-2 inline-block"
              >
                Get your Mapbox token here →
              </a>
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Live Order Map</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-500/10">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Deliveries ({orders.length})
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              Couriers
            </Badge>
          </div>
        </div>
      </div>
      <div ref={mapContainer} className="h-[500px] w-full" />
    </Card>
  );
};
