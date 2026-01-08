
-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view community members" ON public.community_members;

-- Create a security definer function to check community membership
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_members
    WHERE user_id = _user_id
      AND community_id = _community_id
  )
$$;

-- Create a function to get user's community IDs
CREATE OR REPLACE FUNCTION public.get_user_community_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT community_id
  FROM public.community_members
  WHERE user_id = _user_id
$$;

-- Create non-recursive policy using the security definer function
CREATE POLICY "Members can view community members"
ON public.community_members FOR SELECT
USING (
  community_id IN (SELECT public.get_user_community_ids(auth.uid()))
);

-- Also fix the community_messages policy which has same issue
DROP POLICY IF EXISTS "Members can view community messages" ON public.community_messages;

CREATE POLICY "Members can view community messages"
ON public.community_messages FOR SELECT
USING (
  community_id IN (SELECT public.get_user_community_ids(auth.uid()))
);

-- Fix the send messages policy too
DROP POLICY IF EXISTS "Members can send messages" ON public.community_messages;

CREATE POLICY "Members can send messages"
ON public.community_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  public.is_community_member(auth.uid(), community_id)
);
