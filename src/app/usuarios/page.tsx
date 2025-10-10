"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Shield } from "lucide-react"

interface Usuario {
  id: number
  username: string
  email: string
  rol: string
  estado: "activo" | "inactivo"
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      username: "admin1",
      email: "admin@empresa.com",
      rol: "ADMIN",
      estado: "activo",
    },
    {
      id: 2,
      username: "empleado1",
      email: "empleado@empresa.com",
      rol: "EMPLOYEE",
      estado: "activo",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    rol: "EMPLOYEE",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nuevoUsuario: Usuario = {
      id: usuarios.length + 1,
      username: formData.username,
      email: formData.email,
      rol: formData.rol,
      estado: "activo",
    }
    setUsuarios([...usuarios, nuevoUsuario])
    setFormData({ username: "", email: "", password: "", rol: "EMPLOYEE" })
    setIsDialogOpen(false)
  }

  const getRoleBadge = (rol: string) => {
    const variants = {
      ADMIN: "default",
      EMPLOYEE: "secondary",
    }
    return variants[rol as keyof typeof variants] || "secondary"
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
              <p className="text-muted-foreground">Administra los usuarios del sistema</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rol">Rol</Label>
                    <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Crear Usuario
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          {usuario.username}
                        </div>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadge(usuario.rol) as any}>{usuario.rol}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.estado === "activo" ? "default" : "secondary"}>{usuario.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
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
