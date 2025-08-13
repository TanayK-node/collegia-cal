
-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('committee', 'general_secretary', 'dean', 'student');

-- Create enum for event status
CREATE TYPE event_status AS ENUM ('draft', 'submitted', 'gs_approved', 'final_approved', 'rejected');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  committee_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  department TEXT,
  expected_attendees INTEGER,
  budget DECIMAL(10,2),
  resources_needed TEXT,
  status event_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create approvals table for tracking approval workflow
CREATE TABLE public.event_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id),
  approval_type TEXT NOT NULL, -- 'gs_approval' or 'dean_approval'
  status TEXT NOT NULL, -- 'pending', 'approved', 'rejected'
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_approvals ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert their profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events policies
CREATE POLICY "Committee members can CRUD their own events" ON public.events
  FOR ALL USING (
    created_by = auth.uid() AND 
    public.get_user_role(auth.uid()) = 'committee'
  );

CREATE POLICY "General Secretary can view submitted events" ON public.events
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'general_secretary' AND 
    status IN ('submitted', 'gs_approved', 'final_approved', 'rejected')
  );

CREATE POLICY "Dean can view GS approved events" ON public.events
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'dean' AND 
    status IN ('gs_approved', 'final_approved', 'rejected')
  );

CREATE POLICY "Students can view final approved events" ON public.events
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'student' AND 
    status = 'final_approved'
  );

-- Event approvals policies
CREATE POLICY "Approvers can manage relevant approvals" ON public.event_approvals
  FOR ALL USING (
    (approver_id = auth.uid()) OR
    (SELECT created_by FROM public.events WHERE id = event_id) = auth.uid()
  );

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'student'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update event status
CREATE OR REPLACE FUNCTION public.update_event_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update event status based on approval
  IF NEW.status = 'approved' THEN
    IF NEW.approval_type = 'gs_approval' THEN
      UPDATE public.events 
      SET status = 'gs_approved'::event_status 
      WHERE id = NEW.event_id;
    ELSIF NEW.approval_type = 'dean_approval' THEN
      UPDATE public.events 
      SET status = 'final_approved'::event_status 
      WHERE id = NEW.event_id;
    END IF;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE public.events 
    SET status = 'rejected'::event_status 
    WHERE id = NEW.event_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for event status updates
CREATE TRIGGER on_approval_status_change
  AFTER UPDATE ON public.event_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_event_status();
