-- Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create public storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the 'avatars' bucket
-- Allow public read access to the avatars bucket
CREATE POLICY "Public Read Avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

