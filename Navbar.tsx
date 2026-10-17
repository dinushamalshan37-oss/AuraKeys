"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Gamepad2, Search, ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/components/Providers";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { items } = useCart();
  const [search, setSearch] = useState("");
  const router = useRouter();
  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(`/?search=${encodeURIComponent(search.trim())}`);
  }
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-6 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink"><Gamepad2 size={21} /></span>
          aura<span className="text-lime">keys</span>
        </Link>
        <form onSubmit={submitSearch} className="hidden max-w-xl flex-1 md:block">
          <label className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-2.5 focus-within:border-lime/60">
            <Search size={18} className="text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find your next favorite game..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
          </label>
        </form>
        <nav className="ml-auto flex items-center gap-4">
          {session?.user.role === "admin" && <Link href="/admin" className="hidden text-sm font-semibold text-muted hover:text-white sm:block">Admin</Link>}
          {session && <Link href="/dashboard/library" className="hidden text-sm font-semibold text-muted hover:text-white sm:block">Library</Link>}
          <Link href="/cart" aria-label="Shopping cart" className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel hover:border-lime/50">
            <ShoppingBag size={18} />
            {items.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-ink">{items.reduce((total, item) => total + item.quantity, 0)}</span>}
          </Link>
          {session ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} title={session.user.email ?? "Sign out"} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel text-lime hover:border-lime/50"><UserRound size={18} /></button>
          ) : <Link href="/login" className="rounded-xl bg-lime px-4 py-2.5 text-sm font-bold text-ink hover:bg-lime/90">Sign in</Link>}
        </nav>
      </div>
    </header>
  );
}
