"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function AdminDashboard() {
  const { user, isReady } = useAuth();
  const router = useRouter();

    const [counts, setCounts] = useState<{
      products: number | null;
      users: number | null;
      sellers: number | null;
      orders: number | null;
    }>({ products: null, users: null, sellers: null, orders: null });
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);

    useEffect(() => {
      if (!isReady) return;

      if (!user || user.userType !== "admin") {
        router.replace("/");
        return;
      }

      let mounted = true;

      const loadStats = async () => {
        setStatsLoading(true);
        setStatsError(null);

        try {
          const prodRes = await (await import("@/lib/api")).default.get("/products/admin?limit=1");
          const productsTotal = prodRes.data?.meta?.total ?? (Array.isArray(prodRes.data?.data) ? prodRes.data.data.length : null);

          const usersRes = await (await import("@/lib/api")).default.get("/users");
          const usersTotal = Array.isArray(usersRes.data?.data) ? usersRes.data.data.length : null;

          const sellersRes = await (await import("@/lib/api")).default.get("/sellers");
          const sellersTotal = Array.isArray(sellersRes.data?.data) ? sellersRes.data.data.length : null;

          const ordersRes = await (await import("@/lib/api")).default.get("/orders");
          const ordersTotal = Array.isArray(ordersRes.data?.data) ? ordersRes.data.data.length : null;

          if (!mounted) return;
          setCounts({ products: productsTotal, users: usersTotal, sellers: sellersTotal, orders: ordersTotal });
        } catch (err: unknown) {
          console.warn("Failed to load admin stats", err);
          if (!mounted) return;
          setStatsError("Could not load stats");
        } finally {
          if (mounted) setStatsLoading(false);
        }
      };

      loadStats();

      return () => {
        mounted = false;
      };
    }, [isReady, user, router]);

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
      <div className="mx-auto max-w-7xl space-y-8 px-4">
        {/* Welcome Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 shadow-xl text-white">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, {user.firstName || user.lastName ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Admin"}!
          </h1>
          <p className="text-blue-100 text-lg">Manage your e-commerce marketplace with ease</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm font-semibold uppercase">Total Products</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{statsLoading ? "Loading..." : counts.products ?? "—"}</p>
            <p className="text-green-600 text-xs mt-2">{statsError ? "" : "📈 +12 this week"}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm font-semibold uppercase">Total Users</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{statsLoading ? "Loading..." : counts.users ?? "—"}</p>
            <p className="text-green-600 text-xs mt-2">{statsError ? "" : "👥 +89 this week"}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-slate-600 text-sm font-semibold uppercase">Active Sellers</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{statsLoading ? "Loading..." : counts.sellers ?? "—"}</p>
            <p className="text-green-600 text-xs mt-2">{statsError ? "" : "🏪 +3 approved"}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-slate-600 text-sm font-semibold uppercase">Pending Orders</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{statsLoading ? "Loading..." : counts.orders ?? "—"}</p>
            <p className="text-orange-600 text-xs mt-2">{statsError ? "" : "⚠️ Needs attention"}</p>
          </div>
        </div>

        {/* Management Sections */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Management Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Products Card */}
            <Link
              href="/admin/products"
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:scale-105 p-6 border-l-4 border-blue-500 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Products</h3>
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-slate-600 text-sm">Add, edit, delete products with images and categories</p>
              <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm hover:text-blue-800">
                Go to Products →
              </div>
            </Link>

            {/* Users Card */}
            <Link
              href="/admin/users"
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:scale-105 p-6 border-l-4 border-green-500 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Users</h3>
                <span className="text-4xl">👥</span>
              </div>
              <p className="text-slate-600 text-sm">View and manage customer accounts and profiles</p>
              <div className="mt-4 flex items-center text-green-600 font-semibold text-sm hover:text-green-800">
                Go to Users →
              </div>
            </Link>

            {/* Sellers Card */}
            <Link
              href="/admin/sellers"
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:scale-105 p-6 border-l-4 border-purple-500 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Sellers</h3>
                <span className="text-4xl">🏪</span>
              </div>
              <p className="text-slate-600 text-sm">Approve, review and manage seller partnerships</p>
              <div className="mt-4 flex items-center text-purple-600 font-semibold text-sm hover:text-purple-800">
                Go to Sellers →
              </div>
            </Link>

            {/* Orders Card */}
            <Link
              href="/admin/orders"
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:scale-105 p-6 border-l-4 border-orange-500 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Orders</h3>
                <span className="text-4xl">📋</span>
              </div>
              <p className="text-slate-600 text-sm">Track, update and manage all marketplace orders</p>
              <div className="mt-4 flex items-center text-orange-600 font-semibold text-sm hover:text-orange-800">
                Go to Orders →
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-slate-900">5 new products added</p>
                <p className="text-xs text-slate-500">2 hours ago</p>
              </div>
              <span>📦</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-slate-900">New seller registered: Tech Store</p>
                <p className="text-xs text-slate-500">5 hours ago</p>
              </div>
              <span>🏪</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-orange-500 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-slate-900">12 new orders received</p>
                <p className="text-xs text-slate-500">8 hours ago</p>
              </div>
              <span>📋</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm py-6">
          <p>Wise Accessories Admin Dashboard • Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
