"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Shield } from "lucide-react"
// --- INTERFACES ---
interface Usuario {
    id: number
    username: string
    email: string | null
    rol: string
    estado?: "activo" | "inactivo"
}

// --- HELPERS DE AUTENTICACIÓN Y ROL ---
const isAuthenticated = (): boolean => {
    try {
        return localStorage.getItem("authToken") !== null;
    } catch (e) {
        return false;
    }
};

const getUserRole = (): string | null => {
    try {
        return localStorage.getItem("userRole");
    } catch (e) {
        return null;
    }
}

// --- COMPONENTE PROTECTEDROUTE (Lógica real implementada) ---
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: string[] }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userRole = getUserRole();
        if (userRole && requiredRole.includes(userRole)) {
            setIsAuthorized(true);
        }
        setLoading(false);
    }, [requiredRole]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <p>Verificando permisos...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 border rounded-lg shadow-lg bg-white">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
                    <p className="text-gray-700">No tienes los permisos necesarios para ver esta página.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};



export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    
    const initialFormData = { username: "", email: "", password: "", rol: "EMPLOYEE" };
    const [formData, setFormData] = useState(initialFormData);

    const API_AUTH_URL = "http://localhost:8080/api/auth";
    const API_USERS_URL = "http://localhost:8080/api/users";

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(API_USERS_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("No se pudieron cargar los usuarios.");
            const data = await response.json();
            setUsuarios(data);
        } catch (err) {
            setError("Error al cargar usuarios. Asegúrate de tener permisos de Administrador.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // La autorización se maneja en ProtectedRoute
        // Este efecto carga los datos si el usuario está autenticado
        if (isAuthenticated()) {
            fetchUsers();
        }
    }, [fetchUsers]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRoleChange = (value: string) => {
        setFormData(prev => ({ ...prev, rol: value }));
    };

    const handleOpenDialog = (usuario: Usuario | null = null) => {
        if (usuario) {
            setEditingUser(usuario);
            setFormData({
                username: usuario.username,
                email: usuario.email || "",
                password: "", // La contraseña no se edita, se deja en blanco
                rol: usuario.rol
            });
        } else {
            setEditingUser(null);
            setFormData(initialFormData);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isEditing = !!editingUser;
        const url = isEditing ? `${API_USERS_URL}/${editingUser!.id}` : `${API_AUTH_URL}/register`;
        const method = isEditing ? "PUT" : "POST";

        const body: any = { ...formData };
        if (isEditing) {
            delete body.username; // No se puede cambiar el username
            if (!body.password.trim()) {
                delete body.password;
            }
        }

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error al guardar el usuario.");
            }

            setIsDialogOpen(false);
            fetchUsers(); // Recargar la lista de usuarios
        } catch (err) {
            setError((err as Error).message);
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_USERS_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al eliminar el usuario.");
            
            fetchUsers(); // Recargar la lista
        } catch (err) {
            setError("No se pudo eliminar el usuario.");
            console.error(err);
        }
    };

    const getRoleBadge = (rol: string) => {
        const variants: { [key: string]: "default" | "secondary" } = {
            ADMIN: "default",
            EMPLOYEE: "secondary",
        };
        return variants[rol] || "secondary";
    };

    return (
        <ProtectedRoute requiredRole={["ADMIN"]}>
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                            <p className="text-muted-foreground">Administra los usuarios del sistema</p>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => handleOpenDialog()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Usuario
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="username">Usuario</Label>
                                        <Input id="username" value={formData.username} onChange={handleInputChange} required disabled={!!editingUser} />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">{editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}</Label>
                                        <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required={!editingUser} />
                                    </div>
                                    <div>
                                        <Label htmlFor="rol">Rol</Label>
                                        <Select value={formData.rol} onValueChange={handleRoleChange}>
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
                                        {editingUser ? "Guardar Cambios" : "Crear Usuario"}
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
                            {(loading && usuarios.length === 0) ? (
                                <div className="text-center p-8">Cargando usuarios...</div>
                            ) : error ? (
                                <div className="text-center p-8 text-red-600">{error}</div>
                            ) : (
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
                                                    <Badge variant={getRoleBadge(usuario.rol)}>{usuario.rol}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={usuario.estado === "activo" ? "default" : "secondary"}>{usuario.estado}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(usuario)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(usuario.id)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
