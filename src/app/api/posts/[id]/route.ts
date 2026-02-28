import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

const MIN_CONTENT_LENGTH = 20;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
    }

    // Fetch the post
    const { data: post } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (!post) {
      return NextResponse.json(
        { error: "Bài đăng không tồn tại" },
        { status: 404 },
      );
    }

    // Check authorization: owner or admin
    if (post.user_id !== user.userId && user.role !== "admin") {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa bài đăng này" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { content, phone, facebook_url, zalo_url, author_type } = body;

    if (!content || content.trim().length < MIN_CONTENT_LENGTH) {
      return NextResponse.json(
        {
          error: `Nội dung bài đăng phải có ít nhất ${MIN_CONTENT_LENGTH} ký tự`,
        },
        { status: 400 },
      );
    }

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

    const updatePayload: Record<string, unknown> = {
      content: content.trim(),
      phone: hasPhone ? phone.trim() : null,
      facebook_url: hasFacebook ? facebook_url.trim() : null,
      zalo_url: hasZalo ? zalo_url.trim() : null,
      updated_at: new Date().toISOString(),
    };

    if (
      user.role === "admin" &&
      (author_type === "driver" || author_type === "passenger")
    ) {
      updatePayload.author_type = author_type;
    }

    const { data: updated, error } = await supabase
      .from("posts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Post update error:", error);
      return NextResponse.json(
        { error: "Không thể cập nhật bài đăng" },
        { status: 500 },
      );
    }

    return NextResponse.json({ post: updated });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
    }

    const { data: post } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (!post) {
      return NextResponse.json(
        { error: "Bài đăng không tồn tại" },
        { status: 404 },
      );
    }

    if (post.user_id !== user.userId && user.role !== "admin") {
      return NextResponse.json(
        { error: "Bạn không có quyền xoá bài đăng này" },
        { status: 403 },
      );
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      console.error("Post delete error:", error);
      return NextResponse.json(
        { error: "Không thể xoá bài đăng" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
