"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { isAuthenticated } from "@/lib/auth"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)
      setLoading(false)

      if (!authenticated) {
        window.location.href = "/"
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar className="h-screen" />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
