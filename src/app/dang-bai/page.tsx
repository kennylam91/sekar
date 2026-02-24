"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostForm from "@/components/PostForm";
import type { User } from "@/types";

export default function CreatePostPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isDriver = user?.role === "driver";

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          ← Về trang chủ
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {isDriver ? "Đăng bài tìm hành khách" : "Đăng bài tìm xe"}
        </h1>
        <p className="text-sm text-gray-500 mb-5">
          {isDriver
            ? "Mô tả tuyến đường và thông tin liên hệ để hành khách tìm thấy bạn."
            : "Mô tả nơi bạn muốn đi và thông tin liên hệ để tài xế liên hệ bạn."}
        </p>

        <PostForm isDriver={isDriver} />
      </div>
    </div>
  );
}
