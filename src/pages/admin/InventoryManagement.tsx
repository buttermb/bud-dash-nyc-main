import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function InventoryManagement() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const adjustStock = useMutation({
    mutationFn: async () => {
      const newStock = (selectedProduct.stock_quantity || 0) + adjustAmount;
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", selectedProduct.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Stock updated successfully" });
      setSelectedProduct(null);
      setAdjustAmount(0);
      setAdjustReason("");
    },
  });

  const lowStockProducts = products?.filter((p) => (p.stock_quantity || 0) < 10) || [];
  const outOfStockProducts = products?.filter((p) => !p.in_stock || (p.stock_quantity || 0) === 0) || [];
  const totalInventoryValue = products?.reduce((sum, p) => sum + (p.price || 0) * (p.stock_quantity || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage product stock levels</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-3xl font-bold">{products?.length || 0}</p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-3xl font-bold">
                {products?.filter((p) => p.in_stock && (p.stock_quantity || 0) > 0).length || 0}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{lowStockProducts.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{outOfStockProducts.length}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Inventory Value */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">Total Inventory Value</h2>
        <p className="text-4xl font-bold text-green-600">${totalInventoryValue.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground mt-1">Based on retail prices</p>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Low Stock Alerts
          </h2>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.stock_quantity || 0} units left
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedProduct(product)}
                  variant="outline"
                  size="sm"
                >
                  Adjust Stock
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Out of Stock */}
      {outOfStockProducts.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Out of Stock Products
          </h2>
          <div className="space-y-3">
            {outOfStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="h-12 w-12 rounded object-cover grayscale"
                  />
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <Badge variant="secondary">Out of Stock</Badge>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedProduct(product)}
                  variant="outline"
                  size="sm"
                >
                  Restock
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Adjust Stock Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Current Stock</Label>
              <p className="text-2xl font-bold">{selectedProduct?.stock_quantity || 0} units</p>
            </div>

            <div>
              <Label htmlFor="adjust">Adjustment Amount</Label>
              <Input
                id="adjust"
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(parseInt(e.target.value))}
                placeholder="Enter positive to add, negative to remove"
                className="mt-1.5"
              />
              <p className="text-sm text-muted-foreground mt-1">
                New stock: {(selectedProduct?.stock_quantity || 0) + adjustAmount} units
              </p>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g., Restock, Damaged, Returned"
                className="mt-1.5"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedProduct(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={() => adjustStock.mutate()} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
