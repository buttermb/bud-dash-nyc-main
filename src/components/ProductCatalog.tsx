import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

const ProductCatalog = () => {
  const [category, setCategory] = useState<string>("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase.from("products").select("*").eq("in_stock", true);
      
      if (category !== "all") {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    { value: "all", label: "All Products" },
    { value: "flower", label: "Flower" },
    { value: "edibles", label: "Edibles" },
    { value: "vapes", label: "Vapes" },
    { value: "concentrates", label: "Concentrates" },
  ];

  return (
    <section id="products" className="py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">Shop THCA Products</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium hemp-derived THCA products from licensed NYC vendors
          </p>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-12">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <TabsContent value={category} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    No products available in this category
                  </p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </section>
  );
};

export default ProductCatalog;
