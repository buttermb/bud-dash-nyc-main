import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: any;
}

export function useOptimisticCart(userId?: string) {
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ productId, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart', userId] });
      
      // Snapshot previous value
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart', userId]);
      
      // Optimistically update
      queryClient.setQueryData<CartItem[]>(['cart', userId], (old = []) => [
        ...old,
        { id: 'temp-' + Date.now(), product_id: productId, quantity } as CartItem
      ]);
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', userId], context.previousCart);
      }
      toast({
        variant: 'destructive',
        title: 'Failed to add to cart',
        description: 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart', userId]);
      
      queryClient.setQueryData<CartItem[]>(['cart', userId], (old = []) =>
        old.map(item => item.id === itemId ? { ...item, quantity } : item)
      );
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', userId], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart', userId]);
      
      queryClient.setQueryData<CartItem[]>(['cart', userId], (old = []) =>
        old.filter(item => item.id !== itemId)
      );
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', userId], context.previousCart);
      }
      toast({
        variant: 'destructive',
        title: 'Failed to remove item',
        description: 'Please try again',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  return {
    addToCart,
    updateQuantity,
    removeFromCart,
  };
}
