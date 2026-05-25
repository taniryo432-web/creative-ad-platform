-- Users table
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  icon_url text,
  created_at timestamptz default now() not null
);

-- Tags table
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now() not null
);

-- Posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  video_url text,
  ad_url text,
  ai_analysis text,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Post tags junction
create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (post_id, tag_id)
);

-- Likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (post_id, user_id)
);

-- Saves table
create table public.saves (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (post_id, user_id)
);

-- Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_likes_post_id on public.likes(post_id);
create index idx_saves_post_id on public.saves(post_id);
create index idx_comments_post_id on public.comments(post_id);
create index idx_post_tags_tag_id on public.post_tags(tag_id);

-- Row Level Security
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;
alter table public.comments enable row level security;

-- RLS Policies: Users
create policy "Public users are viewable by everyone" on public.users for select using (true);
create policy "Users can insert their own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- RLS Policies: Posts
create policy "Posts are viewable by everyone" on public.posts for select using (true);
create policy "Authenticated users can insert posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete using (auth.uid() = user_id);

-- RLS Policies: Tags
create policy "Tags are viewable by everyone" on public.tags for select using (true);
create policy "Authenticated users can insert tags" on public.tags for insert with check (auth.role() = 'authenticated');

-- RLS Policies: Post tags
create policy "Post tags are viewable by everyone" on public.post_tags for select using (true);
create policy "Authenticated users can manage post tags" on public.post_tags for insert with check (auth.role() = 'authenticated');
create policy "Post owners can delete post tags" on public.post_tags for delete using (
  exists (select 1 from public.posts where id = post_id and user_id = auth.uid())
);

-- RLS Policies: Likes
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Authenticated users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike their own likes" on public.likes for delete using (auth.uid() = user_id);

-- RLS Policies: Saves
create policy "Saves are viewable by everyone" on public.saves for select using (true);
create policy "Authenticated users can save" on public.saves for insert with check (auth.uid() = user_id);
create policy "Users can unsave their own saves" on public.saves for delete using (auth.uid() = user_id);

-- RLS Policies: Comments
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = user_id);

-- Storage bucket for images
insert into storage.buckets (id, name, public) values ('images', 'images', true);

create policy "Images are publicly accessible" on storage.objects for select using (bucket_id = 'images');
create policy "Authenticated users can upload images" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "Users can delete their own images" on storage.objects for delete using (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[2]);

-- Sample tags
insert into public.tags (name) values
  ('SNS広告'),
  ('動画広告'),
  ('LP'),
  ('バナー'),
  ('インフルエンサー'),
  ('リターゲティング'),
  ('ブランディング'),
  ('コンバージョン'),
  ('認知拡大'),
  ('UGC');
