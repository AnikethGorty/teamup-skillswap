"use client"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TeamRegisterPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Team Registration
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 text-center">
          <p className="text-gray-600 mb-4">
            You can either create a new team for this event or join an existing one.
          </p>

          <Button
            className="w-full"
            onClick={() => navigate(`/createteam/${eventId}`)}
          >
            Create Your Own Team
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/jointeam/${eventId}`)}
          >
            Join an Existing Team
          </Button>

          <Button
            variant="ghost"
            className="w-full text-gray-500 mt-2"
            onClick={() => navigate("/events")}
          >
            Back to Events
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
