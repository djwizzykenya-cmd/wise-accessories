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
  sku?: string | null;
  category?: { name: string } | string;
  seller: { shopName: string };
}

export default function ProductDetailClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setNotFound(false);
      setActiveImageIndex(0);
      setFailedImages([]);
      if (!productId) {
        setProduct(null);
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/products/${productId}`);
        const apiProduct = response.data?.data as Product | null;
        if (active && apiProduct) {
          setProduct(apiProduct);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn("Product API fetch failed, falling back to local product data", error);
      }

      const local = localProducts.find((item) => item.id === productId);
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
  }, [productId]);

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
  const productImages = product.images?.filter((image) => typeof image === "string" && image.length > 0) ?? [];
  const selectedImage = productImages[activeImageIndex];
  const activeImage = selectedImage && !failedImages.includes(selectedImage) ? selectedImage : "/placeholder-product.svg";
  const isAvailable = product.stock > 0;

  const markImageFailed = (src: string) => {
    setFailedImages((images) => images.includes(src) ? images : [...images, src]);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.24em] text-red-600">Product details</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-600">Sold by {product.seller.shopName}</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-red-500 hover:text-red-600">
            ← Back to products
          </Link>
        </div>

        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <section aria-label="Product images" className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-50">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 767px) 100vw, (max-width: 1152px) 58vw, 700px"
                className="object-contain p-4 sm:p-6"
                onError={() => {
                  if (selectedImage) markImageFailed(selectedImage);
                }}
              />
            </div>
            {productImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-label="Choose product image">
                {productImages.map((src, index) => !failedImages.includes(src) && (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      aria-label={`Show product image ${index + 1}`}
                      aria-pressed={activeImageIndex === index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition sm:h-24 sm:w-24 ${
                        activeImageIndex === index ? "border-red-600" : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                        onError={() => markImageFailed(src)}
                      />
                    </button>
                  ))}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Category</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{categoryName || "Parts"}</p>
                </div>
                <div className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${isAvailable ? "bg-emerald-700" : "bg-slate-500"}`}>
                  {isAvailable ? `${product.stock} in stock` : "Out of stock"}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Price</p>
                <p className="mt-2 text-3xl font-bold text-red-600 sm:text-4xl">
                  KES {product.price.toLocaleString("en-KE")}
                </p>
                {product.sku && <p className="mt-3 text-xs text-slate-500">Item code: {product.sku}</p>}
              </div>

              {isAvailable ? (
                <Link
                  href={`/checkout?product=${product.id}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-red-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                >
                  Buy now
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-300 px-6 py-4 text-sm font-semibold text-slate-600"
                >
                  Out of stock
                </button>
              )}
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
