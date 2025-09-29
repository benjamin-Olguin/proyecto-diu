"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Users, CheckCircle, XCircle } from "lucide-react"
import { getTimeSlots, getBookings, saveBooking, generateId, getUsers } from "@/lib/storage"
import type { TimeSlot, Booking, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { DAILY_SCHEDULE, formatSlotTime, type ScheduleSlot } from "@/lib/schedule"

export function WeeklyBookingCalendar() {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const users = getUsers()
    const studentUser = users.find((u) => u.role === "student") || {
      id: "demo-student",
      email: "student@gym.com",
      name: "Demo Student",
      role: "student" as const,
      createdAt: new Date().toISOString(),
    }
    setUser(studentUser)
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [currentWeek, user])

  const loadData = () => {
    const allTimeSlots = getTimeSlots()
    const allBookings = getBookings()

    setTimeSlots(allTimeSlots.filter((slot) => slot.isAvailable))
    setBookings(allBookings)
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    startOfWeek.setDate(diff)

    const weekDays = []
    for (let i = 0; i < 5; i++) {
      // Only Monday to Friday
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDays.push({
        date: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
        fullLabel: date.toLocaleDateString("es-ES", { weekday: "long", month: "short", day: "numeric" }),
      })
    }
    return weekDays
  }

  const getSlotForDateTime = (date: string, scheduleSlot: ScheduleSlot) => {
    return timeSlots.find(
      (slot) =>
        slot.date === date && slot.startTime === scheduleSlot.startTime && slot.endTime === scheduleSlot.endTime,
    )
  }

  const getBookedCount = (timeSlotId: string) => {
    return bookings.filter((booking) => booking.timeSlotId === timeSlotId && booking.status === "active").length
  }

  const isSlotBookedByUser = (timeSlotId: string) => {
    return bookings.some(
      (booking) => booking.timeSlotId === timeSlotId && booking.studentId === user?.id && booking.status === "active",
    )
  }

  const handleBookSlot = async (timeSlot: TimeSlot) => {
    if (!user) return

    setIsLoading(true)

    try {
      const newBooking: Booking = {
        id: generateId(),
        studentId: user.id,
        timeSlotId: timeSlot.id,
        status: "active",
        createdAt: new Date().toISOString(),
      }

      saveBooking(newBooking)
      loadData()

      toast({
        title: "Inscripcion aceptada",
        description: `Te has inscrito exitosamente a la clase del bloque ${timeSlot.startTime} - ${timeSlot.endTime} .`,
      })
    } catch (error) {
      toast({
        title: "Error en la inscripción",
        description: " Ha ocurrido un error al procesar tu inscripcion. Por favor intentelo de nuevo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (timeSlotId: string) => {
    if (!user) return

    setIsLoading(true)

    try {
      const booking = bookings.find(
        (b) => b.timeSlotId === timeSlotId && b.studentId === user.id && b.status === "active",
      )

      if (booking) {
        const updatedBooking: Booking = {
          ...booking,
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
        }

        saveBooking(updatedBooking)
        loadData()

        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled.",
        })
      }
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const weekDays = getWeekDays()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
               Horario semanal
              </CardTitle>
              <CardDescription>Ve e inscribete en un bloque disponible esta semana</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {weekDays[0]?.fullLabel} - {weekDays[4]?.fullLabel}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {/* Header row */}
            <div className="font-medium text-sm text-muted-foreground p-2">Bloques</div>
            {weekDays.map((day) => (
              <div key={day.date} className="font-medium text-sm text-center p-2">
                {day.label}
              </div>
            ))}

            {/* Time slot rows */}
            {DAILY_SCHEDULE.map((scheduleSlot) => (
              <div key={scheduleSlot.id} className="contents">
                <div className="text-xs p-2 border-r flex flex-col justify-center">
                  <div className="font-medium">{scheduleSlot.label}</div>
                  <div className="text-muted-foreground">{formatSlotTime(scheduleSlot)}</div>
                </div>
                {weekDays.map((day) => {
                  const availableSlot = getSlotForDateTime(day.date, scheduleSlot)
                  const isPast = new Date(`${day.date}T${scheduleSlot.endTime}`) < new Date()

                  if (!availableSlot || isPast) {
                    return (
                      <div key={`${day.date}-${scheduleSlot.id}`} className="p-1">
                        <div className="w-full h-16 border border-dashed border-gray-300 rounded flex items-center justify-center text-xs text-muted-foreground">
                          {isPast ? "Past" : "Not Available"}
                        </div>
                      </div>
                    )
                  }

                  const bookedCount = getBookedCount(availableSlot.id)
                  const isBookedByUser = isSlotBookedByUser(availableSlot.id)
                  const isFull = bookedCount >= availableSlot.capacity
                  const canBook = !isBookedByUser && !isFull

                  return (
                    <div key={`${day.date}-${scheduleSlot.id}`} className="p-1">
                      <Button
                        variant={isBookedByUser ? "default" : "outline"}
                        size="sm"
                        className={`w-full h-16 flex flex-col gap-1 text-xs ${
                          isBookedByUser
                            ? "bg-green-500 hover:bg-green-600"
                            : isFull
                              ? "bg-red-100 hover:bg-red-100 cursor-not-allowed"
                              : ""
                        }`}
                        onClick={() => {
                          if (isBookedByUser) {
                            handleCancelBooking(availableSlot.id)
                          } else if (canBook) {
                            handleBookSlot(availableSlot)
                          }
                        }}
                        disabled={isLoading || (!canBook && !isBookedByUser)}
                      >
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {bookedCount}/{availableSlot.capacity}
                          </span>
                        </div>
                        {isBookedByUser ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Inscrito</span>
                          </div>
                        ) : isFull ? (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            <span>Lleno</span>
                          </div>
                        ) : (
                          <span>Inscribir</span>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Tus inscripciones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-300 rounded"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Inscripciones llenas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-dashed border-gray-300 rounded"></div>
              <span>No disponible</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
