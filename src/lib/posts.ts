import { supabase } from "@/lib/supabase";
import type { PostFilter, Post, JWTPayload } from "@/types";

export const PAGE_SIZE = 10;

export function getDateFilter(filter: PostFilter): string | null {
  if (filter === "all") return null;

  const now = new Date();
  let daysToSubtract = { today: 0, "2days": 1, week: 6 }[filter];

  return new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - daysToSubtract,
      -7,
    ),
  ).toISOString();
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

// extract vietnamese phone number from post content
export function extractPhone(message: string | undefined): string | null {
  if (!message) return null;
  // Match phone numbers with optional space/dot separators, or 1900.xx.xx.xx format
  const phoneRegex = /(?:\+84|0)\d(?:[.\s]?\d){8,10}|1900(?:\.\d{2}){3}/g;
  const match = message.match(phoneRegex);
  if (!match) return null;
  const raw = match[0];
  // Keep 1900.xx.xx.xx format as-is; strip separators from standard numbers
  if (raw.startsWith("1900")) return raw;
  return raw.replace(/[\s.]/g, "");
}
