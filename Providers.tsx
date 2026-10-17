"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = { productId: string; slug: string; title: string; price: number; coverImage: string; quantity: number };
type CartContextValue = {
  items: CartLine[];
  addItem: (item: Omit<CartLine, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("aurakeys-cart");
      if (stored) setItems(JSON.parse(stored) as CartLine[]);
    } catch (error) {
      console.error("Unable to restore cart", error);
      localStorage.removeItem("aurakeys-cart");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("aurakeys-cart", JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((item: Omit<CartLine, "quantity">) => {
    setItems((current) => {
      const found = current.find((line) => line.productId === item.productId);
      if (found) return current.map((line) => line.productId === item.productId ? { ...line, quantity: Math.min(10, line.quantity + 1) } : line);
      return [...current, { ...item, quantity: 1 }];
    });
  }, []);
  const removeItem = useCallback((productId: string) => setItems((current) => current.filter((item) => item.productId !== productId)), []);
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId);
    setItems((current) => current.map((item) => item.productId === productId ? { ...item, quantity: Math.min(10, quantity) } : item));
  }, [removeItem]);
  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({ items, addItem, removeItem, updateQuantity, clearCart }), [items, addItem, removeItem, updateQuantity, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><CartProvider>{children}</CartProvider></SessionProvider>;
}
