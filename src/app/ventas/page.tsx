"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isAuthenticated, logout } from "@/lib/auth"
import { ShoppingCart, ArrowLeft, LogOut, Plus, Minus, Trash2, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
}

interface ItemVenta {
  producto: Producto
  cantidad: number
  subtotal: number
}

export default function VentasPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<ItemVenta[]>([])
  const [productoId, setProductoId] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [message, setMessage] = useState("")
  const [processingVenta, setProcessingVenta] = useState(false)

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
    const mockProductos: Producto[] = [
      { id: 1, nombre: "iPhone 14", precio: 999, stock: 10 },
      { id: 2, nombre: "Samsung Galaxy S23", precio: 899, stock: 15 },
      { id: 3, nombre: "MacBook Pro", precio: 1999, stock: 5 },
      { id: 4, nombre: "iPad Air", precio: 599, stock: 8 },
      { id: 5, nombre: "AirPods Pro", precio: 249, stock: 20 },
    ]
    setProductos(mockProductos)
  }

  const handleLogout = () => {
    logout()
  }

  const agregarAlCarrito = () => {
    const producto = productos.find((p) => p.id === Number.parseInt(productoId))
    if (!producto) {
      setMessage("Producto no encontrado")
      return
    }

    if (cantidad > producto.stock) {
      setMessage("Stock insuficiente")
      return
    }

    const itemExistente = carrito.find((item) => item.producto.id === producto.id)

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad
      if (nuevaCantidad > producto.stock) {
        setMessage("Stock insuficiente")
        return
      }

      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * producto.precio }
            : item,
        ),
      )
    } else {
      const nuevoItem: ItemVenta = {
        producto,
        cantidad,
        subtotal: cantidad * producto.precio,
      }
      setCarrito([...carrito, nuevoItem])
    }

    setProductoId("")
    setCantidad(1)
    setMessage("")
  }

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    const producto = productos.find((p) => p.id === productoId)
    if (!producto) return

    if (nuevaCantidad > producto.stock) {
      setMessage("Stock insuficiente")
      return
    }

    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(productoId)
      return
    }

    setCarrito(
      carrito.map((item) =>
        item.producto.id === productoId
          ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * producto.precio }
          : item,
      ),
    )
    setMessage("")
  }

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter((item) => item.producto.id !== productoId))
  }

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0)
  }

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      setMessage("El carrito está vacío")
      return
    }

    setProcessingVenta(true)
    setMessage("")

    try {
      // const ventaData = {
      //   items: carrito.map(item => ({
      //     productoId: item.producto.id,
      //     cantidad: item.cantidad,
      //     precio: item.producto.precio
      //   })),
      //   total: calcularTotal(),
      //   fecha: new Date().toISOString()
      // }

      // const response = await fetch('http://localhost:8080/api/ventas', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(ventaData)
      // })

      // Simulación de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMessage("Venta procesada exitosamente")
      setCarrito([])

      // Actualizar stock local (en producción esto vendría de la API)
      setProductos(
        productos.map((producto) => {
          const itemVendido = carrito.find((item) => item.producto.id === producto.id)
          if (itemVendido) {
            return { ...producto, stock: producto.stock - itemVendido.cantidad }
          }
          return producto
        }),
      )
    } catch (error) {
      setMessage("Error al procesar la venta")
    } finally {
      setProcessingVenta(false)
    }
  }

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
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
                <ShoppingCart className="w-6 h-6" />
                Sistema de Ventas
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de selección de productos */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Productos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productoId">ID del Producto</Label>
                    <Input
                      id="productoId"
                      type="number"
                      value={productoId}
                      onChange={(e) => setProductoId(e.target.value)}
                      placeholder="Ingresa el ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
                <Button onClick={agregarAlCarrito} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar al Carrito
                </Button>
              </CardContent>
            </Card>

            {/* Lista de productos disponibles */}
            <Card>
              <CardHeader>
                <CardTitle>Productos Disponibles</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredProductos.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setProductoId(producto.id.toString())}
                    >
                      <div>
                        <p className="font-medium">
                          ID: {producto.id} - {producto.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${producto.precio} | Stock: {producto.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carrito de compras */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Carrito de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                {carrito.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">El carrito está vacío</p>
                ) : (
                  <div className="space-y-4">
                    {carrito.map((item) => (
                      <div key={item.producto.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.producto.nombre}</h4>
                          <p className="text-sm text-muted-foreground">${item.producto.precio} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.cantidad}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => eliminarDelCarrito(item.producto.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium">${item.subtotal}</p>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>${calcularTotal()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {message && (
              <Alert
                className={message.includes("Error") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
              >
                <AlertDescription className={message.includes("Error") ? "text-red-800" : "text-green-800"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={procesarVenta}
              disabled={carrito.length === 0 || processingVenta}
              className="w-full"
              size="lg"
            >
              {processingVenta ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando Venta...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Procesar Venta (${calcularTotal()})
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
