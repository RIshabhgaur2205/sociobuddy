
CREATE TABLE public.social_gym_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp integer NOT NULL DEFAULT 0,
  sessions_completed integer NOT NULL DEFAULT 0,
  characters_tried text[] NOT NULL DEFAULT '{}',
  badges text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.social_gym_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stats" ON public.social_gym_stats
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own stats" ON public.social_gym_stats
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.social_gym_stats
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
