// components/teacher/slot-management.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Trash2, Users, Edit } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getTimeSlots, saveTimeSlot, deleteTimeSlot, generateId, getBookings } from "@/lib/storage"
import type { TimeSlot, Booking } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DAILY_SCHEDULE, getAvailableSlots, formatSlotTime, isWeekday, type ScheduleSlot } from "@/lib/schedule"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SlotManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    date: "",
    selectedSlot: null as ScheduleSlot | null,
    capacity: 10,
  })

  useEffect(() => {
    loadData()
    // Set default date to today
    setFormData((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
    }))
  }, [user])

  const loadData = () => {
    if (!user) return

    const allTimeSlots = getTimeSlots()
    const allBookings = getBookings()

    // Filter time slots created by current teacher
    const teacherSlots = allTimeSlots.filter((slot) => slot.teacherId === user.id)

    setTimeSlots(teacherSlots)
    setBookings(allBookings)
  }

  const getBookedCount = (timeSlotId: string) => {
    return bookings.filter((booking) => booking.timeSlotId === timeSlotId && booking.status === "active").length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      // Validation
      if (!formData.date || !formData.selectedSlot) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Check if it's a weekday
      if (!isWeekday(formData.date)) {
        toast({
          title: "Invalid Date",
          description: "Gym slots are only available Monday through Friday.",
          variant: "destructive",
        })
        return
      }

      // Check if slot already exists for this date and time
      const existingSlot = timeSlots.find(
        (slot) =>
          slot.date === formData.date &&
          slot.startTime === formData.selectedSlot!.startTime &&
          slot.id !== editingSlot?.id,
      )

      if (existingSlot) {
        toast({
          title: "Slot Already Exists",
          description: "A time slot already exists for this date and time.",
          variant: "destructive",
        })
        return
      }

      const timeSlot: TimeSlot = {
        id: editingSlot?.id || generateId(),
        date: formData.date,
        startTime: formData.selectedSlot.startTime,
        endTime: formData.selectedSlot.endTime,
        capacity: formData.capacity,
        isAvailable: true,
        teacherId: user.id,
        createdAt: editingSlot?.createdAt || new Date().toISOString(),
      }

      saveTimeSlot(timeSlot)
      loadData()

      toast({
        title: editingSlot ? "Slot Updated" : "Slot Created",
        description: `Time slot for ${formData.date} has been ${editingSlot ? "updated" : "created"} successfully.`,
      })

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        selectedSlot: null,
        capacity: 10,
      })
      setEditingSlot(null)
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the time slot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot)
    const scheduleSlot = DAILY_SCHEDULE.find((s) => s.startTime === slot.startTime && s.endTime === slot.endTime)
    setFormData({
      date: slot.date,
      selectedSlot: scheduleSlot || null,
      capacity: slot.capacity,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (slotId: string) => {
    const bookedCount = getBookedCount(slotId)

    if (bookedCount > 0) {
      toast({
        title: "Cannot Delete",
        description: "This time slot has active bookings and cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    try {
      deleteTimeSlot(slotId)
      loadData()

      toast({
        title: "Slot Deleted",
        description: "Time slot has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the time slot. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
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

  const upcomingSlots = timeSlots.filter(isUpcoming).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`)
    const dateB = new Date(`${b.date}T${b.startTime}`)
    return dateA.getTime() - dateB.getTime()
  })

  const pastSlots = timeSlots
    .filter((slot) => !isUpcoming(slot))
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`)
      const dateB = new Date(`${b.date}T${b.startTime}`)
      return dateB.getTime() - dateA.getTime()
    })

  const availableSlots = formData.date ? getAvailableSlots(formData.date) : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Administrar bloques horarios
              </CardTitle>
              <CardDescription>Crea y administra bloques horarios (Solo de lunes a viernes)</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar clase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSlot ? "Edit Time Slot" : "Create New Time Slot"}</DialogTitle>
                  <DialogDescription>
                    {editingSlot ? "Update the time slot details." : "Add a new time slot for students to book."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value, selectedSlot: null }))}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                      {formData.date && !isWeekday(formData.date) && (
                        <p className="text-sm text-destructive">El gimansio solo esta abierto de lunes a viernes</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeSlot">Bloque horario</Label>
                      <Select
                        value={formData.selectedSlot?.id.toString() || ""}
                        onValueChange={(value) => {
                          const slot = availableSlots.find((s) => s.id.toString() === value)
                          setFormData((prev) => ({ ...prev, selectedSlot: slot || null }))
                        }}
                        disabled={!formData.date || !isWeekday(formData.date)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un bloque horario" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id.toString()}>
                              {slot.label}: {formatSlotTime(slot)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableSlots.length === 0 && formData.date && isWeekday(formData.date) && (
                        <p className="text-sm text-muted-foreground">No slots available for selected date</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidad</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setEditingSlot(null)
                        setFormData({
                          date: new Date().toISOString().split("T")[0],
                          selectedSlot: null,
                          capacity: 10,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : editingSlot ? "Update Slot" : "Create Slot"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Schedule Reference
          </CardTitle>
          <CardDescription>Fixed time slots available Monday through Friday</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
            {DAILY_SCHEDULE.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="font-medium">{slot.label}</span>
                <span className="text-muted-foreground">{formatSlotTime(slot)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * 45-minute sessions with 15-minute breaks. Extended break between Slot 7 and Slot 8 for lunch.
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Proximas clases
          </CardTitle>
          <CardDescription>Your scheduled time slots</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming time slots.</p>
              <p className="text-sm">Create your first time slot to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSlots.map((slot) => {
                const bookedCount = getBookedCount(slot.id)
                const scheduleSlot = DAILY_SCHEDULE.find(
                  (s) => s.startTime === slot.startTime && s.endTime === slot.endTime,
                )

                return (
                  <Card key={slot.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatDate(slot.date)}</span>
                            <Badge variant={bookedCount > 0 ? "default" : "secondary"}>
                              {bookedCount > 0 ? "Has Bookings" : "Available"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {scheduleSlot?.label || "Custom"}: {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {bookedCount} / {slot.capacity} inscritos
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(slot)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(slot.id)}
                            disabled={bookedCount > 0}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Slots */}
      {pastSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Past Slots
            </CardTitle>
            <CardDescription>Your completed time slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastSlots.slice(0, 5).map((slot) => {
                const bookedCount = getBookedCount(slot.id)
                const scheduleSlot = DAILY_SCHEDULE.find(
                  (s) => s.startTime === slot.startTime && s.endTime === slot.endTime,
                )

                return (
                  <Card key={slot.id} className="border-l-4 border-l-gray-300 opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatDate(slot.date)}</span>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {scheduleSlot?.label || "Custom"}: {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {bookedCount} / {slot.capacity} attended
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
