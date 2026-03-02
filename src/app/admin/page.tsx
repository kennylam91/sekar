"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PostList from "@/components/PostList";
import PostForm from "@/components/PostForm";
import type { User, Post } from "@/types";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "driver" | "passenger">(
    "all",
  );
  const [stats, setStats] = useState({
    totalPosts: 0,
    driverPosts: 0,
    passengerPosts: 0,
  });

  const fetchUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [allRes, driverRes, passengerRes] = await Promise.all([
        fetch("/api/posts?page=1&filter=all"),
        fetch("/api/posts?page=1&filter=all&type=driver"),
        fetch("/api/posts?page=1&filter=all&type=passenger"),
      ]);
      const [allData, driverData, passengerData] = await Promise.all([
        allRes.json(),
        driverRes.json(),
        passengerRes.json(),
      ]);
      setStats({
        totalPosts: allData.total || 0,
        driverPosts: driverData.total || 0,
        passengerPosts: passengerData.total || 0,
      });
    } catch {
      console.error("Failed to fetch stats");
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchStats();
  }, [fetchUser, fetchStats]);

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
          href="/"
          className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          ← Về trang chủ
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Bảng điều khiển quản trị
      </h1>

      {/* Quick navigation */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/admin/scraper"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          🔌 Quản lý Facebook Scraper API
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Tổng bài đăng</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-600">Bài từ tài xế</p>
          <p className="text-2xl font-bold text-blue-900">
            {stats.driverPosts}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-600">Bài từ hành khách</p>
          <p className="text-2xl font-bold text-green-900">
            {stats.passengerPosts}
          </p>
        </div>
      </div>

      {/* Tab filter */}
      <div className="flex gap-2 mb-4">
        {(
          [
            { value: "all", label: "Tất cả" },
            { value: "driver", label: "Tài xế" },
            { value: "passenger", label: "Hành khách" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setRefreshKey((k) => k + 1);
            }}
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

      {/* Edit post modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Chỉnh sửa bài đăng (Admin)
            </h2>
            <PostForm
              isDriver={editingPost.author_type === "driver"}
              editingPost={editingPost}
              isAdmin
              onSuccess={() => {
                setEditingPost(null);
                setRefreshKey((k) => k + 1);
                fetchStats();
              }}
              onCancel={() => setEditingPost(null)}
            />
          </div>
        </div>
      )}

      {/* Posts list with admin controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <PostList
          key={`${activeTab}-${refreshKey}`}
          type={activeTab === "all" ? undefined : activeTab}
          showAdminControls
          onEdit={(post) => setEditingPost(post)}
        />
      </div>
    </div>
  );
}
