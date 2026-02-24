import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên đăng nhập và mật khẩu" },
        { status: 400 },
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, password_hash, display_name, role")
      .eq("username", username.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 },
      );
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 },
      );
    }

    await setAuthCookie({
      userId: user.id,
      username: user.username,
      role: user.role,
      displayName: user.display_name,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
