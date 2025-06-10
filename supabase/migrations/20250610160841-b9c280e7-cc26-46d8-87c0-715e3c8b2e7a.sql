
-- Create posts table for social media feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  status TEXT CHECK (status IN ('active', 'flagged', 'resolved', 'archived')) DEFAULT 'active',
  likes_count INTEGER DEFAULT 0,
  flags_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of option objects: [{"id": "1", "text": "Option 1", "votes": 0}]
  total_votes INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'closed', 'archived')) DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create votes table to track user votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  option_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- Ensure one vote per user per poll
);

-- Create likes table for post reactions
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Ensure one like per user per post
);

-- Create flags table for reporting content
CREATE TABLE public.flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK ((post_id IS NOT NULL AND poll_id IS NULL) OR (post_id IS NULL AND poll_id IS NOT NULL))
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Everyone can view active posts" 
  ON public.posts FOR SELECT 
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Citizens can create posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'citizen'
  ));

CREATE POLICY "Users can update own posts" 
  ON public.posts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any post" 
  ON public.posts FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for polls
CREATE POLICY "Everyone can view active polls" 
  ON public.polls FOR SELECT 
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Citizens can create polls" 
  ON public.polls FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'citizen'
  ));

CREATE POLICY "Users can update own polls" 
  ON public.polls FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any poll" 
  ON public.polls FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for votes
CREATE POLICY "Users can view votes" 
  ON public.votes FOR SELECT 
  USING (true);

CREATE POLICY "Users can create votes" 
  ON public.votes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" 
  ON public.votes FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for likes
CREATE POLICY "Users can view likes" 
  ON public.likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can create likes" 
  ON public.likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" 
  ON public.likes FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for flags
CREATE POLICY "Users can view own flags" 
  ON public.flags FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all flags" 
  ON public.flags FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create flags" 
  ON public.flags FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_polls_created_at ON public.polls(created_at DESC);
CREATE INDEX idx_polls_user_id ON public.polls(user_id);
CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
