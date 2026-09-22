'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';

type Product = any;

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'qrobo_guest_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMerged, setHasMerged] = useState(false);

  const loadGuestCart = (): CartItem[] => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveGuestCart = (cart: CartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  };

  const loadCart = async (currentUser: any) => {
    setIsLoading(true);
    try {
      if (currentUser) {
        const res = await apiFetch('/cart');
        if (res && res.items) {
          const cartItems = res.items.map((item: any) => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
          }));
          setItems(cartItems);
        } else {
          setItems([]);
        }
      } else {
        setItems(loadGuestCart());
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      if (!currentUser) setItems(loadGuestCart());
    } finally {
      setIsLoading(false);
    }
  };

  const mergeGuestCart = async () => {
    const guestCart = loadGuestCart();
    if (guestCart.length === 0) return;

    try {
      await apiFetch('/cart/merge', {
        method: 'POST',
        body: JSON.stringify({
          items: guestCart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity
          }))
        })
      });
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    
    const init = async () => {
      if (user && !hasMerged) {
        await mergeGuestCart();
        setHasMerged(true);
      }
      await loadCart(user);
    };

    init();
  }, [user, authLoading, hasMerged]);

  const addItem = async (product: Product, quantity: number = 1) => {
    const existingItem = items.find((i) => i.product.id === product.id);
    const newQuantity = (existingItem?.quantity || 0) + quantity;

    if (product.stock > 0 && newQuantity > product.stock) {
      return;
    }

    if (user) {
      try {
        await apiFetch('/cart/items', {
          method: 'POST',
          body: JSON.stringify({ product_id: product.id, quantity })
        });
        await loadCart(user); // Reload cart to get actual DB IDs
      } catch (error) {
        console.error('Error adding to cart', error);
      }
    } else {
      const guestCart = loadGuestCart();
      const existing = guestCart.find((i) => i.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        guestCart.push({ product, quantity });
      }
      saveGuestCart(guestCart);
      setItems(guestCart);
    }
    setIsOpen(true);
  };

  const removeItem = async (productId: string) => {
    if (user) {
      const existingItem = items.find((i) => i.product.id === productId);
      if (existingItem?.id) {
        try {
          await apiFetch(`/cart/items/${existingItem.id}`, {
            method: 'DELETE'
          });
          setItems((prev) => prev.filter((i) => i.product.id !== productId));
        } catch (error) {
          console.error('Error removing from cart', error);
        }
      }
    } else {
      const guestCart = loadGuestCart().filter((i) => i.product.id !== productId);
      saveGuestCart(guestCart);
      setItems(guestCart);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    const product = items.find((i) => i.product.id === productId)?.product;
    if (product && quantity > product.stock) return;

    if (user) {
      const existingItem = items.find((i) => i.product.id === productId);
      if (existingItem?.id) {
        try {
          await apiFetch(`/cart/items/${existingItem.id}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
          });
          setItems((prev) =>
            prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
          );
        } catch (error) {
          console.error('Error updating quantity', error);
        }
      }
    } else {
      const guestCart = loadGuestCart();
      const item = guestCart.find((i) => i.product.id === productId);
      if (item) {
        item.quantity = quantity;
        saveGuestCart(guestCart);
        setItems(guestCart);
      }
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await apiFetch('/cart', {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error clearing cart', error);
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        total: subtotal,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
