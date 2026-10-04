"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  seller: { shopName: string };
  category?: string | { name: string };
}

const CATEGORIES = [
  { name: "Engine Parts", slug: "engine-parts", icon: "⚙️", tone: "bg-orange-50" },
  { name: "Transmission", slug: "transmission", icon: "🔧", tone: "bg-blue-50" },
  { name: "Suspension", slug: "suspension", icon: "🏍️", tone: "bg-violet-50" },
  { name: "Brakes", slug: "brakes", icon: "🛑", tone: "bg-rose-50" },
  { name: "Electrical", slug: "electrical", icon: "⚡", tone: "bg-yellow-50" },
  { name: "Tires & Wheels", slug: "tires-wheels", icon: "🛞", tone: "bg-slate-100" },
  { name: "Lights", slug: "lights", icon: "💡", tone: "bg-amber-50" },
  { name: "Accessories", slug: "accessories", icon: "🪝", tone: "bg-emerald-50" },
];

const BENEFITS = [
  { icon: "🏍️", title: "Made for riders", description: "Find parts and accessories for the road ahead." },
  { icon: "🧰", title: "Browse with ease", description: "Explore products by the part you need." },
  { icon: "🇰🇪", title: "A Kenyan marketplace", description: "Shop motorcycle essentials in one place." },
];

export default function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setProductsError("");
      try {
        const response = await apiClient.get("/products?limit=12");
        const data = response.data?.data;
        if (!Array.isArray(data)) {
          throw new Error("Product catalog returned an invalid response.");
        }
        if (isMounted) setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
        if (isMounted) {
          setProducts([]);
          setProductsError("We couldn’t load products right now. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const getCategoryName = (product: Product) => {
    if (typeof product.category === "string") return product.category;
    return product.category?.name || "Parts";
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Wise Accessories home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg font-black text-white shadow-sm shadow-red-200">
              W
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-tight text-slate-950 sm:text-[15px]">WISE ACCESSORIES</span>
              <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:block">Motorcycle marketplace</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex" aria-label="Main navigation">
            <Link href="/products" className="transition hover:text-red-600">Shop parts</Link>
            <Link href="/products" className="transition hover:text-red-600">Browse products</Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {user?.userType === "admin" ? (
              <Link href="/admin" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex">
                Admin
              </Link>
            ) : (
              <Link href="/auth" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4">
                Sign in
              </Link>
            )}
            <Link href="/checkout" aria-label="Shopping cart" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:px-4">
              <span aria-hidden="true">🛒</span>
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#151b22] text-white shadow-xl shadow-slate-900/10 sm:rounded-[36px]">
          <div className="absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full bg-red-600/25 blur-3xl" />
          <div className="absolute bottom-[-11rem] right-[22%] -z-10 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="grid min-h-[410px] items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Built for the ride
              </div>
              <h1 className="mt-6 max-w-xl text-[2.65rem] font-extrabold leading-[1.06] tracking-[-0.04em] sm:text-5xl lg:text-[3.5rem]">
                The right parts.
                <span className="block text-red-400">The next ride.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                Shop motorcycle spares, tools and accessories from one place, made for riders across Kenya.
              </p>

              <form action="/products" className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg shadow-black/15 sm:flex-row">
                <label htmlFor="home-product-search" className="sr-only">Search motorcycle parts</label>
                <input
                  id="home-product-search"
                  name="search"
                  type="search"
                  placeholder="What part are you looking for?"
                  className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-200"
                />
                <button type="submit" className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700">
                  Search parts
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
                <span className="inline-flex items-center gap-2"><span className="text-red-400">✓</span> Browse by category</span>
                <span className="inline-flex items-center gap-2"><span className="text-red-400">✓</span> Compare products</span>
                <span className="inline-flex items-center gap-2"><span className="text-red-400">✓</span> Shop online in Kenya</span>
              </div>
            </div>

            <div className="relative mx-auto hidden h-[300px] w-full max-w-[440px] lg:block">
              <div className="absolute inset-5 rotate-[-5deg] rounded-[32px] border border-white/10 bg-white/[0.035]" />
              <div className="absolute inset-0 rotate-[4deg] rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-700/60 to-slate-900/50 shadow-2xl" />
              <div className="absolute inset-0 flex flex-col justify-between rounded-[32px] p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Find what fits</span>
                    <p className="mt-2 text-2xl font-bold tracking-tight">Parts for every<br />part of the ride.</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-2xl shadow-lg shadow-red-950/40" aria-hidden="true">⚙️</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.slice(0, 4).map((category) => (
                    <Link
                      key={category.slug}
                      href={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm font-semibold text-slate-100 transition hover:border-red-400/60 hover:bg-white/10"
                    >
                      <span aria-hidden="true">{category.icon}</span>
                      <span className="truncate">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16" aria-label="Marketplace benefits">
          <div className="grid gap-4 md:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl" aria-hidden="true">{benefit.icon}</span>
                <div>
                  <h2 className="font-bold text-slate-900">{benefit.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="categories-heading">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Find your part</p>
              <h2 id="categories-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Shop by category</h2>
              <p className="mt-2 text-sm text-slate-500">Start with the part of your motorcycle you need.</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-red-600 transition hover:text-red-700">
              View all products <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group flex min-h-[116px] items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md sm:gap-4 sm:p-5"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${category.tone} text-xl sm:h-12 sm:w-12 sm:text-2xl`} aria-hidden="true">
                  {category.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-800 transition group-hover:text-red-600 sm:text-base">{category.name}</span>
                  <span className="mt-1 block text-xs text-slate-500">Explore parts <span aria-hidden="true">→</span></span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-14 sm:pt-20" aria-labelledby="popular-heading">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Selected for you</p>
              <h2 id="popular-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Popular motorcycle parts</h2>
              <p className="mt-2 text-sm text-slate-500">Explore products available from marketplace sellers.</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-red-600 transition hover:text-red-700">
              Browse all <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {loading ? (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500" role="status">
                Loading products…
              </div>
            ) : productsError ? (
              <div className="col-span-full rounded-2xl border border-red-200 bg-white p-8 text-center" role="alert">
                <p className="text-sm text-slate-700">{productsError}</p>
                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                  className="mt-4 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No products are available right now.
              </div>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  images={product.images}
                  seller={product.seller}
                  category={getCategoryName(product)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
