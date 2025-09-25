"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { getCurrentUser, setCurrentUser, getUsers, initializeDefaultData } from "@/lib/storage"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize default data on first load
    initializeDefaultData()

    // Get current user from storage
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string): boolean => {
    // Simple authentication - in a real app, this would be more secure
    const users = getUsers()
    const foundUser = users.find((u) => u.email === email)

    if (foundUser) {
      setUser(foundUser)
      setCurrentUser(foundUser)
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    setCurrentUser(null)
  }

  const isAuthenticated = !!user
  const isStudent = user?.role === "student"
  const isTeacher = user?.role === "teacher"
  const isAdmin = user?.role === "admin"

  return {
    user,
    isLoading,
    isAuthenticated,
    isStudent,
    isTeacher,
    isAdmin,
    login,
    logout,
  }
}
