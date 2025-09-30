import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Truck, Package, Clock, DollarSign, Users, Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "sk.eyJ1IjoiYnV1dGVybWIiLCJhIjoiY21nNzV1Zm02MG41djJsb2hsbTRtZ2JxMSJ9.hQ-LbaAT6STZj5C79sXzmA";

interface RealtimeStats {
  ordersLastHour: number;
  revenueLastHour: number;
  activeCouriers: number;
  avgDeliveryTime: number;
  activeUsers: number;
}

const AdminLiveMap = () => {
  const { session } = useAdmin();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const heatmapSourceAdded = useRef(false);

  useEffect(() => {
    if (!session) {
      console.log("No session available, skipping data fetch");
      setLoading(false);
      return;
    }

    console.log("Session available, fetching data...");
    fetchLiveDeliveries();
    fetchRealtimeStats();
    
    // Refresh data every 10 seconds
    const interval = setInterval(() => {
      console.log("Refreshing data...");
      fetchLiveDeliveries();
      fetchRealtimeStats();
    }, 10000);
    
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
        (payload) => {
          console.log("Real-time update received:", payload);
          fetchLiveDeliveries();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Initialize map with retry logic
  useEffect(() => {
    // Delay initialization to ensure container is ready
    const timer = setTimeout(() => {
      if (!mapContainer.current) {
        console.log("Map container not ready");
        return;
      }

      if (map.current) {
        console.log("Map already initialized");
        return;
      }

      console.log("Initializing Mapbox map...");
      
      try {
        // Initialize map centered on New York
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [-73.935242, 40.730610], // NYC coordinates
          zoom: 11,
        });

        map.current.on('load', () => {
          console.log("Mapbox map loaded successfully");
        });

        map.current.on('error', (e) => {
          console.error("Mapbox error:", e);
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        console.log("Cleaning up map");
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) {
      console.log("Map not initialized yet");
      return;
    }

    console.log("Updating markers. Deliveries count:", deliveries.length);

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    if (deliveries.length === 0) {
      console.log("No deliveries to display");
      return;
    }

    // Add new markers for each delivery
    deliveries.forEach((delivery) => {
      console.log("Processing delivery:", delivery);
      
      if (delivery.courier?.current_lat && delivery.courier?.current_lng) {
        const marker = new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat([
            parseFloat(delivery.courier.current_lng),
            parseFloat(delivery.courier.current_lat),
          ])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<strong>${delivery.order?.order_number || 'Unknown'}</strong><br/>
               Courier: ${delivery.courier?.full_name || "Unassigned"}<br/>
               Status: ${delivery.order?.status?.replace("_", " ") || 'Unknown'}`
            )
          )
          .addTo(map.current!);

        markers.current.push(marker);
        console.log("Added marker for courier:", delivery.courier.full_name);
      } else {
        console.log("Delivery missing courier location:", delivery.id);
      }
    });

    console.log("Total markers added:", markers.current.length);

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

  // Add heatmap layer when enabled
  useEffect(() => {
    if (!map.current || !heatmapData) return;

    const mapInstance = map.current;

    if (showHeatmap && !heatmapSourceAdded.current) {
      mapInstance.addSource('heatmap-source', {
        type: 'geojson',
        data: heatmapData
      });

      mapInstance.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-source',
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': 0.5,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.7
        }
      });

      heatmapSourceAdded.current = true;
    } else if (!showHeatmap && heatmapSourceAdded.current) {
      if (mapInstance.getLayer('heatmap-layer')) {
        mapInstance.removeLayer('heatmap-layer');
      }
      if (mapInstance.getSource('heatmap-source')) {
        mapInstance.removeSource('heatmap-source');
      }
      heatmapSourceAdded.current = false;
    }
  }, [showHeatmap, heatmapData]);

  const fetchLiveDeliveries = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      console.log("Fetching live deliveries from:", `${supabaseUrl}/functions/v1/admin-dashboard?endpoint=live-deliveries`);
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-dashboard?endpoint=live-deliveries`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Live deliveries data:", data);
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error("Failed to fetch live deliveries:", error);
      setDeliveries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-dashboard?endpoint=realtime-stats`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch realtime stats:", error);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-dashboard?endpoint=heatmap&days=7&type=orders`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Convert to GeoJSON for Mapbox
        const geojson = {
          type: 'FeatureCollection',
          features: data.heatmapData.map((point: any) => ({
            type: 'Feature',
            properties: { intensity: point.intensity },
            geometry: {
              type: 'Point',
              coordinates: [point.lng, point.lat]
            }
          }))
        };
        
        setHeatmapData(geojson);
      }
    } catch (error) {
      console.error("Failed to fetch heatmap:", error);
    }
  };

  useEffect(() => {
    if (showHeatmap && !heatmapData) {
      fetchHeatmapData();
    }
  }, [showHeatmap]);

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
      {/* Debug Info */}
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Session Status</p>
              <p className="font-semibold">{session ? "✅ Connected" : "❌ Not Connected"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Admin User</p>
              <p className="font-semibold truncate">{session?.user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deliveries Loaded</p>
              <p className="font-semibold">{deliveries.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Map Status</p>
              <p className="font-semibold">{map.current ? "✅ Initialized" : "⚠️ Not Initialized"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Delivery Map</h1>
          <p className="text-muted-foreground">
            Real-time tracking of active deliveries ({deliveries.length} active)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
              id="heatmap-toggle"
            />
            <label htmlFor="heatmap-toggle" className="text-sm font-medium">
              Show Heatmap
            </label>
          </div>
        </div>
      </div>

      {/* Real-time Stats Bar */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orders (1h)</p>
                  <p className="text-2xl font-bold">{stats.ordersLastHour}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue (1h)</p>
                  <p className="text-2xl font-bold">${stats.revenueLastHour.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Couriers</p>
                  <p className="text-2xl font-bold">{stats.activeCouriers}</p>
                </div>
                <Truck className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Delivery</p>
                  <p className="text-2xl font-bold">{stats.avgDeliveryTime}m</p>
                </div>
                <Navigation className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
          <p className="text-sm text-muted-foreground mt-1">
            {deliveries.length > 0 
              ? `Tracking ${deliveries.length} active ${deliveries.length === 1 ? 'delivery' : 'deliveries'}`
              : 'No active deliveries to display'}
          </p>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapContainer} 
            className="w-full h-[600px] rounded-lg border border-border bg-muted/50" 
            style={{ minHeight: '600px' }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLiveMap;
