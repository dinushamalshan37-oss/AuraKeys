"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/Providers";
import type { StoreProduct } from "@/components/ProductCard";

export default function AddToCartButton({ product, compact = false }: { product: StoreProduct; compact?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  function add() {
    addItem({ productId: product._id, slug: product.slug, title: product.title, price: product.price, coverImage: product.coverImage });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }
  return <button onClick={add} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-lime font-bold text-ink transition hover:bg-lime/90 ${compact ? "h-10 w-10" : "px-5 py-3"}`} aria-label={`Add ${product.title} to cart`}>
    {added ? <Check size={18} /> : compact ? <ShoppingCart size={17} /> : "Add to cart"}
  </button>;
}
