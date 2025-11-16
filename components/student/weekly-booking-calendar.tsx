"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Users, CheckCircle, XCircle } from "lucide-react"
import { getTimeSlots, getBookings, saveBooking, generateId, getUsers } from "@/lib/storage"
import type { TimeSlot, Booking, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { DAILY_SCHEDULE, formatSlotTime, type ScheduleSlot } from "@/lib/schedule"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type PendingAction =
  | { type: "book"; slot: TimeSlot }
  | { type: "cancel"; slot: TimeSlot }
  | null

export function WeeklyBookingCalendar() {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // para el pop-up de confirmación
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

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
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    const weekDays = []
    for (let i = 0; i < 5; i++) {
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
        title: "Inscripción confirmada",
        description: `Te has inscrito en el bloque ${timeSlot.startTime} - ${timeSlot.endTime}.`,
      })
    } catch (error) {
      toast({
        title: "Error en la inscripción",
        description: "Ha ocurrido un error al procesar tu inscripción. Por favor, inténtalo nuevamente.",
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
          title: "Inscripción cancelada",
          description: "Tu inscripción ha sido cancelada correctamente.",
        })
      }
    } catch (error) {
      toast({
        title: "Error al cancelar",
        description: "Hubo un problema al cancelar tu inscripción. Inténtalo nuevamente.",
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

  const confirmTitle =
    pendingAction?.type === "book"
      ? "Confirmar inscripción"
      : pendingAction?.type === "cancel"
        ? "Confirmar cancelación"
        : ""

  const confirmDescription =
    pendingAction && pendingAction.slot
      ? pendingAction.type === "book"
        ? `¿Quieres inscribirte en este bloque del gimnasio DEFIDER? 
Bloque ${pendingAction.slot.startTime} - ${pendingAction.slot.endTime}.`
        : `¿Seguro que quieres cancelar tu inscripción en el bloque ${pendingAction.slot.startTime} - ${pendingAction.slot.endTime}? 
Tu cupo quedará disponible para otro estudiante.`
      : null

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
              <CardDescription>
                Elige un bloque disponible para{" "}
                <span className="font-semibold">inscribirte</span> o, si ya estás inscrito, para{" "}
                <span className="font-semibold">cancelar</span> tu asistencia.
              </CardDescription>
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
                          {isPast ? "Finalizó" : "No disponible"}
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
                            setPendingAction({ type: "cancel", slot: availableSlot })
                          } else if (canBook) {
                            setPendingAction({ type: "book", slot: availableSlot })
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

      {/* Leyenda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Bloques donde ya estás inscrito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-300 rounded" />
              <span>Bloques disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
              <span>Capacidad completa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-dashed border-gray-300 rounded" />
              <span>No disponible / ya pasó</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        open={pendingAction !== null}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={pendingAction?.type === "cancel" ? "Cancelar clase" : "Confirmar inscripción"}
        cancelLabel={pendingAction?.type === "cancel" ? "Volver atrás" : "No inscribirme"}
        destructive={pendingAction?.type === "cancel"}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          if (!pendingAction) return
          if (pendingAction.type === "book") {
            void handleBookSlot(pendingAction.slot)
          } else {
            void handleCancelBooking(pendingAction.slot.id)
          }
        }}
      />
    </div>
  )
}
