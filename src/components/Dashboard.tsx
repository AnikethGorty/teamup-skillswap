import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Clock, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  UserPlus,
  Zap,
  Target,
  LogOut,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const { data: profile } = await supabase
        .from("studentdetails")
        .select("*, colleges(name)")
        .eq("user_id", user!.id)
        .single();
      
      setUserData(profile);

      // Get teams where user is creator or member
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .or(`created_by.eq.${user!.id},members.cs.{${user!.id}}`);
      
      setTeams(teamsData || []);

      // Get upcoming events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(5);
      
      setEvents(eventsData || []);

      // Get friends count
      const { count } = await supabase
        .from("friends")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user!.id)
        .eq("status", "accepted");
      
      setFriendsCount(count || 0);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const userName = userData?.name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName}! 👋</h1>
          <p className="text-muted-foreground mt-2">
            {userData?.colleges?.name || "Here's what's happening with your teams and projects."}
          </p>
        </div>
        <Button variant="destructive" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friends</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{friendsCount}</div>
            <p className="text-xs text-muted-foreground">Connections</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Events to join</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.year || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{userData?.branch || "No branch"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Teams */}
      <Card>
        <CardHeader>
          <CardTitle>My Teams</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No teams yet. Create or join a team to get started!</p>
          ) : (
            <div className="space-y-4">
              {teams.slice(0, 5).map((team) => (
                <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-sm text-muted-foreground">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                  <Badge variant={team.type === 'event' ? 'default' : 'secondary'}>
                    {team.type || 'custom'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming events</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.eventid} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"}
                    </p>
                  </div>
                  <Badge>{event.status || 'open'}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
