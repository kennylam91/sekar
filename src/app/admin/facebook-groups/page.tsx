"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FacebookGroupsManager from "@/components/FacebookGroupsManager";
import type { User } from "@/types";

export default function FacebookGroupsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          ← Về bảng điều khiển
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Cấu hình nhóm Facebook
      </h1>

      <FacebookGroupsManager />
    </div>
  );
}
