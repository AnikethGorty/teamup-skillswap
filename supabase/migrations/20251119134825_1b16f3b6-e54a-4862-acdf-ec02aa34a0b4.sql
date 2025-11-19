-- Allow users to view student details from their own college
DROP POLICY IF EXISTS "Users can view their own details" ON studentdetails;

CREATE POLICY "Users can view students from their college"
ON studentdetails
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  college_id IN (
    SELECT college_id FROM studentdetails WHERE user_id = auth.uid()
  )
);