"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, hasRole } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string | string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/")
      return
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push("/dashboard")
    }
  }, [router, requiredRole])

  if (!isAuthenticated()) {
    return null
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No tienes permisos para acceder a esta sección.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
