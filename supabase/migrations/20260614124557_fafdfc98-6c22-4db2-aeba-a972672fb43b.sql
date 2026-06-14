-- 1. referral_codes: remove the overly-permissive public read policy
DROP POLICY IF EXISTS "Service role can read codes" ON public.referral_codes;

-- 2. chat_messages: require authentication to read and send
DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can send chat messages" ON public.chat_messages;

CREATE POLICY "Authenticated users can read chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can send chat messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. mentors_public: convert SECURITY DEFINER view to security invoker
ALTER VIEW public.mentors_public SET (security_invoker = on);

-- allow authenticated users to view approved mentors (needed for invoker view + directory)
CREATE POLICY "Authenticated users can view approved mentors"
ON public.mentors FOR SELECT
TO authenticated
USING (status = 'approved');