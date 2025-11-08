"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- INTERFACES ---
interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
}

interface Cliente {
  id: number
  nombre: string
  telefono: string
  tipoCliente: string
  marcaCelular?: string
  detalleCelular?: string
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
  tipoCliente: string
}

// --- CONFIGURACIÓN DE DESCUENTOS ---
const DESCUENTOS: Record<string, number> = {
  FINAL: 0,
  TECNICO: 5,
  MAYORISTA: 15,
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

const isAuthenticated = (): boolean => localStorage.getItem("authToken") !== null
const getUserData = () => ({ username: localStorage.getItem("username") })

// --- COMPONENTE PRINCIPAL ---
export default function VentasPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [productSearchResults, setProductSearchResults] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<ItemVenta[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [message, setMessage] = useState("")
  const [processingVenta, setProcessingVenta] = useState(false)
  const [activeTab, setActiveTab] = useState("cliente")
  const { username } = getUserData()

  const [cotizacion, setCotizacion] = useState<Cotizacion>({
    clienteNombre: "",
    clienteTelefono: "",
    marcaCelular: "",
    detalleCelular: "",
    observaciones: "",
    tipoCliente: "FINAL",
  })

  const debouncedProductSearchTerm = useDebounce(productSearchTerm, 300)
  const debouncedClienteNombre = useDebounce(cotizacion.clienteNombre, 500)

  // --- AUTENTICACIÓN ---
  useEffect(() => {
    setIsAuth(isAuthenticated())
    setLoading(false)
  }, [])

  // --- BÚSQUEDA DE PRODUCTOS ---
  const searchProducts = useCallback(async (term: string) => {
    if (term.length < 2) return setProductSearchResults([])
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`http://localhost:8080/api/productos/buscar?nombre=${term}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Error al buscar productos")
      setProductSearchResults(await res.json())
    } catch {
      setMessage("Error al buscar productos.")
    }
  }, [])

  useEffect(() => {
    if (isAuth && debouncedProductSearchTerm) searchProducts(debouncedProductSearchTerm)
  }, [debouncedProductSearchTerm, isAuth, searchProducts])

  // --- AUTOCOMPLETAR CLIENTE ---
  useEffect(() => {
    const fetchCliente = async () => {
      if (debouncedClienteNombre.length < 2) return
      try {
        const token = localStorage.getItem("authToken")
        const res = await fetch(`http://localhost:8080/api/clientes/buscar?nombre=${debouncedClienteNombre}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Error al buscar cliente")

        const clientes: Cliente[] = await res.json()
        const cliente = clientes.find(
          (c) => c.nombre.toLowerCase() === debouncedClienteNombre.toLowerCase()
        )

        if (cliente) {
          // Si existe, autocompletar datos
          setCotizacion((prev) => ({
            ...prev,
            clienteTelefono: cliente.telefono || "",
            marcaCelular: cliente.marcaCelular || "",
            detalleCelular: cliente.detalleCelular || "",
            tipoCliente: cliente.tipoCliente || "FINAL",
          }))
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (isAuth) fetchCliente()
  }, [debouncedClienteNombre, isAuth])

  // --- FUNCIONES ---
  const handleCotizacionChange = (field: keyof Cotizacion, value: string) =>
    setCotizacion((prev) => ({ ...prev, [field]: value }))

  const aplicarDescuento = (precio: number): number => {
    const descuento = DESCUENTOS[cotizacion.tipoCliente] || 0
    return precio * (1 - descuento / 100)
  }

  const agregarAlCarrito = (producto: Producto, cantidad: number) => {
    if (cantidad <= 0) return
    const precioConDescuento = aplicarDescuento(producto.precio)
    const existe = carrito.find((i) => i.producto.id === producto.id)
    if (existe) {
      const nuevaCantidad = existe.cantidad + cantidad
      setCarrito(
        carrito.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * precioConDescuento }
            : i
        )
      )
    } else {
      setCarrito([...carrito, { producto, cantidad, subtotal: cantidad * precioConDescuento }])
    }
  }

  const eliminarDelCarrito = (id: number) => setCarrito(carrito.filter((i) => i.producto.id !== id))
  const calcularTotal = () => carrito.reduce((t, i) => t + i.subtotal, 0).toFixed(2)

  // --- REGISTRO AUTOMÁTICO CLIENTE ---
  const registrarClienteSiNoExiste = async (): Promise<Cliente | null> => {
    try {
      const token = localStorage.getItem("authToken")
      const nombre = cotizacion.clienteNombre.trim()

      const buscarRes = await fetch(`http://localhost:8080/api/clientes/buscar?nombre=${nombre}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const clientes: Cliente[] = await buscarRes.json()
      const clienteExistente = clientes.find(
        (c) => c.nombre.toLowerCase() === nombre.toLowerCase()
      )

      if (clienteExistente) return clienteExistente

      const crearRes = await fetch("http://localhost:8080/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          telefono: cotizacion.clienteTelefono,
          tipoCliente: cotizacion.tipoCliente,
          marcaCelular: cotizacion.marcaCelular,
          detalleCelular: cotizacion.detalleCelular,
        }),
      })

      if (!crearRes.ok) throw new Error("Error al registrar nuevo cliente")
      return await crearRes.json()
    } catch {
      setMessage("Error al registrar cliente.")
      return null
    }
  }

  // --- PROCESAR VENTA ---
  const procesarVenta = async () => {
    if (carrito.length === 0) return setMessage("El carrito está vacío.")
    if (!cotizacion.clienteNombre.trim()) return setMessage("Completa los datos del cliente.")

    setProcessingVenta(true)
    setMessage("")

    try {
      const cliente = await registrarClienteSiNoExiste()
      if (!cliente) throw new Error("Error con cliente")

      const ventaData = {
        clienteId: cliente.id,
        items: carrito.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
          precio: aplicarDescuento(i.producto.precio),
        })),
        total: parseFloat(calcularTotal()),
        fecha: new Date().toISOString(),
        registradoPor: username,
      }

      const token = localStorage.getItem("authToken")
      const res = await fetch("http://localhost:8080/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ventaData),
      })

      if (!res.ok) throw new Error("Error al registrar venta")
      setMessage("✅ Venta procesada y cliente guardado correctamente.")
      setCarrito([])
      setCotizacion({
        clienteNombre: "",
        clienteTelefono: "",
        marcaCelular: "",
        detalleCelular: "",
        observaciones: "",
        tipoCliente: "FINAL",
      })
    } catch {
      setMessage("Error al procesar la venta.")
    } finally {
      setProcessingVenta(false)
    }
  }

  // --- UI ---
  if (loading) return <div>Cargando...</div>
  if (!isAuth) return <div>No autorizado</div>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" /> Cotización y Venta
        </h1>

        {message && (
          <Alert className={`border ${message.includes("Error") ? "border-red-300" : "border-green-300"}`}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="cliente">Cliente</TabsTrigger>
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="carrito">Carrito ({carrito.length})</TabsTrigger>
          </TabsList>

          {/* TAB CLIENTE */}
          <TabsContent value="cliente">
            <Card>
              <CardHeader>
                <CardTitle>Datos del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label>Nombre *</Label>
                <Input
                  value={cotizacion.clienteNombre}
                  onChange={(e) => handleCotizacionChange("clienteNombre", e.target.value)}
                  placeholder="Escribe y se autocompletará si ya existe"
                />
                <Label>Teléfono</Label>
                <Input
                  value={cotizacion.clienteTelefono}
                  onChange={(e) => handleCotizacionChange("clienteTelefono", e.target.value)}
                />
                <Label>Tipo de Cliente</Label>
                <Select
                  value={cotizacion.tipoCliente}
                  onValueChange={(v) => handleCotizacionChange("tipoCliente", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="TECNICO">Técnico ({DESCUENTOS.TECNICO}% desc.)</SelectItem>
                    <SelectItem value="MAYORISTA">Mayorista ({DESCUENTOS.MAYORISTA}% desc.)</SelectItem>
                  </SelectContent>
                </Select>
                <Label>Marca Celular</Label>
                <Input
                  value={cotizacion.marcaCelular}
                  onChange={(e) => handleCotizacionChange("marcaCelular", e.target.value)}
                />
                <Label>Modelo / Detalle Celular</Label>
                <Input
                  value={cotizacion.detalleCelular}
                  onChange={(e) => handleCotizacionChange("detalleCelular", e.target.value)}
                />
                <Label>Observaciones</Label>
                <Textarea
                  value={cotizacion.observaciones}
                  onChange={(e) => handleCotizacionChange("observaciones", e.target.value)}
                />
                <Button onClick={() => setActiveTab("productos")}>Continuar</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB PRODUCTOS */}
          <TabsContent value="productos">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Productos</CardTitle>
                <Input
                  placeholder="Buscar producto..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {productSearchResults.map((p) => {
                  const precioDescuento = aplicarDescuento(p.precio)
                  const descuentoLabel =
                    DESCUENTOS[cotizacion.tipoCliente] > 0
                      ? `(${DESCUENTOS[cotizacion.tipoCliente]}% desc.)`
                      : ""
                  return (
                    <Card key={p.id} className="p-3">
                      <div className="font-bold">{p.nombre}</div>
                      <div>
                        S/ {precioDescuento.toFixed(2)}{" "}
                        <span className="text-sm text-gray-500">{descuentoLabel}</span>
                      </div>
                      <div>Stock: {p.stock}</div>
                      <Button className="mt-2 w-full" onClick={() => agregarAlCarrito(p, 1)}>
                        Agregar
                      </Button>
                    </Card>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB CARRITO */}
          <TabsContent value="carrito">
            <Card>
              <CardHeader>
                <CardTitle>Carrito</CardTitle>
              </CardHeader>
              <CardContent>
                {carrito.length === 0 ? (
                  <p>No hay productos en el carrito.</p>
                ) : (
                  <div className="space-y-3">
                    {carrito.map((item) => (
                      <div key={item.producto.id} className="flex justify-between items-center border p-2 rounded">
                        <div>
                          <strong>{item.producto.nombre}</strong> × {item.cantidad} —{" "}
                          <span className="font-semibold">S/ {item.subtotal.toFixed(2)}</span>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => eliminarDelCarrito(item.producto.id)}>
                          Eliminar
                        </Button>
                      </div>
                    ))}
                    <div className="text-right font-bold text-lg">
                      Total: S/ {calcularTotal()}
                    </div>
                    <Button
                      onClick={procesarVenta}
                      disabled={processingVenta}
                      className="w-full h-12 text-lg"
                    >
                      {processingVenta ? "Procesando..." : `Procesar Venta (S/ ${calcularTotal()})`}
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
