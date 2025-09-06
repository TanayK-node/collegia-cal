-- Add RLS policy to allow committees to see profiles of students who registered for their events
CREATE POLICY "Committee can view profiles of registered students" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.event_registrations er
    JOIN public.events e ON er.event_id = e.id
    WHERE er.student_id = profiles.id 
    AND e.created_by = auth.uid()
  )
);