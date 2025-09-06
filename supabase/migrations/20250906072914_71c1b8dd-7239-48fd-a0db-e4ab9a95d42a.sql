-- Allow public access to view committee names for events
CREATE POLICY "Public can view committee names" 
ON public.profiles 
FOR SELECT 
USING (committee_name IS NOT NULL);