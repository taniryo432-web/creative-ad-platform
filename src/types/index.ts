export type User = {
  id: string;
  name: string;
  icon_url: string | null;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Post = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  ad_url: string | null;
  ai_analysis: string | null;
  user_id: string;
  created_at: string;
  user?: User;
  tags?: Tag[];
  like_count?: number;
  save_count?: number;
  comment_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
};

export type Like = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type Save = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type PostTag = {
  post_id: string;
  tag_id: string;
};

export type SortOption = "latest" | "popular" | "saved";
