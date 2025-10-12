"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, User, ShieldCheck } from "lucide-react"

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  success?: boolean
  token: string
  username: string
  rol: string
  message?: string
}

export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof LoginCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Por favor, completa todos los campos")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // ============================================================================
      // CREDENCIALES DE PRUEBA - SOLO PARA DESARROLLO
      // Usuario: admin | Contraseña: 123 (ROL: ADMIN)
      // Usuario: empleado | Contraseña: 123 (ROL: EMPLOYEE)
      // TODO: ELIMINAR ESTE BLOQUE CUANDO SE CONECTE A LA BASE DE DATOS REAL
      // ============================================================================
      if (
        (credentials.username === "admin" && credentials.password === "123") ||
        (credentials.username === "empleado" && credentials.password === "123")
      ) {
        // Simular respuesta exitosa con datos de prueba
        const mockData: LoginResponse = {
          success: true,
          token: "mock-token-for-testing-" + Date.now(),
          username: credentials.username,
          rol: credentials.username === "admin" ? "ADMIN" : "EMPLOYEE",
        }

        setSuccess(true)
        localStorage.setItem("authToken", mockData.token)
        localStorage.setItem("username", mockData.username)
        localStorage.setItem("userRole", mockData.rol)

        console.log("Login exitoso (modo prueba):", mockData)

        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1500)

        setIsLoading(false)
        return
      }
      // ============================================================================
      // FIN DE CREDENCIALES DE PRUEBA
      // ============================================================================

      const response = await fetch("http://localhost:8080/api/auth/login", { //Segun la api el controlador de SpringBoot
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      })

      const data: LoginResponse = await response.json()

      if (response.ok && data.token) {
        setSuccess(true)
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("username", data.username)
        localStorage.setItem("userRole", data.rol)

        console.log("Login exitoso:", data)

        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1500)
      } else {
        setError(data.message || "Credenciales incorrectas")
      }
    } catch (err) {
      console.error("Error de conexión:", err)
      setError("Error de conexión con el servidor. Verifica que la API esté funcionando.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">¡Acceso Concedido!</h3>
            <p className="text-green-600">Redirigiendo al sistema...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center font-bold">Sistema ERP</CardTitle>
        <CardDescription className="text-center">Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertDescription className="flex items-center gap-2">
                <span className="font-medium">Error:</span> {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Usuario
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={credentials.username}
                onChange={handleInputChange("username")}
                disabled={isLoading}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={credentials.password}
                onChange={handleInputChange("password")}
                disabled={isLoading}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verificando credenciales...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Iniciar Sesión
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Problemas para acceder?{" "}
            <span className="text-primary font-medium cursor-pointer hover:underline">Contacta al administrador</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
