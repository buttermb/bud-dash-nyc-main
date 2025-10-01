import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Truck, Phone, Mail, MapPin, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AddCourierDialog } from "@/components/admin/AddCourierDialog";

const AdminCouriers = () => {
  const { session } = useAdmin();
  const { toast } = useToast();
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session) {
      fetchCouriers();
      
      // Set up real-time subscription
      const channel = supabase
        .channel("couriers-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "couriers",
          },
          () => {
            fetchCouriers();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  const fetchCouriers = async () => {
    try {
      const { data, error } = await supabase
        .from("couriers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCouriers(data || []);
    } catch (error) {
      console.error("Failed to fetch couriers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load couriers",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCourierStatus = async (courierId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("couriers")
        .update({ is_active: !currentStatus })
        .eq("id", courierId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Courier ${!currentStatus ? "activated" : "deactivated"} successfully`,
      });

      fetchCouriers();
    } catch (error) {
      console.error("Failed to update courier:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update courier status",
      });
    }
  };

  const filteredCouriers = couriers.filter((courier) =>
    courier.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courier.phone.includes(searchTerm) ||
    courier.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courier Management</h1>
        <p className="text-muted-foreground">
          Manage delivery couriers and their status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Couriers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{couriers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Couriers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {couriers.filter((c) => c.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Online Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {couriers.filter((c) => c.is_online).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {couriers.filter((c) => c.age_verified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <AddCourierDialog onSuccess={fetchCouriers} />
      </div>

      {/* Couriers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Couriers</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCouriers.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">No couriers found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search" : "No couriers registered yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Courier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCouriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{courier.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {courier.id.substring(0, 8)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {courier.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {courier.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{courier.vehicle_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {courier.vehicle_make} {courier.vehicle_model}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {courier.vehicle_plate}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={courier.is_active ? "default" : "secondary"}>
                          {courier.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {courier.is_online && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            Online
                          </Badge>
                        )}
                        {courier.age_verified && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {courier.current_lat && courier.current_lng ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {courier.current_lat.toFixed(4)}, {courier.current_lng.toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No location</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCourierStatus(courier.id, courier.is_active)}
                      >
                        {courier.is_active ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCouriers;
