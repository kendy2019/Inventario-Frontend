"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { isAuthenticated, logout } from "@/lib/auth"
import { Receipt, ArrowLeft, LogOut, Save, Search, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface VentaProductoCliente {
  id: number
  codigoVenta: string
  clienteNombre: string
  marcaCelular: string
  detalleCelular: string
  fechaIngreso: string
  total: number
  registradoPor: string
}

export default function VentaProductoClientePage() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(true)
  const [ventas, setVentas] = useState<VentaProductoCliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    codigoVenta: "",
    clienteNombre: "",
    marcaCelular: "",
    detalleCelular: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    total: "",
    registradoPor: "",
  })

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
    loadVentas()
  }, [])

  const loadVentas = async () => {
    const mockVentas: VentaProductoCliente[] = [
      {
        id: 1,
        codigoVenta: "VPC-001",
        clienteNombre: "Juan Pérez",
        marcaCelular: "iPhone",
        detalleCelular: "iPhone 14 Pro 128GB Azul",
        fechaIngreso: "2024-01-15",
        total: 1200,
        registradoPor: "Admin",
      },
      {
        id: 2,
        codigoVenta: "VPC-002",
        clienteNombre: "María García",
        marcaCelular: "Samsung",
        detalleCelular: "Galaxy S23 Ultra 256GB Negro",
        fechaIngreso: "2024-01-16",
        total: 1100,
        registradoPor: "Admin",
      },
    ]
    setVentas(mockVentas)
  }

  const handleLogout = () => {
    logout()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateCodigoVenta = () => {
    const timestamp = Date.now().toString().slice(-6)
    return `VPC-${timestamp}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const codigoVenta = formData.codigoVenta || generateCodigoVenta()

      const ventaData = {
        ...formData,
        codigoVenta,
        total: Number.parseFloat(formData.total),
      }

      // const response = await fetch('http://localhost:8080/api/venta-producto-cliente', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(ventaData)
      // })

      // Simulación de guardado exitoso
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const nuevaVenta: VentaProductoCliente = {
        id: ventas.length + 1,
        ...ventaData,
        total: Number.parseFloat(formData.total),
      }

      setVentas([nuevaVenta, ...ventas])
      setMessage("Venta de producto del cliente registrada exitosamente")

      // Limpiar formulario
      setFormData({
        codigoVenta: "",
        clienteNombre: "",
        marcaCelular: "",
        detalleCelular: "",
        fechaIngreso: new Date().toISOString().split("T")[0],
        total: "",
        registradoPor: "",
      })
    } catch (error) {
      setMessage("Error al registrar la venta")
    } finally {
      setSaving(false)
    }
  }

  const filteredVentas = ventas.filter(
    (venta) =>
      venta.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.codigoVenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.marcaCelular.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-6 h-6" />
                Venta Producto Cliente
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
                {showForm ? <Eye className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {showForm ? "Ver Lista" : "Nueva Venta"}
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          /* Formulario de registro */
          <Card>
            <CardHeader>
              <CardTitle>Registrar Venta de Producto del Cliente</CardTitle>
              <p className="text-muted-foreground">Registra la información de la venta realizada al cliente</p>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert
                  className={`mb-6 ${message.includes("Error") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
                >
                  <AlertDescription className={message.includes("Error") ? "text-red-800" : "text-green-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información de la venta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigoVenta">Código de Venta</Label>
                    <Input
                      id="codigoVenta"
                      value={formData.codigoVenta}
                      onChange={(e) => handleInputChange("codigoVenta", e.target.value)}
                      placeholder="Se generará automáticamente si se deja vacío"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
                    <Input
                      id="fechaIngreso"
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={(e) => handleInputChange("fechaIngreso", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Información del cliente */}
                <div>
                  <Label htmlFor="clienteNombre">Nombre del Cliente *</Label>
                  <Input
                    id="clienteNombre"
                    value={formData.clienteNombre}
                    onChange={(e) => handleInputChange("clienteNombre", e.target.value)}
                    required
                  />
                </div>

                {/* Información del producto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marcaCelular">Marca del Celular *</Label>
                    <Input
                      id="marcaCelular"
                      value={formData.marcaCelular}
                      onChange={(e) => handleInputChange("marcaCelular", e.target.value)}
                      placeholder="ej: iPhone, Samsung, Xiaomi"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="total">Total de la Venta *</Label>
                    <Input
                      id="total"
                      type="number"
                      step="0.01"
                      value={formData.total}
                      onChange={(e) => handleInputChange("total", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Detalle del celular */}
                <div>
                  <Label htmlFor="detalleCelular">Detalle del Celular *</Label>
                  <Textarea
                    id="detalleCelular"
                    value={formData.detalleCelular}
                    onChange={(e) => handleInputChange("detalleCelular", e.target.value)}
                    placeholder="ej: iPhone 14 Pro 128GB Color Azul, incluye cargador y audífonos"
                    rows={3}
                    required
                  />
                </div>

                {/* Información del registro */}
                <div>
                  <Label htmlFor="registradoPor">Registrado Por *</Label>
                  <Input
                    id="registradoPor"
                    value={formData.registradoPor}
                    onChange={(e) => handleInputChange("registradoPor", e.target.value)}
                    placeholder="Nombre del empleado que registra"
                    required
                  />
                </div>

                {/* Botón de envío */}
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Registrar Venta
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Lista de ventas */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Ventas de Productos del Cliente</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por cliente, código o marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVentas.map((venta) => (
                    <Card key={venta.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-lg">{venta.codigoVenta}</h4>
                            <p className="text-muted-foreground">Cliente: {venta.clienteNombre}</p>
                            <p className="text-sm text-muted-foreground">Registrado por: {venta.registradoPor}</p>
                          </div>
                          <div>
                            <p className="font-medium">{venta.marcaCelular}</p>
                            <p className="text-sm text-muted-foreground">{venta.detalleCelular}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">${venta.total}</p>
                            <p className="text-sm text-muted-foreground">{venta.fechaIngreso}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredVentas.length === 0 && (
                  <Alert>
                    <AlertDescription>No se encontraron ventas que coincidan con tu búsqueda.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
