import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Truck, Package, Clock, DollarSign, Users, Navigation, UserPlus, CheckCircle2, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignCourierDialog } from "@/components/admin/AssignCourierDialog";
import { useToast } from "@/hooks/use-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Use public token from environment or fallback
const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV1dGVybWIiLCJhIjoiY21nNzNrd3U3MGlyNjJqcTNlMnhsenFwbCJ9.Ss9KyWJkDeSvZilooUFZgA";
mapboxgl.accessToken = MAPBOX_TOKEN;

// Geocoding helper function
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].geometry.coordinates; // [lng, lat]
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Reverse geocoding helper function
const reverseGeocode = async (lng: number, lat: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

// Get optimized route using Mapbox Directions API
const getOptimizedRoute = async (
  start: [number, number], 
  end: [number, number]
): Promise<{ route: any; duration: number; distance: number } | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        route: route.geometry,
        duration: route.duration, // in seconds
        distance: route.distance, // in meters
      };
    }
    return null;
  } catch (error) {
    console.error("Route optimization error:", error);
    return null;
  }
};

interface RealtimeStats {
  ordersLastHour: number;
  revenueLastHour: number;
  activeCouriers: number;
  avgDeliveryTime: number;
  activeUsers: number;
}

const AdminLiveMap = () => {
  const { session } = useAdmin();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const heatmapSourceAdded = useRef(false);
  const routeLayersAdded = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!session) {
      console.log("No session available, skipping data fetch");
      return;
    }

    console.log("Session available, fetching data...");
    fetchLiveDeliveries(true); // Show loading on initial load
    fetchRealtimeStats();
    
    // Refresh data every 10 seconds
    const interval = setInterval(() => {
      console.log("Refreshing data...");
      fetchLiveDeliveries(); // Don't show loading on auto-refresh
      fetchRealtimeStats();
    }, 10000);
    
    // Set up real-time subscription for both deliveries and orders
    const channel = supabase
      .channel("live-map-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
        },
        (payload) => {
          console.log("Delivery update received:", payload);
          fetchLiveDeliveries();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Order update received:", payload);
          // Only refresh for accepted/active orders (not delivered or cancelled)
          const newRecord = payload.new as any;
          if (newRecord && ['accepted', 'confirmed', 'preparing', 'out_for_delivery'].includes(newRecord.status)) {
            fetchLiveDeliveries();
          } else if (newRecord && newRecord.status === 'delivered') {
            // Remove delivered order from live map immediately
            setDeliveries(prev => prev.filter(d => d.order_id !== newRecord.id));
          }
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
      });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Initialize map when container is ready
  useEffect(() => {
    if (map.current) {
      return; // Map already initialized
    }

    if (!mapContainer.current) {
      console.log("Map container not ready yet");
      return;
    }

    console.log("Initializing Mapbox map...");
    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-73.98, 40.75], // Manhattan center
        zoom: 11,
      });

      mapInstance.on('load', () => {
        console.log("Mapbox map loaded successfully");
        map.current = mapInstance;
        setLoading(false);
      });

      mapInstance.on('error', (e) => {
        console.error("Mapbox error:", e);
        setLoading(false);
      });

      mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setLoading(false);
    }
  });

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

    // Clear existing route layers
    routeLayersAdded.current.forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
      if (map.current!.getSource(layerId)) {
        map.current!.removeSource(layerId);
      }
    });
    routeLayersAdded.current.clear();

    if (deliveries.length === 0) {
      console.log("No deliveries to display");
      return;
    }

    // Add markers and routes for each delivery
    deliveries.forEach(async (delivery) => {
      console.log("Processing delivery:", delivery);
      
      // Calculate route if courier is assigned
      let routeData = null;
      if (delivery.courier?.current_lat && delivery.courier?.current_lng && delivery.dropoff_lat && delivery.dropoff_lng) {
        const courierLng = parseFloat(delivery.courier.current_lng);
        const courierLat = parseFloat(delivery.courier.current_lat);
        const dropoffLng = parseFloat(delivery.dropoff_lng);
        const dropoffLat = parseFloat(delivery.dropoff_lat);
        
        routeData = await getOptimizedRoute(
          [courierLng, courierLat],
          [dropoffLng, dropoffLat]
        );

        // Add route line to map
        if (routeData && map.current) {
          const routeId = `route-${delivery.id}`;
          if (!routeLayersAdded.current.has(routeId)) {
            map.current.addSource(routeId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeData.route
              }
            });

            map.current.addLayer({
              id: routeId,
              type: 'line',
              source: routeId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6', // Blue route line
                'line-width': 4,
                'line-opacity': 0.75
              }
            });

            routeLayersAdded.current.add(routeId);
            console.log("Added optimized route line for delivery:", delivery.id);
          }
        }
      }

      const etaText = routeData ? `⏱️ <strong>ETA:</strong> ${Math.round(routeData.duration / 60)} min | ${(routeData.distance / 1000).toFixed(1)} km` : '';
      
      // Show destination marker (dropoff)
      if (delivery.dropoff_lat && delivery.dropoff_lng) {
        const orderNumber = delivery.order?.order_number || `#${delivery.order?.id?.substring(0, 8).toUpperCase() || 'Order'}`;
        const items = delivery.order?.items || [];
        const itemsList = items.length > 0 
          ? items.map((item: any) => `${item.product_name || 'Product'} x${item.quantity || 1}`).join('<br/>')
          : 'No items';
        
        // Create custom marker element with action buttons
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.innerHTML = `
          <div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            📦
          </div>
        `;
        
        const popup = new mapboxgl.Popup({ 
          maxWidth: '350px',
          closeButton: true,
          closeOnClick: false
        }).setHTML(
          `<div style="padding: 12px; font-family: system-ui;" id="popup-${delivery.id}">
            <strong style="font-size: 16px;">${orderNumber}</strong><br/>
            ${etaText ? `<div style="margin-top: 8px; padding: 8px; background: #dbeafe; border-radius: 6px; color: #1e40af; font-size: 14px; font-weight: 500;">${etaText}</div>` : ''}
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <div style="color: #059669; font-weight: 600; margin-bottom: 4px;">Status: ${delivery.order?.status?.replace(/_/g, " ").toUpperCase() || 'PENDING'}</div>
              <div style="color: #374151; margin: 4px 0;"><strong>Delivery Address:</strong><br/>${delivery.order?.delivery_address || 'Unknown'}</div>
              <div style="color: #374151; margin: 4px 0;"><strong>Borough:</strong> ${delivery.order?.delivery_borough || 'N/A'}</div>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <strong>Items (${items.length}):</strong><br/>
              <div style="font-size: 14px; color: #4b5563; margin-top: 4px;">${itemsList}</div>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <strong>Total:</strong> <span style="color: #059669; font-weight: 600;">$${parseFloat(delivery.order?.total_amount || 0).toFixed(2)}</span>
            </div>
            ${delivery.courier 
              ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #059669;">
                   <strong>🚗 Courier:</strong> ${delivery.courier.full_name}<br/>
                   <span style="font-size: 14px;">${delivery.courier.vehicle_type} - ${delivery.courier.vehicle_plate}</span>
                 </div>
                 <button 
                   id="complete-${delivery.id}" 
                   style="width: 100%; margin-top: 8px; padding: 8px; background: #22c55e; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"
                 >
                   ✓ Mark as Delivered
                 </button>` 
              : `<button 
                   id="assign-${delivery.id}" 
                   style="width: 100%; margin-top: 8px; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"
                 >
                   👤 Assign Courier
                 </button>`
            }
          </div>`
        );

        const destinationMarker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([
            parseFloat(delivery.dropoff_lng),
            parseFloat(delivery.dropoff_lat),
          ])
          .setPopup(popup)
          .addTo(map.current!);

        // Add event listeners after popup opens
        popup.on('open', () => {
          const assignBtn = document.getElementById(`assign-${delivery.id}`);
          const completeBtn = document.getElementById(`complete-${delivery.id}`);
          
          if (assignBtn) {
            assignBtn.addEventListener('click', () => {
              setSelectedOrder({
                id: delivery.order_id,
                address: delivery.order?.delivery_address
              });
              setAssignDialogOpen(true);
            });
          }
          
          if (completeBtn) {
            completeBtn.addEventListener('click', async () => {
              await handleMarkDelivered(delivery.order_id);
            });
          }
        });

        markers.current.push(destinationMarker);
        console.log("Added destination marker for order:", orderNumber);
      }
      
      // Show courier location marker if available (green marker)
      if (delivery.courier?.current_lat && delivery.courier?.current_lng) {
        const courierLng = parseFloat(delivery.courier.current_lng);
        const courierLat = parseFloat(delivery.courier.current_lat);

        const courierMarker = new mapboxgl.Marker({ 
          color: "#22c55e" // Green for courier
        })
          .setLngLat([courierLng, courierLat])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<div style="padding: 12px; font-family: system-ui;">
                <strong style="font-size: 16px;">🚗 ${delivery.courier.full_name}</strong><br/>
                <div style="margin-top: 8px; color: #374151;">
                  <strong>Delivering:</strong> ${delivery.order?.order_number || 'Order'}<br/>
                  ${etaText ? `<div style="margin: 8px 0; padding: 8px; background: #dbeafe; border-radius: 6px; color: #1e40af; font-size: 14px;">${etaText}</div>` : ''}
                  <strong>Vehicle:</strong> ${delivery.courier.vehicle_type}<br/>
                  <strong>Plate:</strong> ${delivery.courier.vehicle_plate}
                </div>
              </div>`
            )
          )
          .addTo(map.current!);

        markers.current.push(courierMarker);
        console.log("Added courier marker with optimized route:", delivery.courier.full_name);
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
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 14 });
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

  const fetchLiveDeliveries = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
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
      
      // Filter out delivered orders from live map
      const activeDeliveries = (data.deliveries || []).filter(
        (delivery: any) => delivery.order?.status !== 'delivered'
      );
      
      setDeliveries(activeDeliveries);
    } catch (error) {
      console.error("Failed to fetch live deliveries:", error);
      setDeliveries([]); // Set empty array on error
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/update-order-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderId,
          status: "delivered",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order status");
      }

      toast({
        title: "Success",
        description: "Order marked as delivered",
      });

      fetchLiveDeliveries();
    } catch (error: any) {
      console.error("Failed to mark order as delivered:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update order status",
      });
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
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">Authentication Required</p>
            <p className="text-sm text-muted-foreground">
              Please log in to view the live delivery map
            </p>
          </CardContent>
        </Card>
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
                  <p className="text-2xl font-bold">
                    {stats.avgDeliveryTime > 0 ? `${stats.avgDeliveryTime}m` : 'N/A'}
                  </p>
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

                <div className="flex gap-2 pt-3">
                  {delivery.courier ? (
                    <Button
                      size="sm"
                      onClick={() => handleMarkDelivered(delivery.order_id)}
                      className="w-full flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as Delivered
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder({
                          id: delivery.order_id,
                          address: delivery.order?.delivery_address
                        });
                        setAssignDialogOpen(true);
                      }}
                      className="w-full flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Assign Courier
                    </Button>
                  )}
                </div>
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
          <div className="relative">
            <div 
              ref={mapContainer} 
              className="w-full h-[600px] rounded-lg border border-border bg-muted/50" 
              style={{ minHeight: '600px' }}
            />
            
            {/* Map Legend */}
            <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border z-10 max-w-xs">
              <h3 className="font-semibold text-sm mb-3">Map Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Delivery Destination</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Active Courier</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-blue-500 rounded"></div>
                  <span>Optimized Route</span>
                </div>
                <div className="mt-2 pt-2 border-t border-border text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    Routes use real-time traffic data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AssignCourierDialog
        orderId={selectedOrder?.id || ''}
        orderAddress={selectedOrder?.address || ''}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSuccess={() => {
          fetchLiveDeliveries();
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default AdminLiveMap;
