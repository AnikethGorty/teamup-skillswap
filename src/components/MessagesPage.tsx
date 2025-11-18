import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Plus,
  Smile,
  Paperclip
} from "lucide-react";

export function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // These will come from your DB later
  const conversations: any[] = [];
  const messages: any[] = [];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

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
          <ScrollArea className="h-96">
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
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-card-hover"
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>
                          {conversation.avatar}
                        </AvatarFallback>
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
                      <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
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
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Chat Name</h3>
                    <p className="text-sm text-muted-foreground">Participants info</p>
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
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      No messages yet
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        {!msg.isOwn && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{msg.avatar}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex-1 max-w-md ${msg.isOwn ? 'text-right' : ''}`}>
                          {!msg.isOwn && (
                            <p className="text-sm font-medium mb-1">{msg.sender}</p>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              msg.isOwn
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-12"
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="hero" size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
