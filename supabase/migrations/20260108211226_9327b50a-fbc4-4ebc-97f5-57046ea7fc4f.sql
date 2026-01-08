-- Create a public view for mentors that excludes sensitive email data
CREATE OR REPLACE VIEW public.mentors_public AS
SELECT 
  id,
  user_id,
  name,
  photo,
  title,
  experience,
  specialties,
  bio,
  availability,
  status,
  verified,
  rating,
  reviews_count,
  gmeet_link,
  created_at,
  updated_at
FROM public.mentors
WHERE status = 'approved';

-- Grant access to the view for authenticated users
GRANT SELECT ON public.mentors_public TO authenticated;
GRANT SELECT ON public.mentors_public TO anon;

-- Drop the old permissive public policy that exposes all columns including email
DROP POLICY IF EXISTS "Anyone can view approved mentors" ON public.mentors;

-- Create a function to check if user can see mentor email
CREATE OR REPLACE FUNCTION public.can_view_mentor_email(_mentor_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() = _mentor_user_id  -- User is the mentor themselves
    OR public.has_role(auth.uid(), 'admin')  -- User is an admin
$$;

-- Add a more restrictive policy - only admins and the mentor themselves can see full mentor data (including email)
CREATE POLICY "Admins and mentor can view full mentor data" 
ON public.mentors 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') 
  OR auth.uid() = user_id
);