"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Save, RotateCcw, Package, Calendar, User, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IngresoProducto {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  stock: number
  proveedor: string
  fechaIngreso: string
  numeroFactura: string
  observaciones: string
  registradoPor: string
}

export default function GuiaIngresoSection() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    stock: "",
    proveedor: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    numeroFactura: "",
    observaciones: "",
    registradoPor: "Admin", // Esto vendría del usuario logueado
  })

  const categorias = ["Celulares", "Accesorios", "Tablets", "Laptops", "Auriculares", "Cargadores", "Fundas", "Otros"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Simular llamada a API
      const nuevoIngreso: IngresoProducto = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        precio: Number.parseFloat(formData.precio),
        stock: Number.parseInt(formData.stock),
        proveedor: formData.proveedor,
        fechaIngreso: formData.fechaIngreso,
        numeroFactura: formData.numeroFactura,
        observaciones: formData.observaciones,
        registradoPor: formData.registradoPor,
      }

      // Aquí harías la llamada a tu API de Spring Boot
      // const response = await fetch('/api/productos/ingreso', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(nuevoIngreso)
      // })

      console.log("[v0] Nuevo ingreso de producto:", nuevoIngreso)

      setSuccess("Producto ingresado exitosamente al inventario")

      // Reset form después de éxito
      setTimeout(() => {
        resetForm()
        setSuccess("")
      }, 2000)
    } catch (err) {
      setError("Error al ingresar el producto. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: "",
      stock: "",
      proveedor: "",
      fechaIngreso: new Date().toISOString().split("T")[0],
      numeroFactura: "",
      observaciones: "",
      registradoPor: "Admin",
    })
    setError("")
    setSuccess("")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Guía de Ingreso de Productos</h2>
        <p className="text-muted-foreground">Registra nuevos productos en el inventario</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Información básica */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Producto *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Ej: iPhone 14 Pro"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Describe las características del producto..."
                    rows={3}
                    required
                  />
                </div>

                {/* Información comercial */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio Unitario *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="precio"
                        type="number"
                        step="0.01"
                        value={formData.precio}
                        onChange={(e) => handleInputChange("precio", e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Cantidad en Stock *</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => handleInputChange("stock", e.target.value)}
                        placeholder="0"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="fechaIngreso"
                        type="date"
                        value={formData.fechaIngreso}
                        onChange={(e) => handleInputChange("fechaIngreso", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Información del proveedor */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="proveedor">Proveedor *</Label>
                    <Input
                      id="proveedor"
                      value={formData.proveedor}
                      onChange={(e) => handleInputChange("proveedor", e.target.value)}
                      placeholder="Nombre del proveedor"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroFactura">Número de Factura</Label>
                    <Input
                      id="numeroFactura"
                      value={formData.numeroFactura}
                      onChange={(e) => handleInputChange("numeroFactura", e.target.value)}
                      placeholder="Ej: FAC-001234"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    placeholder="Notas adicionales sobre el producto..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registradoPor">Registrado por</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="registradoPor"
                      value={formData.registradoPor}
                      onChange={(e) => handleInputChange("registradoPor", e.target.value)}
                      className="pl-10"
                      readOnly
                    />
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Ingresar Producto
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel de información */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Campos obligatorios:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Nombre del producto</li>
                  <li>Descripción</li>
                  <li>Categoría</li>
                  <li>Precio unitario</li>
                  <li>Cantidad en stock</li>
                  <li>Proveedor</li>
                  <li>Fecha de ingreso</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consejos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Verifica que el precio sea correcto antes de guardar</p>
                <p>• Incluye detalles importantes en la descripción</p>
                <p>• El número de factura ayuda con el control contable</p>
                <p>• Las observaciones son útiles para notas especiales</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
