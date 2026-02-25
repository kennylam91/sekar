import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import FloatingCreateButton from "@/components/FloatingCreateButton";

export const metadata: Metadata = {
  title: "Sekar — Kết nối hành khách & tài xế",
  description:
    "Tìm kiếm tài xế hoặc hành khách có cùng tuyến đường. Nhanh chóng, đơn giản, miễn phí.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        <FloatingCreateButton />
      </body>
    </html>
  );
}
