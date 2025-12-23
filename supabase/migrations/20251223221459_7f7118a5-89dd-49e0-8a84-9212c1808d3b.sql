-- Fix chat_messages: require authentication
DROP POLICY IF EXISTS "Anyone can read messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON chat_messages;

CREATE POLICY "Authenticated users can read messages"
ON chat_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can send messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix profiles: require authentication
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);