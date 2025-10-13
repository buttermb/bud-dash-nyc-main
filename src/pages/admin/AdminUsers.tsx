import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Shield, 
  ShieldOff, 
  Search, 
  Mail, 
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  ShoppingBag,
  DollarSign,
  Eye,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserProfile {
  id: string;
  user_id: string;
  age_verified: boolean;
  phone: string | null;
  full_name: string | null;
  created_at: string;
  email?: string;
  order_count?: number;
  total_spent?: number;
  last_order_date?: string;
  addresses?: any[];
  recent_orders?: any[];
}

const AdminUsers = () => {
  const { session } = useAdmin();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (session) {
      fetchUsers();

      // Realtime subscription for profiles updates
      const channel = supabase
        .channel('admin-users-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('Profile updated:', payload);
            fetchUsers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Parallel fetch all data at once
      const [profilesResponse, ordersResponse, addressesResponse, authUsersResponse] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total_amount, created_at, status, order_number, delivery_address").order("created_at", { ascending: false }),
        supabase.from("addresses").select("*"),
        supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } }))
      ]);

      if (profilesResponse.error) throw profilesResponse.error;

      const profiles = profilesResponse.data || [];
      const orders = ordersResponse.data || [];
      const addresses = addressesResponse.data || [];
      const authUsers = authUsersResponse?.data?.users || [];

      // Create lookup maps for O(1) access
      const authUserMap = new Map(authUsers.map((u: any) => [u.id, u]));
      const ordersByUser = new Map<string, any[]>();
      const addressesByUser = new Map<string, any[]>();

      orders.forEach(order => {
        if (!ordersByUser.has(order.user_id)) ordersByUser.set(order.user_id, []);
        ordersByUser.get(order.user_id)!.push(order);
      });

      addresses.forEach(addr => {
        if (!addressesByUser.has(addr.user_id)) addressesByUser.set(addr.user_id, []);
        addressesByUser.get(addr.user_id)!.push(addr);
      });

      // Combine data efficiently
      const enrichedUsers = profiles.map(profile => {
        const authUser = authUserMap.get(profile.user_id);
        const userOrders = ordersByUser.get(profile.user_id) || [];
        const userAddresses = addressesByUser.get(profile.user_id) || [];
        
        return {
          ...profile,
          email: authUser?.email || "Not provided",
          order_count: userOrders.length,
          total_spent: userOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
          last_order_date: userOrders[0]?.created_at,
          addresses: userAddresses,
          recent_orders: userOrders.slice(0, 5)
        };
      });

      setUsers(enrichedUsers);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ age_verified: !currentStatus })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "✓ Verification status updated",
        description: `User ${!currentStatus ? 'verified' : 'unverified'} successfully`,
      });

      await fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating verification",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleRow = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const openUserDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterVerified === "all" ||
      (filterVerified === "verified" && user.age_verified) ||
      (filterVerified === "unverified" && !user.age_verified);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage customer accounts and verification status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.age_verified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.age_verified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterVerified} onValueChange={setFilterVerified}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {/* Mobile Card View */}
          {isMobile ? (
            <div className="space-y-3 p-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {user.full_name || "Customer"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      {user.age_verified ? (
                        <Badge className="bg-green-600 flex-shrink-0">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex-shrink-0">
                          <XCircle className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span>{user.order_count || 0} orders</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-green-600">
                        <DollarSign className="h-4 w-4" />
                        {(user.total_spent || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openUserDetails(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant={user.age_verified ? "outline" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleVerification(user.user_id, user.age_verified)}
                      >
                        {user.age_verified ? (
                          <>
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Unverify
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-1" />
                            Verify
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Desktop Table View */
            <ScrollArea className="w-full">
              <div className="rounded-md border min-w-[900px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <React.Fragment key={user.id}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(user.user_id)}
                            >
                              {expandedRows.has(user.user_id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell onClick={() => openUserDetails(user)}>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.full_name || "Customer"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.phone ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {user.phone}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No phone</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.age_verified ? (
                              <Badge className="bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{user.order_count || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 font-semibold text-green-600">
                              <DollarSign className="h-4 w-4" />
                              {(user.total_spent || 0).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.last_order_date ? (
                              <div className="text-sm text-muted-foreground">
                                {new Date(user.last_order_date).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No orders</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUserDetails(user);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant={user.age_verified ? "outline" : "default"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVerification(user.user_id, user.age_verified);
                                }}
                              >
                                {user.age_verified ? (
                                  <>
                                    <ShieldOff className="h-4 w-4 mr-1" />
                                    Unverify
                                  </>
                                ) : (
                                  <>
                                    <Shield className="h-4 w-4 mr-1" />
                                    Verify
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    
                    {expandedRows.has(user.user_id) && (
                      <TableRow key={`expanded-${user.id}`}>
                        <TableCell colSpan={8} className="bg-muted/30 p-0">
                          <div className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Recent Orders */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <ShoppingBag className="h-4 w-4" />
                                  Recent Orders ({user.recent_orders?.length || 0})
                                </h4>
                                {user.recent_orders && user.recent_orders.length > 0 ? (
                                  <div className="space-y-2">
                                    {user.recent_orders.map((order, idx) => (
                                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-card border text-sm">
                                        <div>
                                          <div className="font-medium">
                                            #{order.order_number || (order.id ? order.id.substring(0, 8) : 'N/A')}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold">${Number(order.total_amount).toFixed(2)}</div>
                                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                                            {order.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No orders yet</p>
                                )}
                              </div>

                              {/* Addresses */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Saved Addresses ({user.addresses?.length || 0})
                                </h4>
                                {user.addresses && user.addresses.length > 0 ? (
                                  <div className="space-y-2">
                                    {user.addresses.map((address, idx) => (
                                      <div key={idx} className="p-2 rounded bg-card border text-sm">
                                        <div className="font-medium">{address.street}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {address.city}, {address.state} {address.zip_code}
                                        </div>
                                        {address.is_default && (
                                          <Badge variant="outline" className="mt-1 text-xs">Default</Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No saved addresses</p>
                                )}
                              </div>
                            </div>

                            {/* Customer Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                              <div className="text-center">
                                <div className="text-2xl font-bold">{user.order_count || 0}</div>
                                <div className="text-xs text-muted-foreground">Total Orders</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">${(user.total_spent || 0).toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">Lifetime Value</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold">
                                  ${user.order_count ? ((user.total_spent || 0) / user.order_count).toFixed(2) : '0.00'}
                                </div>
                                <div className="text-xs text-muted-foreground">Avg Order Value</div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedUser.full_name || "Customer"}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedUser.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Status & Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs">Status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedUser.age_verified ? (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        Orders
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedUser.order_count || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Total Spent
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ${(selectedUser.total_spent || 0).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Avg Order
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${selectedUser.order_count ? ((selectedUser.total_spent || 0) / selectedUser.order_count).toFixed(2) : '0.00'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{selectedUser.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{selectedUser.phone || "Not provided"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Member Since</div>
                        <div className="font-medium">
                          {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Addresses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Saved Addresses ({selectedUser.addresses?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.addresses.map((address, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold">{address.street}</div>
                                {address.apartment && (
                                  <div className="text-sm text-muted-foreground">{address.apartment}</div>
                                )}
                                <div className="text-sm text-muted-foreground">
                                  {address.city}, {address.state} {address.zip_code}
                                </div>
                                <div className="text-sm text-muted-foreground capitalize">
                                  {address.borough}
                                </div>
                              </div>
                              {address.is_default && (
                                <Badge variant="outline">Default</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No saved addresses</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Recent Orders ({selectedUser.recent_orders?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedUser.recent_orders && selectedUser.recent_orders.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.recent_orders.map((order, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="font-semibold">
                                  Order #{order.order_number || (order.id ? order.id.substring(0, 8).toUpperCase() : 'N/A')}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                {order.delivery_address && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {order.delivery_address}
                                  </div>
                                )}
                              </div>
                              <div className="text-right space-y-1">
                                <div className="font-bold text-lg">${Number(order.total_amount || 0).toFixed(2)}</div>
                                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                  {order.status ? order.status.replace('_', ' ') : 'Unknown'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No orders yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant={selectedUser.age_verified ? "outline" : "default"}
                    className="flex-1"
                    onClick={() => {
                      toggleVerification(selectedUser.user_id, selectedUser.age_verified);
                      setShowDetailsModal(false);
                    }}
                  >
                    {selectedUser.age_verified ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Remove Verification
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Verify User
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
