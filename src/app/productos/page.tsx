"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isAuthenticated, logout } from "@/lib/auth"
import { Package, Search, Edit, Trash2, Plus, ArrowLeft, LogOut } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
}

export default function ProductosPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "",
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
    loadProductos()
  }, [])

  const loadProductos = async () => {
    // Simulación de datos - reemplazar con llamada a tu API
    const mockProductos: Producto[] = [
      { id: 1, nombre: "iPhone 14", descripcion: "Smartphone Apple", precio: 999, stock: 10, categoria: "Celulares" },
      {
        id: 2,
        nombre: "Samsung Galaxy S23",
        descripcion: "Smartphone Samsung",
        precio: 899,
        stock: 15,
        categoria: "Celulares",
      },
      { id: 3, nombre: "MacBook Pro", descripcion: "Laptop Apple", precio: 1999, stock: 5, categoria: "Laptops" },
    ]
    setProductos(mockProductos)
  }

  const handleLogout = () => {
    logout()
  }

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = async () => {
    // Aquí harías la llamada a tu API de Spring Boot
    const newId = Math.max(...productos.map((p) => p.id)) + 1
    const producto: Producto = { ...newProduct, id: newId }
    setProductos([...productos, producto])
    setNewProduct({ nombre: "", descripcion: "", precio: 0, stock: 0, categoria: "" })
    setShowAddForm(false)
  }

  const handleEditProduct = async (producto: Producto) => {
    // Aquí harías la llamada a tu API de Spring Boot
    setProductos(productos.map((p) => (p.id === producto.id ? producto : p)))
    setEditingProduct(null)
  }

  const handleDeleteProduct = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      // Aquí harías la llamada a tu API de Spring Boot
      setProductos(productos.filter((p) => p.id !== id))
    }
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
                <Package className="w-6 h-6" />
                Gestión de Productos
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Controles superiores */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          {/* Formulario de agregar producto */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newProduct.nombre}
                      onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <Input
                      id="categoria"
                      value={newProduct.categoria}
                      onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                      id="precio"
                      type="number"
                      value={newProduct.precio}
                      onChange={(e) => setNewProduct({ ...newProduct, precio: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={newProduct.descripcion}
                    onChange={(e) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddProduct}>Guardar</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de productos */}
          <div className="grid gap-4">
            {filteredProductos.map((producto) => (
              <Card key={producto.id}>
                <CardContent className="p-6">
                  {editingProduct?.id === producto.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre</Label>
                          <Input
                            value={editingProduct.nombre}
                            onChange={(e) => setEditingProduct({ ...editingProduct, nombre: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Categoría</Label>
                          <Input
                            value={editingProduct.categoria}
                            onChange={(e) => setEditingProduct({ ...editingProduct, categoria: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Precio</Label>
                          <Input
                            type="number"
                            value={editingProduct.precio}
                            onChange={(e) => setEditingProduct({ ...editingProduct, precio: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={editingProduct.stock}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Descripción</Label>
                        <Input
                          value={editingProduct.descripcion}
                          onChange={(e) => setEditingProduct({ ...editingProduct, descripcion: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleEditProduct(editingProduct)}>Guardar</Button>
                        <Button variant="outline" onClick={() => setEditingProduct(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                        <p className="text-muted-foreground">{producto.descripcion}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{producto.categoria}</span>
                          <span className="font-medium">${producto.precio}</span>
                          <span
                            className={`${producto.stock > 10 ? "text-green-600" : producto.stock > 0 ? "text-yellow-600" : "text-red-600"}`}
                          >
                            Stock: {producto.stock}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingProduct(producto)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(producto.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProductos.length === 0 && (
            <Alert>
              <AlertDescription>No se encontraron productos que coincidan con tu búsqueda.</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}
