"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Clock, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getTimeSlots, getBookings, getUsers } from "@/lib/storage"
import type { TimeSlot, Booking, User as UserType } from "@/lib/types"

export function BookingOverview() {
  const { user } = useAuth()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<UserType[]>([])

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (!user) return

    const allTimeSlots = getTimeSlots()
    const allBookings = getBookings()
    const allUsers = getUsers()

    // Filter time slots created by current teacher
    const teacherSlots = allTimeSlots.filter((slot) => slot.teacherId === user.id)

    setTimeSlots(teacherSlots)
    setBookings(allBookings)
    setUsers(allUsers)
  }

  const getStudentName = (studentId: string) => {
    const student = users.find((u) => u.id === studentId)
    return student?.name || "Unknown Student"
  }

  const getSlotBookings = (timeSlotId: string) => {
    return bookings.filter((booking) => booking.timeSlotId === timeSlotId && booking.status === "active")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isUpcoming = (slot: TimeSlot) => {
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`)
    return slotDateTime > new Date()
  }

  const upcomingSlots = timeSlots
    .filter(isUpcoming)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`)
      const dateB = new Date(`${b.date}T${b.startTime}`)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 10)

  const totalActiveBookings = bookings.filter((booking) => {
    const slot = timeSlots.find((s) => s.id === booking.timeSlotId)
    return slot && booking.status === "active" && isUpcoming(slot)
  }).length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{upcomingSlots.length}</p>
                <p className="text-sm text-muted-foreground">Proximas clases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalActiveBookings}</p>
                <p className="text-sm text-muted-foreground">Inscripciones activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{timeSlots.length}</p>
                <p className="text-sm text-muted-foreground">Clases creadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Slots with Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Proximos bloques disponibles  y clases
          </CardTitle>
          <CardDescription> Estudiantes que han inscrito tus proximos bloques horarios</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sin sesiones proximas.</p>
              <p className="text-sm"> Cree bloques horarios para ver los estudiantes inscritos aqui.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingSlots.map((slot) => {
                const slotBookings = getSlotBookings(slot.id)

                return (
                  <Card key={slot.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatDate(slot.date)}</span>
                              <Badge variant={slotBookings.length > 0 ? "default" : "secondary"}>
                                {slotBookings.length} / {slot.capacity} inscritos
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {slotBookings.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Estudiantes asistiendo:</p>
                            <div className="flex flex-wrap gap-2">
                              {slotBookings.map((booking) => (
                                <Badge key={booking.id} variant="outline" className="gap-1">
                                  <User className="h-3 w-3" />
                                  {getStudentName(booking.studentId)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {slotBookings.length === 0 && (
                          <p className="text-sm text-muted-foreground italic"> Ningun estudiante ha inscrito este bloque aun.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
