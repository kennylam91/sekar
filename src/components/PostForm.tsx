"use client";

import { useState } from "react";
import type { Post } from "@/types";

interface PostFormProps {
  isDriver: boolean;
  editingPost?: Post | null;
  isAdmin?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PostForm({
  isDriver,
  editingPost,
  isAdmin,
  onSuccess,
  onCancel,
}: PostFormProps) {
  const [authorName, setAuthorName] = useState(editingPost?.author_name || "");
  const [content, setContent] = useState(editingPost?.content || "");
  const [phone, setPhone] = useState(editingPost?.phone || "");
  const [facebookUrl, setFacebookUrl] = useState(
    editingPost?.facebook_url || "",
  );
  const [zaloUrl, setZaloUrl] = useState(editingPost?.zalo_url || "");
  const [authorType, setAuthorType] = useState<"driver" | "passenger">(
    editingPost?.author_type ?? (isDriver ? "driver" : "passenger"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body: Record<string, string> = {
        content,
        phone,
        facebook_url: facebookUrl,
        zalo_url: zaloUrl,
      };

      const effectiveIsDriver =
        isAdmin && editingPost ? authorType === "driver" : isDriver;

      if (!effectiveIsDriver) {
        body.author_name = authorName;
      }

      if (isAdmin && editingPost) {
        body.author_type = authorType;
      }

      const url = editingPost ? `/api/posts/${editingPost.id}` : "/api/posts";
      const method = editingPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra");
        return;
      }

      setSuccess(
        editingPost ? "Đã cập nhật bài đăng!" : "Đã đăng bài thành công!",
      );

      if (!editingPost) {
        setContent("");
        setPhone("");
        setFacebookUrl("");
        setZaloUrl("");
        setAuthorName("");
      }

      onSuccess?.();
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const effectiveIsDriver =
    isAdmin && editingPost ? authorType === "driver" : isDriver;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Admin: author type toggle */}
      {isAdmin && editingPost && (
        <div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAuthorType("driver")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                authorType === "driver"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Tìm khách
            </button>
            <button
              type="button"
              onClick={() => setAuthorType("passenger")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                authorType === "passenger"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Tìm xe
            </button>
          </div>
        </div>
      )}

      {/* Author name for passengers */}
      {!effectiveIsDriver && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên hiển thị <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Nhập tên của bạn"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            required
            minLength={2}
          />
        </div>
      )}

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung bài đăng <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            effectiveIsDriver
              ? "Mô tả tuyến đường, thời gian khởi hành, số ghế trống..."
              : "Mô tả nơi bạn muốn đi, thời gian, số người..."
          }
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          required
          minLength={20}
        />
        <p className="text-xs text-gray-400 mt-1">
          Tối thiểu 20 ký tự ({content.length}/20)
        </p>
      </div>

      {/* Contact info */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Thông tin liên hệ{" "}
          <span className="text-gray-400 font-normal">(ít nhất 1)</span>
        </p>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912 345 678"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Link Facebook
          </label>
          <input
            type="url"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="https://facebook.com/username"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Link Zalo</label>
          <input
            type="url"
            value={zaloUrl}
            onChange={(e) => setZaloUrl(e.target.value)}
            placeholder="https://zalo.me/0912345678"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Đang xử lý..." : editingPost ? "Cập nhật" : "Đăng bài"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}
