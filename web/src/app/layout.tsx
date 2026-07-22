import type { Metadata } from "next";
import ClientProviders from "@/app/ClientProviders";
import "@/globals.css";

export const metadata: Metadata = {
  title: "Wise Accessories - Motorcycle Spares Marketplace",
  description: "Buy and sell quality motorcycle spares in Kenya"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
