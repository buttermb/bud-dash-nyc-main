import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, 
  ShieldOff, 
  Search, 
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  ShoppingBag,
  DollarSign,
  Eye,
  Ban,
  Lock,
  Download,
  AlertTriangle
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
  account_status?: string;
}

export default function AdminUsers() {
  const { session } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session) fetchUsers();
  }, [session]);

  const fetchUsers = async () => {
    try {
      const [profilesRes, ordersRes, authRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total_amount"),
        supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } }))
      ]);

      const profiles = profilesRes.data || [];
      const orders = ordersRes.data || [];
      const authUsers = authRes?.data?.users || [];

      const authUserMap = new Map(authUsers.map((u: any) => [u.id, u]));
      const ordersByUser = new Map<string, any[]>();
      orders.forEach(order => {
        if (!ordersByUser.has(order.user_id)) ordersByUser.set(order.user_id, []);
        ordersByUser.get(order.user_id)!.push(order);
      });

      const enriched = profiles.map(p => {
        const userOrders = ordersByUser.get(p.user_id) || [];
        return {
          ...p,
          email: authUserMap.get(p.user_id)?.email || "N/A",
          order_count: userOrders.length,
          total_spent: userOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
        };
      });

      setUsers(enriched);
    } catch (error: any) {
      toast({ title: "Error loading users", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`${status} ${selectedUsers.size} users?`)) return;

    try {
      await supabase.from("profiles").update({ account_status: status }).in("user_id", Array.from(selectedUsers));
      toast({ title: `✓ ${selectedUsers.size} users ${status}` });
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Bulk action failed", description: error.message, variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(u => {
    const match = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const filter = filterVerified === "all" || 
                   (filterVerified === "verified" && u.age_verified) ||
                   (filterVerified === "unverified" && !u.age_verified);
    return match && filter;
  });

  if (loading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center justify-between flex-wrap">
            <CardTitle>Users</CardTitle>
            <div className="flex gap-2 flex-wrap">
              {selectedUsers.size > 0 && (
                <>
                  <Badge>{selectedUsers.size} selected</Badge>
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus("suspended")}>
                    <AlertTriangle className="h-4 w-4 mr-1" />Suspend
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus("locked")}>
                    <Lock className="h-4 w-4 mr-1" />Lock
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => bulkUpdateStatus("banned")}>
                    <Ban className="h-4 w-4 mr-1" />Ban
                  </Button>
                </>
              )}
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={filterVerified} onValueChange={setFilterVerified}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={() => {
                      if (selectedUsers.size === filteredUsers.length) {
                        setSelectedUsers(new Set());
                      } else {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.user_id)));
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.has(user.user_id)}
                      onCheckedChange={() => {
                        const newSet = new Set(selectedUsers);
                        if (newSet.has(user.user_id)) {
                          newSet.delete(user.user_id);
                        } else {
                          newSet.add(user.user_id);
                        }
                        setSelectedUsers(newSet);
                      }}
                    />
                  </TableCell>
                  <TableCell onClick={() => navigate(`/admin/users/${user.user_id}`)} className="cursor-pointer hover:underline">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{user.full_name || "Customer"}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.age_verified ? (
                      <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>
                    ) : (
                      <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.order_count || 0}</TableCell>
                  <TableCell className="font-semibold text-green-600">${(user.total_spent || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/users/${user.user_id}`)}>
                      <Eye className="h-4 w-4 mr-1" />View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
