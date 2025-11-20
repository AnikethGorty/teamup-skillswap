// Mock student email addresses - ONLY these emails are allowed for signup/login
export const ALLOWED_EMAILS = [
  'rahul.sharma@mockstudent.edu',
  'priya.patel@mockstudent.edu',
  'arjun.reddy@mockstudent.edu',
  'sneha.kapoor@mockstudent.edu',
  'vikram.singh@mockstudent.edu',
  'aditya.kumar@mockstudent.edu',
  'ananya.iyer@mockstudent.edu',
  'rohan.mehta@mockstudent.edu',
  'kavya.nair@mockstudent.edu',
  'siddharth.joshi@mockstudent.edu',
  'ishita.gupta@mockstudent.edu',
  'karan.malhotra@mockstudent.edu',
  'tanvi.desai@mockstudent.edu',
  'nikhil.verma@mockstudent.edu',
  'aarav.chatterjee@mockstudent.edu',
  'diya.sinha@mockstudent.edu',
  // MVJ College of Engineering Students
  'arjun.mvj@mockstudent.edu',
  'priya.mvj@mockstudent.edu',
  'rohan.mvj@mockstudent.edu',
  'sneha.mvj@mockstudent.edu',
  'vikram.mvj@mockstudent.edu',
  'anjali.mvj@mockstudent.edu',
  'karthik.mvj@mockstudent.edu',
  'divya.mvj@mockstudent.edu',
] as const;

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase().trim() as any);
}

export function getAllowedEmailsList(): string {
  return ALLOWED_EMAILS.join(', ');
}
