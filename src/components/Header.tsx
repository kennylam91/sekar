"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🚗</span>
          <span className="font-bold text-xl text-primary-700">Sekar</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">
          <Link
            href="/dang-bai"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            + Đăng bài
          </Link>

          {loading ? (
            <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
          ) : user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Quản trị
                </Link>
              )}
              {user.role === "driver" && (
                <Link
                  href="/ho-so"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Hồ sơ
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Đăng xuất
              </button>
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {user.display_name || user.username}
              </span>
            </>
          ) : (
            <>
              <Link
                href="/dang-nhap"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/dang-ky"
                className="text-sm border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Đăng ký tài xế
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link
            href="/dang-bai"
            className="block bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium text-center"
            onClick={() => setMenuOpen(false)}
          >
            + Đăng bài
          </Link>

          {loading ? null : user ? (
            <>
              <div className="text-sm text-gray-500 px-1 pt-1">
                Xin chào, <strong>{user.display_name || user.username}</strong>
              </div>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="block text-sm text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Quản trị
                </Link>
              )}
              {user.role === "driver" && (
                <Link
                  href="/ho-so"
                  className="block text-sm text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Hồ sơ
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left text-sm text-red-600 px-4 py-2 rounded hover:bg-red-50"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/dang-nhap"
                className="block text-sm text-gray-700 px-4 py-2.5 rounded hover:bg-gray-50 text-center"
                onClick={() => setMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                href="/dang-ky"
                className="block text-sm border border-primary-600 text-primary-600 px-4 py-2.5 rounded-lg text-center"
                onClick={() => setMenuOpen(false)}
              >
                Đăng ký tài xế
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
