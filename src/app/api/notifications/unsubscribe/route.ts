import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "driver") {
      return NextResponse.json(
        { error: "Chỉ tài xế mới có thể thay đổi cài đặt thông báo" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("fcm_tokens")
      .delete()
      .eq("user_id", user.userId);

    if (error) {
      console.error("FCM token delete error:", error);
      return NextResponse.json(
        { error: "Không thể hủy đăng ký thông báo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
