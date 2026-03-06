import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const apiKey = process.env.NEXT_RAPID_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key chưa được cấu hình" },
        { status: 400 },
      );
    }

    const groupsEnv = process.env.NEXT_CRON_FACEBOOK_GROUPS || "";
    const groupIds = groupsEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (groupIds.length === 0) {
      return NextResponse.json(
        { error: "Chưa cấu hình nhóm Facebook" },
        { status: 400 },
      );
    }

    const results = [];
    for (const groupId of groupIds) {
      try {
        const res = await fetch(
          `https://facebook-scraper3.p.rapidapi.com/group/info?group_id=${groupId}`,
          {
            headers: {
              "x-rapidapi-host": "facebook-scraper3.p.rapidapi.com",
              "x-rapidapi-key": apiKey,
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          const groupInfo = {
            group_id: groupId,
            name: data.name || data.group_name || null,
            member_count:
              data.member_count ||
              data.members_count ||
              data.members ||
              null,
            last_updated_at: new Date().toISOString(),
          };

          await supabase
            .from("facebook_groups")
            .upsert(groupInfo, { onConflict: "group_id" });

          results.push({ status: "success", ...groupInfo });
        } else {
          results.push({
            group_id: groupId,
            status: "failed",
            error: `API trả về ${res.status}`,
          });
        }
      } catch (err) {
        results.push({
          group_id: groupId,
          status: "error",
          error: String(err),
        });
      }
    }

    return NextResponse.json({ data: results });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
