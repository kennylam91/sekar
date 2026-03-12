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
    const { name, note } = body;

    const { data, error } = await supabase
      .from("driver_facebook_ids")
      .update({
        name: name?.trim() || null,
        note: note?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update driver_facebook_id:", error);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Không tìm thấy mục" },
        { status: 404 },
      );
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
      .from("driver_facebook_ids")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete driver_facebook_id:", error);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
