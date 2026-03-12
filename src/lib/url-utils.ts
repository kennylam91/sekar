// Helper utilities for URL normalization
export function normalizeFacebookUrl(raw?: string): string | null {
  const url = (raw || "").trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    // If already profile.php with id param, return normalized form
    if (u.pathname.includes("/profile.php")) {
      const id = u.searchParams.get("id");
      if (id) return `https://www.facebook.com/profile.php?id=${id}`;
    }

    // Match /user/{id} in the path (e.g. /groups/.../user/10000/...)
    const m = u.pathname.match(/\/user\/(\d+)/);
    if (m && m[1]) return `https://www.facebook.com/profile.php?id=${m[1]}`;

    // If an id query param exists, normalize to profile.php
    const idParam = u.searchParams.get("id");
    if (idParam) return `https://www.facebook.com/profile.php?id=${idParam}`;

    // Otherwise return the original url (no change)
    return url;
  } catch (e) {
    // If URL parsing fails, return the raw input
    return url;
  }
}

/**
 * Extracts the Facebook user/profile identifier from a Facebook profile URL.
 * Returns a numeric ID string (e.g. "100001234567890") when available,
 * otherwise the path-based username (e.g. "john.doe").
 * Returns null if the URL cannot be parsed or has no meaningful identifier.
 */
export function extractFacebookUserId(raw?: string | null): string | null {
  const url = (raw || "").trim();
  if (!url) return null;
  try {
    const u = new URL(url);

    // profile.php?id=<numeric_id>
    if (u.pathname.includes("/profile.php")) {
      const id = u.searchParams.get("id");
      if (id) return id;
    }

    // /user/<numeric_id> segment (e.g. /groups/.../user/10000/...)
    const userSegment = u.pathname.match(/\/user\/(\d+)/);
    if (userSegment?.[1]) return userSegment[1];

    // Numeric ?id= query param on any path
    const idParam = u.searchParams.get("id");
    if (idParam && /^\d+$/.test(idParam)) return idParam;

    // Last non-empty path segment as username (e.g. /john.doe or /john.doe/)
    const segments = u.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && last !== "groups" && last !== "profile.php") return last;

    return null;
  } catch {
    return null;
  }
}
