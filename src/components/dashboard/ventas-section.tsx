"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Plus, Minus, Trash2, Search, Save, Calculator } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
  categoria: string
}

interface ItemVenta {
  productoId: number
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

interface Venta {
  id: string
  fecha: string
  items: ItemVenta[]
  total: number
  estado: "pendiente" | "completada" | "cancelada"
  vendedor: string
}

export default function VentasSection() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [itemsVenta, setItemsVenta] = useState<ItemVenta[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)

  // Simular productos disponibles
  useEffect(() => {
    const mockProducts: Producto[] = [
      { id: 1, nombre: "iPhone 14", precio: 999, stock: 10, categoria: "Celulares" },
      { id: 2, nombre: "Samsung Galaxy S23", precio: 899, stock: 15, categoria: "Celulares" },
      { id: 3, nombre: "Funda iPhone", precio: 25, stock: 50, categoria: "Accesorios" },
      { id: 4, nombre: "Cargador USB-C", precio: 35, stock: 30, categoria: "Accesorios" },
      { id: 5, nombre: "AirPods Pro", precio: 249, stock: 8, categoria: "Auriculares" },
    ]
    setProductos(mockProducts)
  }, [])

  const filteredProducts = productos.filter(
    (producto) => producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && producto.stock > 0,
  )

  const agregarProducto = (producto: Producto, cantidad = 1) => {
    if (cantidad > producto.stock) {
      setError(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`)
      return
    }

    const itemExistente = itemsVenta.find((item) => item.productoId === producto.id)

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad
      if (nuevaCantidad > producto.stock) {
        setError(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`)
        return
      }

      setItemsVenta((prev) =>
        prev.map((item) =>
          item.productoId === producto.id
            ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio }
            : item,
        ),
      )
    } else {
      const nuevoItem: ItemVenta = {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad,
        subtotal: producto.precio * cantidad,
      }
      setItemsVenta((prev) => [...prev, nuevoItem])
    }

    setError("")
    setIsProductDialogOpen(false)
  }

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(productoId)
      return
    }

    const producto = productos.find((p) => p.id === productoId)
    if (producto && nuevaCantidad > producto.stock) {
      setError(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`)
      return
    }

    setItemsVenta((prev) =>
      prev.map((item) =>
        item.productoId === productoId
          ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio }
          : item,
      ),
    )
    setError("")
  }

  const eliminarItem = (productoId: number) => {
    setItemsVenta((prev) => prev.filter((item) => item.productoId !== productoId))
  }

  const calcularTotal = () => {
    return itemsVenta.reduce((total, item) => total + item.subtotal, 0)
  }

  const procesarVenta = async () => {
    if (itemsVenta.length === 0) {
      setError("Agrega al menos un producto a la venta")
      return
    }

    setLoading(true)
    setError("")

    try {
      const nuevaVenta: Venta = {
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        items: itemsVenta,
        total: calcularTotal(),
        estado: "completada",
        vendedor: "Admin", // Esto vendría del usuario logueado
      }

      // Aquí harías la llamada a tu API de Spring Boot
      // const response = await fetch('/api/ventas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(nuevaVenta)
      // })

      console.log("[v0] Nueva venta procesada:", nuevaVenta)

      setSuccess(`Venta procesada exitosamente. Total: $${calcularTotal().toFixed(2)}`)

      // Limpiar carrito después de la venta
      setTimeout(() => {
        setItemsVenta([])
        setSuccess("")
      }, 3000)
    } catch (err) {
      setError("Error al procesar la venta. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const limpiarVenta = () => {
    setItemsVenta([])
    setError("")
    setSuccess("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Sistema de Ventas</h2>
          <p className="text-muted-foreground">Procesa ventas seleccionando productos por ID</p>
        </div>

        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Seleccionar Productos</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de productos */}
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-mono">{producto.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{producto.nombre}</div>
                            <div className="text-sm text-muted-foreground">{producto.categoria}</div>
                          </div>
                        </TableCell>
                        <TableCell>${producto.precio}</TableCell>
                        <TableCell>{producto.stock}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => agregarProducto(producto)} disabled={producto.stock === 0}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No se encontraron productos disponibles</div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Carrito de venta */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrito de Venta ({itemsVenta.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {itemsVenta.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay productos en el carrito</p>
                  <p className="text-sm">Agrega productos para comenzar una venta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemsVenta.map((item) => (
                        <TableRow key={item.productoId}>
                          <TableCell className="font-mono">{item.productoId}</TableCell>
                          <TableCell className="font-medium">{item.nombre}</TableCell>
                          <TableCell>${item.precio}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">{item.cantidad}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${item.subtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="destructive" onClick={() => eliminarItem(item.productoId)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de resumen */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Resumen de Venta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Productos:</span>
                  <span>{itemsVenta.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Unidades:</span>
                  <span>{itemsVenta.reduce((total, item) => total + item.cantidad, 0)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={procesarVenta} disabled={loading || itemsVenta.length === 0} className="w-full">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Procesar Venta
                </Button>

                <Button
                  variant="outline"
                  onClick={limpiarVenta}
                  disabled={itemsVenta.length === 0}
                  className="w-full bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar Carrito
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Selecciona productos por su ID</p>
                <p>• Ajusta cantidades según stock disponible</p>
                <p>• El sistema verifica automáticamente el inventario</p>
                <p>• La venta se registra al procesar</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
