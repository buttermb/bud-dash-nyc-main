import { useState, useEffect } from 'react';

export interface GuestCartItem {
  product_id: string;
  quantity: number;
  selected_weight: string;
  product?: any;
}

const GUEST_CART_KEY = 'guest_cart';

export const useGuestCart = () => {
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(GUEST_CART_KEY);
    if (savedCart) {
      try {
        setGuestCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse guest cart:', e);
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever cart changes
  const saveCart = (cart: GuestCartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    setGuestCart(cart);
  };

  const addToGuestCart = (productId: string, quantity: number, selectedWeight: string) => {
    console.log('Adding to guest cart:', { productId, quantity, selectedWeight });
    
    const existingIndex = guestCart.findIndex(
      item => item.product_id === productId && item.selected_weight === selectedWeight
    );

    let newCart: GuestCartItem[];
    if (existingIndex >= 0) {
      newCart = [...guestCart];
      newCart[existingIndex].quantity += quantity;
      console.log('Updated existing item, new quantity:', newCart[existingIndex].quantity);
    } else {
      newCart = [...guestCart, { product_id: productId, quantity, selected_weight: selectedWeight }];
      console.log('Added new item to cart');
    }

    saveCart(newCart);
    
    // Trigger custom event for cart update
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: newCart } }));
    
    console.log('Guest cart after add:', newCart);
  };

  const updateGuestCartItem = (productId: string, selectedWeight: string, quantity: number) => {
    const newCart = guestCart.map(item =>
      item.product_id === productId && item.selected_weight === selectedWeight
        ? { ...item, quantity }
        : item
    );
    saveCart(newCart);
  };

  const removeFromGuestCart = (productId: string, selectedWeight: string) => {
    const newCart = guestCart.filter(
      item => !(item.product_id === productId && item.selected_weight === selectedWeight)
    );
    saveCart(newCart);
  };

  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
    setGuestCart([]);
  };

  const getGuestCartCount = () => {
    return guestCart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    guestCart,
    addToGuestCart,
    updateGuestCartItem,
    removeFromGuestCart,
    clearGuestCart,
    getGuestCartCount,
  };
};
