"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/api";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  items: number;
  total?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt?: string;
}

function AdminOrdersContent() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!isReady) return;

    if (!user || user.userType !== "admin") {
      router.replace("/");
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      try {
        const query = filterStatus !== "all" ? `?status=${encodeURIComponent(filterStatus)}` : "";
        const response = await apiClient.get(`/orders${query}`);
        setOrders(response.data.data || []);
      } catch (err) {
        console.error(err);
        // Mock data for demo
        setOrders([
          { id: "1", orderNumber: "WIS-001", customer: "John Doe", email: "john@example.com", items: 3, total: 15500, status: "delivered", createdAt: "2026-03-15" },
          { id: "2", orderNumber: "WIS-002", customer: "Jane Smith", email: "jane@example.com", items: 1, total: 5200, status: "shipped", createdAt: "2026-03-16" },
          { id: "3", orderNumber: "WIS-003", customer: "Mike Johnson", email: "mike@example.com", items: 2, total: 8900, status: "processing", createdAt: "2026-03-17" },
          { id: "4", orderNumber: "WIS-004", customer: "Sarah Wilson", email: "sarah@example.com", items: 4, total: 22300, status: "pending", createdAt: "2026-03-18" },
          { id: "5", orderNumber: "WIS-005", customer: "Tom Brown", email: "tom@example.com", items: 1, total: 3200, status: "delivered", createdAt: "2026-03-14" },
          { id: "6", orderNumber: "WIS-006", customer: "Emily Davis", email: "emily@example.com", items: 2, total: 12100, status: "cancelled", createdAt: "2026-03-13" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isReady, user, router, filterStatus]);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "all") return true;
    return o.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return "✓";
      case "shipped":
        return "📦";
      case "processing":
        return "⚙️";
      case "pending":
        return "⏳";
      case "cancelled":
        return "✕";
      default:
        return "?";
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!isReady || !user) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
        <div className="rounded-3xl bg-white p-10 shadow-lg text-center">
          <p className="text-lg font-semibold text-slate-900">Checking admin access...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Header */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-600">Admin Orders</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Order Management</h1>
              <p className="mt-2 text-sm text-slate-500">Track and manage all marketplace orders.</p>
            </div>
            <Link
              href="/admin"
              className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Orders Management */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    filterStatus === status
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status === "all" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="text-center text-slate-500 py-12">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center text-slate-500 py-12">No orders found.</div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-slate-200 rounded-2xl p-4 hover:border-orange-300 hover:bg-orange-50 transition"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900 text-lg">{order.orderNumber}</h3>
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{order.customer} • {order.email}</p>
                        <div className="flex items-center gap-6 mt-3 text-sm text-slate-600">
                          <span>📦 {order.items} items</span>
                          <span>💰 KES {(order.total ?? 0).toLocaleString()}</span>
                          <span>📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown date"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order["status"])}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Details →</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">KES {orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? (o.total ?? 0) : 0), 0).toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">💰 Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
                <p className="text-sm text-slate-500 mt-1">📊 Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{orders.filter(o => o.status === "delivered").length}</p>
                <p className="text-sm text-slate-500 mt-1">✓ Delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminOrdersPage() {
  return <AdminOrdersContent />;
}
