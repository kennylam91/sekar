import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, setAuthCookie } from "@/lib/auth";
import { normalizeRoutesArray } from "@/lib/routes";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
    }

    const { display_name, preferred_routes } = await request.json();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof display_name === "string") {
      if (display_name.trim().length < 2) {
        return NextResponse.json(
          { error: "Tên hiển thị phải có ít nhất 2 ký tự" },
          { status: 400 },
        );
      }
      updates.display_name = display_name.trim();
    }

    if (preferred_routes !== undefined) {
      updates.preferred_routes = normalizeRoutesArray(preferred_routes);
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json(
        { error: "Không có dữ liệu để cập nhật" },
        { status: 400 },
      );
    }

    const { data: updated, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.userId)
      .select("id, username, display_name, role, preferred_routes")
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
