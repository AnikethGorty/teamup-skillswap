// src/components/Registration.tsx
"use client"
import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function RegistrationPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const joinAsIndividual = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join this event",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Fetch current event
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("joined_by_individuals, max_participants, registration_deadline, status")
      .eq("eventid", eventId)
      .single()

    if (fetchError) {
      toast({
        title: "Error",
        description: "Event not found",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Validate registration eligibility
    if (event.status !== 'open') {
      toast({
        title: "Registration closed",
        description: "Event registration is no longer open",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      toast({
        title: "Deadline passed",
        description: "Registration deadline has passed",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Check if already joined
    const currentIndividuals = event.joined_by_individuals || []
    if (currentIndividuals.includes(user.id)) {
      toast({
        title: "Already registered",
        description: "You have already joined this event",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Check capacity
    if (event.max_participants && currentIndividuals.length >= event.max_participants) {
      toast({
        title: "Event full",
        description: "This event has reached maximum capacity",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Add user to the event
    const { error } = await supabase
      .from("events")
      .update({
        joined_by_individuals: [...currentIndividuals, user.id],
      })
      .eq("eventid", eventId)

    setLoading(false)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to join event",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success!",
        description: "Successfully joined the event",
      })
      navigate("/events")
    }
  }

  const joinAsTeam = () => {
    navigate(`/teamregister/${eventId}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Join Event
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            onClick={joinAsIndividual}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Registering..." : "Join as Individual"}
          </Button>

          <Button
            onClick={joinAsTeam}
            className="w-full"
            variant="secondary"
          >
            Join as Team
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
