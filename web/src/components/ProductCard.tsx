"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import WishlistButton from "@/components/WishlistButton";

interface Props {
  id: string;
  name: string;
  price: number;
  images?: string[];
  seller?: { shopName?: string };
  category?: string;
}

export default function ProductCard({ id, name, price, images = [], seller, category }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name,
      price,
      quantity: 1,
      image: images[0]
    });
    setAdded(true);
  };

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03] transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${id}`} className="block min-w-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={images[0] || "/placeholder-product.svg"}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 p-3 sm:p-4">
          {category && <div className="mb-2 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">{category}</div>}
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900 sm:text-base">{name}</h3>
          <p className="mt-2 truncate text-xs text-slate-500">{seller?.shopName || "Wise Accessories Store"}</p>
          <div className="mt-3 text-base font-extrabold text-slate-950 sm:text-lg">
            KES {price.toLocaleString("en-KE")}
          </div>
        </div>
      </Link>

      <div className="mx-3 mb-3 mt-auto grid gap-2 sm:mx-4 sm:mb-4">
        <WishlistButton
          product={{
            id,
            name,
            price,
            images,
            category,
            seller: { shopName: seller?.shopName || "Wise Accessories Store" }
          }}
        />
        <button
          type="button"
          onClick={handleAddToCart}
          aria-live="polite"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-red-600 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
        <Link
          href={`/checkout?product=${id}`}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          Buy now
        </Link>
      </div>
    </article>
  );
}
