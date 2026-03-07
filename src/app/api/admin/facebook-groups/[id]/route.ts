import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { facebook_id, name, posts_in_last_month, total_members, note } =
      body;

    if (!facebook_id?.trim()) {
      return NextResponse.json(
        { error: "Facebook ID không được để trống" },
        { status: 400 },
      );
    }
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Tên nhóm không được để trống" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("facebook_groups")
      .update({
        facebook_id: facebook_id.trim(),
        name: name.trim(),
        posts_in_last_month: posts_in_last_month ?? 0,
        total_members: total_members ?? 0,
        note: note?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Facebook ID đã tồn tại" },
          { status: 409 },
        );
      }
      console.error("Failed to update facebook_group:", error);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Không tìm thấy nhóm" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { is_enabled } = body;

    if (typeof is_enabled !== "boolean") {
      return NextResponse.json(
        { error: "Giá trị is_enabled không hợp lệ" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("facebook_groups")
      .update({ is_enabled, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to toggle facebook_group:", error);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from("facebook_groups")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete facebook_group:", error);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
