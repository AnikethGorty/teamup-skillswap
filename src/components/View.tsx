"use client"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type Event = {
  eventid: string
  name: string
  description: string
  date: string
  location: string
  participants?: string[]
  joined_by_teams?: string[]
}

type Student = {
  userid: string
  name: string
  collegeid: string
}

type Team = {
  teamid: string
  name: string
}

type College = {
  collegeid: string
  name: string
}

export default function ViewEventPage() {
  const { eventId } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [individuals, setIndividuals] = useState<{ name: string; college: string }[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch event
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("eventid", eventId)
          .single()
        if (eventError) throw eventError

        // Fetch colleges (needed only for individuals)
        const { data: collegesData } = await supabase.from("colleges").select("*")
        const collegesMap: Record<string, string> = {}
        collegesData?.forEach((c) => {
          collegesMap[c.id] = c.name
        })

        // Fetch individuals
        let individualList: { name: string; college: string }[] = []
        if (eventData?.joined_by_individuals?.length) {
          const { data: students } = await supabase
            .from("studentdetails")
            .select("user_id,name,college_id")
            .in("user_id", eventData.joined_by_individuals)
          individualList = students?.map((s) => ({
            name: s.name,
            college: collegesMap[s.college_id] || "Unknown College",
          })) || []
        }

        // Fetch teams
        let teamList: Team[] = []
        if (eventData?.joined_by_teams?.length) {
          const { data: teamsData } = await supabase
            .from("teams")
            .select("id,name")
            .in("id", eventData.joined_by_teams)
          teamList = teamsData?.map((t) => ({ teamid: t.id, name: t.name })) || []
        }

        setEvent(eventData)
        setIndividuals(individualList)
        setTeams(teamList)
      } catch (err) {
        console.error(err)
        setError("Could not fetch event details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId])

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>
  if (error) return <p className="p-6 text-red-500">{error}</p>
  if (!event) return <p className="p-6 text-gray-500">Event not found.</p>

  return (
    <div className="flex flex-col p-6">
      <Card className="shadow-sm w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>{event.description}</p>
          <p className="text-sm text-gray-500">
            📍 {event.location} | 🗓️ {new Date(event.date).toLocaleString()}
          </p>

          {individuals.length > 0 && (
            <div>
              <h3 className="font-semibold mt-4">Individuals Registered</h3>
              <ul className="list-disc list-inside">
                {individuals.map((i) => (
                  <li key={i.name}>
                    {i.name} ({i.college})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {teams.length > 0 && (
            <div>
              <h3 className="font-semibold mt-4">Teams Registered</h3>
              <ul className="list-disc list-inside">
                {teams.map((t) => (
                  <li key={t.teamid}>{t.name}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
