"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/api";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  userType: "customer" | "seller" | "admin";
  createdAt: string;
}

function AdminUsersContent() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (!isReady) return;

    if (!user || user.userType !== "admin") {
      router.replace("/");
      return;
    }

    const loadUsers = async () => {
      setLoading(false);
      try {
        const response = await apiClient.get("/users");
        setUsers(response.data.data || []);
      } catch (err) {
        console.error(err);
        // Mock data for demo
        setUsers([
          { id: "1", name: "John Doe", email: "john@example.com", userType: "customer", createdAt: "2026-01-15" },
          { id: "2", name: "Jane Smith", email: "jane@example.com", userType: "seller", createdAt: "2026-01-20" },
          { id: "3", name: "Mike Johnson", email: "mike@example.com", userType: "customer", createdAt: "2026-02-10" },
          { id: "4", name: "Sarah Wilson", email: "sarah@example.com", userType: "seller", createdAt: "2026-02-15" },
          { id: "5", name: "Tom Brown", email: "tom@example.com", userType: "customer", createdAt: "2026-03-01" },
          { id: "6", name: "Emily Davis", email: "emily@example.com", userType: "customer", createdAt: "2026-03-10" },
        ]);
      }
    };

    loadUsers();
  }, [isReady, user, router]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || u.userType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getUserBadgeColor = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "seller":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <p className="text-sm uppercase tracking-[0.2em] text-purple-600">Admin Users</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">User Management</h1>
              <p className="mt-2 text-sm text-slate-500">Manage customers, sellers and admins.</p>
            </div>
            <Link
              href="/admin"
              className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Users Management */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Users</option>
                <option value="customer">Customers</option>
                <option value="seller">Sellers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Users List */}
            {loading ? (
              <div className="text-center text-slate-500 py-12">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-slate-500 py-12">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Joined</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-slate-900 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-slate-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getUserBadgeColor(u.userType)}`}>
                            {u.userType.charAt(0).toUpperCase() + u.userType.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.userType === "customer").length}</p>
                <p className="text-sm text-slate-500 mt-1">👥 Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.userType === "seller").length}</p>
                <p className="text-sm text-slate-500 mt-1">🏪 Sellers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                <p className="text-sm text-slate-500 mt-1">📊 Total Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
