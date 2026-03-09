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

  // Load Facebook groups from DB (falls back to env variable if table is empty)
  type GroupEntry = { facebook_id: string };
  let groups: GroupEntry[] = [];
  const { data: dbGroups, error: dbGroupsError } = await supabase
    .from("facebook_groups")
    .select("facebook_id")
    .eq("is_enabled", true)
    .order("created_at", { ascending: true });

  if (dbGroupsError) {
    console.error("❌ Failed to load facebook_groups from DB:", dbGroupsError);
  }

  if (dbGroups && dbGroups.length > 0) {
    groups = dbGroups.map((g: { facebook_id: string }) => ({
      facebook_id: g.facebook_id,
    }));
    console.log(`📋 Loaded ${groups.length} Facebook groups from database`);
  } else {
    console.warn("⚠️ No Facebook groups found in database.");
    return NextResponse.json(
      { error: "No Facebook groups found in database" },
      { status: 400 },
    );
  }

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

  // Use for...of instead of forEach to properly await async operations
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const groupStartTime = Date.now();
    console.log(
      `\n--- Processing group ${i + 1}/${groups.length}: ${group.facebook_id} ---`,
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5 second delay between groups to avoid rate limits
      const res = await fetchFbPosts(fromApi as FromApi, group.facebook_id);

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ API request failed for group ${group.facebook_id}:`, {
          status: res.status,
          statusText: res.statusText,
          body: text.substring(0, 500), // Limit log size
        });
        groupResults.push({
          group: group.facebook_id,
          status: "failed",
          error: `API returned ${res.status}`,
        });
        continue;
      }

      const resData = await res.json();

      const fbPosts = extractPosts(fromApi as FromApi, resData);
      const postsCount = Array.isArray(fbPosts) ? fbPosts.length : 0;
      console.log(
        `📬 Received ${postsCount} posts from group ${group.facebook_id}`,
      );
      totalFetchedPosts += postsCount;

      if (postsCount === 0) {
        console.log(`ℹ️ No posts to process for group ${group.facebook_id}`);
        groupResults.push({
          group: group.facebook_id,
          status: "success",
          fetched: 0,
          created: 0,
          skipped: 0,
          failed: 0,
        });
        continue;
      }

      let groupCreated = 0;
      let groupSkipped = 0;
      let groupFailed = 0;
      let createdAuthorNames = new Set<string>();

      for (let j = 0; j < fbPosts.length; j++) {
        const fbPost = fbPosts[j];

        const newPost = buildPostEntity(
          fromApi as FromApi,
          fbPost,
          anonymousUserId!,
          group.facebook_id,
        );

        // Skip posts without message
        if (!newPost.content) {
          groupSkipped++;
          console.log(`  ⊘ Post ${j + 1}/${postsCount}: Skipped (no message)`);
          continue;
        }

        if (
          newPost.author_name &&
          createdAuthorNames.has(newPost.author_name)
        ) {
          groupSkipped++;
          console.log(
            `  ⊘ Post ${j + 1}/${postsCount}: Skipped (duplicate author name)`,
          );
          continue;
        }

        // Skip if a post with the same author_name + phone already exists in the last 4 hours
        if (newPost.author_name && newPost.phone) {
          const fourHoursAgo = new Date(
            Date.now() - 4 * 60 * 60 * 1000,
          ).toISOString();
          const { data: existingPosts } = await supabase
            .from("posts")
            .select("id")
            .eq("author_name", newPost.author_name)
            .eq("phone", newPost.phone)
            .gte("created_at", fourHoursAgo)
            .limit(1);

          if (existingPosts && existingPosts.length > 0) {
            groupSkipped++;
            console.log(
              `  ⊘ Post ${j + 1}/${postsCount}: Skipped (duplicated within 4 hours)`,
            );
            continue;
          }
        }

        // Skip posts that are not relevant to ride-sharing
        const detected = await detectPostType(newPost.content);
        if (!detected.isRelevant) {
          groupSkipped++;
          console.log(
            `  ⊘ Post ${j + 1}/${postsCount}: Skipped (not relevant to ride-sharing)`,
          );
          continue;
        }
        newPost.author_type = detected.type;
        newPost.used_llm = detected.usedLLM;

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
      console.log(
        `✓ Group ${group.facebook_id} completed in ${groupDuration}ms:`,
        {
          fetched: postsCount,
          created: groupCreated,
          skipped: groupSkipped,
          failed: groupFailed,
        },
      );

      groupResults.push({
        group: group.facebook_id,
        status: "success",
        fetched: postsCount,
        created: groupCreated,
        skipped: groupSkipped,
        failed: groupFailed,
        duration: groupDuration,
      });
    } catch (err) {
      console.error(
        `❌ Unexpected error processing group ${group.facebook_id}:`,
        err,
      );
      groupResults.push({
        group: group.facebook_id,
        status: "error",
        error: String(err),
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
  groupId: string,
) {
  let entity: Partial<Post>;
  switch (fromApi) {
    case "facebook-scraper3":
      entity = {
        content: fbPost.message,
        author_name: fbPost.author?.name ?? null,
        user_id: anonymousUserId,
        facebook_url:
          fbPost.url ?? normalizeFacebookUrl(fbPost.author?.url) ?? null,
        facebook_id: fbPost.post_id ?? null,
        group_id: groupId,
        phone: extractPhone(fbPost.message),
      };
      break;
    case "facebook-scraper-api4":
      entity = {
        content: fbPost.values?.text,
        author_name: fbPost.user_details?.name ?? null,
        user_id: anonymousUserId,
        facebook_url: fbPost.details?.post_link,
        facebook_id: fbPost.details?.post_id,
        group_id: groupId,
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
  groups: { facebook_id: string }[],
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
