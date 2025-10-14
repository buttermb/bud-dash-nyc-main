import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskScoreBadge, TrustLevelBadge, AccountStatusBadge } from "@/components/admin/RiskScoreBadge";
import { RiskBreakdown } from "@/components/admin/RiskBreakdown";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle, Ban, Lock, CheckCircle } from "lucide-react";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);

  useEffect(() => {
    fetchUserDetails();
    fetchRiskAssessment();
    fetchFraudFlags();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id)
        .single();

      if (error) throw error;

      // Get user's addresses
      const { data: addresses } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", id);

      // Get user's orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(10);

      setUser({
        ...profile,
        addresses: addresses || [],
        orders: orders || [],
      });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskAssessment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("assess-risk", {
        body: { userId: id },
      });

      if (error) throw error;
      setRiskAssessment(data);
    } catch (error: any) {
      console.error("Error assessing risk:", error);
    }
  };

  const fetchFraudFlags = async () => {
    try {
      const { data, error } = await supabase
        .from("fraud_flags")
        .select("*")
        .eq("user_id", id)
        .is("resolved_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFraudFlags(data || []);
    } catch (error: any) {
      console.error("Error fetching fraud flags:", error);
    }
  };

  const updateAccountStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("user_id", id);

      if (error) throw error;

      // Log action
      await supabase.from("account_logs").insert({
        user_id: id,
        action_type: "status_change",
        description: `Account status changed to ${status}`,
        performed_by: (await supabase.auth.getUser()).data.user?.id,
      });

      toast.success(`Account ${status} successfully`);
      fetchUserDetails();
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account status");
    }
  };

  const updateLimit = async (limitType: string, value: string) => {
    try {
      const updates: any = {};
      if (limitType === "daily") updates.daily_limit = parseFloat(value);
      if (limitType === "weekly") updates.weekly_limit = parseFloat(value);
      if (limitType === "order") updates.order_limit = parseInt(value);

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", id);

      if (error) throw error;

      toast.success("Limit updated successfully");
      fetchUserDetails();
    } catch (error: any) {
      console.error("Error updating limit:", error);
      toast.error("Failed to update limit");
    }
  };

  const resolveFraudFlag = async (flagId: string) => {
    try {
      const { error } = await supabase
        .from("fraud_flags")
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", flagId);

      if (error) throw error;

      toast.success("Fraud flag resolved");
      fetchFraudFlags();
      fetchRiskAssessment();
    } catch (error: any) {
      console.error("Error resolving flag:", error);
      toast.error("Failed to resolve fraud flag");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/users")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      {/* User Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-muted-foreground">ID: {user.user_id_code || user.user_id}</p>
              <p className="text-sm mt-2">
                {user.email} • {user.phone}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap justify-end">
              <RiskScoreBadge score={user.risk_score} />
              <TrustLevelBadge level={user.trust_level} />
              <AccountStatusBadge status={user.account_status} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Assessment Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskBreakdown factors={riskAssessment?.factors} />

              {fraudFlags.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold">Active Fraud Flags</h3>
                  {fraudFlags.map((flag) => (
                    <Alert
                      key={flag.id}
                      variant={flag.severity === "critical" ? "destructive" : "default"}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{flag.flag_type.toUpperCase()}</AlertTitle>
                      <AlertDescription className="flex justify-between items-center">
                        <span>{flag.description}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveFraudFlag(flag.id)}
                        >
                          Resolve
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spending Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${user.total_spent?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{user.total_orders || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order</p>
                  <p className="text-2xl font-bold">${user.average_order_value?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lifetime Value</p>
                  <p className="text-2xl font-bold">${user.lifetime_value?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => updateAccountStatus("active")}
                disabled={user.account_status === "active"}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate Account
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => updateAccountStatus("suspended")}
                disabled={user.account_status === "suspended"}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Suspend Account
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => updateAccountStatus("locked")}
                disabled={user.account_status === "locked"}
              >
                <Lock className="w-4 h-4 mr-2" />
                Lock Account
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => updateAccountStatus("banned")}
                disabled={user.account_status === "banned"}
              >
                <Ban className="w-4 h-4 mr-2" />
                Ban User
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Daily Limit</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    defaultValue={user.daily_limit}
                    onBlur={(e) => updateLimit("daily", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Weekly Limit</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    defaultValue={user.weekly_limit}
                    onBlur={(e) => updateLimit("weekly", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Orders Per Day</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    defaultValue={user.order_limit}
                    onBlur={(e) => updateLimit("order", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Chargebacks</span>
                <span className="font-semibold">{user.chargebacks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Payments</span>
                <span className="font-semibold">{user.failed_payments || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Cancelled Orders</span>
                <span className="font-semibold">{user.cancelled_orders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Reported Issues</span>
                <span className="font-semibold">{user.reported_issues || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}