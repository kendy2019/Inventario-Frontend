"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated, logout } from "@/lib/auth"
import { User, LogOut, Package, FileText, ShoppingCart, Receipt } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
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

  const handleLogout = () => {
    logout()
  }

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-foreground cursor-pointer">Sistema de Gestión</h1>
            </Link>

            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* Card de Bienvenida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Bienvenido al Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Has iniciado sesión correctamente. Selecciona una opción para comenzar.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Conectado a Spring Boot API</span>
              </div>
            </CardContent>
          </Card>

          {/* Navegación a secciones */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Módulos del Sistema</h2>

            <Link href="/productos">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-3 p-4">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Gestión de Productos</h3>
                    <p className="text-sm text-muted-foreground">Ver, editar y eliminar productos</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/guia-ingreso">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-3 p-4">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-medium">Guía de Ingreso</h3>
                    <p className="text-sm text-muted-foreground">Registrar nuevos productos</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/ventas">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-3 p-4">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Sistema de Ventas</h3>
                    <p className="text-sm text-muted-foreground">Procesar ventas de productos</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/venta-producto-cliente">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-3 p-4">
                  <Receipt className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-medium">Venta Producto Cliente</h3>
                    <p className="text-sm text-muted-foreground">Gestionar ventas de clientes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
