"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  seller: {
    shopName: string;
  };
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fallback-1",
    name: "Brake Disc Set",
    price: 6500,
    images: ["/placeholder-product.svg"],
    seller: { shopName: "Wise Accessories" },
  },
  {
    id: "fallback-2",
    name: "Engine Oil Filter",
    price: 1800,
    images: ["/placeholder-product.svg"],
    seller: { shopName: "Moto Parts Hub" },
  },
  {
    id: "fallback-3",
    name: "Suspension Shock Absorber",
    price: 9200,
    images: ["/placeholder-product.svg"],
    seller: { shopName: "Ride Ready Shop" },
  },
  {
    id: "fallback-4",
    name: "LED Headlight Unit",
    price: 5400,
    images: ["/placeholder-product.svg"],
    seller: { shopName: "City Moto Spares" },
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("/products?limit=12");
        const data = response.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (error) {
        console.error(error);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Browse Products</h1>
            <p className="text-sm text-slate-600">Shop motorcycle spares from verified sellers.</p>
          </div>
          <Link href="/" className="text-indigo-600 hover:underline">
            Back to home
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No products found yet.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="h-56 overflow-hidden rounded-3xl bg-slate-100">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{product.seller.shopName}</p>
                  <p className="mt-4 text-xl font-bold text-red-600">KES {product.price.toFixed(0)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
