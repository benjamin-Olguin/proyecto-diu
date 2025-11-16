// components/admin/system-overview.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Calendar, Users, Clock, TrendingUp, Activity } from "lucide-react"
import { getTimeSlots, getBookings, getUsers } from "@/lib/storage"
import type { TimeSlot, Booking, User } from "@/lib/types"

export function SystemOverview() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setTimeSlots(getTimeSlots())
    setBookings(getBookings())
    setUsers(getUsers())
  }

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find((u) => u.id === teacherId)
    return teacher?.name || "Unknown Teacher"
  }

  const getStudentName = (studentId: string) => {
    const student = users.find((u) => u.id === studentId)
    return student?.name || "Unknown Student"
  }

  const isUpcoming = (slot: TimeSlot) => {
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`)
    return slotDateTime > new Date()
  }

  const activeBookings = bookings.filter((booking) => booking.status === "active")
  const upcomingSlots = timeSlots.filter(isUpcoming)
  const totalCapacity = upcomingSlots.reduce((sum, slot) => sum + slot.capacity, 0)
  const bookedSpots = activeBookings.filter((booking) => {
    const slot = timeSlots.find((s) => s.id === booking.timeSlotId)
    return slot && isUpcoming(slot)
  }).length

  const utilizationRate = totalCapacity > 0 ? Math.round((bookedSpots / totalCapacity) * 100) : 0

  // Recent activity (last 10 bookings)
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSlotDetails = (timeSlotId: string) => {
    return timeSlots.find((slot) => slot.id === timeSlotId)
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{upcomingSlots.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activeBookings.length}</p>
                <p className="text-sm text-muted-foreground">Active Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{utilizationRate}%</p>
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{timeSlots.length}</p>
                <p className="text-sm text-muted-foreground">Total Slots Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest booking activities in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => {
                const slot = getSlotDetails(booking.timeSlotId)
                if (!slot) return null

                return (
                  <Card key={booking.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getStudentName(booking.studentId)}</span>
                            <Badge variant={booking.status === "active" ? "default" : "destructive"}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(slot.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>with {getTeacherName(slot.teacherId)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {booking.status === "active" ? "Booked" : "Cancelled"} on {formatDate(booking.createdAt)}
                          </p>
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

      {/* Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Capacity Overview
          </CardTitle>
          <CardDescription>Current booking capacity and utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Total Available Spots</p>
                <p className="text-sm text-muted-foreground">Across all upcoming slots</p>
              </div>
              <p className="text-2xl font-bold">{totalCapacity}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Booked Spots</p>
                <p className="text-sm text-muted-foreground">Currently reserved</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{bookedSpots}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Available Spots</p>
                <p className="text-sm text-muted-foreground">Still open for booking</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalCapacity - bookedSpots}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
