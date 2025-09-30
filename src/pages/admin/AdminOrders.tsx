import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Ban, Flag, Eye, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminOrders = () => {
  const { session } = useAdmin();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<"cancel" | "flag" | "accept" | "decline" | null>(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders with session:", session?.access_token);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-dashboard?endpoint=orders&page=1&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Orders fetch error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Orders data received:", data);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders",
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedOrder || !actionDialog) return;
    
    // For accept action, no reason is required
    if (actionDialog === "decline" && !reason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for declining",
      });
      return;
    }
    
    setActionLoading(true);
    try {
      const actionMap = {
        cancel: "cancel-order",
        flag: "flag-order",
        accept: "accept-order",
        decline: "decline-order"
      };

      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: {
          action: actionMap[actionDialog],
          orderId: selectedOrder.id,
          reason: reason || undefined,
        },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (error) throw error;

      const actionText = {
        cancel: "cancelled",
        flag: "flagged",
        accept: "accepted",
        decline: "declined"
      };

      toast({
        title: "Success",
        description: `Order ${actionText[actionDialog]} successfully`,
      });

      setActionDialog(null);
      setReason("");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Action failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Action failed",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      out_for_delivery: "secondary",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.phone?.includes(searchTerm) ||
    order.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">Monitor and manage all orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.user?.phone || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {order.delivery_address}
                    </TableCell>
                    <TableCell>${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedOrder(order);
                                setActionDialog("accept");
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedOrder(order);
                                setActionDialog("decline");
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionDialog("cancel");
                          }}
                          disabled={order.status === "cancelled" || order.status === "delivered"}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionDialog("flag");
                          }}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog !== null} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog === "cancel" && "Cancel Order"}
              {actionDialog === "flag" && "Flag Order"}
              {actionDialog === "accept" && "Accept Order"}
              {actionDialog === "decline" && "Decline Order"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog === "accept" 
                ? "Confirm order acceptance. The customer will be notified and order will proceed to preparation."
                : actionDialog === "decline"
                ? "Decline this order. Please provide a reason - the customer will be notified."
                : actionDialog === "cancel"
                ? "This action cannot be undone. The customer will be notified of the cancellation."
                : "Flag this order for review. Provide details about the issue."}
            </DialogDescription>
          </DialogHeader>
          
          {actionDialog !== "accept" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reason">
                  Reason {actionDialog === "decline" ? "(Required)" : "(Optional)"}
                </Label>
                <Textarea
                  id="reason"
                  placeholder={
                    actionDialog === "decline" 
                      ? "e.g., Out of stock, Outside delivery area..." 
                      : "Enter reason..."
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog(null);
                setReason("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={actionLoading || (actionDialog === "decline" && !reason)}
              variant={actionDialog === "accept" ? "default" : "destructive"}
              className={actionDialog === "accept" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {actionLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
