import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Check, Star, Flame, Sparkles, Loader2, AlertCircle, Award, Download, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ProductDetailModal } from "./ProductDetailModal";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getDefaultWeight } from "@/utils/productHelpers";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductCardProps {
  product: any;
  onAuthRequired?: () => void;
}

const ProductCard = ({ product, onAuthRequired }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch inventory to check stock levels
  const { data: inventory } = useQuery({
    queryKey: ["inventory", product.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("stock")
        .eq("product_id", product.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const stockLevel = inventory?.stock || 0;
  const isLowStock = stockLevel > 0 && stockLevel <= 5;

  const handleCardClick = () => {
    addToRecentlyViewed(product.id);
    setShowDetailModal(true);
  };

  const getProductBadge = () => {
    if (product.thca_percentage >= 25) {
      return { icon: Flame, text: "High Potency", className: "bg-destructive/10 text-destructive" };
    }
    if (product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return { icon: Sparkles, text: "New", className: "bg-accent/10 text-accent" };
    }
    if (product.thca_percentage >= 20) {
      return { icon: Star, text: "Staff Pick", className: "bg-primary/10 text-primary" };
    }
    return null;
  };

  const badge = getProductBadge();

  const handleAddToCart = async () => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast.error("Please sign in to add items to cart");
      }
      return;
    }

    if (!product.in_stock) {
      toast.error("This product is out of stock");
      return;
    }

    setLoading(true);
    try {
      // Get default weight for products with weight options (always starts at 3.5g)
      const defaultWeight = getDefaultWeight(product.prices);

      const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .eq("selected_weight", defaultWeight)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            selected_weight: defaultWeight,
          });
        
        if (error) throw error;
      }

      toast.success("Added to cart!");
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      flower: "bg-primary/10 text-primary border-primary/20",
      edibles: "bg-secondary/10 text-secondary border-secondary/20",
      vapes: "bg-accent/10 text-accent border-accent/20",
      concentrates: "bg-primary/10 text-primary border-primary/20",
      "pre-rolls": "bg-primary/10 text-primary border-primary/20",
    };
    return colors[product.category] || colors.flower;
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(Math.max(1, quantity - 1));
  };

  const handleDownloadCOA = (e: React.MouseEvent) => {
    e.stopPropagation();
    const coaUrl = product.coa_url || product.coa_pdf_url || product.lab_results_url;
    if (coaUrl) {
      window.open(coaUrl, '_blank');
      toast.success("Opening Certificate of Analysis");
    } else {
      toast.error("COA not available for this product");
    }
  };

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url || "/placeholder.svg"];

  return (
    <>
      <Card 
        className="group overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-300 cursor-pointer relative bg-card hover:shadow-elegant hover:-translate-y-2"
        onClick={handleCardClick}
      >
        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-destructive">Out of Stock</p>
              <p className="text-sm text-muted-foreground">Check back soon</p>
            </div>
          </div>
        )}

        {/* Badge Stack */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <Badge className={`${getCategoryColor()} uppercase text-xs font-bold`}>
            {product.category}
          </Badge>
          {/* Lab Test Badge - Always Visible */}
          <Badge className="bg-primary/90 text-primary-foreground flex items-center gap-1 backdrop-blur-sm">
            <Award className="w-3 h-3" />
            Lab Tested
          </Badge>
        </div>

        {/* Product Badge */}
        {badge && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className={`${badge.className} flex items-center gap-1 backdrop-blur-sm`}>
              <badge.icon className="w-3 h-3" />
              {badge.text}
            </Badge>
          </div>
        )}

        <div className="relative h-64 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <Carousel className="w-full h-full">
            <CarouselContent>
              {productImages.map((image, index) => (
                <CarouselItem key={index}>
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {productImages.length > 1 && (
              <>
                <CarouselPrevious className="left-2" onClick={(e) => e.stopPropagation()} />
                <CarouselNext className="right-2" onClick={(e) => e.stopPropagation()} />
              </>
            )}
          </Carousel>
        </div>

        <CardContent className="p-8 space-y-6">
          <div>
            <h3 className="text-3xl font-black mb-3 uppercase tracking-wide">{product.name}</h3>
            {product.strain_type && (
              <p className="text-base text-muted-foreground capitalize font-medium">{product.strain_type}</p>
            )}
          </div>
          
          {/* THCA % Badge + Price - Side by Side */}
          <div className="flex items-center justify-between gap-4">
            {product.thca_percentage && (
              <div className="flex-shrink-0">
                <Badge className="bg-teal-500 text-white px-5 py-3 text-lg font-black border-2 border-teal-400/50 shadow-glow">
                  {product.thca_percentage}% THCA
                </Badge>
              </div>
            )}
            {product.prices && typeof product.prices === 'object' && Object.keys(product.prices).length > 1 ? (
              <div className="text-right">
                <span className="text-3xl font-black text-white">
                  From ${Number(Math.min(...Object.values(product.prices).map(p => Number(p)))).toFixed(0)}
                </span>
                {Object.keys(product.prices).length >= 2 && (
                  <p className="text-sm text-teal-400 font-semibold mt-2">
                    Save with bulk!
                  </p>
                )}
              </div>
            ) : (
              <span className="text-3xl font-black text-white">${Number(product.price).toFixed(0)}</span>
            )}
          </div>

          {/* Delivery Time Badge */}
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-400 bg-teal-500/10 px-4 py-2 rounded-lg border border-teal-500/20">
            <Clock className="w-4 h-4" />
            <span>30-40 min delivery</span>
          </div>

          {/* Low Stock Alert */}
          {isLowStock && (
            <div className="flex items-center gap-2 text-sm text-destructive font-semibold px-4 py-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              Only {stockLevel} left in stock!
            </div>
          )}

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 p-6 pt-0">
          <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 1 || loading || !product.in_stock}
              className="h-9 w-9 shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center font-semibold">{quantity}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={loading || !product.in_stock}
              className="h-9 w-9 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={loading || !product.in_stock || added}
              className="flex-1"
              variant={added ? "secondary" : "default"}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : added ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              View Details
            </Button>
            
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleDownloadCOA}
            >
              <Download className="w-4 h-4" />
              COA
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ProductDetailModal
        product={product}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onAuthRequired={onAuthRequired}
      />
    </>
  );
};

export default ProductCard;
