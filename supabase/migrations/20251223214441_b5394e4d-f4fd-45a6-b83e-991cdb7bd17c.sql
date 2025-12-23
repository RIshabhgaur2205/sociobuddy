-- Create messages table for private conversations
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can only view messages from their matches
CREATE POLICY "Users can view messages from their matches"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = messages.match_id
    AND matches.status = 'accepted'
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Users can send messages to their matches
CREATE POLICY "Users can send messages to their matches"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = messages.match_id
    AND matches.status = 'accepted'
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Users can update read_at on messages they receive
CREATE POLICY "Users can mark messages as read"
ON public.messages
FOR UPDATE
USING (
  sender_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = messages.match_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;