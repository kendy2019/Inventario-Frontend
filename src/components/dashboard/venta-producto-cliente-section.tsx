"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Receipt, Save, Search, Eye, Calendar, User, Phone, DollarSign, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface VentaProductoCliente {
  id: string
  codigoVenta: string
  clienteNombre: string
  marcaCelular: string
  detalleCelular: string
  fechaIngreso: string
  total: number
  registradoPor: string
  estado: "pendiente" | "completado" | "cancelado"
  fechaCreacion: string
}

export default function VentaProductoClienteSection() {
  const [ventasCliente, setVentasCliente] = useState<VentaProductoCliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVenta, setSelectedVenta] = useState<VentaProductoCliente | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    codigoVenta: "",
    clienteNombre: "",
    marcaCelular: "",
    detalleCelular: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    total: "",
    registradoPor: "Admin", // Esto vendría del usuario logueado
  })

  // Simular datos existentes
  useEffect(() => {
    const mockVentas: VentaProductoCliente[] = [
      {
        id: "1",
        codigoVenta: "VTA-001",
        clienteNombre: "Juan Pérez",
        marcaCelular: "iPhone",
        detalleCelular: "iPhone 14 Pro 256GB Azul",
        fechaIngreso: "2024-01-15",
        total: 1299,
        registradoPor: "Admin",
        estado: "completado",
        fechaCreacion: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        codigoVenta: "VTA-002",
        clienteNombre: "María García",
        marcaCelular: "Samsung",
        detalleCelular: "Galaxy S23 Ultra 512GB Negro",
        fechaIngreso: "2024-01-16",
        total: 1199,
        registradoPor: "Admin",
        estado: "pendiente",
        fechaCreacion: "2024-01-16T14:20:00Z",
      },
      {
        id: "3",
        codigoVenta: "VTA-003",
        clienteNombre: "Carlos López",
        marcaCelular: "Xiaomi",
        detalleCelular: "Mi 13 Pro 256GB Blanco + Funda + Protector",
        fechaIngreso: "2024-01-17",
        total: 899,
        registradoPor: "Admin",
        estado: "completado",
        fechaCreacion: "2024-01-17T09:15:00Z",
      },
    ]
    setVentasCliente(mockVentas)
  }, [])

  const filteredVentas = ventasCliente.filter(
    (venta) =>
      venta.codigoVenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.marcaCelular.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const nuevaVenta: VentaProductoCliente = {
        id: Date.now().toString(),
        codigoVenta: formData.codigoVenta,
        clienteNombre: formData.clienteNombre,
        marcaCelular: formData.marcaCelular,
        detalleCelular: formData.detalleCelular,
        fechaIngreso: formData.fechaIngreso,
        total: Number.parseFloat(formData.total),
        registradoPor: formData.registradoPor,
        estado: "pendiente",
        fechaCreacion: new Date().toISOString(),
      }

      // Aquí harías la llamada a tu API de Spring Boot
      // const response = await fetch('/api/ventas-cliente', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(nuevaVenta)
      // })

      console.log("[v0] Nueva venta de producto del cliente:", nuevaVenta)

      setVentasCliente((prev) => [nuevaVenta, ...prev])
      setSuccess("Venta de producto del cliente registrada exitosamente")

      // Reset form
      setFormData({
        codigoVenta: "",
        clienteNombre: "",
        marcaCelular: "",
        detalleCelular: "",
        fechaIngreso: new Date().toISOString().split("T")[0],
        total: "",
        registradoPor: "Admin",
      })

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Error al registrar la venta. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const viewVenta = (venta: VentaProductoCliente) => {
    setSelectedVenta(venta)
    setIsViewDialogOpen(true)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
      case "cancelado":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const generarCodigoVenta = () => {
    const codigo = `VTA-${String(Date.now()).slice(-6)}`
    setFormData((prev) => ({ ...prev, codigoVenta: codigo }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Venta de Producto del Cliente</h2>
        <p className="text-muted-foreground">Registra ventas específicas con detalles del cliente y producto</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario de registro */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Registrar Nueva Venta
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

                {/* Información de la venta */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="codigoVenta">Código de Venta *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="codigoVenta"
                        value={formData.codigoVenta}
                        onChange={(e) => handleInputChange("codigoVenta", e.target.value)}
                        placeholder="VTA-001234"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generarCodigoVenta}>
                        Generar
                      </Button>
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

                {/* Información del cliente */}
                <div className="space-y-2">
                  <Label htmlFor="clienteNombre">Nombre del Cliente *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="clienteNombre"
                      value={formData.clienteNombre}
                      onChange={(e) => handleInputChange("clienteNombre", e.target.value)}
                      placeholder="Nombre completo del cliente"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Información del producto */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="marcaCelular">Marca del Celular *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="marcaCelular"
                        value={formData.marcaCelular}
                        onChange={(e) => handleInputChange("marcaCelular", e.target.value)}
                        placeholder="iPhone, Samsung, Xiaomi..."
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total">Total de la Venta *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="total"
                        type="number"
                        step="0.01"
                        value={formData.total}
                        onChange={(e) => handleInputChange("total", e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detalleCelular">Detalle del Celular *</Label>
                  <Textarea
                    id="detalleCelular"
                    value={formData.detalleCelular}
                    onChange={(e) => handleInputChange("detalleCelular", e.target.value)}
                    placeholder="Modelo específico, color, capacidad, accesorios incluidos..."
                    rows={3}
                    required
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Registrar Venta
                </Button>
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
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• El código de venta debe ser único</p>
                <p>• Incluye todos los detalles del producto</p>
                <p>• La fecha de ingreso puede ser diferente a hoy</p>
                <p>• El total incluye impuestos si aplica</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total ventas:</span>
                  <span className="font-medium">{ventasCliente.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completadas:</span>
                  <span className="font-medium text-green-600">
                    {ventasCliente.filter((v) => v.estado === "completado").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pendientes:</span>
                  <span className="font-medium text-yellow-600">
                    {ventasCliente.filter((v) => v.estado === "pendiente").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de ventas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Lista de Ventas ({filteredVentas.length})
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por código, cliente o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVentas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell className="font-mono">{venta.codigoVenta}</TableCell>
                  <TableCell className="font-medium">{venta.clienteNombre}</TableCell>
                  <TableCell>{venta.marcaCelular}</TableCell>
                  <TableCell>{new Date(venta.fechaIngreso).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">${venta.total}</TableCell>
                  <TableCell>{getEstadoBadge(venta.estado)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => viewVenta(venta)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredVentas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No se encontraron ventas</div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver detalles */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
          </DialogHeader>

          {selectedVenta && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Código de Venta</Label>
                  <p className="font-mono">{selectedVenta.codigoVenta}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p>{selectedVenta.clienteNombre}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Marca</Label>
                    <p>{selectedVenta.marcaCelular}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total</Label>
                    <p className="font-medium">${selectedVenta.total}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Detalle del Producto</Label>
                  <p className="text-sm text-muted-foreground">{selectedVenta.detalleCelular}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Fecha de Ingreso</Label>
                    <p>{new Date(selectedVenta.fechaIngreso).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="mt-1">{getEstadoBadge(selectedVenta.estado)}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Registrado por</Label>
                  <p>{selectedVenta.registradoPor}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
