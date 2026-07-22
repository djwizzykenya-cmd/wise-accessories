import React from "react";
import Link from "next/link";

interface Props {
  id: string;
  name: string;
  price: number;
  images?: string[];
  seller?: { shopName?: string };
  category?: string;
}

export default function ProductCard({ id, name, price, images = [], seller, category }: Props) {
  const originalPrice = Math.round(price * 1.22);
  return (
    <div className="group rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${id}`} className="block rounded-[28px]">
        <div className="relative overflow-hidden rounded-t-[28px] bg-slate-100">
          <img
            src={images[0] || "/placeholder-product.svg"}
            alt={name}
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow-lg">
            hot deal
          </div>
        </div>

        <div className="space-y-3 p-4">
          {category && <div className="text-[11px] uppercase tracking-[0.25em] text-red-600">{category}</div>}
          <h3 className="min-h-[3rem] text-sm font-semibold text-slate-900">{name}</h3>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{seller?.shopName || "Wise Accessories Store"}</p>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xl font-bold text-red-600">KES {price.toFixed(0)}</div>
              <div className="text-xs text-slate-400 line-through">KES {originalPrice.toFixed(0)}</div>
            </div>
          </div>
        </div>
      </Link>

      <Link
        href={`/checkout?product=${id}`}
        className="mx-4 mb-4 inline-flex w-auto items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Buy now
      </Link>
    </div>
  );
}
