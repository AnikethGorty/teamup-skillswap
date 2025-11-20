-- Function to link new auth users to existing student records
CREATE OR REPLACE FUNCTION link_user_to_student_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update studentdetails with the new user's ID based on email match
  UPDATE studentdetails
  SET user_id = NEW.id
  WHERE email = NEW.email
  AND user_id != NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user signup
DROP TRIGGER IF EXISTS on_auth_user_created_link_student ON auth.users;
CREATE TRIGGER on_auth_user_created_link_student
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_user_to_student_record();