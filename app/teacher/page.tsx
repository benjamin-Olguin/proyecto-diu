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
              Volver al Inicio
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">Panel de control profesores</h2>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Panel de control profesores</h1>
          <p className="text-muted-foreground mt-2"> Seleccione los bloques horarios de las clases y vea las inscripciones de los estudiantes</p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "slots" ? "default" : "outline"}
            onClick={() => setActiveTab("slots")}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Administrar horarios
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "outline"}
            onClick={() => setActiveTab("bookings")}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Ver inscripciones
          </Button>
        </div>

        {activeTab === "slots" && <WeeklySlotCalendar />}
        {activeTab === "bookings" && <BookingOverview />}
      </main>
    </div>
  )
}
