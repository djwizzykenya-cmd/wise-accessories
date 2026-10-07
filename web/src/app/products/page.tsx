"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import WishlistButton from "@/components/WishlistButton";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: Category | string;
  seller: {
    shopName: string;
  };
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "engine-parts", name: "Engine Parts", slug: "engine-parts" },
  { id: "transmission", name: "Transmission", slug: "transmission" },
  { id: "suspension", name: "Suspension", slug: "suspension" },
  { id: "brakes", name: "Brakes", slug: "brakes" },
  { id: "electrical", name: "Electrical", slug: "electrical" },
  { id: "tires-wheels", name: "Tires & Wheels", slug: "tires-wheels" },
  { id: "lights", name: "Lights", slug: "lights" },
  { id: "accessories", name: "Accessories", slug: "accessories" }
];

const updateQuery = (currentQuery: string, key: string, value: string) => {
  const params = new URLSearchParams(currentQuery);
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() || "";
  const categoryParam = searchParams?.get("category") || "";
  const searchParam = searchParams?.get("search") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    let active = true;

    apiClient.get("/products/categories")
      .then((response) => {
        const data = response.data?.data;
        if (active && Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((categoryError) => {
        console.error("Failed to load product categories", categoryError);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    apiClient.get("/products", {
      params: {
        limit: 100,
        ...(categoryParam ? { category: categoryParam } : {}),
        ...(searchParam ? { search: searchParam } : {})
      }
    })
      .then((response) => {
        const data = response.data?.data;
        if (!Array.isArray(data)) {
          throw new Error("The product catalog returned an invalid response.");
        }
        if (active) setProducts(data);
      })
      .catch((requestError) => {
        console.error("Failed to load products", requestError);
        if (active) {
          setProducts([]);
          setError("We couldn’t load the product catalog. Check your connection and try again.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [categoryParam, searchParam, retryCount]);

  useEffect(() => {
    const normalizedInput = searchInput.trim();
    if (normalizedInput === searchParam) return;

    const timeout = window.setTimeout(() => {
      router.replace(updateQuery(queryString, "search", normalizedInput));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [router, searchInput, searchParam, queryString]);

  const selectedCategory = categories.find(
    (category) => category.slug === categoryParam || category.name.toLowerCase() === categoryParam.toLowerCase()
  );
  const heading = selectedCategory ? selectedCategory.name : "Browse Products";

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Wise Accessories</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{heading}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {selectedCategory
                ? `Shop motorcycle spares in ${selectedCategory.name}.`
                : "Browse motorcycle spares from the Wise Accessories Store."}
            </p>
          </div>
          <Link href="/" className="text-red-600 hover:underline">
            Back to home
          </Link>
        </div>

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Product filters">
          <label htmlFor="product-search" className="mb-2 block text-sm font-medium text-slate-700">
            Search products
          </label>
          <input
            id="product-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by product name or description"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/products"
              aria-current={!categoryParam ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !categoryParam ? "bg-red-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All parts
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={updateQuery(queryString, "category", category.slug)}
                aria-current={selectedCategory?.slug === category.slug ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory?.slug === category.slug
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600" aria-live="polite">
            {loading ? "Loading products…" : `${products.length} ${products.length === 1 ? "product" : "products"} found`}
          </p>
          {(categoryParam || searchParam) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                router.push("/products");
              }}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white py-20 text-center text-slate-500" role="status">
            Loading products…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center" role="alert">
            <p className="text-slate-700">{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-white py-20 text-center text-slate-500">
            <p className="text-lg font-semibold text-slate-800">No matching products found.</p>
            <p className="mt-2">Try a different search or browse another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
                  <div className="h-48 overflow-hidden rounded-2xl bg-slate-100 sm:h-56">
                    <Image
                      src={product.images?.[0] || "/placeholder-product.svg"}
                      alt={product.name}
                      width={560}
                      height={224}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 flex flex-1 flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      {typeof product.category === "string" ? product.category : product.category?.name || "Parts"}
                    </p>
                    <h2 className="mt-2 text-base font-semibold text-slate-900">{product.name}</h2>
                    <p className="mt-2 text-sm text-slate-500">{product.seller?.shopName || "Wise Accessories Store"}</p>
                    <p className="mt-auto pt-4 text-xl font-bold text-red-600">KES {product.price.toLocaleString("en-KE")}</p>
                  </div>
                </Link>
                <div className="mt-4">
                  <WishlistButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      images: product.images || [],
                      category: product.category,
                      seller: product.seller
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
