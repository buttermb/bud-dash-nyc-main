import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Package, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoiYnV1dGVybWIiLCJhIjoiY21nNzNrd3U3MGlyNjJqcTNlMnhsenFwbCJ9.Ss9KyWJkDeSvZilooUFZgA";

const AdminLiveMap = () => {
  const { session } = useAdmin();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (session) {
      fetchLiveDeliveries();
      
      // Set up real-time subscription
      const channel = supabase
        .channel("live-deliveries")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "deliveries",
          },
          () => {
            fetchLiveDeliveries();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on New York
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-73.935242, 40.730610], // NYC coordinates
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !deliveries.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for each delivery
    deliveries.forEach((delivery) => {
      if (delivery.courier?.current_lat && delivery.courier?.current_lng) {
        const marker = new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat([
            parseFloat(delivery.courier.current_lng),
            parseFloat(delivery.courier.current_lat),
          ])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<strong>${delivery.order.order_number}</strong><br/>
               Courier: ${delivery.courier?.full_name || "Unassigned"}<br/>
               Status: ${delivery.order.status.replace("_", " ")}`
            )
          )
          .addTo(map.current!);

        markers.current.push(marker);
      }
    });

    // Fit map to markers if there are any
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.current.forEach(marker => {
        const lngLat = marker.getLngLat();
        bounds.extend(lngLat);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [deliveries]);

  const fetchLiveDeliveries = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-dashboard", {
        body: { endpoint: "live-deliveries" },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (error) throw error;
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error("Failed to fetch live deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      preparing: "bg-purple-500",
      out_for_delivery: "bg-green-500",
      delivered: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Delivery Map</h1>
        <p className="text-muted-foreground">
          Real-time tracking of active deliveries ({deliveries.length} active)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deliveries.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">No active deliveries</p>
              <p className="text-sm text-muted-foreground">
                All orders are either pending or completed
              </p>
            </CardContent>
          </Card>
        ) : (
          deliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {delivery.order.order_number}
                  </CardTitle>
                  <Badge className={getStatusColor(delivery.order.status)}>
                    {delivery.order.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-muted-foreground">
                      {delivery.order.delivery_address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Courier</p>
                    <p className="text-muted-foreground">
                      {delivery.courier?.full_name || "Unassigned"}
                    </p>
                    {delivery.courier && (
                      <p className="text-xs text-muted-foreground">
                        {delivery.courier.vehicle_type} - {delivery.courier.vehicle_plate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Items</p>
                    <p className="text-muted-foreground">
                      {delivery.order.items?.length || 0} items - $
                      {parseFloat(delivery.order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-muted-foreground">
                      {delivery.estimated_dropoff_time
                        ? new Date(delivery.estimated_dropoff_time).toLocaleTimeString()
                        : "Calculating..."}
                    </p>
                  </div>
                </div>

                {delivery.courier?.current_lat && delivery.courier?.current_lng && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Last location: {parseFloat(delivery.courier.current_lat).toFixed(4)}, 
                      {parseFloat(delivery.courier.current_lng).toFixed(4)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Delivery Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={mapContainer} className="w-full h-[600px] rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLiveMap;
