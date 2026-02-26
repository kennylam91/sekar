import { getMessaging } from "./firebase-admin";
import { supabase } from "./supabase";

/**
 * Send push notification to all registered drivers
 * when a new passenger post is created.
 */
export async function notifyDriversOfNewPost(postContent: string) {
  const messaging = getMessaging();
  if (!messaging) {
    console.warn("Firebase Admin not initialized — skipping notification");
    return;
  }

  // Get all FCM tokens
  const { data: tokens, error } = await supabase
    .from("fcm_tokens")
    .select("token");

  if (error || !tokens || tokens.length === 0) {
    console.log("No FCM tokens found, skipping notification");
    return;
  }

  const tokenList = tokens.map((t) => t.token);

  // Truncate content for notification body
  const body =
    postContent.length > 100
      ? postContent.substring(0, 100) + "..."
      : postContent;

  try {
    const response = await messaging.sendEachForMulticast({
      tokens: tokenList,
      notification: {
        title: "🚗 Có khách tìm xe trên Sekar!",
        body,
      },
      webpush: {
        fcmOptions: {
          link: "/",
        },
      },
    });

    console.log(
      `Notifications sent: ${response.successCount} success, ${response.failureCount} failures`,
    );

    // Clean up invalid tokens
    const tokensToRemove: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        tokensToRemove.push(tokenList[idx]);
      }
    });

    if (tokensToRemove.length > 0) {
      await supabase.from("fcm_tokens").delete().in("token", tokensToRemove);
      console.log(`Removed ${tokensToRemove.length} invalid tokens`);
    }
  } catch (err) {
    console.error("Failed to send notifications:", err);
  }
}
