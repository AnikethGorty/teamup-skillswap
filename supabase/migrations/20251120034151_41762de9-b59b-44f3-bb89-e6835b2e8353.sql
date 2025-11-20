-- Add skills column to studentdetails table
ALTER TABLE studentdetails 
ADD COLUMN skills text[] DEFAULT '{}';

-- Add skills column to events table for skill-based matching
ALTER TABLE events 
ADD COLUMN required_skills text[] DEFAULT '{}';