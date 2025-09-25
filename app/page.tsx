"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, BookOpen } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center">
          <h2 className="text-xl font-semibold">Gym Booking System</h2>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-balance mb-4">Welcome to Gym Booking System</h1>
          <p className="text-muted-foreground text-lg">Choose your role to access the appropriate dashboard</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
                Student Dashboard
              </CardTitle>
              <CardDescription className="text-base">
                Browse available gym time slots, book sessions, and manage your bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Book and cancel gym sessions
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  View available time slots
                </div>
                <Link href="/student">
                  <Button className="w-full mt-4" size="lg">
                    Access Student Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-green-600" />
                Teacher Dashboard
              </CardTitle>
              <CardDescription className="text-base">
                Create and manage available time slots, view student bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Create and manage time slots
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  View student bookings
                </div>
                <Link href="/teacher">
                  <Button className="w-full mt-4 bg-transparent" size="lg" variant="outline">
                    Access Teacher Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
