// app/admin/page.tsx
"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { SystemSettings } from "@/components/admin/system-settings"
import { UserManagement } from "@/components/admin/user-management"
import { SystemOverview } from "@/components/admin/system-overview"
import { Button } from "@/components/ui/button"
import { Settings, Users, BarChart } from "lucide-react"

type TabType = "overview" | "settings" | "users"

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage system settings, users, and monitor activity</p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="gap-2"
          >
            <BarChart className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Users
          </Button>
        </div>

        {activeTab === "overview" && <SystemOverview />}
        {activeTab === "settings" && <SystemSettings />}
        {activeTab === "users" && <UserManagement />}
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
