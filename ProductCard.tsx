import Link from "next/link";
import { ShoppingCart, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/components/add-to-cart-button";

export type StoreProduct = {
  _id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  platform: string;
  region: string;
  coverImage: string;
  stockCount: number;
};

export default function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-panel transition hover:-translate-y-1 hover:border-lime/40">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#24262d]">
        <img src={product.coverImage} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {product.discountPercentage > 0 && <span className="absolute left-3 top-3 rounded-md bg-lime px-2 py-1 text-xs font-black text-ink">-{product.discountPercentage}%</span>}
        <span className="absolute bottom-3 left-3 rounded-md bg-ink/85 px-2.5 py-1 text-xs font-semibold">{product.platform}</span>
      </Link>
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-12 font-bold leading-6 hover:text-lime">{product.title}</Link>
          <span className="shrink-0 rounded-md border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{product.region}</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div><div className="text-xl font-black">{formatPrice(product.price)}</div>{product.originalPrice > product.price && <div className="text-xs text-muted line-through">{formatPrice(product.originalPrice)}</div>}</div>
          {product.stockCount > 0 ? <AddToCartButton product={product} compact /> : <span className="text-xs text-red-300">Out of stock</span>}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-lime"><Zap size={13} /> Instant digital delivery</div>
      </div>
    </article>
  );
}
