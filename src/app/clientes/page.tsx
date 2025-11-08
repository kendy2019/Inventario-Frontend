"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Smartphone } from "lucide-react"

// --- INTERFACES ---
interface Cliente {
  id: number
  nombre: string
  telefono: string
  email: string | null
  direccion: string | null
  marcaCelular: string | null
  modeloCelular: string | null
  tipoCliente: "FINAL" | "TECNICO" | "MAYORISTA"
  totalCompras: number
  ultimaCompra: string | null
}

// --- HOOK DEBUNCE ---
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// --- AUTENTICACIÓN ---
const isAuthenticated = (): boolean => localStorage.getItem("authToken") !== null

// --- COMPONENTE PRINCIPAL ---
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Cliente | null>(null)

  const initialFormData = {
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    marcaCelular: "",
    modeloCelular: "",
    tipoCliente: "FINAL" as "FINAL" | "TECNICO" | "MAYORISTA"
  }
  const [formData, setFormData] = useState(initialFormData)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const API_URL = "http://localhost:8080/api/clientes"

  const fetchClientes = useCallback(async (term = "") => {
    setLoading(true)
    setError(null)
    const url = term ? `${API_URL}/buscar?nombre=${term}` : API_URL
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error("Error al cargar los clientes.")
      const data = await response.json()
      setClientes(data)
    } catch (err) {
      setError("No se pudieron cargar los clientes.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated()) {
      fetchClientes(debouncedSearchTerm)
    } else {
      setError("Acceso denegado. Inicia sesión.")
      setLoading(false)
    }
  }, [debouncedSearchTerm, fetchClientes])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleOpenDialog = (cliente: Cliente | null = null) => {
    if (cliente) {
      setEditingClient(cliente)
      setFormData({
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email || "",
        direccion: cliente.direccion || "",
        marcaCelular: cliente.marcaCelular || "",
        modeloCelular: cliente.modeloCelular || "",
        tipoCliente: cliente.tipoCliente
      })
    } else {
      setEditingClient(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingClient ? "PUT" : "POST"
    const url = editingClient ? `${API_URL}/${editingClient.id}` : API_URL
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      })
      if (!response.ok) throw new Error("Error al guardar el cliente.")
      setIsDialogOpen(false)
      fetchClientes()
    } catch (err) {
      setError("No se pudo guardar el cliente.")
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error("Error al eliminar el cliente.")
      fetchClientes()
    } catch (err) {
      setError("No se pudo eliminar el cliente.")
      console.error(err)
    }
  }

  if (error) return <div className="text-center p-8 text-red-600">{error}</div>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
            <p className="text-muted-foreground">Administra la información de tus clientes</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center p-8">Cargando clientes...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Celular</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead>Última Compra</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map(cliente => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" /> {cliente.telefono}
                          </div>
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" /> {cliente.marcaCelular} {cliente.modeloCelular}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{cliente.tipoCliente}</Badge>
                      </TableCell>
                      <TableCell>{cliente.totalCompras}</TableCell>
                      <TableCell>{cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(cliente)}>
                            <Edit />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(cliente.id)}>
                            <Trash2 className="text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* FORMULARIO */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? "Editar Cliente" : "Agregar Cliente"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input id="nombre" value={formData.nombre} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={formData.telefono} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" value={formData.direccion} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="marcaCelular">Marca del Celular</Label>
                <Input id="marcaCelular" value={formData.marcaCelular} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="modeloCelular">Modelo del Celular</Label>
                <Input id="modeloCelular" value={formData.modeloCelular} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
                <select id="tipoCliente" value={formData.tipoCliente} onChange={handleInputChange} className="border rounded p-2 w-full">
                  <option value="FINAL">FINAL</option>
                  <option value="TECNICO">TECNICO</option>
                  <option value="MAYORISTA">MAYORISTA</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Guardar Cliente
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
