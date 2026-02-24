"use client";

import { useState, useEffect, useCallback } from "react";
import type { Post, PostFilter, PostsResponse } from "@/types";
import PostCard from "./PostCard";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";

interface PostListProps {
  /** Which type of posts to fetch. Omit for auto (based on login state). */
  type?: string;
  /** Show admin controls */
  showAdminControls?: boolean;
  /** Show edit/delete for owner */
  showOwnerControls?: boolean;
  /** Current user id for owner check */
  currentUserId?: string;
  /** Callback when edit is clicked */
  onEdit?: (post: Post) => void;
}

export default function PostList({
  type,
  showAdminControls,
  showOwnerControls,
  currentUserId,
  onEdit,
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PostFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        filter,
      });
      if (type) params.set("type", type);

      const res = await fetch(`/api/posts?${params}`);
      const data: PostsResponse = await res.json();

      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      console.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [page, filter, type]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleFilterChange = (newFilter: PostFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    try {
      const res = await fetch(`/api/posts/${id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: visible }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_visible: visible } : p))
        );
      }
    } catch {
      console.error("Failed to toggle visibility");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá bài đăng này?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch {
      console.error("Failed to delete post");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <FilterBar activeFilter={filter} onFilterChange={handleFilterChange} />
        <span className="text-xs text-gray-400 shrink-0">{total} bài đăng</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="space-y-1">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-100 rounded" />
                <div className="w-3/4 h-3 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">Chưa có bài đăng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              showVisibility={showAdminControls}
              onToggleVisibility={
                showAdminControls ? handleToggleVisibility : undefined
              }
              onEdit={
                showAdminControls ||
                (showOwnerControls && post.user_id === currentUserId)
                  ? onEdit
                  : undefined
              }
              onDelete={
                showAdminControls ||
                (showOwnerControls && post.user_id === currentUserId)
                  ? handleDelete
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
