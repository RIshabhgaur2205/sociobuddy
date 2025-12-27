-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'admin',
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage referral codes
CREATE POLICY "Admins can manage referral codes"
ON public.referral_codes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Allow edge function to read codes (service role bypasses RLS anyway)
CREATE POLICY "Service role can read codes"
ON public.referral_codes FOR SELECT
USING (true);

-- Insert default admin referral code
INSERT INTO public.referral_codes (code, role) VALUES ('ADMIN2024', 'admin');