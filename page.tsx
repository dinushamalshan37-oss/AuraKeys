import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Storefront from "@/components/Storefront";
import type { StoreProduct } from "@/components/ProductCard";
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search: query } = await searchParams;
  let products: Array<Record<string, any>> = [];
  try {
    await connectDb();
    products = (await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(100).lean()) as Array<Record<string, any>>;
  } catch (error) {
    console.error("Homepage product query failed", error);
    throw error;
  }
  const search = query?.trim() ?? "";
  const normalized: StoreProduct[] = products.map((product) => {
    const item = product as Record<string, any>;
    return {
      _id: String(item._id),
      slug: String(item.slug ?? ""),
      title: String(item.title ?? ""),
      price: Number(item.price ?? 0),
      originalPrice: Number(item.originalPrice ?? item.price ?? 0),
      discountPercentage: Number(item.discountPercentage ?? 0),
      platform: String(item.platform ?? "PC"),
      region: String(item.region ?? "Global"),
      coverImage: String(item.coverImage ?? ""),
      stockCount: Number(item.stockCount ?? 0)
    };
  }).filter((product) => !search || product.title.toLowerCase().includes(search.toLowerCase()));

  return <>
    <section className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-lime/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime/20 bg-lime/5 px-3 py-1.5 text-xs font-bold text-lime"><Zap size={14} /> YOUR NEXT ADVENTURE STARTS HERE</div>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">Big games.<br /><span className="text-lime">Better prices.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">Discover digital game keys from the worlds you love. Secure checkout, instant delivery, and more time to play.</p>
          <Link href="#games" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-lime px-6 py-3.5 font-bold text-ink transition hover:gap-3">Explore games <ArrowRight size={18} /></Link>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-lime" /> Secure checkout</span><span className="flex items-center gap-2"><Zap size={17} className="text-lime" /> Instant delivery</span></div>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-lime/20 via-violet-500/10 to-transparent blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#24272c] to-[#151619] p-9 shadow-glow">
            <div className="mb-12 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.2em] text-muted">Game on</span><span className="h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_18px_#c6f36b]" /></div>
            <div className="text-6xl font-black leading-none">PLAY<br /><span className="text-lime">MORE.</span></div>
            <p className="mt-6 text-muted">Your library is one key away.</p>
            <div className="mt-12 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-sm font-semibold">Digital delivery</span><span className="rounded-lg bg-lime/10 px-3 py-1.5 text-xs font-bold text-lime">INSTANT</span></div>
          </div>
        </div>
      </div>
    </section>
    <div id="games" className="pt-14"><Storefront products={normalized} search={search} /></div>
  </>;
}
