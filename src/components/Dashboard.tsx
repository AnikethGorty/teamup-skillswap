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
  AlertCircle,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Dashboard() {
  const { user, signOut } = useAuth(); // ✅ include signOut
  const [dbError, setDbError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDbError("Could not connect to the database. UserDetails, EventDetails, and ChatLogs tables are not available.");
        setUserData(null);
        setTeams([]);
        setEvents([]);
        setFriends([]);
      } catch (error) {
        setDbError("Database connection failed. Please try again later.");
      }
    };

    loadDashboardData();
  }, []);

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName}! 👋</h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your teams and projects.
          </p>
        </div>
        {/* ✅ Logout button */}
        <Button variant="destructive" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Database Error Alert */}
      {dbError && (
        <Alert className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            {dbError}
          </AlertDescription>
        </Alert>
      )}

      {/* ... rest of your dashboard code unchanged ... */}
    </div>
  );
}
