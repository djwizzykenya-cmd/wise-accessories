import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wise Accessories Admin",
  description: "Admin dashboard for the Wise Accessories marketplace"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
