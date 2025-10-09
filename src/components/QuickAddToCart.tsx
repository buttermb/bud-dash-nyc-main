import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { haptics } from "@/utils/haptics";

interface QuickAddToCartProps {
  productId: string;
  productName: string;
  size?: "sm" | "default";
}

const QuickAddToCart = ({ productId, productName, size = "default" }: QuickAddToCartProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error("Please sign in to add items to cart");
        return;
      }

      const { data: existing } = await supabase
        .from("cart_items")
        .select()
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      haptics.success(); // Success haptic feedback
      toast.success("🎉 Added to cart!", {
        icon: <Check className="w-4 h-4 animate-bounce" />,
        description: productName,
        duration: 2000,
      });
    },
    onError: () => {
      haptics.error(); // Error haptic feedback
    },
  });

  return (
    <Button
      onClick={() => {
        haptics.light(); // Light tap feedback
        addToCart.mutate();
      }}
      size={size}
      className="w-full font-bold hover:scale-105 transition-all"
      disabled={addToCart.isPending}
      variant={addToCart.isSuccess ? "secondary" : "hero"}
    >
      {addToCart.isSuccess ? (
        <>
          <Check className="w-4 h-4 mr-2 animate-bounce" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          {addToCart.isPending ? "Adding..." : "Quick Add"}
        </>
      )}
    </Button>
  );
};

export default QuickAddToCart;
