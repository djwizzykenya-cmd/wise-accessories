"use client";

import Link from "next/link";

export default function OrderSuccess() {
  return (
    <main className="min-h-screen bg-slate-50 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">Order placed</h1>
        <p className="mt-4 text-slate-600">Thank you — your order is being processed. We'll notify you with tracking details.</p>
        <div className="mt-6">
          <Link href="/" className="rounded-full bg-red-600 px-5 py-3 text-white">Back to shop</Link>
        </div>
      </div>
    </main>
  );
}
