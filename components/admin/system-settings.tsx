// components/admin/system-settings.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Clock, Users, Calendar } from "lucide-react"
import { getGymSettings, saveGymSettings } from "@/lib/storage"
import type { GymSettings } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function SystemSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<GymSettings>({
    slotDuration: 60,
    maxSlotsPerDay: 8,
    openingTime: "08:00",
    closingTime: "20:00",
    daysInAdvance: 7,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const currentSettings = getGymSettings()
    setSettings(currentSettings)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (settings.openingTime >= settings.closingTime) {
        toast({
          title: "Validation Error",
          description: "Closing time must be after opening time.",
          variant: "destructive",
        })
        return
      }

      if (settings.slotDuration < 15 || settings.slotDuration > 240) {
        toast({
          title: "Validation Error",
          description: "Slot duration must be between 15 and 240 minutes.",
          variant: "destructive",
        })
        return
      }

      if (settings.maxSlotsPerDay < 1 || settings.maxSlotsPerDay > 20) {
        toast({
          title: "Validation Error",
          description: "Maximum slots per day must be between 1 and 20.",
          variant: "destructive",
        })
        return
      }

      if (settings.daysInAdvance < 1 || settings.daysInAdvance > 30) {
        toast({
          title: "Validation Error",
          description: "Days in advance must be between 1 and 30.",
          variant: "destructive",
        })
        return
      }

      saveGymSettings(settings)

      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof GymSettings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>Configure global gym booking system settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slotDuration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Slot Duration (minutes)
              </Label>
              <Input
                id="slotDuration"
                type="number"
                min="15"
                max="240"
                step="15"
                value={settings.slotDuration}
                onChange={(e) => handleInputChange("slotDuration", Number.parseInt(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Duration of each time slot (15-240 minutes)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSlotsPerDay" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Max Slots Per Day
              </Label>
              <Input
                id="maxSlotsPerDay"
                type="number"
                min="1"
                max="20"
                value={settings.maxSlotsPerDay}
                onChange={(e) => handleInputChange("maxSlotsPerDay", Number.parseInt(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Maximum number of slots per day (1-20)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingTime">Opening Time</Label>
              <Input
                id="openingTime"
                type="time"
                value={settings.openingTime}
                onChange={(e) => handleInputChange("openingTime", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Gym opening time</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                id="closingTime"
                type="time"
                value={settings.closingTime}
                onChange={(e) => handleInputChange("closingTime", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Gym closing time</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daysInAdvance" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Booking Window (days)
              </Label>
              <Input
                id="daysInAdvance"
                type="number"
                min="1"
                max="30"
                value={settings.daysInAdvance}
                onChange={(e) => handleInputChange("daysInAdvance", Number.parseInt(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">How many days in advance students can book (1-30)</p>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "Updating..." : "Update Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
