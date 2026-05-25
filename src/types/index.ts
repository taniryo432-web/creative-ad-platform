export type User = {
  id: string;
  name: string;
  icon_url: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  user_id: string;
  created_at: string;
  user?: User;
  like_count?: number;
  is_liked?: boolean;
  // showAuthor フラグ（将来の匿名モード対応）
  showAuthor?: boolean;
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
