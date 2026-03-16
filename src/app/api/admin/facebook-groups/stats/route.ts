import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { GroupStats } from "@/types";

/** Format a Date as "YYYY-MM-DD" in Vietnam timezone. */
function vnDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

/** Paginate through all matching posts (PostgREST default cap is 1000 rows). */
async function fetchAllGroupPosts<T>(
  columns: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFilters: (q: any) => any,
): Promise<{ data: T[] | null; error: unknown }> {
  const PAGE = 1000;
  const rows: T[] = [];
  let from = 0;

  for (; ;) {
    const { data, error } = await applyFilters(
      supabase
        .from("posts")
        .select(columns)
        .not("group_id", "is", null)
        .range(from, from + PAGE - 1),
    );
    if (error) return { data: null, error };
    if (!data || data.length === 0) break;
    rows.push(...(data as T[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }

  return { data: rows, error: null };
}

function makeSummary(total: number, passenger: number) {
  return {
    total,
    passenger,
    passenger_pct: total === 0 ? 0 : Math.round((passenger / total) * 100),
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const now = new Date();
    const todayStr = vnDate(now); // e.g. "2026-03-16"
    const [yearStr, monthStr] = todayStr.split("-");
    const monthPrefix = `${yearStr}-${monthStr}`;

    // Build 14-day date labels in VN time (oldest → newest)
    const dateLabels: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dateLabels.push(vnDate(d));
    }

    // The earliest date we need for "this month" aggregation
    const monthStart = `${yearStr}-${monthStr}-01`;
    // earliest14Days is dateLabels[0]; pick whichever is earlier
    const fromDate =
      monthStart < dateLabels[0] ? monthStart : dateLabels[0];

    // --- Query 1: posts from `fromDate` (for today + month + daily) ---
    const { data: recentPosts, error: recentError } = await fetchAllGroupPosts<{
      group_id: string;
      author_type: string;
      created_at: string;
    }>("group_id, author_type, created_at", (q) =>
      q.gte("created_at", `${fromDate}T00:00:00+07:00`),
    );

    if (recentError) {
      console.error("Failed to fetch recent posts for stats:", recentError);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    // --- Query 2: all-time posts (group_id + author_type only) ---
    const { data: alltimePosts, error: alltimeError } =
      await fetchAllGroupPosts<{
        group_id: string;
        author_type: string;
      }>(
        "group_id, author_type",
        (q) => q, // no additional filters
      );

    if (alltimeError) {
      console.error("Failed to fetch all-time posts for stats:", alltimeError);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    // --- Query 3: all facebook groups (for official order + names) ---
    const { data: groups, error: groupsError } = await supabase
      .from("facebook_groups")
      .select("facebook_id, name")
      .order("created_at", { ascending: true });

    if (groupsError) {
      console.error("Failed to fetch facebook_groups:", groupsError);
      return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }

    // --- Aggregation ---
    type Counts = { total: number; passenger: number };
    type Agg = { today: Counts; month: Counts; daily: Record<string, Counts> };

    const groupMap: Record<string, Agg> = {};

    const ensureGroup = (gid: string) => {
      if (!groupMap[gid]) {
        groupMap[gid] = {
          today: { total: 0, passenger: 0 },
          month: { total: 0, passenger: 0 },
          daily: Object.fromEntries(
            dateLabels.map((d) => [d, { total: 0, passenger: 0 }]),
          ),
        };
      }
    };

    // Pre-seed all known groups so they appear even with zero posts
    for (const g of groups ?? []) ensureGroup(g.facebook_id);

    for (const post of recentPosts ?? []) {
      const gid = post.group_id;
      ensureGroup(gid);
      const agg = groupMap[gid];
      const isP = post.author_type === "passenger";
      const dateStr = vnDate(new Date(post.created_at));

      if (dateStr === todayStr) {
        agg.today.total++;
        if (isP) agg.today.passenger++;
      }
      if (dateStr.startsWith(monthPrefix)) {
        agg.month.total++;
        if (isP) agg.month.passenger++;
      }
      if (agg.daily[dateStr]) {
        agg.daily[dateStr].total++;
        if (isP) agg.daily[dateStr].passenger++;
      }
    }

    const alltimeMap: Record<string, Counts> = {};
    for (const g of groups ?? []) alltimeMap[g.facebook_id] = { total: 0, passenger: 0 };

    for (const post of alltimePosts ?? []) {
      const gid = post.group_id;
      if (!alltimeMap[gid]) alltimeMap[gid] = { total: 0, passenger: 0 };
      alltimeMap[gid].total++;
      if (post.author_type === "passenger") alltimeMap[gid].passenger++;
    }

    // Build name map and preserve insertion order from facebook_groups
    const nameMap: Record<string, string> = {};
    const orderMap: Record<string, number> = {};
    (groups ?? []).forEach((g, i) => {
      nameMap[g.facebook_id] = g.name;
      orderMap[g.facebook_id] = i;
    });

    const allGroupIds = new Set<string>([
      ...(groups ?? []).map((g) => g.facebook_id),
      ...Object.keys(groupMap),
      ...Object.keys(alltimeMap),
    ]);

    const data: GroupStats[] = [...allGroupIds].map((gid) => {
      const agg = groupMap[gid] ?? {
        today: { total: 0, passenger: 0 },
        month: { total: 0, passenger: 0 },
        daily: Object.fromEntries(
          dateLabels.map((d) => [d, { total: 0, passenger: 0 }]),
        ),
      };
      const at = alltimeMap[gid] ?? { total: 0, passenger: 0 };
      return {
        group_id: gid,
        name: nameMap[gid] ?? gid,
        today: makeSummary(agg.today.total, agg.today.passenger),
        month: makeSummary(agg.month.total, agg.month.passenger),
        alltime: makeSummary(at.total, at.passenger),
        daily: dateLabels.map((d) => ({
          date: d,
          ...(agg.daily[d] ?? { total: 0, passenger: 0 }),
        })),
      };
    });

    data.sort(
      (a, b) =>
        (orderMap[a.group_id] ?? 999) - (orderMap[b.group_id] ?? 999),
    );

    return NextResponse.json({ data, dateLabels });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
