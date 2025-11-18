import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Calendar, 
  Mail, 
  MessageSquare, 
  UserPlus,
  Github,
  Linkedin,
  Globe,
  Star,
  Award,
  BookOpen,
  Edit,
  Save,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  skills: z.array(z.string()).optional(),
  collegeid: z.string().uuid().optional(),
});

export function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [colleges, setColleges] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    skills: [] as string[],
    collegeid: "",
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchColleges();
    }
  }, [user]);

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name');

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast({
        title: "Error",
        description: "Could not load colleges",
        variant: "destructive",
      });
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('studentdetails')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || "",
          skills: [], // skills not in studentdetails schema
          collegeid: data.college_id || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Could not load profile data",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const validation = profileSchema.safeParse(formData);
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const profileData = {
        user_id: user.id,
        name: formData.name,
        email: user.email || "",
        college_id: formData.collegeid || null,
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('studentdetails')
          .update({ name: profileData.name, college_id: profileData.college_id })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('studentdetails')
          .insert(profileData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Placeholder data
  const wantToLearn: string[] = [];
  const projects: any[] = [];
  const achievements: any[] = [];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-card border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Profile</h2>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} variant="hero" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button onClick={() => { setIsEditing(false); fetchProfile(); }} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center lg:text-left">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your Name"
                      className="w-64"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">{profile?.name || "Add your name"}</h1>
                    <p className="text-xl text-muted-foreground">{user?.email}</p>
                  </>
                )}
              </div>
            </div>

            {/* Bio & Actions */}
            <div className="flex-1 space-y-6">
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Select
                    value={formData.collegeid}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, collegeid: value }))}
                  >
                    <SelectTrigger id="college" className="w-full">
                      <SelectValue placeholder="Select your college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.collegeid} value={college.collegeid}>
                          {college.name} - {college.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {!isEditing && profile?.collegeid && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">College</h3>
                  <p className="text-muted-foreground">
                    {colleges.find(c => c.collegeid === profile.collegeid)?.name || "Loading..."}
                    {colleges.find(c => c.collegeid === profile.collegeid)?.city && 
                      ` - ${colleges.find(c => c.collegeid === profile.collegeid)?.city}`}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        placeholder="Add a skill (e.g., React, Python)"
                      />
                      <Button onClick={handleAddSkill} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSkill(skill)}>
                          {skill} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                )}
              </div>

              {!isEditing && (
                <>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="hero">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                    <Button variant="outline">
                      Invite to Team
                    </Button>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4">
                    <Button variant="ghost" size="icon">
                      <Github className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Linkedin className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Globe className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Mail className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skills - Moved to header when editing, keeping this for consistency */}
        {!isEditing && (
          <div className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile?.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Want to Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wantToLearn.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">No learning goals yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {wantToLearn.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No projects yet</p>
            ) : (
              projects.map((project) => (
                <div key={project.title} className="p-4 rounded-lg bg-background/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <Badge variant={project.status === 'Completed' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.tech?.map((tech: string) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Team of {project.team} members
                  </div>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full">
              View All Projects
            </Button>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No achievements yet</p>
            ) : (
              achievements.map((achievement) => (
                <div key={achievement.title} className="p-4 rounded-lg bg-background/50 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center mt-1">
                      <Award className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
