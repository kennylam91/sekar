import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, setAuthCookie } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
    }

    const { display_name } = await request.json();

    if (!display_name || display_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Tên hiển thị phải có ít nhất 2 ký tự" },
        { status: 400 },
      );
    }

    const { data: updated, error } = await supabase
      .from("users")
      .update({
        display_name: display_name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.userId)
      .select("id, username, display_name, role")
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Không thể cập nhật hồ sơ" },
        { status: 500 },
      );
    }

    // Update JWT cookie with new display name
    await setAuthCookie({
      userId: updated.id,
      username: updated.username,
      role: updated.role,
      displayName: updated.display_name,
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
