import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { notifyDriversOfNewPost } from "@/lib/notifications";
import { fetchPosts } from "@/lib/posts";
import type { PostFilter } from "@/types";

const MIN_CONTENT_LENGTH = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const filter = (searchParams.get("filter") || "all") as PostFilter;
    const type = searchParams.get("type") || ""; // "driver" or "passenger"

    const user = await getCurrentUser();

    const result = await fetchPosts({ page, filter, type, user });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Posts fetch error:", error);
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
      await notifyDriversOfNewPost(postData.content).catch(console.error);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
