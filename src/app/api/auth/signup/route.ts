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

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: "Tên đăng nhập phải từ 3 đến 50 ký tự" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải ít nhất 6 ký tự" },
        { status: 400 },
      );
    }

    // Check if username already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Tên đăng nhập đã tồn tại" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username: username.toLowerCase().trim(),
        password_hash: passwordHash,
        display_name: username.trim(),
        role: "driver",
      })
      .select("id, username, display_name, role")
      .single();

    if (error) {
      console.error("Signup error:", error);
      return NextResponse.json(
        { error: "Không thể tạo tài khoản" },
        { status: 500 },
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
