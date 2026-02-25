import type { PostFilter } from "@/types";

export function getDateFilter(filter: PostFilter): string | null {
  const now = new Date();
  switch (filter) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    case "2days": {
      const start = new Date(now);
      start.setDate(start.getDate() - 2);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    default:
      return null;
  }
}
