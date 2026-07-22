"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import apiClient from "@/lib/api";

export default function PaymentPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderId = searchParams.get("orderId") || (typeof window !== "undefined" ? localStorage.getItem("currentOrderId") : null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("deliveryCoords");
      if (raw) setCoords(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const handlePay = async () => {
    setError("");
    setLoading(true);

    if (!orderId) {
      setError("Order information is missing.");
      setLoading(false);
      return;
    }

    try {
      await apiClient.post(`/orders/${orderId}/pay`, {
        transactionId: `txn_${Date.now()}`
      });
    } catch (err) {
      console.warn("Backend payment call failed, continuing with demo payment flow", err);
    } finally {
      clear();
      localStorage.removeItem("currentOrderId");
      localStorage.removeItem("demoOrderPayload");
      router.push('/order-success');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900">Nothing to pay for</h1>
          <p className="mt-4 text-slate-600">Add items to the cart or use Buy now from a product page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Payment</h1>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.productId} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-slate-500">Qty: {it.quantity}</div>
                </div>
                <div className="font-bold">KES {(it.price * it.quantity).toFixed(0)}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">Delivery location</div>
            <div className="text-sm text-slate-700">{coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Not selected'}</div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="font-medium">Total</div>
            <div className="text-xl font-bold">KES {total.toFixed(0)}</div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-6 grid gap-3">
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full rounded-3xl bg-green-600 px-5 py-3 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Processing payment…" : "Pay now"}
            </button>
            <button onClick={() => router.back()} className="w-full rounded-3xl border border-slate-200 px-5 py-3">
              Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
