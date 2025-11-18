"use client"
import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { z } from "zod"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const teamSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Team name must be at least 3 characters")
    .max(100, "Team name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s-_]+$/, "Team name can only contain letters, numbers, spaces, hyphens, and underscores"),
})

export default function CreateTeamPage() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [teamName, setTeamName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a team",
        variant: "destructive",
      })
      return
    }

    // Validate input
    const validation = teamSchema.safeParse({ name: teamName })
    if (!validation.success) {
      toast({
        title: "Invalid team name",
        description: validation.error.issues[0].message,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const { error } = await supabase.from("teams").insert([
      {
        name: validation.data.name,
        created_by: user.id,
        members: [user.id],
        description: "New team created via registration",
        location: "TBD",
        deadline: null,
        skills: [],
        neededroles: [],
        tags: [],
        type: "custom",
        difficulty: "medium",
        event_id: eventId,
        createdat: new Date().toISOString(),
      },
    ])

    setLoading(false)
    if (error) {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success!",
        description: "Team created successfully",
      })
      navigate("/events")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Create a Team
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Team"}
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full text-gray-500"
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
