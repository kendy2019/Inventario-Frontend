"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Calendar, DollarSign } from "lucide-react"

interface Compra {
  id: number
  cliente: string
  fecha: string
  productos: string
  total: number
  estado: "completado" | "pendiente" | "cancelado"
}

export default function HistorialClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [compras] = useState<Compra[]>([
    {
      id: 1,
      cliente: "Juan Pérez",
      fecha: "2024-01-15",
      productos: "iPhone 13, Funda",
      total: 3500,
      estado: "completado",
    },
    {
      id: 2,
      cliente: "María García",
      fecha: "2024-01-10",
      productos: "Samsung Galaxy S21",
      total: 2800,
      estado: "completado",
    },
  ])

  const filteredCompras = compras.filter((compra) => compra.cliente.toLowerCase().includes(searchTerm.toLowerCase()))

  const getEstadoBadge = (estado: string) => {
    const variants = {
      completado: "default",
      pendiente: "secondary",
      cancelado: "destructive",
    }
    return variants[estado as keyof typeof variants] || "secondary"
  }

  return (
    <ProtectedRoute requiredRole={["ADMIN", "EMPLOYEE"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Historial de Compras</h1>
            <p className="text-muted-foreground">Consulta el historial de compras de tus clientes</p>
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
                    <TableHead>Productos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompras.map((compra) => (
                    <TableRow key={compra.id}>
                      <TableCell className="font-medium">#{compra.id}</TableCell>
                      <TableCell>{compra.cliente}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {compra.fecha}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{compra.productos}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          S/ {compra.total.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadge(compra.estado) as any}>{compra.estado}</Badge>
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
