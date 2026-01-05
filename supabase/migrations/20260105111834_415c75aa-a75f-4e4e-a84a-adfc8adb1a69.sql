-- Add columns for media messages
ALTER TABLE public.messages 
ADD COLUMN content_type text NOT NULL DEFAULT 'text',
ADD COLUMN media_url text;

-- Create storage bucket for chat media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', true);

-- Storage policies for chat media
CREATE POLICY "Users can upload their own chat media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view chat media"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');

CREATE POLICY "Users can delete their own chat media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);