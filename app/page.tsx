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
          <h2 className="text-xl font-semibold">Sistema de horarios Defider</h2>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-balance mb-4">Bienvenido al sistema de horarios del Defider</h1>
          <p className="text-muted-foreground text-lg">Elige tu rol para utilizar las funciones que necesitas</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
                Panel de Control Estudiantes
              </CardTitle>
              <CardDescription className="text-base">
                Revisa los horarios disponibles, agenda una clase y administra tus inscripciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Inscribe y cancela clases del gimnasio
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Ve los horarios disponibles
                </div>
                <Link href="/student">
                  <Button className="w-full mt-4" size="lg">
                    Acceder al panel de control Estudiantes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-green-600" />
                Panel de Control Profesores
              </CardTitle>
              <CardDescription className="text-base">
                Crea y administar los bloques horarios disponibles, revisa los estudiantes inscritos
                
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Crear y administar bloques horarios para las clases
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Ver las inscripciones de los estudiantes
                </div>
                <Link href="/teacher">
                  <Button className="w-full mt-4 bg-transparent" size="lg" variant="outline">
                   Acceder al panel de control Profesores
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
