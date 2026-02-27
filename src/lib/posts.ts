import { supabase } from "@/lib/supabase";
import type { PostFilter, Post, JWTPayload } from "@/types";

export const PAGE_SIZE = 10;

export function getDateFilter(filter: PostFilter): string | null {
  const now = new Date();
  switch (filter) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    case "2days": {
      const start = new Date(now);
      start.setDate(start.getDate() - 2);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    default:
      return null;
  }
}

export async function fetchPosts({
  page = 1,
  filter = "all",
  type = "",
  user = null,
}: {
  page?: number;
  filter?: PostFilter;
  type?: string;
  user?: JWTPayload | null;
}): Promise<{
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  // Determine which posts to show:
  // - Not logged in (passenger) -> show driver posts
  // - Logged in as driver -> show passenger posts
  // - Admin -> show all (or use type param)
  let authorType: string | null = null;
  if (user?.role === "admin") {
    authorType = type || null; // Admin can filter by type or see all
  } else if (user?.role === "driver") {
    authorType = "passenger";
  } else {
    authorType = "driver";
  }

  // Build query
  let query = supabase.from("posts").select("*", { count: "exact" });

  // Non-admin users only see visible posts
  if (user?.role !== "admin") {
    query = query.eq("is_visible", true);
  }

  if (authorType) {
    query = query.eq("author_type", authorType);
  }

  const dateFilter = getDateFilter(filter);
  if (dateFilter) {
    query = query.gte("created_at", dateFilter);
  }

  // Get total count first
  const { count } = await query;
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Fetch paginated results
  let dataQuery = supabase.from("posts").select("*");

  if (user?.role !== "admin") {
    dataQuery = dataQuery.eq("is_visible", true);
  }

  if (authorType) {
    dataQuery = dataQuery.eq("author_type", authorType);
  }

  if (dateFilter) {
    dataQuery = dataQuery.gte("created_at", dateFilter);
  }

  const { data: posts, error } = await dataQuery
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (error) {
    console.error("Posts fetch error:", error);
    throw new Error("Không thể tải bài đăng");
  }

  return {
    posts: posts || [],
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}
