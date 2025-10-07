import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ImportExport() {
  const [csvData, setCsvData] = useState("");
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const exportToCSV = () => {
    if (!products || products.length === 0) {
      toast({ title: "No products to export", variant: "destructive" });
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Category",
      "Price",
      "Stock",
      "THCA%",
      "Description",
      "In Stock",
      "Image URL",
    ];

    const rows = products.map((p) => [
      p.id,
      p.name,
      p.category,
      p.price || 0,
      p.stock_quantity || 0,
      p.thca_percentage || 0,
      `"${(p.description || "").replace(/"/g, '""')}"`,
      p.in_stock ? "Yes" : "No",
      p.image_url || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `products-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({ title: "Products exported successfully" });
  };

  const importFromCSV = async () => {
    try {
      setImporting(true);

      const lines = csvData.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV must have at least a header and one data row");
      }

      const headers = lines[0].split(",");
      const dataLines = lines.slice(1);

      const products = dataLines.map((line) => {
        const values = line.split(",");
        const product: any = {};

        headers.forEach((header, index) => {
          const cleanHeader = header.trim().toLowerCase();
          const value = values[index]?.trim().replace(/^"|"$/g, "");

          switch (cleanHeader) {
            case "name":
              product.name = value;
              break;
            case "category":
              product.category = value;
              break;
            case "price":
              product.price = parseFloat(value) || 0;
              break;
            case "stock":
            case "stock quantity":
              product.stock_quantity = parseInt(value) || 0;
              break;
            case "thca%":
            case "thca":
              product.thca_percentage = parseFloat(value) || 0;
              break;
            case "description":
              product.description = value;
              break;
            case "in stock":
            case "active":
              product.in_stock = value.toLowerCase() === "yes" || value === "true";
              break;
            case "image url":
            case "image":
              product.image_url = value;
              break;
          }
        });

        return product;
      });

      // Insert products
      const { error } = await supabase.from("products").insert(products);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({
        title: "Import successful",
        description: `${products.length} products imported`,
      });
      setCsvData("");
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import/Export Products</h1>
        <p className="text-muted-foreground">
          Bulk manage products using CSV files
        </p>
      </div>

      {/* Export Section */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Export Products</h2>
            <p className="text-muted-foreground mb-4">
              Download all products as a CSV file
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Edit prices in Excel or Google Sheets</li>
              <li>• Backup your product data</li>
              <li>• Share with accountants or suppliers</li>
              <li>• Update stock quantities offline</li>
            </ul>
          </div>
          <Button onClick={exportToCSV} size="lg">
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Import Products</h2>
        <p className="text-muted-foreground mb-4">
          Upload a CSV file to create or update products
        </p>

        <div className="space-y-4">
          <div>
            <Label>CSV Data</Label>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste CSV data here or upload a file..."
              rows={12}
              className="mt-1.5 font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="csv-file">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV File
                </span>
              </Button>
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setCsvData(event.target?.result as string);
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <Button
              onClick={importFromCSV}
              disabled={!csvData || importing}
            >
              {importing ? "Importing..." : "Import Products"}
            </Button>
          </div>

          <Card className="p-4 bg-muted">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV Format Example
            </h3>
            <pre className="text-xs overflow-x-auto">
              {`Name,Category,Price,Stock,THCA%,Description,In Stock,Image URL
Purple Haze,flower,45,15,24.5,"Premium indoor flower",Yes,https://...
Gelato Pre-Rolls,pre-rolls,35,28,22.8,"Hand-rolled joints",Yes,https://...`}
            </pre>
          </Card>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950">
        <h3 className="font-semibold mb-2">Tips for Importing</h3>
        <ul className="text-sm space-y-1">
          <li>• First row must be headers</li>
          <li>• Name and Category are required</li>
          <li>• Use "Yes" or "No" for In Stock column</li>
          <li>• Wrap descriptions with commas in quotes</li>
          <li>• Existing products (by ID) will be updated</li>
        </ul>
      </Card>
    </div>
  );
}
