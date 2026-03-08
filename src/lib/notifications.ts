import { getMessaging } from "./firebase-admin";
import { supabase } from "./supabase";
import { normalizeRoutesArray } from "./routes";

/**
 * Send push notification to drivers. If routes are provided,
 * only drivers whose preferred_routes overlap will be targeted.
 */
export async function notifyDriversOfNewPost(
  postContent: string,
  routes: string[] = [],
) {
  console.log(
    `[notifications] notifyDriversOfNewPost called — content length: ${postContent.length}`,
  );
  const normalizedRoutes = normalizeRoutesArray(routes);
  const messaging = getMessaging();
  if (!messaging) {
    console.warn("Firebase Admin not initialized — skipping notification");
    return;
  }

  let targetUserIds: string[] | null = null;

  // Route-aware targeting for passenger posts from Facebook groups.
  if (normalizedRoutes.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "driver")
      .overlaps("preferred_routes", normalizedRoutes);

    if (usersError) {
      console.error(
        "[notifications] Failed to fetch drivers by preferred_routes:",
        usersError,
      );
      return;
    }

    targetUserIds = (users ?? []).map((user) => user.id);
    if (targetUserIds.length === 0) {
      console.log("[notifications] No drivers matched routes, skipping");
      return;
    }
  }

  let query = supabase.from("fcm_tokens").select("token");
  if (targetUserIds) {
    query = query.in("user_id", targetUserIds);
  }

  const { data: tokens, error } = await query;

  if (error) {
    console.error("[notifications] Failed to fetch FCM tokens:", error);
    return;
  }

  if (!tokens || tokens.length === 0) {
    console.log("[notifications] No FCM tokens found, skipping notification");
    return;
  }

  const tokenList = tokens.map((t) => t.token);
  console.log(`[notifications] Sending to ${tokenList.length} token(s)`);

  // Truncate content for notification body
  const body =
    postContent.length > 100
      ? postContent.substring(0, 100) + "..."
      : postContent;

  console.log(
    `[notifications] Payload — title: "🚗 Có khách tìm xe trên Sekar!" | body: "${body}"`,
  );

  try {
    const response = await messaging.sendEachForMulticast({
      tokens: tokenList,
      // Use data-only payload so the browser never auto-displays a notification.
      // Both the SW onBackgroundMessage handler and the foreground onMessage
      // handler read these fields and call showNotification() themselves,
      // which prevents the double-notification bug caused by a `notification`
      // field triggering an automatic display AND the explicit handler.
      data: {
        title: "🚗 Có khách tìm xe trên Sekar!",
        body,
        url: "/",
      },
      webpush: {
        headers: { Urgency: "high" },
      },
    });

    console.log(
      `[notifications] Result: ${response.successCount} success, ${response.failureCount} failure(s)`,
    );

    // Clean up invalid tokens
    const tokensToRemove: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.warn(
          `[notifications] Token #${idx} failed — code: ${resp.error?.code} | message: ${resp.error?.message}`,
        );
        tokensToRemove.push(tokenList[idx]);
      }
    });

    if (tokensToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from("fcm_tokens")
        .delete()
        .in("token", tokensToRemove);
      if (deleteError) {
        console.error(
          "[notifications] Failed to remove invalid tokens:",
          deleteError,
        );
      } else {
        console.log(
          `[notifications] Removed ${tokensToRemove.length} invalid token(s)`,
        );
      }
    }
  } catch (err) {
    console.error(
      "[notifications] Unexpected error sending notifications:",
      err,
    );
  }
}
