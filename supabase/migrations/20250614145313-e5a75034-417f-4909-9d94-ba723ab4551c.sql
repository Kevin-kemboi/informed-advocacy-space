
-- First, let's ensure the foreign key relationship exists properly
-- Check if there are any existing foreign key constraints and drop them if they're incorrect
DO $$ 
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    -- Check if any foreign key constraint exists from posts.user_id to profiles.id
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'posts' 
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) INTO constraint_exists;
    
    -- If constraint doesn't exist, create it
    IF NOT constraint_exists THEN
        ALTER TABLE posts 
        ADD CONSTRAINT posts_user_id_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Created foreign key constraint posts_user_id_profiles_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Refresh the schema cache to ensure Supabase recognizes the relationship
NOTIFY pgrst, 'reload schema';
