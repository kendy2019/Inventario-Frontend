"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Archive, Search, Plus } from "lucide-react"

export default function GuiaSalidaPage() {
  const [formData, setFormData] = useState({
    codigoSalida: "",
    productoId: "",
    cantidad: "",
    destino: "",
    motivo: "",
    observaciones: "",
    fechaSalida: new Date().toISOString().split("T")[0],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Aquí harías la petición a tu API de Spring Boot
      const response = await fetch("http://localhost:8080/api/guia-salida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Guía de salida registrada exitosamente" })
        setFormData({
          codigoSalida: "",
          productoId: "",
          cantidad: "",
          destino: "",
          motivo: "",
          observaciones: "",
          fechaSalida: new Date().toISOString().split("T")[0],
        })
      } else {
        setMessage({ type: "error", text: "Error al registrar la guía de salida" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión con el servidor" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Archive className="w-8 h-8" />
            Guía de Salida
          </h1>
          <p className="text-muted-foreground">Registrar salida de productos del inventario</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario de Guía de Salida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Registrar Salida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="codigoSalida">Código de Salida</Label>
                    <Input
                      id="codigoSalida"
                      value={formData.codigoSalida}
                      onChange={handleInputChange("codigoSalida")}
                      placeholder="Ej: SAL-001"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productoId">ID del Producto</Label>
                    <Input
                      id="productoId"
                      value={formData.productoId}
                      onChange={handleInputChange("productoId")}
                      placeholder="Ej: PROD-123"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      value={formData.cantidad}
                      onChange={handleInputChange("cantidad")}
                      placeholder="Ej: 10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaSalida">Fecha de Salida</Label>
                    <Input
                      id="fechaSalida"
                      type="date"
                      value={formData.fechaSalida}
                      onChange={handleInputChange("fechaSalida")}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destino">Destino</Label>
                  <Input
                    id="destino"
                    value={formData.destino}
                    onChange={handleInputChange("destino")}
                    placeholder="Ej: Sucursal Centro, Cliente ABC"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de Salida</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={handleInputChange("motivo")}
                    placeholder="Ej: Venta, Transferencia, Devolución"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange("observaciones")}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Registrar Salida"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historial de Salidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Historial de Salidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">SAL-001</p>
                      <p className="text-sm text-muted-foreground">PROD-123 - 5 unidades</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completado</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Destino: Sucursal Centro</p>
                  <p className="text-xs text-muted-foreground">Fecha: 2024-01-15</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">SAL-002</p>
                      <p className="text-sm text-muted-foreground">PROD-456 - 3 unidades</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">En proceso</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Destino: Cliente ABC</p>
                  <p className="text-xs text-muted-foreground">Fecha: 2024-01-14</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
