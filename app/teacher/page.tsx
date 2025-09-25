"use client"

import { useState } from "react"
import { WeeklySlotCalendar } from "@/components/teacher/weekly-slot-calendar"
import { BookingOverview } from "@/components/teacher/booking-overview"
import { Button } from "@/components/ui/button"
import { Calendar, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

type TabType = "slots" | "bookings"

export default function TeacherPage() {
  const [activeTab, setActiveTab] = useState<TabType>("slots")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">Teacher Dashboard</h2>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your time slots and view student bookings</p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "slots" ? "default" : "outline"}
            onClick={() => setActiveTab("slots")}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Manage Slots
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "outline"}
            onClick={() => setActiveTab("bookings")}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            View Bookings
          </Button>
        </div>

        {activeTab === "slots" && <WeeklySlotCalendar />}
        {activeTab === "bookings" && <BookingOverview />}
      </main>
    </div>
  )
}
