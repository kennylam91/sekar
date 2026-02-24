import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const payload = await getCurrentUser();
  if (!payload) {
    return NextResponse.json({ user: null });
  }

  // Fetch fresh user data from DB
  const { data: user } = await supabase
    .from("users")
    .select("id, username, display_name, role")
    .eq("id", payload.userId)
    .single();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}
