import { normalizeFacebookUrl } from "@/lib/url-utils";
import { NextResponse } from "next/server";
import { detectPostType } from "@/lib/post-type-detector";
import { Post } from "@/types";
import { supabase } from "@/lib/supabase";
import { notifyDriversOfNewPost } from "@/lib/notifications";
import { extractPhone } from "@/lib/posts";

type FromApi = "facebook-scraper3" | "facebook-scraper-api4";

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

  const apiKey = process.env.NEXT_RAPID_API_KEY;
  if (!apiKey) {
    console.error("❌ NEXT_RAPID_API_KEY environment variable is not set");
    return NextResponse.json(
      { error: "RAPIDAPI_KEY environment variable is not set" },
      { status: 500 },
    );
  }
  console.log("✓ API key found");

  const anonymousUserId = process.env.NEXT_ANONYMOUS_USER_ID;

  // Example: "142026696530246,425656831260435,1825313404533366,280799584362930"
  const groupsEnv = process.env.NEXT_CRON_FACEBOOK_GROUPS || "";
  const groups: string[] = groupsEnv.split(",").map((s) => s.trim());

  if (!groups || groups.length === 0) {
    console.warn("⚠️ No Facebook groups specified ");
    return NextResponse.json({ error: "no facebook groups" }, { status: 500 });
  }

  console.log(`📋 Processing ${groups.length} Facebook groups`);

  let totalCreatedPosts = 0;
  let totalFetchedPosts = 0;
  let totalSkippedPosts = 0;
  let totalFailedInserts = 0;
  let totalPassengerPosts = 0;
  const groupResults: any[] = [];
  let lastRequestsLimit: number | null = null;
  let lastRequestsRemaining: number | null = null;

  // Use for...of instead of forEach to properly await async operations
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const groupStartTime = Date.now();
    console.log(
      `\n--- Processing group ${i + 1}/${groups.length}: ${group} ---`,
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5 second delay between groups to avoid rate limits
      const res = await fetchFbPosts(fromApi as FromApi, group);

      // Capture rate limit headers
      const requestsLimit =
        parseInt(res.headers.get("x-ratelimit-requests-limit") || "") || null;
      const requestsRemaining =
        parseInt(res.headers.get("x-ratelimit-requests-remaining") || "") ||
        null;
      if (requestsLimit !== null) lastRequestsLimit = requestsLimit;
      if (requestsRemaining !== null) lastRequestsRemaining = requestsRemaining;

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ API request failed for group ${group}:`, {
          status: res.status,
          statusText: res.statusText,
          body: text.substring(0, 500), // Limit log size
        });
        groupResults.push({
          group,
          status: "failed",
          error: `API returned ${res.status}`,
        });
        await supabase.from("cron_job_logs").insert({
          api_source: fromApi,
          group_id: group,
          status: "failed",
          total_fetched: 0,
          total_created: 0,
          total_skipped: 0,
          total_passenger_posts: 0,
          requests_limit: requestsLimit,
          requests_remaining: requestsRemaining,
        });
        continue;
      }

      const resData = await res.json();

      const fbPosts = extractPosts(fromApi as FromApi, resData);
      const postsCount = Array.isArray(fbPosts) ? fbPosts.length : 0;
      console.log(`📬 Received ${postsCount} posts from group ${group}`);
      totalFetchedPosts += postsCount;

      if (postsCount === 0) {
        console.log(`ℹ️ No posts to process for group ${group}`);
        groupResults.push({
          group,
          status: "success",
          fetched: 0,
          created: 0,
          skipped: 0,
          failed: 0,
        });
        await supabase.from("cron_job_logs").insert({
          api_source: fromApi,
          group_id: group,
          status: "success",
          total_fetched: 0,
          total_created: 0,
          total_skipped: 0,
          total_passenger_posts: 0,
          duration_ms: Date.now() - groupStartTime,
          requests_limit: requestsLimit,
          requests_remaining: requestsRemaining,
        });
        continue;
      }

      let groupCreated = 0;
      let groupSkipped = 0;
      let groupFailed = 0;
      let groupPassengerPosts = 0;
      let createdAuthorNames = new Set<string>();

      for (let j = 0; j < fbPosts.length; j++) {
        const fbPost = fbPosts[j];

        const newPost = buildPostEntity(
          fromApi as FromApi,
          fbPost,
          anonymousUserId!,
        );

        // Skip posts without message
        if (!newPost.content) {
          groupSkipped++;
          console.log(`  ⊘ Post ${j + 1}/${postsCount}: Skipped (no message)`);
          continue;
        }

        if (createdAuthorNames.has(newPost.author_name || "")) {
          groupSkipped++;
          console.log(
            `  ⊘ Post ${j + 1}/${postsCount}: Skipped (duplicate author name)`,
          );
          continue;
        }

        try {
          const { error: insertError } = await supabase
            .from("posts")
            .insert(newPost);

          if (insertError) {
            // Check for unique violation (duplicate facebook_id)
            if (
              insertError.code === "23505" ||
              (insertError.message &&
                insertError.message.includes("idx_posts_facebook_id"))
            ) {
              groupSkipped++;
              console.log(
                `  ⊘ Post ${j + 1}/${postsCount}: Skipped (duplicate facebook_id)`,
              );
            } else {
              groupFailed++;
              console.error(
                `  ❌ Failed to insert post ${j + 1}/${postsCount}:`,
                {
                  code: insertError.code,
                  message: insertError.message,
                  details: insertError.details,
                  hint: insertError.hint,
                },
              );
            }
          } else {
            groupCreated++;
            console.log(
              `  ✓ Post ${j + 1}/${postsCount}: Created successfully`,
            );
            if (newPost.author_type === "passenger") {
              groupPassengerPosts++;
              totalPassengerPosts++;
            }
            if (newPost.author_name) {
              createdAuthorNames.add(newPost.author_name);
            }
          }
        } catch (err: any) {
          groupFailed++;
          console.error(
            `  ❌ Unexpected error inserting post ${j + 1}/${postsCount}:`,
            err,
          );
        }
      }

      totalCreatedPosts += groupCreated;
      totalSkippedPosts += groupSkipped;
      totalFailedInserts += groupFailed;

      const groupDuration = Date.now() - groupStartTime;
      console.log(`✓ Group ${group} completed in ${groupDuration}ms:`, {
        fetched: postsCount,
        created: groupCreated,
        skipped: groupSkipped,
        failed: groupFailed,
      });

      groupResults.push({
        group,
        status: "success",
        fetched: postsCount,
        created: groupCreated,
        skipped: groupSkipped,
        failed: groupFailed,
        duration: groupDuration,
      });

      await supabase.from("cron_job_logs").insert({
        api_source: fromApi,
        group_id: group,
        status: "success",
        total_fetched: postsCount,
        total_created: groupCreated,
        total_skipped: groupSkipped,
        total_passenger_posts: groupPassengerPosts,
        duration_ms: groupDuration,
        requests_limit: requestsLimit,
        requests_remaining: requestsRemaining,
      });
    } catch (err) {
      console.error(`❌ Unexpected error processing group ${group}:`, err);
      groupResults.push({ group, status: "error", error: String(err) });
      await supabase.from("cron_job_logs").insert({
        api_source: fromApi,
        group_id: group,
        status: "error",
        total_fetched: 0,
        total_created: 0,
        total_skipped: 0,
        total_passenger_posts: 0,
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  reportCronJobResults(
    totalDuration,
    groups,
    totalFetchedPosts,
    totalCreatedPosts,
    totalSkippedPosts,
    totalFailedInserts,
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
      total_fetched: totalFetchedPosts,
      total_created: totalCreatedPosts,
      total_skipped: totalSkippedPosts,
      total_failed: totalFailedInserts,
      duration_ms: totalDuration,
    },
    groups: groupResults,
  });
}
function fetchFbPosts(fromApi: FromApi, groupId: string) {
  let url = "";
  let host = "";

  switch (fromApi) {
    case "facebook-scraper3":
      url = `https://facebook-scraper3.p.rapidapi.com/group/posts?group_id=${groupId}&sorting_order=CHRONOLOGICAL`;
      host = "facebook-scraper3.p.rapidapi.com";
      break;

    case "facebook-scraper-api4":
      url = `https://facebook-scraper-api4.p.rapidapi.com/get_facebook_group_posts_details_from_id?group_id=${groupId}`;
      host = "facebook-scraper-api4.p.rapidapi.com";
      break;
  }

  console.log(`📡 Fetching from: ${url}`);
  const apiKey = process.env.NEXT_RAPID_API_KEY;
  return fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": host!,
      "x-rapidapi-key": apiKey!,
    },
  });
}

function buildPostEntity(
  fromApi: FromApi,
  fbPost: any,
  anonymousUserId: string,
) {
  let entity: Partial<Post>;
  switch (fromApi) {
    case "facebook-scraper3":
      entity = {
        content: fbPost.message,
        author_type: fbPost.message ? detectPostType(fbPost.message) : "driver",
        author_name: fbPost.author?.name ?? null,
        user_id: anonymousUserId,
        facebook_url:
          fbPost.url ?? normalizeFacebookUrl(fbPost.author?.url) ?? null,
        facebook_id: fbPost.post_id ?? null,
        phone: extractPhone(fbPost.message),
      };
      break;
    case "facebook-scraper-api4":
      entity = {
        content: fbPost.values?.text,
        author_type: fbPost.values?.text
          ? detectPostType(fbPost.values?.text)
          : "driver",
        author_name: fbPost.user_details?.name ?? null,
        user_id: anonymousUserId,
        facebook_url: fbPost.details?.post_link,
        facebook_id: fbPost.details?.post_id,
        phone: extractPhone(fbPost.values?.text),
      };
      break;
  }
  if (entity.content) {
    entity.content = entity.content.trim().replace(/"+$/, "").trim();
  }
  return entity;
}

function reportCronJobResults(
  totalDuration: number,
  groups: string[],
  totalFetchedPosts: number,
  totalCreatedPosts: number,
  totalSkippedPosts: number,
  totalFailedInserts: number,
  groupResults: any[],
) {
  console.log("\n=== Cron job completed ===");
  console.log(`⏱️  Total duration: ${totalDuration}ms`);
  console.log(`📊 Summary:`, {
    groups_processed: groups.length,
    total_fetched: totalFetchedPosts,
    total_created: totalCreatedPosts,
    total_skipped: totalSkippedPosts,
    total_failed: totalFailedInserts,
  });
  console.log(`📋 Per-group results:`, groupResults);
}
function extractPosts(fromApi: FromApi, resData: any) {
  if (!resData) return [];
  switch (fromApi) {
    case "facebook-scraper3":
      return resData.posts;
    case "facebook-scraper-api4":
      return resData.data?.posts;
  }
}
