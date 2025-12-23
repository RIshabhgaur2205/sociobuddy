-- Create a public messages table for the community chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages (public chat)
CREATE POLICY "Anyone can read messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert messages (public chat)
CREATE POLICY "Anyone can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;