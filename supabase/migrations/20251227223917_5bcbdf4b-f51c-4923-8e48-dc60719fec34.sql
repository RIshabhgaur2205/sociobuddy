-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;

-- Create new PERMISSIVE policies for community chat (allows anyone to read/send with nickname)
CREATE POLICY "Anyone can read chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can send chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);