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
