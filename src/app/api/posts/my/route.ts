import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { getDateFilter } from "@/lib/posts";
import type { PostFilter } from "@/types";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để xem bài đăng của mình" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const filter = (searchParams.get("filter") || "all") as PostFilter;

    const dateFilter = getDateFilter(filter);

    // Count query
    let countQuery = supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.userId);

    if (dateFilter) {
      countQuery = countQuery.gte("created_at", dateFilter);
    }

    const { count } = await countQuery;
    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // Data query
    let dataQuery = supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.userId);

    if (dateFilter) {
      dataQuery = dataQuery.gte("created_at", dateFilter);
    }

    const { data: posts, error } = await dataQuery
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (error) {
      console.error("My posts fetch error:", error);
      return NextResponse.json(
        { error: "Không thể tải bài đăng" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      posts: posts || [],
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
