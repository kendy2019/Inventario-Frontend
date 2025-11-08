"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Package, TrendingUp, Users, AlertTriangle, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Producto {
  id: number
  nombre: string
  stock: number
  precio: number
}

interface Cliente {
  id: number
  nombre: string
}

export default function DashboardPage() {
  const [totalProductos, setTotalProductos] = useState(0)
  const [totalClientes, setTotalClientes] = useState(0)
  const [totalVentasMes, setTotalVentasMes] = useState(0)
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }

        // --- Productos ---
        const productosRes = await fetch("http://localhost:8080/api/productos", { headers })
        const productosData: Producto[] = await productosRes.json()
        setProductos(productosData)
        setTotalProductos(productosData.length)

        // --- Clientes ---
        const clientesRes = await fetch("http://localhost:8080/api/clientes", { headers })
        const clientesData: Cliente[] = await clientesRes.json()
        setTotalClientes(clientesData.length)

        // --- Ventas del mes ---
        const ventasRes = await fetch("http://localhost:8080/api/ventas/total-mes", { headers })
        const ventasData = await ventasRes.json()
        setTotalVentasMes(ventasData.totalMes || 0)

      } catch (error) {
        console.error(error)
        setMessage("Error al cargar datos del dashboard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const productosBajoStock = productos.filter((p) => p.stock < 5)

  if (loading) return <div className="p-6 text-center">Cargando dashboard...</div>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema</p>
        </div>

        {message && (
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Estadísticas principales */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProductos}</div>
              <p className="text-xs text-muted-foreground">
                {productosBajoStock.length} con bajo stock
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                S/ {totalVentasMes.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Registrados</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClientes}</div>
              <p className="text-xs text-muted-foreground">Activos en el sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Productos recientes y bajo stock */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos con Bajo Stock</CardTitle>
            </CardHeader>
            <CardContent>
              {productosBajoStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todos los productos tienen stock suficiente 🎉</p>
              ) : (
                <div className="space-y-2">
                  {productosBajoStock.map((p) => (
                    <div key={p.id} className="flex justify-between items-center border rounded p-2 bg-red-50">
                      <span className="font-medium text-red-700">{p.nombre}</span>
                      <span className="text-sm text-red-600">Stock: {p.stock}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {productos.map((p) => (
                  <div key={p.id} className="flex justify-between border rounded p-2 hover:bg-gray-50">
                    <span>{p.nombre}</span>
                    <span className="font-semibold">S/ {p.precio.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actividad reciente 
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm">Nueva venta registrada hace 2 horas</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">Producto agregado recientemente</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">Cliente nuevo registrado hoy</p>
            </div>
          </CardContent>
        </Card>
*/}
        {/* Accesos rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4 text-green-600" />
            
              <Link href="/ventas" className="text-blue-600 hover:underline">Ir a la sección de Ventas</Link>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-blue-600" />
              <Link href="/productos" className="text-blue-600 hover:underline">Ir a la sección de Inventario</Link>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-purple-600" />
              <Link href="/clientes" className="text-blue-600 hover:underline">Gestionar clientes</Link>
            </div>
      
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
