
-- Add is_pinned column to community_messages
ALTER TABLE public.community_messages ADD COLUMN is_pinned boolean DEFAULT false;

-- Allow admins to update messages (for pinning)
CREATE POLICY "Admins can pin messages"
ON public.community_messages FOR UPDATE
USING (
  public.is_community_admin(auth.uid(), community_id)
);

-- Allow admins to update member roles (for admin transfer)
CREATE POLICY "Admins can update member roles"
ON public.community_members FOR UPDATE
USING (
  public.is_community_admin(auth.uid(), community_id)
);
