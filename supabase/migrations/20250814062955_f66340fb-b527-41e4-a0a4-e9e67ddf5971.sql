
-- Create the user_role enum type
CREATE TYPE user_role AS ENUM ('committee', 'general_secretary', 'dean', 'student');

-- Create the event_status enum type 
CREATE TYPE event_status AS ENUM ('draft', 'submitted', 'gs_approved', 'final_approved', 'rejected');

-- Recreate the handle_new_user function to ensure it works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
