"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { isAuthenticated, logout } from "@/lib/auth"
import { FileText, ArrowLeft, LogOut, Save, RotateCcw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function GuiaIngresoPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    marca: "",
    modelo: "",
    precio: "",
    stock: "",
    proveedor: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    ubicacion: "",
    codigoBarras: "",
    notas: "",
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
  }, [])

  const handleLogout = () => {
    logout()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      // const response = await fetch('http://localhost:8080/api/productos', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(formData)
      // })

      // Simulación de guardado exitoso
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage("Producto ingresado exitosamente")
      // Limpiar formulario después de guardar
      setFormData({
        nombre: "",
        descripcion: "",
        categoria: "",
        marca: "",
        modelo: "",
        precio: "",
        stock: "",
        proveedor: "",
        fechaIngreso: new Date().toISOString().split("T")[0],
        ubicacion: "",
        codigoBarras: "",
        notas: "",
      })
    } catch (error) {
      setMessage("Error al ingresar el producto")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      marca: "",
      modelo: "",
      precio: "",
      stock: "",
      proveedor: "",
      fechaIngreso: new Date().toISOString().split("T")[0],
      ubicacion: "",
      codigoBarras: "",
      notas: "",
    })
    setMessage("")
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
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Guía de Ingreso
              </h1>
            </div>

            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Producto</CardTitle>
            <p className="text-muted-foreground">
              Completa la información del producto que deseas ingresar al inventario
            </p>
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
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Producto *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => handleInputChange("categoria", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => handleInputChange("marca", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => handleInputChange("modelo", e.target.value)}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Información comercial */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="precio">Precio *</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => handleInputChange("precio", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Inicial *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codigoBarras">Código de Barras</Label>
                  <Input
                    id="codigoBarras"
                    value={formData.codigoBarras}
                    onChange={(e) => handleInputChange("codigoBarras", e.target.value)}
                  />
                </div>
              </div>

              {/* Información de proveedor y ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => handleInputChange("proveedor", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ubicacion">Ubicación en Almacén</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                  />
                </div>
              </div>

              {/* Fecha de ingreso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                  <Input
                    id="fechaIngreso"
                    type="date"
                    value={formData.fechaIngreso}
                    onChange={(e) => handleInputChange("fechaIngreso", e.target.value)}
                  />
                </div>
              </div>

              {/* Notas adicionales */}
              <div>
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => handleInputChange("notas", e.target.value)}
                  rows={3}
                  placeholder="Información adicional sobre el producto..."
                />
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Producto
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpiar Formulario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
