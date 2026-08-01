CREATE TABLE IF NOT EXISTS public.system_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    user_agent TEXT,
    resolved BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage errors" ON public.system_errors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can insert errors" ON public.system_errors FOR INSERT WITH CHECK (true);
