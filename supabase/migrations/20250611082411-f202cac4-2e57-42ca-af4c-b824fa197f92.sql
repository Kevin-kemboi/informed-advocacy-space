
-- Enable RLS on all tables (skip if already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'polls' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'votes' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'likes' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'flags' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add foreign key constraints only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'polls_user_id_fkey'
    ) THEN
        ALTER TABLE public.polls ADD CONSTRAINT polls_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'votes_user_id_fkey'
    ) THEN
        ALTER TABLE public.votes ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'votes_poll_id_fkey'
    ) THEN
        ALTER TABLE public.votes ADD CONSTRAINT votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'likes_user_id_fkey'
    ) THEN
        ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'likes_post_id_fkey'
    ) THEN
        ALTER TABLE public.likes ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'flags_user_id_fkey'
    ) THEN
        ALTER TABLE public.flags ADD CONSTRAINT flags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'flags_post_id_fkey'
    ) THEN
        ALTER TABLE public.flags ADD CONSTRAINT flags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'flags_poll_id_fkey'
    ) THEN
        ALTER TABLE public.flags ADD CONSTRAINT flags_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id);
    END IF;
END $$;

-- Create RLS policies only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' AND policyname = 'Anyone can view active posts'
    ) THEN
        CREATE POLICY "Anyone can view active posts" ON public.posts FOR SELECT USING (status = 'active');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' AND policyname = 'Users can create posts'
    ) THEN
        CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' AND policyname = 'Users can update their own posts'
    ) THEN
        CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'polls' AND policyname = 'Anyone can view active polls'
    ) THEN
        CREATE POLICY "Anyone can view active polls" ON public.polls FOR SELECT USING (status = 'active');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'polls' AND policyname = 'Users can create polls'
    ) THEN
        CREATE POLICY "Users can create polls" ON public.polls FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'polls' AND policyname = 'Users can update their own polls'
    ) THEN
        CREATE POLICY "Users can update their own polls" ON public.polls FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'votes' AND policyname = 'Users can view all votes'
    ) THEN
        CREATE POLICY "Users can view all votes" ON public.votes FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'votes' AND policyname = 'Users can create votes'
    ) THEN
        CREATE POLICY "Users can create votes" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' AND policyname = 'Users can view all likes'
    ) THEN
        CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' AND policyname = 'Users can create likes'
    ) THEN
        CREATE POLICY "Users can create likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'flags' AND policyname = 'Users can view all flags'
    ) THEN
        CREATE POLICY "Users can view all flags" ON public.flags FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'flags' AND policyname = 'Users can create flags'
    ) THEN
        CREATE POLICY "Users can create flags" ON public.flags FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Anyone can view profiles'
    ) THEN
        CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = likes_count + 1 
  WHERE id = post_id;
END;
$$;

-- Enable realtime for tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.polls REPLICA IDENTITY FULL;
ALTER TABLE public.votes REPLICA IDENTITY FULL;
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER TABLE public.flags REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flags;
