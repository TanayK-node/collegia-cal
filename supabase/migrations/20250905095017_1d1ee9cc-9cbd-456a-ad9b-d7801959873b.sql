-- Create event registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ticket_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'registered',
  UNIQUE(event_id, student_id)
);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Students can view their own registrations
CREATE POLICY "Students can view their own registrations" 
ON public.event_registrations 
FOR SELECT 
USING (student_id = auth.uid());

-- Students can register for events
CREATE POLICY "Students can register for events" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

-- Committee members can view registrations for their events
CREATE POLICY "Committee can view registrations for their events" 
ON public.event_registrations 
FOR SELECT 
USING (event_id IN (
  SELECT id FROM public.events WHERE created_by = auth.uid()
));

-- Add registration enabled column to events table
ALTER TABLE public.events 
ADD COLUMN registration_enabled BOOLEAN DEFAULT false;

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TKT-' || UPPER(SUBSTR(gen_random_uuid()::text, 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number = generate_ticket_number();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_ticket_number
  BEFORE INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();