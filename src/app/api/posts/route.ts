import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { notifyDriversOfNewPost } from "@/lib/notifications";
import { getDateFilter } from "@/lib/posts";
import type { PostFilter } from "@/types";

const PAGE_SIZE = 10;
const MIN_CONTENT_LENGTH = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const filter = (searchParams.get("filter") || "all") as PostFilter;
    const type = searchParams.get("type") || ""; // "driver" or "passenger"

    const user = await getCurrentUser();

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, phone, facebook_url, zalo_url, author_name } = body;

    // Validate content
    if (!content || content.trim().length < MIN_CONTENT_LENGTH) {
      return NextResponse.json(
        {
          error: `Nội dung bài đăng phải có ít nhất ${MIN_CONTENT_LENGTH} ký tự`,
        },
        { status: 400 },
      );
    }

    // Validate at least one contact info
    const hasPhone = phone && phone.trim().length > 0;
    const hasFacebook = facebook_url && facebook_url.trim().length > 0;
    const hasZalo = zalo_url && zalo_url.trim().length > 0;

    if (!hasPhone && !hasFacebook && !hasZalo) {
      return NextResponse.json(
        {
          error:
            "Vui lòng cung cấp ít nhất một thông tin liên hệ (SĐT, Facebook hoặc Zalo)",
        },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();

    let postData;
    if (user && user.role === "driver") {
      // Driver post
      postData = {
        author_type: "driver" as const,
        author_name: user.displayName || user.username,
        user_id: user.userId,
        content: content.trim(),
        phone: hasPhone ? phone.trim() : null,
        facebook_url: hasFacebook ? facebook_url.trim() : null,
        zalo_url: hasZalo ? zalo_url.trim() : null,
      };
    } else {
      // Passenger post
      if (!author_name || author_name.trim().length < 2) {
        return NextResponse.json(
          { error: "Vui lòng nhập tên hiển thị (ít nhất 2 ký tự)" },
          { status: 400 },
        );
      }

      postData = {
        author_type: "passenger" as const,
        author_name: author_name.trim(),
        user_id: null,
        content: content.trim(),
        phone: hasPhone ? phone.trim() : null,
        facebook_url: hasFacebook ? facebook_url.trim() : null,
        zalo_url: hasZalo ? zalo_url.trim() : null,
      };
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error("Post creation error:", error);
      return NextResponse.json(
        { error: "Không thể tạo bài đăng" },
        { status: 500 },
      );
    }

    // Notify drivers if this is a passenger post
    if (postData.author_type === "passenger") {
      // Fire and forget — don't block the response
      notifyDriversOfNewPost(postData.content).catch(console.error);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
