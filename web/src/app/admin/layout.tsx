import type { Metadata } from "next";
import AdminHeader from "./AdminHeader";

export const metadata: Metadata = {
  title: "Wise Accessories Admin",
  description: "Admin dashboard for the Wise Accessories marketplace"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AdminHeader />
      {children}
    </div>
  );
}
