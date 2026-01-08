
-- Create communities table
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  invite_code text UNIQUE NOT NULL,
  creator_id uuid NOT NULL,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create community members table
CREATE TABLE public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

-- Create community messages table
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  sender_username text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  media_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "Anyone can view communities"
ON public.communities FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create communities"
ON public.communities FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their communities"
ON public.communities FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their communities"
ON public.communities FOR DELETE
USING (auth.uid() = creator_id);

-- Community members policies
CREATE POLICY "Members can view community members"
ON public.community_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.community_members cm
  WHERE cm.community_id = community_members.community_id
  AND cm.user_id = auth.uid()
));

CREATE POLICY "Users can join communities"
ON public.community_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
ON public.community_members FOR DELETE
USING (auth.uid() = user_id);

-- Community messages policies
CREATE POLICY "Members can view community messages"
ON public.community_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.community_members cm
  WHERE cm.community_id = community_messages.community_id
  AND cm.user_id = auth.uid()
));

CREATE POLICY "Members can send messages"
ON public.community_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_messages.community_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own messages"
ON public.community_messages FOR DELETE
USING (auth.uid() = sender_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Add trigger for updated_at
CREATE TRIGGER update_communities_updated_at
BEFORE UPDATE ON public.communities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
