import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Package, DollarSign, Navigation } from "lucide-react";
import { useState } from "react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  created_at: string;
  delivery_address: string;
  delivery_borough: string;
  delivery_notes?: string;
  total_amount: number;
  payment_method: string;
  scheduled_delivery_time?: string;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  courierId: string;
  onStatusUpdate: (orderId: string, status: string, courierId?: string) => void;
  isUpdating: boolean;
}

export const OrderCard = ({ order, courierId, onStatusUpdate, isUpdating }: OrderCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "out_for_delivery":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      default:
        return "bg-muted";
    }
  };

  const openInMaps = () => {
    const address = encodeURIComponent(order.delivery_address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status)} border`}>
              {order.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Delivery Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Delivery Address</p>
                <p className="text-sm text-muted-foreground break-words">{order.delivery_address}</p>
                <p className="text-sm text-primary font-medium">{order.delivery_borough}</p>
              </div>
              <Button size="sm" variant="outline" onClick={openInMaps}>
                <Navigation className="h-4 w-4" />
              </Button>
            </div>

            {order.scheduled_delivery_time && (
              <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  Scheduled: {new Date(order.scheduled_delivery_time).toLocaleString()}
                </span>
              </div>
            )}

            {/* Payout Info */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Order Total</p>
                  <p className="font-bold text-lg text-green-600">${order.total_amount}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {order.payment_method.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Items Preview */}
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {order.order_items.length} Item{order.order_items.length !== 1 && "s"}
                </span>
              </div>
              <span className="text-xs text-primary">
                {expanded ? "Hide" : "View"} Details
              </span>
            </div>
          </div>

          {/* Expanded Items */}
          {expanded && (
            <div className="space-y-2 animate-accordion-down">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm"
                >
                  <span className="font-medium">{item.product_name}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </div>
              ))}
            </div>
          )}

          {/* Delivery Notes */}
          {order.delivery_notes && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
              <p className="text-xs font-semibold text-orange-700 dark:text-orange-500 mb-1">
                DELIVERY NOTES
              </p>
              <p className="text-sm">{order.delivery_notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {order.status === "pending" && (
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => onStatusUpdate(order.id, "confirmed", courierId)}
                disabled={isUpdating}
              >
                Accept Order
              </Button>
            )}

            {order.status === "confirmed" && (
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => onStatusUpdate(order.id, "out_for_delivery")}
                disabled={isUpdating}
              >
                Start Delivery
              </Button>
            )}

            {order.status === "out_for_delivery" && (
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => onStatusUpdate(order.id, "delivered")}
                disabled={isUpdating}
              >
                Mark as Delivered
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
