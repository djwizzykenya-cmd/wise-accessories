"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  seller: { shopName: string };
  category?: string | { name: string };
}

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

const TOP_LINKS = [
  { label: "Seller Center", href: "/products" },
  { label: "Download App", href: "/products" },
  { label: "Help Center", href: "/products" },
  { label: "Kenya", href: "/products" },
];

const CATEGORIES = [
  { name: "Engine Parts", icon: "⚙️" },
  { name: "Transmission", icon: "🔧" },
  { name: "Suspension", icon: "🏍️" },
  { name: "Brakes", icon: "🛑" },
  { name: "Electrical", icon: "⚡" },
  { name: "Tires & Wheels", icon: "🛞" },
  { name: "Lights", icon: "💡" },
  { name: "Accessories", icon: "🪝" },
];

const PROMO_CARDS = [
  { title: "Fast Delivery", subtitle: "Same day delivery across Nairobi", color: "from-orange-400 to-red-500" },
  { title: "Secure Payments", subtitle: "Card, M-Pesa and cash on delivery", color: "from-blue-500 to-indigo-600" },
  { title: "Trusted Sellers", subtitle: "Verified marketplace partners", color: "from-emerald-500 to-teal-600" },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fallback-1",
    name: "Brake Disc Set",
    price: 6500,
    images: ["/placeholder-product.svg"],
    seller: { shopName: "Wise Accessories" },
    category: "Brakes"
  },
  {
    id: "fallback-2",
    name: "Engine Oil Filter",
    price: 1800,
    images: ["/placeholder-product.svg"],
    seller: { shopName: "Moto Parts Hub" },
    category: "Engine Parts"
  },
  {
    id: "fallback-3",
    name: "Suspension Shock Absorber",
    price: 9200,
    images: ["/placeholder-product.svg"],
    seller: { shopName: "Ride Ready Shop" },
    category: "Suspension"
  },
  {
    id: "fallback-4",
    name: "LED Headlight Unit",
    price: 5400,
    images: ["/placeholder-product.svg"],
    seller: { shopName: "City Moto Spares" },
    category: "Electrical"
  }
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<CountdownTime>({ hours: 1, minutes: 58, seconds: 32 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
          if (minutes < 0) {
            minutes = 59;
            hours -= 1;
            if (hours < 0) {
              hours = 23;
              minutes = 59;
              seconds = 59;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products?limit=12", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Products request failed with ${response.status}`);
        }

        const data = await response.json();
        if (isMounted && Array.isArray(data?.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to load products", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const getCategoryName = (product: Product) => {
    if (typeof product.category === "string") return product.category;
    return product.category?.name || "Parts";
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            {TOP_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-red-600">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/auth" className="hover:text-red-600">
              Sign In
            </Link>
            <Link href="/checkout" className="hover:text-red-600">
              Cart
            </Link>
          </div>
        </div>
      </section>

      <header className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-center">
          <div className="bg-red-700 rounded-3xl p-5 shadow-lg">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-100">Wise Accessories</div>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Motorcycle spares, tools and parts with fast delivery.
            </h1>
            <p className="mt-4 text-sm text-amber-100/90">Shop thousands of products with secure payment and delivery across Kenya.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-red-600 shadow-sm hover:bg-slate-100 text-center">
                Shop Now
              </Link>
              <Link href="/products" className="rounded-full border border-white/70 bg-white/10 px-5 py-3 text-sm text-white hover:bg-white/20 text-center">
                Download App
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {PROMO_CARDS.map((card) => (
              <div key={card.title} className={`rounded-3xl p-6 text-white shadow-xl bg-gradient-to-r ${card.color}`}>
                <div className="text-sm uppercase tracking-[0.2em] opacity-90">{card.title}</div>
                <p className="mt-4 text-lg font-semibold">{card.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-red-600">Quick categories</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Shop by motorcycle part</h2>
            </div>
            <Link href="/products" className="text-red-600 font-semibold hover:text-red-700">
              View all categories →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-red-400 hover:shadow-lg"
              >
                <div className="text-3xl">{cat.icon}</div>
                <div className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-red-600">{cat.name}</div>
                <p className="mt-2 text-sm text-slate-500">Find top-rated {cat.name.toLowerCase()}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(254,252,232,1),_transparent_45%)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-red-600">Flash sale</p>
                <h3 className="mt-3 text-3xl font-bold text-slate-900">Best deals on motorcycle essentials</h3>
              </div>
              <div className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-md">
                <div className="text-sm uppercase tracking-[0.2em] opacity-80">Extra Savings</div>
                <p className="mt-4 text-lg font-semibold">Up to 30% off on brakes and suspension.</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-md">
                <div className="text-sm uppercase tracking-[0.2em] text-red-600">Free shipping</div>
                <p className="mt-4 text-lg font-semibold text-slate-900">Free delivery on orders above KES 10,000.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Fast delivery</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">Ready to ship today</h3>
              </div>
              <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">Kingston</span>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Top Vendor</div>
                <div className="mt-2 text-xl font-semibold text-slate-900">Wise Accessories Store</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Customer Rating</div>
                <div className="mt-2 text-xl font-semibold text-slate-900">4.9/5</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-red-600">Recommended</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Popular motorcycle products</h2>
          </div>
          <Link href="/products" className="text-red-600 font-semibold hover:text-red-700">
            View all products →
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Loading products...</div>
          ) : (
            products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                images={p.images}
                seller={p.seller}
                category={getCategoryName(p)}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

