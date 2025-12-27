-- Create mentors table for mentor applications
CREATE TABLE public.mentors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  photo text,
  title text NOT NULL,
  experience text,
  specialties text[] DEFAULT '{}'::text[],
  bio text,
  availability text,
  status text NOT NULL DEFAULT 'pending',
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved mentors
CREATE POLICY "Anyone can view approved mentors"
ON public.mentors
FOR SELECT
USING (status = 'approved');

-- Users can view their own mentor application regardless of status
CREATE POLICY "Users can view own mentor application"
ON public.mentors
FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can create their own mentor application
CREATE POLICY "Users can create own mentor application"
ON public.mentors
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own mentor application
CREATE POLICY "Users can update own mentor application"
ON public.mentors
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_mentors_updated_at
BEFORE UPDATE ON public.mentors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add policy for mentors to view bookings made to them
CREATE POLICY "Mentors can view their bookings"
ON public.mentor_bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentors 
    WHERE mentors.id::text = mentor_bookings.mentor_id 
    AND mentors.user_id = auth.uid()
  )
);