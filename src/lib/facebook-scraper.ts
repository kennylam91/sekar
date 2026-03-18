import { normalizeFacebookUrl } from "@/lib/url-utils";
import { Post } from "@/types";
import { extractPhone } from "@/lib/posts";

export type FromApi = "facebook-scraper3" | "facebook-scraper-api4";

export function fetchFbPosts(
  fromApi: FromApi,
  groupId: string,
  cursor?: string,
): Promise<Response> {
  let url = "";
  let host = "";

  switch (fromApi) {
    case "facebook-scraper3":
      url = `https://facebook-scraper3.p.rapidapi.com/group/posts?group_id=${groupId}&sorting_order=CHRONOLOGICAL`;
      if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
      host = "facebook-scraper3.p.rapidapi.com";
      break;

    case "facebook-scraper-api4":
      url = `https://facebook-scraper-api4.p.rapidapi.com/get_facebook_group_posts_details_from_id?group_id=${groupId}`;
      if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
      host = "facebook-scraper-api4.p.rapidapi.com";
      break;
  }

  console.log(`📡 Fetching from: ${url}`);
  const apiKey = process.env.NEXT_RAPID_API_KEY;
  return fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": apiKey!,
    },
  });
}

export function extractPosts(fromApi: FromApi, resData: any): any[] {
  if (!resData) return [];
  switch (fromApi) {
    case "facebook-scraper3":
      return resData.posts ?? [];
    case "facebook-scraper-api4":
      return resData.data?.posts ?? [];
  }
}

export function extractCursor(fromApi: FromApi, resData: any): string | null {
  if (!resData) return null;
  switch (fromApi) {
    case "facebook-scraper3":
      // facebook-scraper3 may not expose a cursor; return null to avoid infinite loops
      return resData.cursor ?? null;
    case "facebook-scraper-api4":
      return resData.data?.page_info?.has_next
        ? (resData.data?.page_info?.end_cursor ?? null)
        : null;
  }
}

export function extractFacebookId(fromApi: FromApi, fbPost: any): string | null {
  switch (fromApi) {
    case "facebook-scraper3":
      return fbPost.post_id ?? null;
    case "facebook-scraper-api4":
      return fbPost.details?.post_id ?? null;
  }
}

/** Returns the post's publish time as a ms-since-epoch number, or null if unavailable. */
export function extractPostTimestamp(fromApi: FromApi, fbPost: any): number | null {
  switch (fromApi) {
    case "facebook-scraper3": {
      const ts = fbPost?.timestamp;
      return typeof ts === "number" ? ts * 1000 : null;
    }
    case "facebook-scraper-api4": {
      const iso = fbPost?.values?.publish_time;
      if (!iso) return null;
      const ms = Date.parse(iso);
      return isNaN(ms) ? null : ms;
    }
  }
}

export function buildPostEntity(
  fromApi: FromApi,
  fbPost: any,
  anonymousUserId: string | undefined,
  groupId: string,
): Partial<Post> {
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
