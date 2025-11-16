"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Users } from "lucide-react"
import { getTimeSlots, saveTimeSlot, deleteTimeSlot, generateId, getBookings, getUsers } from "@/lib/storage"
import type { TimeSlot, Booking, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { DAILY_SCHEDULE, formatSlotTime, type ScheduleSlot } from "@/lib/schedule"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function WeeklySlotCalendar() {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; scheduleSlot: ScheduleSlot } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [capacity, setCapacity] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    const users = getUsers()
    const teacherUser = users.find((u) => u.role === "teacher") || {
      id: "demo-teacher",
      email: "teacher@gym.com",
      name: "Demo Teacher",
      role: "teacher" as const,
      createdAt: new Date().toISOString(),
    }
    setUser(teacherUser)
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, currentWeek])

  const loadData = () => {
    if (!user) return

    const allTimeSlots = getTimeSlots()
    const allBookings = getBookings()

    const teacherSlots = allTimeSlots.filter((slot) => slot.teacherId === user.id)

    setTimeSlots(teacherSlots)
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

  const handleSlotClick = (date: string, scheduleSlot: ScheduleSlot) => {
    const existingSlot = getSlotForDateTime(date, scheduleSlot)

    setSelectedSlot({ date, scheduleSlot })
    setCapacity(existingSlot ? existingSlot.capacity : 10)
    setIsDialogOpen(true)
  }

  const handleCreateSlot = async () => {
    if (!user || !selectedSlot) return

    setIsLoading(true)

    try {
      const timeSlot: TimeSlot = {
        id: generateId(),
        date: selectedSlot.date,
        startTime: selectedSlot.scheduleSlot.startTime,
        endTime: selectedSlot.scheduleSlot.endTime,
        capacity: capacity,
        isAvailable: true,
        teacherId: user.id,
        createdAt: new Date().toISOString(),
      }

      saveTimeSlot(timeSlot)
      loadData()

      toast({
        title: "Clase creada",
        description: `Se habilitó el bloque ${selectedSlot.scheduleSlot.label} para el ${selectedSlot.date}.`,
      })

      setIsDialogOpen(false)
      setSelectedSlot(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un problema al crear el bloque. Inténtalo nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSlot = async () => {
    if (!user || !selectedSlot) return

    const existingSlot = getSlotForDateTime(selectedSlot.date, selectedSlot.scheduleSlot)
    if (!existingSlot) return

    setIsLoading(true)

    try {
      const updatedSlot: TimeSlot = {
        ...existingSlot,
        capacity: capacity,
      }

      saveTimeSlot(updatedSlot)
      loadData()

      toast({
        title: "Capacidad actualizada",
        description: `La capacidad del bloque se actualizó a ${capacity} estudiantes.`,
      })

      setIsDialogOpen(false)
      setSelectedSlot(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un problema al actualizar el bloque.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return

    const existingSlot = getSlotForDateTime(selectedSlot.date, selectedSlot.scheduleSlot)
    if (!existingSlot) return

    const bookedCount = getBookedCount(existingSlot.id)

    if (bookedCount > 0) {
      toast({
        title: "No se puede eliminar",
        description: "Este bloque tiene inscripciones activas y no puede ser eliminado.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      deleteTimeSlot(existingSlot.id)
      loadData()

      toast({
        title: "Bloque eliminado",
        description: "El bloque fue eliminado correctamente.",
      })

      setIsDialogOpen(false)
      setSelectedSlot(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un problema al eliminar el bloque.",
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
  const existingSlot = selectedSlot ? getSlotForDateTime(selectedSlot.date, selectedSlot.scheduleSlot) : null

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
                Haz clic en un <span className="font-semibold">bloque vacío</span> para{" "}
                <span className="font-semibold">habilitar una clase</span> y en un{" "}
                <span className="font-semibold">bloque azul</span> para{" "}
                <span className="font-semibold">editar la capacidad o eliminar la clase</span>.
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
            <div className="font-medium text-sm text-muted-foreground p-2">Bloques</div>
            {weekDays.map((day) => (
              <div key={day.date} className="font-medium text-sm text-center p-2">
                {day.label}
              </div>
            ))}

            {DAILY_SCHEDULE.map((scheduleSlot) => (
              <div key={scheduleSlot.id} className="contents">
                <div className="text-xs p-2 border-r flex flex-col justify-center">
                  <div className="font-medium">{scheduleSlot.label}</div>
                  <div className="text-muted-foreground">{formatSlotTime(scheduleSlot)}</div>
                </div>
                {weekDays.map((day) => {
                  const slot = getSlotForDateTime(day.date, scheduleSlot)
                  const bookedCount = slot ? getBookedCount(slot.id) : 0
                  const isPast = new Date(`${day.date}T${scheduleSlot.endTime}`) < new Date()

                  return (
                    <div key={`${day.date}-${scheduleSlot.id}`} className="p-1">
                      <Button
                        variant={slot ? "default" : "outline"}
                        size="sm"
                        className={`w-full h-16 flex flex-col gap-1 text-xs ${
                          isPast ? "opacity-50" : ""
                        } ${slot ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => !isPast && handleSlotClick(day.date, scheduleSlot)}
                        disabled={isPast}
                      >
                        {slot ? (
                          <>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>
                                {bookedCount}/{slot.capacity}
                              </span>
                            </div>
                            <span>Asignada</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Agregar</span>
                          </>
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

      {/* Dialogo de gestión del bloque */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{existingSlot ? "Administrar bloque" : "Crear bloque"}</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  Bloque <strong>{selectedSlot.scheduleSlot.label}</strong> (
                  {formatSlotTime(selectedSlot.scheduleSlot)}) el{" "}
                  {new Date(selectedSlot.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                  .
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad de estudiantes</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(Number.parseInt(e.target.value))}
                required
              />
            </div>

            {existingSlot && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>
                    Inscripciones actuales: {getBookedCount(existingSlot.id)} / {existingSlot.capacity}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setSelectedSlot(null)
              }}
            >
              Cerrar
            </Button>

            {existingSlot && (
              <Button
                variant="destructive"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isLoading || getBookedCount(existingSlot.id) > 0}
              >
                <X className="h-4 w-4 mr-1" />
                Borrar bloque
              </Button>
            )}

            <Button onClick={existingSlot ? handleUpdateSlot : handleCreateSlot} disabled={isLoading}>
              {isLoading ? "Guardando..." : existingSlot ? "Actualizar bloque" : "Crear bloque"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación extra para eliminar */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          void handleDeleteSlot()
        }}
        title="Confirmar eliminación"
        description={
          <>
            Si eliminas este bloque, las horas dejarán de estar disponibles para los estudiantes. Esta acción no se
            puede deshacer.
          </>
        }
        confirmLabel="Eliminar bloque"
        cancelLabel="Cancelar"
        destructive
      />
    </div>
  )
}
