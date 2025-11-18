import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  UserCheck,
  UserX,
  Plus,
} from 'lucide-react';

interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_details?: {
    name: string;
    email: string;
    year: number | null;
    branch: string | null;
  };
}

export function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (user) {
      loadFriendRequests();
    }
  }, [user]);

  const loadFriendRequests = async () => {
    try {
      const { data: pending } = await supabase
        .from('friends')
        .select('*')
        .eq('friend_id', user!.id)
        .eq('status', 'pending');

      if (pending) {
        const pendingWithDetails = await Promise.all(
          pending.map(async (f) => {
            const { data: details } = await supabase
              .from('studentdetails')
              .select('*')
              .eq('user_id', f.user_id)
              .single();
            return { ...f, friend_details: details };
          })
        );
        setFriendRequests(pendingWithDetails);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const acceptFriendRequest = async (requestId: string, friendUserId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('friends')
        .insert({
          user_id: user!.id,
          friend_id: friendUserId,
          status: 'accepted',
        });

      if (insertError) throw insertError;

      toast({
        title: 'Friend request accepted!',
        description: 'You are now friends.',
      });

      loadFriendRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept friend request',
        variant: 'destructive',
      });
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from('friends').delete().eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Friend request declined',
      });

      loadFriendRequests();
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline friend request',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const conversations: any[] = [];
  const messages: any[] = [];

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Conversations List */}
      <Card className="w-80 bg-gradient-card border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            Messages
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            {/* Friend Requests Section */}
            {friendRequests.length > 0 && (
              <div className="p-4 border-b bg-accent/10">
                <h3 className="text-sm font-semibold mb-3">Friend Requests</h3>
                <div className="space-y-2">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 bg-card rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {request.friend_details?.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{request.friend_details?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.friend_details?.year && `Year ${request.friend_details.year}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acceptFriendRequest(request.id, request.user_id)}
                          className="h-7 w-7 p-0"
                        >
                          <UserCheck className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => declineFriendRequest(request.id)}
                          className="h-7 w-7 p-0"
                        >
                          <UserX className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1 p-4 pt-0">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No conversations yet
                </p>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedChat === conversation.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-card-hover'
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{conversation.avatar}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.name}</p>
                        <span className="text-xs opacity-70">{conversation.time}</span>
                      </div>
                      <p className="text-sm opacity-70 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 bg-gradient-card border-0 shadow-md flex flex-col">
        {selectedChat === null ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">John Doe</h3>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender === 'me'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <CardContent className="border-t border-border p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
