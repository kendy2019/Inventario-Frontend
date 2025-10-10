"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { isAuthenticated, getUserData } from "@/lib/auth"
import { ShoppingCart, Plus, Minus, Trash2, Search, Save, User, Phone, Package } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
  categoria?: string
}

interface ItemVenta {
  producto: Producto
  cantidad: number
  subtotal: number
}

interface Cotizacion {
  clienteNombre: string
  clienteTelefono: string
  marcaCelular: string
  detalleCelular: string
  observaciones: string
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
  const [activeTab, setActiveTab] = useState("cotizacion")

  const [cotizacion, setCotizacion] = useState<Cotizacion>({
    clienteNombre: "",
    clienteTelefono: "",
    marcaCelular: "",
    detalleCelular: "",
    observaciones: "",
  })

  const { username } = getUserData()

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
      { id: 1, nombre: "iPhone 14 Pro", precio: 999, stock: 10, categoria: "Smartphones" },
      { id: 2, nombre: "Samsung Galaxy S23", precio: 899, stock: 15, categoria: "Smartphones" },
      { id: 3, nombre: "MacBook Pro M2", precio: 1999, stock: 5, categoria: "Laptops" },
      { id: 4, nombre: "iPad Air", precio: 599, stock: 8, categoria: "Tablets" },
      { id: 5, nombre: "AirPods Pro", precio: 249, stock: 20, categoria: "Accesorios" },
      { id: 6, nombre: "Apple Watch Series 8", precio: 399, stock: 12, categoria: "Wearables" },
    ]
    setProductos(mockProductos)
  }

  const handleCotizacionChange = (field: keyof Cotizacion, value: string) => {
    setCotizacion((prev) => ({
      ...prev,
      [field]: value,
    }))
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

    if (!cotizacion.clienteNombre.trim()) {
      setMessage("Por favor, completa la información del cliente")
      setActiveTab("cotizacion")
      return
    }

    setProcessingVenta(true)
    setMessage("")

    try {
      const ventaData = {
        cotizacion,
        items: carrito.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precio: item.producto.precio,
        })),
        total: calcularTotal(),
        fecha: new Date().toISOString(),
        registradoPor: username,
      }

      console.log("[v0] Datos de venta:", ventaData)

      // Aquí iría la llamada a tu API
      // const response = await fetch('http://localhost:8080/api/ventas', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(ventaData)
      // })

      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMessage("Venta procesada exitosamente")
      setCarrito([])
      setCotizacion({
        clienteNombre: "",
        clienteTelefono: "",
        marcaCelular: "",
        detalleCelular: "",
        observaciones: "",
      })

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
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            Cotización y Venta
          </h1>
          <p className="text-muted-foreground mt-2">Gestiona cotizaciones y procesa ventas de productos</p>
        </div>

        {message && (
          <Alert
            className={`animate-in fade-in-50 ${message.includes("Error") || message.includes("insuficiente") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            <AlertDescription
              className={
                message.includes("Error") || message.includes("insuficiente") ? "text-red-800" : "text-green-800"
              }
            >
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cotizacion">
              <User className="w-4 h-4 mr-2" />
              Cotización
            </TabsTrigger>
            <TabsTrigger value="productos">
              <Package className="w-4 h-4 mr-2" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="carrito">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrito ({carrito.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cotizacion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>Registra los datos del cliente y detalles de la cotización</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clienteNombre">Nombre del Cliente *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="clienteNombre"
                        value={cotizacion.clienteNombre}
                        onChange={(e) => handleCotizacionChange("clienteNombre", e.target.value)}
                        placeholder="Nombre completo"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="clienteTelefono">Teléfono del Cliente</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="clienteTelefono"
                        value={cotizacion.clienteTelefono}
                        onChange={(e) => handleCotizacionChange("clienteTelefono", e.target.value)}
                        placeholder="+51 999 999 999"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marcaCelular">Marca del Celular</Label>
                    <Input
                      id="marcaCelular"
                      value={cotizacion.marcaCelular}
                      onChange={(e) => handleCotizacionChange("marcaCelular", e.target.value)}
                      placeholder="ej: iPhone, Samsung, Xiaomi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="detalleCelular">Modelo del Celular</Label>
                    <Input
                      id="detalleCelular"
                      value={cotizacion.detalleCelular}
                      onChange={(e) => handleCotizacionChange("detalleCelular", e.target.value)}
                      placeholder="ej: iPhone 14 Pro 128GB"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={cotizacion.observaciones}
                    onChange={(e) => handleCotizacionChange("observaciones", e.target.value)}
                    placeholder="Notas adicionales sobre la cotización o venta"
                    rows={3}
                  />
                </div>

                <Button onClick={() => setActiveTab("productos")} className="w-full">
                  Continuar a Productos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Productos */}
          <TabsContent value="productos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Productos</CardTitle>
                <CardDescription>Selecciona productos para agregar al carrito</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Productos Disponibles</CardTitle>
                <div className="relative mt-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProductos.map((producto) => (
                    <Card
                      key={producto.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setProductoId(producto.id.toString())}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-lg">{producto.nombre}</p>
                            <Badge variant="outline" className="mt-1">
                              {producto.categoria}
                            </Badge>
                          </div>
                          <Badge variant={producto.stock > 10 ? "default" : "destructive"}>ID: {producto.id}</Badge>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-2xl font-bold text-primary">${producto.precio}</p>
                          <p className="text-sm text-muted-foreground">Stock: {producto.stock}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Carrito */}
          <TabsContent value="carrito" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Carrito de Compras</CardTitle>
                <CardDescription>Revisa y confirma los productos seleccionados</CardDescription>
              </CardHeader>
              <CardContent>
                {carrito.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">El carrito está vacío</p>
                    <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setActiveTab("productos")}>
                      Agregar Productos
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carrito.map((item) => (
                      <Card key={item.producto.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg">{item.producto.nombre}</h4>
                              <p className="text-sm text-muted-foreground">${item.producto.precio} c/u</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-bold text-lg">{item.cantidad}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => eliminarDelCarrito(item.producto.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-right ml-6">
                              <p className="font-bold text-xl text-primary">${item.subtotal}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Card className="border-2 border-primary bg-primary/5">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">Total:</span>
                          <span className="text-3xl font-bold text-primary">${calcularTotal()}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={procesarVenta}
                      disabled={carrito.length === 0 || processingVenta}
                      className="w-full h-12 text-lg"
                      size="lg"
                    >
                      {processingVenta ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Procesando Venta...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Procesar Venta (${calcularTotal()})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
