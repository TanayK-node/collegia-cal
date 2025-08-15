
-- Add private column to events table
ALTER TABLE public.events 
ADD COLUMN is_private BOOLEAN DEFAULT FALSE;

-- Update RLS policy for students to exclude private events
DROP POLICY IF EXISTS "Students can view final approved events" ON public.events;

CREATE POLICY "Students can view final approved public events" 
ON public.events 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'student'::user_role) 
  AND (status = 'final_approved'::event_status) 
  AND (is_private = FALSE)
);

-- Allow committee members to view their own private events even if not final approved
CREATE POLICY "Committee can view their own private events" 
ON public.events 
FOR SELECT 
USING (
  (created_by = auth.uid()) 
  AND (get_user_role(auth.uid()) = 'committee'::user_role)
  AND (is_private = TRUE)
);
