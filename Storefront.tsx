"use client";

import { useMemo, useState } from "react";
import ProductCard, { type StoreProduct } from "@/components/ProductCard";

const platforms = ["All games", "PC", "PlayStation", "Xbox", "Nintendo"];

export default function Storefront({ products, search = "" }: { products: StoreProduct[]; search?: string }) {
  const [platform, setPlatform] = useState("All games");
  const [region, setRegion] = useState("All regions");
  const shown = useMemo(() => products.filter((product) =>
    (platform === "All games" || product.platform === platform) &&
    (region === "All regions" || product.region === region)), [products, platform, region]);
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-lime">The marketplace</p><h2 className="text-3xl font-black">{search ? `Results for “${search}”` : "Popular right now"}</h2></div>
        <select value={region} onChange={(event) => setRegion(event.target.value)} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm text-white outline-none focus:border-lime">
          {["All regions", "Global", "EU", "US"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
        {platforms.map((item) => <button key={item} onClick={() => setPlatform(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${platform === item ? "bg-lime text-ink" : "border border-line bg-panel text-muted hover:text-white"}`}>{item}</button>)}
      </div>
      {shown.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{shown.map((product) => <ProductCard key={product._id} product={product} />)}</div> :
        <div className="rounded-2xl border border-dashed border-line py-20 text-center"><p className="text-lg font-bold">No games found</p><p className="mt-2 text-sm text-muted">Try another search or filter.</p></div>}
    </section>
  );
}
