"use client";

import { useEffect, useRef, useState } from "react";
import type { Post } from "@/types";
import { formatDate } from "@/lib/datetime";

interface PostCardProps {
  post: Post;
  showVisibility?: boolean;
  onToggleVisibility?: (id: string, visible: boolean) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
}

export default function PostCard({
  post,
  showVisibility,
  onToggleVisibility,
  onEdit,
  onDelete,
}: PostCardProps) {
  const isDriver = post.author_type === "driver";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [post.content]);

  return (
    <>
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shrink-0 ${
                    isDriver ? "bg-blue-500" : "bg-green-500"
                  }`}
                >
                  {isDriver ? "TX" : "HK"}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {post.author_name || "Ẩn danh"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(post.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Đóng"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Dialog content */}
            <div className="px-5 py-4 overflow-y-auto flex-1">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
            {/* Dialog contact */}
            {(post.phone || post.facebook_url || post.zalo_url) && (
              <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
                <ContactLinks post={post} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className={`bg-white rounded-xl shadow-sm border p-4 sm:p-5 transition-all hover:shadow-md ${
          !post.is_visible ? "opacity-60 border-red-200" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-bold shrink-0 ${
                isDriver ? "bg-blue-500" : "bg-green-500"
              }`}
            >
              {isDriver ? "TX" : "HK"}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {post.author_name || "Ẩn danh"}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium shrink-0 ${
              isDriver
                ? "bg-blue-50 text-blue-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {isDriver ? "Tìm khách" : "Tìm xe"}
          </span>
        </div>

        {/* Content — capped at 2 lines */}
        <div className="mb-3">
          <p
            ref={contentRef}
            className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-2"
          >
            {post.content}
          </p>
          {isTruncated && (
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Xem thêm
            </button>
          )}
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-2">
          <ContactLinks post={post} />
        </div>

        {/* Admin/owner actions */}
        {(showVisibility || onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
            {showVisibility && onToggleVisibility && (
              <button
                onClick={() => onToggleVisibility(post.id, !post.is_visible)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  post.is_visible
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                {post.is_visible ? "Ẩn bài" : "Hiện bài"}
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Sửa
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Xoá
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function ContactLinks({ post }: { post: Post }) {
  if (!post.phone && !post.facebook_url && !post.zalo_url) return null;
  return (
    <>
      {post.phone && (
        <a
          href={`tel:${post.phone}`}
          className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {post.phone}
        </a>
      )}
      {post.facebook_url && (
        <a
          href={post.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>
      )}
      {post.zalo_url && (
        <a
          href={post.zalo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
        >
          <span className="font-bold text-[10px]">Zalo</span>
          Zalo
        </a>
      )}
    </>
  );
}
