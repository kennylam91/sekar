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
        <footer className="border-t border-gray-200 bg-white mt-8 py-6">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
            Gặp sự cố hoặc cần hỗ trợ?{" "}
            <a
              href="https://www.facebook.com/profile.php?id=61580991429205"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline font-medium"
            >
              Liên hệ chúng tôi qua Facebook
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
