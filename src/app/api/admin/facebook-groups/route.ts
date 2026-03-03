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
      .from("facebook_groups")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch facebook_groups:", error);
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
      .insert({
        facebook_id: facebook_id.trim(),
        name: name.trim(),
        posts_in_last_month: posts_in_last_month ?? 0,
        total_members: total_members ?? 0,
        note: note?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Facebook ID đã tồn tại" },
          { status: 409 },
        );
      }
      console.error("Failed to insert facebook_group:", error);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
