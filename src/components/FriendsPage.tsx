import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserCheck, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  college_id: string;
  year: number | null;
  branch: string | null;
  user_id: string;
}

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_details?: Student;
}

export function FriendsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<Student | null>(null);
  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get my profile
      const { data: profile } = await supabase
        .from("studentdetails")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      
      setMyProfile(profile);

      if (profile) {
        // Use AI to get semantically similar students
        const { data: aiData, error: aiError } = await supabase.functions.invoke(
          'find-similar-students',
          {
            body: { 
              userId: user!.id,
              collegeId: profile.college_id 
            }
          }
        );

        if (aiError) {
          console.error('AI matching error:', aiError);
          toast({
            title: "Error",
            description: "Failed to load AI-powered suggestions. Showing basic suggestions.",
            variant: "destructive",
          });
          
          // Fallback to basic sorting
          const { data: students } = await supabase
            .from("studentdetails")
            .select("*")
            .eq("college_id", profile.college_id)
            .neq("user_id", user!.id);

          const { data: friendships } = await supabase
            .from("friends")
            .select("*")
            .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`);

          const friendIds = new Set(
            friendships?.flatMap(f => [f.user_id, f.friend_id]) || []
          );

          const filtered = students?.filter(s => !friendIds.has(s.user_id)) || [];
          const sorted = filtered.sort((a, b) => {
            if (a.year === profile.year && b.year !== profile.year) return -1;
            if (a.year !== profile.year && b.year === profile.year) return 1;
            return 0;
          });
          setSuggestions(sorted);
        } else {
          setSuggestions(aiData?.rankedStudents || []);
        }

        // Load friends (accepted) with their details
        const { data: acceptedFriends } = await supabase
          .from("friends")
          .select("*")
          .eq("user_id", user!.id)
          .eq("status", "accepted");

        if (acceptedFriends) {
          const friendsWithDetails = await Promise.all(
            acceptedFriends.map(async (f) => {
              const { data: details } = await supabase
                .from("studentdetails")
                .select("*")
                .eq("user_id", f.friend_id)
                .single();
              return { ...f, friend_details: details };
            })
          );
          setFriends(friendsWithDetails);
        }

        // Load pending requests (received) with sender details
        const { data: pending } = await supabase
          .from("friends")
          .select("*")
          .eq("friend_id", user!.id)
          .eq("status", "pending");

        if (pending) {
          const pendingWithDetails = await Promise.all(
            pending.map(async (f) => {
              const { data: details } = await supabase
                .from("studentdetails")
                .select("*")
                .eq("user_id", f.user_id)
                .single();
              return { ...f, friend_details: details };
            })
          );
          setPendingRequests(pendingWithDetails);
        }

        // Load sent requests with receiver details
        const { data: sent } = await supabase
          .from("friends")
          .select("*")
          .eq("user_id", user!.id)
          .eq("status", "pending");

        if (sent) {
          const sentWithDetails = await Promise.all(
            sent.map(async (f) => {
              const { data: details } = await supabase
                .from("studentdetails")
                .select("*")
                .eq("user_id", f.friend_id)
                .single();
              return { ...f, friend_details: details };
            })
          );
          setSentRequests(sentWithDetails);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load friends data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendUserId: string) => {
    try {
      const { error } = await supabase
        .from("friends")
        .insert({
          user_id: user!.id,
          friend_id: friendUserId,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Friend request sent!",
        description: "They'll see your request in their messages.",
      });

      loadData();
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const acceptFriendRequest = async (requestId: string, friendUserId: string) => {
    try {
      // Update the request to accepted
      const { error: updateError } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Create reverse friendship
      const { error: insertError } = await supabase
        .from("friends")
        .insert({
          user_id: user!.id,
          friend_id: friendUserId,
          status: "accepted",
        });

      if (insertError) throw insertError;

      toast({
        title: "Friend request accepted!",
        description: "You are now friends.",
      });

      loadData();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Friend request declined",
      });

      loadData();
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="text-muted-foreground mt-2">
          Connect with students from your college
        </p>
      </div>

      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suggestions">
            You Might Wanna Know ({suggestions.length})
          </TabsTrigger>
          <TabsTrigger value="friends">
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No suggestions available at the moment
              </CardContent>
            </Card>
          ) : (
            suggestions.map((student) => (
              <Card key={student.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.branch && `${student.branch} • `}
                          {student.year && `Year ${student.year}`}
                          {student.year === myProfile?.year && (
                            <Badge variant="secondary" className="ml-2">Same Year</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => sendFriendRequest(student.user_id)}
                      disabled={sentRequests.some(r => r.friend_id === student.user_id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {sentRequests.some(r => r.friend_id === student.user_id) ? "Pending" : "Add Friend"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          {friends.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No friends yet. Start by sending some friend requests!
              </CardContent>
            </Card>
          ) : (
            friends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {friend.friend_details?.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{friend.friend_details?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {friend.friend_details?.branch && `${friend.friend_details.branch} • `}
                        {friend.friend_details?.year && `Year ${friend.friend_details.year}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No pending friend requests
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {request.friend_details?.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.friend_details?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.friend_details?.branch && `${request.friend_details.branch} • `}
                          {request.friend_details?.year && `Year ${request.friend_details.year}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => acceptFriendRequest(request.id, request.user_id)}
                        size="sm"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => declineFriendRequest(request.id)}
                        variant="outline"
                        size="sm"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
