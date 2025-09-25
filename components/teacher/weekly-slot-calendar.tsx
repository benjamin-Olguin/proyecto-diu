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

    // Filter time slots created by current teacher
    const teacherSlots = allTimeSlots.filter((slot) => slot.teacherId === user.id)

    setTimeSlots(teacherSlots)
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
        label: date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
        fullLabel: date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
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

    if (existingSlot) {
      // If slot exists, show options to edit or delete
      setSelectedSlot({ date, scheduleSlot })
      setCapacity(existingSlot.capacity)
      setIsDialogOpen(true)
    } else {
      // If slot doesn't exist, create it
      setSelectedSlot({ date, scheduleSlot })
      setCapacity(10)
      setIsDialogOpen(true)
    }
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
        title: "Slot Created",
        description: `Time slot for ${selectedSlot.scheduleSlot.label} on ${selectedSlot.date} has been created.`,
      })

      setIsDialogOpen(false)
      setSelectedSlot(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error creating the time slot. Please try again.",
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
        title: "Slot Updated",
        description: `Time slot capacity has been updated to ${capacity}.`,
      })

      setIsDialogOpen(false)
      setSelectedSlot(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the time slot. Please try again.",
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
        title: "Cannot Delete",
        description: "This time slot has active bookings and cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      deleteTimeSlot(existingSlot.id)
      loadData()

      toast({
        title: "Slot Deleted",
        description: "Time slot has been deleted successfully.",
      })

      setIsDialogOpen(false)
      setSelectedSlot(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the time slot. Please try again.",
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
                Weekly Schedule
              </CardTitle>
              <CardDescription>Click on time slots to assign or cancel classes for the week</CardDescription>
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
            <div className="font-medium text-sm text-muted-foreground p-2">Time</div>
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
                  const existingSlot = getSlotForDateTime(day.date, scheduleSlot)
                  const bookedCount = existingSlot ? getBookedCount(existingSlot.id) : 0
                  const isPast = new Date(`${day.date}T${scheduleSlot.endTime}`) < new Date()

                  return (
                    <div key={`${day.date}-${scheduleSlot.id}`} className="p-1">
                      <Button
                        variant={existingSlot ? "default" : "outline"}
                        size="sm"
                        className={`w-full h-16 flex flex-col gap-1 text-xs ${
                          isPast ? "opacity-50" : ""
                        } ${existingSlot ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => !isPast && handleSlotClick(day.date, scheduleSlot)}
                        disabled={isPast}
                      >
                        {existingSlot ? (
                          <>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>
                                {bookedCount}/{existingSlot.capacity}
                              </span>
                            </div>
                            <span>Assigned</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
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

      {/* Dialog for slot management */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{existingSlot ? "Manage Time Slot" : "Create Time Slot"}</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  {selectedSlot.scheduleSlot.label}: {formatSlotTime(selectedSlot.scheduleSlot)} on{" "}
                  {new Date(selectedSlot.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
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
                    Current bookings: {getBookedCount(existingSlot.id)} / {existingSlot.capacity}
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
              Cancel
            </Button>

            {existingSlot && (
              <Button
                variant="destructive"
                onClick={handleDeleteSlot}
                disabled={isLoading || getBookedCount(existingSlot.id) > 0}
              >
                <X className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}

            <Button onClick={existingSlot ? handleUpdateSlot : handleCreateSlot} disabled={isLoading}>
              {isLoading ? "Saving..." : existingSlot ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
