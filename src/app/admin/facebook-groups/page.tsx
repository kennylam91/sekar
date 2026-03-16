"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FacebookGroupsManager from "@/components/FacebookGroupsManager";
import GroupStatsPanel from "@/components/GroupStatsPanel";
import type { User } from "@/types";

export default function FacebookGroupsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"nhom" | "thong-ke">("nhom");

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

      {/* Tab filter */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { value: "nhom", label: "Nhóm" },
            { value: "thong-ke", label: "Thống kê" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "nhom" ? <FacebookGroupsManager /> : <GroupStatsPanel />}
    </div>
  );
}
