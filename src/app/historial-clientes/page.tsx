"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Calendar, DollarSign } from "lucide-react"

interface VentaReciente {
  id: number
  clienteNombre: string
  total: number
  fecha: string
}

export default function HistorialClientesPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [ventas, setVentas] = useState<VentaReciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVentas = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setIsAuth(false)
        setError("No autenticado. Token no encontrado.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch("http://localhost:8080/api/ventas/recientes", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Acceso denegado: tu rol no tiene permisos para ver las ventas recientes.")
          } else if (response.status === 401) {
            throw new Error("Token inválido o expirado. Inicia sesión nuevamente.")
          } else {
            throw new Error("Error al cargar las ventas recientes.")
          }
        }

        const data = await response.json()
        setVentas(data)
      } catch (err: any) {
        setError(err.message || "Error desconocido.")
      } finally {
        setLoading(false)
      }
    }

    fetchVentas()
  }, [])

  const filteredVentas = ventas.filter((venta) =>
    venta.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <p className="text-center mt-10">Cargando ventas recientes...</p>

  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>

  return (
    <ProtectedRoute requiredRole={["ADMIN", "EMPLOYEE"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Historial de Ventas Recientes</h1>
            <p className="text-muted-foreground">
              Consulta las ventas más recientes registradas en el sistema
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredVentas.length > 0 ? (
                    filteredVentas.map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell className="font-medium">#{venta.id}</TableCell>
                        <TableCell>{venta.clienteNombre}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(venta.fecha).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            S/ {venta.total.toFixed(2)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No se encontraron ventas recientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
