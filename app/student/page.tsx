"use client"

import { useState } from "react"
import { WeeklyBookingCalendar } from "@/components/student/weekly-booking-calendar"
import { MyBookings } from "@/components/student/my-bookings"
import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

type TabType = "book" | "bookings"

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState<TabType>("book")

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
          <h2 className="text-xl font-semibold">Student Dashboard</h2>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Student Dashboard</h1>
          <p className="text-muted-foreground mt-2">Book gym sessions and manage your schedule</p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "book" ? "default" : "outline"}
            onClick={() => setActiveTab("book")}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Book Sessions
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "outline"}
            onClick={() => setActiveTab("bookings")}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            My Bookings
          </Button>
        </div>

        {activeTab === "book" && <WeeklyBookingCalendar />}
        {activeTab === "bookings" && <MyBookings />}
      </main>
    </div>
  )
}
