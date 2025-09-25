export type UserRole = "student" | "teacher" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface TimeSlot {
  id: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  capacity: number
  isAvailable: boolean
  teacherId: string
  createdAt: string
}

export interface Booking {
  id: string
  studentId: string
  timeSlotId: string
  status: "active" | "cancelled"
  createdAt: string
  cancelledAt?: string
}

export interface GymSettings {
  slotDuration: number // in minutes
  maxSlotsPerDay: number
  openingTime: string // HH:MM format
  closingTime: string // HH:MM format
  daysInAdvance: number // how many days in advance can students book
}
