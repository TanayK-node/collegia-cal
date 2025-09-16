-- Add phone number to event_registrations table (nullable initially)
ALTER TABLE public.event_registrations 
ADD COLUMN phone_number text;

-- Create OTP verification table
CREATE TABLE public.otp_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  event_id uuid NOT NULL,
  student_id uuid NOT NULL,
  verified boolean DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on otp_verifications
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for students to manage their own OTP verifications
CREATE POLICY "Students can manage their own OTP verifications"
ON public.otp_verifications
FOR ALL
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Update default status to include verification step
ALTER TABLE public.event_registrations 
ALTER COLUMN status SET DEFAULT 'pending_verification';