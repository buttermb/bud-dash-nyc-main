import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SystemResetDialogProps {
  onSuccess: () => void;
}

export function SystemResetDialog({ onSuccess }: SystemResetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [options, setOptions] = useState({
    setDriversOffline: true,
    clearCompletedOrders: false,
    clearTracking: true,
  });

  const handleReset = async () => {
    setLoading(true);

    try {
      // Set all drivers offline
      if (options.setDriversOffline) {
        const { error: offlineError } = await supabase
          .from("couriers")
          .update({ is_online: false })
          .neq("id", "00000000-0000-0000-0000-000000000000");

        if (offlineError) throw offlineError;
      }

      // Clear completed orders (optional - archives to prevent data loss)
      if (options.clearCompletedOrders) {
        const { error: ordersError } = await supabase
          .from("orders")
          .delete()
          .in("status", ["delivered", "cancelled"]);

        if (ordersError) throw ordersError;
      }

      // Clear old tracking data
      if (options.clearTracking) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const { error: trackingError } = await supabase
          .from("order_tracking")
          .delete()
          .lt("created_at", threeDaysAgo.toISOString());

        if (trackingError) throw trackingError;
      }

      toast({
        title: "System Reset Complete",
        description: "System has been reset successfully",
      });

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message || "Failed to reset system",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset System
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset System</AlertDialogTitle>
          <AlertDialogDescription>
            This will perform system maintenance tasks. Select what to reset:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="drivers-offline"
              checked={options.setDriversOffline}
              onCheckedChange={(checked) =>
                setOptions({ ...options, setDriversOffline: checked as boolean })
              }
            />
            <Label htmlFor="drivers-offline" className="cursor-pointer">
              Set all drivers offline
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clear-tracking"
              checked={options.clearTracking}
              onCheckedChange={(checked) =>
                setOptions({ ...options, clearTracking: checked as boolean })
              }
            />
            <Label htmlFor="clear-tracking" className="cursor-pointer">
              Clear old tracking data (3+ days)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clear-orders"
              checked={options.clearCompletedOrders}
              onCheckedChange={(checked) =>
                setOptions({ ...options, clearCompletedOrders: checked as boolean })
              }
            />
            <Label htmlFor="clear-orders" className="cursor-pointer text-destructive">
              Clear completed/cancelled orders (Warning: Permanent)
            </Label>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={loading}
            className="bg-primary"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
