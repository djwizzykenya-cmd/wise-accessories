"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-20">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Login to Wise Accessories</h1>
        <p className="text-sm text-slate-500 mb-6">Use your email and password to sign in.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
