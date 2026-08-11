"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { products as localProducts } from "@/data/products";
import NotFoundPage from "./not-found";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  stock: number;
  category?: { name: string } | string;
  seller: { shopName: string };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const response = await apiClient.get(`/products/${params.id}`);
        const apiProduct = response.data?.data as Product | null;
        if (active && apiProduct) {
          setProduct(apiProduct);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn("Product API fetch failed, falling back to local product data", error);
      }

      const local = localProducts.find((item) => item.id === params.id);
      if (!active) return;

      if (local) {
        setProduct(local as Product);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-xl text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Loading product</p>
          <h1 className="mt-6 text-4xl font-bold text-slate-900">Please wait while we load the details</h1>
        </div>
      </main>
    );
  }

  if (notFound || !product) {
    return <NotFoundPage />;
  }

  const categoryName = typeof product.category === "string" ? product.category : product.category?.name;
  const originalPrice = Math.round(product.price * 1.22);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-red-600">Product details</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">{product.name}</h1>
            <p className="mt-3 text-sm text-slate-600">By {product.seller.shopName}</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-red-500 hover:text-red-600">
            ← Back to products
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="overflow-hidden rounded-3xl bg-slate-100">
              <Image
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
                width={1080}
                height={720}
                className="h-[420px] w-full object-cover"
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {product.images?.slice(1, 5).map((src, index) => (
                <div key={index} className="overflow-hidden rounded-3xl bg-slate-100">
                  <Image src={src} alt={`${product.name} ${index + 2}`} width={280} height={128} className="h-24 w-full object-cover sm:h-32" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Category</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{categoryName || "Parts"}</p>
                </div>
                <div className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${product.stock > 0 ? "bg-red-600" : "bg-slate-400"}`}>
                  {product.stock > 0 ? "In stock" : "Out of stock"}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Price</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-4xl font-bold text-red-600">KES {product.price.toFixed(0)}</span>
                    <span className="text-sm text-slate-400 line-through">KES {originalPrice.toFixed(0)}</span>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Save</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{Math.round(((originalPrice - product.price) / originalPrice) * 100)}% on this item</p>
                </div>
              </div>

              <Link
                href={product.stock > 0 ? `/checkout?product=${product.id}` : "/products"}
                className={`w-full inline-flex items-center justify-center rounded-3xl px-6 py-4 text-sm font-semibold text-white transition ${
                  product.stock > 0 ? "bg-red-600 hover:bg-red-700" : "bg-slate-400 cursor-not-allowed"
                }`}
              >
                {product.stock > 0 ? "Buy now" : "Out of stock"}
              </Link>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Product Description</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{product.description || "This product is a premium motorcycle spare part sourced from our trusted sellers. It is designed for durability and great value."}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Payment</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">M-Pesa, card, COD</p>
          </div>
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Delivery</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Fast shipping Kenya-wide</p>
          </div>
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Seller</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{product.seller.shopName}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
