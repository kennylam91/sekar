export type UserRole = "driver" | "admin";
export type AuthorType = "passenger" | "driver";

export interface User {
  id: string;
  username: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_type: AuthorType;
  author_name: string | null;
  user_id: string | null;
  content: string;
  phone: string | null;
  facebook_url: string | null;
  zalo_url: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  facebook_id?: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  displayName: string | null;
}

export type PostFilter = "all" | "today" | "2days" | "week";

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CronJobLog {
  id: string;
  run_at: string;
  api_source: string | null;
  group_id: string | null;
  total_fetched: number;
  total_created: number;
  total_skipped: number;
  total_passenger_posts: number;
  status: string;
  duration_ms: number | null;
  requests_limit: number | null;
  requests_remaining: number | null;
  created_at: string;
}

export interface FacebookGroup {
  id: string;
  group_id: string;
  name: string | null;
  member_count: number | null;
  last_updated_at: string | null;
  created_at: string;
}
