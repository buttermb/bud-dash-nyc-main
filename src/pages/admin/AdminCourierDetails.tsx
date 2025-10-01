import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Mail, Phone, Car, DollarSign, Package, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Courier {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  license_number: string;
  is_active: boolean;
  is_online: boolean;
  commission_rate: number | null;
  age_verified: boolean;
  created_at: string;
  current_lat?: number | null;
  current_lng?: number | null;
}

interface CourierStats {
  total_deliveries: number;
  total_earnings: number;
  avg_per_delivery: number;
}

interface Shift {
  id: string;
  started_at: string;
  ended_at: string | null;
  total_hours: number;
  total_deliveries: number;
  total_earnings: number;
  status: string;
}

export default function AdminCourierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courier, setCourier] = useState<Courier | null>(null);
  const [stats, setStats] = useState<CourierStats | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);

  useEffect(() => {
    fetchCourierDetails();
  }, [id]);

  const fetchCourierDetails = async () => {
    try {
      // Fetch courier profile
      const { data: courierData, error: courierError } = await supabase
        .from('couriers')
        .select('*')
        .eq('id', id)
        .single();

      if (courierError) throw courierError;
      setCourier(courierData as unknown as Courier);

      // Fetch all orders for this courier
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('courier_id', id);

      // Fetch earnings
      const { data: earningsData } = await supabase
        .from('courier_earnings')
        .select('*')
        .eq('courier_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      setEarnings(earningsData || []);

      // Calculate stats
      const totalDeliveries = ordersData?.filter(o => o.status === 'delivered').length || 0;
      const totalEarnings = earningsData?.reduce((sum, e) => sum + parseFloat(e.total_earned.toString()), 0) || 0;
      const avgPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

      setStats({
        total_deliveries: totalDeliveries,
        total_earnings: totalEarnings,
        avg_per_delivery: avgPerDelivery
      });

      // Fetch recent shifts
      const { data: shiftsData } = await supabase
        .from('courier_shifts')
        .select('*')
        .eq('courier_id', id)
        .order('started_at', { ascending: false })
        .limit(10);

      setShifts(shiftsData || []);
    } catch (error) {
      console.error('Error fetching courier details:', error);
      toast({
        title: "Error",
        description: "Failed to load courier details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCourierStatus = async () => {
    if (!courier) return;

    try {
      const { error } = await supabase
        .from('couriers')
        .update({ is_active: !courier.is_active })
        .eq('id', courier.id);

      if (error) throw error;

      setCourier({ ...courier, is_active: !courier.is_active });
      toast({
        title: "Status updated",
        description: `Courier ${!courier.is_active ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!courier) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Courier not found</p>
            <Button onClick={() => navigate('/admin/couriers')} className="mt-4">
              Back to Couriers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/couriers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{courier.full_name}</h1>
            <p className="text-muted-foreground">Courier Details</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={courier.is_online ? "default" : "secondary"}>
            {courier.is_online ? 'Online' : 'Offline'}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm">Active:</span>
            <Switch checked={courier.is_active} onCheckedChange={toggleCourierStatus} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_deliveries || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats?.total_earnings.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Avg Per Delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avg_per_delivery.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{courier.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{courier.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">License:</span>
              <span className="font-mono">{courier.license_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Age Verified:</span>
              <Badge variant={courier.age_verified ? "default" : "secondary"}>
                {courier.age_verified ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{courier.vehicle_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Make/Model:</span>
              <span>{courier.vehicle_make} {courier.vehicle_model}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Plate:</span>
              <Badge variant="outline">{courier.vehicle_plate}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Commission Rate:</span>
              <span className="font-semibold">{courier.commission_rate || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location */}
      {courier.current_lat && courier.current_lng && (
        <Card>
          <CardHeader>
            <CardTitle>Current Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">
                {courier.current_lat.toFixed(6)}, {courier.current_lng.toFixed(6)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Last 20 earnings records</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No earnings yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order Total</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Earned</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>{new Date(earning.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>${earning.order_total}</TableCell>
                    <TableCell>{earning.commission_rate}%</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${earning.total_earned}
                    </TableCell>
                    <TableCell>
                      <Badge variant={earning.status === 'paid' ? 'default' : 'secondary'}>
                        {earning.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
          <CardDescription>Last 10 work sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shifts yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Ended</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>{new Date(shift.started_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(shift.started_at).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      {shift.ended_at ? new Date(shift.ended_at).toLocaleTimeString() : 'Active'}
                    </TableCell>
                    <TableCell>{shift.total_hours?.toFixed(1) || '-'}h</TableCell>
                    <TableCell>{shift.total_deliveries}</TableCell>
                    <TableCell className="font-semibold">${shift.total_earnings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
