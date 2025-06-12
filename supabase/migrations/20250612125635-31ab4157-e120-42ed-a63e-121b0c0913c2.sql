
-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Users can upload post images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to post images
CREATE POLICY "Public can view post images" ON storage.objects
FOR SELECT USING (bucket_id = 'post-images');

-- Create policy to allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own post images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'post-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
