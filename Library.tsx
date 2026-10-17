"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type LibraryItem = {
  _id: string;
  quantity: number;
  price: number;
  keysDelivered: string[];
  productId: { title: string; coverImage: string; platform: string; region: string } | null;
};
type LibraryOrder = { _id: string; createdAt: string; totalAmount: number; paymentStatus: string; items: LibraryItem[] };

export default function Library({ checkoutSuccess = false }: { checkoutSuccess?: boolean }) {
  const [orders, setOrders] = useState<LibraryOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState("");
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/user/orders");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load library");
        if (cancelled) return;
        const loadedOrders = data.orders as LibraryOrder[];
        setOrders(loadedOrders);
        setError("");
        setLoading(false);
        if (checkoutSuccess && !loadedOrders.some((order) => order.paymentStatus === "paid") && attempts < 15) {
          attempts += 1;
          timer = setTimeout(loadOrders, 2000);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Unable to load library");
          setLoading(false);
        }
      }
    };
    void loadOrders();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [checkoutSuccess]);
  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1600);
    } catch (cause) {
      console.error("Clipboard write failed", cause);
      setError("Could not copy key. Select and copy it manually.");
    }
  }
  return <main className="mx-auto min-h-[70vh] max-w-5xl px-5 py-12">
    <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-lime">Your collection</p><h1 className="mt-2 text-3xl font-black">Game library</h1></div>
    {checkoutSuccess && <p role="status" className="mb-5 rounded-xl border border-lime/20 bg-lime/5 p-4 text-sm text-lime">{orders.some((order) => order.paymentStatus === "paid") ? "Payment confirmed. Your keys are ready below." : "Payment received. We’re confirming your order and assigning your keys..."}</p>}
    {loading ? <p className="py-12 text-center text-muted">Loading your games...</p> : error ? <p role="alert" className="rounded-xl bg-red-950/40 p-4 text-red-200">{error}</p> :
      orders.filter((order) => order.paymentStatus === "paid").length === 0 ? <div className="rounded-2xl border border-line bg-panel py-20 text-center"><KeyRound size={32} className="mx-auto text-lime" /><p className="mt-4 font-bold">Your library is waiting</p><p className="mt-2 text-sm text-muted">Completed purchases will show up here.</p><a href="/" className="mt-5 inline-block rounded-xl bg-lime px-5 py-3 font-bold text-ink">Browse games</a></div> :
      <div className="space-y-5">{orders.filter((order) => order.paymentStatus === "paid").map((order) => <section key={order._id} className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-5 flex flex-wrap justify-between gap-2 border-b border-line pb-4 text-sm"><span className="font-bold">Purchased {new Date(order.createdAt).toLocaleDateString()}</span><span className="text-muted">Order {order._id.slice(-8).toUpperCase()} · {formatPrice(order.totalAmount)}</span></div>
        <div className="space-y-4">{order.items.map((item) => item.productId && <article key={item._id} className="flex flex-col gap-4 sm:flex-row">
          <img src={item.productId.coverImage} alt="" className="h-20 w-28 rounded-lg object-cover" />
          <div className="flex-1"><div className="font-bold">{item.productId.title}</div><div className="mt-1 text-xs text-muted">{item.productId.platform} · {item.productId.region}</div>
            <div className="mt-3 space-y-2">{item.keysDelivered.map((key, index) => {
              const id = `${item._id}-${index}`;
              return <div key={id} className="flex flex-wrap items-center gap-2">
                <code className="min-w-48 rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm">{revealed[id] ? key : "••••-••••-••••-••••"}</code>
                <button onClick={() => setRevealed((state) => ({ ...state, [id]: !state[id] }))} className="rounded-lg border border-line p-2 text-muted hover:text-white" aria-label={revealed[id] ? "Hide key" : "Reveal key"}>{revealed[id] ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                <button onClick={() => copyKey(key)} className="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-lime/50">{copied === key ? <Check size={14} className="text-lime" /> : <Copy size={14} />}{copied === key ? "Copied" : "Copy"}</button>
              </div>;
            })}</div>
          </div>
        </article>)}</div>
      </section>)}</div>}
  </main>;
}
