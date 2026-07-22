"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import DeliveryMap from "@/components/DeliveryMap";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { products as localProducts } from "@/data/products";

const PAYMENT_METHODS = [
  { value: "cash_on_delivery", label: "Cash on delivery" },
  { value: "mobile_money", label: "M-Pesa" },
  { value: "card", label: "Card payment" }
];

export default function CheckoutPage() {
  const { items, total, addItem } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "KE"
  });
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderPayload = useMemo(
    () => ({
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
      shippingAddress: {
        ...shippingAddress,
        latitude: typeof window !== "undefined" ? Number(localStorage.getItem("deliveryCoords") ? JSON.parse(localStorage.getItem("deliveryCoords") as string).lat : 0) : 0,
        longitude: typeof window !== "undefined" ? Number(localStorage.getItem("deliveryCoords") ? JSON.parse(localStorage.getItem("deliveryCoords") as string).lng : 0) : 0
      },
      paymentMethod
    }),
    [items, shippingAddress, paymentMethod]
  );

  useEffect(() => {
    const productId = searchParams.get("product");
    if (!productId || items.length > 0) {
      return;
    }

    const addQuickBuyItem = (product: { id: string; name: string; price: number; images?: string[] }) => {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0]
      });
    };

    (async () => {
      try {
        const res = await apiClient.get(`/products/${productId}`);
        const p = res.data.data;
        if (p) {
          addQuickBuyItem(p);
          return;
        }
      } catch (e) {
        console.error("Failed to load product for quick buy via API", e);
      }

      try {
        const localProduct = localProducts.find((item) => item.id === productId);
        if (localProduct) {
          addQuickBuyItem(localProduct);
          return;
        }
      } catch (err) {
        console.error("Local product fallback failed", err);
      }

      try {
        const r = await fetch(`/products.json`);
        const data = await r.json();
        const p = (data || []).find((x: any) => x.id === productId);
        if (p) {
          addQuickBuyItem(p);
        }
      } catch (err) {
        console.error("Fallback product load failed", err);
      }
    })();
  }, [searchParams, items.length, addItem]);

  const handleAddressChange = (field: string, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      setError("Please fill in your shipping address.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post("/orders", {
        ...orderPayload
      });

      const orderId = response.data.data?.orderId;
      if (!orderId) {
        throw new Error("Invalid order response");
      }

      localStorage.setItem("currentOrderId", orderId);
      router.push(`/payment?orderId=${orderId}`);
    } catch (err) {
      console.warn("Backend order create failed, using demo checkout flow", err);
      const fallbackOrderId = `demo-order-${Date.now()}`;
      localStorage.setItem("currentOrderId", fallbackOrderId);
      localStorage.setItem("demoOrderPayload", JSON.stringify(orderPayload));
      router.push(`/payment?orderId=${fallbackOrderId}`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-4 text-slate-600">Add items from the catalog or use Buy now from any product card.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/products" className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
              Browse products
            </Link>
            <Link href="/" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-500 hover:text-red-600">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-lg">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <Link href="/products" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-500 hover:text-red-600">
            ← Back to products
          </Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Shipping address</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Street address</span>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="123 Nairobi Road"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">City</span>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Nairobi"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">State / County</span>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Nairobi County"
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Postal code</span>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="00100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Country</span>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange("country", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="KE"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Payment method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.value} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="font-medium text-slate-900">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Order summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-4 rounded-3xl bg-white p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-indigo-600">KES {(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-slate-900">KES {total.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <div className="mb-4">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Delivery map</p>
                <h3 className="text-lg font-semibold text-slate-900">Choose delivery location</h3>
              </div>
              <DeliveryMap />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-3xl bg-red-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Placing order…" : "Place order and continue to payment"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
