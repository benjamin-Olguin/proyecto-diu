"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getTimeSlots, getBookings, saveBooking, generateId } from "@/lib/storage"
import type { TimeSlot, Booking } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { DAILY_SCHEDULE, isWeekday } from "@/lib/schedule"

export function BookingCalendar() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = () => {
    const allTimeSlots = getTimeSlots()
    const allBookings = getBookings()

    // Filter time slots for selected date
    const slotsForDate = allTimeSlots.filter((slot) => slot.date === selectedDate && slot.isAvailable)

    setTimeSlots(slotsForDate)
    setBookings(allBookings)
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
        title: "Booking Confirmed",
        description: `You've successfully booked the ${timeSlot.startTime} - ${timeSlot.endTime} slot.`,
      })
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
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

  const getNextSevenDays = () => {
    const days = []
    const today = new Date()
    let daysAdded = 0
    const currentDate = new Date(today)

    while (daysAdded < 7) {
      const dateString = currentDate.toISOString().split("T")[0]

      // Only add weekdays
      if (isWeekday(dateString)) {
        days.push({
          date: dateString,
          label: currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          isToday: currentDate.toDateString() === today.toDateString(),
        })
        daysAdded++
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
          <CardDescription>Choose a weekday to view available time slots (Monday-Friday only)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {getNextSevenDays().map((day) => (
              <Button
                key={day.date}
                variant={selectedDate === day.date ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(day.date)}
                className="flex-shrink-0"
              >
                {day.label}
                {day.isToday && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Today
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
          <CardDescription>
            Showing slots for{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isWeekday(selectedDate) ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Gym is closed on weekends.</p>
              <p className="text-sm">Please select a weekday (Monday-Friday).</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No time slots available for this date.</p>
              <p className="text-sm">Check back later or select a different date.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timeSlots
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((slot) => {
                  const bookedCount = getBookedCount(slot.id)
                  const isBookedByUser = isSlotBookedByUser(slot.id)
                  const isFull = bookedCount >= slot.capacity
                  const canBook = !isBookedByUser && !isFull

                  const scheduleSlot = DAILY_SCHEDULE.find(
                    (s) => s.startTime === slot.startTime && s.endTime === slot.endTime,
                  )

                  return (
                    <Card key={slot.id} className={`${isBookedByUser ? "ring-2 ring-green-500" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{scheduleSlot?.label || "Custom Slot"}</div>
                            <div className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                          {isBookedByUser && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Booked
                            </Badge>
                          )}
                          {isFull && !isBookedByUser && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Full
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Users className="h-4 w-4" />
                          <span>
                            {bookedCount} / {slot.capacity} spots filled
                          </span>
                        </div>

                        {isBookedByUser ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBooking(slot.id)}
                            disabled={isLoading}
                            className="w-full text-destructive hover:text-destructive"
                          >
                            Cancel Booking
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleBookSlot(slot)}
                            disabled={!canBook || isLoading}
                            className="w-full"
                          >
                            {isFull ? "Fully Booked" : "Book Slot"}
                          </Button>
                        )}
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
