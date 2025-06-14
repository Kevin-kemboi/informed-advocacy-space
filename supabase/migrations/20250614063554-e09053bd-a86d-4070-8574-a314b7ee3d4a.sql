
-- Create enum types for better data consistency
CREATE TYPE post_category AS ENUM ('crime', 'health', 'education', 'corruption', 'environment', 'emergency', 'general');
CREATE TYPE post_type AS ENUM ('opinion', 'incident', 'feedback', 'emergency');
CREATE TYPE moderation_status AS ENUM ('active', 'flagged', 'hidden', 'deleted');
CREATE TYPE user_status AS ENUM ('active', 'pending', 'suspended', 'banned');

-- Update profiles table with new fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_pic_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Update posts table with new fields for Twitter-like functionality
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category post_category DEFAULT 'general';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type post_type DEFAULT 'opinion';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderation_status moderation_status DEFAULT 'active';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT[];

-- Create reposts table (retweet functionality)
CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create reports table for content moderation
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follows table for user connections
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for reposts
CREATE POLICY "Users can view all reposts" ON reposts FOR SELECT USING (true);
CREATE POLICY "Users can create their own reposts" ON reposts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reposts" ON reposts FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for reports
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins and officials can view reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'government_official'))
);
CREATE POLICY "Admins can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS policies for follows
CREATE POLICY "Users can view all follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Update posts RLS policy to handle moderation
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
CREATE POLICY "Users can view active posts" ON posts FOR SELECT USING (
  moderation_status IN ('active', 'flagged') OR 
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'government_official'))
);

-- Functions for updating counters
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE posts SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE posts SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_repost_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET repost_count = repost_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET repost_count = repost_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_reply_count_trigger ON posts;
CREATE TRIGGER update_reply_count_trigger
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_reply_count();

DROP TRIGGER IF EXISTS update_repost_count_trigger ON reposts;
CREATE TRIGGER update_repost_count_trigger
  AFTER INSERT OR DELETE ON reposts
  FOR EACH ROW EXECUTE FUNCTION update_repost_count();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_related_post_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, related_post_id, related_user_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_post_id, p_related_user_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
