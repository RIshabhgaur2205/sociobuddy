
-- Create function to check if user is community admin
CREATE OR REPLACE FUNCTION public.is_community_admin(_user_id uuid, _community_id uuid)
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
      AND role = 'admin'
  )
$$;

-- Allow admins to remove members (except themselves)
CREATE POLICY "Admins can remove members"
ON public.community_members FOR DELETE
USING (
  public.is_community_admin(auth.uid(), community_id) AND user_id != auth.uid()
);
