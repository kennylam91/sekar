import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "driver") {
      return NextResponse.json(
        { error: "Chỉ tài xế mới có thể đăng ký nhận thông báo" },
        { status: 403 }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: 400 }
      );
    }

    // Upsert the token (ignore conflict on unique token)
    const { error } = await supabase
      .from("fcm_tokens")
      .upsert(
        { user_id: user.userId, token },
        { onConflict: "token" }
      );

    if (error) {
      console.error("FCM token save error:", error);
      return NextResponse.json(
        { error: "Không thể lưu token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
