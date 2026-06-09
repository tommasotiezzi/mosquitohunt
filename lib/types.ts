export type PostType = "kill" | "snap" | "text";
export interface FeedPost {
  id: string; author_id: string; author_username: string;
  type: PostType; body: string | null; image_url: string | null;
  kill_count: number; created_at: string;
  salute_count: number; comment_count: number; hot_score: number;
}
export interface Comment { id: string; author_username: string; body: string; created_at: string; }
export interface KillStats { kills_today: number; kills_this_week: number; percentile: number; tier_title: string; }
export interface Profile { id: string; username: string; }
