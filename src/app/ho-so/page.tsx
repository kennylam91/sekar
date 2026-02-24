"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PostList from "@/components/PostList";
import PostForm from "@/components/PostForm";
import type { User, Post } from "@/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setDisplayName(data.user.display_name || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Có lỗi xảy ra");
      } else {
        setUser(data.user);
        setMessage("Đã cập nhật tên hiển thị!");
      }
    } catch {
      setMessage("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

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

      {/* Profile section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Hồ sơ của bạn</h1>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              minLength={2}
              required
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes("lỗi") || message.includes("Lỗi")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>

      {/* Edit post modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Chỉnh sửa bài đăng
            </h2>
            <PostForm
              isDriver={true}
              editingPost={editingPost}
              onSuccess={() => {
                setEditingPost(null);
                setRefreshKey((k) => k + 1);
              }}
              onCancel={() => setEditingPost(null)}
            />
          </div>
        </div>
      )}

      {/* My posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Bài đăng của bạn
        </h2>
        <PostList
          key={refreshKey}
          type="driver"
          showOwnerControls
          currentUserId={user.id}
          onEdit={(post) => setEditingPost(post)}
        />
      </div>
    </div>
  );
}
