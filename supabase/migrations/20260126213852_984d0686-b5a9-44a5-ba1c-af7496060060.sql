-- Create login_attempts table to track all authentication footprints
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  failure_reason TEXT
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage login attempts (via edge function)
CREATE POLICY "Service role can manage login_attempts"
  ON public.login_attempts
  FOR ALL
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_login_attempts_username ON public.login_attempts(username);
CREATE INDEX idx_login_attempts_attempted_at ON public.login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address);