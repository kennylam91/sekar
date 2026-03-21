import { NextResponse } from "next/server";
import { detectPostType } from "@/lib/post-type-detector";
import { Post } from "@/types";
import { supabase } from "@/lib/supabase";
import { notifyDriversOfNewPost } from "@/lib/notifications";
import {
  FromApi,
  fetchFbPosts,
  extractPosts,
  extractCursor,
  extractFacebookId,
  extractPostTimestamp,
  buildPostEntity,
} from "@/lib/facebook-scraper";

const MAX_FETCH_PAGES = process.env.MAX_FETCH_PAGES || 3;

type GroupEntry = { facebook_id: string };

type GroupResult = {
  group: string;
  status: "success" | "failed" | "error";
  pages?: number;
  fetched?: number;
  created?: number;
  skipped?: number;
  failed?: number;
  passengerPosts?: number;
  duration?: number;
  error?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromApi = searchParams.get("from"); // facebook-scraper3 | facebook-scraper-api4
  if (!fromApi) {
    return NextResponse.json(
      { error: "'from' query parameter is required" },
      { status: 400 },
    );
  }

  const startTime = Date.now();
  console.log("=== Start cron job to fetch Facebook group posts ===");

  if (!process.env.NEXT_RAPID_API_KEY) {
    console.error("❌ NEXT_RAPID_API_KEY environment variable is not set");
    return NextResponse.json(
      { error: "RAPIDAPI_KEY environment variable is not set" },
      { status: 500 },
    );
  }
  console.log("✓ API key found");

  const anonymousUserId = process.env.NEXT_ANONYMOUS_USER_ID;
  const groups = await loadEnabledGroups();
  if (groups.length === 0) {
    return NextResponse.json(
      { error: "No Facebook groups found in database" },
      { status: 400 },
    );
  }
  console.log(`📋 Processing ${groups.length} Facebook groups`);

  let totalFetched = 0;
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let totalPassengerPosts = 0;
  const groupResults: GroupResult[] = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    console.log(
      `\n--- Processing group ${i + 1}/${groups.length}: ${group.facebook_id} ---`,
    );
    const result = await processGroup(fromApi as FromApi, group, anonymousUserId);
    groupResults.push(result);

    if (result.status === "success") {
      totalFetched += result.fetched ?? 0;
      totalCreated += result.created ?? 0;
      totalSkipped += result.skipped ?? 0;
      totalFailed += result.failed ?? 0;
      totalPassengerPosts += result.passengerPosts ?? 0;
    }
  }

  const totalDuration = Date.now() - startTime;
  reportCronJobResults(
    totalDuration,
    groups,
    totalFetched,
    totalCreated,
    totalSkipped,
    totalFailed,
    groupResults,
  );

  if (totalPassengerPosts > 0) {
    console.log(
      `🚀 Notifying drivers about ${totalPassengerPosts} new passenger posts...`,
    );
    await notifyDriversOfNewPost(
      `Có ${totalPassengerPosts} khách mới tìm xe trên Sekar! 🚗💨`,
    );
  }

  return NextResponse.json({
    success: true,
    stats: {
      groups_processed: groups.length,
      total_fetched: totalFetched,
      total_created: totalCreated,
      total_skipped: totalSkipped,
      total_failed: totalFailed,
      duration_ms: totalDuration,
    },
    groups: groupResults,
  });
}

async function loadEnabledGroups(): Promise<GroupEntry[]> {
  const { data, error } = await supabase
    .from("facebook_groups")
    .select("facebook_id")
    .eq("is_enabled", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Failed to load facebook_groups from DB:", error);
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ No Facebook groups found in database.");
    return [];
  }

  console.log(`📋 Loaded ${data.length} Facebook groups from database`);
  return data.map((g: { facebook_id: string }) => ({
    facebook_id: g.facebook_id,
  }));
}

async function processGroup(
  fromApi: FromApi,
  group: GroupEntry,
  anonymousUserId: string | undefined,
): Promise<GroupResult> {
  const groupStartTime = Date.now();
  let created = 0;
  let skipped = 0;
  let failed = 0;
  let fetched = 0;
  let passengerPosts = 0;
  const createdAuthorNames = new Set<string>();
  let cursor: string | undefined = undefined;
  let pageIndex = 0;
  let reachedKnownPost = false;

  try {
    while (pageIndex < Number(MAX_FETCH_PAGES)) {
      pageIndex++;
      console.log(
        `  📄 Page ${pageIndex} for group ${group.facebook_id}${cursor ? " (with cursor)" : ""}`,
      );

      const res = await fetchFbPosts(fromApi, group.facebook_id, cursor);
      if (!res.ok) {
        const body = (await res.text()).substring(0, 500);
        console.error(
          `❌ API request failed for group ${group.facebook_id}:`,
          { status: res.status, statusText: res.statusText, body },
        );
        return {
          group: group.facebook_id,
          status: "failed",
          error: `API returned ${res.status}`,
        };
      }

      const resData = await res.json();
      const fbPosts = extractPosts(fromApi, resData);
      const postsCount = Array.isArray(fbPosts) ? fbPosts.length : 0;
      console.log(`  📬 Received ${postsCount} posts on page ${pageIndex}`);
      fetched += postsCount;

      if (postsCount === 0) {
        console.log(`  ℹ️ No posts on page ${pageIndex}, stopping`);
        break;
      }

      // Batch-check which facebook_ids on this page already exist in DB
      const pageIds = fbPosts
        .map((p: any) => extractFacebookId(fromApi, p))
        .filter(Boolean) as string[];

      const existingIdSet = new Set<string>();
      if (pageIds.length > 0) {
        const { data: existingRows } = await supabase
          .from("posts")
          .select("facebook_id")
          .in("facebook_id", pageIds);
        for (const row of existingRows ?? []) {
          if (row.facebook_id) existingIdSet.add(row.facebook_id);
        }
      }

      for (let j = 0; j < fbPosts.length; j++) {
        const fbPost = fbPosts[j];
        const fbId = extractFacebookId(fromApi, fbPost);

        // Stop as soon as we hit a post we've already stored
        if (fbId && existingIdSet.has(fbId)) {
          console.log(
            `  ⏹ Post ${j + 1}/${postsCount}: Known facebook_id "${fbId}" — stopping pagination`,
          );
          reachedKnownPost = true;
          break;
        }

        const newPost = buildPostEntity(
          fromApi,
          fbPost,
          anonymousUserId,
          group.facebook_id,
        );

        if (!newPost.content || newPost.content.trim().length < 20) {
          skipped++;
          console.log(
            `  ⊘ Post ${j + 1}/${postsCount}: Skipped (no message or too short)`,
          );
          continue;
        }

        if (newPost.author_name && createdAuthorNames.has(newPost.author_name)) {
          skipped++;
          console.log(
            `  ⊘ Post ${j + 1}/${postsCount}: Skipped (duplicate author name)`,
          );
          continue;
        }

        if (
          newPost.author_name &&
          newPost.phone &&
          (await isAuthorPostedRecently(newPost))
        ) {
          skipped++;
          console.log(
            `  ⊘ Post ${j + 1}/${postsCount}: Skipped (duplicated within 4 hours)`,
          );
          continue;
        }

        const detected = await detectPostType(newPost.content);
        newPost.author_type = detected.type;
        newPost.used_llm = detected.usedLLM;
        if (detected.type === "other") {
          newPost.is_visible = false;
          console.log(
            `  ⊘ Post ${j + 1}/${postsCount}: Marked as not visible (not relevant to ride-sharing)`,
          );
        }

        try {
          const { error: insertError } = await supabase
            .from("posts")
            .insert(newPost);

          if (insertError) {
            if (
              insertError.code === "23505" ||
              insertError.message?.includes("idx_posts_facebook_id")
            ) {
              skipped++;
              console.log(
                `  ⊘ Post ${j + 1}/${postsCount}: Skipped (duplicate facebook_id)`,
              );
            } else {
              failed++;
              console.error(`  ❌ Failed to insert post ${j + 1}/${postsCount}:`, {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
              });
            }
          } else {
            created++;
            console.log(`  ✓ Post ${j + 1}/${postsCount}: Created successfully`);
            if (newPost.author_type === "passenger") passengerPosts++;
            if (newPost.author_name) createdAuthorNames.add(newPost.author_name);
          }
        } catch (err) {
          failed++;
          console.error(
            `  ❌ Unexpected error inserting post ${j + 1}/${postsCount}:`,
            err,
          );
        }
      }

      if (reachedKnownPost) break;

      // Only fetch the next page if the last post on this page was published within the last 15 minutes
      const lastFbPost = fbPosts[fbPosts.length - 1];
      const lastPostTimestamp = extractPostTimestamp(fromApi, lastFbPost);
      const POST_MINS_THRESHOLD = 15;
      const fifteenMinutesAgo = Date.now() - POST_MINS_THRESHOLD * 60 * 1000;
      if (lastPostTimestamp !== null && lastPostTimestamp < fifteenMinutesAgo) {
        console.log(
          `  ℹ️ Last post on page ${pageIndex} was published more than ${POST_MINS_THRESHOLD} minutes ago — stopping pagination`,
        );
        break;
      }

      const nextCursor = extractCursor(fromApi, resData);
      if (!nextCursor) {
        console.log(`  ℹ️ No next cursor, stopping pagination`);
        break;
      }
      cursor = nextCursor;
    }

    if (pageIndex >= Number(MAX_FETCH_PAGES)) {
      console.log(
        `  ⚠️ Reached max page limit (${MAX_FETCH_PAGES}) for group ${group.facebook_id}`,
      );
    }

    const duration = Date.now() - groupStartTime;
    console.log(
      `✓ Group ${group.facebook_id} completed in ${duration}ms (${pageIndex} page(s)):`,
      { fetched, created, skipped, failed },
    );

    return {
      group: group.facebook_id,
      status: "success",
      pages: pageIndex,
      fetched,
      created,
      skipped,
      failed,
      passengerPosts,
      duration,
    };
  } catch (err) {
    console.error(
      `❌ Unexpected error processing group ${group.facebook_id}:`,
      err,
    );
    return { group: group.facebook_id, status: "error", error: String(err) };
  }
}

async function isAuthorPostedRecently(post: Partial<Post>): Promise<boolean> {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("posts")
    .select("id")
    .eq("author_name", post.author_name)
    .eq("phone", post.phone)
    .gte("created_at", fourHoursAgo)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

function reportCronJobResults(
  totalDuration: number,
  groups: GroupEntry[],
  totalFetched: number,
  totalCreated: number,
  totalSkipped: number,
  totalFailed: number,
  groupResults: GroupResult[],
) {
  console.log("\n=== Cron job completed ===");
  console.log(`⏱️  Total duration: ${totalDuration}ms`);
  console.log(`📊 Summary:`, {
    groups_processed: groups.length,
    total_fetched: totalFetched,
    total_created: totalCreated,
    total_skipped: totalSkipped,
    total_failed: totalFailed,
  });
  console.log(`📋 Per-group results:`, groupResults);
}