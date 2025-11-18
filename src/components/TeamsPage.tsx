import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin,
  Star,
  Clock,
  Filter,
  Plus
} from "lucide-react";

export function TeamsPage() {
  // Empty arrays for now — will fetch from DB later
  const teams: any[] = [];
  const events: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teams & Events</h1>
          <p className="text-muted-foreground mt-2">
            Discover amazing teams to join or exciting events to participate in.
          </p>
        </div>
        <Button variant="hero">
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search teams, skills, or projects..." 
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Teams</h2>
        {teams.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No teams available right now
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{team.type}</Badge>
                        <Badge variant="secondary">{team.difficulty}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{team.description}</p>

                  {/* Team Members */}
                  <div>
                    <p className="text-sm font-medium mb-2">Team Members ({team.members.length})</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {team.members.map((member: any) => (
                          <Avatar key={member.name} className="h-8 w-8 border-2 border-background">
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        +{team.neededRoles.length} more needed
                      </span>
                    </div>
                  </div>

                  {/* Needed Roles */}
                  <div>
                    <p className="text-sm font-medium mb-2">Looking for:</p>
                    <div className="flex flex-wrap gap-1">
                      {team.neededRoles.map((role: string) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-sm font-medium mb-2">Tech Stack:</p>
                    <div className="flex flex-wrap gap-1">
                      {team.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {team.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due {team.deadline}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {team.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs bg-primary/5">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="hero" className="flex-1">
                      Join Team
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Events Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No upcoming events right now
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.name} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <p className="text-muted-foreground">{event.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Participants</p>
                      <p className="text-sm text-muted-foreground">{event.participants} registered</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Prizes</p>
                      <p className="text-sm text-muted-foreground">{event.prizes}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {event.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="hero" className="flex-1">
                      Register Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      More Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
