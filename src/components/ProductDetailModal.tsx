import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, ShoppingCart, Loader2, Package, FileText, Download, QrCode, Shield, Award, Leaf, Clock, Activity, Heart, Star, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { sortProductWeights, getDefaultWeight, formatWeight } from "@/utils/productHelpers";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductDetailModalProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired?: () => void;
}

export const ProductDetailModal = ({ product, open, onOpenChange, onAuthRequired }: ProductDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reviews with photos
  const { data: reviews = [] } = useQuery({
    queryKey: ["product-reviews", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!product?.id && open,
  });

  useEffect(() => {
    if (product?.prices && typeof product.prices === 'object') {
      const defaultWeight = getDefaultWeight(product.prices);
      setSelectedWeight(defaultWeight);
    }
  }, [product, open]);

  const handleAddToCart = async () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (!product.in_stock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently unavailable.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .eq("selected_weight", selectedWeight || "unit")
        .maybeSingle();

      if (existingItem) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            selected_weight: selectedWeight || "unit",
          });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });

      onOpenChange(false);
      setQuantity(1);
    } catch (error) {
      toast({
        title: "Failed to add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (product.prices && typeof product.prices === 'object') {
      return product.prices[selectedWeight] || product.price;
    }
    return product.price;
  };

  const getWeights = () => {
    if (product.prices && typeof product.prices === 'object') {
      return sortProductWeights(Object.keys(product.prices));
    }
    return [];
  };

  const weights = getWeights();
  const currentPrice = getCurrentPrice();

  // Parse growing info
  const growingInfo = product.growing_info || {};
  const effectsTimeline = product.effects_timeline || {};
  const medicalBenefits = product.medical_benefits || [];
  const consumptionMethods = product.consumption_methods || [];

  const handleSubmitReview = async () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (reviewRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          product_id: product.id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewComment || null,
        });

      if (error) throw error;

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });

      setReviewRating(0);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["product-reviews", product.id] });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Failed to Submit Review",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{product?.name || "Product Details"}</DialogTitle>
        <DialogDescription className="sr-only">
          View detailed information about {product?.name}, including pricing, effects, and lab results
        </DialogDescription>
        
        {/* Mobile-Optimized Close Button - Fixed positioning to stay above everything */}
        <button
          onClick={() => onOpenChange(false)}
          className="fixed right-4 top-4 z-[9999] rounded-full bg-background p-5 shadow-2xl ring-2 ring-primary hover:bg-primary hover:text-primary-foreground transition-all md:hidden touch-manipulation active:scale-95"
          aria-label="Close"
          style={{ touchAction: 'manipulation' }}
        >
          <X className="h-8 w-8" />
        </button>
        
        {/* Header Section */}
        <div className="grid lg:grid-cols-2 gap-8 p-6">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {(product.images && product.images.length > 0 
                    ? product.images 
                    : [product.image_url || "/placeholder.svg"]
                  ).map((image: string, index: number) => (
                    <CarouselItem key={index}>
                      <img
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        loading="lazy"
                        width="600"
                        height="600"
                        className="w-full h-full object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {(product.images && product.images.length > 1) && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            </div>

            {/* Image Counter */}
            {product.images && product.images.length > 1 && (
              <div className="text-center text-sm text-muted-foreground">
                {product.images.length} photos
              </div>
            )}

            {/* Trust Badges - Simplified */}
            <div className="flex gap-2 text-xs text-muted-foreground justify-center">
              <span className="flex items-center gap-1"><Award className="w-4 h-4" />Lab Tested</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" />Quality</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Leaf className="w-4 h-4" />USA Grown</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <Badge variant="secondary" className="mb-3 uppercase text-xs">
                {product.category}
              </Badge>
              <h2 className="text-4xl font-bold mb-2">{product.name}</h2>
              {product.strain_type && (
                <p className="text-muted-foreground capitalize">{product.strain_type} Strain</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {product.thca_percentage && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{product.thca_percentage}%</p>
                    <p className="text-xs text-muted-foreground">THCa Content</p>
                  </CardContent>
                </Card>
              )}
              {product.average_rating > 0 && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                      <p className="text-3xl font-bold">{product.average_rating.toFixed(1)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{product.review_count} Reviews</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Weight Selection - Larger touch targets for mobile */}
            {weights.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Select Weight:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {weights.map((weight) => (
                    <Button
                      key={weight}
                      variant={selectedWeight === weight ? "default" : "outline"}
                      onClick={() => setSelectedWeight(weight)}
                      className="font-semibold uppercase h-12 text-base touch-manipulation"
                      size="lg"
                    >
                      {formatWeight(weight)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Stock */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl font-bold text-primary">
                ${Number(currentPrice).toFixed(2)}
              </div>
              <Badge className={product.in_stock ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}>
                <Package className="w-4 h-4 mr-1" />
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={loading}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart - ${(Number(currentPrice) * quantity).toFixed(2)}
                  </>
                )}
              </Button>
            </div>

            {/* COA Download - Prominent & Professional */}
            <div className="mt-6 p-6 bg-primary/10 rounded-xl border-2 border-primary/30 space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-xl block">Certificate of Analysis</span>
                  <p className="text-sm text-muted-foreground">Lab-tested for potency and purity • Secure checkout • No hidden fees</p>
                </div>
              </div>
              {(product.coa_pdf_url || product.coa_url || product.lab_results_url) ? (
                <Button variant="default" size="lg" asChild className="w-full">
                  <a href={product.coa_pdf_url || product.coa_url || product.lab_results_url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-5 h-5 mr-2" />
                    Download Certificate of Analysis
                  </a>
                </Button>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                  <p className="font-semibold">COA Coming Soon</p>
                  <p className="text-xs">Lab results will be available shortly</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs - Simplified for mobile */}
        <Tabs defaultValue="overview" className="px-3 md:px-6 pb-6">
          <TabsList className="grid w-full grid-cols-3 h-auto gap-1 bg-muted/50 p-1.5">
            <TabsTrigger 
              value="overview" 
              className="text-xs md:text-sm py-3 md:py-2.5 px-2 touch-manipulation min-h-[44px]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="effects" 
              className="text-xs md:text-sm py-3 md:py-2.5 px-2 touch-manipulation min-h-[44px]"
            >
              Effects
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="text-xs md:text-sm py-3 md:py-2.5 px-2 touch-manipulation min-h-[44px]"
            >
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {product.description && (
              <div>
                <h3 className="text-xl font-bold mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {consumptionMethods.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3">How to Use</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {consumptionMethods.map((method, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-center">
                      <p className="font-medium capitalize">{method}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why You'll Love It - Prominent Section */}
            <div className="p-6 bg-primary/5 rounded-xl border-2 border-primary/20">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Why You'll Love It
              </h3>
              {product.usage_tips ? (
                <div className="space-y-3">
                  {product.usage_tips.split('\n').filter((tip: string) => tip.trim()).map((tip: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <span className="text-primary text-lg mt-0.5">✓</span>
                      <span className="text-base">{tip}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                    <span className="text-primary text-lg mt-0.5">✓</span>
                    <span className="text-base">Lab-tested for potency and purity</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                    <span className="text-primary text-lg mt-0.5">✓</span>
                    <span className="text-base">Premium quality hemp-derived THCA</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                    <span className="text-primary text-lg mt-0.5">✓</span>
                    <span className="text-base">Fast 30-minute delivery in NYC</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-6 mt-6">
            {product.effects && product.effects.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Common Effects
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {product.effects.map((effect: string, index: number) => (
                    <div key={index} className="p-4 bg-primary/5 rounded-lg text-center border border-primary/10">
                      <p className="font-semibold capitalize">{effect}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {effectsTimeline.onset && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Effects Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="font-semibold">Onset Time</span>
                    <span className="text-primary">{effectsTimeline.onset}</span>
                  </div>
                  {effectsTimeline.peak && (
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="font-semibold">Peak Effects</span>
                      <span className="text-primary">{effectsTimeline.peak}</span>
                    </div>
                  )}
                  {effectsTimeline.duration && (
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="font-semibold">Duration</span>
                      <span className="text-primary">{effectsTimeline.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {medicalBenefits.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Potential Medical Benefits
                </h3>
                <div className="grid gap-3">
                  {medicalBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  * These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="terpenes" className="space-y-6 mt-6">
            {product.terpenes && (
              <div>
                <h3 className="text-xl font-bold mb-4">Terpene Profile</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Terpenes are aromatic compounds that contribute to the unique flavor, aroma, and effects of cannabis.
                </p>
                <div className="space-y-4">
                  {(Array.isArray(product.terpenes) ? product.terpenes : Object.entries(product.terpenes)).map((terpene: any, index: number) => {
                    const name = Array.isArray(product.terpenes) ? terpene.name || terpene : terpene[0];
                    const percentage = Array.isArray(product.terpenes) ? terpene.percentage : terpene[1];
                    const description = Array.isArray(product.terpenes) ? terpene.description : "";
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold capitalize">{name}</h4>
                          {percentage && <span className="text-primary font-semibold">{percentage}%</span>}
                        </div>
                        {percentage && (
                          <Progress value={Number(percentage) * 10} className="h-2" />
                        )}
                        {description && (
                          <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="growing" className="space-y-6 mt-6">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Growing Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Growing Method</h4>
                    <p className="text-2xl font-bold capitalize text-primary">
                      {growingInfo.method || "Indoor"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Organic</h4>
                    <p className="text-2xl font-bold text-primary">
                      {growingInfo.organic ? "Yes" : "Standard"}
                    </p>
                  </CardContent>
                </Card>
              </div>
              {growingInfo.location && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-muted-foreground">{growingInfo.location}</p>
                </div>
              )}
              {product.strain_lineage && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Strain Genetics</h4>
                  <p className="text-muted-foreground">{product.strain_lineage}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6 mt-6">
            {/* Review Submission Form - Only for logged in users */}
            {user && (
              <Card className="border-2 border-primary/20">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold mb-4">Write a Review</h3>
                  
                  {/* Star Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(i + 1)}
                          className="transition-transform hover:scale-110 active:scale-95 touch-manipulation"
                        >
                          <Star
                            className={`w-8 h-8 md:w-10 md:h-10 ${
                              i < reviewRating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Your Review (Optional)</label>
                    <Textarea
                      placeholder="Share your experience with this product..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || submittingReview}
                    className="w-full"
                    size="lg"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Existing Reviews */}
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {user ? "No reviews yet. Be the first to review this product!" : "No reviews yet. Sign in to leave the first review!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">Customer Review</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-primary text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground mb-3">{review.comment}</p>
                      )}
                      {review.photo_urls && review.photo_urls.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {review.photo_urls.map((url: string, index: number) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Review photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
