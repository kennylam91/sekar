import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("driver_facebook_ids")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch driver_facebook_ids:", error);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { facebook_id, name, note } = body;

    if (!facebook_id?.trim()) {
      return NextResponse.json(
        { error: "Facebook ID không được để trống" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("driver_facebook_ids")
      .insert({
        facebook_id: facebook_id.trim(),
        name: name?.trim() || null,
        note: note?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Facebook ID này đã được đăng ký" },
          { status: 409 },
        );
      }
      console.error("Failed to create driver_facebook_id:", error);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
