"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Plus, Edit, Trash2, Search, Save, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
}

export default function ProductosSection() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
  })

  // Simular datos iniciales (reemplazar con API real)
  useEffect(() => {
    const mockProducts: Producto[] = [
      { id: 1, nombre: "iPhone 14", descripcion: "Smartphone Apple", precio: 999, stock: 10, categoria: "Celulares" },
      {
        id: 2,
        nombre: "Samsung Galaxy S23",
        descripcion: "Smartphone Samsung",
        precio: 899,
        stock: 15,
        categoria: "Celulares",
      },
      {
        id: 3,
        nombre: "Funda iPhone",
        descripcion: "Protector para iPhone",
        precio: 25,
        stock: 50,
        categoria: "Accesorios",
      },
    ]
    setProductos(mockProducts)
  }, [])

  const filteredProducts = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const newProduct: Producto = {
        id: editingProduct ? editingProduct.id : Date.now(),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number.parseFloat(formData.precio),
        stock: Number.parseInt(formData.stock),
        categoria: formData.categoria,
      }

      if (editingProduct) {
        setProductos((prev) => prev.map((p) => (p.id === editingProduct.id ? newProduct : p)))
      } else {
        setProductos((prev) => [...prev, newProduct])
      }

      // Reset form
      setFormData({ nombre: "", descripcion: "", precio: "", stock: "", categoria: "" })
      setEditingProduct(null)
      setIsDialogOpen(false)
    } catch (err) {
      setError("Error al guardar el producto")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (producto: Producto) => {
    setEditingProduct(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      categoria: producto.categoria,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      setProductos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "", descripcion: "", precio: "", stock: "", categoria: "" })
    setEditingProduct(null)
    setError("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Productos</h2>
          <p className="text-muted-foreground">Administra tu inventario de productos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, precio: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingProduct ? "Actualizar" : "Guardar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar productos por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Lista de Productos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>{producto.id}</TableCell>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>{producto.descripcion}</TableCell>
                  <TableCell>${producto.precio}</TableCell>
                  <TableCell>{producto.stock}</TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(producto)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(producto.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No se encontraron productos</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
