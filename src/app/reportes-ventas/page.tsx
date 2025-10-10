"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react"

export default function ReportesVentasPage() {
  const stats = [
    {
      title: "Ventas Totales",
      value: "S/ 45,231.89",
      change: "+20.1%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Órdenes",
      value: "234",
      change: "+12.5%",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Clientes Activos",
      value: "89",
      change: "+8.2%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Ticket Promedio",
      value: "S/ 193.29",
      change: "+5.4%",
      icon: TrendingUp,
      trend: "up",
    },
  ]

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Reportes de Ventas</h1>
            <p className="text-muted-foreground">Análisis y estadísticas de ventas</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <Badge variant="secondary" className="mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change} desde el mes pasado
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ventas por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Gráfico de ventas (integrar con librería de gráficos)
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
