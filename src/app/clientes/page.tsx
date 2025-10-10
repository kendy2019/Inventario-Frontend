"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react"

interface Cliente {
  id: number
  nombre: string
  telefono: string
  email: string
  direccion: string
  totalCompras: number
  ultimaCompra: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 1,
      nombre: "Juan Pérez",
      telefono: "987654321",
      email: "juan@email.com",
      direccion: "Av. Principal 123",
      totalCompras: 5,
      ultimaCompra: "2024-01-15",
    },
    {
      id: 2,
      nombre: "María García",
      telefono: "912345678",
      email: "maria@email.com",
      direccion: "Jr. Comercio 456",
      totalCompras: 3,
      ultimaCompra: "2024-01-10",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nuevoCliente: Cliente = {
      id: clientes.length + 1,
      ...formData,
      totalCompras: 0,
      ultimaCompra: new Date().toISOString().split("T")[0],
    }
    setClientes([...clientes, nuevoCliente])
    setFormData({ nombre: "", telefono: "", email: "", direccion: "" })
    setIsDialogOpen(false)
  }

  const filteredClientes = clientes.filter((cliente) => cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <ProtectedRoute requiredRole={["ADMIN", "EMPLOYEE"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
              <p className="text-muted-foreground">Administra la información de tus clientes</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Guardar Cliente
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead>Última Compra</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3" />
                            {cliente.telefono}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {cliente.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3" />
                          {cliente.direccion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cliente.totalCompras} compras</Badge>
                      </TableCell>
                      <TableCell>{cliente.ultimaCompra}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
