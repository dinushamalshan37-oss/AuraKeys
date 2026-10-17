import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuraKeys — Digital games, instantly delivered",
  description: "Shop digital game keys and software licenses with instant delivery."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers><Navbar />{children}<footer className="border-t border-line py-8 text-center text-sm text-muted">© {new Date().getFullYear()} AuraKeys · Digital delivery, no waiting.</footer></Providers></body></html>;
}
