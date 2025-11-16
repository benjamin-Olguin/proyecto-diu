"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Clock, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getTimeSlots, getBookings, saveBooking } from "@/lib/storage"
import type { TimeSlot, Booking } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function MyBookings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // para confirmar cancelación
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (!user) return

    const allBookings = getBookings()
    const allTimeSlots = getTimeSlots()

    const userBookings = allBookings.filter((booking) => booking.studentId === user.id)

    setBookings(userBookings)
    setTimeSlots(allTimeSlots)
  }

  const getTimeSlotDetails = (timeSlotId: string) => {
    return timeSlots.find((slot) => slot.id === timeSlotId)
  }

  const handleCancelBooking = async (booking: Booking) => {
    setIsLoading(true)

    try {
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

  const activeBookings = bookings.filter((booking) => booking.status === "active")
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isUpcoming = (timeSlot: TimeSlot) => {
    const slotDateTime = new Date(`${timeSlot.date}T${timeSlot.startTime}`)
    return slotDateTime > new Date()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Inscripciones activas
          </CardTitle>
          <CardDescription>Revisa y, si lo necesitas, cancela tus clases agendadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes inscripciones activas.</p>
              <p className="text-sm">Inscríbete en un bloque desde el horario semanal para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => {
                const timeSlot = getTimeSlotDetails(booking.timeSlotId)
                if (!timeSlot) return null

                const upcoming = isUpcoming(timeSlot)

                return (
                  <Card key={booking.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(timeSlot.date)}</span>
                            {upcoming ? <Badge variant="default">Próxima</Badge> : <Badge variant="secondary">Pasada</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Inscrito el {new Date(booking.createdAt).toLocaleDateString("es-ES")}
                          </p>
                        </div>

                        {upcoming && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBookingToCancel(booking)}
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
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

      {cancelledBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Inscripciones canceladas
            </CardTitle>
            <CardDescription>Historial de clases que has cancelado.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cancelledBookings.slice(0, 5).map((booking) => {
                const timeSlot = getTimeSlotDetails(booking.timeSlotId)
                if (!timeSlot) return null

                return (
                  <Card key={booking.id} className="border-l-4 border-l-red-500 opacity-75">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDate(timeSlot.date)}</span>
                          <Badge variant="destructive">Cancelada</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Cancelada el{" "}
                          {booking.cancelledAt && new Date(booking.cancelledAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmación de cancelación */}
      <ConfirmDialog
        open={bookingToCancel !== null}
        onClose={() => setBookingToCancel(null)}
        onConfirm={() => {
          if (bookingToCancel) {
            void handleCancelBooking(bookingToCancel)
          }
        }}
        title="Confirmar cancelación"
        description={
          bookingToCancel && (
            <>
              ¿Seguro que quieres cancelar esta inscripción? Tu cupo se liberará y podrá ser utilizado por otra persona.
            </>
          )
        }
        confirmLabel="Cancelar clase"
        cancelLabel="Mantener inscripción"
        destructive
      />
    </div>
  )
}
