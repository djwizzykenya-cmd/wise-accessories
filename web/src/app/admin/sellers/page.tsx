"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/api";
import Link from "next/link";

interface Seller {
  id: string;
  shopName: string;
  ownerName: string;
  email: string;
  status: "pending" | "approved" | "suspended";
  products: number;
  rating: number;
  createdAt: string;
}

function AdminSellersContent() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!isReady) return;

    if (!user || user.userType !== "admin") {
      router.replace("/");
      return;
    }

    const loadSellers = async () => {
      setLoading(false);
      try {
        const response = await apiClient.get("/sellers");
        setSellers(response.data.data || []);
      } catch (err) {
        console.error(err);
        // Mock data for demo
        setSellers([
          { id: "1", shopName: "Wise Accessories Store", ownerName: "Ahmed Mwangi", email: "ahmed@wise.com", status: "approved", products: 15, rating: 4.8, createdAt: "2026-01-15" },
          { id: "2", shopName: "Speed Parts Kenya", ownerName: "Sarah Kipchoge", email: "sarah@speedparts.com", status: "approved", products: 8, rating: 4.5, createdAt: "2026-01-20" },
          { id: "3", shopName: "Bike Heaven", ownerName: "David Mutua", email: "david@bikeheaven.com", status: "pending", products: 0, rating: 0, createdAt: "2026-03-10" },
          { id: "4", shopName: "Premium Moto", ownerName: "Lisa Okonkwo", email: "lisa@premiummoto.com", status: "approved", products: 12, rating: 4.6, createdAt: "2026-02-15" },
          { id: "5", shopName: "Quick Auto Parts", ownerName: "James Kiplagat", email: "james@quickparts.com", status: "suspended", products: 5, rating: 2.1, createdAt: "2026-02-01" },
        ]);
      }
    };

    loadSellers();
  }, [isReady, user, router]);

  const filteredSellers = sellers.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprove = async (sellerId: string) => {
    try {
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status: "approved" as const } : s))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspend = async (sellerId: string) => {
    try {
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status: "suspended" as const } : s))
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
              <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Admin Sellers</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Seller Management</h1>
              <p className="mt-2 text-sm text-slate-500">Approve, review, and manage seller partnerships.</p>
            </div>
            <Link
              href="/admin"
              className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Sellers Management */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex gap-2">
              {["all", "approved", "pending", "suspended"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status === "all" ? "All Sellers" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Sellers List */}
            {loading ? (
              <div className="text-center text-slate-500 py-12">Loading sellers...</div>
            ) : filteredSellers.length === 0 ? (
              <div className="text-center text-slate-500 py-12">No sellers found.</div>
            ) : (
              <div className="space-y-4">
                {filteredSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg">{seller.shopName}</h3>
                        <p className="text-sm text-slate-600 mt-1">{seller.ownerName} • {seller.email}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                          <span>📦 {seller.products} products</span>
                          <span>⭐ {seller.rating.toFixed(1)} rating</span>
                          <span>📅 {new Date(seller.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(seller.status)}`}>
                          {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                        </span>
                        {seller.status === "pending" && (
                          <button
                            onClick={() => handleApprove(seller.id)}
                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                          >
                            ✓ Approve
                          </button>
                        )}
                        {seller.status !== "suspended" && (
                          <button
                            onClick={() => handleSuspend(seller.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            ⊘ Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{sellers.length}</p>
                <p className="text-sm text-slate-500 mt-1">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{sellers.filter(s => s.status === "approved").length}</p>
                <p className="text-sm text-slate-500 mt-1">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{sellers.filter(s => s.status === "pending").length}</p>
                <p className="text-sm text-slate-500 mt-1">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{sellers.filter(s => s.status === "suspended").length}</p>
                <p className="text-sm text-slate-500 mt-1">Suspended</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminSellersPage() {
  return <AdminSellersContent />;
}
