"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImagePlus, PackagePlus, Save } from "lucide-react";
import type { StoreProduct } from "@/components/ProductCard";

type AdminProduct = StoreProduct & { description: string; systemRequirements: string; isActive: boolean };
const emptyForm = { title: "", description: "", systemRequirements: "", price: "", originalPrice: "", platform: "PC", region: "Global", coverImage: "", isActive: true };

export default function AdminPanel({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [keys, setKeys] = useState("");
  const [inventoryProduct, setInventoryProduct] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!inventoryProduct && products.length) setInventoryProduct(products[0]._id);
  }, [products, inventoryProduct]);
  function edit(product: AdminProduct) {
    setSelected(product);
    setForm({ title: product.title, description: product.description, systemRequirements: product.systemRequirements ?? "", price: String(product.price), originalPrice: String(product.originalPrice), platform: product.platform, region: product.region, coverImage: product.coverImage, isActive: product.isActive });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function uploadImage(): Promise<string> {
    if (!image) return form.coverImage;
    const body = new FormData(); body.set("file", image);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Image upload failed");
    return data.url as string;
  }
  async function saveProduct(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const coverImage = await uploadImage();
      if (!coverImage) throw new Error("Add a product image or upload one.");
      const payload = { ...form, coverImage, price: Number(form.price), originalPrice: Number(form.originalPrice) };
      const response = await fetch(selected ? `/api/products/${selected._id}` : "/api/products", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save product");
      const productsResponse = await fetch("/api/admin/products");
      const refreshed = await productsResponse.json();
      setProducts(refreshed.products as AdminProduct[]);
      setSelected(null); setForm(emptyForm); setImage(null);
      setMessage(selected ? "Product updated." : "Product created.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save product"); }
    finally { setBusy(false); }
  }
  async function addInventory(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: inventoryProduct, keys: keys.split(/\r?\n/).map((key) => key.trim()).filter(Boolean) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to add inventory");
      setKeys(""); setMessage(data.message);
      const refreshed = await fetch("/api/admin/products").then((result) => result.json());
      setProducts(refreshed.products as AdminProduct[]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to add inventory"); }
    finally { setBusy(false); }
  }
  const update = (key: keyof typeof emptyForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
    <div className="space-y-8">
      <form onSubmit={saveProduct} className="space-y-4 rounded-2xl border border-line bg-panel p-6">
        <div className="flex items-center justify-between"><h2 className="text-xl font-black">{selected ? "Edit product" : "Add a product"}</h2>{selected && <button type="button" onClick={() => { setSelected(null); setForm(emptyForm); }} className="text-sm text-muted hover:text-white">Cancel edit</button>}</div>
        <label className="block text-sm font-semibold">Title<input required minLength={2} maxLength={160} value={form.title} onChange={(e) => update("title", e.target.value)} className="admin-input" /></label>
        <label className="block text-sm font-semibold">Description<textarea required minLength={10} rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} className="admin-input" /></label>
        <label className="block text-sm font-semibold">System requirements<textarea rows={3} value={form.systemRequirements} onChange={(e) => update("systemRequirements", e.target.value)} className="admin-input" /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Price (USD)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} className="admin-input" /></label><label className="text-sm font-semibold">Original price (USD)<input required type="number" min="0.01" step="0.01" value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} className="admin-input" /></label></div>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Platform<select value={form.platform} onChange={(e) => update("platform", e.target.value)} className="admin-input">{["PC", "PlayStation", "Xbox", "Nintendo"].map((x) => <option key={x}>{x}</option>)}</select></label><label className="text-sm font-semibold">Region<select value={form.region} onChange={(e) => update("region", e.target.value)} className="admin-input">{["Global", "EU", "US"].map((x) => <option key={x}>{x}</option>)}</select></label></div>
        <label className="block text-sm font-semibold">Cover image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="admin-input file:mr-4 file:rounded-md file:border-0 file:bg-lime file:px-3 file:py-1 file:font-bold file:text-ink" /></label>
        {image && <p className="text-xs text-muted">Selected: {image.name}</p>}
        <label className="block text-sm font-semibold">Or image URL<input type="url" value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} className="admin-input" /></label>
        {selected && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} /> Product is visible in store</label>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3 font-bold text-ink disabled:opacity-60">{selected ? <Save size={17} /> : <ImagePlus size={17} />}{busy ? "Saving..." : selected ? "Save changes" : "Create product"}</button>
      </form>
      <section className="rounded-2xl border border-line bg-panel p-6"><h2 className="mb-4 text-xl font-black">Products ({products.length})</h2><div className="max-h-[480px] space-y-2 overflow-y-auto">{products.map((product) => <div key={product._id} className="flex items-center gap-3 rounded-xl border border-line p-3"><img src={product.coverImage} alt="" className="h-12 w-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{product.title}</p><p className="text-xs text-muted">{product.stockCount} keys · {product.isActive ? "Active" : "Hidden"}</p></div><button onClick={() => edit(product)} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-lime/50">Edit</button></div>)}</div></section>
    </div>
    <aside className="space-y-6">
      <form onSubmit={addInventory} className="rounded-2xl border border-line bg-panel p-6"><div className="mb-2 flex items-center gap-2"><PackagePlus className="text-lime" size={19} /><h2 className="text-xl font-black">Add license keys</h2></div><p className="mb-5 text-sm text-muted">One activation key per line. Keys are encrypted in transit and never shown in admin listings.</p>
        <label className="block text-sm font-semibold">Product<select required value={inventoryProduct} onChange={(e) => setInventoryProduct(e.target.value)} className="admin-input">{products.map((product) => <option key={product._id} value={product._id}>{product.title}</option>)}</select></label>
        <label className="mt-4 block text-sm font-semibold">Keys<textarea required rows={10} value={keys} onChange={(e) => setKeys(e.target.value)} placeholder={"XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY"} className="admin-input font-mono text-sm" /></label>
        <p className="mt-2 text-xs text-muted">{keys.split(/\r?\n/).filter((line) => line.trim()).length} key(s) ready to add</p><button disabled={busy || !inventoryProduct} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-lime/40 py-3 font-bold text-lime hover:bg-lime/10 disabled:opacity-50"><PackagePlus size={17} />{busy ? "Processing..." : "Add to inventory"}</button>
      </form>
      {message && <p role="status" className="rounded-xl border border-lime/20 bg-lime/5 p-4 text-sm text-lime">{message}</p>}
      {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
    </aside>
  </div>;
}
