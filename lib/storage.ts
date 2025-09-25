import type { User, TimeSlot, Booking, GymSettings } from "./types"

// Default gym settings
const DEFAULT_SETTINGS: GymSettings = {
  slotDuration: 60, // 1 hour slots
  maxSlotsPerDay: 8,
  openingTime: "08:00",
  closingTime: "20:00",
  daysInAdvance: 7,
}

// Storage keys
const STORAGE_KEYS = {
  USERS: "gym_users",
  TIMESLOTS: "gym_timeslots",
  BOOKINGS: "gym_bookings",
  SETTINGS: "gym_settings",
  CURRENT_USER: "gym_current_user",
} as const

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error)
    return defaultValue
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage key ${key}:`, error)
  }
}

// User management
export function getUsers(): User[] {
  return getFromStorage(STORAGE_KEYS.USERS, [])
}

export function saveUser(user: User): void {
  const users = getUsers()
  const existingIndex = users.findIndex((u) => u.id === user.id)

  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }

  setToStorage(STORAGE_KEYS.USERS, users)
}

export function getCurrentUser(): User | null {
  return getFromStorage(STORAGE_KEYS.CURRENT_USER, null)
}

export function setCurrentUser(user: User | null): void {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user)
}

// TimeSlot management
export function getTimeSlots(): TimeSlot[] {
  return getFromStorage(STORAGE_KEYS.TIMESLOTS, [])
}

export function saveTimeSlot(timeSlot: TimeSlot): void {
  const timeSlots = getTimeSlots()
  const existingIndex = timeSlots.findIndex((ts) => ts.id === timeSlot.id)

  if (existingIndex >= 0) {
    timeSlots[existingIndex] = timeSlot
  } else {
    timeSlots.push(timeSlot)
  }

  setToStorage(STORAGE_KEYS.TIMESLOTS, timeSlots)
}

export function deleteTimeSlot(timeSlotId: string): void {
  const timeSlots = getTimeSlots().filter((ts) => ts.id !== timeSlotId)
  setToStorage(STORAGE_KEYS.TIMESLOTS, timeSlots)
}

// Booking management
export function getBookings(): Booking[] {
  return getFromStorage(STORAGE_KEYS.BOOKINGS, [])
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings()
  const existingIndex = bookings.findIndex((b) => b.id === booking.id)

  if (existingIndex >= 0) {
    bookings[existingIndex] = booking
  } else {
    bookings.push(booking)
  }

  setToStorage(STORAGE_KEYS.BOOKINGS, bookings)
}

// Settings management
export function getGymSettings(): GymSettings {
  return getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
}

export function saveGymSettings(settings: GymSettings): void {
  setToStorage(STORAGE_KEYS.SETTINGS, settings)
}

// Utility functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function initializeDefaultData(): void {
  // Create default admin user if no users exist
  const users = getUsers()
  if (users.length === 0) {
    const adminUser: User = {
      id: generateId(),
      email: "admin@gym.com",
      name: "Admin User",
      role: "admin",
      createdAt: new Date().toISOString(),
    }
    saveUser(adminUser)

    // Create sample teacher
    const teacherUser: User = {
      id: generateId(),
      email: "teacher@gym.com",
      name: "John Teacher",
      role: "teacher",
      createdAt: new Date().toISOString(),
    }
    saveUser(teacherUser)

    // Create sample student
    const studentUser: User = {
      id: generateId(),
      email: "student@gym.com",
      name: "Jane Student",
      role: "student",
      createdAt: new Date().toISOString(),
    }
    saveUser(studentUser)
  }
}
