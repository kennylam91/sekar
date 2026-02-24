import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới có quyền thực hiện" },
        { status: 403 },
      );
    }

    const { is_visible } = await request.json();

    if (typeof is_visible !== "boolean") {
      return NextResponse.json(
        { error: "Giá trị is_visible không hợp lệ" },
        { status: 400 },
      );
    }

    const { data: post, error } = await supabase
      .from("posts")
      .update({
        is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Visibility update error:", error);
      return NextResponse.json(
        { error: "Không thể cập nhật trạng thái" },
        { status: 500 },
      );
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
