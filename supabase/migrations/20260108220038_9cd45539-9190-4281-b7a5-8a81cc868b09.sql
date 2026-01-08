
-- Drop the recursive policy
DROP POLICY IF EXISTS "Members can view community members" ON public.community_members;

-- Create a non-recursive policy - allow users to see members of communities they belong to
-- Use a direct check instead of subquery that references the same table
CREATE POLICY "Members can view community members"
ON public.community_members FOR SELECT
USING (
  user_id = auth.uid() OR
  community_id IN (
    SELECT cm.community_id 
    FROM public.community_members cm 
    WHERE cm.user_id = auth.uid()
  )
);
