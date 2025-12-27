-- Add foreign key from mentor_bookings.user_id to profiles.id for the join query
ALTER TABLE public.mentor_bookings
ADD CONSTRAINT mentor_bookings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;