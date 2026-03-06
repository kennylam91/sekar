import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const apiKeyConfigured = !!process.env.NEXT_RAPID_API_KEY;
    const groupsEnv = process.env.NEXT_CRON_FACEBOOK_GROUPS || "";
    const groupIds = groupsEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Get latest rate limits from cron_job_logs
    const { data: latestLog } = await supabase
      .from("cron_job_logs")
      .select("api_source, requests_limit, requests_remaining, run_at")
      .not("requests_limit", "is", null)
      .order("run_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get per-group stats from cron_job_logs
    const now = new Date();
    const oneDayAgo = new Date(
      now.getTime() - 24 * 60 * 60 * 1000,
    ).toISOString();
    const oneMonthAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const groupsWithStats = await Promise.all(
      groupIds.map(async (groupId) => {
        const [
          { data: last24HoursStats },
          { data: last30DaysStats },
          { data: groupInfo },
        ] =
          await Promise.all([
            supabase
              .from("cron_job_logs")
              .select("total_created")
              .eq("group_id", groupId)
              .gte("run_at", oneDayAgo),
            supabase
              .from("cron_job_logs")
              .select("total_created")
              .eq("group_id", groupId)
              .gte("run_at", oneMonthAgo),
            supabase
              .from("facebook_groups")
              .select("name, member_count, last_updated_at")
              .eq("group_id", groupId)
              .maybeSingle(),
          ]);

        const postsInLastDay = (last24HoursStats || []).reduce(
          (sum, log) => sum + (log.total_created || 0),
          0,
        );
        const postsInLastMonth = (last30DaysStats || []).reduce(
          (sum, log) => sum + (log.total_created || 0),
          0,
        );

        return {
          group_id: groupId,
          name: groupInfo?.name || null,
          member_count: groupInfo?.member_count || null,
          last_updated_at: groupInfo?.last_updated_at || null,
          posts_in_last_day: postsInLastDay,
          posts_in_last_month: postsInLastMonth,
        };
      }),
    );

    return NextResponse.json({
      data: {
        api: {
          key_configured: apiKeyConfigured,
          requests_limit: latestLog?.requests_limit || null,
          requests_remaining: latestLog?.requests_remaining || null,
          last_checked_at: latestLog?.run_at || null,
          api_source: latestLog?.api_source || null,
        },
        groups: groupsWithStats,
      },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
